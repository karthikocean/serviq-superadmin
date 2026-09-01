import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { ROUTES } from '../../constants/routes';

export default function ProtectedRoute({ children, allowedRoles }) {
  const { role, isAuthenticated, isSuperAdmin, profileLoading } = useAuth();
  const location = useLocation();

  // Wait for profile fetch to complete before making auth decisions
  if (profileLoading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        background: 'var(--bg-app)',
        flexDirection: 'column',
        gap: '16px'
      }}>
        <div style={{
          width: '40px', height: '40px',
          border: '3px solid var(--border-color)',
          borderTop: '3px solid var(--primary)',
          borderRadius: '50%',
          animation: 'spin 0.8s linear infinite'
        }} />
        <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', fontWeight: '600' }}>
          Loading session...
        </p>
      </div>
    );
  }

  if (!isAuthenticated && role !== 'customer') {
    return <Navigate to={ROUTES.LOGIN} state={{ from: location }} replace />;
  }

  if (allowedRoles.includes('superadmin') && !isSuperAdmin) {
    return <Navigate to={ROUTES.ADMIN.DASHBOARD} replace />;
  }

  if (allowedRoles.includes('admin') && isSuperAdmin) {
    return <Navigate to={ROUTES.SUPER_ADMIN.DASHBOARD} replace />;
  }

  return children;
}
