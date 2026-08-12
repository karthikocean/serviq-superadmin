import React, { useState, useEffect } from 'react'
import {
  QrCode,
  ChefHat,
  Navigation,
  LayoutDashboard,
  Settings,
  ChevronRight,
  ChevronDown,
  Bell,
  Sun,
  Moon,
  UtensilsCrossed,
  Layers,
  Inbox,
  FolderLock,
  Calculator,
  UserCheck,
  Users,
  Maximize2,
  Building,
  CreditCard,
  Activity,
  LogOut,
  Grid,
  ShieldCheck,
  Lock,
  User,
  CheckCircle2,
  XCircle,
  Info,
  Briefcase,
  LifeBuoy,
  BellRing,
  BarChart3,
  Globe,
  Mail,
  MessageSquare,
  Shield,
  Eye,
  EyeOff,
  Save,
  RefreshCw,
  Server,
  Smartphone,
  Clock,
  Menu
} from 'lucide-react'
import './App.css'

// Import components
import Login from './components/Login'
import SuperAdminDashboard from './components/SuperAdminDashboard'

// Define default menu items matching wireframes
const INITIAL_MENU = [
  {
    id: 1,
    name: 'Paneer Tikka',
    category: 'Starters',
    price: 180,
    description: 'Charcoal grilled cottage cheese cubes marinated in rich Indian spices.',
    available: true,
    image: 'https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?w=500&auto=format&fit=crop&q=60'
  },
  {
    id: 2,
    name: 'Chicken Biryani',
    category: 'Mains',
    price: 320,
    description: 'Fragrant basmati rice cooked with tender chicken, herbs, and spices.',
    available: true,
    image: 'https://images.unsplash.com/photo-1633945274405-b6c8069047b0?w=500&auto=format&fit=crop&q=60'
  },
  {
    id: 3,
    name: 'Masala Dosa',
    category: 'Mains',
    price: 120,
    description: 'Crispy rice-lentil crepe stuffed with spiced potato mash.',
    available: false, // Matching Masala Dosa "Unavailable" switch in Menu Management wireframe
    image: 'https://images.unsplash.com/photo-1668236543090-82eba5ee5976?w=500&auto=format&fit=crop&q=60'
  },
  {
    id: 4,
    name: 'Dal Makhani',
    category: 'Mains',
    price: 160,
    description: 'Slow-cooked black lentils cooked overnight with butter and fresh cream.',
    available: true,
    image: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=500&auto=format&fit=crop&q=60'
  },
  {
    id: 5,
    name: 'Gulab Jamun',
    category: 'Desserts',
    price: 80,
    description: 'Deep-fried milk dumplings soaked in cardamom flavored sugar syrup.',
    available: true,
    image: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=500&auto=format&fit=crop&q=60'
  },
  {
    id: 6,
    name: 'Masala Chai',
    category: 'Drinks',
    price: 40,
    description: 'Traditional Indian tea infused with aromatic spices and ginger.',
    available: true,
    image: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=500&auto=format&fit=crop&q=60'
  },
  {
    id: 7,
    name: 'Lassi',
    category: 'Drinks',
    price: 60,
    description: 'Creamy yogurt beverage sweetened with sugar and rose water.',
    available: true,
    image: 'https://images.unsplash.com/photo-1553530666-ba11a7da3888?w=500&auto=format&fit=crop&q=60'
  },
  {
    id: 8,
    name: 'Veg Thali',
    category: 'Mains',
    price: 250,
    description: 'A complete Indian platter featuring assorted curries, bread, and rice.',
    available: true,
    image: 'https://images.unsplash.com/photo-1610192244261-3f33de3f55e4?w=500&auto=format&fit=crop&q=60'
  },
  {
    id: 9,
    name: 'Butter Naan',
    category: 'Mains',
    price: 40,
    description: 'Soft tandoori flatbread brushed generously with butter.',
    available: true,
    image: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=500&auto=format&fit=crop&q=60'
  },
  {
    id: 10,
    name: 'Filter Coffee',
    category: 'Drinks',
    price: 50,
    description: 'Traditional South Indian frothy chicory blend coffee.',
    available: true,
    image: 'https://images.unsplash.com/photo-1497534446932-c925b458314e?w=500&auto=format&fit=crop&q=60'
  }
]

// Define initial tables matching tables section of the wireframe
const INITIAL_TABLES = [
  { id: 'T-01', name: 'Table 01', status: 'Occupied', seats: 4 },
  { id: 'T-02', name: 'Table 02', status: 'Free', seats: 2 },
  { id: 'T-03', name: 'Table 03', status: 'Occupied', seats: 6 },
  { id: 'T-04', name: 'Table 04', status: 'Cleaning', seats: 4 },
  { id: 'T-05', name: 'Table 05', status: 'Free', seats: 8 },
  { id: 'T-06', name: 'Table 06', status: 'Occupied', seats: 4 },
  { id: 'T-07', name: 'Table 07', status: 'Free', seats: 2 }
]

// Define initial staff terminals
const INITIAL_STAFF = [
  { id: 1, name: 'Chef Rajesh', role: 'kitchen', email: 'chef@serviq.com', position: 'Head Chef', phone: '9876543210', status: 'Active' },
  { id: 2, name: 'Waiter Amit', role: 'waiter', email: 'waiter1@serviq.com', position: 'Lead Waiter', phone: '9876543211', status: 'Active' }
]

// Define initial restaurant admins
const INITIAL_ADMINS = [
  { id: 'ADM-01', name: 'Rajesh Kumar', email: 'rajesh@serviq.com', phone: '+91 98765 43210', restaurantName: 'Serviq Grand Bistro', role: 'Branch Admin', status: 'Active', lastLogin: '2026-06-02 12:45 PM' },
  { id: 'ADM-02', name: 'Amit Patel', email: 'amit@serviq.com', phone: '+91 98765 11111', restaurantName: 'Serviq Express Cafe', role: 'Branch Manager', status: 'Active', lastLogin: '2026-06-02 11:30 AM' },
  { id: 'ADM-03', name: 'Vikram Singh', email: 'vikram@serviq.com', phone: '+91 98765 22222', restaurantName: 'Serviq Lounge & Bar', role: 'Branch Admin', status: 'Disabled', lastLogin: '2026-05-30 09:15 PM' }
]

// Define initial restaurant details for superadmin configurations (5+ restaurants)
const INITIAL_RESTAURANTS = [
  {
    id: 'R-01',
    name: 'Serviq',
    legalName: 'Serviq Hospitality Pvt. Ltd.',
    ownerName: 'Rajesh Kumar',
    mobileNumber: '+91 98765 43210',
    phone: '+91 98765 43210',
    email: 'contact@serviqbistro.com',
    website: 'https://serviqbistro.com',
    address: '12, Khader Nawaz Khan Road, Nungambakkam',
    city: 'Chennai',
    state: 'Tamil Nadu',
    country: 'India',
    license: 'FSSAI-12345678901234',
    gstin: '33AAAAA1111A1Z1',
    currency: 'INR',
    taxRate: 5, // 5% GST
    serviceCharge: 5, // 5% Service Charge
    openingTime: '11:00 AM',
    closingTime: '11:00 PM',
    status: 'Active', // 'Active', 'Suspended', 'Inactive'
    subscriptionPlan: 'Premium',
    subscriptionStatus: 'Active',
    expiryDate: '2026-12-15',
    createdDate: '2025-01-15',
    logo: 'https://images.unsplash.com/photo-1552566626-52f8b828add9?w=120&auto=format&fit=crop&q=60',
    banner: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1000&auto=format&fit=crop&q=60'
  },
  {
    id: 'R-02',
    name: 'Serviq Express Cafe',
    legalName: 'Serviq QSR Pvt. Ltd.',
    ownerName: 'Amit Patel',
    mobileNumber: '+91 98765 11111',
    phone: '+91 98765 11111',
    email: 'contact@serviqcafe.com',
    website: 'https://serviqcafe.com',
    address: '45, Usman Road, T-Nagar',
    city: 'Chennai',
    state: 'Tamil Nadu',
    country: 'India',
    license: 'FSSAI-56789012345678',
    gstin: '33BBBBB2222B2Z2',
    currency: 'INR',
    taxRate: 5,
    serviceCharge: 0,
    openingTime: '08:00 AM',
    closingTime: '10:00 PM',
    status: 'Active',
    subscriptionPlan: 'Premium',
    subscriptionStatus: 'Active',
    expiryDate: '2026-09-22',
    createdDate: '2025-03-22',
    logo: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=120&auto=format&fit=crop&q=60',
    banner: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=1000&auto=format&fit=crop&q=60'
  },
  {
    id: 'R-03',
    name: 'Serviq Lounge & Bar',
    legalName: 'Serviq Entertainment India',
    ownerName: 'Vikram Singh',
    mobileNumber: '+91 98765 22222',
    phone: '+91 98765 22222',
    email: 'contact@serviqlounge.com',
    website: 'https://serviqlounge.com',
    address: '78, Rajiv Gandhi Salai, OMR',
    city: 'Chennai',
    state: 'Tamil Nadu',
    country: 'India',
    license: 'FSSAI-90123456789012',
    gstin: '33CCCCC3333C3Z3',
    currency: 'INR',
    taxRate: 18,
    serviceCharge: 7.5,
    openingTime: '04:00 PM',
    closingTime: '12:00 AM',
    status: 'Active',
    subscriptionPlan: 'Premium',
    subscriptionStatus: 'Active',
    expiryDate: '2026-06-30',
    createdDate: '2025-06-10',
    logo: 'https://images.unsplash.com/photo-1574096079513-d8259312b785?w=120&auto=format&fit=crop&q=60',
    banner: 'https://images.unsplash.com/photo-1485686531765-ba63b07845a7?w=1000&auto=format&fit=crop&q=60'
  },
  {
    id: 'R-04',
    name: 'Serviq Traditional',
    legalName: 'Serviq South Indian Foods',
    ownerName: 'Deepa Venkat',
    mobileNumber: '+91 98765 33333',
    phone: '+91 98765 33333',
    email: 'contact@serviqsouth.com',
    website: 'https://serviqsouth.com',
    address: '9, East Mada Street, Mylapore',
    city: 'Chennai',
    state: 'Tamil Nadu',
    country: 'India',
    license: 'FSSAI-23456789012345',
    gstin: '33DDDDD4444D4Z4',
    currency: 'INR',
    taxRate: 5,
    serviceCharge: 2.5,
    openingTime: '06:00 AM',
    closingTime: '09:00 PM',
    status: 'Active',
    subscriptionPlan: 'Standard',
    subscriptionStatus: 'Expiring Soon',
    expiryDate: '2026-06-15',
    createdDate: '2025-09-05',
    logo: 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=120&auto=format&fit=crop&q=60',
    banner: 'https://images.unsplash.com/photo-1552566626-52f8b828add9?w=1000&auto=format&fit=crop&q=60'
  },
  {
    id: 'R-05',
    name: 'Serviq',
    legalName: 'Serviq Patisseries Ltd.',
    ownerName: 'Siddharth Rao',
    mobileNumber: '+91 98765 44444',
    phone: '+91 98765 44444',
    email: 'contact@serviqbakery.com',
    website: 'https://serviqbakery.com',
    address: '23, Sardar Patel Road, Adyar',
    city: 'Chennai',
    state: 'Tamil Nadu',
    country: 'India',
    license: 'FSSAI-34567890123456',
    gstin: '33EEEEE5555E5Z5',
    currency: 'INR',
    taxRate: 12,
    serviceCharge: 0,
    openingTime: '09:00 AM',
    closingTime: '09:30 PM',
    status: 'Active',
    subscriptionPlan: 'Standard',
    subscriptionStatus: 'Expired',
    expiryDate: '2026-05-18',
    createdDate: '2025-11-18',
    logo: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=120&auto=format&fit=crop&q=60',
    banner: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=1000&auto=format&fit=crop&q=60'
  }
]

