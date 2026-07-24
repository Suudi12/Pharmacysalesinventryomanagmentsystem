import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { medicineService } from '../services/medicineService';
import { saleService } from '../services/saleService';
import { customerService } from '../services/customerService';
import { extractErrorMessage } from '../services/api';
import { useAuth } from '../hooks/useAuth';
import { formatMoney, formatDateTime, isLowStock, isExpired } from '../utils/format';

export default function DashboardPage() {
  const { user } = useAuth();
  const [medicines, setMedicines] = useState([]);
  const [sales, setSales] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError('');
      try {
        const [medicinesData, salesData, customersData] = await Promise.all([
          medicineService.getAll(),
          saleService.getAll(),
          customerService.getAll(),
        ]);
        if (cancelled) return;
        setMedicines(medicinesData);
        setSales(salesData);
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

  if (loading) {
    return (
      <div className="flex items-center justify-center gap-3 py-24 text-slate-500">
        <span className="h-5 w-5 animate-spin rounded-full border-[3px] border-teal-100 border-t-teal-700" />
        <span className="font-body text-sm">Loading dashboard…</span>
      </div>
    );
  }

  const lowStock = medicines.filter((m) => isLowStock(m.quantity));
  const expired = medicines.filter((m) => isExpired(m.expiryDate));
  const todayTotal = sales
    .filter((s) => new Date(s.saleDate).toDateString() === new Date().toDateString())
    .reduce((sum, s) => sum + Number(s.totalAmount || 0), 0);
  const recentSales = [...sales]
    .sort((a, b) => new Date(b.saleDate) - new Date(a.saleDate))
    .slice(0, 6);

  const firstName = user?.fullName?.split(' ')[0] || '';

  return (
    <div className="flex flex-col gap-6 font-body">
      {/* Hero */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-teal-800 via-primary to-teal-600 px-6 py-8 shadow-lg shadow-teal-900/10 sm:px-10 sm:py-10">
        <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-white/10" />
        <div className="pointer-events-none absolute -bottom-20 right-24 h-40 w-40 rounded-full bg-amber/20" />
        <div className="relative flex flex-col gap-1">
          <p className="text-sm font-medium text-teal-100">
            {new Date().toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
          <h1 className="font-display text-2xl font-bold text-white sm:text-3xl">
            Welcome back{firstName ? `, ${firstName}` : ''} 👋
          </h1>
          <p className="max-w-md text-sm text-teal-100/90">Here&rsquo;s how the pharmacy looks today.</p>
        </div>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          {error}
        </div>
      )}

      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          label="Medicines in catalog"
          value={medicines.length}
          accent="teal"
          icon={<IconPill />}
        />
        <StatCard
          label="Sold today"
          value={formatMoney(todayTotal)}
          accent="amber"
          icon={<IconCash />}
        />
        <StatCard
          label="Low stock (≤10)"
          value={lowStock.length}
          accent={lowStock.length ? 'danger' : 'success'}
          icon={<IconAlert />}
        />
        <StatCard
          label="Registered customers"
          value={customers.length}
          accent="teal"
          icon={<IconUsers />}
        />
      </div>

      {/* Content grid */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* Stock alerts */}
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-display text-base font-bold text-slate-800">Stock needing attention</h2>
            <Link to="/medicines" className="text-sm font-semibold text-primary hover:text-primary-dark">
              Manage medicines →
            </Link>
          </div>

          {lowStock.length === 0 && expired.length === 0 ? (
            <p className="py-6 text-center text-sm text-slate-400">
              Everything is comfortably stocked. Nothing needs attention right now.
            </p>
          ) : (
            <ul className="flex flex-col gap-2.5">
              {expired.map((m) => (
                <li
                  key={`exp-${m.medicineId}`}
                  className="flex items-center gap-2.5 rounded-lg bg-red-50 px-3 py-2 text-sm text-slate-700"
                >
                  <span className="rounded-full bg-red-100 px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide text-red-600">
                    Expired
                  </span>
                  <span className="truncate">
                    {m.medicineName} — expired {formatDateTime(m.expiryDate)}
                  </span>
                </li>
              ))}
              {lowStock.map((m) => (
                <li
                  key={`low-${m.medicineId}`}
                  className="flex items-center gap-2.5 rounded-lg bg-amber-light px-3 py-2 text-sm text-slate-700"
                >
                  <span className="rounded-full bg-amber/20 px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide text-amber-700">
                    Low stock
                  </span>
                  <span className="truncate">
                    {m.medicineName} — {m.quantity} left
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* Recent sales */}
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-display text-base font-bold text-slate-800">Recent sales</h2>
            <Link to="/sales" className="text-sm font-semibold text-primary hover:text-primary-dark">
              View all →
            </Link>
          </div>

          {recentSales.length === 0 ? (
            <p className="py-6 text-center text-sm text-slate-400">No sales recorded yet.</p>
          ) : (
            <ul className="flex flex-col divide-y divide-slate-100">
              {recentSales.map((s) => (
                <li key={s.saleId} className="flex items-center justify-between gap-3 py-2.5 first:pt-0 last:pb-0">
                  <div className="flex items-center gap-3">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary-light text-sm font-bold text-primary">
                      {(s.customer?.fullName || 'W')[0].toUpperCase()}
                    </span>
                    <div>
                      <div className="text-sm font-semibold text-slate-800">
                        {s.customer?.fullName || 'Walk-in customer'}
                      </div>
                      <div className="text-xs text-slate-400">{formatDateTime(s.saleDate)}</div>
                    </div>
                  </div>
                  <div className="whitespace-nowrap text-sm font-bold tabular-nums text-slate-800">
                    {formatMoney(s.totalAmount)}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}

function StatCard({ label, value, icon, accent = 'teal' }) {
  const accents = {
    teal: 'border-primary bg-primary-light text-primary',
    amber: 'border-amber bg-amber-light text-amber-700',
    danger: 'border-red-500 bg-red-50 text-red-600',
    success: 'border-emerald-500 bg-emerald-50 text-emerald-600',
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md sm:p-5">
      <div className={`mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl border ${accents[accent]}`}>
        {icon}
      </div>
      <div className="font-display text-xl font-bold tabular-nums text-slate-800 sm:text-2xl">{value}</div>
      <div className="mt-0.5 text-xs text-slate-500 sm:text-sm">{label}</div>
    </div>
  );
}

function IconPill() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="9" width="18" height="6" rx="3" transform="rotate(-45 12 12)" />
      <line x1="12" y1="12" x2="17.5" y2="6.5" transform="rotate(-45 12 12)" />
    </svg>
  );
}

function IconCash() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" stroke="currentColor" strokeWidth="2">
      <rect x="2.5" y="6" width="19" height="12" rx="2" />
      <circle cx="12" cy="12" r="2.75" />
    </svg>
  );
}

function IconAlert() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" stroke="currentColor" strokeWidth="2">
      <path d="M12 3.5 21.5 20h-19L12 3.5Z" strokeLinejoin="round" />
      <line x1="12" y1="9.5" x2="12" y2="14" />
      <circle cx="12" cy="16.8" r="0.9" fill="currentColor" stroke="none" />
    </svg>
  );
}

function IconUsers() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" stroke="currentColor" strokeWidth="2">
      <circle cx="9" cy="8.5" r="3" />
      <path d="M3.5 19.5c0-3 2.5-5 5.5-5s5.5 2 5.5 5" />
      <circle cx="17" cy="9.5" r="2.3" />
      <path d="M15.8 14.7c2.4.3 4.2 2 4.2 4.3" />
    </svg>
  );
}
