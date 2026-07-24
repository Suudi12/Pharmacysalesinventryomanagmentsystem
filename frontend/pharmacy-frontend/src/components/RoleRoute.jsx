import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { hasAnyRole, normalizeRole } from '../utils/roles';

export default function RoleRoute({ allow }) {
  const { user } = useAuth();
  const normalizedUserRole = normalizeRole(user?.role);

  if (!hasAnyRole(normalizedUserRole, allow)) {
    return <Navigate to="/login" replace />;
  }
  return <Outlet />;
}
