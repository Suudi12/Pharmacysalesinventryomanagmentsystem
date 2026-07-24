import { Link } from 'react-router-dom';

export default function LandingPage() {
  return (
    <div className="landing-page">
      <div className="landing-page__overlay" />
      <div className="landing-page__content">
        <header className="landing-page__header">
          <div className="landing-page__brand">
            <span className="capsule-mark" aria-hidden="true">
              <span className="capsule-mark__half capsule-mark__half--teal" />
              <span className="capsule-mark__half capsule-mark__half--amber" />
            </span>
            <div>
              <div className="sidebar__brand-name">Farmasi</div>
              <div className="sidebar__brand-sub">Sales &amp; Inventory</div>
            </div>
          </div>
        </header>

        <main className="landing-page__hero">
          <section className="landing-page__copy">
            <p className="landing-page__eyebrow">Modern pharmacy management</p>
            <h1>Run your pharmacy with clarity, speed, and control.</h1>
            <p className="landing-page__subtitle">
              Track medicines, sales, inventory, and customers from one secure dashboard built for growing pharmacies.
            </p>

            <div className="landing-page__actions">
              <Link to="/login" className="btn btn--primary">
                Sign in
              </Link>
              {/* <Link to="/setup" className="btn btn--ghost landing-page__ghost-btn">
                Create admin account
              </Link> */}
            </div>
          </section>

          <aside className="landing-page__card">
            <h2>What you can do</h2>
            <ul>
              <li>Manage stock and expiry alerts</li>
              <li>Process sales quickly</li>
              <li>Monitor customers and suppliers</li>
              <li>Keep staff access organized</li>
            </ul>
          </aside>
        </main>
      </div>

      <footer className="landing-page__footer">
        <span>© 2026 Farmasi</span>
        <span>Secure staff access • Fast inventory updates</span>
      </footer>
    </div>
  );
}
