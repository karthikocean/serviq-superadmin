import React, { useState, useEffect } from 'react';
import { useAppState, DEFAULT_ROLES } from '../config/AppContext';
import { Badge } from '../components/Badge';
import { Modal } from '../components/Modal';

import OverviewPanel from '../components/OverviewPanel';
import OrdersPanel from '../components/OrdersPanel';
import MenuPanel from '../components/MenuPanel';
import BillingPanel from '../components/BillingPanel';
import TablesPanel from '../components/TablesPanel';
import WaiterListPanel from '../components/WaiterListPanel';
import WaiterReportsPanel from '../components/WaiterReportsPanel';
import KitchenListPanel from '../components/KitchenListPanel';
import KitchenReportsPanel from '../components/KitchenReportsPanel';
import SettingsPanel from '../components/SettingsPanel';
import ReportsPanel from '../components/ReportsPanel';
import QRManagementPanel from '../components/QRManagementPanel';
import UserListPanel from '../components/UserListPanel';
import RolesPermissionsPanel from '../components/RolesPermissionsPanel';


const EyeIcon = ({ size = 18, color = 'currentColor' }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'inline-block', verticalAlign: 'middle' }}>
    <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

const PencilIcon = ({ size = 18, color = 'currentColor' }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'inline-block', verticalAlign: 'middle' }}>
    <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
    <path d="m15 5 4 4" />
  </svg>
);

const TrashIcon = ({ size = 18, color = 'currentColor' }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'inline-block', verticalAlign: 'middle' }}>
    <path d="M3 6h18" />
    <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
    <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
    <line x1="10" x2="10" y1="11" y2="17" />
    <line x1="14" x2="14" y1="11" y2="17" />
  </svg>
);

const DollarIcon = ({ size = 18, color = 'currentColor' }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'inline-block', verticalAlign: 'middle' }}>
    <line x1="12" y1="1" x2="12" y2="23" />
    <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
  </svg>
);

const InfoIcon = ({ size = 18, color = 'currentColor' }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'inline-block', verticalAlign: 'middle' }}>
    <circle cx="12" cy="12" r="10" />
    <path d="M12 16v-4" />
    <path d="M12 8h.01" />
  </svg>
);

const DashboardIcon = ({ size = 18, color = 'currentColor' }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: '8px' }}>
    <rect x="3" y="3" width="7" height="9" />
    <rect x="14" y="3" width="7" height="5" />
    <rect x="14" y="12" width="7" height="9" />
    <rect x="3" y="16" width="7" height="5" />
  </svg>
);

const TableIcon = ({ size = 18, color = 'currentColor' }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: '8px' }}>
    <path d="M12 22V12" />
    <path d="M5 12h14" />
    <path d="M5 10V4h14v6" />
    <path d="M19 12v10" />
    <path d="M5 12v10" />
  </svg>
);

const QrCodeIcon = ({ size = 18, color = 'currentColor' }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: '8px' }}>
    <rect x="3" y="3" width="6" height="6" rx="1" />
    <rect x="15" y="3" width="6" height="6" rx="1" />
    <rect x="3" y="15" width="6" height="6" rx="1" />
    <rect x="15" y="15" width="6" height="6" rx="1" />
    <path d="M9 9h2v2H9zM13 13h2v2h-2zM9 13h2v2H9zM13 9h2v2h-2z" />
  </svg>
);

const MenuIcon = ({ size = 18, color = 'currentColor' }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: '8px' }}>
    <path d="M3 12h18" />
    <path d="M3 6h18" />
    <path d="M3 18h18" />
  </svg>
);

const OrderIcon = ({ size = 18, color = 'currentColor' }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: '8px' }}>
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
    <line x1="16" y1="13" x2="8" y2="13" />
    <line x1="16" y1="17" x2="8" y2="17" />
  </svg>
);

const WaiterIcon = ({ size = 18, color = 'currentColor' }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: '8px' }}>
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);

const KitchenIcon = ({ size = 18, color = 'currentColor', style }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: '12px', ...style }}>
    <path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2" />
    <path d="M7 2v20" />
    <path d="M21 15V2v0a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Z" />
    <path d="M19 15v7" />
  </svg>
);

const ReportIcon = ({ size = 18, color = 'currentColor' }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: '8px' }}>
    <line x1="18" y1="20" x2="18" y2="10" />
    <line x1="12" y1="20" x2="12" y2="4" />
    <line x1="6" y1="20" x2="6" y2="14" />
  </svg>
);

const BillingIcon = ({ size = 18, color = 'currentColor' }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: '8px' }}>
    <rect x="2" y="4" width="20" height="16" rx="2" />
    <line x1="12" y1="10" x2="12" y2="14" />
    <path d="M15 8H9a2 2 0 0 0 0 4h6a2 2 0 0 1 0 4H9" />
  </svg>
);

const SettingsIcon = ({ size = 18, color = 'currentColor' }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: '8px' }}>
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
  </svg>
);

const RolesIcon = ({ size = 18, color = 'currentColor' }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: '8px', flexShrink: 0 }}>
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  </svg>
);

