import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { ROLES, roleLabel, normalizeRole } from '../utils/roles';

const NAV_ITEMS = [
  { to: '/', label: 'Overview', roles: null },
  { to: '/sales', label: 'Sales', roles: null },
  { to: '/sales/new', label: 'New sale', roles: [ROLES.ADMIN, ROLES.PHARMACIST, ROLES.CASHIER] },
  { to: '/medicines', label: 'Medicines', roles: null },
  { to: '/categories', label: 'Categories', roles: null },
  { to: '/suppliers', label: 'Suppliers', roles: [ROLES.ADMIN, ROLES.PHARMACIST] },
  { to: '/customers', label: 'Customers', roles: null },
  { to: '/inventory', label: 'Inventory', roles: [ROLES.ADMIN, ROLES.PHARMACIST] },
  { to: '/admin/users', label: 'Staff accounts', roles: [ROLES.ADMIN] },
];

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const normalizedRole = normalizeRole(user?.role);
  const visibleItems = NAV_ITEMS.filter((item) => !item.roles || item.roles.includes(normalizedRole));

  function handleLogout() {
    logout();
    navigate('/', { replace: true });
  }

  return (
    <aside className="sidebar">
      <div className="sidebar__brand">
        <span className="capsule-mark" aria-hidden="true">
          <span className="capsule-mark__half capsule-mark__half--teal" />
          <span className="capsule-mark__half capsule-mark__half--amber" />
        </span>
        <div>
          <div className="sidebar__brand-name">Farmasi</div>
          <div className="sidebar__brand-sub">Sales &amp; Inventory</div>
        </div>
      </div>

      <nav className="sidebar__nav">
        {visibleItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            className={({ isActive }) => `sidebar__link${isActive ? ' sidebar__link--active' : ''}`}
          >
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="sidebar__user">
        <div className="sidebar__user-info">
          <div className="sidebar__user-name">{user?.fullName}</div>
          <div className="sidebar__user-role">{roleLabel(user?.role)}</div>
        </div>
        <button type="button" className="btn btn--ghost btn--small" onClick={handleLogout}>
          Log out
        </button>
      </div>
    </aside>
  );
}
