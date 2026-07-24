import { useEffect, useState } from 'react';
import { categoryService } from '../services/categoryService';
import { extractErrorMessage } from '../services/api';
import { PageHeader, Spinner, EmptyState, ErrorBanner } from '../components/Ui';
import Modal from '../components/Modal';
import ConfirmDialog from '../components/ConfirmDialog';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../context/ToastContext';
import { ROLES } from '../utils/roles';

const EMPTY_FORM = { categoryName: '', description: '' };

export default function CategoriesPage() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const isAdmin = user?.role === ROLES.ADMIN;

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [editing, setEditing] = useState(null); // null = closed, {} = new, {...} = edit
  const [form, setForm] = useState(EMPTY_FORM);
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  async function load() {
    setLoading(true);
    setError('');
    try {
      const data = await categoryService.getAll();
      setCategories(data);
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  function openCreate() {
    setForm(EMPTY_FORM);
    setFormError('');
    setEditing({});
  }

  function openEdit(category) {
    setForm({ categoryName: category.categoryName, description: category.description || '' });
    setFormError('');
    setEditing(category);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setFormError('');
    setSaving(true);
    try {
      if (editing?.categoryId) {
        await categoryService.update(editing.categoryId, form);
        showToast('Category updated.');
      } else {
        await categoryService.create(form);
        showToast('Category created.');
      }
      setEditing(null);
      load();
    } catch (err) {
      setFormError(extractErrorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    try {
      await categoryService.remove(deleteTarget.categoryId);
      showToast('Category deleted.');
      setDeleteTarget(null);
      load();
    } catch (err) {
      showToast(extractErrorMessage(err), 'error');
      setDeleteTarget(null);
    }
  }

  return (
    <div className="page">
      <PageHeader
        title="Categories"
        subtitle="Group medicines so they're easy to browse and report on."
        action={
          isAdmin && (
            <button type="button" className="btn btn--primary" onClick={openCreate}>
              + Add category
            </button>
          )
        }
      />

      <ErrorBanner message={error} />

      {loading ? (
        <Spinner />
      ) : categories.length === 0 ? (
        <EmptyState title="No categories yet" message="Create your first category to start organizing medicines." />
      ) : (
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Description</th>
                {isAdmin && <th className="table__actions-col">Actions</th>}
              </tr>
            </thead>
            <tbody>
              {categories.map((c) => (
                <tr key={c.categoryId}>
                  <td>{c.categoryName}</td>
                  <td className="muted">{c.description || '\u2014'}</td>
                  {isAdmin && (
                    <td className="table__actions">
                      <button type="button" className="btn btn--ghost btn--small" onClick={() => openEdit(c)}>
                        Edit
                      </button>
                      <button
                        type="button"
                        className="btn btn--ghost btn--small btn--danger-text"
                        onClick={() => setDeleteTarget(c)}
                      >
                        Delete
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {editing !== null && (
        <Modal title={editing.categoryId ? 'Edit category' : 'Add category'} onClose={() => setEditing(null)}>
          <ErrorBanner message={formError} />
          <form onSubmit={handleSubmit} className="form">
            <label className="form__field">
              <span>Category name</span>
              <input
                value={form.categoryName}
                onChange={(e) => setForm((f) => ({ ...f, categoryName: e.target.value }))}
                required
              />
            </label>
            <label className="form__field">
              <span>Description</span>
              <textarea
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                rows={3}
              />
            </label>
            <div className="form__actions">
              <button type="button" className="btn btn--ghost" onClick={() => setEditing(null)}>
                Cancel
              </button>
              <button type="submit" className="btn btn--primary" disabled={saving}>
                {saving ? 'Saving\u2026' : 'Save category'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {deleteTarget && (
        <ConfirmDialog
          message={`Delete "${deleteTarget.categoryName}"? This cannot be undone.`}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
}
