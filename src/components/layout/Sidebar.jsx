import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { ChevronDown, Users, UtensilsCrossed, Settings } from 'lucide-react';
import { SUPER_ADMIN_NAVIGATION } from '../../constants/navigation';
import { ROUTES } from '../../constants/routes';
import { useAuth } from '../../contexts/AuthContext';

// Map nav item label → module permission key
const NAV_MODULE_MAP = {
  'Dashboard':          'dashboard',
  'Coupons':            'coupons',
  'Restaurant':         'restaurants',
  'Plans':              'plans',
  'Subscription':       'subscriptions',
  'Billing & Payments': 'billing',
  'Leads/CRM':          'leads',
  'Support Ticket':     'tickets',
  'Notifications':      'notifications',
  'Reports & Analytics':'reports',
};

export default function Sidebar({ isCollapsed, restaurantDetails }) {
  const [usersDropdownOpen, setUsersDropdownOpen] = useState(false);
  const location = useLocation();
  const { hasPermission, isSuperOwner } = useAuth();

  const isUsersRolesActive = location.pathname.includes('/users') || location.pathname.includes('/roles');

  // Can show Users sub-link or Roles sub-link
  const canViewUsers = isSuperOwner || hasPermission('adminUsers', 'view');
  const canViewRoles = isSuperOwner || hasPermission('roles', 'view');
  const canViewSettings = isSuperOwner || hasPermission('settings', 'view');
  const showUserRoleMenu = canViewUsers || canViewRoles;

  const clearActionStates = () => {
    window.dispatchEvent(new CustomEvent('reset_module_view', { detail: { tab: 'all' } }));
  };

  return (
    <div className={`sidebar ${isCollapsed ? 'collapsed' : ''}`}>
      <div>
        <ul className="sidebar-nav">
          {SUPER_ADMIN_NAVIGATION.slice(0, 5).map((item, index) => {
            const moduleKey = NAV_MODULE_MAP[item.label];
            // If we have a module mapping, check permission; otherwise always show
            const canView = !moduleKey || isSuperOwner || hasPermission(moduleKey, 'view');
            if (!canView) return null;
            return (
              <li key={`top-${index}`}>
                <NavLink
                  to={item.path}
                  onClick={clearActionStates}
                  className={({ isActive }) => `sidebar-item ${isActive ? 'active' : ''}`}
                >
                  <item.icon style={{ width: '18px', height: '18px' }} /> <span>{item.label}</span>
                </NavLink>
              </li>
            );
          })}

          {/* User & Role Management Dropdown — only if user can view at least one sub-item */}
          {showUserRoleMenu && (
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
                  {canViewUsers && (
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
                  )}
                  {canViewRoles && (
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
                  )}
                </div>
              )}
            </li>
          )}

          {SUPER_ADMIN_NAVIGATION.slice(5).map((item, index) => {
            const moduleKey = NAV_MODULE_MAP[item.label];
            // If we have a module mapping, check permission; otherwise always show
            const canView = !moduleKey || isSuperOwner || hasPermission(moduleKey, 'view');
            if (!canView) return null;
            return (
              <li key={`bottom-${index}`}>
                <NavLink
                  to={item.path}
                  onClick={clearActionStates}
                  className={({ isActive }) => `sidebar-item ${isActive ? 'active' : ''}`}
                >
                  <item.icon style={{ width: '18px', height: '18px' }} /> <span>{item.label}</span>
                </NavLink>
              </li>
            );
          })}

          {/* System Settings */}
          {canViewSettings && (
            <li>
              <NavLink
                to={ROUTES.SUPER_ADMIN.SETTINGS}
                onClick={clearActionStates}
                className={({ isActive }) => `sidebar-item ${isActive ? 'active' : ''}`}
              >
                <Settings style={{ width: '18px', height: '18px' }} /> <span>System Settings</span>
              </NavLink>
            </li>
          )}
        </ul>
      </div>
    </div>
  );
}
