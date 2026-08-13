import React from 'react';
import { ThemeProvider } from '../contexts/ThemeContext';
import { AuthProvider } from '../contexts/AuthContext';
import { NotificationProvider } from '../contexts/NotificationContext';

export default function Providers({ children }) {
  return (
    <ThemeProvider>
      <NotificationProvider>
        <AuthProvider>
          {children}
        </AuthProvider>
      </NotificationProvider>
    </ThemeProvider>
  );
}
