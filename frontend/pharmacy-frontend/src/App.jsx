import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import PrivateRoute from './components/PrivateRoute';
import RoleRoute from './components/RoleRoute';
import AppLayout from './components/AppLayout';

import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import SetupPage from './pages/SetupPage';
import DashboardPage from './pages/DashboardPage';
import MedicinesPage from './pages/MedicinesPage';
import CategoriesPage from './pages/CategoriesPage';
import SuppliersPage from './pages/SuppliersPage';
import CustomersPage from './pages/CustomersPage';
import SalesPage from './pages/SalesPage';
import NewSalePage from './pages/NewSalePage';
import InventoryPage from './pages/InventoryPage';
import AdminUsersPage from './pages/AdminUsersPage';
import NotFoundPage from './pages/NotFoundPage';

import { ROLES } from './utils/roles';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/setup" element={<SetupPage />} />

            <Route element={<PrivateRoute />}>
              <Route element={<RoleRoute allow={[ROLES.ADMIN, ROLES.PHARMACIST, ROLES.CASHIER]} />}>
                <Route element={<AppLayout />}>
                  <Route path="/dashboard" element={<DashboardPage />} />
                  <Route path="/medicines" element={<MedicinesPage />} />
                  <Route path="/categories" element={<CategoriesPage />} />
                  <Route path="/customers" element={<CustomersPage />} />
                  <Route path="/sales" element={<SalesPage />} />

                  <Route element={<RoleRoute allow={[ROLES.ADMIN, ROLES.PHARMACIST, ROLES.CASHIER]} />}>
                    <Route path="/sales/new" element={<NewSalePage />} />
                  </Route>

                  <Route element={<RoleRoute allow={[ROLES.ADMIN, ROLES.PHARMACIST]} />}>
                    <Route path="/suppliers" element={<SuppliersPage />} />
                    <Route path="/inventory" element={<InventoryPage />} />
                  </Route>

                  <Route element={<RoleRoute allow={[ROLES.ADMIN]} />}>
                    <Route path="/admin/users" element={<AdminUsersPage />} />
                  </Route>
                </Route>
              </Route>
            </Route>

            <Route path="/404" element={<NotFoundPage />} />
            <Route path="*" element={<Navigate to="/404" replace />} />
          </Routes>
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
