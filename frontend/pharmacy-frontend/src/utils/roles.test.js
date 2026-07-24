import test from 'node:test';
import assert from 'node:assert/strict';
import { ROLES, normalizeRole, hasAnyRole } from './roles.js';

test('normalizes backend role values to the app role constants', () => {
  assert.equal(normalizeRole('ROLE_ADMIN'), ROLES.ADMIN);
  assert.equal(normalizeRole('ADMIN'), ROLES.ADMIN);
  assert.equal(normalizeRole('admin'), ROLES.ADMIN);
  assert.equal(normalizeRole('ROLE_PHARMACIST'), ROLES.PHARMACIST);
  assert.equal(normalizeRole('PHARMACIST'), ROLES.PHARMACIST);
  assert.equal(normalizeRole('ROLE_CASHIER'), ROLES.CASHIER);
  assert.equal(normalizeRole('CASHIER'), ROLES.CASHIER);
});

test('allows access for admin, pharmacist and cashier roles regardless of shape', () => {
  assert.equal(hasAnyRole('ADMIN', [ROLES.ADMIN, ROLES.PHARMACIST, ROLES.CASHIER]), true);
  assert.equal(hasAnyRole('ROLE_PHARMACIST', [ROLES.ADMIN, ROLES.PHARMACIST, ROLES.CASHIER]), true);
  assert.equal(hasAnyRole('cashier', [ROLES.ADMIN, ROLES.PHARMACIST, ROLES.CASHIER]), true);
  assert.equal(hasAnyRole('ROLE_USER', [ROLES.ADMIN, ROLES.PHARMACIST, ROLES.CASHIER]), false);
});
