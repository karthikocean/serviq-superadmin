import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { ROUTES } from '../../constants/routes';

export default function ProtectedRoute({ children, allowedRoles }) {
  const { role, isAuthenticated, isSuperAdmin } = useAuth();
  const location = useLocation();

  if (!isAuthenticated && role !== 'customer') {
    return <Navigate to={ROUTES.LOGIN} state={{ from: location }} replace />;
  }

  // Check superadmin vs admin
  if (allowedRoles.includes('superadmin') && !isSuperAdmin) {
    return <Navigate to={ROUTES.ADMIN.DASHBOARD} replace />;
  }
  
  if (allowedRoles.includes('admin') && isSuperAdmin) {
    return <Navigate to={ROUTES.SUPER_ADMIN.DASHBOARD} replace />;
  }

  // Role based access logic can be expanded here based on allowedRoles

  return children;
}
