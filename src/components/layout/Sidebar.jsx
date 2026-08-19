import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { ChevronDown, Users, UtensilsCrossed, Settings } from 'lucide-react';
import { SUPER_ADMIN_NAVIGATION } from '../../constants/navigation';
import { ROUTES } from '../../constants/routes';

export default function Sidebar({ isCollapsed, isSuperAdmin, restaurantDetails }) {
  const [usersDropdownOpen, setUsersDropdownOpen] = useState(false);
  const location = useLocation();

  const isUsersRolesActive = location.pathname.includes('/users') || location.pathname.includes('/roles');

  const clearActionStates = () => {
    localStorage.removeItem('serviq_editingRestId');
    localStorage.removeItem('serviq_viewingRestId');
    localStorage.removeItem('serviq_showAddRestModal');
    localStorage.removeItem('serviq_editingAdminId');
    localStorage.removeItem('serviq_showAddAdminModal');
    localStorage.removeItem('serviq_editingRoleId');
    localStorage.removeItem('serviq_editingPlanId');
    localStorage.removeItem('serviq_viewingPerfRestId');

    sessionStorage.removeItem('serviq_billing_action');
    sessionStorage.removeItem('serviq_restaurants_action');
    sessionStorage.removeItem('serviq_plans_action');
    sessionStorage.removeItem('serviq_subscriptions_action');
    sessionStorage.removeItem('serviq_leads_action');
    sessionStorage.removeItem('serviq_tickets_action');
    sessionStorage.removeItem('serviq_notifications_action');
    sessionStorage.removeItem('serviq_users_action');

    window.dispatchEvent(new CustomEvent('reset_module_view', { detail: { tab: 'all' } }));
  };

  return (
    <div className={`sidebar ${isCollapsed ? 'collapsed' : ''}`}>
      <div>
        <ul className="sidebar-nav">
              {SUPER_ADMIN_NAVIGATION.map((item, index) => (
                <li key={index}>
                  <NavLink 
                    to={item.path} 
                    onClick={clearActionStates}
                    className={({ isActive }) => `sidebar-item ${isActive ? 'active' : ''}`}
                  >
                    <item.icon style={{ width: '18px', height: '18px' }} /> <span>{item.label}</span>
                  </NavLink>
                </li>
              ))}

              {/* User & Role Management Dropdown Menu */}
              <li style={{ listStyleType: 'none', padding: 0, margin: 0 }}>
                <div
                  className="sidebar-item"
                  onClick={() => !isCollapsed && setUsersDropdownOpen(!usersDropdownOpen)}
                  style={{
                    display: 'flex',
                    justifyContent: isCollapsed ? 'center' : 'space-between',
                    alignItems: 'center',
                    color: isUsersRolesActive ? '#ffffff' : '#0f172a',
                    background: isUsersRolesActive ? '#ea580c' : 'transparent',
                    cursor: 'pointer'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <Users style={{ width: '18px', height: '18px' }} />
                    {!isCollapsed && <span>User & Role</span>}
                  </div>
                  {!isCollapsed && (
                    <ChevronDown
                      style={{
                        width: '14px',
                        height: '14px',
                        transition: 'transform 0.2s',
                        transform: usersDropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)'
                      }}
                    />
                  )}
                </div>

                {usersDropdownOpen && !isCollapsed && (
                  <div style={{
                    paddingLeft: '16px',
                    marginTop: '4px',
                    marginBottom: '4px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '4px',
                    borderLeft: '1px solid rgba(255, 255, 255, 0.1)',
                    marginLeft: '24px'
                  }}>
                    <NavLink
                      to={ROUTES.SUPER_ADMIN.USERS}
                      onClick={clearActionStates}
                      className={({ isActive }) => `sidebar-item ${isActive ? 'active' : ''}`}
                      style={({ isActive }) => ({
                        padding: '8px 12px',
                        fontSize: '0.85rem',
                        fontWeight: isActive ? '600' : '500'
                      })}
                    >
                      Users
                    </NavLink>
                    <NavLink
                      to={ROUTES.SUPER_ADMIN.ROLES}
                      onClick={clearActionStates}
                      className={({ isActive }) => `sidebar-item ${isActive ? 'active' : ''}`}
                      style={({ isActive }) => ({
                        padding: '8px 12px',
                        fontSize: '0.85rem',
                        fontWeight: isActive ? '600' : '500'
                      })}
                    >
                      Roles & Permissions
                    </NavLink>
                  </div>
                )}
              </li>

              <li>
                <NavLink 
                  to={ROUTES.SUPER_ADMIN.SETTINGS} 
                  onClick={clearActionStates}
                  className={({ isActive }) => `sidebar-item ${isActive ? 'active' : ''}`}
                >
                  <Settings style={{ width: '18px', height: '18px' }} /> <span>System Settings</span>
                </NavLink>
              </li>
        </ul>
      </div>
    </div>
  );
}
