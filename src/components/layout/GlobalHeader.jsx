import React, { useState, useEffect, useRef } from 'react';
import { Menu, LogOut, Bell, UserCheck } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../../constants/routes';

export default function GlobalHeader({ isSidebarCollapsed, setIsSidebarCollapsed }) {
  const { role, isSuperAdmin, logout } = useAuth();
  const navigate = useNavigate();
  const [adminProfileDropdownOpen, setAdminProfileDropdownOpen] = useState(false);
  const adminProfileRef = useRef(null);
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

  useEffect(() => {
    function handleClickOutside(event) {
      if (adminProfileRef.current && !adminProfileRef.current.contains(event.target)) {
        setAdminProfileDropdownOpen(false);
      }
    }
    if (adminProfileDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [adminProfileDropdownOpen]);

  const handleLogout = () => {
    logout();
    navigate(ROUTES.LOGIN);
    setAdminProfileDropdownOpen(false);
  };

  return (
    <div className="simulator-bar" style={{ display: 'flex', width: '100%', alignItems: 'center' }}>
      
      {/* Logo Container aligned with Sidebar width */}
      <div style={{
        width: isSidebarCollapsed ? '70px' : '250px',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRight: '1px solid var(--border-color)',
        transition: 'width var(--transition-normal)',
        flexShrink: 0,
        boxSizing: 'border-box'
      }}>
        <img src="/serviqlogo.png" alt="Serviq Logo" style={{ height: '48px', objectFit: 'contain', filter: 'invert(1) hue-rotate(180deg)' }} />
      </div>

      {/* Content Container spanning the rest of the header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flex: 1,
        padding: '0 24px',
        height: '100%'
      }}>
        <div>
          {role === 'admin' && (
            <button
              onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
              style={{
                background: 'transparent',
                cursor: 'pointer',
                color: 'var(--text-main)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '8px',
                borderRadius: '4px',
                border: '1px solid var(--border-color)',
                transition: 'all 0.2s'
              }}
              title="Toggle Sidebar"
            >
              <Menu style={{ width: '20px', height: '20px' }} />
            </button>
          )}
        </div>

        {/* Theme and tools */}
        <div className="simulator-actions" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {role === 'customer' ? (
            <button
              className="theme-toggle-btn"
              onClick={handleLogout}
              title="Exit Guest Mode"
              style={{
                background: 'rgba(239, 68, 68, 0.12)',
                color: '#ef4444',
                border: '1px solid rgba(239, 68, 68, 0.2)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '6px 14px',
                borderRadius: '20px',
                fontWeight: '700',
                fontSize: '0.8rem',
                gap: '6px'
              }}
            >
              <LogOut style={{ width: '14px', height: '14px' }} /> Exit Guest Mode
            </button>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              {/* Live Date & Time */}
              {isSuperAdmin && currentDateTime && (
                <span style={{
                  fontSize: '19px',
                  fontWeight: '600',
                  color: '#0f172a',
                  letterSpacing: '0.01em',
                  fontFamily: 'monospace',
                  userSelect: 'none',
                  whiteSpace: 'nowrap'
                }}>
                  {currentDateTime}
                </span>
              )}
              <button className="header-profile-btn" style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }} title="Notifications">
                <Bell style={{ width: '18px', height: '18px' }} />
                <span style={{ position: 'absolute', top: '4px', right: '4px', width: '8px', height: '8px', background: '#ef4444', borderRadius: '50%', border: '2px solid var(--bg-app)' }}></span>
              </button>

              <div ref={adminProfileRef} style={{ position: 'relative' }}>
                <button className="header-profile-btn" onClick={() => setAdminProfileDropdownOpen(!adminProfileDropdownOpen)} title="Admin Profile">
                  <UserCheck style={{ width: '18px', height: '18px' }} />
                </button>
                {adminProfileDropdownOpen && (
                  <div className="animate-fade-in" style={{ position: 'absolute', top: '100%', right: 0, marginTop: '8px', background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '8px', boxShadow: 'var(--shadow-md)', zIndex: 100, minWidth: '160px', overflow: 'hidden', padding: '4px' }}>
                    {!isSuperAdmin && (
                      <div onClick={() => { navigate(ROUTES.ADMIN.SETTINGS); setAdminProfileDropdownOpen(false); }} style={{ padding: '10px 16px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', color: 'var(--text-main)', borderRadius: '6px' }} onMouseOver={(e) => e.currentTarget.style.background = 'var(--bg-hover)'} onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}>
                        <UserCheck style={{ width: '14px', height: '14px' }} /> Profile
                      </div>
                    )}
                    <div onClick={handleLogout} style={{ padding: '10px 16px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', color: '#ef4444', borderRadius: '6px' }} onMouseOver={(e) => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)'} onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}>
                      <LogOut style={{ width: '14px', height: '14px' }} /> Log Out
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
