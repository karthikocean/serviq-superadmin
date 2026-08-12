import React, { createContext, useContext, useState, useEffect } from 'react';
import { ROLES } from '../constants/roles';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const savedSession = (() => {
    try {
      const item = localStorage.getItem('serviq_session');
      return item ? JSON.parse(item) : null;
    } catch (e) {
      return null;
    }
  })();

  const [role, setRole] = useState(savedSession?.role || ROLES.LOGIN);
  const [isSuperAdmin, setIsSuperAdmin] = useState(savedSession?.isSuperAdmin ?? false);

  useEffect(() => {
    if (role && role !== ROLES.LOGIN) {
      localStorage.setItem('serviq_session', JSON.stringify({
        role,
        isSuperAdmin
      }));
    } else {
      localStorage.removeItem('serviq_session');
    }
  }, [role, isSuperAdmin]);

  const login = () => {
    setRole(ROLES.SUPER_ADMIN);
    setIsSuperAdmin(true);
  };

  const logout = () => {
    setRole(ROLES.LOGIN);
    setIsSuperAdmin(false);
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
