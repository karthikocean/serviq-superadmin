import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ROUTES } from '../constants/routes';

// Layouts
import SuperAdminLayout from '../layouts/SuperAdminLayout';
import ProtectedRoute from '../components/routing/ProtectedRoute';

// Pages
import LoginPage from '../pages/auth/LoginPage';
import DashboardPage from '../pages/super-admin/DashboardPage';
import CouponsPage from '../pages/super-admin/CouponsPage';
import RestaurantsPage from '../pages/super-admin/RestaurantsPage';
import PlansPage from '../pages/super-admin/PlansPage';
import SubscriptionsPage from '../pages/super-admin/SubscriptionsPage';
import BillingPage from '../pages/super-admin/BillingPage';
import LeadsPage from '../pages/super-admin/LeadsPage';
import TicketsPage from '../pages/super-admin/TicketsPage';
import NotificationsPage from '../pages/super-admin/NotificationsPage';
import ReportsPage from '../pages/super-admin/ReportsPage';
import UsersPage from '../pages/super-admin/UsersPage';
import RolesPage from '../pages/super-admin/RolesPage';
import SettingsPage from '../pages/super-admin/SettingsPage';
import ProfilePage from '../pages/super-admin/ProfilePage';

import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../contexts/NotificationContext';
import { useTheme } from '../contexts/ThemeContext';

export default function AppRoutes() {
  const { login, isAuthenticated, isSuperAdmin } = useAuth();
  const { showToast } = useNotification();
  const { darkMode, toggleDarkMode } = useTheme();

  return (
    <Routes>
      <Route path="/" element={<Navigate to={ROUTES.LOGIN} replace />} />
      <Route 
        path={ROUTES.LOGIN} 
        element={
          isAuthenticated && isSuperAdmin ? (
            <Navigate to={ROUTES.SUPER_ADMIN.DASHBOARD} replace />
          ) : (
            <LoginPage 
              onLogin={login} 
              darkMode={darkMode} 
              onToggleDarkMode={toggleDarkMode} 
              showToast={showToast} 
            />
          )
        } 
      />

      {/* Super Admin Routes */}
      <Route 
        path={ROUTES.SUPER_ADMIN.ROOT} 
        element={
          <ProtectedRoute allowedRoles={['superadmin']}>
            <SuperAdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to={ROUTES.SUPER_ADMIN.DASHBOARD} replace />} />
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="coupons" element={<CouponsPage />} />
        <Route path="restaurants" element={<RestaurantsPage />} />
        <Route path="plans" element={<PlansPage />} />
        <Route path="subscriptions" element={<SubscriptionsPage />} />
        <Route path="billing" element={<BillingPage />} />
        <Route path="leads" element={<LeadsPage />} />
        <Route path="tickets" element={<TicketsPage />} />
        <Route path="notifications" element={<NotificationsPage />} />
        <Route path="reports" element={<ReportsPage />} />
        <Route path="users" element={<UsersPage />} />
        <Route path="roles" element={<RolesPage />} />
        <Route path="settings" element={<SettingsPage />} />
        <Route path="profile" element={<ProfilePage />} />
      </Route>

      {/* Catch all - Redirect to login */}
      <Route path="*" element={<Navigate to={ROUTES.LOGIN} replace />} />
    </Routes>
  );
}