// Define initial active orders matching dashboard live order feed and the user-provided screenshot
const INITIAL_ORDERS = [
  {
    id: '#ORD-042',
    table: 'T-01',
    waiter: 'Ravi M.',
    items: [
      { name: 'Paneer Tikka', quantity: 2, price: 140 },
      { name: 'Dal Makhani', quantity: 1, price: 160 }
    ],
    time: '12:34',
    timestamp: new Date(Date.now() - 600000),
    status: 'Preparing',
    payment: 'Pending',
    note: ''
  },
  {
    id: '#ORD-043',
    table: 'T-03',
    waiter: 'Rahul S.',
    items: [
      { name: 'Butter Chicken', quantity: 2, price: 260 },
      { name: 'Gulab Jamun', quantity: 1, price: 80 }
    ],
    time: '12:21',
    timestamp: new Date(Date.now() - 1200000),
    status: 'Ready',
    payment: 'Pending',
    note: ''
  },
  {
    id: '#ORD-044',
    table: 'T-06',
    waiter: 'Arjun K.',
    items: [
      { name: 'Chicken 65', quantity: 1, price: 180 },
      { name: 'Masala Chai', quantity: 2, price: 40 }
    ],
    time: '12:10',
    timestamp: new Date(Date.now() - 1800000),
    status: 'Delivered',
    payment: 'Paid',
    note: ''
  },
  {
    id: '#ORD-045',
    table: 'T-08',
    waiter: 'Ravi M.',
    items: [
      { name: 'Fish Curry', quantity: 2, price: 250 },
      { name: 'Mango Lassi', quantity: 2, price: 60 }
    ],
    time: '12:40',
    timestamp: new Date(Date.now() - 300000),
    status: 'Pending',
    payment: 'Pending',
    note: ''
  },
  {
    id: '#ORD-040',
    table: 'T-02',
    waiter: 'Rahul S.',
    items: [
      { name: 'Paneer Tikka', quantity: 1, price: 140 },
      { name: 'Masala Chai', quantity: 1, price: 40 }
    ],
    time: '11:55',
    timestamp: new Date(Date.now() - 3600000),
    status: 'Paid',
    payment: 'Paid',
    note: ''
  }
]

