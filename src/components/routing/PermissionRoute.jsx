import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { ROUTES } from '../../constants/routes';

export default function PermissionRoute({ module, children }) {
  const { hasPermission, isSuperOwner, profileLoading, isAuthenticated } = useAuth();

  if (profileLoading || !isAuthenticated) return null;

  if (isSuperOwner) return children;

  if (!hasPermission(module, 'view')) {
    return <Navigate to={ROUTES.SUPER_ADMIN.DASHBOARD} replace />;
  }

  return children;
}
