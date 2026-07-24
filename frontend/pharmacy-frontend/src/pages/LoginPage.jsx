import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { ErrorBanner } from '../components/Ui';
import { normalizeRole, ROLES } from '../utils/roles';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const from = location.state?.from?.pathname || '/dashboard';

  function handleChange(e) {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    const result = await login(form.username, form.password);
    setSubmitting(false);
    if (result.success) {
      const role = normalizeRole(result.role);
      if (role === ROLES.ADMIN || role === ROLES.PHARMACIST || role === ROLES.CASHIER) {
        navigate('/dashboard', { replace: true });
      } else {
        navigate(from, { replace: true });
      }
    } else {
      setError(result.message);
    }
  }

  return (
    <div className="auth-screen">
      <div className="auth-card">
        <div className="auth-card__brand">
          <span className="capsule-mark" aria-hidden="true">
            <span className="capsule-mark__half capsule-mark__half--teal" />
            <span className="capsule-mark__half capsule-mark__half--amber" />
          </span>
          <div>
           <div>
            <Link to="/" LandingPage="btn btn--ghost auth-card__back">← Back to Home</Link>
           </div>
            <div className="sidebar__brand-name">Farmasi</div>
            <div className="sidebar__brand-sub">Sales &amp; Inventory</div>
          </div>
        </div>

        <h1 className="auth-card__title">Log in</h1>
        <p className="auth-card__subtitle">Enter your staff credentials to open the dashboard.</p>

        <ErrorBanner message={error} />

        <form onSubmit={handleSubmit} className="form">
          <label className="form__field">
            <span>Username</span>
            <input name="username" value={form.username} onChange={handleChange} autoComplete="username" required />
          </label>
          <label className="form__field">
            <span>Password</span>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              autoComplete="current-password"
              required
            />
          </label>
          <button type="submit" className="btn btn--primary btn--block" disabled={submitting}>
            {submitting ? 'Signing in\u2026' : 'Log in'}
          </button>
        </form>

        {/* <p className="auth-card__footer">
          First time setting up this pharmacy? <Link to="/setup">Create the admin account</Link>
        </p> */}
      </div>
    </div>
  );
}
