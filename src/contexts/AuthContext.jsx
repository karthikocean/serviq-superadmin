import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { ROLES } from '../constants/roles';
import { getProfile, logout as apiLogout } from '../services/authService';

const AuthContext = createContext(null);

// MODULE KEY → route segment mapping used by hasPermission() and PermissionRoute
export const MODULE_MAP = {
  dashboard: 'dashboard',
  coupons: 'coupons',
  restaurants: 'restaurants',
  plans: 'plans',
  subscriptions: 'subscriptions',
  billing: 'billing',
  leads: 'leads',
  tickets: 'tickets',
  notifications: 'notifications',
  reports: 'reports',
  adminUsers: 'users',
  roles: 'roles',
  settings: 'settings',
  profile: 'profile',
};

export function AuthProvider({ children }) {
  const savedToken = sessionStorage.getItem('superadmin_token');

  const [role, setRole] = useState(savedToken ? ROLES.SUPER_ADMIN : ROLES.LOGIN);
  const [isSuperAdmin, setIsSuperAdmin] = useState(!!savedToken);
  const [user, setUser] = useState(null);
  const [permissions, setPermissions] = useState({});
  const [isSuperOwner, setIsSuperOwner] = useState(false);
  const [profileLoading, setProfileLoading] = useState(!!savedToken);

  // ─── Logout helper ────────────────────────────────────────────────────────
  const logout = useCallback(async () => {
    try {
      if (sessionStorage.getItem('superadmin_token')) {
        await apiLogout();
      }
    } catch (error) {
      console.error('Logout API failed:', error);
    } finally {
      sessionStorage.removeItem('superadmin_token');
      sessionStorage.removeItem('superadmin_user');
      sessionStorage.removeItem('superadmin_roleName');
      setRole(ROLES.LOGIN);
      setIsSuperAdmin(false);
      setUser(null);
      setPermissions({});
      setIsSuperOwner(false);
      setProfileLoading(false);
    }
  }, []);

  // ─── Load profile from backend ────────────────────────────────────────────
  const refreshProfile = useCallback(async () => {
    const token = sessionStorage.getItem('superadmin_token');
    if (!token) return;

    try {
      const res = await getProfile();
      if (res?.success && res?.data) {
        const adminData = res.data;

        setUser({
          id: adminData._id,
          name: adminData.name,
          email: adminData.email,
          phoneNumber: adminData.phoneNumber,
          role: adminData.role,
          isActive: adminData.isActive,
        });

        const superOwner = !!adminData.isSuperOwner;
        setIsSuperOwner(superOwner);

        if (superOwner) {
          // Super owner has unrestricted access
          setPermissions({ __superOwner: true });
        } else {
          const rolePermissions = adminData.role?.permissions || {};
          setPermissions(rolePermissions);
        }
      } else {
        await logout();
      }
    } catch (error) {
      const status = error?.response?.status;
      const code = error?.response?.data?.code;
      if (status === 403 || code === 'USER_INACTIVE' || code === 'ROLE_INACTIVE') {
        await logout();
      } else if (status === 401) {
        await logout();
      }
    } finally {
      setProfileLoading(false);
    }
  }, [logout]);

  // ─── Fetch profile on mount if token exists ────────────────────────────────
  useEffect(() => {
    if (sessionStorage.getItem('superadmin_token')) {
      refreshProfile();
    }
  }, [refreshProfile]);

  // ─── Re-fetch profile on window focus / tab visibility ────────────────────
  useEffect(() => {
    const handleFocus = () => {
      if (sessionStorage.getItem('superadmin_token')) {
        refreshProfile();
      }
    };
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') handleFocus();
    };
    window.addEventListener('focus', handleFocus);
    document.addEventListener('visibilitychange', handleVisibility);
    return () => {
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [refreshProfile]);

  // ─── Login ─────────────────────────────────────────────────────────────────
  const login = useCallback(() => {
    setRole(ROLES.SUPER_ADMIN);
    setIsSuperAdmin(true);
    refreshProfile();
  }, [refreshProfile]);

  // ─── Permission helper ─────────────────────────────────────────────────────
  // hasPermission('restaurants', 'view') → true/false
  // actions: 'view' | 'add' | 'edit' | 'delete'
  const hasPermission = useCallback((module, action = 'view') => {
    if (!sessionStorage.getItem('superadmin_token')) return false;
    if (isSuperOwner || permissions.__superOwner) return true;
    const modulePerms = permissions[module];
    if (!modulePerms) return false;
    return !!modulePerms[action];
  }, [isSuperOwner, permissions]);

  const isAuthenticated = role === ROLES.SUPER_ADMIN;

  const value = {
    role,
    setRole,
    isSuperAdmin,
    setIsSuperAdmin,
    user,
    permissions,
    isSuperOwner,
    profileLoading,
    login,
    logout,
    refreshProfile,
    hasPermission,
    isAuthenticated,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
