import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { medicineService } from '../services/medicineService';
import { customerService } from '../services/customerService';
import { saleService } from '../services/saleService';
import { extractErrorMessage } from '../services/api';
import { PageHeader, Spinner, ErrorBanner } from '../components/Ui';
import { useToast } from '../context/ToastContext';
import { formatMoney } from '../utils/format';

export default function NewSalePage() {
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [medicines, setMedicines] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [customerId, setCustomerId] = useState('');
  const [cart, setCart] = useState([]); // [{ medicineId, quantity }]
  const [pickerMedicineId, setPickerMedicineId] = useState('');
  const [pickerQuantity, setPickerQuantity] = useState(1);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError('');
      try {
        const [medicinesData, customersData] = await Promise.all([medicineService.getAll(), customerService.getAll()]);
        if (cancelled) return;
        setMedicines(medicinesData.filter((m) => m.quantity > 0));
        setCustomers(customersData);
      } catch (err) {
        if (!cancelled) setError(extractErrorMessage(err));
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const medicineById = useMemo(() => Object.fromEntries(medicines.map((m) => [m.medicineId, m])), [medicines]);

  const total = cart.reduce((sum, item) => {
    const medicine = medicineById[item.medicineId];
    return sum + (medicine ? Number(medicine.price) * item.quantity : 0);
  }, 0);

  function addToCart(e) {
    e.preventDefault();
    if (!pickerMedicineId) return;
    const medicine = medicineById[Number(pickerMedicineId)];
    if (!medicine) return;

    const quantity = Number(pickerQuantity);
    if (quantity < 1) return;

    setCart((prev) => {
      const existing = prev.find((i) => i.medicineId === medicine.medicineId);
      if (existing) {
        return prev.map((i) =>
          i.medicineId === medicine.medicineId ? { ...i, quantity: i.quantity + quantity } : i
        );
      }
      return [...prev, { medicineId: medicine.medicineId, quantity }];
    });
    setPickerMedicineId('');
    setPickerQuantity(1);
  }

  function removeFromCart(medicineId) {
    setCart((prev) => prev.filter((i) => i.medicineId !== medicineId));
  }

  function updateQuantity(medicineId, quantity) {
    setCart((prev) => prev.map((i) => (i.medicineId === medicineId ? { ...i, quantity } : i)));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    if (!customerId) {
      setError('Choose a customer before completing the sale.');
      return;
    }
    if (cart.length === 0) {
      setError('Add at least one medicine to the sale.');
      return;
    }
    setSubmitting(true);
    try {
      const sale = await saleService.create({
        customerId: Number(customerId),
        items: cart.map((i) => ({ medicineId: i.medicineId, quantity: i.quantity })),
      });
      showToast(`Sale #${sale.saleId} recorded \u2014 ${formatMoney(sale.totalAmount)}`);
      navigate('/sales');
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) return <Spinner label="Loading sale form\u2026" />;

  return (
    <div className="page">
      <PageHeader title="New sale" subtitle="Pick a customer, add medicines, and complete the sale." />

      <ErrorBanner message={error} />

      <div className="grid-2">
        <section className="card">
          <h2>1. Customer</h2>
          <label className="form__field">
            <span>Customer</span>
            <select value={customerId} onChange={(e) => setCustomerId(e.target.value)}>
              <option value="" disabled>
                Select customer
              </option>
              {customers.map((c) => (
                <option key={c.customerId} value={c.customerId}>
                  {c.fullName}
                </option>
              ))}
            </select>
          </label>

          <h2 style={{ marginTop: '1.5rem' }}>2. Add medicines</h2>
          <form onSubmit={addToCart} className="form__row form__row--tight">
            <label className="form__field" style={{ flex: 2 }}>
              <span>Medicine</span>
              <select value={pickerMedicineId} onChange={(e) => setPickerMedicineId(e.target.value)}>
                <option value="" disabled>
                  Select medicine
                </option>
                {medicines.map((m) => (
                  <option key={m.medicineId} value={m.medicineId}>
                    {m.medicineName} &middot; {formatMoney(m.price)} &middot; {m.quantity} in stock
                  </option>
                ))}
              </select>
            </label>
            <label className="form__field" style={{ flex: 1 }}>
              <span>Qty</span>
              <input
                type="number"
                min="1"
                value={pickerQuantity}
                onChange={(e) => setPickerQuantity(e.target.value)}
              />
            </label>
            <button type="submit" className="btn btn--ghost" style={{ alignSelf: 'flex-end' }}>
              Add
            </button>
          </form>
        </section>

        <section className="card">
          <h2>3. Sale summary</h2>
          {cart.length === 0 ? (
            <p className="muted">No items added yet.</p>
          ) : (
            <table className="table table--compact">
              <thead>
                <tr>
                  <th>Medicine</th>
                  <th>Qty</th>
                  <th>Subtotal</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {cart.map((item) => {
                  const medicine = medicineById[item.medicineId];
                  return (
                    <tr key={item.medicineId}>
                      <td>{medicine?.medicineName}</td>
                      <td>
                        <input
                          type="number"
                          min="1"
                          max={medicine?.quantity}
                          value={item.quantity}
                          onChange={(e) => updateQuantity(item.medicineId, Number(e.target.value))}
                          className="qty-input"
                        />
                      </td>
                      <td className="num">{formatMoney(Number(medicine?.price || 0) * item.quantity)}</td>
                      <td>
                        <button
                          type="button"
                          className="btn btn--ghost btn--small btn--danger-text"
                          onClick={() => removeFromCart(item.medicineId)}
                        >
                          Remove
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}

          <div className="sale-total">
            <span>Total</span>
            <strong>{formatMoney(total)}</strong>
          </div>

          <button type="button" className="btn btn--primary btn--block" onClick={handleSubmit} disabled={submitting}>
            {submitting ? 'Completing sale\u2026' : 'Complete sale'}
          </button>
        </section>
      </div>
    </div>
  );
}
