export const ROLES = {
  ADMIN: 'ROLE_ADMIN',
  PHARMACIST: 'ROLE_PHARMACIST',
  CASHIER: 'ROLE_CASHIER',
};

export const ROLE_LABELS = {
  [ROLES.ADMIN]: 'Admin',
  [ROLES.PHARMACIST]: 'Pharmacist',
  [ROLES.CASHIER]: 'Cashier',
};

export function normalizeRole(role) {
  if (!role) return null;

  const normalized = String(role).trim().toUpperCase();
  if (normalized === 'ADMIN' || normalized === 'ROLE_ADMIN') return ROLES.ADMIN;
  if (normalized === 'PHARMACIST' || normalized === 'ROLE_PHARMACIST') return ROLES.PHARMACIST;
  if (normalized === 'CASHIER' || normalized === 'ROLE_CASHIER') return ROLES.CASHIER;

  return null;
}

export function roleLabel(role) {
  const normalizedRole = normalizeRole(role);
  return ROLE_LABELS[normalizedRole] || 'Unknown role';
}

export function hasAnyRole(userRole, allowedRoles) {
  if (!allowedRoles || allowedRoles.length === 0) return true;

  const normalizedUserRole = normalizeRole(userRole);
  return allowedRoles.some((allowedRole) => normalizeRole(allowedRole) === normalizedUserRole);
}
