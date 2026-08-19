import React, { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import GlobalHeader from '../components/layout/GlobalHeader';
import Sidebar from '../components/layout/Sidebar';
import { useAuth } from '../contexts/AuthContext';
import { ROUTES } from '../constants/routes';

export default function SuperAdminLayout() {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const { isSuperAdmin } = useAuth();
  const location = useLocation();

  const getPageTitle = () => {
    const path = location.pathname;
    if (path.includes('/dashboard')) return 'Dashboard';
    if (path.includes('/coupons')) return 'Coupons Management';
    if (path.includes('/restaurants')) return 'Restaurant Management';
    if (path.includes('/plans')) return 'Plans Management';
    if (path.includes('/subscriptions')) return 'Subscription Management';
    if (path.includes('/billing')) return 'Billing & Payments';
    if (path.includes('/leads')) return 'Leads/CRM';
    if (path.includes('/tickets')) return 'Support Ticket Management';
    if (path.includes('/notifications')) return 'Notifications';
    if (path.includes('/reports')) return 'Reports & Analytics';
    if (path.includes('/users')) return 'Platform Admins';
    if (path.includes('/roles')) return 'Roles & Permissions';
    if (path.includes('/settings')) return 'System Settings';
    if (path.includes('/profile')) return 'My Profile';
    return 'Super Admin';
  };

  const title = getPageTitle();
  
  // Format system date and time
  const [currentDateTime, setCurrentDateTime] = useState('');
  useEffect(() => {
    const formatDateTime = () => {
      const now = new Date();
      const day = String(now.getDate()).padStart(2, '0');
      const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
      const month = monthNames[now.getMonth()];
      const year = now.getFullYear();
      let hours = now.getHours();
      const minutes = String(now.getMinutes()).padStart(2, '0');
      const seconds = String(now.getSeconds()).padStart(2, '0');
      const ampm = hours >= 12 ? 'PM' : 'AM';
      hours = hours % 12 || 12;
      const hoursStr = String(hours).padStart(2, '0');
      return `${day}-${month}-${year} ${hoursStr}:${minutes}:${seconds} ${ampm}`;
    };
    setCurrentDateTime(formatDateTime());
    const timer = setInterval(() => setCurrentDateTime(formatDateTime()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Removed time subtext per original file which removed it "per user request"
  const subtext = ''; 

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', minHeight: '100vh', overflow: 'hidden' }}>
      <GlobalHeader 
        isSidebarCollapsed={isSidebarCollapsed} 
        setIsSidebarCollapsed={setIsSidebarCollapsed} 
      />
      
      <div className="app-container" style={{ height: 'auto', flex: 1 }}>
        <Sidebar 
          isCollapsed={isSidebarCollapsed} 
          isSuperAdmin={isSuperAdmin} 
        />
        
        <div className="workspace" style={{ background: 'rgb(226 232 239 / 26%)' }}>
          <div className="workspace-header" style={{ background: 'var(--bg-card)', padding: '16px 30px', borderBottom: '3px solid #fbfbfb', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div className="header-title">
              <h1 style={{ textTransform: 'capitalize', margin: 0 }}>{title}</h1>
              {subtext && <p style={{ margin: 0 }}>{subtext}</p>}
            </div>
          </div>
          
          <div style={{ padding: '24px 30px', flex: 1, overflowY: 'auto' }}>
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  );
}
