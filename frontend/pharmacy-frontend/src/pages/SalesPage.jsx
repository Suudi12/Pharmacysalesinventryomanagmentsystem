import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { saleService } from '../services/saleService';
import { extractErrorMessage } from '../services/api';
import { PageHeader, Spinner, EmptyState, ErrorBanner } from '../components/Ui';
import { formatMoney, formatDateTime } from '../utils/format';
import Modal from '../components/Modal';

export default function SalesPage() {
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [viewing, setViewing] = useState(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError('');
      try {
        const data = await saleService.getAll();
        if (!cancelled) setSales([...data].sort((a, b) => new Date(b.saleDate) - new Date(a.saleDate)));
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

  return (
    <div className="page">
      <PageHeader
        title="Sales"
        subtitle="Every completed sale, most recent first."
        action={
          <Link to="/sales/new" className="btn btn--primary">
            + New sale
          </Link>
        }
      />

      <ErrorBanner message={error} />

      {loading ? (
        <Spinner />
      ) : sales.length === 0 ? (
        <EmptyState title="No sales yet" message="Record your first sale to see it show up here." />
      ) : (
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>Sale #</th>
                <th>Customer</th>
                <th>Sold by</th>
                <th>Date</th>
                <th>Total</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {sales.map((s) => (
                <tr key={s.saleId}>
                  <td>#{s.saleId}</td>
                  <td>{s.customer?.fullName || 'Walk-in'}</td>
                  <td className="muted">{s.soldBy?.fullName || '\u2014'}</td>
                  <td className="muted">{formatDateTime(s.saleDate)}</td>
                  <td className="num">{formatMoney(s.totalAmount)}</td>
                  <td className="table__actions">
                    <button type="button" className="btn btn--ghost btn--small" onClick={() => setViewing(s)}>
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {viewing && (
        <Modal title={`Sale #${viewing.saleId}`} onClose={() => setViewing(null)} width="440px">
          <div className="receipt">
            <div className="receipt__row">
              <span>Customer</span>
              <strong>{viewing.customer?.fullName || 'Walk-in'}</strong>
            </div>
            <div className="receipt__row">
              <span>Sold by</span>
              <strong>{viewing.soldBy?.fullName || '\u2014'}</strong>
            </div>
            <div className="receipt__row">
              <span>Date</span>
              <strong>{formatDateTime(viewing.saleDate)}</strong>
            </div>
            <hr />
            <table className="receipt__items">
              <thead>
                <tr>
                  <th>Medicine</th>
                  <th>Qty</th>
                  <th>Unit</th>
                  <th>Subtotal</th>
                </tr>
              </thead>
              <tbody>
                {viewing.saleDetails?.map((d) => (
                  <tr key={d.saleDetailId}>
                    <td>{d.medicine?.medicineName}</td>
                    <td className="num">{d.quantity}</td>
                    <td className="num">{formatMoney(d.unitPrice)}</td>
                    <td className="num">{formatMoney(d.subtotal)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <hr />
            <div className="receipt__row receipt__total">
              <span>Total</span>
              <strong>{formatMoney(viewing.totalAmount)}</strong>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
