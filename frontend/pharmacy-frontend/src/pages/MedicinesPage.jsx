import { useEffect, useState } from 'react';
import { medicineService } from '../services/medicineService';
import { categoryService } from '../services/categoryService';
import { supplierService } from '../services/supplierService';
import { extractErrorMessage } from '../services/api';
import { PageHeader, Spinner, EmptyState, ErrorBanner, Badge } from '../components/Ui';
import Modal from '../components/Modal';
import ConfirmDialog from '../components/ConfirmDialog';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../context/ToastContext';
import { ROLES } from '../utils/roles';
import { formatMoney, formatDate, isLowStock, isExpired } from '../utils/format';

const EMPTY_FORM = { medicineName: '', categoryId: '', supplierId: '', price: '', quantity: '', expiryDate: '' };

export default function MedicinesPage() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const isAdmin = user?.role === ROLES.ADMIN;

  const [medicines, setMedicines] = useState([]);
  const [categories, setCategories] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  async function load() {
    setLoading(true);
    setError('');
    try {
      const [medicinesData, categoriesData] = await Promise.all([medicineService.getAll(), categoryService.getAll()]);
      setMedicines(medicinesData);
      setCategories(categoriesData);
      // Suppliers are only visible to admin/pharmacist on the backend; skip
      // silently for cashiers so the page still loads for them.
      if (user?.role === ROLES.ADMIN || user?.role === ROLES.PHARMACIST) {
        setSuppliers(await supplierService.getAll());
      }
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleSearch(e) {
    e.preventDefault();
    if (!searchTerm.trim()) {
      load();
      return;
    }
    setLoading(true);
    setError('');
    try {
      setMedicines(await medicineService.search(searchTerm.trim()));
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  function openCreate() {
    setForm(EMPTY_FORM);
    setFormError('');
    setEditing({});
  }

  function openEdit(medicine) {
    setForm({
      medicineName: medicine.medicineName,
      categoryId: medicine.category?.categoryId ?? '',
      supplierId: medicine.supplier?.supplierId ?? '',
      price: medicine.price,
      quantity: medicine.quantity,
      expiryDate: medicine.expiryDate || '',
    });
    setFormError('');
    setEditing(medicine);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setFormError('');
    setSaving(true);
    const payload = {
      medicineName: form.medicineName,
      categoryId: Number(form.categoryId),
      supplierId: Number(form.supplierId),
      price: Number(form.price),
      quantity: Number(form.quantity),
      expiryDate: form.expiryDate || null,
    };
    try {
      if (editing?.medicineId) {
        await medicineService.update(editing.medicineId, payload);
        showToast('Medicine updated.');
      } else {
        await medicineService.create(payload);
        showToast('Medicine added.');
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
      await medicineService.remove(deleteTarget.medicineId);
      showToast('Medicine deleted.');
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
        title="Medicines"
        subtitle="Everything in the pharmacy catalog, with live stock levels."
        action={
          isAdmin && (
            <button type="button" className="btn btn--primary" onClick={openCreate}>
              + Add medicine
            </button>
          )
        }
      />

      <form onSubmit={handleSearch} className="search-bar">
        <input
          placeholder="Search medicines by name\u2026"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <button type="submit" className="btn btn--ghost">
          Search
        </button>
        {searchTerm && (
          <button
            type="button"
            className="btn btn--ghost"
            onClick={() => {
              setSearchTerm('');
              load();
            }}
          >
            Clear
          </button>
        )}
      </form>

      <ErrorBanner message={error} />

      {loading ? (
        <Spinner />
      ) : medicines.length === 0 ? (
        <EmptyState title="No medicines found" message="Try a different search, or add a new medicine." />
      ) : (
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Category</th>
                <th>Supplier</th>
                <th>Price</th>
                <th>Stock</th>
                <th>Expiry</th>
                {isAdmin && <th className="table__actions-col">Actions</th>}
              </tr>
            </thead>
            <tbody>
              {medicines.map((m) => (
                <tr key={m.medicineId}>
                  <td>{m.medicineName}</td>
                  <td className="muted">{m.category?.categoryName || '\u2014'}</td>
                  <td className="muted">{m.supplier?.supplierName || '\u2014'}</td>
                  <td className="num">{formatMoney(m.price)}</td>
                  <td className="num">
                    {m.quantity}
                    {isLowStock(m.quantity) && <Badge tone="amber">low</Badge>}
                  </td>
                  <td>
                    {formatDate(m.expiryDate)}
                    {isExpired(m.expiryDate) && <Badge tone="danger">expired</Badge>}
                  </td>
                  {isAdmin && (
                    <td className="table__actions">
                      <button type="button" className="btn btn--ghost btn--small" onClick={() => openEdit(m)}>
                        Edit
                      </button>
                      <button
                        type="button"
                        className="btn btn--ghost btn--small btn--danger-text"
                        onClick={() => setDeleteTarget(m)}
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
        <Modal title={editing.medicineId ? 'Edit medicine' : 'Add medicine'} onClose={() => setEditing(null)} width="520px">
          <ErrorBanner message={formError} />
          <form onSubmit={handleSubmit} className="form">
            <label className="form__field">
              <span>Medicine name</span>
              <input
                value={form.medicineName}
                onChange={(e) => setForm((f) => ({ ...f, medicineName: e.target.value }))}
                required
              />
            </label>
            <div className="form__row">
              <label className="form__field">
                <span>Category</span>
                <select
                  value={form.categoryId}
                  onChange={(e) => setForm((f) => ({ ...f, categoryId: e.target.value }))}
                  required
                >
                  <option value="" disabled>
                    Select category
                  </option>
                  {categories.map((c) => (
                    <option key={c.categoryId} value={c.categoryId}>
                      {c.categoryName}
                    </option>
                  ))}
                </select>
              </label>
              <label className="form__field">
                <span>Supplier</span>
                <select
                  value={form.supplierId}
                  onChange={(e) => setForm((f) => ({ ...f, supplierId: e.target.value }))}
                  required
                >
                  <option value="" disabled>
                    Select supplier
                  </option>
                  {suppliers.map((s) => (
                    <option key={s.supplierId} value={s.supplierId}>
                      {s.supplierName}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <div className="form__row">
              <label className="form__field">
                <span>Price</span>
                <input
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={form.price}
                  onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
                  required
                />
              </label>
              <label className="form__field">
                <span>Quantity</span>
                <input
                  type="number"
                  min="0"
                  step="1"
                  value={form.quantity}
                  onChange={(e) => setForm((f) => ({ ...f, quantity: e.target.value }))}
                  required
                />
              </label>
            </div>
            <label className="form__field">
              <span>Expiry date (optional)</span>
              <input
                type="date"
                value={form.expiryDate || ''}
                onChange={(e) => setForm((f) => ({ ...f, expiryDate: e.target.value }))}
              />
            </label>
            <div className="form__actions">
              <button type="button" className="btn btn--ghost" onClick={() => setEditing(null)}>
                Cancel
              </button>
              <button type="submit" className="btn btn--primary" disabled={saving}>
                {saving ? 'Saving\u2026' : 'Save medicine'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {deleteTarget && (
        <ConfirmDialog
          message={`Delete "${deleteTarget.medicineName}"? This cannot be undone.`}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
}
