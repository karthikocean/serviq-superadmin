import React, { createContext, useContext, useState, useEffect } from 'react';
import { ROLES } from '../constants/roles';
import { logout as apiLogout } from '../services/authService';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const savedToken = localStorage.getItem('superadmin_token');
  
  const [role, setRole] = useState(savedToken ? ROLES.SUPER_ADMIN : ROLES.LOGIN);
  const [isSuperAdmin, setIsSuperAdmin] = useState(!!savedToken);

  const login = () => {
    setRole(ROLES.SUPER_ADMIN);
    setIsSuperAdmin(true);
  };

  const logout = async () => {
    try {
      if (localStorage.getItem("superadmin_token")) {
        await apiLogout();
      }
    } catch (error) {
      console.error("Logout API failed:", error);
    } finally {
      localStorage.removeItem("superadmin_token");
      localStorage.removeItem("superadmin_user");
      localStorage.removeItem("superadmin_roleName");
      setRole(ROLES.LOGIN);
      setIsSuperAdmin(false);
    }
  };

  const isAuthenticated = role === ROLES.SUPER_ADMIN;

  const value = {
    role,
    setRole,
    isSuperAdmin,
    setIsSuperAdmin,
    login,
    logout,
    isAuthenticated
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