const ChevronDownIcon = ({ size = 12, color = 'currentColor', className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <polyline points="6 9 12 15 18 9" />
  </svg>
);



export default function Admin() {
  const {
    currentUser,
    activeRestaurant,
    isImpersonating,
    exitImpersonation,
    logout,
    saveRestaurantSettings,
    addMenuItem,
    updateMenuItem,
    deleteMenuItem,
    addDiningTable,
    updateDiningTableSeats,
    updateDiningTable,
    assignTablesToWaiter,
    deleteDiningTable,
    generateQrCode,
    assignQrCode,
    revokeQrCode,
    deleteQrCode,
    addStaff,
    updateStaff,
    deleteStaff,
    updateKitchenPassword,
    updateOrderStatus,
    updateOrderItemStatus,
    upgradeRestaurantPlan,
    assignWaiterToOrder,
    deleteOrder,
    updateOrder,
    markBillAsPaid,
    darkMode,
    setDarkMode,
    accentColor,
    setAccentColor,
    qrCustomizer,
    setQrCustomizer,
    updateRolePermissions,
    addNewRole,
    updateMenuCategories
  } = useAppState();

  const [activeTab, setActiveTab] = useState('overview');

  const tabTitles = {
    'overview': 'Dashboard Overview',
    'orders': 'Incoming Orders',
    'menu': 'Menu Management',
    'billing': 'Billing & Settlement',
    'tables': 'Dining Tables & QR Management',
    'waiter-list': 'Waiter Management',
    'waiter-reports': 'Waiter Performance Reports',
    'kitchen-list': 'Kitchen Management',
    'kitchen-reports': 'Kitchen KOT Reports',
    'reports': 'Business Reports & Analytics',
    'roles-permissions': 'Roles & Permissions',
    'users': 'User Management',
    'settings': 'Store Configurations',
    'qr-code-config': 'QR Code Management'
  };
  const [dateTimeStr, setDateTimeStr] = useState('');

  // 1. Dashboard states
  // 2. Incoming Orders states
  const [orderFilter, setOrderFilter] = useState('All'); // All, New, Preparing, Ready, Done
  const [selectedWaiterFilter, setSelectedWaiterFilter] = useState('All Waiters');
  const [waiterDropdownOpen, setWaiterDropdownOpen] = useState(false);
  const [activeViewOrder, setActiveViewOrder] = useState(null);
  const [activeEditOrder, setActiveEditOrder] = useState(null);
  const [editOrderForm, setEditOrderForm] = useState({ table: '', notes: '', waiter: 'Unassigned' });

  // 3. Menu Management states
  const [menuCategory, setMenuCategory] = useState('All Items');
  const [menuSearch, setMenuSearch] = useState('');
  const [menuSort, setMenuSort] = useState('name');
  const [activePage, setActivePage] = useState(null); // 'menu-form' | 'table-form' | 'staff-form' | 'kitchen-form'
  const [menuForm, setMenuForm] = useState({ id: '', name: '', desc: '', price: '', category: 'Starters', image: '' });

  // 4. Billing Panel states
  const [selectedBillingTable, setSelectedBillingTable] = useState('');
  const [billingPaymentMethod, setBillingPaymentMethod] = useState('UPI');

  // 5. Tables & QR Management states
  const [selectedTableId, setSelectedTableId] = useState('');
  const [addTableForm, setAddTableForm] = useState({ id: '', seats: 4 });
  const [showAssignTablesModal, setShowAssignTablesModal] = useState(false);
  const [modalWaiterId, setModalWaiterId] = useState('');
  const [modalTableIds, setModalTableIds] = useState([]);
  const [modalCoverWaiterId, setModalCoverWaiterId] = useState('');
  const [kdsFilter, setKdsFilter] = useState('All');

  // 7. Reports states
  const [reportsSubTab, setReportsSubTab] = useState('waiter');
  const [waiterFilterDateStart, setWaiterFilterDateStart] = useState('');
  const [waiterFilterDateEnd, setWaiterFilterDateEnd] = useState('');
  const [waiterFilterStaff, setWaiterFilterStaff] = useState('All');
  const [waiterFilterTable, setWaiterFilterTable] = useState('All');
  const [waiterFilterSource, setWaiterFilterSource] = useState('All');
  const [waiterFilterPaymentMode, setWaiterFilterPaymentMode] = useState('All');
  const [waiterFilterPaymentStatus, setWaiterFilterPaymentStatus] = useState('All');
  const [waiterFilterOrderStatus, setWaiterFilterOrderStatus] = useState('All');
  const [kitchenFilterDateStart, setKitchenFilterDateStart] = useState('');
  const [kitchenFilterDateEnd, setKitchenFilterDateEnd] = useState('');
  const [kitchenFilterStaff, setKitchenFilterStaff] = useState('All');
  const [kitchenFilterDish, setKitchenFilterDish] = useState('All');
  const [kitchenFilterPriority, setKitchenFilterPriority] = useState('All');
  const [showWaiterTimelineModal, setShowWaiterTimelineModal] = useState(false);
  const [selectedWaiterTimeline, setSelectedWaiterTimeline] = useState(null);
  const [showOfflinePaymentModal, setShowOfflinePaymentModal] = useState(false);
  const [selectedPaymentOrder, setSelectedPaymentOrder] = useState(null);
  const [offlinePaymentType, setOfflinePaymentType] = useState('Cash');
  const [showKitchenTimelineModal, setShowKitchenTimelineModal] = useState(false);
  const [selectedKitchenTimeline, setSelectedKitchenTimeline] = useState(null);
  const [showKitchenDetailsModal, setShowKitchenDetailsModal] = useState(false);
  const [selectedKitchenDetails, setSelectedKitchenDetails] = useState(null);

  // 6. Staff states
  const [staffForm, setStaffForm] = useState({ id: '', name: '', role: 'Waiter', phone: '', email: '', password: '', status: 'On Duty' });
  const [kitchenPasswordForm, setKitchenPasswordForm] = useState('');

  const pageTitle = {
    'menu-form': menuForm.id ? ' Edit Menu Item' : ' Add New Menu Item',
    'table-form': ' Add Dining Table',
    'staff-form': staffForm.id ? ' Edit Staff Details' : 'Register New Staff',
    'kitchen-form': ' Kitchen Shared Credentials',
    'order-edit-form': ' Edit Order Details',
    'order-view': activeViewOrder ? `Order Details - #ORD-${activeViewOrder.id}` : 'Order Details',
  };

  const sty = {
    pageInlineHeader: { display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '24px', paddingBottom: '16px', borderBottom: '2px solid var(--primary-light)' },
    pageBackBtn: { background: '#fff', border: '1.5px solid var(--border)', borderRadius: '10px', width: '38px', height: '38px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: '16px', transition: 'all 0.2s', flexShrink: 0 },
    pageCard: { background: '#fff', borderRadius: '16px', padding: '32px', border: '1px solid var(--border)', boxShadow: '0 4px 20px rgba(0,0,0,0.06)' },
    formGrid2: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '16px' },
  };

  // 7. Settings states
  const [settingsForm, setSettingsForm] = useState({
    name: '',
    tagline: '',
    currency: '₹',
    tablesCount: 5,
    taxRate: 5,
    serviceChargeRate: 0,
    darkMode: false,
    logo: '',
    banner: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    gstNumber: '',
    openingTime: '08:00',
    closingTime: '22:00',
    selfService: true,
    minOrderAmount: 0
  });

  // Sidebar Dropdown states
  const [sidebarWaiterOpen, setSidebarWaiterOpen] = useState(false);
  const [sidebarKitchenOpen, setSidebarKitchenOpen] = useState(false);
  const [sidebarUsersOpen, setSidebarUsersOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);

  // Roles & Permissions state
  const [selectedRole, setSelectedRole] = useState('Waiter');
  const [customRoleName, setCustomRoleName] = useState('');
  const [editingPermissions, setEditingPermissions] = useState(null);

  const rolesConfig = activeRestaurant.roles || DEFAULT_ROLES;
  useEffect(() => {
    if (selectedRole && rolesConfig[selectedRole]) {
      setEditingPermissions(JSON.parse(JSON.stringify(rolesConfig[selectedRole].permissions)));
    }
  }, [selectedRole, activeRestaurant]);

  // Setup Clock
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const options = { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' };
      setDateTimeStr(now.toLocaleDateString('en-US', options));
    };
    updateTime();
    const interval = setInterval(updateTime, 60000);
    return () => clearInterval(interval);
  }, []);

  // Sync settings form when active restaurant loads
  useEffect(() => {
    if (activeRestaurant) {
      setSettingsForm({
        name: activeRestaurant.name || '',
        tagline: activeRestaurant.settings?.tagline || '',
        currency: activeRestaurant.settings?.currency || '₹',
        tablesCount: activeRestaurant.settings?.tablesCount || 5,
        taxRate: parseFloat((activeRestaurant.settings?.taxRate * 100 * 2).toFixed(1)) || 5, // Split tax representation
        serviceChargeRate: parseFloat((activeRestaurant.settings?.serviceChargeRate * 100).toFixed(1)) || 0,
        darkMode: darkMode,
        logo: activeRestaurant.settings?.logo || activeRestaurant.logo || '',
        banner: activeRestaurant.settings?.banner || activeRestaurant.banner || '',
        phone: activeRestaurant.settings?.phone || activeRestaurant.phone || '',
        address: activeRestaurant.settings?.address || activeRestaurant.address || '',
        city: activeRestaurant.settings?.city || activeRestaurant.city || '',
        state: activeRestaurant.settings?.state || activeRestaurant.state || '',
        gstNumber: activeRestaurant.settings?.gstNumber || activeRestaurant.gstNumber || '',
        openingTime: activeRestaurant.settings?.openingTime || activeRestaurant.openingTime || '08:00',
        closingTime: activeRestaurant.settings?.closingTime || activeRestaurant.closingTime || '22:00',
        selfService: activeRestaurant.settings?.selfService !== undefined ? activeRestaurant.settings?.selfService : true,
        minOrderAmount: activeRestaurant.settings?.minOrderAmount || 0
      });

      // Default select first table in Tables Page
      if (activeRestaurant.tables?.length > 0 && !selectedTableId) {
        setSelectedTableId(activeRestaurant.tables[0].id);
      }

      // Default select first billing table
      if (activeRestaurant.billingData?.length > 0 && !selectedBillingTable) {
        setSelectedBillingTable(activeRestaurant.billingData[0].table);
      }
    }
  }, [activeRestaurant, darkMode]);

  if (!activeRestaurant) {
    return <div style={{ padding: '40px', textAlign: 'center' }}>No active restaurant loaded. Please log in again.</div>;
  }

  const { name, plan, tables = [], orders = [], menu = [], staff = [], billingData = [], kitchenLogin = { email: '', password: '' } } = activeRestaurant;

  // Filter sidebar based on role
  const role = currentUser?.role || 'Waiter';
  const hasPermission = (moduleName, action = 'view') => {
    if (role === 'Admin') return true;
    const rolesConfig = activeRestaurant.roles || DEFAULT_ROLES;
    const userRoleConfig = rolesConfig[role] || DEFAULT_ROLES[role] || { permissions: {} };
    const modulePermissions = userRoleConfig.permissions?.[moduleName] || {};
    return !!modulePermissions[action];
  };

  const isTabAllowed = (tab) => {
    if (role === 'Admin') return true;

    let moduleName = tab;
    if (tab === 'qr-code-config') moduleName = 'tables';
    if (tab === 'waiter-list' || tab === 'waiter-reports') moduleName = 'waiter';
    if (tab === 'kitchen-list' || tab === 'kitchen-reports') moduleName = 'kitchen';
    if (tab === 'users') moduleName = 'users';
    if (tab === 'roles-permissions') moduleName = 'roles-permissions';

    if (role === 'Waiter' && tab === 'kitchen-list') {
      return ['Premium', 'Enterprise'].includes(plan) && hasPermission(moduleName, 'view');
    }

    return hasPermission(moduleName, 'view');
  };

  React.useEffect(() => {
    if (!isTabAllowed(activeTab)) {
      const tabsOrder = [
        'overview',
        'orders',
        'menu',
        'billing',
        'tables',
        'waiter-list',
        'waiter-reports',
        'kitchen-list',
        'kitchen-reports',
        'reports',
        'roles-permissions',
        'users',
        'settings'
      ];
      const allowedTab = tabsOrder.find(t => isTabAllowed(t));
      if (allowedTab) {
        setActiveTab(allowedTab);
      }
    }
  }, [role, activeRestaurant, activeTab]);

  const addMinutes = (timeStr, mins) => {
    if (!timeStr) return '';
    try {
      const match = timeStr.match(/^(\d+):(\d+)\s*(AM|PM)?$/i);
      if (!match) return timeStr;
      let hours = parseInt(match[1]);
      let minutes = parseInt(match[2]);
      const ampm = match[3];

      if (ampm) {
        if (ampm.toUpperCase() === 'PM' && hours < 12) hours += 12;
        if (ampm.toUpperCase() === 'AM' && hours === 12) hours = 0;
      }

      const date = new Date();
      date.setHours(hours, minutes + mins, 0, 0);

      let newHours = date.getHours();
      const newMinutes = String(date.getMinutes()).padStart(2, '0');

      if (ampm) {
        const newAmPm = newHours >= 12 ? 'PM' : 'AM';
        newHours = newHours % 12;
        if (newHours === 0) newHours = 12;
        return `${newHours}:${newMinutes} ${newAmPm}`;
      } else {
        return `${String(newHours).padStart(2, '0')}:${newMinutes}`;
      }
    } catch (e) {
      return timeStr;
    }
  };

  const getOrderDate = (ord) => {
    if (ord.date) return ord.date;
    const idNum = parseInt(ord.id) || 0;
    const offset = (847 - idNum) % 7;
    if (offset >= 0 && idNum >= 840) {
      const d = new Date(2026, 5, 10);
      d.setDate(d.getDate() - offset);
      return d.toISOString().split('T')[0];
    }
    return ord.date || new Date().toISOString().split('T')[0];
  };

  const getOrderPriority = (ord) => {
    if (ord.priority) return ord.priority;
    return ord.notes && (ord.notes.toLowerCase().includes('urgent') || ord.notes.toLowerCase().includes('priority')) ? 'Urgent' : 'Normal';
  };

  const getFilteredWaiterReports = () => {
    return orders.filter(ord => {
      const date = getOrderDate(ord);
      const waiter = ord.waiter || 'Unassigned';
      const table = ord.table || '';
      const source = ord.source || (parseInt(ord.id) % 2 === 0 ? 'Dine-In' : 'Website');
      const paymentMode = ord.paymentMode || (ord.billingStatus === 'paid' ? 'UPI' : 'Pending');
      const paymentStatus = ord.billingStatus || 'unpaid';
      const orderStatus = ord.status || 'new';

      if (waiterFilterDateStart && date < waiterFilterDateStart) return false;
      if (waiterFilterDateEnd && date > waiterFilterDateEnd) return false;
      if (waiterFilterStaff !== 'All' && waiter !== waiterFilterStaff) return false;
      if (waiterFilterTable !== 'All' && table !== waiterFilterTable) return false;
      if (waiterFilterSource !== 'All' && source !== waiterFilterSource) return false;
      if (waiterFilterPaymentMode !== 'All') {
        if (waiterFilterPaymentMode === 'Pending' && paymentMode !== 'Pending') return false;
        if (waiterFilterPaymentMode !== 'Pending' && paymentMode !== waiterFilterPaymentMode) return false;
      }
      if (waiterFilterPaymentStatus !== 'All' && paymentStatus.toLowerCase() !== waiterFilterPaymentStatus.toLowerCase()) return false;
      if (waiterFilterOrderStatus !== 'All' && orderStatus.toLowerCase() !== waiterFilterOrderStatus.toLowerCase()) return false;

      return true;
    });
  };

  const getFilteredKitchenReports = () => {
    return orders.filter(ord => {
      const date = getOrderDate(ord);
      const kitchenStaffName = ord.kitchenStaff || (parseInt(ord.id) % 2 === 0 ? 'Suresh Pillai' : 'Priya Patel');
      const priority = getOrderPriority(ord);

      if (kitchenFilterDateStart && date < kitchenFilterDateStart) return false;
      if (kitchenFilterDateEnd && date > kitchenFilterDateEnd) return false;
      if (kitchenFilterStaff !== 'All' && kitchenStaffName !== kitchenFilterStaff) return false;
      if (kitchenFilterDish !== 'All') {
        const hasDish = ord.items.some(item => item.name === kitchenFilterDish);
        if (!hasDish) return false;
      }
      if (kitchenFilterPriority !== 'All' && priority !== kitchenFilterPriority) return false;

      return true;
    });
  };

  const iconBtnStyle = {
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    border: 'none',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    padding: 0,
    transition: 'all 0.2s ease',
    position: 'relative',
    background: 'transparent',
  };

  const iconBtnViewStyle = {
    ...iconBtnStyle,
    color: '#475569',
    marginRight: '6px'
  };

  const iconBtnEditStyle = {
    ...iconBtnStyle,
    color: '#475569',
    marginRight: '6px'
  };

  const iconBtnDeleteStyle = {
    ...iconBtnStyle,
    color: '#ef4444'
  };

  const IconBtn = ({ icon, tooltip, style, onClick }) => {
    const isDelete = style?.color === '#ef4444';
    return (
      <button
        title={tooltip}
        style={style}
        onClick={onClick}
        onMouseEnter={e => {
          e.currentTarget.style.transform = 'scale(1.15)';
          e.currentTarget.style.backgroundColor = isDelete ? '#fef2f2' : '#f1f5f9';
          if (isDelete) {
            e.currentTarget.style.color = '#dc2626';
          } else {
            e.currentTarget.style.color = '#1e293b';
          }
        }}
        onMouseLeave={e => {
          e.currentTarget.style.transform = 'scale(1)';
          e.currentTarget.style.backgroundColor = 'transparent';
          e.currentTarget.style.color = style?.color;
        }}
      >
        {icon}
      </button>
    );
  };

  // KPIs
  const todayRevenue = orders
    .filter(o => o.billingStatus === 'paid')
    .reduce((sum, o) => sum + o.total, 0);

  const pendingOrdersCount = orders.filter(o => o.status === 'new').length;
  const preparingOrdersCount = orders.filter(o => o.status === 'preparing').length;
  const occupiedTablesCount = tables.filter(t => t.status === 'Occupied').length;

  const loadWaiterAssignments = (waiterId) => {
    setModalWaiterId(waiterId);
    if (waiterId) {
      const assignedTables = (activeRestaurant?.tables || []).filter(t => t.assignedWaiterId === waiterId);
      setModalTableIds(assignedTables.map(t => t.id));
      const firstTableWithCover = assignedTables.find(t => t.tempWaiterId);
      setModalCoverWaiterId(firstTableWithCover ? firstTableWithCover.tempWaiterId : '');
    } else {
      setModalTableIds([]);
      setModalCoverWaiterId('');
    }
  };

  const handleOpenAssignTablesModal = (waiterId) => {
    const waiters = (activeRestaurant?.staff || []).filter(s => s.role === 'Waiter');
    const targetId = waiterId || (waiters.length > 0 ? waiters[0].id : '');
    loadWaiterAssignments(targetId);
    setShowAssignTablesModal(true);
  };

  const handleSaveAssignments = () => {
    if (!modalWaiterId) return;
    assignTablesToWaiter(activeRestaurant.id, modalWaiterId, modalTableIds, modalCoverWaiterId);
    setShowAssignTablesModal(false);
  };

  const openAddStaffModal = (defaultRole = 'Waiter') => {
    setStaffForm({
      id: '',
      name: '',
      role: defaultRole,
      phone: '',
      email: '',
      password: '',
      status: 'On Duty'
    });
    setActivePage('staff-form');
  };

  const openEditStaffModal = (staffMember) => {
    setStaffForm({
      id: staffMember.id,
      name: staffMember.name,
      role: staffMember.role,
      phone: staffMember.phone || '',
      email: staffMember.email,
      password: staffMember.password,
      status: staffMember.status || 'On Duty'
    });
    setActivePage('staff-form');
  };

  const openKitchenModal = () => {
    setKitchenPasswordForm(kitchenLogin?.password || '');
    setActivePage('kitchen-form');
  };

  const openAddMenuModal = () => {
    if (!hasPermission('menu', 'add')) {
      alert('Action not allowed: You do not have permission to add menu items.');
      return;
    }
    setMenuForm({ id: '', name: '', desc: '', price: '', category: 'Starters', image: '' });
    setActivePage('menu-form');
  };

  const openEditMenuModal = (item) => {
    if (!hasPermission('menu', 'edit')) {
      alert('Action not allowed: You do not have permission to edit menu items.');
      return;
    }
    setMenuForm({
      id: item.id,
      name: item.name,
      desc: item.desc || '',
      price: item.price,
      category: item.category,
      image: item.image || ''
    });
    setActivePage('menu-form');
  };

  const handleDeleteMenu = (itemId) => {
    if (!hasPermission('menu', 'delete')) {
      alert('Action not allowed: You do not have permission to delete menu items.');
      return;
    }
    if (window.confirm('Are you sure you want to delete this menu item?')) {
      deleteMenuItem(activeRestaurant.id, itemId);
    }
  };

  const handleMenuSubmit = (e) => {
    e.preventDefault();
    const itemData = {
      name: menuForm.name,
      desc: menuForm.desc,
      price: parseFloat(menuForm.price),
      category: menuForm.category,
      image: menuForm.image,
      available: true,
      veg: true,
      bestseller: false
    };

    if (menuForm.id) {
      updateMenuItem(activeRestaurant.id, {
        ...itemData,
        id: menuForm.id
      });
      alert('Menu item updated successfully!');
    } else {
      const newId = 'menu-' + Math.floor(1000 + Math.random() * 9000);
      addMenuItem(activeRestaurant.id, {
        ...itemData,
        id: newId
      });
      alert('Menu item added successfully!');
    }
    setActivePage(null);
  };

  const handleAddTableSubmit = (e) => {
    e.preventDefault();
    const tableId = addTableForm.id.trim();
    if (!tableId) return;

    const seats = parseInt(addTableForm.seats) || 4;
    
    if (addTableForm.isEdit) {
      updateDiningTable(activeRestaurant.id, tableId, {
        seats: seats,
        status: addTableForm.status || 'Free'
      });
      alert('Table updated successfully!');
      setAddTableForm({ id: '', seats: 4 });
      setActivePage(null);
    } else {
      const success = addDiningTable(activeRestaurant.id, {
        id: tableId,
        status: 'Free',
        seats: seats
      });

      if (success) {
        alert('Table created successfully!');
        setAddTableForm({ id: '', seats: 4 });
        setActivePage(null);
      } else {
        alert('Table ID already exists! Please use a unique ID.');
      }
    }
  };

  const handleStaffSubmit = (e) => {
    e.preventDefault();
    const staffData = {
      name: staffForm.name,
      role: staffForm.role,
      phone: staffForm.phone,
      email: staffForm.email,
      password: staffForm.password,
      status: staffForm.status
    };

    if (staffForm.id) {
      updateStaff(activeRestaurant.id, {
        ...staffData,
        id: staffForm.id
      });
      alert('Staff details updated successfully!');
    } else {
      const newId = 'S-' + Math.floor(1000 + Math.random() * 9000);
      addStaff(activeRestaurant.id, {
        ...staffData,
        id: newId
      });
      alert('New staff registered successfully!');
    }
    setActivePage(null);
  };

  const handleKitchenPasswordSubmit = (e) => {
    e.preventDefault();
    updateKitchenPassword(activeRestaurant.id, kitchenPasswordForm);
    alert('Kitchen password updated successfully!');
    setActivePage(null);
  };

  const renderActivePage = () => {
    const PageHeader = ({ subtitle }) => (
      <div style={sty.pageInlineHeader}>
        <button style={sty.pageBackBtn} onClick={() => setActivePage(null)}
          onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--primary)'; e.currentTarget.style.color = 'var(--primary)'; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'inherit'; }}
        >→</button>
        <div>
          <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 800, fontFamily: "'Outfit', sans-serif" }}>{pageTitle[activePage]}</h2>
          {subtitle && <span style={{ fontSize: '12px', color: '#64748b' }}>{subtitle}</span>}
        </div>
      </div>
    );



    if (activePage === 'order-edit-form' && activeEditOrder) {
      const activeOrdersForWaiters = orders.filter(o => o.status !== 'done');
      const getWaiterLabel = (s) => {
        if (s.status === 'Off Duty') {
          return `${s.name} (Off Duty)`;
        }
        const assigned = activeOrdersForWaiters
          .filter(o => o.waiter === s.name)
          .map(o => `Table ${o.table}`);
        const uniqueTables = [...new Set(assigned)];
        if (uniqueTables.length > 0) {
          return `${s.name} (Serving ${uniqueTables.join(', ')})`;
        } else {
          return `${s.name} (Available)`;
        }
      };

      return (
        <section>
          <div style={{ width: '100%' }}>
            <PageHeader subtitle={`Modify details for order #ORD-${activeEditOrder.id}`} />
            <div style={sty.pageCard}>
              <form onSubmit={(e) => {
                e.preventDefault();
                updateOrder(activeRestaurant.id, activeEditOrder.id, {
                  table: editOrderForm.table,
                  notes: editOrderForm.notes,
                  waiter: editOrderForm.waiter
                });
                setActiveEditOrder(null);
                setActivePage(null);
                setActiveTab('orders');
                alert('Order updated successfully!');
              }} style={{ width: '100%' }}>
                <div className="form-group" style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '6px', color: 'var(--text-main)' }}>Table Number</label>
                  <input
                    type="text"
                    value={editOrderForm.table}
                    readOnly
                    style={{
                      width: '100%',
                      padding: '10px',
                      borderRadius: '8px',
                      border: '1px solid var(--border)',
                      backgroundColor: 'var(--bg-tertiary)',
                      color: 'var(--text-main)',
                      cursor: 'not-allowed',
                      opacity: 0.8
                    }}
                  />
                </div>
                <div className="form-group" style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '6px', color: 'var(--text-main)' }}>Assigned Waiter</label>
                  <select
                    value={editOrderForm.waiter}
                    onChange={e => setEditOrderForm({ ...editOrderForm, waiter: e.target.value })}
                    style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border)', background: 'white', color: 'black' }}
                  >
                    <option value="Unassigned">Unassigned</option>
                    {staff.filter(s => s.role === 'Waiter').map(s => (
                      <option key={s.id} value={s.name} disabled={s.status === 'Off Duty'}>
                        {getWaiterLabel(s)}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group" style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '6px', color: 'var(--text-main)' }}>Notes</label>
                  <textarea
                    value={editOrderForm.notes}
                    onChange={e => setEditOrderForm({ ...editOrderForm, notes: e.target.value })}
                    rows="3"
                    style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border)' }}
                  />
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px' }}>
                  <button
                    type="button"
                    className="btn btn-outline"
                    onClick={() => {
                      setActiveEditOrder(null);
                      setActivePage(null);
                    }}
                    style={{ padding: '10px 24px' }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-black"
                    style={{ padding: '10px 24px' }}
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          </div>
        </section>
      );
    }





    if (activePage === 'menu-form') {
      const defaultCategories = ['Starters', 'Rice Meals', 'Tiffin', 'Rotis', 'Desserts', 'Drinks'];
      const menuCategories = activeRestaurant ? Array.from(new Set(activeRestaurant.menu.map(i => i.category).filter(Boolean))) : [];
      if (menuForm.category && !defaultCategories.includes(menuForm.category) && !menuCategories.includes(menuForm.category)) {
        menuCategories.push(menuForm.category);
      }
      const allCategories = Array.from(new Set([...defaultCategories, ...menuCategories]));

      return (
        <section>
          <div style={{ width: '100%' }}>
            <PageHeader subtitle={menuForm.id ? 'Modify menu item details' : 'Create a new dish for the menu'} />
            <div style={sty.pageCard}>
              <form onSubmit={handleMenuSubmit} style={{ width: '100%' }}>
                <div
                  className="menu-item-cover-banner"
                  onClick={() => document.getElementById('menu-item-image-file').click()}
                  style={{ cursor: 'pointer' }}
                >
                  {menuForm.image ? (
                    <>
                      <img src={menuForm.image} alt={menuForm.name} />
                      <div className="menu-item-cover-overlay">
                        <span>Change Cover Photo</span>
                      </div>
                    </>
                  ) : (
                    <div className="menu-item-cover-banner-placeholder">
                      <span className="text">Click to upload cover photo</span>
                    </div>
                  )}
                </div>

                <div className="form-group" style={{ marginBottom: '16px' }}>
                  <label>Item Name</label>
                  <input
                    type="text"
                    value={menuForm.name}
                    onChange={(e) => setMenuForm({ ...menuForm, name: e.target.value })}
                    required
                    placeholder="e.g. Chicken Biryani"
                  />
                </div>

                <div className="form-group" style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '6px', color: '#000000' }}>Item Image</label>
                  <div
                    onClick={() => document.getElementById('menu-item-image-file').click()}
                    style={{
                      border: '2px dashed var(--border)',
                      borderRadius: '12px',
                      padding: '24px 20px',
                      textAlign: 'center',
                      background: '#f8fafc',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--primary)'; e.currentTarget.style.background = 'var(--primary-light)'; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.background = '#f8fafc'; }}
                  >
                    <input
                      id="menu-item-image-file"
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onloadend = () => {
                            setMenuForm({ ...menuForm, image: reader.result });
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                      style={{ display: 'none' }}
                    />
                    <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--primary)' }}>
                      {menuForm.image ? 'Change Selected Image' : 'Upload from folder'}
                    </div>
                    <div style={{ fontSize: '11px', color: '#64748b', marginTop: '4px' }}>
                      Supports JPG, JPEG, PNG, GIF
                    </div>
                  </div>
                </div>

                <div className="form-group" style={{ marginBottom: '16px' }}>
                  <label>Description</label>
                  <textarea
                    rows="3"
                    value={menuForm.desc}
                    onChange={(e) => setMenuForm({ ...menuForm, desc: e.target.value })}
                    placeholder="Item description..."
                  ></textarea>
                </div>

                <div style={sty.formGrid2}>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label>Price (₹)</label>
                    <input
                      type="number"
                      value={menuForm.price}
                      onChange={(e) => setMenuForm({ ...menuForm, price: e.target.value })}
                      required
                      placeholder="320"
                    />
                  </div>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label>Category</label>
                    <select
                      value={menuForm.category}
                      onChange={(e) => {
                        if (e.target.value === 'custom') {
                          const newCat = prompt('Enter new category name:');
                          if (newCat && newCat.trim()) {
                            setMenuForm({ ...menuForm, category: newCat.trim() });
                          }
                        } else {
                          setMenuForm({ ...menuForm, category: e.target.value });
                        }
                      }}
                      required
                    >
                      {allCategories.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                      <option value="custom">+ Add Custom Category...</option>
                    </select>
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px' }}>
                  <button type="button" className="btn btn-outline" style={{ padding: '10px 24px' }} onClick={() => setActivePage(null)}>Cancel</button>
                  <button type="submit" className="btn btn-black" style={{ padding: '10px 24px' }}>Save Changes</button>
                </div>
              </form>
            </div>
          </div>
        </section>
      );
    }

    if (activePage === 'table-form') {
      return (
        <section>
          <div style={{ width: '100%' }}>
            <PageHeader subtitle={addTableForm.isEdit ? "Update dining table settings" : "Create a new physical dining table with capacity"} />
            <div style={sty.pageCard}>
              <form onSubmit={handleAddTableSubmit} style={{ width: '100%' }}>
                <div className="form-group" style={{ marginBottom: '16px' }}>
                  <label>Table Number / ID</label>
                  <input
                    type="text"
                    value={addTableForm.id}
                    onChange={(e) => setAddTableForm({ ...addTableForm, id: e.target.value })}
                    placeholder="e.g. T-06"
                    required
                    disabled={addTableForm.isEdit}
                  />
                  {!addTableForm.isEdit && <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>Recommended format: T-XX (e.g. T-06, T-07)</p>}
                </div>
                <div className="form-group" style={{ marginBottom: '20px' }}>
                  <label>Seating Capacity</label>
                  <input
                    type="number"
                    min="1"
                    max="20"
                    value={addTableForm.seats}
                    onChange={(e) => setAddTableForm({ ...addTableForm, seats: parseInt(e.target.value) || 4 })}
                    required
                  />
                </div>
                {addTableForm.isEdit && (
                  <div className="form-group" style={{ marginBottom: '20px' }}>
                    <label>Status</label>
                    <select
                      value={addTableForm.status || 'Free'}
                      onChange={(e) => setAddTableForm({ ...addTableForm, status: e.target.value })}
                      style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--border)', backgroundColor: 'var(--bg-primary)' }}
                    >
                      <option value="Free">Free</option>
                      <option value="Occupied">Occupied</option>
                    </select>
                  </div>
                )}
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px' }}>
                  <button type="button" className="btn btn-outline" style={{ padding: '10px 24px' }} onClick={() => setActivePage(null)}>Cancel</button>
                  <button type="submit" className="btn btn-black" style={{ padding: '10px 24px' }}>
                    {addTableForm.isEdit ? 'Update Table' : 'Create Table'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </section>
      );
    }

    if (activePage === 'staff-form') {
      return (
        <section>
          <div style={{ width: '100%' }}>
            <PageHeader subtitle={staffForm.id ? 'Update employee profile' : 'Add a new member to the restaurant staff'} />
            <div style={sty.pageCard}>
              <form onSubmit={handleStaffSubmit} style={{ width: '100%' }}>
                <div style={sty.formGrid2}>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label>Full Name</label>
                    <input type="text" value={staffForm.name} onChange={(e) => setStaffForm({ ...staffForm, name: e.target.value })} required placeholder="e.g. Ramesh Kumar" />
                  </div>

                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label>Role</label>
                    <select value={staffForm.role} onChange={(e) => setStaffForm({ ...staffForm, role: e.target.value })} required>
                      <option value="Waiter">Waiter</option>
                      <option value="Kitchen">Kitchen</option>
                    </select>
                  </div>
                </div>

                <div className="form-group" style={{ marginBottom: '16px', marginTop: '16px' }}>
                  <label>Phone Number</label>
                  <input type="tel" value={staffForm.phone} onChange={(e) => setStaffForm({ ...staffForm, phone: e.target.value })} required placeholder="e.g. 9876543210" />
                </div>

                <div style={sty.formGrid2}>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label>Email Address</label>
                    <input type="email" value={staffForm.email} onChange={(e) => setStaffForm({ ...staffForm, email: e.target.value })} required placeholder="e.g. ramesh@serviq.com" />
                  </div>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label>Password</label>
                    <input type="text" value={staffForm.password} onChange={(e) => setStaffForm({ ...staffForm, password: e.target.value })} required placeholder="e.g. waiter123" />
                  </div>
                </div>

                <div className="form-group" style={{ marginBottom: '20px', marginTop: '16px' }}>
                  <label>Duty Status</label>
                  <select value={staffForm.status} onChange={(e) => setStaffForm({ ...staffForm, status: e.target.value })} required>
                    <option value="On Duty">On Duty</option>
                    <option value="Off Duty">Off Duty</option>
                  </select>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px' }}>
                  <button type="button" className="btn btn-outline" style={{ padding: '10px 24px' }} onClick={() => setActivePage(null)}>Cancel</button>
                  <button type="submit" className="btn btn-black" style={{ padding: '10px 24px' }}>Save Changes</button>
                </div>
              </form>
            </div>
          </div>
        </section>
      );
    }

    if (activePage === 'kitchen-form') {
      return (
        <section>
          <div style={{ width: '100%' }}>
            <PageHeader subtitle="Update the password shared by kitchen station screens" />
            <div style={sty.pageCard}>
              <form onSubmit={handleKitchenPasswordSubmit} style={{ width: '100%' }}>
                <div className="form-group" style={{ marginBottom: '16px' }}>
                  <label>Kitchen Login Email</label>
                  <input type="email" value={kitchenLogin.email} readOnly style={{ backgroundColor: 'var(--bg-tertiary)', cursor: 'not-allowed' }} />
                </div>
                <div className="form-group" style={{ marginBottom: '20px' }}>
                  <label>Kitchen Login Password</label>
                  <input
                    type="text"
                    value={kitchenPasswordForm}
                    onChange={(e) => setKitchenPasswordForm(e.target.value)}
                    required
                    placeholder="e.g. kitchen123"
                  />
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px' }}>
                  <button type="button" className="btn btn-outline" style={{ padding: '10px 24px' }} onClick={() => setActivePage(null)}>Cancel</button>
                  <button type="submit" className="btn btn-black" style={{ padding: '10px 24px' }}>Update Password</button>
                </div>
              </form>
            </div>
          </div>
        </section>
      );
    }

    return null;
  };

  return (
    <div id="dashboard-view" className="dashboard-wrapper">
      {/* SIDEBAR */}
      <aside className="sidebar">
        <div className="sidebar-header-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', padding: '24px 20px', gap: '2px' }}>
          <h2 style={{ fontSize: '24px', fontWeight: 800, color: 'white', margin: 0, letterSpacing: '-0.5px' }}>Serviq</h2>
          <span style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 600, letterSpacing: '0.5px', textTransform: 'uppercase' }}>Standard Plan</span>
        </div>

        <ul className="sidebar-menu">
          {isTabAllowed('overview') && (
            <li className={`sidebar-item ${activeTab === 'overview' ? 'active' : ''}`} onClick={() => { setActiveTab('overview'); setActivePage(null); }}>
              <a href="#" style={{ display: 'flex', alignItems: 'center' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{marginRight: '12px'}}><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>
                Dashboard
              </a>
            </li>
          )}
          {isTabAllowed('orders') && (
            <li className={`sidebar-item ${activeTab === 'orders' ? 'active' : ''}`} onClick={() => { setActiveTab('orders'); setActivePage(null); }}>
              <a href="#" style={{ display: 'flex', alignItems: 'center' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{marginRight: '12px'}}><path d="M14 2H6a2 2 0 0 0-2 2v16c0 1.1.9 2 2 2h12a2 2 0 0 0 2-2V8l-6-6z"/><path d="M14 3v5h5M16 13H8M16 17H8M10 9H8"/></svg>
                Order Management
              </a>
            </li>
          )}
          {isTabAllowed('menu') && (
            <li className={`sidebar-item ${activeTab === 'menu' ? 'active' : ''}`} onClick={() => { setActiveTab('menu'); setActivePage(null); }}>
              <a href="#" style={{ display: 'flex', alignItems: 'center' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{marginRight: '12px'}}><path d="M3 9h18v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9Z"/><path d="m3 9 2.45-4.9A2 2 0 0 1 7.24 3h9.52a2 2 0 0 1 1.8 1.1L21 9"/><path d="M12 3v6"/></svg>
                Menu Management
              </a>
            </li>
          )}
          {isTabAllowed('tables') && (
            <li className={`sidebar-item ${activeTab === 'tables' ? 'active' : ''}`} onClick={() => { setActiveTab('tables'); setActivePage(null); }}>
              <a href="#" style={{ display: 'flex', alignItems: 'center' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{marginRight: '12px'}}><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/></svg>
                Table Management
              </a>
            </li>
          )}
          {isTabAllowed('tables') && (
            <li className={`sidebar-item ${activeTab === 'qr-code-config' ? 'active' : ''}`} onClick={() => { setActiveTab('qr-code-config'); setActivePage(null); }}>
              <a href="#" style={{ display: 'flex', alignItems: 'center' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{marginRight: '12px'}}><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><path d="M7 7h.01M17 7h.01M7 17h.01M17 17h.01"/></svg>
                QR Code Management
              </a>
            </li>
          )}
          {isTabAllowed('billing') && (
            <li className={`sidebar-item ${activeTab === 'billing' ? 'active' : ''}`} onClick={() => { setActiveTab('billing'); setActivePage(null); }}>
              <a href="#" style={{ display: 'flex', alignItems: 'center' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{marginRight: '12px'}}><rect x="2" y="5" width="20" height="14" rx="2"/><path d="M2 10h20"/></svg>
                Billing
              </a>
            </li>
          )}

          {/* Waiter Management Dropdown */}
          {(isTabAllowed('waiter-list') || isTabAllowed('waiter-reports')) && (
            <li className={`sidebar-group ${sidebarWaiterOpen ? 'open' : ''}`}>
              <div
                className="sidebar-item dropdown-trigger"
                onClick={() => { setSidebarWaiterOpen(!sidebarWaiterOpen); setSidebarKitchenOpen(false); setSidebarUsersOpen(false); }}
                style={{ cursor: 'pointer' }}
              >
                <a href="#" onClick={e => e.preventDefault()} className="dropdown-trigger-link" style={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{marginRight: '12px'}}><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                  Waiter Management
                  {sidebarWaiterOpen ? 
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginLeft: 'auto' }}><polyline points="18 15 12 9 6 15"/></svg> : 
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginLeft: 'auto' }}><polyline points="6 9 12 15 18 9"/></svg>
                  }
                </a>
              </div>
              {sidebarWaiterOpen && (
                <ul className="sidebar-submenu">
                  <li className={`sidebar-item ${activeTab === 'waiter-list' ? 'active' : ''}`} onClick={() => { setActiveTab('waiter-list'); setActivePage(null); }}>
                    <a href="#">Waiter List</a>
                  </li>
                  <li className={`sidebar-item ${activeTab === 'waiter-reports' ? 'active' : ''}`} onClick={() => { setActiveTab('waiter-reports'); setActivePage(null); }}>
                    <a href="#">Waiter Report</a>
                  </li>
                </ul>
              )}
            </li>
          )}

          {/* Kitchen Management Dropdown */}
          {(isTabAllowed('kitchen-list') || isTabAllowed('kitchen-reports')) && (
            <li className={`sidebar-group ${sidebarKitchenOpen ? 'open' : ''}`}>
              <div
                className="sidebar-item dropdown-trigger"
                onClick={() => { setSidebarKitchenOpen(!sidebarKitchenOpen); setSidebarWaiterOpen(false); setSidebarUsersOpen(false); }}
                style={{ cursor: 'pointer' }}
              >
                <a href="#" onClick={e => e.preventDefault()} className="dropdown-trigger-link" style={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                  <KitchenIcon size={18} color="currentColor" />
                  Kitchen Management
                  {sidebarKitchenOpen ? 
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginLeft: 'auto' }}><polyline points="18 15 12 9 6 15"/></svg> : 
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginLeft: 'auto' }}><polyline points="6 9 12 15 18 9"/></svg>
                  }
                </a>
              </div>
              {sidebarKitchenOpen && (
                <ul className="sidebar-submenu">
                  <li className={`sidebar-item ${activeTab === 'kitchen-list' ? 'active' : ''}`} onClick={() => { setActiveTab('kitchen-list'); setActivePage(null); }}>
                    <a href="#">Kitchen List</a>
                  </li>
                  <li className={`sidebar-item ${activeTab === 'kitchen-reports' ? 'active' : ''}`} onClick={() => { setActiveTab('kitchen-reports'); setActivePage(null); }}>
                    <a href="#">Kitchen Report</a>
                  </li>
                </ul>
              )}
            </li>
          )}

          {/* Business Reports Tab */}
          {isTabAllowed('reports') && (
            <li className={`sidebar-item ${activeTab === 'reports' ? 'active' : ''}`} onClick={() => { setActiveTab('reports'); setActivePage(null); }}>
              <a href="#" style={{ display: 'flex', alignItems: 'center' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{marginRight: '12px'}}><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>
                Reports
              </a>
            </li>
          )}

          {/* Users Dropdown */}
          {isTabAllowed('settings') && (
            <li className={`sidebar-group ${sidebarUsersOpen ? 'open' : ''}`}>
              <div
                className="sidebar-item dropdown-trigger"
                onClick={() => { setSidebarUsersOpen(!sidebarUsersOpen); setSidebarWaiterOpen(false); setSidebarKitchenOpen(false); }}
                style={{ cursor: 'pointer' }}
              >
                <a href="#" onClick={e => e.preventDefault()} className="dropdown-trigger-link" style={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{marginRight: '12px'}}><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                  Users
                  {sidebarUsersOpen ? 
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginLeft: 'auto' }}><polyline points="18 15 12 9 6 15"/></svg> : 
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginLeft: 'auto' }}><polyline points="6 9 12 15 18 9"/></svg>
                  }
                </a>
              </div>
              {sidebarUsersOpen && (
                <ul className="sidebar-submenu">
                  <li className={`sidebar-item ${activeTab === 'roles-permissions' ? 'active' : ''}`} onClick={() => { setActiveTab('roles-permissions'); setActivePage(null); }}>
                    <a href="#">Roles & Permissions</a>
                  </li>
                  <li className={`sidebar-item ${activeTab === 'users' ? 'active' : ''}`} onClick={() => { setActiveTab('users'); setActivePage(null); }}>
                    <a href="#">User Lists</a>
                  </li>
                </ul>
              )}
            </li>
          )}

          {/* Settings Tab */}
          {isTabAllowed('settings') && (
            <li className={`sidebar-item ${activeTab === 'settings' ? 'active' : ''}`} onClick={() => { setActiveTab('settings'); setActivePage(null); }}>
              <a href="#" style={{ display: 'flex', alignItems: 'center' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{marginRight: '12px'}}><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
                Settings
              </a>
            </li>
          )}
        </ul>
      </aside>

      {/* MAIN CONTENT */}
      <main className="main-content" style={{ position: 'relative' }}>
        {/* Impersonation Banner */}
        {isImpersonating && (
          <div id="saas-impersonation-banner" style={{ display: 'flex', background: '#fff1f2', borderBottom: '1.5px solid #fca5a5', color: '#991b1b', padding: '12px 32px', fontSize: '13px', fontWeight: 600, alignItems: 'center', justifyContent: 'space-between', fontFamily: 'sans-serif' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>Super Admin Impersonation Mode: Currently managing {name} (Simulated Session)</span>
            </div>
            <button className="btn" onClick={exitImpersonation} style={{ background: '#991b1b', color: 'white', padding: '4px 12px', fontSize: '12px', fontWeight: 700, borderRadius: '4px', border: 'none', transition: 'all 0.2s', cursor: 'pointer' }}>
              Exit & Return to Super Admin
            </button>
          </div>
        )}

        {/* HEADER */}
        {(!activePage || activePage === 'order-view') && (
          <header className="main-header">
            <div className="header-title-container">
              <h1 className="header-title">{tabTitles[activeTab] || activeTab}</h1>
              <span className="header-subtitle-date">{dateTimeStr}</span>
            </div>
            <div className="header-actions" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <button className="btn btn-notify" style={{ position: 'relative' }} onClick={() => alert('No new notifications.')}>
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>
                {pendingOrdersCount > 0 && (
                  <div style={{ position: 'absolute', top: '6px', right: '6px', width: '8px', height: '8px', borderRadius: '50%', background: '#f97316' }}></div>
                )}
              </button>
              
              {/* PROFILE DROPDOWN */}
              <div style={{ position: 'relative' }}>
                <button 
                  style={{ 
                    background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)', 
                    color: 'white', 
                    border: 'none', 
                    width: '40px', 
                    height: '40px', 
                    borderRadius: '50%', 
                    fontWeight: 800, 
                    fontSize: '18px', 
                    cursor: 'pointer',
                    boxShadow: '0 4px 12px rgba(234, 88, 12, 0.3)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                  onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                >
                  {name.charAt(0).toUpperCase()}
                </button>
                
                {isProfileMenuOpen && (
                  <>
                    {/* Invisible overlay to close dropdown when clicking outside */}
                    <div 
                      style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', zIndex: 999 }}
                      onClick={() => setIsProfileMenuOpen(false)}
                    />
                    <div style={{ 
                      position: 'absolute', 
                      top: '52px', 
                      right: '0', 
                      width: '260px', 
                      background: '#1e1e1e', // Dark theme look matching the screenshot
                      borderRadius: '16px', 
                      boxShadow: '0 10px 40px rgba(0,0,0,0.2)', 
                      border: '1px solid #333333',
                      zIndex: 1000,
                      overflow: 'hidden'
                    }}>
                    <div style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '12px', borderBottom: '1px solid #333333' }}>
                      <div style={{ 
                        background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)', 
                        color: 'white', 
                        width: '48px', 
                        height: '48px', 
                        borderRadius: '50%', 
                        fontWeight: 800, 
                        fontSize: '22px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0
                      }}>
                        {name.charAt(0).toUpperCase()}
                      </div>
                      <div style={{ overflow: 'hidden' }}>
                        <div style={{ fontWeight: 700, fontSize: '15px', color: '#ffffff', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                          {currentUser?.name || 'Serviq Admin'}
                        </div>
                        <div style={{ fontSize: '12px', color: '#a1a1aa', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                          {currentUser?.email || 'admin@saravana.com'}
                        </div>
                      </div>
                    </div>
                    
                    <div style={{ padding: '12px' }}>
                      {isTabAllowed('settings') && (
                        <button 
                          style={{ 
                            width: '100%', 
                            textAlign: 'left', 
                            background: 'transparent', 
                            border: 'none', 
                            padding: '12px 16px', 
                            color: '#e4e4e7', 
                            fontSize: '14px', 
                            fontWeight: 600, 
                            cursor: 'pointer',
                            borderRadius: '8px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px'
                          }}
                          onMouseEnter={(e) => e.target.style.background = '#27272a'}
                          onMouseLeave={(e) => e.target.style.background = 'transparent'}
                          onClick={() => {
                            setActiveTab('settings');
                            setActivePage(null);
                            setIsProfileMenuOpen(false);
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            Settings
                          </div>
                        </button>
                      )}
                      
                      <button 
                        style={{ 
                          width: '100%', 
                          textAlign: 'left', 
                          background: 'transparent', 
                          border: 'none', 
                          padding: '12px 16px', 
                          color: '#e4e4e7', 
                          fontSize: '14px', 
                          fontWeight: 600, 
                          cursor: 'pointer',
                          borderRadius: '8px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '10px',
                          marginTop: '4px'
                        }}
                        onMouseEnter={(e) => e.target.style.background = '#27272a'}
                        onMouseLeave={(e) => e.target.style.background = 'transparent'}
                        onClick={logout}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#ef4444' }}>
                          Log Out
                        </div>
                      </button>
                    </div>
                  </div>
                  </>
                )}
              </div>
            </div>
          </header>
        )}

        {/* CONTENT BODY */}
        <div className="content-body">
          {activePage && activePage !== 'order-view' ? renderActivePage() : (
            <>
              {activeTab === 'overview' && (
                <OverviewPanel
                  orders={orders}
                  tables={tables}
                  todayRevenue={todayRevenue}
                />
              )}
              {activeTab === 'orders' && (
                <OrdersPanel
                  orders={orders}
                  staff={staff}
                  orderFilter={orderFilter}
                  setOrderFilter={setOrderFilter}
                  selectedWaiterFilter={selectedWaiterFilter}
                  setSelectedWaiterFilter={setSelectedWaiterFilter}
                  waiterDropdownOpen={waiterDropdownOpen}
                  setWaiterDropdownOpen={setWaiterDropdownOpen}
                  setActiveViewOrder={setActiveViewOrder}
                  setActivePage={setActivePage}
                  setActiveEditOrder={setActiveEditOrder}
                  setEditOrderForm={setEditOrderForm}
                  deleteOrder={deleteOrder}
                  activeRestaurant={activeRestaurant}
                  updateOrderStatus={updateOrderStatus}
                  plan={plan}
                />
              )}
              {activeTab === 'menu' && (
                <MenuPanel
                  menu={menu}
                  activeRestaurant={activeRestaurant}
                  openAddMenuModal={openAddMenuModal}
                  openEditMenuModal={openEditMenuModal}
                  handleDeleteMenu={handleDeleteMenu}
                  hasPermission={hasPermission}
                />
              )}
              {activeTab === 'billing' && (
                <BillingPanel
                  billingData={billingData}
                  orders={orders}
                  tables={tables}
                  activeRestaurant={activeRestaurant}
                  updateOrder={updateOrder}
                  selectedBillingTable={selectedBillingTable}
                  setSelectedBillingTable={setSelectedBillingTable}
                  billingPaymentMethod={billingPaymentMethod}
                  setBillingPaymentMethod={setBillingPaymentMethod}
                  markBillAsPaid={markBillAsPaid}
                  hasPermission={hasPermission}
                />
              )}
              {activeTab === 'tables' && (
                <TablesPanel
                  tables={tables}
                  staff={staff}
                  orders={orders}
                  activeRestaurant={activeRestaurant}
                  updateDiningTable={updateDiningTable}
                  deleteDiningTable={deleteDiningTable}
                  handleOpenAssignTablesModal={handleOpenAssignTablesModal}
                  setAddTableForm={setAddTableForm}
                  setActivePage={setActivePage}
                  hasPermission={hasPermission}
                />
              )}
              {activeTab === 'qr-code-config' && (
                <QRManagementPanel
                  activeRestaurant={activeRestaurant}
                  generateQrCode={generateQrCode}
                  assignQrCode={assignQrCode}
                  revokeQrCode={revokeQrCode}
                  deleteQrCode={deleteQrCode}
                />
              )}
              {activeTab === 'waiter-list' && (
                <WaiterListPanel
                  staff={staff}
                  tables={tables}
                  activeRestaurant={activeRestaurant}
                  updateStaff={updateStaff}
                  deleteStaff={deleteStaff}
                  openAddStaffModal={openAddStaffModal}
                  openEditStaffModal={openEditStaffModal}
                  handleOpenAssignTablesModal={handleOpenAssignTablesModal}
                />
              )}
              {activeTab === 'waiter-reports' && (
                <WaiterReportsPanel
                  orders={orders}
                  staff={staff}
                  updateOrder={updateOrder}
                  activeRestaurant={activeRestaurant}
                />
              )}
              {activeTab === 'kitchen-list' && (
                <KitchenListPanel
                  plan={plan}
                  orders={orders}
                  staff={staff}
                  activeRestaurant={activeRestaurant}
                  upgradeRestaurantPlan={upgradeRestaurantPlan}
                  updateOrderItemStatus={updateOrderItemStatus}
                  updateStaff={updateStaff}
                  deleteStaff={deleteStaff}
                  openAddStaffModal={openAddStaffModal}
                  openEditStaffModal={openEditStaffModal}
                  openKitchenModal={openKitchenModal}
                />
              )}
              {activeTab === 'kitchen-reports' && (
                <KitchenReportsPanel
                  orders={orders}
                  staff={staff}
                  menu={menu}
                />
              )}
              {activeTab === 'reports' && (
                <ReportsPanel
                  orders={orders}
                  menu={menu}
                  activeRestaurant={activeRestaurant}
                />
              )}
              {activeTab === 'settings' && (
                <SettingsPanel
                  activeRestaurant={activeRestaurant}
                  saveRestaurantSettings={saveRestaurantSettings}
                  accentColor={accentColor}
                  setAccentColor={setAccentColor}
                  darkMode={darkMode}
                  setDarkMode={setDarkMode}
                />
              )}
              {activeTab === 'users' && (
                <UserListPanel
                  activeRestaurant={activeRestaurant}
                  staff={staff}
                  addStaff={addStaff}
                  updateStaff={updateStaff}
                  deleteStaff={deleteStaff}
                  hasPermission={hasPermission}
                />
              )}
              {activeTab === 'roles-permissions' && (
                <RolesPermissionsPanel />
              )}
            </>
          )}
        </div>

        {/* MODAL OVERLAY FOR ORDER VIEW */}
        {activePage === 'order-view' && activeViewOrder && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            backgroundColor: 'rgba(0, 0, 0, 0.4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            backdropFilter: 'blur(4px)'
          }}>
            <div style={{
              background: '#ffffff',
              borderRadius: '16px',
              padding: '32px',
              border: '1px solid var(--border)',
              boxShadow: '0 10px 30px rgba(0,0,0,0.15)',
              width: '90%',
              maxWidth: '500px',
              maxHeight: '90vh',
              overflowY: 'auto',
              position: 'relative'
            }}>
              {/* Close Button Top Right */}
              <button
                style={{
                  position: 'absolute',
                  top: '20px',
                  right: '20px',
                  background: 'transparent',
                  border: 'none',
                  fontSize: '20px',
                  cursor: 'pointer',
                  color: '#64748b'
                }}
                onClick={() => {
                  setActiveViewOrder(null);
                  setActivePage(null);
                }}
              >
                ✕
              </button>

              <h2 style={{ margin: '0 0 4px 0', fontSize: '20px', fontWeight: 800, fontFamily: "'Outfit', sans-serif", color: 'var(--black)' }}>
                Order Details
              </h2>
              <span style={{ fontSize: '12px', color: '#64748b', display: 'block', marginBottom: '20px' }}>
                View details for order #ORD-{activeViewOrder.id}
              </span>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '14px', marginBottom: '20px', color: '#000000' }}>
                <div><strong>Table:</strong> Table {activeViewOrder.table}</div>
                <div><strong>Time:</strong> {activeViewOrder.time} ({activeViewOrder.timeAgo})</div>
                <div><strong>Status:</strong> <Badge status={activeViewOrder.status} /></div>
                <div><strong>Assigned Waiter:</strong> {activeViewOrder.waiter || 'Unassigned'}</div>
                {activeViewOrder.notes && <div><strong>Notes:</strong> {activeViewOrder.notes}</div>}

                <div style={{ borderTop: '1px dashed var(--border)', paddingTop: '12px', marginTop: '8px' }}>
                  <strong style={{ display: 'block', marginBottom: '8px' }}>Items Summary:</strong>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid var(--border)', textAlign: 'left', fontSize: '12px', color: '#64748b' }}>
                        <th style={{ padding: '6px 0' }}>Item Name</th>
                        <th style={{ padding: '6px 0', textAlign: 'center' }}>Qty</th>
                        <th style={{ padding: '6px 0', textAlign: 'right' }}>Price</th>
                      </tr>
                    </thead>
                    <tbody>
                      {activeViewOrder.items.map((item, idx) => (
                        <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9', fontSize: '13px' }}>
                          <td style={{ padding: '8px 0' }}>{item.name}</td>
                          <td style={{ padding: '8px 0', textAlign: 'center' }}>{item.qty}</td>
                          <td style={{ padding: '8px 0', textAlign: 'right' }}>₹{item.price * item.qty}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '13px', borderTop: '1px dashed var(--border)', paddingTop: '12px', marginTop: '8px', alignItems: 'flex-end' }}>
                  <div>Subtotal: <strong>₹{activeViewOrder.subtotal}</strong></div>
                  <div>Tax: <strong>₹{activeViewOrder.tax}</strong></div>
                  <div>Total: <strong style={{ fontSize: '16px', color: 'var(--primary)' }}>₹{activeViewOrder.total}</strong></div>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '20px' }}>
                <button
                  className="btn btn-black"
                  style={{ padding: '10px 24px' }}
                  onClick={() => {
                    setActiveViewOrder(null);
                    setActivePage(null);
                  }}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* MODAL OVERLAY FOR ASSIGN TABLES */}
        <Modal
          isOpen={showAssignTablesModal}
          onClose={() => setShowAssignTablesModal(false)}
          title="Assign Tables to Waiter"
          maxWidth="500px"
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', color: 'var(--text-main)', marginTop: '10px' }}>
            {/* Waiter Selection */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '13px', fontWeight: '700', color: 'var(--black)' }}>Select Waiter</label>
              <select
                value={modalWaiterId}
                onChange={e => loadWaiterAssignments(e.target.value)}
                style={{
                  padding: '10px 14px',
                  borderRadius: '8px',
                  border: '1.5px solid var(--border)',
                  backgroundColor: 'var(--bg-primary)',
                  color: 'var(--text-main)',
                  fontSize: '14px',
                  fontWeight: '600',
                  outline: 'none',
                  width: '100%'
                }}
              >
                <option value="" disabled>Select a Waiter</option>
                {staff.filter(s => s.role === 'Waiter').map(s => (
                  <option key={s.id} value={s.name}>
                    {s.name} ({s.status === 'On Duty' ? 'On Duty' : 'Off Duty'})
                  </option>
                ))}
              </select>
            </div>

            {/* Tables Selection */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '13px', fontWeight: '700', color: 'var(--black)' }}>Select Tables to Assign</label>
              <div style={{
                maxHeight: '180px',
                overflowY: 'auto',
                border: '1.5px solid var(--border)',
                borderRadius: '8px',
                padding: '12px',
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: '10px',
                backgroundColor: 'var(--bg-primary)'
              }}>
                {tables.map(table => {
                  const isChecked = modalTableIds.includes(table.id);
                  // Check if currently assigned to another waiter
                  const currentlyAssigned = table.assignedWaiterId ? staff.find(s => s.id === table.assignedWaiterId) : null;
                  const isAssignedToOther = currentlyAssigned && currentlyAssigned.id !== modalWaiterId;

                  return (
                    <label
                      key={table.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        fontSize: '13px',
                        fontWeight: '600',
                        cursor: 'pointer',
                        padding: '4px 0',
                        color: 'var(--text-main)'
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={e => {
                          if (e.target.checked) {
                            setModalTableIds([...modalTableIds, table.id]);
                          } else {
                            setModalTableIds(modalTableIds.filter(id => id !== table.id));
                          }
                        }}
                        style={{
                          accentColor: 'var(--primary)',
                          width: '16px',
                          height: '16px',
                          cursor: 'pointer'
                        }}
                      />
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span>{table.id} <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>({table.seats} seats)</span></span>
                        {isAssignedToOther && (
                          <span style={{ fontSize: '10px', color: '#f59e0b', fontWeight: '500' }}>
                            Assigned: {currentlyAssigned.name}
                          </span>
                        )}
                      </div>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Cover Waiter Selection */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '13px', fontWeight: '700', color: 'var(--black)' }}>
                Cover Waiter <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 'normal' }}>(Optional)</span>
              </label>
              <select
                value={modalCoverWaiterId}
                onChange={e => setModalCoverWaiterId(e.target.value)}
                style={{
                  padding: '10px 14px',
                  borderRadius: '8px',
                  border: '1.5px solid var(--border)',
                  backgroundColor: 'var(--bg-primary)',
                  color: 'var(--text-main)',
                  fontSize: '14px',
                  fontWeight: '600',
                  outline: 'none',
                  width: '100%'
                }}
              >
                <option value="">No Cover Waiter</option>
                {staff
                  .filter(s => s.role === 'Waiter' && s.id !== modalWaiterId)
                  .map(s => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.status === 'On Duty' ? 'On Duty' : 'Off Duty'})
                    </option>
                  ))}
              </select>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                Assigned as fallback if primary waiter goes Off Duty.
              </span>
            </div>

            {/* Form Actions */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', borderTop: '1.5px solid var(--border)', paddingTop: '16px', marginTop: '10px' }}>
              <button
                type="button"
                className="btn btn-outline"
                style={{ padding: '10px 20px' }}
                onClick={() => setShowAssignTablesModal(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-black"
                style={{ padding: '10px 24px' }}
                onClick={handleSaveAssignments}
              >
                Save Assignments
              </button>
            </div>
          </div>
        </Modal>

        {/* WAITER TIMELINE MODAL */}
        {selectedWaiterTimeline && (
          <Modal
            isOpen={showWaiterTimelineModal}
            onClose={() => {
              setShowWaiterTimelineModal(false);
              setSelectedWaiterTimeline(null);
            }}
            title={`Service Timeline: #ORD-${selectedWaiterTimeline.id}`}
            maxWidth="550px"
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', color: 'var(--text-main)', marginTop: '10px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', paddingBottom: '12px' }}>
                <div>
                  <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 600 }}>WAITER NAME</span>
                  <div style={{ fontSize: '15px', fontWeight: 700, color: 'var(--black)' }}>{selectedWaiterTimeline.waiter || 'Unassigned'}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 600 }}>TABLE</span>
                  <div style={{ fontSize: '15px', fontWeight: 700, color: 'var(--black)' }}>Table {selectedWaiterTimeline.table}</div>
                </div>
              </div>

              {/* Vertical Timeline */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', position: 'relative', paddingLeft: '24px', margin: '10px 0' }}>
                {/* Vertical Line indicator */}
                <div style={{ position: 'absolute', left: '8px', top: '8px', bottom: '8px', width: '2px', backgroundColor: 'var(--border)' }}></div>

                {/* Step 1: Received */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'relative' }}>
                  <div style={{ position: 'absolute', left: '-22px', top: '4px', width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#10b981', border: '3px solid #ffffff', boxShadow: '0 0 0 2px #10b981' }}></div>
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--black)' }}>Order Received</div>
                    <div style={{ fontSize: '11px', color: '#64748b' }}>Customer initialized the KOT</div>
                  </div>
                  <div style={{ fontSize: '13px', fontWeight: 600, fontFamily: 'monospace' }}>{selectedWaiterTimeline.time}</div>
                </div>

                {/* Step 2: Accepted */}
                {(() => {
                  const isNew = selectedWaiterTimeline.status === 'new';
                  const timeStr = isNew ? '--' : addMinutes(selectedWaiterTimeline.time, 2);
                  const dotColor = isNew ? '#94a3b8' : '#10b981';
                  return (
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'relative', opacity: isNew ? 0.6 : 1 }}>
                      <div style={{ position: 'absolute', left: '-22px', top: '4px', width: '12px', height: '12px', borderRadius: '50%', backgroundColor: dotColor, border: '3px solid #ffffff', boxShadow: `0 0 0 2px ${dotColor}` }}></div>
                      <div>
                        <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--black)' }}>Order Accepted</div>
                        <div style={{ fontSize: '11px', color: '#64748b' }}>Waiter acknowledged order</div>
                      </div>
                      <div style={{ fontSize: '13px', fontWeight: 600, fontFamily: 'monospace' }}>{timeStr}</div>
                    </div>
                  );
                })()}

                {/* Step 3: Kitchen Assigned */}
                {(() => {
                  const isNew = selectedWaiterTimeline.status === 'new';
                  const timeStr = isNew ? '--' : addMinutes(selectedWaiterTimeline.time, 3);
                  const dotColor = isNew ? '#94a3b8' : '#10b981';
                  return (
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'relative', opacity: isNew ? 0.6 : 1 }}>
                      <div style={{ position: 'absolute', left: '-22px', top: '4px', width: '12px', height: '12px', borderRadius: '50%', backgroundColor: dotColor, border: '3px solid #ffffff', boxShadow: `0 0 0 2px ${dotColor}` }}></div>
                      <div>
                        <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--black)' }}>Kitchen Assigned</div>
                        <div style={{ fontSize: '11px', color: '#64748b' }}>KOT routed to cooking staff</div>
                      </div>
                      <div style={{ fontSize: '13px', fontWeight: 600, fontFamily: 'monospace' }}>{timeStr}</div>
                    </div>
                  );
                })()}

                {/* Step 4: Food Ready */}
                {(() => {
                  const isPassed = ['ready', 'done'].includes(selectedWaiterTimeline.status);
                  const timeStr = isPassed ? addMinutes(selectedWaiterTimeline.time, 15) : '--';
                  const dotColor = isPassed ? '#10b981' : '#94a3b8';
                  return (
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'relative', opacity: isPassed ? 1 : 0.6 }}>
                      <div style={{ position: 'absolute', left: '-22px', top: '4px', width: '12px', height: '12px', borderRadius: '50%', backgroundColor: dotColor, border: '3px solid #ffffff', boxShadow: `0 0 0 2px ${dotColor}` }}></div>
                      <div>
                        <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--black)' }}>Food Ready Notification</div>
                        <div style={{ fontSize: '11px', color: '#64748b' }}>Kitchen declared dish completed</div>
                      </div>
                      <div style={{ fontSize: '13px', fontWeight: 600, fontFamily: 'monospace' }}>{timeStr}</div>
                    </div>
                  );
                })()}

                {/* Step 5: Food Pickup */}
                {(() => {
                  const isPassed = selectedWaiterTimeline.status === 'done';
                  const timeStr = isPassed ? addMinutes(selectedWaiterTimeline.time, 17) : '--';
                  const dotColor = isPassed ? '#10b981' : '#94a3b8';
                  return (
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'relative', opacity: isPassed ? 1 : 0.6 }}>
                      <div style={{ position: 'absolute', left: '-22px', top: '4px', width: '12px', height: '12px', borderRadius: '50%', backgroundColor: dotColor, border: '3px solid #ffffff', boxShadow: `0 0 0 2px ${dotColor}` }}></div>
                      <div>
                        <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--black)' }}>Food Pickup</div>
                        <div style={{ fontSize: '11px', color: '#64748b' }}>Waiter fetched food from counter</div>
                      </div>
                      <div style={{ fontSize: '13px', fontWeight: 600, fontFamily: 'monospace' }}>{timeStr}</div>
                    </div>
                  );
                })()}

                {/* Step 6: Food Served */}
                {(() => {
                  const isPassed = selectedWaiterTimeline.status === 'done';
                  const timeStr = isPassed ? addMinutes(selectedWaiterTimeline.time, 20) : '--';
                  const dotColor = isPassed ? '#10b981' : '#94a3b8';
                  return (
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'relative', opacity: isPassed ? 1 : 0.6 }}>
                      <div style={{ position: 'absolute', left: '-22px', top: '4px', width: '12px', height: '12px', borderRadius: '50%', backgroundColor: dotColor, border: '3px solid #ffffff', boxShadow: `0 0 0 2px ${dotColor}` }}></div>
                      <div>
                        <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--black)' }}>Food Served</div>
                        <div style={{ fontSize: '11px', color: '#64748b' }}>Delivered to table seatings</div>
                      </div>
                      <div style={{ fontSize: '13px', fontWeight: 600, fontFamily: 'monospace' }}>{timeStr}</div>
                    </div>
                  );
                })()}
              </div>

              {/* Total Duration Info */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'var(--bg-tertiary)', padding: '14px', borderRadius: '10px', marginTop: '10px' }}>
                <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--black)' }}>Total Service Duration</span>
                <span style={{
                  padding: '4px 12px',
                  borderRadius: '20px',
                  fontSize: '12px',
                  fontWeight: 700,
                  backgroundColor: selectedWaiterTimeline.status === 'done' ? 'var(--success-light)' : 'var(--warning-light)',
                  color: selectedWaiterTimeline.status === 'done' ? 'var(--success)' : 'var(--warning)'
                }}>
                  {selectedWaiterTimeline.status === 'done' ? '20 Minutes' : 'In Progress'}
                </span>
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '10px' }}>
                <button className="btn btn-black" style={{ padding: '8px 24px' }} onClick={() => {
                  setShowWaiterTimelineModal(false);
                  setSelectedWaiterTimeline(null);
                }}>
                  Dismiss
                </button>
              </div>
            </div>
          </Modal>
        )}

        {/* OFFLINE PAYMENT MODAL */}
        {selectedPaymentOrder && (
          <Modal
            isOpen={showOfflinePaymentModal}
            onClose={() => {
              setShowOfflinePaymentModal(false);
              setSelectedPaymentOrder(null);
            }}
            title={`Record Payment: #ORD-${selectedPaymentOrder.id}`}
            maxWidth="450px"
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', color: 'var(--text-main)', marginTop: '10px' }}>
              <div style={{ padding: '14px', backgroundColor: 'var(--bg-tertiary)', borderRadius: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '13px', fontWeight: 600, color: '#64748b' }}>Order Amount</span>
                <span style={{ fontSize: '18px', fontWeight: 800, color: 'var(--black)' }}>₹{selectedPaymentOrder.total}</span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '13px', fontWeight: '700', color: 'var(--black)' }}>Payment Type</label>
                <select
                  value={offlinePaymentType}
                  onChange={e => setOfflinePaymentType(e.target.value)}
                  style={{
                    padding: '10px 14px',
                    borderRadius: '8px',
                    border: '1.5px solid var(--border)',
                    backgroundColor: 'var(--bg-primary)',
                    color: 'var(--text-main)',
                    fontSize: '14px',
                    fontWeight: '600',
                    outline: 'none',
                    width: '100%'
                  }}
                >
                  <option value="Cash">Cash</option>
                  <option value="Card">Card</option>
                  <option value="UPI">UPI</option>
                </select>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', borderTop: '1.5px solid var(--border)', paddingTop: '16px', marginTop: '10px' }}>
                <button
                  type="button"
                  className="btn btn-outline"
                  style={{ padding: '10px 20px' }}
                  onClick={() => {
                    setShowOfflinePaymentModal(false);
                    setSelectedPaymentOrder(null);
                  }}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-black"
                  style={{ padding: '10px 24px', backgroundColor: '#10b981', color: 'white', border: 'none' }}
                  onClick={() => {
                    updateOrder(activeRestaurant.id, selectedPaymentOrder.id, {
                      billingStatus: 'paid',
                      paymentMode: offlinePaymentType,
                      status: 'done'
                    });
                    setShowOfflinePaymentModal(false);
                    setSelectedPaymentOrder(null);
                    alert(`Payment of ₹${selectedPaymentOrder.total} settled via ${offlinePaymentType} successfully.`);
                  }}
                >
                  Submit Settlement
                </button>
              </div>
            </div>
          </Modal>
        )}

        {/* KITCHEN TIMELINE MODAL */}
        {selectedKitchenTimeline && (
          <Modal
            isOpen={showKitchenTimelineModal}
            onClose={() => {
              setShowKitchenTimelineModal(false);
              setSelectedKitchenTimeline(null);
            }}
            title={`Kitchen preparation log: #ORD-${selectedKitchenTimeline.id}`}
            maxWidth="550px"
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', color: 'var(--text-main)', marginTop: '10px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', paddingBottom: '12px' }}>
                <div>
                  <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 600 }}>CHEF / STAFF</span>
                  <div style={{ fontSize: '15px', fontWeight: 700, color: 'var(--black)' }}>
                    {selectedKitchenTimeline.kitchenStaff || (parseInt(selectedKitchenTimeline.id) % 2 === 0 ? 'Suresh Pillai' : 'Priya Patel')}
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 600 }}>TABLE</span>
                  <div style={{ fontSize: '15px', fontWeight: 700, color: 'var(--black)' }}>Table {selectedKitchenTimeline.table}</div>
                </div>
              </div>

              {/* Vertical Timeline */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', position: 'relative', paddingLeft: '24px', margin: '10px 0' }}>
                {/* Vertical Line */}
                <div style={{ position: 'absolute', left: '8px', top: '8px', bottom: '8px', width: '2px', backgroundColor: 'var(--border)' }}></div>

                {/* Step 1: Kitchen Assigned */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'relative' }}>
                  <div style={{ position: 'absolute', left: '-22px', top: '4px', width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#ff7a00', border: '3px solid #ffffff', boxShadow: '0 0 0 2px #ff7a00' }}></div>
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--black)' }}>Kitchen Assigned Time</div>
                    <div style={{ fontSize: '11px', color: '#64748b' }}>KOT received by chef panel</div>
                  </div>
                  <div style={{ fontSize: '13px', fontWeight: 600, fontFamily: 'monospace' }}>{selectedKitchenTimeline.time}</div>
                </div>

                {/* Step 2: Prep Start */}
                {(() => {
                  const isPassed = ['preparing', 'ready', 'done'].includes(selectedKitchenTimeline.status);
                  const timeStr = isPassed ? addMinutes(selectedKitchenTimeline.time, 2) : '--';
                  const dotColor = isPassed ? '#ff7a00' : '#94a3b8';
                  return (
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'relative', opacity: isPassed ? 1 : 0.6 }}>
                      <div style={{ position: 'absolute', left: '-22px', top: '4px', width: '12px', height: '12px', borderRadius: '50%', backgroundColor: dotColor, border: '3px solid #ffffff', boxShadow: `0 0 0 2px ${dotColor}` }}></div>
                      <div>
                        <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--black)' }}>Preparation Start Time</div>
                        <div style={{ fontSize: '11px', color: '#64748b' }}>Chef marked order as "preparing"</div>
                      </div>
                      <div style={{ fontSize: '13px', fontWeight: 600, fontFamily: 'monospace' }}>{timeStr}</div>
                    </div>
                  );
                })()}

                {/* Step 3: Prep End */}
                {(() => {
                  const isPassed = ['ready', 'done'].includes(selectedKitchenTimeline.status);
                  const timeStr = isPassed ? addMinutes(selectedKitchenTimeline.time, 12) : '--';
                  const dotColor = isPassed ? '#ff7a00' : '#94a3b8';
                  return (
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'relative', opacity: isPassed ? 1 : 0.6 }}>
                      <div style={{ position: 'absolute', left: '-22px', top: '4px', width: '12px', height: '12px', borderRadius: '50%', backgroundColor: dotColor, border: '3px solid #ffffff', boxShadow: `0 0 0 2px ${dotColor}` }}></div>
                      <div>
                        <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--black)' }}>Preparation End Time</div>
                        <div style={{ fontSize: '11px', color: '#64748b' }}>Plating and quality check complete</div>
                      </div>
                      <div style={{ fontSize: '13px', fontWeight: 600, fontFamily: 'monospace' }}>{timeStr}</div>
                    </div>
                  );
                })()}

                {/* Step 4: Food Ready */}
                {(() => {
                  const isPassed = ['ready', 'done'].includes(selectedKitchenTimeline.status);
                  const timeStr = isPassed ? addMinutes(selectedKitchenTimeline.time, 14) : '--';
                  const dotColor = isPassed ? '#ff7a00' : '#94a3b8';
                  return (
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'relative', opacity: isPassed ? 1 : 0.6 }}>
                      <div style={{ position: 'absolute', left: '-22px', top: '4px', width: '12px', height: '12px', borderRadius: '50%', backgroundColor: dotColor, border: '3px solid #ffffff', boxShadow: `0 0 0 2px ${dotColor}` }}></div>
                      <div>
                        <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--black)' }}>Food Ready Time</div>
                        <div style={{ fontSize: '11px', color: '#64748b' }}>Notification dispatched to waiter</div>
                      </div>
                      <div style={{ fontSize: '13px', fontWeight: 600, fontFamily: 'monospace' }}>{timeStr}</div>
                    </div>
                  );
                })()}

                {/* Step 5: Waiter Pickup */}
                {(() => {
                  const isPassed = selectedKitchenTimeline.status === 'done';
                  const timeStr = isPassed ? addMinutes(selectedKitchenTimeline.time, 17) : '--';
                  const dotColor = isPassed ? '#ff7a00' : '#94a3b8';
                  return (
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'relative', opacity: isPassed ? 1 : 0.6 }}>
                      <div style={{ position: 'absolute', left: '-22px', top: '4px', width: '12px', height: '12px', borderRadius: '50%', backgroundColor: dotColor, border: '3px solid #ffffff', boxShadow: `0 0 0 2px ${dotColor}` }}></div>
                      <div>
                        <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--black)' }}>Waiter Pickup Time</div>
                        <div style={{ fontSize: '11px', color: '#64748b' }}>Food removed from pickup counter</div>
                      </div>
                      <div style={{ fontSize: '13px', fontWeight: 600, fontFamily: 'monospace' }}>{timeStr}</div>
                    </div>
                  );
                })()}
              </div>

              {/* Durations list */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: '10px' }}>
                <div style={{ backgroundColor: 'var(--bg-tertiary)', padding: '12px', borderRadius: '8px' }}>
                  <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 600 }}>PREPARATION DURATION</span>
                  <div style={{ fontSize: '14px', fontWeight: 700, marginTop: '4px', color: 'var(--black)' }}>
                    {['ready', 'done'].includes(selectedKitchenTimeline.status) ? '10 Minutes' : selectedKitchenTimeline.status === 'preparing' ? 'In Progress' : '--'}
                  </div>
                </div>
                <div style={{ backgroundColor: 'var(--bg-tertiary)', padding: '12px', borderRadius: '8px' }}>
                  <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 600 }}>PICKUP DELAY DURATION</span>
                  <div style={{ fontSize: '14px', fontWeight: 700, marginTop: '4px', color: 'var(--black)' }}>
                    {selectedKitchenTimeline.status === 'done' ? '3 Minutes' : '--'}
                  </div>
                </div>
              </div>

              {/* Dismiss Button */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '10px' }}>
                <button className="btn btn-black" style={{ padding: '8px 24px' }} onClick={() => {
                  setShowKitchenTimelineModal(false);
                  setSelectedKitchenTimeline(null);
                }}>
                  Dismiss
                </button>
              </div>
            </div>
          </Modal>
        )}

        {/* KITCHEN ITEM DETAILS MODAL */}
        {selectedKitchenDetails && (
          <Modal
            isOpen={showKitchenDetailsModal}
            onClose={() => {
              setShowKitchenDetailsModal(false);
              setSelectedKitchenDetails(null);
            }}
            title={`Dish Details: KOT-${selectedKitchenDetails.id}`}
            maxWidth="550px"
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', color: 'var(--text-main)', marginTop: '10px' }}>
              <div style={{ overflowX: 'auto', border: '1.5px solid var(--border)', borderRadius: '8px' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                  <thead>
                    <tr style={{ backgroundColor: 'var(--bg-tertiary)', borderBottom: '1.5px solid var(--border)' }}>
                      <th style={{ padding: '10px 12px', fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)' }}>DISH NAME</th>
                      <th style={{ padding: '10px 12px', fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)' }}>CATEGORY</th>
                      <th style={{ padding: '10px 12px', fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)' }}>QTY</th>
                      <th style={{ padding: '10px 12px', fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)' }}>PRIORITY</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedKitchenDetails.items.map((it, idx) => {
                      const cat = menu.find(m => m.name === it.name)?.category || 'Main Course';
                      const priority = getOrderPriority(selectedKitchenDetails);
                      return (
                        <tr key={idx} style={{ borderBottom: '1px solid var(--border)' }}>
                          <td style={{ padding: '10px 12px', fontWeight: 600 }}>{it.name}</td>
                          <td style={{ padding: '10px 12px' }}>{cat}</td>
                          <td style={{ padding: '10px 12px', fontWeight: 'bold' }}>{it.qty}</td>
                          <td style={{ padding: '10px 12px' }}>
                            <span style={{
                              padding: '2px 6px',
                              borderRadius: '4px',
                              fontSize: '11px',
                              fontWeight: 700,
                              backgroundColor: priority === 'Urgent' ? 'var(--danger-light)' : 'var(--bg-tertiary)',
                              color: priority === 'Urgent' ? 'var(--danger)' : '#64748b'
                            }}>
                              {priority}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Special Instructions block */}
              <div style={{ backgroundColor: 'var(--bg-tertiary)', padding: '14px', borderRadius: '10px' }}>
                <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>Special Instructions</span>
                <p style={{ fontSize: '13px', margin: '6px 0 0 0', fontWeight: 600, color: selectedKitchenDetails.notes ? 'var(--black)' : '#64748b', fontStyle: selectedKitchenDetails.notes ? 'normal' : 'italic' }}>
                  {selectedKitchenDetails.notes || 'No special instructions recorded for this order.'}
                </p>
              </div>

              {/* Form Actions */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '10px' }}>
                <button
                  className="btn btn-black"
                  style={{ padding: '8px 24px' }}
                  onClick={() => {
                    setShowKitchenDetailsModal(false);
                    setSelectedKitchenDetails(null);
                  }}
                >
                  Dismiss
                </button>
              </div>
            </div>
          </Modal>
        )}
      </main>
    </div>
  );
} 
