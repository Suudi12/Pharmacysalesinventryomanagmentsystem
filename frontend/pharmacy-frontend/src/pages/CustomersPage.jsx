import { useEffect, useState } from 'react';
import { customerService } from '../services/customerService';
import { extractErrorMessage } from '../services/api';
import { PageHeader, Spinner, EmptyState, ErrorBanner } from '../components/Ui';
import Modal from '../components/Modal';
import ConfirmDialog from '../components/ConfirmDialog';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../context/ToastContext';
import { ROLES } from '../utils/roles';

const EMPTY_FORM = { fullName: '', phone: '', email: '', address: '' };

export default function CustomersPage() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const isAdmin = user?.role === ROLES.ADMIN;
  const canEdit = user?.role === ROLES.ADMIN || user?.role === ROLES.PHARMACIST;

  const [customers, setCustomers] = useState([]);
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
      setCustomers(await customerService.getAll());
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

  function openEdit(customer) {
    setForm({
      fullName: customer.fullName,
      phone: customer.phone || '',
      email: customer.email || '',
      address: customer.address || '',
    });
    setFormError('');
    setEditing(customer);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setFormError('');
    setSaving(true);
    try {
      if (editing?.customerId) {
        await customerService.update(editing.customerId, form);
        showToast('Customer updated.');
      } else {
        await customerService.create(form);
        showToast('Customer added.');
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
      await customerService.remove(deleteTarget.customerId);
      showToast('Customer deleted.');
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
        title="Customers"
        subtitle="People you sell to."
        action={
          <button type="button" className="btn btn--primary" onClick={openCreate}>
            + Add customer
          </button>
        }
      />

      <ErrorBanner message={error} />

      {loading ? (
        <Spinner />
      ) : customers.length === 0 ? (
        <EmptyState title="No customers yet" message="Add your first customer to start recording sales." />
      ) : (
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Phone</th>
                <th>Email</th>
                <th>Address</th>
                {(canEdit || isAdmin) && <th className="table__actions-col">Actions</th>}
              </tr>
            </thead>
            <tbody>
              {customers.map((c) => (
                <tr key={c.customerId}>
                  <td>{c.fullName}</td>
                  <td className="muted">{c.phone || '\u2014'}</td>
                  <td className="muted">{c.email || '\u2014'}</td>
                  <td className="muted">{c.address || '\u2014'}</td>
                  {(canEdit || isAdmin) && (
                    <td className="table__actions">
                      {canEdit && (
                        <button type="button" className="btn btn--ghost btn--small" onClick={() => openEdit(c)}>
                          Edit
                        </button>
                      )}
                      {isAdmin && (
                        <button
                          type="button"
                          className="btn btn--ghost btn--small btn--danger-text"
                          onClick={() => setDeleteTarget(c)}
                        >
                          Delete
                        </button>
                      )}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {editing !== null && (
        <Modal title={editing.customerId ? 'Edit customer' : 'Add customer'} onClose={() => setEditing(null)}>
          <ErrorBanner message={formError} />
          <form onSubmit={handleSubmit} className="form">
            <label className="form__field">
              <span>Full name</span>
              <input value={form.fullName} onChange={(e) => setForm((f) => ({ ...f, fullName: e.target.value }))} required />
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
                {saving ? 'Saving\u2026' : 'Save customer'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {deleteTarget && (
        <ConfirmDialog
          message={`Delete "${deleteTarget.fullName}"? This cannot be undone.`}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
}