export default function App() {
  // Get saved session from localStorage on initial render
  const savedSession = (() => {
    try {
      const item = localStorage.getItem('serviq_session')
      return item ? JSON.parse(item) : null
    } catch (e) {
      return null
    }
  })()

  // Simulator states
  const [role, setRole] = useState(savedSession?.role || 'login') // 'login', 'admin', 'customer', 'kitchen', 'waiter', 'billing'
  const [adminTab, setAdminTab] = useState(savedSession?.adminTab || 'dashboard') // 'dashboard', 'incoming-orders', 'menu-management', 'billing', 'tables', 'settings'
  const [darkMode, setDarkMode] = useState(false)
  const [isSuperAdmin, setIsSuperAdmin] = useState(savedSession?.isSuperAdmin ?? false)

  // Persist session to localStorage on change
  useEffect(() => {
    if (role && role !== 'login') {
      localStorage.setItem('serviq_session', JSON.stringify({
        role,
        isSuperAdmin,
        adminTab
      }))
    } else {
      localStorage.removeItem('serviq_session')
    }
  }, [role, isSuperAdmin, adminTab])

  const [adminProfileDropdownOpen, setAdminProfileDropdownOpen] = useState(false)
  const [usersDropdownOpen, setUsersDropdownOpen] = useState(false)
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)
  const adminProfileRef = React.useRef(null)
  const [notifications, setNotifications] = useState([
    'New Order #847 placed on Table 03',
    'Special Request: allergy notes on Table 01 order',
    'Table 05 order marked ready by Kitchen'
  ])
  const [showNotificationDropdown, setShowNotificationDropdown] = useState(false)
  const [billingSelectedTableId, setBillingSelectedTableId] = useState(null)

  // Live clock state
  const [currentDateTime, setCurrentDateTime] = useState('')

  useEffect(() => {
    const formatDateTime = () => {
      const now = new Date()
      const day = String(now.getDate()).padStart(2, '0')
      const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
      const month = monthNames[now.getMonth()]
      const year = now.getFullYear()
      let hours = now.getHours()
      const minutes = String(now.getMinutes()).padStart(2, '0')
      const seconds = String(now.getSeconds()).padStart(2, '0')
      const ampm = hours >= 12 ? 'PM' : 'AM'
      hours = hours % 12 || 12
      const hoursStr = String(hours).padStart(2, '0')
      return `${day}-${month}-${year} ${hoursStr}:${minutes}:${seconds} ${ampm}`
    }
    setCurrentDateTime(formatDateTime())
    const timer = setInterval(() => setCurrentDateTime(formatDateTime()), 1000)
    return () => clearInterval(timer)
  }, [])


  // Custom interactive notifications and alert modals
  const [toasts, setToasts] = useState([])
  const [confirmModal, setConfirmModal] = useState({
    open: false,
    title: '',
    message: '',
    onConfirm: null
  })

  const showToast = (type, message) => {
    const id = Date.now()
    setToasts(prev => [...prev, { id, type, message }])
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id))
    }, 4000)
  }

  const showConfirm = (title, message, onConfirm) => {
    setConfirmModal({
      open: true,
      title,
      message,
      onConfirm: () => {
        onConfirm()
        setConfirmModal(prev => ({ ...prev, open: false }))
      }
    })
  }

  // Shared application states
  const [menuItems, setMenuItems] = useState(INITIAL_MENU)
  const [tables, setTables] = useState(INITIAL_TABLES)
  const [orders, setOrders] = useState(INITIAL_ORDERS)
  const [staffMembers, setStaffMembers] = useState(INITIAL_STAFF)
  const [restaurants, setRestaurants] = useState(INITIAL_RESTAURANTS)
  const [activeRestaurantId, setActiveRestaurantId] = useState('R-01')
  const [restaurantAdmins, setRestaurantAdmins] = useState(INITIAL_ADMINS)

  // Settings view sub-tab and platform settings state
  const [settingsSubTab, setSettingsSubTab] = useState('platform') // 'profile' or 'platform'
  const [platformSettingsActiveSection, setPlatformSettingsActiveSection] = useState('company') // 'company', 'payment', 'communication', 'security'

  const DEFAULT_PLATFORM_SETTINGS = {
    companyName: 'ServeIQ Super',
    logo: 'https://images.unsplash.com/photo-1552566626-52f8b828add9?w=120&auto=format&fit=crop&q=60',
    contactPhone: '+91 98765 43210',
    contactEmail: 'support@serveiq.com',
    companyAddress: '12, Khader Nawaz Khan Road, Nungambakkam, Chennai, Tamil Nadu - 600006',

    razorpayEnabled: true,
    razorpayKeyId: 'rzp_live_8Fh9Dk2m1J9s8q',
    razorpayKeySecret: 'sk_live_secret_razorpay_key_9021',
    stripeEnabled: false,
    stripePublishableKey: 'pk_live_51NzkLySJH783jds81',
    stripeSecretKey: 'sk_live_secret_stripe_key_4432',

    smtpHost: 'smtp.sendgrid.net',
    smtpPort: '587',
    smtpUser: 'apikey',
    smtpPassword: 'sg_key_smtp_provider_credential_9918',
    smsEnabled: true,
    smsProvider: 'Twilio',
    smsApiKey: 'twilio_auth_token_9018273645',
    smsSenderId: 'SRVIQ',
    whatsappEnabled: false,
    whatsappProvider: 'Meta Cloud API',
    whatsappToken: 'whatsapp_permanent_access_token_10029',
    whatsappPhoneId: '1098273645',

    minPasswordLength: 8,
    requireUppercase: true,
    requireNumbers: true,
    requireSpecialChars: true,
    sessionTimeout: 30,
    timeoutAction: 'logout'
  }

  const [platformSettings, setPlatformSettings] = useState({ ...DEFAULT_PLATFORM_SETTINGS })

  const [showPassFields, setShowPassFields] = useState({
    razorpaySecret: false,
    stripeSecret: false,
    smtpPass: false,
    smsApiKey: false,
    whatsappToken: false
  })

  const [logoPresetsModalOpen, setLogoPresetsModalOpen] = useState(false)

  // Dynamic Lookup of active restaurant details
  const restaurantDetails = restaurants.find(r => r.id === activeRestaurantId) || restaurants[0]

  const handleUpdateRestaurantDetails = (updatedDetails) => {
    setRestaurants(restaurants.map(r => r.id === updatedDetails.id ? updatedDetails : r))
  }

  // Customer Specific session states
  const [customerTable, setCustomerTable] = useState(null)
  const [activeCustomerOrder, setActiveCustomerOrder] = useState(null)

  // System Stats states matching wireframe metrics
  const [stats, setStats] = useState({
    revenue: 12480, // Today's Revenue (₹12,480 in screenshot)
    totalOrdersCount: 38 // Total Orders (38 in screenshot)
  })

  // Handle URL Table parameters dynamically (QR code scan simulation)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const tableParam = params.get('table')
    if (tableParam) {
      const matchingTable = tables.find(t =>
        t.id.toLowerCase() === tableParam.toLowerCase() ||
        t.name.toLowerCase() === tableParam.toLowerCase()
      )
      if (matchingTable) {
        setRole('customer')
        setCustomerTable(matchingTable.name)
        showToast('success', `Welcome to ${matchingTable.name}! Direct ordering enabled.`)
      } else {
        showToast('error', `Table ${tableParam} not found in registry.`)
      }
    }
  }, [tables])

  // Synchronize customer active order tracking dynamically based on selected table session
  useEffect(() => {
    if (customerTable) {
      // Find the most recent active order for this table that hasn't been completed/billed yet
      const activeOrder = orders.find(o => o.table === customerTable && o.status !== 'Billed' && o.status !== 'Done')
      if (activeOrder) {
        if (!activeCustomerOrder || activeCustomerOrder.id !== activeOrder.id || activeCustomerOrder.status !== activeOrder.status) {
          setActiveCustomerOrder(activeOrder)
        }
      } else {
        if (activeCustomerOrder) {
          setActiveCustomerOrder(null)
        }
      }
    } else {
      if (activeCustomerOrder) {
        setActiveCustomerOrder(null)
      }
    }
  }, [orders, customerTable, activeCustomerOrder])

  // Synchronize users dropdown open state when active tab changes
  useEffect(() => {
    if (adminTab === 'super-platform-admins' || adminTab === 'super-roles' || adminTab === 'super-users-list') {
      setUsersDropdownOpen(true)
    }
  }, [adminTab])

  // Close admin profile dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (adminProfileRef.current && !adminProfileRef.current.contains(event.target)) {
        setAdminProfileDropdownOpen(false)
      }
    }
    if (adminProfileDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside)
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [adminProfileDropdownOpen])

  // Automatically compute statistical values
  const getComputedStats = () => {
    const pendingCount = orders.filter(o => o.status !== 'Done' && o.status !== 'Billed').length
    return {
      revenue: stats.revenue,
      totalOrdersCount: stats.totalOrdersCount,
      pendingOrdersCount: pendingCount
    }
  }

  // Handle dark mode toggle
  const toggleDarkMode = () => {
    setDarkMode(!darkMode)
    document.body.classList.toggle('dark-mode')
  }

  // EVENT HANDLERS

  // 1. Placing a customer order
  const handlePlaceOrder = (cartItems, note) => {
    const nextOrderNum = orders.length > 0
      ? Math.max(...orders.map(o => {
        const cleanId = o.id.replace('#ORD-', '').replace('#', '')
        const parsed = parseInt(cleanId)
        return isNaN(parsed) ? 0 : parsed
      })) + 1
      : 46

    const formattedId = `#ORD-${nextOrderNum < 10 ? '00' + nextOrderNum : nextOrderNum < 100 ? '0' + nextOrderNum : nextOrderNum}`
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })

    const newOrder = {
      id: formattedId,
      table: customerTable,
      waiter: 'Self Order',
      items: cartItems.map(item => ({
        name: item.name,
        quantity: item.quantity,
        price: item.price
      })),
      time: timeStr,
      timestamp: new Date(),
      status: 'Pending',
      payment: 'Pending',
      note: note
    }

    // Update state
    setOrders([newOrder, ...orders])
    setTables(tables.map(t => t.name === customerTable ? { ...t, status: 'Occupied' } : t))
    setStats(prev => ({
      ...prev,
      totalOrdersCount: prev.totalOrdersCount + 1
    }))
    setActiveCustomerOrder(newOrder)

    // Add system notification
    const alertMsg = `New order ${formattedId} received from ${customerTable}`
    setNotifications([alertMsg, ...notifications])
  }

  // 2. Updating order status (Admin accept / Kitchen prepare / Waiter delivery)
  const handleUpdateOrderStatus = (orderId, newStatus) => {
    setOrders(orders.map(o => o.id === orderId ? { ...o, status: newStatus } : o))

    // Send notifications for key status changes
    if (newStatus === 'Preparing') {
      const order = orders.find(o => o.id === orderId)
      setNotifications([`${orderId} is now being prepared for ${order.table}`, ...notifications])
    } else if (newStatus === 'Ready') {
      const order = orders.find(o => o.id === orderId)
      setNotifications([`${orderId} is READY for delivery to ${order.table}`, ...notifications])
    } else if (newStatus === 'Done' || newStatus === 'Delivered') {
      const order = orders.find(o => o.id === orderId)
      setNotifications([`Order ${orderId} delivered to ${order.table}`, ...notifications])
    }
  }

  // Delete an order
  const handleDeleteOrder = (orderId) => {
    setOrders(orders.filter(o => o.id !== orderId))
    showToast('success', `Order ${orderId} deleted successfully!`)
  }

  // Update/Edit an order fully
  const handleUpdateOrder = (updatedOrder) => {
    setOrders(orders.map(o => o.id === updatedOrder.id ? updatedOrder : o))
    showToast('success', `Order ${updatedOrder.id} updated successfully!`)
  }

  // 3. Billing & checkout for a table
  const handleCheckoutTable = (tableId, billAmount, tableOrderIds) => {
    // Free the table
    setTables(tables.map(t => t.id === tableId ? { ...t, status: 'Free' } : t))

    // Add amount to revenue
    setStats(prev => ({
      ...prev,
      revenue: prev.revenue + billAmount
    }))

    // Clear order associations (set status of these orders to 'Billed' so they leave KDS/Waiter lists)
    setOrders(orders.map(o => tableOrderIds.includes(o.id) ? { ...o, status: 'Billed' } : o))

    // Clear customer sessions matching that table
    const checkTable = tables.find(t => t.id === tableId)
    if (customerTable === checkTable?.name) {
      setCustomerTable(null)
      setActiveCustomerOrder(null)
    }

    setNotifications([`Table ${tableId} completed billing and is now FREE`, ...notifications])
  }

  // Table CRUD operations
  const handleAddTable = (newTable) => {
    setTables([...tables, newTable])
  }

  const handleUpdateTable = (id, updatedTable) => {
    setTables(tables.map(t => t.id === id ? updatedTable : t))
  }

  const handleDeleteTable = (id) => {
    showConfirm(
      'Delete Table Profile',
      'Are you sure you want to permanently delete this table profile registry? This action cannot be undone.',
      () => {
        setTables(tables.filter(t => t.id !== id))
        showToast('success', 'Table profile registry deleted successfully!')
      }
    )
  }

  // 4. Menu CRUD operations
  const handleUpdateMenuItem = (id, updatedItem) => {
    setMenuItems(menuItems.map(item => item.id === id ? updatedItem : item))
  }

  const handleDeleteMenuItem = (id) => {
    showConfirm(
      'Delete Menu Item',
      'Are you sure you want to permanently delete this menu item from the SimStudio registry? This action cannot be undone.',
      () => {
        setMenuItems(menuItems.filter(item => item.id !== id))
        showToast('success', 'Menu item deleted successfully!')
      }
    )
  }

  const handleAddMenuItem = (newItem) => {
    const nextId = menuItems.length > 0 ? Math.max(...menuItems.map(i => i.id)) + 1 : 1
    const itemToAdd = { ...newItem, id: nextId }
    setMenuItems([...menuItems, itemToAdd])
  }

  // 5. Staff CRUD operations
  const handleUpdateStaffMember = (id, updatedStaff) => {
    setStaffMembers(staffMembers.map(s => s.id === id ? updatedStaff : s))
  }

  const handleDeleteStaffMember = (id) => {
    showConfirm(
      'Delete Staff Profile',
      'Are you sure you want to permanently delete this staff member terminal registration? This action cannot be undone.',
      () => {
        setStaffMembers(staffMembers.filter(s => s.id !== id))
        showToast('success', 'Staff terminal registration deleted successfully!')
      }
    )
  }

  const handleAddStaffMember = (newStaff) => {
    const nextId = staffMembers.length > 0 ? Math.max(...staffMembers.map(s => s.id)) + 1 : 1
    const staffToAdd = { ...newStaff, id: nextId }
    setStaffMembers([...staffMembers, staffToAdd])
  }

  // Helper: Format system date and time
  const getSystemDateTime = () => {
    return '' // Removed per user request
  }

  const getTabSubtext = () => {
    switch (adminTab) {
      case 'dashboard': return getSystemDateTime();
      case 'menu-management': return 'Add, edit, and manage your menu items';
      case 'billing': return 'Process payments and generate invoices';
      case 'tables': return 'Monitor and manage restaurant table status';
      case 'staff-master': return 'Manage KDS and Waiter terminals and logins';
      case 'settings': return 'Configure your restaurant dashboard';
      default: return getSystemDateTime();
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: role === 'login' ? 'auto' : '100vh', minHeight: '100vh', overflow: role === 'login' ? 'visible' : 'hidden' }}>

      {role === 'login' ? (
        <Login
          onLogin={(selectedRole) => {
            if (selectedRole === 'billing') {
              setRole('admin')
              setAdminTab('billing')
              setIsSuperAdmin(false)
            } else if (selectedRole === 'superadmin') {
              setRole('admin')
              setAdminTab('super-revenue')
              setIsSuperAdmin(true)
            } else {
              setRole(selectedRole)
              setIsSuperAdmin(false)
              if (selectedRole === 'customer') {
                setCustomerTable('Table 04') // Seed default table
              } else if (selectedRole === 'admin') {
                setAdminTab('dashboard')
              }
            }
          }}
          darkMode={darkMode}
          onToggleDarkMode={toggleDarkMode}
          showToast={showToast}
        />
      ) : (
        <>
          {/* SIMULATOR ROLE CONTROLLER BAR */}
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
                    onClick={() => {
                      setRole('login')
                      setCustomerTable(null)
                      setActiveCustomerOrder(null)
                      setIsSuperAdmin(false)
                      setAdminTab('dashboard')
                    }}
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
                            <div onClick={() => { setAdminTab('settings'); setAdminProfileDropdownOpen(false); }} style={{ padding: '10px 16px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', color: 'var(--text-main)', borderRadius: '6px' }} onMouseOver={(e) => e.currentTarget.style.background = 'var(--bg-hover)'} onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}>
                              <UserCheck style={{ width: '14px', height: '14px' }} /> Profile
                            </div>
                          )}
                          <div onClick={() => { setRole('login'); setCustomerTable(null); setActiveCustomerOrder(null); setIsSuperAdmin(false); setAdminTab('dashboard'); setAdminProfileDropdownOpen(false); }} style={{ padding: '10px 16px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', color: '#ef4444', borderRadius: '6px' }} onMouseOver={(e) => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)'} onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}>
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

          {/* CORE SIMULATED INTERFACE CONTAINER */}
          <div className="app-container" style={{ height: 'auto', flex: 1 }}>

            {/* ROLE: ADMIN (WITH SIDEBAR & TAB CONTENT) */}
            {role === 'admin' && (
              <>
                {/* Sidebar */}
                <div className={`sidebar ${isSidebarCollapsed ? 'collapsed' : ''}`}>
                  <div>
                    {!isSuperAdmin && (
                      <div className="sidebar-header">
                        <div className="sidebar-logo-icon"><UtensilsCrossed style={{ width: '20px', height: '20px' }} /></div>
                        <div className="sidebar-logo-text">
                          <h3>QRMenu</h3>
                          <span>Standard Plan</span>
                        </div>
                      </div>
                    )}

                    <ul className="sidebar-nav">
                      {!isSuperAdmin && (
                        <>
                          <li
                            className={`sidebar-item ${adminTab === 'dashboard' ? 'active' : ''}`}
                            onClick={() => setAdminTab('dashboard')}
                          >
                            <LayoutDashboard /> <span>Dashboard</span>
                          </li>
                          <li
                            className={`sidebar-item ${adminTab === 'incoming-orders' ? 'active' : ''}`}
                            onClick={() => setAdminTab('incoming-orders')}
                          >
                            <Inbox /> <span>Incoming Orders</span>
                          </li>
                          <li
                            className={`sidebar-item ${adminTab === 'menu-management' ? 'active' : ''}`}
                            onClick={() => setAdminTab('menu-management')}
                          >
                            <UtensilsCrossed /> <span>Menu Management</span>
                          </li>
                          <li
                            className={`sidebar-item ${adminTab === 'billing' ? 'active' : ''}`}
                            onClick={() => setAdminTab('billing')}
                          >
                            <Calculator /> <span>Billing</span>
                          </li>
                          <li
                            className={`sidebar-item ${adminTab === 'tables' ? 'active' : ''}`}
                            onClick={() => setAdminTab('tables')}
                          >
                            <Grid style={{ width: '18px', height: '18px' }} /> <span>Table Management</span>
                          </li>
                          <li
                            className={`sidebar-item ${adminTab === 'staff-master' ? 'active' : ''}`}
                            onClick={() => setAdminTab('staff-master')}
                          >
                            <Users /> <span>Staff</span>
                          </li>
                          <li
                            className={`sidebar-item ${adminTab === 'settings' ? 'active' : ''}`}
                            onClick={() => setAdminTab('settings')}
                          >
                            <Settings /> <span>Settings</span>
                          </li>
                        </>
                      )}

                      {/* Super Admin ONLY Unified Menus */}
                      {isSuperAdmin && (
                        <>
                          <li
                            className={`sidebar-item ${adminTab === 'super-revenue' ? 'active' : ''}`}
                            onClick={() => setAdminTab('super-revenue')}
                          >
                            <LayoutDashboard style={{ width: '18px', height: '18px' }} /> <span>Dashboard</span>
                          </li>
                          <li
                            className={`sidebar-item ${adminTab === 'super-details' ? 'active' : ''}`}
                            onClick={() => setAdminTab('super-details')}
                          >
                            <Building style={{ width: '18px', height: '18px' }} /> <span>Restaurant</span>
                          </li>
                          <li
                            className={`sidebar-item ${adminTab === 'super-plans' ? 'active' : ''}`}
                            onClick={() => setAdminTab('super-plans')}
                          >
                            <Layers style={{ width: '18px', height: '18px' }} /> <span>Plans</span>
                          </li>
                          <li
                            className={`sidebar-item ${adminTab === 'super-subscriptions' ? 'active' : ''}`}
                            onClick={() => setAdminTab('super-subscriptions')}
                          >
                            <CheckCircle2 style={{ width: '18px', height: '18px' }} /> <span>Subscription</span>
                          </li>
                          <li
                            className={`sidebar-item ${adminTab === 'super-billing' ? 'active' : ''}`}
                            onClick={() => setAdminTab('super-billing')}
                          >
                            <CreditCard style={{ width: '18px', height: '18px' }} /> <span>Billing & Payments</span>
                          </li>
                          <li
                            className={`sidebar-item ${adminTab === 'super-leads' ? 'active' : ''}`}
                            onClick={() => setAdminTab('super-leads')}
                          >
                            <Briefcase style={{ width: '18px', height: '18px' }} /> <span>Leads/CRM</span>
                          </li>
                          <li
                            className={`sidebar-item ${adminTab === 'super-tickets' ? 'active' : ''}`}
                            onClick={() => setAdminTab('super-tickets')}
                          >
                            <LifeBuoy style={{ width: '18px', height: '18px' }} /> <span>Support Ticket</span>
                          </li>
                          <li
                            className={`sidebar-item ${adminTab === 'super-notifications' ? 'active' : ''}`}
                            onClick={() => setAdminTab('super-notifications')}
                          >
                            <BellRing style={{ width: '18px', height: '18px' }} /> <span>Notifications</span>
                          </li>
                          <li
                            className={`sidebar-item ${adminTab === 'super-reports' ? 'active' : ''}`}
                            onClick={() => setAdminTab('super-reports')}
                          >
                            <BarChart3 style={{ width: '18px', height: '18px' }} /> <span>Reports & Analytics</span>
                          </li>

                          {/* User & Role Management Dropdown Menu */}
                          <li style={{ listStyleType: 'none', padding: 0, margin: 0 }}>
                            <div
                              className="sidebar-item"
                              onClick={() => !isSidebarCollapsed && setUsersDropdownOpen(!usersDropdownOpen)}
                              style={{
                                display: 'flex',
                                justifyContent: isSidebarCollapsed ? 'center' : 'space-between',
                                alignItems: 'center',
                                color: (adminTab === 'super-users-list' || adminTab === 'super-roles') ? '#ffffff' : '#0f172a',
                                background: (adminTab === 'super-users-list' || adminTab === 'super-roles') ? '#ea580c' : 'transparent',
                              }}
                            >
                              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <Users style={{ width: '18px', height: '18px' }} />
                                {!isSidebarCollapsed && <span>User & Role</span>}
                              </div>
                              {!isSidebarCollapsed && (
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

                            {usersDropdownOpen && !isSidebarCollapsed && (
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
                                <div
                                  className={`sidebar-item ${adminTab === 'super-users-list' ? 'active' : ''}`}
                                  onClick={() => setAdminTab('super-users-list')}
                                  style={{
                                    padding: '8px 12px',
                                    fontSize: '0.85rem',
                                    fontWeight: adminTab === 'super-users-list' ? '600' : '500'
                                  }}
                                >
                                  Users
                                </div>
                                <div
                                  className={`sidebar-item ${adminTab === 'super-roles' ? 'active' : ''}`}
                                  onClick={() => setAdminTab('super-roles')}
                                  style={{
                                    padding: '8px 12px',
                                    fontSize: '0.85rem',
                                    fontWeight: adminTab === 'super-roles' ? '600' : '500'
                                  }}
                                >
                                  Roles & Permissions
                                </div>
                              </div>
                            )}
                          </li>

                          <li
                            className={`sidebar-item ${adminTab === 'settings' ? 'active' : ''}`}
                            onClick={() => setAdminTab('settings')}
                          >
                            <Settings /> <span>System Settings</span>
                          </li>
                        </>
                      )}
                    </ul>
                  </div>

                  {/* <div className="sidebar-footer">
                    <p>{restaurantDetails.name}</p>
                    <span>admin@email.com</span>
                  </div> */}
                </div>

                {/* Workspace Area */}
                <div className="workspace">
                  {/* Workspace Header */}
                  <div className="workspace-header">
                    <div className="header-title">
                      <h1 style={{ textTransform: 'capitalize' }}>
                        {adminTab === 'super-revenue' ? 'Dashboard' :
                          adminTab === 'super-details' ? 'Restaurant Management' :
                            adminTab === 'super-platform-admins' ? 'Platform Admins' :
                              adminTab === 'super-roles' ? 'Roles & Permissions' :
                                adminTab === 'super-subscriptions' ? 'Subscription Management' :
                                  adminTab === 'super-plans' ? 'Plans Management' :
                                    adminTab === 'super-billing' ? 'Billing & Payments' :
                                      adminTab === 'super-leads' ? 'Leads/CRM' :
                                        adminTab === 'super-tickets' ? 'Support Ticket Management' :
                                          adminTab === 'super-notifications' ? 'Notifications' :
                                            adminTab === 'super-reports' ? 'Reports & Analytics' :
                                              adminTab === 'super-users-list' ? 'Users' :
                                                adminTab === 'settings' ? (isSuperAdmin ? 'System Settings' : 'Profile Settings') :
                                                  adminTab.replace('-', ' ').replace('super ', '')}
                      </h1>
                      {getTabSubtext() && <p>{getTabSubtext()}</p>}
                    </div>

                    <div className="header-actions" style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                      {/* Admin Profile moved to simulator bar */}
                    </div>
                  </div>

                  {/* RENDER CHOSEN TAB */}
                  {adminTab === 'dashboard' && (
                    <AdminDashboard
                      orders={orders}
                      tables={tables}
                      stats={getComputedStats()}
                      onNavigate={setAdminTab}
                      showToast={showToast}
                    />
                  )}

                  {adminTab === 'incoming-orders' && (
                    <IncomingOrders
                      orders={orders}
                      onUpdateStatus={handleUpdateOrderStatus}
                      onDeleteOrder={handleDeleteOrder}
                      onUpdateOrder={handleUpdateOrder}
                      showToast={showToast}
                    />
                  )}

                  {adminTab === 'menu-management' && (
                    <MenuManagement
                      menuItems={menuItems}
                      onUpdateMenuItem={handleUpdateMenuItem}
                      onDeleteMenuItem={handleDeleteMenuItem}
                      onAddMenuItem={handleAddMenuItem}
                      showToast={showToast}
                    />
                  )}

                  {adminTab === 'billing' && (
                    <BillingSystem
                      orders={orders}
                      tables={tables}
                      onCheckoutTable={handleCheckoutTable}
                      showToast={showToast}
                      initialTableId={billingSelectedTableId}
                      onClearInitialTableId={() => setBillingSelectedTableId(null)}
                    />
                  )}

                  {adminTab === 'tables' && (
                    <TableManagement
                      tables={tables}
                      orders={orders}
                      onAddTable={handleAddTable}
                      onUpdateTable={handleUpdateTable}
                      onDeleteTable={handleDeleteTable}
                      showToast={showToast}
                      staffMembers={staffMembers}
                    />
                  )}

                  {adminTab === 'staff-master' && (
                    <StaffMaster
                      staffMembers={staffMembers}
                      onUpdateStaffMember={handleUpdateStaffMember}
                      onDeleteStaffMember={handleDeleteStaffMember}
                      onAddStaffMember={handleAddStaffMember}
                      showToast={showToast}
                    />
                  )}

                  {adminTab === 'super-details' && (
                    <SuperAdminDashboard
                      restaurants={restaurants}
                      activeRestaurantId={activeRestaurantId}
                      onSetActiveRestaurantId={setActiveRestaurantId}
                      onUpdateRestaurants={setRestaurants}
                      restaurantDetails={restaurantDetails}
                      onUpdateRestaurantDetails={handleUpdateRestaurantDetails}
                      orders={orders}
                      tables={tables}
                      menuItems={menuItems}
                      staffMembers={staffMembers}
                      stats={getComputedStats()}
                      showToast={showToast}
                      onUpdateTables={setTables}
                      onUpdateOrders={setOrders}
                      activeTab="details"
                      isMerged={true}
                      restaurantAdmins={restaurantAdmins}
                      onUpdateRestaurantAdmins={setRestaurantAdmins}
                    />
                  )}

                  {adminTab === 'super-platform-admins' && (
                    <SuperAdminDashboard
                      restaurants={restaurants}
                      activeRestaurantId={activeRestaurantId}
                      onSetActiveRestaurantId={setActiveRestaurantId}
                      onUpdateRestaurants={setRestaurants}
                      restaurantDetails={restaurantDetails}
                      onUpdateRestaurantDetails={handleUpdateRestaurantDetails}
                      orders={orders}
                      tables={tables}
                      menuItems={menuItems}
                      staffMembers={staffMembers}
                      stats={getComputedStats()}
                      showToast={showToast}
                      onUpdateTables={setTables}
                      onUpdateOrders={setOrders}
                      activeTab="platform-admins"
                      isMerged={true}
                      restaurantAdmins={restaurantAdmins}
                      onUpdateRestaurantAdmins={setRestaurantAdmins}
                    />
                  )}

                  {adminTab === 'super-revenue' && (
                    <SuperAdminDashboard
                      restaurants={restaurants}
                      activeRestaurantId={activeRestaurantId}
                      onSetActiveRestaurantId={setActiveRestaurantId}
                      onUpdateRestaurants={setRestaurants}
                      restaurantDetails={restaurantDetails}
                      onUpdateRestaurantDetails={handleUpdateRestaurantDetails}
                      orders={orders}
                      tables={tables}
                      menuItems={menuItems}
                      staffMembers={staffMembers}
                      stats={getComputedStats()}
                      showToast={showToast}
                      onUpdateTables={setTables}
                      onUpdateOrders={setOrders}
                      activeTab="revenue"
                      isMerged={true}
                      restaurantAdmins={restaurantAdmins}
                      onUpdateRestaurantAdmins={setRestaurantAdmins}
                    />
                  )}

                  {adminTab === 'super-billing' && (
                    <SuperAdminDashboard
                      restaurants={restaurants}
                      activeRestaurantId={activeRestaurantId}
                      onSetActiveRestaurantId={setActiveRestaurantId}
                      onUpdateRestaurants={setRestaurants}
                      restaurantDetails={restaurantDetails}
                      onUpdateRestaurantDetails={handleUpdateRestaurantDetails}
                      orders={orders}
                      tables={tables}
                      menuItems={menuItems}
                      staffMembers={staffMembers}
                      stats={getComputedStats()}
                      showToast={showToast}
                      onUpdateTables={setTables}
                      onUpdateOrders={setOrders}
                      activeTab="billing"
                      isMerged={true}
                      restaurantAdmins={restaurantAdmins}
                      onUpdateRestaurantAdmins={setRestaurantAdmins}
                    />
                  )}

                  {adminTab === 'super-leads' && (
                    <SuperAdminDashboard
                      restaurants={restaurants}
                      activeRestaurantId={activeRestaurantId}
                      onSetActiveRestaurantId={setActiveRestaurantId}
                      onUpdateRestaurants={setRestaurants}
                      restaurantDetails={restaurantDetails}
                      onUpdateRestaurantDetails={handleUpdateRestaurantDetails}
                      orders={orders}
                      tables={tables}
                      menuItems={menuItems}
                      staffMembers={staffMembers}
                      stats={getComputedStats()}
                      showToast={showToast}
                      onUpdateTables={setTables}
                      onUpdateOrders={setOrders}
                      activeTab="leads"
                      isMerged={true}
                      restaurantAdmins={restaurantAdmins}
                      onUpdateRestaurantAdmins={setRestaurantAdmins}
                    />
                  )}

                  {adminTab === 'super-tickets' && (
                    <SuperAdminDashboard
                      restaurants={restaurants}
                      activeRestaurantId={activeRestaurantId}
                      onSetActiveRestaurantId={setActiveRestaurantId}
                      onUpdateRestaurants={setRestaurants}
                      restaurantDetails={restaurantDetails}
                      onUpdateRestaurantDetails={handleUpdateRestaurantDetails}
                      orders={orders}
                      tables={tables}
                      menuItems={menuItems}
                      staffMembers={staffMembers}
                      stats={getComputedStats()}
                      showToast={showToast}
                      onUpdateTables={setTables}
                      onUpdateOrders={setOrders}
                      activeTab="tickets"
                      isMerged={true}
                      restaurantAdmins={restaurantAdmins}
                      onUpdateRestaurantAdmins={setRestaurantAdmins}
                    />
                  )}

                  {adminTab === 'super-notifications' && (
                    <SuperAdminDashboard
                      restaurants={restaurants}
                      activeRestaurantId={activeRestaurantId}
                      onSetActiveRestaurantId={setActiveRestaurantId}
                      onUpdateRestaurants={setRestaurants}
                      restaurantDetails={restaurantDetails}
                      onUpdateRestaurantDetails={handleUpdateRestaurantDetails}
                      orders={orders}
                      tables={tables}
                      menuItems={menuItems}
                      staffMembers={staffMembers}
                      stats={getComputedStats()}
                      showToast={showToast}
                      onUpdateTables={setTables}
                      onUpdateOrders={setOrders}
                      activeTab="notifications"
                      isMerged={true}
                      restaurantAdmins={restaurantAdmins}
                      onUpdateRestaurantAdmins={setRestaurantAdmins}
                    />
                  )}

                  {adminTab === 'super-reports' && (
                    <SuperAdminDashboard
                      restaurants={restaurants}
                      activeRestaurantId={activeRestaurantId}
                      onSetActiveRestaurantId={setActiveRestaurantId}
                      onUpdateRestaurants={setRestaurants}
                      restaurantDetails={restaurantDetails}
                      onUpdateRestaurantDetails={handleUpdateRestaurantDetails}
                      orders={orders}
                      tables={tables}
                      menuItems={menuItems}
                      staffMembers={staffMembers}
                      stats={getComputedStats()}
                      showToast={showToast}
                      onUpdateTables={setTables}
                      onUpdateOrders={setOrders}
                      activeTab="reports"
                      isMerged={true}
                      restaurantAdmins={restaurantAdmins}
                      onUpdateRestaurantAdmins={setRestaurantAdmins}
                    />
                  )}

                  {adminTab === 'super-users-list' && (
                    <SuperAdminDashboard
                      restaurants={restaurants}
                      activeRestaurantId={activeRestaurantId}
                      onSetActiveRestaurantId={setActiveRestaurantId}
                      onUpdateRestaurants={setRestaurants}
                      restaurantDetails={restaurantDetails}
                      onUpdateRestaurantDetails={handleUpdateRestaurantDetails}
                      orders={orders}
                      tables={tables}
                      menuItems={menuItems}
                      staffMembers={staffMembers}
                      stats={getComputedStats()}
                      showToast={showToast}
                      onUpdateTables={setTables}
                      onUpdateOrders={setOrders}
                      activeTab="admins"
                      isMerged={true}
                      restaurantAdmins={restaurantAdmins}
                      onUpdateRestaurantAdmins={setRestaurantAdmins}
                    />
                  )}

                  {adminTab === 'super-roles' && (
                    <SuperAdminDashboard
                      restaurants={restaurants}
                      activeRestaurantId={activeRestaurantId}
                      onSetActiveRestaurantId={setActiveRestaurantId}
                      onUpdateRestaurants={setRestaurants}
                      restaurantDetails={restaurantDetails}
                      onUpdateRestaurantDetails={handleUpdateRestaurantDetails}
                      orders={orders}
                      tables={tables}
                      menuItems={menuItems}
                      staffMembers={staffMembers}
                      stats={getComputedStats()}
                      showToast={showToast}
                      onUpdateTables={setTables}
                      onUpdateOrders={setOrders}
                      activeTab="roles"
                      isMerged={true}
                      restaurantAdmins={restaurantAdmins}
                      onUpdateRestaurantAdmins={setRestaurantAdmins}
                    />
                  )}


                  {adminTab === 'super-subscriptions' && (
                    <SuperAdminDashboard
                      restaurants={restaurants}
                      activeRestaurantId={activeRestaurantId}
                      onSetActiveRestaurantId={setActiveRestaurantId}
                      onUpdateRestaurants={setRestaurants}
                      restaurantDetails={restaurantDetails}
                      onUpdateRestaurantDetails={handleUpdateRestaurantDetails}
                      orders={orders}
                      tables={tables}
                      menuItems={menuItems}
                      staffMembers={staffMembers}
                      stats={getComputedStats()}
                      showToast={showToast}
                      onUpdateTables={setTables}
                      onUpdateOrders={setOrders}
                      activeTab="subscriptions"
                      isMerged={true}
                      restaurantAdmins={restaurantAdmins}
                      onUpdateRestaurantAdmins={setRestaurantAdmins}
                    />
                  )}

                  {adminTab === 'super-plans' && (
                    <SuperAdminDashboard
                      restaurants={restaurants}
                      activeRestaurantId={activeRestaurantId}
                      onSetActiveRestaurantId={setActiveRestaurantId}
                      onUpdateRestaurants={setRestaurants}
                      restaurantDetails={restaurantDetails}
                      onUpdateRestaurantDetails={handleUpdateRestaurantDetails}
                      orders={orders}
                      tables={tables}
                      menuItems={menuItems}
                      staffMembers={staffMembers}
                      stats={getComputedStats()}
                      showToast={showToast}
                      onUpdateTables={setTables}
                      onUpdateOrders={setOrders}
                      activeTab="plans"
                      isMerged={true}
                      restaurantAdmins={restaurantAdmins}
                      onUpdateRestaurantAdmins={setRestaurantAdmins}
                    />
                  )}

                  {adminTab === 'settings' && (
                    <div style={{ padding: '30px 40px', width: '100%', boxSizing: 'border-box' }} className="animate-fade-in">

                      {!isSuperAdmin ? (
                        <>
                          <div style={{ marginBottom: '30px', borderBottom: '1px solid var(--border-color)', paddingBottom: '20px' }}>
                            <h2 style={{ margin: '0 0 6px 0', fontSize: '1.75rem', fontWeight: '900', color: 'var(--text-main)' }}>Profile Settings</h2>
                            <p style={{ margin: 0, fontSize: '0.95rem', color: 'var(--text-muted)', fontWeight: '500' }}>Manage your personal profile, security credentials, and preferences</p>
                          </div>

                          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '24px' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

                              {/* Profile Information Card */}
                              <div className="glass-card" style={{ padding: '24px', borderRadius: '12px', border: '1px solid var(--border-color)', background: 'var(--bg-card)' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
                                  <User style={{ width: '20px', height: '20px', color: 'var(--primary)' }} />
                                  <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: '800', color: 'var(--text-main)' }}>Profile Information</h3>
                                </div>

                                <div style={{ display: 'flex', gap: '32px', alignItems: 'flex-start' }}>
                                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', minWidth: '160px' }}>
                                    <div style={{ width: '140px', height: '140px', border: '1px solid var(--border-color)', borderRadius: '12px', display: 'flex', justifyContent: 'center', alignItems: 'center', backgroundColor: 'var(--bg-app)' }}>
                                      <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                                        <circle cx="12" cy="7" r="4"></circle>
                                      </svg>
                                    </div>
                                    <button type="button" style={{ width: '120px', padding: '10px 0', border: '1.5px solid var(--primary)', color: 'var(--primary)', background: 'transparent', borderRadius: '8px', fontWeight: '600', cursor: 'pointer', fontSize: '0.95rem' }}>Choose</button>
                                  </div>

                                  <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                                    <div>
                                      <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '700', marginBottom: '8px', color: 'var(--text-main)' }}>Full Name <span style={{ color: '#ef4444' }}>*</span></label>
                                      <input type="text" defaultValue={isSuperAdmin ? "Super Admin" : "Admin User"} placeholder="Enter Full Name" style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--border-color)', fontSize: '0.95rem', background: 'var(--bg-app)', color: 'var(--text-main)', boxSizing: 'border-box', outline: 'none' }} />
                                    </div>
                                    <div>
                                      <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '700', marginBottom: '8px', color: 'var(--text-main)' }}>Email Address <span style={{ color: '#ef4444' }}>*</span></label>
                                      <input type="email" defaultValue={isSuperAdmin ? "superadmin@serveiq.com" : "admin@serveiq.com"} placeholder="Enter Email Address" style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--border-color)', fontSize: '0.95rem', background: 'var(--bg-app)', color: 'var(--text-main)', boxSizing: 'border-box', outline: 'none' }} />
                                    </div>
                                    <div>
                                      <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '700', marginBottom: '8px', color: 'var(--text-main)' }}>Username <span style={{ color: '#ef4444' }}>*</span></label>
                                      <input type="text" defaultValue={isSuperAdmin ? "superadmin" : "admin"} placeholder="Enter Username" style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--border-color)', fontSize: '0.95rem', background: 'var(--bg-app)', color: 'var(--text-main)', boxSizing: 'border-box', outline: 'none' }} />
                                    </div>
                                    <div>
                                      <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '700', marginBottom: '8px', color: 'var(--text-main)' }}>Mobile Number <span style={{ color: '#ef4444' }}>*</span></label>
                                      <input type="text" defaultValue="+91 9876543210" placeholder="Enter Phone Number" style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--border-color)', fontSize: '0.95rem', background: 'var(--bg-app)', color: 'var(--text-main)', boxSizing: 'border-box', outline: 'none' }} />
                                    </div>
                                    <div style={{ gridColumn: '1 / -1' }}>
                                      <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '700', marginBottom: '8px', color: 'var(--text-main)' }}>Designation</label>
                                      <input type="text" value={isSuperAdmin ? "Super Admin" : "Branch Admin"} readOnly style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--border-color)', fontSize: '0.95rem', boxSizing: 'border-box', backgroundColor: 'var(--bg-app)', color: 'var(--text-muted)', fontWeight: '600', outline: 'none' }} />
                                    </div>
                                  </div>
                                </div>
                              </div>

                              {/* Login & Security Card */}
                              <div className="glass-card" style={{ padding: '24px', borderRadius: '12px', border: '1px solid var(--border-color)', background: 'var(--bg-card)' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
                                  <Lock style={{ width: '20px', height: '20px', color: 'var(--primary)' }} />
                                  <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: '800', color: 'var(--text-main)' }}>Login & Security</h3>
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                                  <div style={{ gridColumn: '1 / -1' }}>
                                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '700', marginBottom: '8px', color: 'var(--text-main)' }}>Current Password</label>
                                    <input type="password" placeholder="Enter current password" style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--border-color)', fontSize: '0.95rem', boxSizing: 'border-box', outline: 'none', background: 'var(--bg-app)', color: 'var(--text-main)' }} />
                                  </div>
                                  <div>
                                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '700', marginBottom: '8px', color: 'var(--text-main)' }}>New Password</label>
                                    <input type="password" placeholder="Enter new password" style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--border-color)', fontSize: '0.95rem', boxSizing: 'border-box', outline: 'none', background: 'var(--bg-app)', color: 'var(--text-main)' }} />
                                  </div>
                                  <div>
                                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '700', marginBottom: '8px', color: 'var(--text-main)' }}>Confirm Password</label>
                                    <input type="password" placeholder="Confirm new password" style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--border-color)', fontSize: '0.95rem', boxSizing: 'border-box', outline: 'none', background: 'var(--bg-app)', color: 'var(--text-main)' }} />
                                  </div>
                                </div>
                              </div>

                            </div>
                          </div>

                          {/* Action Buttons */}
                          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '32px', paddingTop: '24px', borderTop: '1px solid var(--border-color)' }}>
                            <button type="button" className="btn-outline">
                              Reset Defaults
                            </button>
                            <button type="button" className="btn-black" onClick={() => showToast('success', 'Profile settings updated successfully!')}>
                              Save Settings
                            </button>
                          </div>
                        </>
                      ) : (
                        // PLATFORM CONFIGURATION SETTINGS FOR SUPER ADMIN
                        (() => {
                          // Inline helper inputs
                          const renderInput = (label, type, fieldKey, placeholder, isPasswordKey = null) => {
                            const isPass = type === 'password';
                            const show = isPasswordKey ? showPassFields[isPasswordKey] : false;

                            return (
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                <label style={{ fontSize: '0.78rem', fontWeight: '700', color: 'var(--text-main)' }}>{label}</label>
                                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                                  <input
                                    type={isPass ? (show ? 'text' : 'password') : type}
                                    value={platformSettings[fieldKey]}
                                    onChange={(e) => setPlatformSettings({ ...platformSettings, [fieldKey]: e.target.value })}
                                    placeholder={placeholder}
                                    style={{
                                      width: '100%',
                                      padding: '10px 14px',
                                      paddingRight: isPasswordKey ? '40px' : '14px',
                                      borderRadius: '8px',
                                      border: '1px solid var(--border-color)',
                                      fontSize: '0.85rem',
                                      background: 'var(--bg-app)',
                                      color: 'var(--text-main)',
                                      outline: 'none',
                                      boxSizing: 'border-box',
                                      transition: 'border-color 0.15s'
                                    }}
                                  />
                                  {isPasswordKey && (
                                    <button
                                      type="button"
                                      onClick={() => setShowPassFields({ ...showPassFields, [isPasswordKey]: !show })}
                                      style={{
                                        position: 'absolute',
                                        right: '10px',
                                        background: 'none',
                                        border: 'none',
                                        cursor: 'pointer',
                                        color: 'var(--text-muted)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        padding: '4px'
                                      }}
                                    >
                                      {show ? <EyeOff style={{ width: '16px', height: '16px' }} /> : <Eye style={{ width: '16px', height: '16px' }} />}
                                    </button>
                                  )}
                                </div>
                              </div>
                            );
                          };

                          const renderToggle = (checked, onChange, label, subtext) => (
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 0', borderBottom: '1px dashed var(--border-color)' }}>
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                                <span style={{ fontSize: '0.82rem', fontWeight: '800', color: 'var(--text-main)' }}>{label}</span>
                                {subtext && <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{subtext}</span>}
                              </div>
                              <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', userSelect: 'none' }}>
                                <div style={{ position: 'relative' }}>
                                  <input type="checkbox" checked={checked} onChange={onChange} style={{ display: 'none' }} />
                                  <div style={{ width: '42px', height: '22px', background: checked ? 'var(--primary)' : '#94a3b8', borderRadius: '11px', transition: 'background-color 0.2s' }}></div>
                                  <div style={{ position: 'absolute', top: '2px', left: checked ? '22px' : '2px', width: '18px', height: '18px', background: '#fff', borderRadius: '50%', boxShadow: '0 1px 3px rgba(0,0,0,0.15)', transition: 'left 0.2s' }}></div>
                                </div>
                              </label>
                            </div>
                          );

                          return (
                            <div className="animate-fade-in">
                              <div style={{ marginBottom: '30px', borderBottom: '1px solid var(--border-color)', paddingBottom: '20px' }}>
                                <h2 style={{ margin: '0 0 6px 0', fontSize: '1.75rem', fontWeight: '900', color: 'var(--text-main)' }}>Platform Configuration</h2>
                                <p style={{ margin: 0, fontSize: '0.95rem', color: 'var(--text-muted)', fontWeight: '500' }}>Configure company details, payment gateways, messaging tools, and password rules</p>
                              </div>

                              <div style={{ display: 'flex', gap: '30px', alignItems: 'flex-start', flexDirection: 'row' }}>
                                {/* Left Sidebar Tabs */}
                                <div style={{ width: '260px', display: 'flex', flexDirection: 'column', gap: '8px', flexShrink: 0 }}>
                                  <button
                                    onClick={() => setPlatformSettingsActiveSection('company')}
                                    style={{
                                      display: 'flex',
                                      alignItems: 'center',
                                      gap: '12px',
                                      padding: '14px 16px',
                                      borderRadius: '10px',
                                      background: platformSettingsActiveSection === 'company' ? 'rgba(59, 130, 246, 0.08)' : 'transparent',
                                      border: '1px solid',
                                      borderColor: platformSettingsActiveSection === 'company' ? 'rgba(59, 130, 246, 0.2)' : 'transparent',
                                      color: platformSettingsActiveSection === 'company' ? 'var(--primary)' : 'var(--text-main)',
                                      textAlign: 'left',
                                      cursor: 'pointer',
                                      transition: 'all 0.15s',
                                      outline: 'none'
                                    }}
                                  >
                                    <Globe style={{ width: '18px', height: '18px', color: platformSettingsActiveSection === 'company' ? 'var(--primary)' : 'var(--text-muted)' }} />
                                    <div>
                                      <span style={{ display: 'block', fontSize: '0.82rem', fontWeight: '800' }}>Company Profile</span>
                                      <span style={{ display: 'block', fontSize: '0.68rem', opacity: 0.8, color: 'var(--text-muted)' }}>Configure branding & logo</span>
                                    </div>
                                  </button>

                                  <button
                                    onClick={() => setPlatformSettingsActiveSection('payment')}
                                    style={{
                                      display: 'flex',
                                      alignItems: 'center',
                                      gap: '12px',
                                      padding: '14px 16px',
                                      borderRadius: '10px',
                                      background: platformSettingsActiveSection === 'payment' ? 'rgba(59, 130, 246, 0.08)' : 'transparent',
                                      border: '1px solid',
                                      borderColor: platformSettingsActiveSection === 'payment' ? 'rgba(59, 130, 246, 0.2)' : 'transparent',
                                      color: platformSettingsActiveSection === 'payment' ? 'var(--primary)' : 'var(--text-main)',
                                      textAlign: 'left',
                                      cursor: 'pointer',
                                      transition: 'all 0.15s',
                                      outline: 'none'
                                    }}
                                  >
                                    <CreditCard style={{ width: '18px', height: '18px', color: platformSettingsActiveSection === 'payment' ? 'var(--primary)' : 'var(--text-muted)' }} />
                                    <div>
                                      <span style={{ display: 'block', fontSize: '0.82rem', fontWeight: '800' }}>Payment Gateways</span>
                                      <span style={{ display: 'block', fontSize: '0.68rem', opacity: 0.8, color: 'var(--text-muted)' }}>Razorpay & Stripe APIs</span>
                                    </div>
                                  </button>

                                  <button
                                    onClick={() => setPlatformSettingsActiveSection('communication')}
                                    style={{
                                      display: 'flex',
                                      alignItems: 'center',
                                      gap: '12px',
                                      padding: '14px 16px',
                                      borderRadius: '10px',
                                      background: platformSettingsActiveSection === 'communication' ? 'rgba(59, 130, 246, 0.08)' : 'transparent',
                                      border: '1px solid',
                                      borderColor: platformSettingsActiveSection === 'communication' ? 'rgba(59, 130, 246, 0.2)' : 'transparent',
                                      color: platformSettingsActiveSection === 'communication' ? 'var(--primary)' : 'var(--text-main)',
                                      textAlign: 'left',
                                      cursor: 'pointer',
                                      transition: 'all 0.15s',
                                      outline: 'none'
                                    }}
                                  >
                                    <MessageSquare style={{ width: '18px', height: '18px', color: platformSettingsActiveSection === 'communication' ? 'var(--primary)' : 'var(--text-muted)' }} />
                                    <div>
                                      <span style={{ display: 'block', fontSize: '0.82rem', fontWeight: '800' }}>Communication Channels</span>
                                      <span style={{ display: 'block', fontSize: '0.68rem', opacity: 0.8, color: 'var(--text-muted)' }}>SMTP, SMS & WhatsApp API</span>
                                    </div>
                                  </button>

                                  <button
                                    onClick={() => setPlatformSettingsActiveSection('security')}
                                    style={{
                                      display: 'flex',
                                      alignItems: 'center',
                                      gap: '12px',
                                      padding: '14px 16px',
                                      borderRadius: '10px',
                                      background: platformSettingsActiveSection === 'security' ? 'rgba(59, 130, 246, 0.08)' : 'transparent',
                                      border: '1px solid',
                                      borderColor: platformSettingsActiveSection === 'security' ? 'rgba(59, 130, 246, 0.2)' : 'transparent',
                                      color: platformSettingsActiveSection === 'security' ? 'var(--primary)' : 'var(--text-main)',
                                      textAlign: 'left',
                                      cursor: 'pointer',
                                      transition: 'all 0.15s',
                                      outline: 'none'
                                    }}
                                  >
                                    <Shield style={{ width: '18px', height: '18px', color: platformSettingsActiveSection === 'security' ? 'var(--primary)' : 'var(--text-muted)' }} />
                                    <div>
                                      <span style={{ display: 'block', fontSize: '0.82rem', fontWeight: '800' }}>Security Policies</span>
                                      <span style={{ display: 'block', fontSize: '0.68rem', opacity: 0.8, color: 'var(--text-muted)' }}>Password rules & timeouts</span>
                                    </div>
                                  </button>
                                </div>

                                {/* Right Content Panel */}
                                <div style={{ flex: 1, minWidth: 0 }}>

                                  {/* 1. COMPANY SETTINGS SECTION */}
                                  {platformSettingsActiveSection === 'company' && (
                                    <div className="glass-card animate-fade-in" style={{ padding: '28px', borderRadius: '16px', border: '1px solid var(--border-color)', background: 'var(--bg-card)', display: 'flex', flexDirection: 'column', gap: '24px' }}>
                                      <div style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '14px' }}>
                                        <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: '800', color: 'var(--text-main)' }}>Company Profile</h3>
                                        <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Configure platform branding, metadata and contact information</span>
                                      </div>

                                      <div style={{ display: 'flex', gap: '32px', alignItems: 'flex-start', flexWrap: 'wrap' }}>
                                        {/* Logo area */}
                                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', minWidth: '160px' }}>
                                          <label style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-main)', width: '100%', textAlign: 'center' }}>Company Logo</label>
                                          <div style={{ position: 'relative', width: '130px', height: '130px', border: '2px dashed var(--border-color)', borderRadius: '16px', display: 'flex', justifyContent: 'center', alignItems: 'center', overflow: 'hidden', backgroundColor: 'rgba(255, 255, 255, 0.02)' }}>
                                            {platformSettings.logo ? (
                                              <img src={platformSettings.logo} alt="Company Logo" style={{ width: '100%', height: '100%', objectFit: 'contain', padding: '10px' }} />
                                            ) : (
                                              <Building style={{ width: '32px', height: '32px', color: 'var(--text-muted)' }} />
                                            )}
                                          </div>
                                          <button
                                            type="button"
                                            onClick={() => setLogoPresetsModalOpen(true)}
                                            style={{
                                              width: '130px',
                                              padding: '8px 14px',
                                              border: '1.5px solid var(--primary)',
                                              color: 'var(--primary)',
                                              background: 'transparent',
                                              borderRadius: '8px',
                                              fontWeight: '700',
                                              cursor: 'pointer',
                                              fontSize: '0.8rem',
                                              transition: 'all 0.15s'
                                            }}
                                            onMouseOver={(e) => { e.currentTarget.style.background = 'rgba(59, 130, 246, 0.05)' }}
                                            onMouseOut={(e) => { e.currentTarget.style.background = 'transparent' }}
                                          >
                                            Choose Logo
                                          </button>
                                        </div>

                                        {/* Company Fields */}
                                        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '20px', minWidth: '280px' }}>
                                          {renderInput("Company Name", "text", "companyName", "Enter Company Name")}

                                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                            {renderInput("Contact Phone", "text", "contactPhone", "e.g. +91 98765 43210")}
                                            {renderInput("Contact Email", "email", "contactEmail", "e.g. support@serveiq.com")}
                                          </div>

                                          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                            <label style={{ fontSize: '0.78rem', fontWeight: '700', color: 'var(--text-main)' }}>Company Address</label>
                                            <textarea
                                              value={platformSettings.companyAddress}
                                              onChange={(e) => setPlatformSettings({ ...platformSettings, companyAddress: e.target.value })}
                                              placeholder="Enter company registered office address"
                                              rows="3"
                                              style={{
                                                width: '100%',
                                                padding: '10px 14px',
                                                borderRadius: '8px',
                                                border: '1px solid var(--border-color)',
                                                fontSize: '0.85rem',
                                                background: 'var(--bg-app)',
                                                color: 'var(--text-main)',
                                                outline: 'none',
                                                boxSizing: 'border-box',
                                                resize: 'none',
                                                fontFamily: 'inherit',
                                                lineHeight: '1.4'
                                              }}
                                            />
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  )}

                                  {/* 2. PAYMENT SETTINGS SECTION */}
                                  {platformSettingsActiveSection === 'payment' && (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                                      {/* Razorpay gateway card */}
                                      <div className="glass-card animate-fade-in" style={{ padding: '28px', borderRadius: '16px', border: '1px solid var(--border-color)', background: 'var(--bg-card)', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
                                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                            <div style={{ background: '#3b82f6', width: '36px', height: '36px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
                                              <CreditCard style={{ width: '18px', height: '18px' }} />
                                            </div>
                                            <div>
                                              <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: '800', color: 'var(--text-main)' }}>Razorpay Gateway</h3>
                                              <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>Configure Razorpay API details for checkout</span>
                                            </div>
                                          </div>
                                          <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', userSelect: 'none' }}>
                                            <div style={{ position: 'relative' }}>
                                              <input
                                                type="checkbox"
                                                checked={platformSettings.razorpayEnabled}
                                                onChange={(e) => setPlatformSettings({ ...platformSettings, razorpayEnabled: e.target.checked })}
                                                style={{ display: 'none' }}
                                              />
                                              <div style={{ width: '42px', height: '22px', background: platformSettings.razorpayEnabled ? '#10b981' : '#94a3b8', borderRadius: '11px', transition: 'background-color 0.2s' }}></div>
                                              <div style={{ position: 'absolute', top: '2px', left: platformSettings.razorpayEnabled ? '22px' : '2px', width: '18px', height: '18px', background: '#fff', borderRadius: '50%', boxShadow: '0 1px 3px rgba(0,0,0,0.15)', transition: 'left 0.2s' }}></div>
                                            </div>
                                          </label>
                                        </div>

                                        {platformSettings.razorpayEnabled && (
                                          <div className="animate-fade-in" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                            {renderInput("Key ID", "text", "razorpayKeyId", "rzp_live_...")}
                                            {renderInput("Key Secret", "password", "razorpayKeySecret", "Razorpay secret token", "razorpaySecret")}
                                          </div>
                                        )}
                                      </div>

                                      {/* Stripe gateway card */}
                                      <div className="glass-card animate-fade-in" style={{ padding: '28px', borderRadius: '16px', border: '1px solid var(--border-color)', background: 'var(--bg-card)', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
                                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                            <div style={{ background: '#6366f1', width: '36px', height: '36px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
                                              <CreditCard style={{ width: '18px', height: '18px' }} />
                                            </div>
                                            <div>
                                              <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: '800', color: 'var(--text-main)' }}>Stripe Gateway</h3>
                                              <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>Configure Stripe API details for global payments</span>
                                            </div>
                                          </div>
                                          <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', userSelect: 'none' }}>
                                            <div style={{ position: 'relative' }}>
                                              <input
                                                type="checkbox"
                                                checked={platformSettings.stripeEnabled}
                                                onChange={(e) => setPlatformSettings({ ...platformSettings, stripeEnabled: e.target.checked })}
                                                style={{ display: 'none' }}
                                              />
                                              <div style={{ width: '42px', height: '22px', background: platformSettings.stripeEnabled ? '#10b981' : '#94a3b8', borderRadius: '11px', transition: 'background-color 0.2s' }}></div>
                                              <div style={{ position: 'absolute', top: '2px', left: platformSettings.stripeEnabled ? '22px' : '2px', width: '18px', height: '18px', background: '#fff', borderRadius: '50%', boxShadow: '0 1px 3px rgba(0,0,0,0.15)', transition: 'left 0.2s' }}></div>
                                            </div>
                                          </label>
                                        </div>

                                        {platformSettings.stripeEnabled && (
                                          <div className="animate-fade-in" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                            {renderInput("Publishable Key", "text", "stripePublishableKey", "pk_live_...")}
                                            {renderInput("Secret Key", "password", "stripeSecretKey", "Stripe secret token", "stripeSecret")}
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  )}

                                  {/* 3. COMMUNICATION SETTINGS SECTION */}
                                  {platformSettingsActiveSection === 'communication' && (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                                      {/* SMTP Credentials card */}
                                      <div className="glass-card animate-fade-in" style={{ padding: '28px', borderRadius: '16px', border: '1px solid var(--border-color)', background: 'var(--bg-card)', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                        <div style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '12px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                                          <div style={{ background: '#ec4899', width: '36px', height: '36px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
                                            <Server style={{ width: '18px', height: '18px' }} />
                                          </div>
                                          <div>
                                            <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: '800', color: 'var(--text-main)' }}>SMTP Email Server</h3>
                                            <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>Configure mail servers for notifications and invoice mailers</span>
                                          </div>
                                        </div>

                                        <div style={{ display: 'grid', gridTemplateColumns: '2.5fr 1fr', gap: '16px' }}>
                                          {renderInput("SMTP Host", "text", "smtpHost", "smtp.yourserver.com")}
                                          {renderInput("SMTP Port", "number", "smtpPort", "587")}
                                        </div>
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                          {renderInput("Username", "text", "smtpUser", "mailer@domain.com")}
                                          {renderInput("Password", "password", "smtpPassword", "SMTP login password", "smtpPass")}
                                        </div>
                                      </div>

                                      {/* SMS API Integration card */}
                                      <div className="glass-card animate-fade-in" style={{ padding: '28px', borderRadius: '16px', border: '1px solid var(--border-color)', background: 'var(--bg-card)', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
                                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                            <div style={{ background: '#06b6d4', width: '36px', height: '36px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
                                              <Smartphone style={{ width: '18px', height: '18px' }} />
                                            </div>
                                            <div>
                                              <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: '800', color: 'var(--text-main)' }}>SMS Gateway Provider</h3>
                                              <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>Configure SMS API endpoints for customer checkout alerts</span>
                                            </div>
                                          </div>
                                          <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', userSelect: 'none' }}>
                                            <div style={{ position: 'relative' }}>
                                              <input
                                                type="checkbox"
                                                checked={platformSettings.smsEnabled}
                                                onChange={(e) => setPlatformSettings({ ...platformSettings, smsEnabled: e.target.checked })}
                                                style={{ display: 'none' }}
                                              />
                                              <div style={{ width: '42px', height: '22px', background: platformSettings.smsEnabled ? '#10b981' : '#94a3b8', borderRadius: '11px', transition: 'background-color 0.2s' }}></div>
                                              <div style={{ position: 'absolute', top: '2px', left: platformSettings.smsEnabled ? '22px' : '2px', width: '18px', height: '18px', background: '#fff', borderRadius: '50%', boxShadow: '0 1px 3px rgba(0,0,0,0.15)', transition: 'left 0.2s' }}></div>
                                            </div>
                                          </label>
                                        </div>

                                        {platformSettings.smsEnabled && (
                                          <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '16px' }}>
                                              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                                <label style={{ fontSize: '0.78rem', fontWeight: '700', color: 'var(--text-main)' }}>SMS Gateway Provider</label>
                                                <select
                                                  value={platformSettings.smsProvider}
                                                  onChange={(e) => setPlatformSettings({ ...platformSettings, smsProvider: e.target.value })}
                                                  style={{
                                                    width: '100%',
                                                    padding: '10px 14px',
                                                    borderRadius: '8px',
                                                    border: '1px solid var(--border-color)',
                                                    fontSize: '0.85rem',
                                                    background: 'var(--bg-app)',
                                                    color: 'var(--text-main)',
                                                    outline: 'none',
                                                    boxSizing: 'border-box',
                                                    cursor: 'pointer'
                                                  }}
                                                >
                                                  <option value="Twilio">Twilio</option>
                                                  <option value="Msg91">Msg91 (India)</option>
                                                  <option value="Plivo">Plivo</option>
                                                </select>
                                              </div>
                                              {renderInput("Sender ID / Header", "text", "smsSenderId", "e.g. SRVIQ")}
                                            </div>
                                            {renderInput("API Key / Auth Token", "password", "smsApiKey", "Enter auth credential Key", "smsApiKey")}
                                          </div>
                                        )}
                                      </div>

                                      {/* WhatsApp Provider card */}
                                      <div className="glass-card animate-fade-in" style={{ padding: '28px', borderRadius: '16px', border: '1px solid var(--border-color)', background: 'var(--bg-card)', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
                                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                            <div style={{ background: '#10b981', width: '36px', height: '36px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
                                              <MessageSquare style={{ width: '18px', height: '18px' }} />
                                            </div>
                                            <div>
                                              <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: '800', color: 'var(--text-main)' }}>WhatsApp Business API</h3>
                                              <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>Configure WhatsApp channels for billing updates & alerts</span>
                                            </div>
                                          </div>
                                          <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', userSelect: 'none' }}>
                                            <div style={{ position: 'relative' }}>
                                              <input
                                                type="checkbox"
                                                checked={platformSettings.whatsappEnabled}
                                                onChange={(e) => setPlatformSettings({ ...platformSettings, whatsappEnabled: e.target.checked })}
                                                style={{ display: 'none' }}
                                              />
                                              <div style={{ width: '42px', height: '22px', background: platformSettings.whatsappEnabled ? '#10b981' : '#94a3b8', borderRadius: '11px', transition: 'background-color 0.2s' }}></div>
                                              <div style={{ position: 'absolute', top: '2px', left: platformSettings.whatsappEnabled ? '22px' : '2px', width: '18px', height: '18px', background: '#fff', borderRadius: '50%', boxShadow: '0 1px 3px rgba(0,0,0,0.15)', transition: 'left 0.2s' }}></div>
                                            </div>
                                          </label>
                                        </div>

                                        {platformSettings.whatsappEnabled && (
                                          <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '16px' }}>
                                              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                                <label style={{ fontSize: '0.78rem', fontWeight: '700', color: 'var(--text-main)' }}>WhatsApp Provider</label>
                                                <select
                                                  value={platformSettings.whatsappProvider}
                                                  onChange={(e) => setPlatformSettings({ ...platformSettings, whatsappProvider: e.target.value })}
                                                  style={{
                                                    width: '100%',
                                                    padding: '10px 14px',
                                                    borderRadius: '8px',
                                                    border: '1px solid var(--border-color)',
                                                    fontSize: '0.85rem',
                                                    background: 'var(--bg-app)',
                                                    color: 'var(--text-main)',
                                                    outline: 'none',
                                                    boxSizing: 'border-box',
                                                    cursor: 'pointer'
                                                  }}
                                                >
                                                  <option value="Meta Cloud API">Meta Cloud API (Official)</option>
                                                  <option value="Twilio WhatsApp">Twilio WhatsApp</option>
                                                  <option value="Gupshup">Gupshup Provider</option>
                                                </select>
                                              </div>
                                              {renderInput("Phone Number ID", "text", "whatsappPhoneId", "e.g. 109283746")}
                                            </div>
                                            {renderInput("Permanent Access Token", "password", "whatsappToken", "EAAGx...", "whatsappToken")}
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  )}

                                  {/* 4. SECURITY SETTINGS SECTION */}
                                  {platformSettingsActiveSection === 'security' && (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                                      {/* Password Strength Policy card */}
                                      <div className="glass-card animate-fade-in" style={{ padding: '28px', borderRadius: '16px', border: '1px solid var(--border-color)', background: 'var(--bg-card)', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                        <div style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '12px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                                          <div style={{ background: '#f59e0b', width: '36px', height: '36px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
                                            <Key style={{ width: '18px', height: '18px' }} />
                                          </div>
                                          <div>
                                            <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: '800', color: 'var(--text-main)' }}>Password Policy</h3>
                                            <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>Configure required complexity rules for administrative user logins</span>
                                          </div>
                                        </div>

                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxWidth: '280px', marginBottom: '8px' }}>
                                            <label style={{ fontSize: '0.78rem', fontWeight: '700', color: 'var(--text-main)' }}>Minimum Password Length</label>
                                            <select
                                              value={platformSettings.minPasswordLength}
                                              onChange={(e) => setPlatformSettings({ ...platformSettings, minPasswordLength: parseInt(e.target.value) })}
                                              style={{
                                                width: '100%',
                                                padding: '10px 14px',
                                                borderRadius: '8px',
                                                border: '1px solid var(--border-color)',
                                                fontSize: '0.85rem',
                                                background: 'var(--bg-app)',
                                                color: 'var(--text-main)',
                                                outline: 'none',
                                                boxSizing: 'border-box',
                                                cursor: 'pointer'
                                              }}
                                            >
                                              <option value={8}>8 Characters (Recommended)</option>
                                              <option value={10}>10 Characters</option>
                                              <option value={12}>12 Characters</option>
                                              <option value={14}>14 Characters</option>
                                              <option value={16}>16 Characters</option>
                                            </select>
                                          </div>

                                          {renderToggle(platformSettings.requireUppercase, (e) => setPlatformSettings({ ...platformSettings, requireUppercase: e.target.checked }), "Require Uppercase Letter", "Must contain at least one uppercase A-Z character")}
                                          {renderToggle(platformSettings.requireNumbers, (e) => setPlatformSettings({ ...platformSettings, requireNumbers: e.target.checked }), "Require Numbers", "Must contain at least one numerical digit (0-9)")}
                                          {renderToggle(platformSettings.requireSpecialChars, (e) => setPlatformSettings({ ...platformSettings, requireSpecialChars: e.target.checked }), "Require Special Characters", "Must contain at least one special character e.g. @, $, !, %, *")}
                                        </div>
                                      </div>

                                      {/* Session Timeout Settings card */}
                                      <div className="glass-card animate-fade-in" style={{ padding: '28px', borderRadius: '16px', border: '1px solid var(--border-color)', background: 'var(--bg-card)', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                        <div style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '12px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                                          <div style={{ background: '#3b82f6', width: '36px', height: '36px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
                                            <Clock style={{ width: '18px', height: '18px' }} />
                                          </div>
                                          <div>
                                            <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: '800', color: 'var(--text-main)' }}>Session Timeout</h3>
                                            <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>Configure idle limits for automatic session termination</span>
                                          </div>
                                        </div>

                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                            <label style={{ fontSize: '0.78rem', fontWeight: '700', color: 'var(--text-main)' }}>Inactivity Timeout (Minutes)</label>
                                            <input
                                              type="number"
                                              value={platformSettings.sessionTimeout}
                                              onChange={(e) => setPlatformSettings({ ...platformSettings, sessionTimeout: Math.max(1, parseInt(e.target.value) || 0) })}
                                              style={{
                                                width: '100%',
                                                padding: '10px 14px',
                                                borderRadius: '8px',
                                                border: '1px solid var(--border-color)',
                                                fontSize: '0.85rem',
                                                background: 'var(--bg-app)',
                                                color: 'var(--text-main)',
                                                outline: 'none',
                                                boxSizing: 'border-box'
                                              }}
                                            />
                                          </div>

                                          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                            <label style={{ fontSize: '0.78rem', fontWeight: '700', color: 'var(--text-main)' }}>Automatic Action on Timeout</label>
                                            <select
                                              value={platformSettings.timeoutAction}
                                              onChange={(e) => setPlatformSettings({ ...platformSettings, timeoutAction: e.target.value })}
                                              style={{
                                                width: '100%',
                                                padding: '10px 14px',
                                                borderRadius: '8px',
                                                border: '1px solid var(--border-color)',
                                                fontSize: '0.85rem',
                                                background: 'var(--bg-app)',
                                                color: 'var(--text-main)',
                                                outline: 'none',
                                                boxSizing: 'border-box',
                                                cursor: 'pointer'
                                              }}
                                            >
                                              <option value="logout">Log Out User Session</option>
                                              <option value="lock">Lock Terminal Screen</option>
                                            </select>
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </div>

                              {/* Save & Reset Action Buttons */}
                              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '36px', paddingTop: '24px', borderTop: '1px solid var(--border-color)' }}>
                                <button
                                  type="button"
                                  className="btn-outline"
                                  onClick={() => {
                                    showConfirm(
                                      "Reset Platform Defaults",
                                      "Are you sure you want to reset all platform configuration settings to system default parameters? All customized API credentials and company logo details will be restored to preset factory values.",
                                      () => {
                                        setPlatformSettings({ ...DEFAULT_PLATFORM_SETTINGS });
                                        showToast('info', 'Platform settings restored to defaults.');
                                      }
                                    );
                                  }}
                                >
                                  Reset Defaults
                                </button>
                                <button
                                  type="button"
                                  className="btn-black"
                                  onClick={() => {
                                    showToast('success', 'Platform configurations saved successfully!');

                                    // Add to system notifications
                                    setNotifications([`Platform configuration modified at ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`, ...notifications]);
                                  }}
                                >
                                  Save Settings
                                </button>
                              </div>
                            </div>
                          );
                        })()
                      )}
                    </div>
                  )}
                </div>
              </>
            )}

            {/* ROLE: CUSTOMER APP - removed */}

            {/* ROLE: WAITER APP - removed */}

          </div>



          {/* Custom JQuery-style Toast notifications list */}
          <div style={{
            position: 'fixed',
            top: '20px',
            right: '20px',
            display: 'flex',
            flexDirection: 'column',
            gap: '10px',
            zIndex: 99999,
            pointerEvents: 'none'
          }}>
            {toasts.map(toast => (
              <div
                key={toast.id}
                className="animate-fade-in"
                style={{
                  pointerEvents: 'auto',
                  background: toast.type === 'success' ? '#10b981' : toast.type === 'error' ? '#ef4444' : '#3b82f6',
                  color: '#fff',
                  padding: '12px 20px',
                  borderRadius: '10px',
                  boxShadow: 'var(--shadow-lg)',
                  fontWeight: '700',
                  fontSize: '0.85rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  minWidth: '240px',
                  animation: 'slideInRight 0.3s ease forwards'
                }}
              >
                {toast.type === 'success' ? <CheckCircle2 style={{ width: '16px', height: '16px', flexShrink: 0 }} /> : toast.type === 'error' ? <XCircle style={{ width: '16px', height: '16px', flexShrink: 0 }} /> : <Info style={{ width: '16px', height: '16px', flexShrink: 0 }} />}
                <span>{toast.message}</span>
              </div>
            ))}
          </div>

          {/* Custom Interactive Confirm Modal overlay */}
          {confirmModal.open && (
            <div style={{
              position: 'fixed',
              top: 0, left: 0, right: 0, bottom: 0,
              background: 'rgba(15, 23, 42, 0.6)',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              zIndex: 99998,
              backdropFilter: 'blur(6px)'
            }}>
              <div className="glass-card animate-fade-in" style={{
                background: 'var(--bg-card)',
                padding: '24px',
                maxWidth: '400px',
                width: '90%',
                borderRadius: '16px',
                boxShadow: 'var(--shadow-premium)',
                border: '1px solid var(--border-color)',
                textAlign: 'center'
              }}>
                <h4 style={{ fontSize: '1.2rem', fontWeight: '900', color: 'var(--text-main)', margin: '0 0 10px 0' }}>
                  {confirmModal.title}
                </h4>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '20px', lineHeight: '1.4' }}>
                  {confirmModal.message}
                </p>

                <div style={{ display: 'flex', gap: '10px' }}>
                  <button
                    className="btn-outline"
                    style={{ flex: 1, padding: '10px' }}
                    onClick={() => setConfirmModal(prev => ({ ...prev, open: false }))}
                  >
                    Cancel
                  </button>
                  <button
                    className="welcome-btn"
                    style={{ flex: 1, padding: '10px', background: '#dc2626', color: '#fff' }}
                    onClick={confirmModal.onConfirm}
                  >
                    Confirm Delete
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Custom Logo Presets Modal overlay */}
          {logoPresetsModalOpen && (
            <div style={{
              position: 'fixed',
              top: 0, left: 0, right: 0, bottom: 0,
              background: 'rgba(15, 23, 42, 0.6)',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              zIndex: 99998,
              backdropFilter: 'blur(6px)'
            }}>
              <div className="glass-card animate-fade-in" style={{
                background: 'var(--bg-card)',
                padding: '28px',
                maxWidth: '480px',
                width: '90%',
                borderRadius: '16px',
                boxShadow: 'var(--shadow-premium)',
                border: '1px solid var(--border-color)'
              }}>
                <h4 style={{ fontSize: '1.2rem', fontWeight: '900', color: 'var(--text-main)', margin: '0 0 16px 0', textAlign: 'center' }}>
                  Select Company Logo Preset
                </h4>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '24px' }}>
                  {[
                    { name: 'Classic Bistro', url: 'https://images.unsplash.com/photo-1552566626-52f8b828add9?w=120&auto=format&fit=crop&q=60' },
                    { name: 'Modern Cafe', url: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=120&auto=format&fit=crop&q=60' },
                    { name: 'Neon Lounge', url: 'https://images.unsplash.com/photo-1574096079513-d8259312b785?w=120&auto=format&fit=crop&q=60' }
                  ].map((preset, idx) => (
                    <div
                      key={preset.name}
                      onClick={() => {
                        setPlatformSettings({ ...platformSettings, logo: preset.url });
                        setLogoPresetsModalOpen(false);
                        showToast('success', `Selected ${preset.name} Logo!`);
                      }}
                      style={{
                        border: '1.5px solid var(--border-color)',
                        borderRadius: '12px',
                        padding: '12px',
                        cursor: 'pointer',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '8px',
                        background: platformSettings.logo === preset.url ? 'rgba(59, 130, 246, 0.05)' : 'transparent',
                        borderColor: platformSettings.logo === preset.url ? 'var(--primary)' : 'var(--border-color)',
                        transition: 'all 0.15s'
                      }}
                      onMouseOver={(e) => { e.currentTarget.style.borderColor = 'var(--primary)' }}
                      onMouseOut={(e) => { if (platformSettings.logo !== preset.url) e.currentTarget.style.borderColor = 'var(--border-color)' }}
                    >
                      <div style={{ width: '60px', height: '60px', borderRadius: '8px', overflow: 'hidden' }}>
                        <img src={preset.url} alt={preset.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      </div>
                      <span style={{ fontSize: '0.68rem', fontWeight: '700', color: 'var(--text-main)', textAlign: 'center' }}>{preset.name}</span>
                    </div>
                  ))}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '24px', borderTop: '1px solid var(--border-color)', paddingTop: '16px' }}>
                  <label style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-main)' }}>Or Input Custom Logo Image URL</label>
                  <input
                    type="text"
                    value={platformSettings.logo}
                    onChange={(e) => setPlatformSettings({ ...platformSettings, logo: e.target.value })}
                    placeholder="https://example.com/logo.png"
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: '8px',
                      border: '1px solid var(--border-color)',
                      fontSize: '0.82rem',
                      background: 'var(--bg-app)',
                      color: 'var(--text-main)',
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>

                <div style={{ display: 'flex', gap: '10px' }}>
                  <button
                    className="btn-outline"
                    style={{ flex: 1, padding: '10px' }}
                    onClick={() => setLogoPresetsModalOpen(false)}
                  >
                    Close
                  </button>
                  <button
                    className="welcome-btn"
                    style={{ flex: 1, padding: '10px', background: 'var(--primary)', color: '#fff' }}
                    onClick={() => {
                      setLogoPresetsModalOpen(false);
                      showToast('success', 'Custom logo URL applied successfully!');
                    }}
                  >
                    Apply URL
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
