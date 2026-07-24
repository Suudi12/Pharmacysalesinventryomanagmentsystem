import { useEffect, useState } from 'react';
import { inventoryService } from '../services/inventoryService';
import { medicineService } from '../services/medicineService';
import { extractErrorMessage } from '../services/api';
import { PageHeader, Spinner, EmptyState, ErrorBanner } from '../components/Ui';
import Modal from '../components/Modal';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../context/ToastContext';
import { ROLES } from '../utils/roles';
import { formatDateTime } from '../utils/format';

const EMPTY_FORM = { medicineId: '', quantity: 1, reason: '' };

export default function InventoryPage() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const isAdmin = user?.role === ROLES.ADMIN;

  const [transactions, setTransactions] = useState([]);
  const [medicines, setMedicines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [modalMode, setModalMode] = useState(null); // 'in' | 'out' | null
  const [form, setForm] = useState(EMPTY_FORM);
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);

  async function load() {
    setLoading(true);
    setError('');
    try {
      const [txData, medicinesData] = await Promise.all([inventoryService.getAll(), medicineService.getAll()]);
      setTransactions([...txData].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
      setMedicines(medicinesData);
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  function openModal(mode) {
    setForm(EMPTY_FORM);
    setFormError('');
    setModalMode(mode);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setFormError('');
    setSaving(true);
    const payload = {
      medicineId: Number(form.medicineId),
      quantity: Number(form.quantity),
      reason: form.reason || undefined,
    };
    try {
      if (modalMode === 'in') {
        await inventoryService.stockIn(payload);
        showToast('Stock added.');
      } else {
        await inventoryService.stockOut(payload);
        showToast('Stock removed.');
      }
      setModalMode(null);
      load();
    } catch (err) {
      setFormError(extractErrorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="page">
      <PageHeader
        title="Inventory"
        subtitle="Manual stock movements, separate from sales."
        action={
          isAdmin && (
            <div className="page-header__action-group">
              <button type="button" className="btn btn--ghost" onClick={() => openModal('out')}>
                Stock out
              </button>
              <button type="button" className="btn btn--primary" onClick={() => openModal('in')}>
                + Stock in
              </button>
            </div>
          )
        }
      />

      <ErrorBanner message={error} />

      {loading ? (
        <Spinner />
      ) : transactions.length === 0 ? (
        <EmptyState title="No inventory movements yet" message="Stock-in a delivery to see it logged here." />
      ) : (
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>Medicine</th>
                <th>Type</th>
                <th>Qty</th>
                <th>Reason</th>
                <th>When</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((t) => (
                <tr key={t.transactionId}>
                  <td>{t.medicine?.medicineName}</td>
                  <td>
                    <span className={`badge ${t.transactionType === 'STOCK_IN' ? 'badge--success' : 'badge--danger'}`}>
                      {t.transactionType === 'STOCK_IN' ? 'Stock in' : 'Stock out'}
                    </span>
                  </td>
                  <td className="num">{t.quantity}</td>
                  <td className="muted">{t.reason || '\u2014'}</td>
                  <td className="muted">{formatDateTime(t.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {modalMode && (
        <Modal title={modalMode === 'in' ? 'Stock in' : 'Stock out'} onClose={() => setModalMode(null)}>
          <ErrorBanner message={formError} />
          <form onSubmit={handleSubmit} className="form">
            <label className="form__field">
              <span>Medicine</span>
              <select
                value={form.medicineId}
                onChange={(e) => setForm((f) => ({ ...f, medicineId: e.target.value }))}
                required
              >
                <option value="" disabled>
                  Select medicine
                </option>
                {medicines.map((m) => (
                  <option key={m.medicineId} value={m.medicineId}>
                    {m.medicineName} ({m.quantity} in stock)
                  </option>
                ))}
              </select>
            </label>
            <label className="form__field">
              <span>Quantity</span>
              <input
                type="number"
                min="1"
                value={form.quantity}
                onChange={(e) => setForm((f) => ({ ...f, quantity: e.target.value }))}
                required
              />
            </label>
            <label className="form__field">
              <span>Reason (optional)</span>
              <input
                placeholder={modalMode === 'in' ? 'e.g. New delivery from supplier' : 'e.g. Damaged / expired batch'}
                value={form.reason}
                onChange={(e) => setForm((f) => ({ ...f, reason: e.target.value }))}
              />
            </label>
            <div className="form__actions">
              <button type="button" className="btn btn--ghost" onClick={() => setModalMode(null)}>
                Cancel
              </button>
              <button type="submit" className="btn btn--primary" disabled={saving}>
                {saving ? 'Saving\u2026' : modalMode === 'in' ? 'Add stock' : 'Remove stock'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
