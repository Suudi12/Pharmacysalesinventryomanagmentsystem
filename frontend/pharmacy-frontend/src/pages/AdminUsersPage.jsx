import { useEffect, useState } from 'react';
import { userService } from '../services/userService';
import { extractErrorMessage } from '../services/api';
import { PageHeader, Spinner, EmptyState, ErrorBanner, Badge } from '../components/Ui';
import Modal from '../components/Modal';
import ConfirmDialog from '../components/ConfirmDialog';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../hooks/useAuth';
import { ROLES, roleLabel } from '../utils/roles';

const EMPTY_FORM = { fullName: '', username: '', email: '', password: '', role: ROLES.CASHIER };

export default function AdminUsersPage() {
  const { user: me } = useAuth();
  const { showToast } = useToast();

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  async function load() {
    setLoading(true);
    setError('');
    try {
      setUsers(await userService.getAll());
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
    setCreating(true);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setFormError('');
    setSaving(true);
    try {
      await userService.create(form);
      showToast('Staff account created.');
      setCreating(false);
      load();
    } catch (err) {
      setFormError(extractErrorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  async function handleRoleChange(targetUser, role) {
    try {
      await userService.updateRole(targetUser.userId, role);
      showToast(`${targetUser.fullName}'s role updated to ${roleLabel(role)}.`);
      load();
    } catch (err) {
      showToast(extractErrorMessage(err), 'error');
    }
  }

  async function handleToggleStatus(targetUser) {
    try {
      if (targetUser.status) {
        await userService.deactivate(targetUser.userId);
        showToast(`${targetUser.fullName} deactivated.`);
      } else {
        await userService.activate(targetUser.userId);
        showToast(`${targetUser.fullName} activated.`);
      }
      load();
    } catch (err) {
      showToast(extractErrorMessage(err), 'error');
    }
  }

  async function handleDelete() {
    try {
      await userService.remove(deleteTarget.userId);
      showToast('Account deleted.');
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
        title="Staff accounts"
        subtitle="Create logins for pharmacists, cashiers, and other admins."
        action={
          <button type="button" className="btn btn--primary" onClick={openCreate}>
            + Add staff account
          </button>
        }
      />

      <ErrorBanner message={error} />

      {loading ? (
        <Spinner />
      ) : users.length === 0 ? (
        <EmptyState title="No accounts yet" />
      ) : (
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Username</th>
                <th>Email</th>
                <th>Role</th>
                <th>Status</th>
                <th className="table__actions-col">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.userId}>
                  <td>{u.fullName}</td>
                  <td className="muted">{u.username}</td>
                  <td className="muted">{u.email}</td>
                  <td>
                    <select
                      value={u.role}
                      onChange={(e) => handleRoleChange(u, e.target.value)}
                      disabled={u.username === me?.username}
                    >
                      {Object.values(ROLES).map((r) => (
                        <option key={r} value={r}>
                          {roleLabel(r)}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td>
                    <Badge tone={u.status ? 'success' : 'danger'}>{u.status ? 'Active' : 'Inactive'}</Badge>
                  </td>
                  <td className="table__actions">
                    <button type="button" className="btn btn--ghost btn--small" onClick={() => handleToggleStatus(u)}>
                      {u.status ? 'Deactivate' : 'Activate'}
                    </button>
                    <button
                      type="button"
                      className="btn btn--ghost btn--small btn--danger-text"
                      onClick={() => setDeleteTarget(u)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {creating && (
        <Modal title="Add staff account" onClose={() => setCreating(false)}>
          <ErrorBanner message={formError} />
          <form onSubmit={handleSubmit} className="form">
            <label className="form__field">
              <span>Full name</span>
              <input value={form.fullName} onChange={(e) => setForm((f) => ({ ...f, fullName: e.target.value }))} required />
            </label>
            <label className="form__field">
              <span>Username</span>
              <input value={form.username} onChange={(e) => setForm((f) => ({ ...f, username: e.target.value }))} required />
            </label>
            <label className="form__field">
              <span>Email</span>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                required
              />
            </label>
            <label className="form__field">
              <span>Temporary password</span>
              <input
                type="password"
                minLength={6}
                value={form.password}
                onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                required
              />
              <small>At least 6 characters. Share this with the staff member securely.</small>
            </label>
            <label className="form__field">
              <span>Role</span>
              <select value={form.role} onChange={(e) => setForm((f) => ({ ...f, role: e.target.value }))}>
                {Object.values(ROLES).map((r) => (
                  <option key={r} value={r}>
                    {roleLabel(r)}
                  </option>
                ))}
              </select>
            </label>
            <div className="form__actions">
              <button type="button" className="btn btn--ghost" onClick={() => setCreating(false)}>
                Cancel
              </button>
              <button type="submit" className="btn btn--primary" disabled={saving}>
                {saving ? 'Creating\u2026' : 'Create account'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {deleteTarget && (
        <ConfirmDialog
          message={`Delete "${deleteTarget.fullName}"'s account? This cannot be undone.`}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
}
