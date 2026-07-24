import { useEffect, useState } from 'react';
import { supplierService } from '../services/supplierService';
import { extractErrorMessage } from '../services/api';
import { PageHeader, Spinner, EmptyState, ErrorBanner } from '../components/Ui';
import Modal from '../components/Modal';
import ConfirmDialog from '../components/ConfirmDialog';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../context/ToastContext';
import { ROLES } from '../utils/roles';

const EMPTY_FORM = { supplierName: '', phone: '', email: '', address: '' };

export default function SuppliersPage() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const isAdmin = user?.role === ROLES.ADMIN;

  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  async function load() {
    setLoading(true);
    setError('');
    try {
      setSuppliers(await supplierService.getAll());
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

  function openEdit(supplier) {
    setForm({
      supplierName: supplier.supplierName,
      phone: supplier.phone || '',
      email: supplier.email || '',
      address: supplier.address || '',
    });
    setFormError('');
    setEditing(supplier);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setFormError('');
    setSaving(true);
    try {
      if (editing?.supplierId) {
        await supplierService.update(editing.supplierId, form);
        showToast('Supplier updated.');
      } else {
        await supplierService.create(form);
        showToast('Supplier added.');
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
      await supplierService.remove(deleteTarget.supplierId);
      showToast('Supplier deleted.');
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
        title="Suppliers"
        subtitle="Companies you buy medicines from."
        action={
          isAdmin && (
            <button type="button" className="btn btn--primary" onClick={openCreate}>
              + Add supplier
            </button>
          )
        }
      />

      <ErrorBanner message={error} />

      {loading ? (
        <Spinner />
      ) : suppliers.length === 0 ? (
        <EmptyState title="No suppliers yet" message="Add a supplier before creating medicines." />
      ) : (
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Phone</th>
                <th>Email</th>
                <th>Address</th>
                {isAdmin && <th className="table__actions-col">Actions</th>}
              </tr>
            </thead>
            <tbody>
              {suppliers.map((s) => (
                <tr key={s.supplierId}>
                  <td>{s.supplierName}</td>
                  <td className="muted">{s.phone || '\u2014'}</td>
                  <td className="muted">{s.email || '\u2014'}</td>
                  <td className="muted">{s.address || '\u2014'}</td>
                  {isAdmin && (
                    <td className="table__actions">
                      <button type="button" className="btn btn--ghost btn--small" onClick={() => openEdit(s)}>
                        Edit
                      </button>
                      <button
                        type="button"
                        className="btn btn--ghost btn--small btn--danger-text"
                        onClick={() => setDeleteTarget(s)}
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
        <Modal title={editing.supplierId ? 'Edit supplier' : 'Add supplier'} onClose={() => setEditing(null)}>
          <ErrorBanner message={formError} />
          <form onSubmit={handleSubmit} className="form">
            <label className="form__field">
              <span>Supplier name</span>
              <input
                value={form.supplierName}
                onChange={(e) => setForm((f) => ({ ...f, supplierName: e.target.value }))}
                required
              />
            </label>
            <label className="form__field">
              <span>Phone</span>
              <input value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} />
            </label>
            <label className="form__field">
              <span>Email</span>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
              />
            </label>
            <label className="form__field">
              <span>Address</span>
              <input value={form.address} onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))} />
            </label>
            <div className="form__actions">
              <button type="button" className="btn btn--ghost" onClick={() => setEditing(null)}>
                Cancel
              </button>
              <button type="submit" className="btn btn--primary" disabled={saving}>
                {saving ? 'Saving\u2026' : 'Save supplier'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {deleteTarget && (
        <ConfirmDialog
          message={`Delete "${deleteTarget.supplierName}"? This cannot be undone.`}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
}
