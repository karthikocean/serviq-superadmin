import React, { useState } from 'react' // Trigger rebuild
import {
  Building,
  Briefcase,
  CreditCard,
  Activity,
  FileText,
  CheckCircle,
  RefreshCw,
  TrendingUp,
  Settings,
  AlertTriangle,
  Save,
  Percent,
  Star,
  Plus,
  Award,
  Users,
  ShieldCheck,
  Shield,
  TrendingDown,
  Clock,
  Layers,
  ArrowRight,
  ChevronDown,
  LifeBuoy,
  X,
  Crown,
  Lock,
  Unlock,
  Eye,
  Edit2,
  Trash2,
  MapPin,
  Gem,
  Calendar,
  Key,
  FileSpreadsheet,
  Bell,
  BarChart2
} from 'lucide-react'

import PlansManagement from './PlansManagement'
import SubscriptionManagement from './SubscriptionManagement'
import SupportTicketManagement from './SupportTicketManagement'
import NotificationsManagement from './NotificationsManagement'
import ReportsAnalytics from './ReportsAnalytics'
import Restaurants from './Restaurants'
import Admins from './Admins' 
import RevenueBilling from './RevenueBilling'
import LeadsCRM from './LeadsCRM'
import RolesPermissions from './RolesPermissions'
import SystemSettings from './SystemSettings'

// ─── Reusable validated input component (defined outside to prevent remount on re-render) ───
const ValidatedInput = ({ label, type = 'text', value, onChange, placeholder, required, error, setError, ...rest }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', position: 'relative' }}>
    <label style={{ fontSize: '0.75rem', fontWeight: '700', color: error ? '#ef4444' : 'var(--text-main)' }}>
      {label}{required && <span style={{ color: '#ef4444', marginLeft: '2px' }}>*</span>}
    </label>
    <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
      <input
        type={type}
        value={value}
        onChange={(e) => {
          onChange(e)
          if (error && setError) setError('')
        }}
        required={required}
        style={{
          width: '100%',
          padding: '9px 12px',
          border: `1.5px solid ${error ? '#ef4444' : 'var(--border-color)'}`,
          background: error ? 'rgba(239,68,68,0.04)' : 'var(--bg-app)',
          color: 'var(--text-main)',
          borderRadius: '8px',
          fontSize: '0.82rem',
          outline: 'none',
          boxSizing: 'border-box',
          transition: 'border-color 0.15s'
        }}
        {...rest}
      />
      {error && (
        <span style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', color: '#ef4444', pointerEvents: 'none', display: 'flex' }}><AlertTriangle style={{ width: '14px', height: '14px' }} /></span>
      )}
    </div>
    {error && <span style={{ fontSize: '0.7rem', color: '#ef4444', fontWeight: '600' }}>{error}</span>}
  </div>
)

// ─── Reusable validated select component (defined outside to prevent remount on re-render) ───
const ValidatedSelect = ({ label, value, onChange, required, error, setError, children, ...rest }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
    <label style={{ fontSize: '0.75rem', fontWeight: '700', color: error ? '#ef4444' : 'var(--text-main)' }}>
      {label}{required && <span style={{ color: '#ef4444', marginLeft: '2px' }}>*</span>}
    </label>
    <select
      value={value}
      onChange={(e) => {
        onChange(e)
        if (error && setError) setError('')
      }}
      required={required}
      style={{
        width: '100%',
        padding: '9px 12px',
        border: `1.5px solid ${error ? '#ef4444' : 'var(--border-color)'}`,
        background: error ? 'rgba(239,68,68,0.04)' : 'var(--bg-app)',
        color: 'var(--text-main)',
        borderRadius: '8px',
        fontSize: '0.82rem',
        outline: 'none',
        cursor: 'pointer',
        boxSizing: 'border-box',
        transition: 'border-color 0.15s'
      }}
      {...rest}
    >
      {children}
    </select>
    {error && <span style={{ fontSize: '0.7rem', color: '#ef4444', fontWeight: '600' }}>{error}</span>}
  </div>
)

export default function SuperAdminDashboard({
  restaurantDetails,
  onUpdateRestaurantDetails,
  orders = [],
  tables = [],
  menuItems = [],
  staffMembers = [],
  stats = {},
  showToast,
  onUpdateTables,
  onUpdateOrders,
  activeTab: propActiveTab = 'details',
  isMerged = false,
  restaurants = [],
  activeRestaurantId,
  onSetActiveRestaurantId,
  onUpdateRestaurants,
  restaurantAdmins = [],
  onUpdateRestaurantAdmins
}) {
  const [activeTabState, setActiveTabState] = useState('details')
  const activeTab = isMerged ? propActiveTab : activeTabState
  const setActiveTab = isMerged ? () => { } : setActiveTabState
  const [usersDropdownOpen, setUsersDropdownOpen] = useState(false)
  const [formErrors, setFormErrors] = useState({})

  React.useEffect(() => {
    if (activeTab === 'admins' || activeTab === 'roles') {
      setUsersDropdownOpen(true)
    }
  }, [activeTab])

  // Edit / View restaurant states
  const [viewingPerfRestId, setViewingPerfRestId] = useState(() => {
    return localStorage.getItem('serviq_viewingPerfRestId') || null
  })

  React.useEffect(() => {
    if (viewingPerfRestId) {
      localStorage.setItem('serviq_viewingPerfRestId', viewingPerfRestId)
    } else {
      localStorage.removeItem('serviq_viewingPerfRestId')
    }
  }, [viewingPerfRestId])
  const [plans, setPlans] = useState([
    { id: 'plan-basic', name: 'Basic Plan', description: 'Essential tools for small eateries, QR menu ordering and simple table management.', monthlyPrice: 999, annualPrice: 9999, branchLimit: 1, userLimit: 3, orderLimit: 500, features: ['QR Ordering', 'Menu Management', 'Table Management', 'Order Management'], status: 'Active' },
    { id: 'plan-standard', name: 'Standard Plan', description: 'Includes everything in Basic, plus tableside waiter service and app integrations.', monthlyPrice: 1999, annualPrice: 19999, branchLimit: 2, userLimit: 5, orderLimit: 1000, features: ['QR Ordering', 'Menu Management', 'Table Management', 'Order Management', 'Waiter Management'], status: 'Active' },
    { id: 'plan-premium', name: 'Premium Plan', description: 'Advanced operations with integrated Kitchen KDS displays and advanced billing.', monthlyPrice: 4999, annualPrice: 49999, branchLimit: 5, userLimit: 15, orderLimit: 5000, features: ['QR Ordering', 'Menu Management', 'Table Management', 'Order Management', 'Waiter Management', 'Kitchen Management'], status: 'Active' },
    // { id: 'plan-enterprise', name: 'Enterprise Plan', description: 'Full enterprise control for multi-branch chains, franchise dashboards, and premium SLA support.', monthlyPrice: 9999, annualPrice: 99999, branchLimit: 99999, userLimit: 99999, orderLimit: 99999, features: ['QR Ordering', 'Menu Management', 'Table Management', 'Order Management', 'Waiter Management', 'Kitchen Management', 'Advanced Billing System', 'Live Analytics Deck', 'Multi-Branch Super Deck', '24/7 Dedicated Support'], status: 'Active' }
  ])

  // Revenue & Billing states
  const [invoices, setInvoices] = useState([
    { id: 'INV-2026-001', restaurantName: 'Serviq', subscriptionPlan: 'Premium Plan', amount: 4999, taxAmount: 900, paymentMethod: 'UPI', paymentDate: '2026-06-01', dueDate: '2026-07-01', status: 'Paid', transactionId: 'TXN-8472917462' },
    { id: 'INV-2026-002', restaurantName: 'Sunset Diner', subscriptionPlan: 'Standard Plan', amount: 1999, taxAmount: 360, paymentMethod: 'Credit Card', paymentDate: '2026-05-28', dueDate: '2026-06-28', status: 'Paid', transactionId: 'TXN-1098273645' },
    { id: 'INV-2026-003', restaurantName: 'Ocean Breeze Grill', subscriptionPlan: 'Premium Plan', amount: 4999, taxAmount: 900, paymentMethod: 'Net Banking', paymentDate: '', dueDate: '2026-06-15', status: 'Pending', transactionId: '—' },
    { id: 'INV-2026-004', restaurantName: 'Mountain Lodge Cafe', subscriptionPlan: 'Premium Plan', amount: 4999, taxAmount: 900, paymentMethod: 'UPI', paymentDate: '2026-05-15', dueDate: '2026-06-15', status: 'Refunded', transactionId: 'TXN-9018273645' },
    { id: 'INV-2026-005', restaurantName: 'Downtown Bakery', subscriptionPlan: 'Free Plan', amount: 0, taxAmount: 0, paymentMethod: 'N/A', paymentDate: '2026-05-20', dueDate: '2026-06-20', status: 'Paid', transactionId: 'TXN-SYSTEM-001' }
  ])
  const [confirmModal, setConfirmModal] = useState(null)
  const [viewingSubscriptionRest, setViewingSubscriptionRest] = useState(null)

  const [subscriptionHistory, setSubscriptionHistory] = useState([
    {
      id: 'SUB-001',
      restaurantId: 'R-02',
      restaurantName: 'Serviq Express Cafe',
      planName: 'Premium Plan',
      startDate: '2025-03-22',
      endDate: '2026-09-22',
      amount: 50000,
      status: 'Completed'
    }
  ])

  const [systemLogs, setSystemLogs] = useState([
    { id: 1, time: '10:04 AM', type: 'info', msg: 'System initialized successfully.' },
    { id: 2, time: '10:15 AM', type: 'success', msg: 'Admin Terminal authenticated from IP 192.168.1.42.' },
    { id: 3, time: '10:30 AM', type: 'warning', msg: 'High occupancy warning: 85% table capacity reached.' },
    { id: 4, time: '11:02 AM', type: 'info', msg: 'Kitchen KDS Terminal connected successfully.' },
    { id: 5, time: '11:15 AM', type: 'success', msg: 'UPI dynamic QR endpoint initialized on Port 3001.' }
  ])

  // Financial Data Calculations
  // Baseline static metrics from design specs + dynamic active orders
  const billedOrders = orders.filter(o => o.status === 'Billed' || o.status === 'Done')
  const dynamicBilledRevenue = billedOrders.reduce((acc, order) => {
    return acc + order.items.reduce((sum, item) => sum + (item.price * item.quantity), 0)
  }, 0)

  // Dynamic accumulated total revenue (₹12,480 base + new simulated ones)
  const totalRevenue = (stats.revenue || 0) + dynamicBilledRevenue
  const taxAmount = (totalRevenue * ((restaurantDetails?.taxRate || 0) / 100))
  const serviceChargeAmount = (totalRevenue * ((restaurantDetails?.serviceCharge || 0) / 100))

  // Total orders count
  const totalOrdersCount = stats.totalOrdersCount + orders.length
  const averageTicket = totalOrdersCount > 0 ? Math.round(totalRevenue / totalOrdersCount) : 0

  // Today's active simulated orders
  const todaysOrdersCount = 12 + orders.filter(o => o.status !== 'Voided').length

  // Total Users count (active diners, staff members, registered operators)
  const totalUsersCount = Math.round(totalOrdersCount * 3.5) + (staffMembers.length * restaurants.length)

  // Monthly Revenue estimation (including other historical weeks in current month)
  const monthlyRevenue = Math.round(totalRevenue * 8.5)

  // Subscription Revenue from branches (Active branches * ₹4,999 base fee/month)
  const activeRestaurants = restaurants.filter(r => r.status === 'Active')
  const subscriptionRevenue = activeRestaurants.length * 4999

  // Pending payments calculations from invoices list
  const pendingPaymentsCount = invoices.filter(inv => inv.status === 'Pending').length
  const pendingPaymentsSum = invoices.filter(inv => inv.status === 'Pending').reduce((acc, inv) => acc + inv.amount, 0)
  const expiringSubscriptionsCount = restaurants.filter(r => r.status === 'Active' && r.subscriptionPlan !== 'Premium').length > 0 ? 3 : 1

  // Subscription Plan Distributions for Donut/Pie Chart
  const standardCount = restaurants.filter(r => r.subscriptionPlan?.includes('Standard')).length || 0
  const premiumCount = restaurants.filter(r => r.subscriptionPlan?.includes('Premium')).length || 0
  const totalPlans = standardCount + premiumCount || 1
  const standardPct = (standardCount / totalPlans) * 100
  const premiumPct = (premiumCount / totalPlans) * 100

  // Donut chart stroke math (Circumference C = 251.2 for r = 40)
  const donutCircumference = 251.2
  const standardDash = (standardCount / totalPlans) * donutCircumference
  const premiumDash = (premiumCount / totalPlans) * donutCircumference

  // Category distributions for visualization
  const categorySales = [
    { name: 'Starters', percentage: 28, value: Math.round(totalRevenue * 0.28), color: 'hsl(var(--primary-hue), 95%, 52%)' },
    { name: 'Mains', percentage: 46, value: Math.round(totalRevenue * 0.46), color: '#3b82f6' },
    { name: 'Drinks', percentage: 16, value: Math.round(totalRevenue * 0.16), color: '#10b981' },
    { name: 'Desserts', percentage: 10, value: Math.round(totalRevenue * 0.1), color: '#fbbf24' }
  ]

  // Add a new warning logs generator
  const triggerDiagnostics = () => {
    const errors = ['Database socket ping took 142ms', 'UPI callback server response delayed', 'Memory garbage collector swept 14.2MB heap']
    const randErr = errors[Math.floor(Math.random() * errors.length)]
    const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    setSystemLogs(prev => [
      { id: Date.now(), time: now, type: 'warning', msg: randErr },
      ...prev
    ])
    showToast('info', 'System diagnostics completed. Diagnostic warnings loaded in logs deck.')
  }

  // Reset simulator
  const handleResetSimulator = () => {
    setConfirmModal({
      title: "Reset Simulator Database",
      message: "Are you sure you want to restore the simulation database back to defaults? All tables will reset to original occupancies and active mock orders will clear.",
      confirmText: "Reset Database",
      confirmColor: "#ef4444",
      onConfirm: () => {
        onUpdateTables([
          { id: 'T-01', name: 'Table 01', status: 'Occupied', seats: 4 },
          { id: 'T-02', name: 'Table 02', status: 'Occupied', seats: 2 },
          { id: 'T-03', name: 'Table 03', status: 'Occupied', seats: 4 },
          { id: 'T-04', name: 'Table 04', status: 'Free', seats: 6 },
          { id: 'T-05', name: 'Table 05', status: 'Occupied', seats: 2 },
          { id: 'T-06', name: 'Table 06', status: 'Free', seats: 4 },
          { id: 'T-07', name: 'Table 07', status: 'Occupied', seats: 8 }
        ])

        onUpdateOrders([
          {
            id: '#847',
            table: 'Table 03',
            items: [
              { name: 'Chicken Biryani', quantity: 1, price: 320 },
              { name: 'Masala Chai', quantity: 2, price: 40 }
            ],
            time: '1:28 PM',
            timestamp: new Date(Date.now() - 120000),
            status: 'New',
            note: 'Less spicy please'
          },
          {
            id: '#846',
            table: 'Table 07',
            items: [
              { name: 'Paneer Tikka', quantity: 2, price: 180 }
            ],
            time: '1:22 PM',
            timestamp: new Date(Date.now() - 480000),
            status: 'Preparing',
            note: ''
          }
        ])

        const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
        setSystemLogs(prev => [
          { id: Date.now(), time: now, type: 'success', msg: 'Simulation database purged & hard reloaded to factory defaults.' },
          ...prev
        ])
        showToast('success', 'Simulator data base restored to initial seed successfully!')
      }
    })
  }

  // Handle Void order
  const handleVoidOrder = (orderId) => {
    setConfirmModal({
      title: "Void Transaction",
      message: `Void transaction ${orderId}? This will remove it from simulated revenue totals.`,
      confirmText: "Confirm Void",
      confirmColor: "#ef4444",
      onConfirm: () => {
        onUpdateOrders(orders.map(o => o.id === orderId ? { ...o, status: 'Voided' } : o))
        showToast('error', `Transaction ${orderId} marked as VOID / REFUNDED.`)
        const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
        setSystemLogs(prev => [
          { id: Date.now(), time: now, type: 'warning', msg: `Order ${orderId} was voided/refunded by super admin.` },
          ...prev
        ])
      }
    })
  }





  const renderPerformanceModal = () => {
    if (!viewingPerfRestId) return null;
    const viewedRest = restaurants.find(r => r.id === viewingPerfRestId);
    if (!viewedRest) return null;

    const seedMap = {
      'R-01': { grossSales: 384200, orders: 1205, speed: '9.8 min', startersRatio: 32, mainsRatio: 48, drinksRatio: 12, dessertsRatio: 8 },
      'R-02': { grossSales: 129500, orders: 492, speed: '7.2 min', startersRatio: 18, mainsRatio: 32, drinksRatio: 44, dessertsRatio: 6 },
      'R-03': { grossSales: 592000, orders: 1845, speed: '14.5 min', startersRatio: 42, mainsRatio: 30, drinksRatio: 22, dessertsRatio: 6 },
      'R-04': { grossSales: 243100, orders: 904, speed: '11.2 min', startersRatio: 15, mainsRatio: 68, drinksRatio: 12, dessertsRatio: 5 },
      'R-05': { grossSales: 189000, orders: 742, speed: '8.5 min', startersRatio: 10, mainsRatio: 20, drinksRatio: 15, dessertsRatio: 55 },
    };
    const defaultPerf = { grossSales: 150000, orders: 500, speed: '10.0 min', startersRatio: 25, mainsRatio: 45, drinksRatio: 20, dessertsRatio: 10 };
    const perf = seedMap[viewedRest.id] || defaultPerf;

    return (
      <div style={{
        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
        background: 'rgba(9, 13, 22, 0.45)', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)',
        display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 99999, padding: '20px'
      }} onClick={() => setViewingPerfRestId(null)}>
        <div className="menu-edit-panel animate-fade-in" style={{
          background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '20px', padding: '36px',
          width: '90%', maxWidth: '850px', boxShadow: 'var(--shadow-lg)', position: 'relative', top: 'auto'
        }} onClick={(e) => e.stopPropagation()}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', borderBottom: '1px solid var(--border-color)', paddingBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ background: 'var(--primary)', color: '#fff', padding: '6px 12px', borderRadius: '8px', fontSize: '0.7rem', fontWeight: '900' }}>PERFORMANCE ANALYTICS</span>
              <h3 style={{ fontSize: '1.25rem', fontWeight: '900', color: 'var(--text-main)', margin: 0 }}>{viewedRest.name} ({viewedRest.id})</h3>
            </div>
            <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '4px' }} onClick={() => setViewingPerfRestId(null)}><X style={{ width: '16px', height: '16px' }} /></button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxHeight: '70vh', overflowY: 'auto', paddingRight: '8px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
              <div style={{ padding: '20px', background: 'var(--bg-app)', border: '1px solid var(--border-color)', borderRadius: '14px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <span style={{ fontSize: '0.7rem', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Gross Simulated Revenue</span>
                <h3 style={{ fontSize: '1.5rem', fontWeight: '900', color: 'var(--text-main)', margin: 0 }}>₹{perf.grossSales.toLocaleString()}</h3>
                <span style={{ fontSize: '0.65rem', color: '#10b981', fontWeight: '700' }}>↑ 14.2% MoM Growth</span>
              </div>
              <div style={{ padding: '20px', background: 'var(--bg-app)', border: '1px solid var(--border-color)', borderRadius: '14px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <span style={{ fontSize: '0.7rem', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Total Simulated Tickets</span>
                <h3 style={{ fontSize: '1.5rem', fontWeight: '900', color: 'var(--text-main)', margin: 0 }}>{perf.orders.toLocaleString()}</h3>
                <span style={{ fontSize: '0.65rem', color: 'var(--primary)', fontWeight: '700' }}>Average Ticket: ₹{Math.round(perf.grossSales / perf.orders)}</span>
              </div>
              <div style={{ padding: '20px', background: 'var(--bg-app)', border: '1px solid var(--border-color)', borderRadius: '14px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <span style={{ fontSize: '0.7rem', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase' }}>KDS Preparation Speed</span>
                <h3 style={{ fontSize: '1.5rem', fontWeight: '900', color: '#10b981', margin: 0 }}>{perf.speed}</h3>
                <span style={{ fontSize: '0.65rem', color: '#10b981', fontWeight: '700' }}>Optimal Efficiency Rate</span>
              </div>
            </div>
            <div style={{ padding: '20px', background: 'var(--bg-app)', border: '1px solid var(--border-color)', borderRadius: '14px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h4 style={{ margin: 0, fontSize: '0.85rem', fontWeight: '800', textTransform: 'uppercase', color: 'var(--text-main)' }}>Daily Sales Peak Velocity</h4>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Simulated Peak Capacity</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', height: '120px', padding: '10px 0' }}>
                {[
                  { hr: '11am', val: 20 }, { hr: '1pm', val: perf.orders > 1000 ? 92 : 74, highlight: true }, { hr: '3pm', val: 40 },
                  { hr: '5pm', val: 30 }, { hr: '7pm', val: 65 }, { hr: '9pm', val: perf.orders > 1000 ? 98 : 88, highlight: true }, { hr: '11pm', val: 45 }
                ].map((bar, idx) => (
                  <div key={idx} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '45px', gap: '6px' }}>
                    <div style={{ width: '100%', height: `${bar.val}px`, background: bar.highlight ? 'linear-gradient(180deg, var(--primary) 0%, var(--primary-hover) 100%)' : 'rgba(255, 255, 255, 0.1)', borderRadius: '4px', transition: 'height 0.3s' }}></div>
                    <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: '600' }}>{bar.hr}</span>
                  </div>
                ))}
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: '20px' }}>
              <div style={{ padding: '20px', background: 'var(--bg-app)', border: '1px solid var(--border-color)', borderRadius: '14px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <h4 style={{ margin: 0, fontSize: '0.85rem', fontWeight: '800', textTransform: 'uppercase', color: 'var(--text-main)' }}>Dish Category Share</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {[
                    { name: 'Starters', pct: perf.startersRatio, color: 'var(--primary)' }, { name: 'Mains', pct: perf.mainsRatio, color: '#3b82f6' },
                    { name: 'Drinks', pct: perf.drinksRatio, color: '#10b981' }, { name: 'Desserts', pct: perf.dessertsRatio, color: '#f59e0b' }
                  ].map((cat, idx) => (
                    <div key={idx}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', fontWeight: '700', marginBottom: '4px' }}>
                        <span style={{ color: 'var(--text-main)' }}>{cat.name}</span><span style={{ color: cat.color }}>{cat.pct}%</span>
                      </div>
                      <div style={{ width: '100%', height: '6px', background: 'rgba(255,255,255,0.05)', borderRadius: '3px', overflow: 'hidden' }}>
                        <div style={{ width: `${cat.pct}%`, height: '100%', background: cat.color, borderRadius: '3px' }}></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div style={{ padding: '20px', background: 'var(--bg-app)', border: '1px solid var(--border-color)', borderRadius: '14px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <h4 style={{ margin: 0, fontSize: '0.85rem', fontWeight: '800', textTransform: 'uppercase', color: 'var(--text-main)' }}>Top Performing Menu Items</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {[
                    { rank: '1', name: 'Paneer Tikka', category: 'Starters', value: '430 orders', image: 'https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?w=60&auto=format&fit=crop&q=60' },
                    { rank: '2', name: 'Chicken Biryani', category: 'Mains', value: '382 orders', image: 'https://images.unsplash.com/photo-1633945274405-b6c8069047b0?w=60&auto=format&fit=crop&q=60' },
                    { rank: '3', name: 'Masala Dosa', category: 'Mains', value: '298 orders', image: 'https://images.unsplash.com/photo-1668236543090-82eba5ee5976?w=60&auto=format&fit=crop&q=60' }
                  ].map((dish, idx) => (
                    <div key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: '8px', borderBottom: idx < 2 ? '1px solid rgba(255,255,255,0.05)' : 'none' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span style={{ fontSize: '0.85rem', fontWeight: '800', color: 'var(--primary)' }}>#{dish.rank}</span>
                        <div style={{ width: '32px', height: '32px', borderRadius: '4px', overflow: 'hidden' }}><img src={dish.image} alt={dish.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /></div>
                        <div><span style={{ display: 'block', fontSize: '0.8rem', fontWeight: '800', color: 'var(--text-main)' }}>{dish.name}</span><span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>{dish.category}</span></div>
                      </div>
                      <span style={{ fontSize: '0.75rem', fontWeight: '800', color: 'var(--text-main)' }}>{dish.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
          <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid var(--border-color)', paddingTop: '16px' }}>
            <button className="btn-black" style={{ padding: '10px 24px', borderRadius: '8px', cursor: 'pointer', fontWeight: '700' }} onClick={() => setViewingPerfRestId(null)}>Close Analytics Deck</button>
          </div>
        </div>
      </div>
    );
  };

  const handleSidebarNav = (targetTab) => {
    // Reset module edit/view sub-states so clicking sidebar menu item opens the main module list view
    if (targetTab === 'plans') localStorage.removeItem('serviq_editingPlanId')
    if (targetTab === 'details') {
      localStorage.removeItem('serviq_editingRestId')
      localStorage.removeItem('serviq_viewingRestId')
      localStorage.removeItem('serviq_showAddRestModal')
    }
    if (targetTab === 'admins') {
      localStorage.removeItem('serviq_editingAdminId')
      localStorage.removeItem('serviq_showAddAdminModal')
    }
    if (targetTab === 'roles') localStorage.removeItem('serviq_editingRoleId')
    if (targetTab === 'revenue') localStorage.removeItem('serviq_viewingPerfRestId')

    // Broadcast reset event to active component
    window.dispatchEvent(new CustomEvent('reset_module_view', { detail: { tab: targetTab } }))

    setActiveTab(targetTab)
  }

  return (
    <>
      <div className="superadmin-wrapper animate-fade-in" style={{ display: 'grid', gridTemplateColumns: isMerged ? '1fr' : '260px 1fr', gap: '24px', padding: '24px 30px', width: '100%', minHeight: isMerged ? 'none' : 'calc(100vh - 60px)', background: 'rgb(226 232 239 / 26%)', transition: 'background-color var(--transition-normal)' }}>

        {/* Super Admin Control Navigation (Left) */}
        {!isMerged && (
          <div className="menu-categories-card" style={{ position: 'sticky', top: '90px', background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '16px', padding: '20px', height: 'fit-content' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px', paddingBottom: '12px', borderBottom: '1px solid var(--border-color)' }}>
              <div style={{ background: 'var(--primary)', color: '#fff', width: '32px', height: '32px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Crown style={{ width: '18px', height: '18px' }} /></div>
              <div>
                <h4 style={{ fontSize: '0.85rem', fontWeight: '900', color: 'var(--text-main)', margin: 0 }}>Super Admin Deck</h4>
                <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', display: 'block', fontWeight: '600' }}>Terminal: #0001-A</span>
              </div>
            </div>

            <ul className="menu-categories-list" style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '6px', padding: 0 }}>
              <li
                onClick={() => handleSidebarNav('revenue')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '12px 14px',
                  borderRadius: '10px',
                  cursor: 'pointer',
                  fontSize: '0.85rem',
                  fontWeight: '700',
                  color: activeTab === 'revenue' ? 'var(--primary)' : 'var(--text-main)',
                  background: activeTab === 'revenue' ? 'var(--primary-light)' : 'transparent',
                  transition: 'all var(--transition-fast)'
                }}
              >
                <TrendingUp style={{ width: '16px', height: '16px' }} />
                <span>Dashboard</span>
              </li>

              <li
                onClick={() => handleSidebarNav('details')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '12px 14px',
                  borderRadius: '10px',
                  cursor: 'pointer',
                  fontSize: '0.85rem',
                  fontWeight: '700',
                  color: activeTab === 'details' ? 'var(--primary)' : 'var(--text-main)',
                  background: activeTab === 'details' ? 'var(--primary-light)' : 'transparent',
                  transition: 'all var(--transition-fast)'
                }}
              >
                <Building style={{ width: '16px', height: '16px' }} />
                <span>Restaurant</span>
              </li>

              <li
                onClick={() => handleSidebarNav('plans')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '12px 14px',
                  borderRadius: '10px',
                  cursor: 'pointer',
                  fontSize: '0.85rem',
                  fontWeight: '700',
                  color: activeTab === 'plans' ? 'var(--primary)' : 'var(--text-main)',
                  background: activeTab === 'plans' ? 'var(--primary-light)' : 'transparent',
                  transition: 'all var(--transition-fast)'
                }}
              >
                <Layers style={{ width: '16px', height: '16px' }} />
                <span>Plans</span>
              </li>

              <li
                onClick={() => handleSidebarNav('subscriptions')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '12px 14px',
                  borderRadius: '10px',
                  cursor: 'pointer',
                  fontSize: '0.85rem',
                  fontWeight: '700',
                  color: activeTab === 'subscriptions' ? 'var(--primary)' : 'var(--text-main)',
                  background: activeTab === 'subscriptions' ? 'var(--primary-light)' : 'transparent',
                  transition: 'all var(--transition-fast)'
                }}
              >
                <Activity style={{ width: '16px', height: '16px' }} />
                <span>Subscription</span>
              </li>

              <li
                onClick={() => handleSidebarNav('billing')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '12px 14px',
                  borderRadius: '10px',
                  cursor: 'pointer',
                  fontSize: '0.85rem',
                  fontWeight: '700',
                  color: activeTab === 'billing' ? 'var(--primary)' : 'var(--text-main)',
                  background: activeTab === 'billing' ? 'var(--primary-light)' : 'transparent',
                  transition: 'all var(--transition-fast)'
                }}
              >
                <CreditCard style={{ width: '16px', height: '16px' }} />
                <span>Billing & Payments</span>
              </li>

              <li
                onClick={() => handleSidebarNav('leads')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '12px 14px',
                  borderRadius: '10px',
                  cursor: 'pointer',
                  fontSize: '0.85rem',
                  fontWeight: '700',
                  color: activeTab === 'leads' ? 'var(--primary)' : 'var(--text-main)',
                  background: activeTab === 'leads' ? 'var(--primary-light)' : 'transparent',
                  transition: 'all var(--transition-fast)'
                }}
              >
                <Briefcase style={{ width: '16px', height: '16px' }} />
                <span>Leads/CRM</span>
              </li>

              <li
                onClick={() => handleSidebarNav('tickets')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '12px 14px',
                  borderRadius: '10px',
                  cursor: 'pointer',
                  fontSize: '0.85rem',
                  fontWeight: '700',
                  color: activeTab === 'tickets' ? 'var(--primary)' : 'var(--text-main)',
                  background: activeTab === 'tickets' ? 'var(--primary-light)' : 'transparent',
                  transition: 'all var(--transition-fast)'
                }}
              >
                <LifeBuoy style={{ width: '16px', height: '16px' }} />
                <span>Support Ticket</span>
              </li>

              <li
                onClick={() => handleSidebarNav('notifications')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '12px 14px',
                  borderRadius: '10px',
                  cursor: 'pointer',
                  fontSize: '0.85rem',
                  fontWeight: '700',
                  color: activeTab === 'notifications' ? 'var(--primary)' : 'var(--text-main)',
                  background: activeTab === 'notifications' ? 'var(--primary-light)' : 'transparent',
                  transition: 'all var(--transition-fast)'
                }}
              >
                <Bell style={{ width: '16px', height: '16px' }} />
                <span>Notifications</span>
              </li>

              <li
                onClick={() => handleSidebarNav('reports')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '12px 14px',
                  borderRadius: '10px',
                  cursor: 'pointer',
                  fontSize: '0.85rem',
                  fontWeight: '700',
                  color: activeTab === 'reports' ? 'var(--primary)' : 'var(--text-main)',
                  background: activeTab === 'reports' ? 'var(--primary-light)' : 'transparent',
                  transition: 'all var(--transition-fast)'
                }}
              >
                <BarChart2 style={{ width: '16px', height: '16px' }} />
                <span>Reports & Analytics</span>
              </li>

              <li style={{ listStyleType: 'none', padding: 0, margin: 0 }}>
                <div
                  onClick={() => setUsersDropdownOpen(!usersDropdownOpen)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '12px 14px',
                    borderRadius: '10px',
                    cursor: 'pointer',
                    fontSize: '0.85rem',
                    fontWeight: '700',
                    color: (activeTab === 'admins' || activeTab === 'roles') ? 'var(--primary)' : 'var(--text-main)',
                    background: (activeTab === 'admins' || activeTab === 'roles') ? 'var(--primary-light)' : 'transparent',
                    transition: 'all var(--transition-fast)'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Users style={{ width: '16px', height: '16px' }} />
                    <span>User & Role</span>
                  </div>
                  <ChevronDown
                    style={{
                      width: '12px',
                      height: '12px',
                      transition: 'transform 0.2s',
                      transform: usersDropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)'
                    }}
                  />
                </div>

                {usersDropdownOpen && (
                  <div style={{
                    paddingLeft: '12px',
                    marginTop: '4px',
                    marginBottom: '4px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '4px',
                    borderLeft: '1px solid var(--border-color)',
                    marginLeft: '20px'
                  }}>
                    <div
                      onClick={() => handleSidebarNav('admins')}
                      style={{
                        padding: '8px 12px',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontSize: '0.8rem',
                        fontWeight: '700',
                        color: activeTab === 'admins' ? 'var(--primary)' : 'var(--text-main)',
                        background: activeTab === 'admins' ? 'var(--primary-light)' : 'transparent',
                        transition: 'all var(--transition-fast)'
                      }}
                    >
                      Users
                    </div>
                    <div
                      onClick={() => handleSidebarNav('roles')}
                      style={{
                        padding: '8px 12px',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontSize: '0.8rem',
                        fontWeight: '700',
                        color: activeTab === 'roles' ? 'var(--primary)' : 'var(--text-main)',
                        background: activeTab === 'roles' ? 'var(--primary-light)' : 'transparent',
                        transition: 'all var(--transition-fast)'
                      }}
                    >
                      Roles & Permissions
                    </div>
                  </div>
                )}
              </li>

              <li
                onClick={() => handleSidebarNav('settings')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '12px 14px',
                  borderRadius: '10px',
                  cursor: 'pointer',
                  fontSize: '0.85rem',
                  fontWeight: '700',
                  color: activeTab === 'settings' ? 'var(--primary)' : 'var(--text-main)',
                  background: activeTab === 'settings' ? 'var(--primary-light)' : 'transparent',
                  transition: 'all var(--transition-fast)'
                }}
              >
                <Settings style={{ width: '16px', height: '16px' }} />
                <span>System Config</span>
              </li>
            </ul>

            {/* Database Status Widget */}
            <div style={{ marginTop: '24px', padding: '14px', background: 'var(--bg-app)', border: '1px solid var(--border-color)', borderRadius: '10px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.65rem', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Database Health</span>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981', display: 'inline-block' }}></span>
              </div>
              <div>
                <span style={{ fontSize: '0.75rem', fontWeight: '800', display: 'block', color: 'var(--text-main)' }}>4.82 MB / SQLite3</span>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{tables.length} tables â€¢ {menuItems.length} menu items</span>
              </div>
            </div>
          </div>
        )}

        {/* Main Workspace Area (Right) */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', minWidth: 0 }}>

          {/* Tab 1: Restaurant Details Layout */}
          {activeTab === 'details' && (
            <Restaurants
              restaurants={restaurants}
              onUpdateRestaurants={onUpdateRestaurants}
              activeRestaurantId={activeRestaurantId}
              onSetActiveRestaurantId={onSetActiveRestaurantId}
              onUpdateRestaurantDetails={onUpdateRestaurantDetails}
              showToast={showToast}
              setConfirmModal={(modal) => {
                if (modal === null) {
                  setConfirmModal(null)
                } else {
                  setConfirmModal({
                    open: true,
                    title: modal.title,
                    message: modal.message,
                    confirmText: modal.confirmText,
                    confirmColor: modal.confirmColor,
                    onConfirm: () => {
                      modal.onConfirm()
                      setConfirmModal(null)
                    }
                  })
                }
              }}
            />
          )}

          {/* Tab 2: Premium Super Admin Dashboard & Analytics */}
          {activeTab === 'revenue' && (
            <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

              {/* KPI Metrics Row 1: Restaurants & Users */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
                {/* Card 1: Total Restaurants */}
                <div className="glass-card" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '14px', background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRight: '5px solid #f95e10', borderRadius: '16px' }}>
                  <div style={{ background: 'var(--primary-light)', color: 'var(--primary)', width: '42px', height: '42px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Building style={{ width: '22px', height: '22px' }} /></div>
                  <div>
                    <span style={{ fontSize: '0.7rem', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block' }}>Total Restaurants</span>
                    <h3 style={{ margin: 0, fontSize: '1.4rem', fontWeight: '900' }}>{restaurants.length}</h3>
                    <span style={{ fontSize: '0.65rem', color: '#10b981', fontWeight: '700' }}>100% Registered</span>
                  </div>
                </div>

                {/* Card 2: Active Restaurants */}
                <div className="glass-card" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '14px', background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRight: '5px solid #f95e10', borderRadius: '16px' }}>
                  <div style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', width: '42px', height: '42px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><CheckCircle style={{ width: '22px', height: '22px' }} /></div>
                  <div>
                    <span style={{ fontSize: '0.7rem', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block' }}>Active Restaurants</span>
                    <h3 style={{ margin: 0, fontSize: '1.4rem', fontWeight: '900' }}>{restaurants.filter(r => r.status === 'Active').length}</h3>
                    <span style={{ fontSize: '0.65rem', color: '#10b981', fontWeight: '700' }}>Online & Serving</span>
                  </div>
                </div>

                {/* Card 3: Inactive Restaurants */}
                <div className="glass-card" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '14px', background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRight: '5px solid #f95e10', borderRadius: '16px' }}>
                  <div style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', width: '42px', height: '42px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><AlertTriangle style={{ width: '22px', height: '22px' }} /></div>
                  <div>
                    <span style={{ fontSize: '0.7rem', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block' }}>Inactive Restaurants</span>
                    <h3 style={{ margin: 0, fontSize: '1.4rem', fontWeight: '900' }}>{restaurants.filter(r => r.status !== 'Active').length}</h3>
                    <span style={{ fontSize: '0.65rem', color: '#f59e0b', fontWeight: '700' }}>Suspended/Offline</span>
                  </div>
                </div>


              </div>

              {/* KPI Metrics Row 2: Platform Financials & Subscriptions */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
                {/* Card: Monthly Revenue */}
                <div className="glass-card" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '14px', background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRight: '5px solid #f95e10', borderRadius: '16px' }}>
                  <div style={{ background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6', width: '42px', height: '42px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <TrendingUp style={{ width: '22px', height: '22px' }} />
                  </div>
                  <div>
                    <span style={{ fontSize: '0.7rem', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block' }}>Monthly Revenue (Est.)</span>
                    <h3 style={{ margin: 0, fontSize: '1.4rem', fontWeight: '900' }}>₹{monthlyRevenue.toLocaleString()}</h3>
                  </div>
                </div>

                {/* Card: Expiring Subscriptions */}
                <div className="glass-card" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '14px', background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRight: '5px solid #f95e10', borderRadius: '16px' }}>
                  <div style={{ background: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b', width: '42px', height: '42px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Clock style={{ width: '22px', height: '22px' }} />
                  </div>
                  <div>
                    <span style={{ fontSize: '0.7rem', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block' }}>Expiring Subscriptions</span>
                    <h3 style={{ margin: 0, fontSize: '1.4rem', fontWeight: '900' }}>{expiringSubscriptionsCount} Branches</h3>
                    <span style={{ fontSize: '0.65rem', color: '#ef4444', fontWeight: '700' }}>Awaiting renewal (30d)</span>
                  </div>
                </div>

                {/* Card: Pending Payments */}
                <div className="glass-card" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '14px', background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRight: '5px solid #f95e10', borderRadius: '16px' }}>
                  <div style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', width: '42px', height: '42px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <CreditCard style={{ width: '22px', height: '22px' }} />
                  </div>
                  <div>
                    <span style={{ fontSize: '0.7rem', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block' }}>Pending Payments</span>
                    <h3 style={{ margin: 0, fontSize: '1.4rem', fontWeight: '900' }}>₹{pendingPaymentsSum.toLocaleString()}</h3>
                    <span style={{ fontSize: '0.65rem', color: '#f59e0b', fontWeight: '700' }}>{pendingPaymentsCount} Invoice(s) Pending</span>
                  </div>
                </div>
              </div>

              {/* KPI Metrics Row 2: Orders & Financials */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
                {/* Card 4: Basic Plan Count */}
                <div className="glass-card" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '14px', background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRight: '5px solid #f95e10', borderRadius: '16px' }}>
                  <div style={{ background: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b', width: '42px', height: '42px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Award style={{ width: '22px', height: '22px' }} /></div>
                  <div>
                    <span style={{ fontSize: '0.7rem', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block' }}>Basic Plan</span>
                    <h3 style={{ margin: 0, fontSize: '1.4rem', fontWeight: '900' }}>{restaurants.filter(r => r.subscriptionPlan?.includes('Basic')).length}</h3>
                  </div>
                </div>

                {/* Card 5: Standard Plan Count */}
                <div className="glass-card" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '14px', background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRight: '5px solid #f95e10', borderRadius: '16px' }}>
                  <div style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', width: '42px', height: '42px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Award style={{ width: '22px', height: '22px' }} /></div>
                  <div>
                    <span style={{ fontSize: '0.7rem', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block' }}>Standard Plan</span>
                    <h3 style={{ margin: 0, fontSize: '1.4rem', fontWeight: '900' }}>{restaurants.filter(r => r.subscriptionPlan?.includes('Standard')).length}</h3>
                  </div>
                </div>

                {/* Card 6: Premium Plan Count */}
                <div className="glass-card" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '14px', background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRight: '5px solid #f95e10', borderRadius: '16px' }}>
                  <div style={{ background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6', width: '42px', height: '42px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Award style={{ width: '22px', height: '22px' }} /></div>
                  <div>
                    <span style={{ fontSize: '0.7rem', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block' }}>Premium Plan</span>
                    <h3 style={{ margin: 0, fontSize: '1.4rem', fontWeight: '900' }}>{restaurants.filter(r => r.subscriptionPlan?.includes('Premium')).length}</h3>
                  </div>
                </div>

              </div>

              {/* View Support Ticket Summary */}
              <div className="glass-card" style={{
                padding: '24px',
                background: 'var(--bg-card)',
                border: '1px solid var(--border-color)',
                borderRadius: '16px',
                display: 'flex',
                flexDirection: 'column',
                gap: '16px'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '10px',
                      background: 'linear-gradient(135deg, #f97316, #ea580c)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}>
                      <LifeBuoy style={{ width: '18px', height: '18px', color: '#ffffff' }} />
                    </div>
                    <div>
                      <h4 style={{ margin: 0, fontSize: '1.05rem', fontWeight: '800', color: 'var(--text-main)' }}>View Support Ticket Summary</h4>
                      <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: '600' }}>Track and manage all restaurant support requests</span>
                    </div>
                  </div>
                  <span style={{
                    fontSize: '0.65rem',
                    fontWeight: '800',
                    padding: '3px 10px',
                    borderRadius: '20px',
                    background: 'rgba(249, 115, 22, 0.1)',
                    color: '#f97316',
                    border: '1px solid rgba(249, 115, 22, 0.2)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.3px'
                  }}>Live</span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
                  {[
                    { label: 'Open Tickets', value: '12', color: '#ef4444', bg: 'rgba(239, 68, 68, 0.08)', borderColor: 'rgba(239, 68, 68, 0.15)' },
                    { label: 'In Progress', value: '8', color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.08)', borderColor: 'rgba(245, 158, 11, 0.15)' },
                    { label: 'Resolved (30d)', value: '47', color: '#10b981', bg: 'rgba(16, 185, 129, 0.08)', borderColor: 'rgba(16, 185, 129, 0.15)' },
                    { label: 'Avg Response', value: '2.4h', color: '#6366f1', bg: 'rgba(99, 102, 241, 0.08)', borderColor: 'rgba(99, 102, 241, 0.15)' }
                  ].map((stat, idx) => (
                    <div key={idx} style={{
                      padding: '16px',
                      borderRadius: '12px',
                      background: stat.bg,
                      border: `1px solid ${stat.borderColor}`,
                      textAlign: 'center'
                    }}>
                      <div style={{ fontSize: '1.4rem', fontWeight: '900', color: stat.color, lineHeight: 1 }}>{stat.value}</div>
                      <div style={{ fontSize: '0.68rem', fontWeight: '700', color: 'var(--text-muted)', marginTop: '6px', textTransform: 'uppercase', letterSpacing: '0.3px' }}>{stat.label}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Split Cards Container */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px', marginBottom: '24px' }}>

                {/* Card 1: Subscription Revenue Trend */}
                <div className="glass-card animate-fade-in" style={{ padding: '24px', background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '16px', display: 'flex', flexDirection: 'column' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', borderBottom: '1px solid var(--border-color)', paddingBottom: '16px' }}>
                    <div>
                      <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: '900' }}>Subscription Revenue Trend</h3>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Monthly recurring revenue from franchise plans</span>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <h2 style={{ margin: 0, fontSize: '1.8rem', fontWeight: '900', color: 'var(--primary)' }}>₹{subscriptionRevenue.toLocaleString()}</h2>
                      <span style={{ fontSize: '0.75rem', background: 'var(--primary-light)', color: 'var(--primary)', padding: '4px 10px', borderRadius: '6px', fontWeight: '800' }}>+12.5% vs Last Month</span>
                    </div>
                  </div>

                  <div style={{ position: 'relative', width: '100%', height: '220px', marginTop: 'auto' }}>
                    <svg viewBox="0 0 600 220" style={{ width: '100%', height: '100%', overflow: 'visible' }} preserveAspectRatio="none">
                      <defs>
                        <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.25" />
                          <stop offset="100%" stopColor="var(--primary)" stopOpacity="0.0" />
                        </linearGradient>
                        <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                          <feGaussianBlur stdDeviation="4" result="blur" />
                          <feComposite in="SourceGraphic" in2="blur" operator="over" />
                        </filter>
                      </defs>

                      {/* Background Grid Lines */}
                      <line x1="0" y1="20" x2="600" y2="20" stroke="var(--border-color)" strokeWidth="1" strokeDasharray="5,5" />
                      <line x1="0" y1="90" x2="600" y2="90" stroke="var(--border-color)" strokeWidth="1" strokeDasharray="5,5" />
                      <line x1="0" y1="160" x2="600" y2="160" stroke="var(--border-color)" strokeWidth="1" />

                      {/* Area fill (Smooth Cubic Bezier) */}
                      <path
                        d="M 50,160 L 50,148 C 100,148 100,90 150,90 C 200,90 200,125 250,125 C 300,125 300,55 350,55 C 400,55 400,78 450,78 C 500,78 500,20 550,20 L 550,160 Z"
                        fill="url(#areaGradient)"
                      />

                      {/* Guideline for June */}
                      <line x1="550" y1="20" x2="550" y2="160" stroke="var(--primary)" strokeWidth="1.5" strokeDasharray="3,3" opacity="0.5" />

                      {/* Smooth Cubic Bezier Line */}
                      <path
                        d="M 50,148 C 100,148 100,90 150,90 C 200,90 200,125 250,125 C 300,125 300,55 350,55 C 400,55 400,78 450,78 C 500,78 500,20 550,20"
                        fill="none"
                        stroke="var(--primary)"
                        strokeWidth="4"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />

                      {/* Data Points (Elegant Rings) */}
                      <circle cx="50" cy="148" r="4" fill="var(--bg-card)" stroke="var(--primary)" strokeWidth="2.5" />
                      <circle cx="150" cy="90" r="4" fill="var(--bg-card)" stroke="var(--primary)" strokeWidth="2.5" />
                      <circle cx="250" cy="125" r="4" fill="var(--bg-card)" stroke="var(--primary)" strokeWidth="2.5" />
                      <circle cx="350" cy="55" r="4" fill="var(--bg-card)" stroke="var(--primary)" strokeWidth="2.5" />
                      <circle cx="450" cy="78" r="4" fill="var(--bg-card)" stroke="var(--primary)" strokeWidth="2.5" />

                      {/* Active Data Point */}
                      <circle cx="550" cy="20" r="6" fill="var(--primary)" stroke="var(--bg-card)" strokeWidth="2.5" filter="url(#glow)" />

                      {/* Value Labels */}
                      <text x="50" y="130" textAnchor="middle" fontSize="11" fill="var(--text-muted)" fontWeight="700">₹{(subscriptionRevenue * 0.45 / 1000).toFixed(1)}K</text>
                      <text x="150" y="72" textAnchor="middle" fontSize="11" fill="var(--text-muted)" fontWeight="700">₹{(subscriptionRevenue * 0.7 / 1000).toFixed(1)}K</text>
                      <text x="250" y="107" textAnchor="middle" fontSize="11" fill="var(--text-muted)" fontWeight="700">₹{(subscriptionRevenue * 0.55 / 1000).toFixed(1)}K</text>
                      <text x="350" y="37" textAnchor="middle" fontSize="11" fill="var(--text-muted)" fontWeight="700">₹{(subscriptionRevenue * 0.85 / 1000).toFixed(1)}K</text>
                      <text x="450" y="60" textAnchor="middle" fontSize="11" fill="var(--text-muted)" fontWeight="700">₹{(subscriptionRevenue * 0.75 / 1000).toFixed(1)}K</text>

                      {/* Active Month Floating Tooltip */}
                      <g filter="url(#glow)">
                        <rect x="500" y="-30" width="100" height="32" rx="8" fill="var(--bg-card)" stroke="var(--primary)" strokeWidth="1.5" />
                        <text x="550" y="-10" textAnchor="middle" fontSize="12" fontWeight="800" fill="var(--text-main)">₹{(subscriptionRevenue / 1000).toFixed(1)}K</text>
                      </g>

                      {/* X-Axis Labels */}
                      <text x="50" y="190" textAnchor="middle" fontSize="13" fill="var(--text-muted)" fontWeight="600">Jan</text>
                      <text x="150" y="190" textAnchor="middle" fontSize="13" fill="var(--text-muted)" fontWeight="600">Feb</text>
                      <text x="250" y="190" textAnchor="middle" fontSize="13" fill="var(--text-muted)" fontWeight="600">Mar</text>
                      <text x="350" y="190" textAnchor="middle" fontSize="13" fill="var(--text-muted)" fontWeight="600">Apr</text>
                      <text x="450" y="190" textAnchor="middle" fontSize="13" fill="var(--text-muted)" fontWeight="600">May</text>
                      <text x="550" y="190" textAnchor="middle" fontSize="13" fill="var(--primary)" fontWeight="800">Jun (Current)</text>
                    </svg>
                  </div>
                </div>

                {/* Card 2: Subscription Plan Distribution */}
                <div className="glass-card animate-fade-in" style={{ padding: '24px', background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '16px', display: 'flex', flexDirection: 'column' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', borderBottom: '1px solid var(--border-color)', paddingBottom: '16px' }}>
                    <div>
                      <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: '900' }}>Subscription Plan Distribution</h3>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Active branch plan types and percentages</span>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <h2 style={{ margin: 0, fontSize: '1.8rem', fontWeight: '900', color: '#10b981' }}>{standardCount + premiumCount}</h2>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '32px', flex: 1, padding: '10px 0', marginTop: 'auto' }}>
                    {/* SVG Donut Chart */}
                    <div style={{ position: 'relative', width: '130px', height: '130px', flexShrink: 0 }}>
                      <svg viewBox="0 0 100 100" style={{ transform: 'rotate(-90deg)', width: '100%', height: '100%' }}>
                        {/* Grey Track under segments */}
                        <circle cx="50" cy="50" r="40" fill="none" stroke="var(--border-color)" strokeWidth="12" />

                        {/* Standard segment (Emerald green) */}
                        <circle
                          cx="50" cy="50" r="40" fill="none"
                          stroke="#10b981" strokeWidth="12"
                          strokeDasharray={`${standardDash} ${donutCircumference}`}
                          strokeDashoffset={0}
                          strokeLinecap="round"
                        />

                        {/* Premium segment (Blue) */}
                        <circle
                          cx="50" cy="50" r="40" fill="none"
                          stroke="#3b82f6" strokeWidth="12"
                          strokeDasharray={`${premiumDash} ${donutCircumference}`}
                          strokeDashoffset={-standardDash}
                          strokeLinecap="round"
                        />
                      </svg>

                      {/* Text inside the Donut hole */}
                      <div style={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        textAlign: 'center'
                      }}>
                        <span style={{ fontSize: '1.4rem', fontWeight: '900', color: 'var(--text-main)', display: 'block', lineHeight: 1 }}>
                          {standardCount + premiumCount}
                        </span>
                        <span style={{ fontSize: '0.6rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '800', letterSpacing: '0.5px' }}>
                          Branches
                        </span>
                      </div>
                    </div>

                    {/* Donut Chart Legend Panel */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', flex: 1 }}>
                      {/* Standard */}
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '6px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#10b981', flexShrink: 0 }} />
                          <span style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--text-main)' }}>Standard Plan</span>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <span style={{ fontSize: '0.85rem', fontWeight: '800', color: 'var(--text-main)', display: 'block' }}>{standardCount}</span>
                          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: '600' }}>{standardPct.toFixed(0)}%</span>
                        </div>
                      </div>

                      {/* Premium */}
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '6px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#3b82f6', flexShrink: 0 }} />
                          <span style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--text-main)' }}>Premium Plan</span>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <span style={{ fontSize: '0.85rem', fontWeight: '800', color: 'var(--text-main)', display: 'block' }}>{premiumCount}</span>
                          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: '600' }}>{premiumPct.toFixed(0)}%</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

              </div>

              {/* Section 4: Top Performing Restaurants directory & Ledger */}
              <div className="glass-card animate-fade-in" style={{ background: 'var(--bg-card)', borderRadius: '16px', border: '1px solid var(--border-color)', overflow: 'hidden' }}>
                <div style={{ padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', background: 'var(--bg-card)' }}>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: '900' }}>Ranked Top Performing Restaurants Deck</h3>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Financial index rating computed across all active and suspended franchise codes.</span>
                  </div>
                  <button
                    onClick={() => {
                      showToast('success', 'Excel Spreadsheet report generated and downloaded (Simulated).')
                    }}
                    className="btn-outline"
                    style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', padding: '6px 12px', cursor: 'pointer' }}
                  >
                    <FileSpreadsheet style={{ width: '14px', height: '14px' }} /> Download Excel Sheet
                  </button>
                </div>

                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ background: 'var(--bg-app)', borderBottom: '1px solid var(--border-color)' }}>
                      <th style={{ textAlign: 'left', padding: '12px 18px', fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '800' }}>Restaurant</th>
                      <th style={{ textAlign: 'left', padding: '12px 18px', fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '800' }}>Code ID</th>
                      <th style={{ textAlign: 'left', padding: '12px 18px', fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '800' }}>City / Location</th>
                      <th style={{ textAlign: 'left', padding: '12px 18px', fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '800' }}>Operational Status</th>
                      <th style={{ textAlign: 'right', padding: '12px 18px', fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '800' }}>Subscription Plan</th>
                    </tr>
                  </thead>
                  <tbody>
                    {restaurants.map((rest, i) => {
                      const salesRatio = i === 0 ? 0.35 : i === 1 ? 0.25 : i === 2 ? 0.20 : i === 3 ? 0.12 : 0.08
                      const earnings = Math.round(totalRevenue * salesRatio)
                      const score = i === 0 ? '98/100' : i === 1 ? '92/100' : i === 2 ? '86/100' : i === 3 ? '78/100' : '72/100'
                      const rankIcon = i === 0 ? <Award style={{ width: '16px', height: '16px', color: '#7c3aed' }} /> : i === 1 ? <Award style={{ width: '16px', height: '16px', color: '#3b82f6' }} /> : i === 2 ? <Award style={{ width: '16px', height: '16px', color: '#10b981' }} /> : <Star style={{ width: '14px', height: '14px', color: '#f59e0b' }} />

                      return (
                        <tr key={rest.id} style={{ borderBottom: '1px solid var(--border-color)', transition: 'background-color 0.2s', ':hover': { backgroundColor: 'var(--bg-app)' } }}>
                          <td style={{ padding: '14px 18px', fontSize: '0.85rem', fontWeight: '800', color: 'var(--text-main)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <img src={rest.logo || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=60&auto=format&fit=crop&q=60'} alt={rest.name} style={{ width: '28px', height: '28px', borderRadius: '6px', objectFit: 'cover', border: '1px solid var(--border-color)' }} />
                              <span>{rest.name}</span>
                            </div>
                          </td>
                          <td style={{ padding: '14px 18px', fontSize: '0.8rem', color: 'var(--text-muted)', fontFamily: 'monospace', fontWeight: '700' }}>{rest.id}</td>
                          <td style={{ padding: '14px 18px', fontSize: '0.8rem', color: 'var(--text-main)', fontWeight: '600' }}>{rest.city || 'Chennai'}</td>
                          <td style={{ padding: '14px 18px' }}>
                            <span style={{
                              fontSize: '0.65rem',
                              fontWeight: '800',
                              padding: '3px 8px',
                              borderRadius: '4px',
                              background: rest.status === 'Active' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                              color: rest.status === 'Active' ? '#10b981' : '#ef4444'
                            }}>
                              {rest.status ? rest.status.toUpperCase() : 'ACTIVE'}
                            </span>
                          </td>
                          <td style={{ padding: '14px 18px', textAlign: 'right' }}>
                            <span style={{
                              fontSize: '0.75rem',
                              fontWeight: '800',
                              padding: '4px 10px',
                              borderRadius: '6px',
                              background: rest.subscriptionPlan?.includes('Enterprise') ? 'rgba(124, 58, 237, 0.1)' : rest.subscriptionPlan?.includes('Premium') ? 'rgba(59, 130, 246, 0.1)' : 'rgba(16, 185, 129, 0.1)',
                              color: rest.subscriptionPlan?.includes('Enterprise') ? '#7c3aed' : rest.subscriptionPlan?.includes('Premium') ? '#3b82f6' : '#10b981'
                            }}>
                              {rest.subscriptionPlan || 'Standard Plan'}
                            </span>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>

            </div>
          )}


          {activeTab === 'admins' && (
            <Admins
              restaurants={restaurants}
              restaurantAdmins={restaurantAdmins}
              onUpdateRestaurantAdmins={onUpdateRestaurantAdmins}
              showToast={showToast}
              setConfirmModal={(modal) => {
                if (modal === null) {
                  setConfirmModal(null)
                } else {
                  setConfirmModal({
                    open: true,
                    title: modal.title,
                    message: modal.message,
                    confirmText: modal.confirmText,
                    confirmColor: modal.confirmColor,
                    onConfirm: () => {
                      modal.onConfirm()
                      setConfirmModal(null)
                    }
                  })
                }
              }}
            />
          )}

          {activeTab === 'leads' && (
            <LeadsCRM
              restaurants={restaurants}
              onUpdateRestaurants={onUpdateRestaurants}
              restaurantAdmins={restaurantAdmins}
              showToast={showToast}
            />
          )}

          {activeTab === 'billing' && (
            <RevenueBilling
              restaurants={restaurants}
              plans={plans}
              invoices={invoices}
              onUpdateInvoices={setInvoices}
              showToast={showToast}
            />
          )}

          {activeTab === 'roles' && (
            <RolesPermissions
              showToast={showToast}
              setConfirmModal={(modal) => {
                if (modal === null) {
                  setConfirmModal(null)
                } else {
                  setConfirmModal({
                    open: true,
                    title: modal.title,
                    message: modal.message,
                    confirmText: modal.confirmText,
                    confirmColor: modal.confirmColor,
                    onConfirm: () => {
                      modal.onConfirm()
                      setConfirmModal(null)
                    }
                  })
                }
              }}
            />
          )}


          {activeTab === 'subscriptions' && (
            <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px', minWidth: 0 }}>
              <SubscriptionManagement
                restaurants={restaurants}
                onUpdateRestaurants={onUpdateRestaurants}
                plans={plans}
                showToast={showToast}
                subscriptionHistory={subscriptionHistory}
                setSubscriptionHistory={setSubscriptionHistory}
              />
            </div>
          )}

          {activeTab === 'plans' && (
            <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px', minWidth: 0 }}>
              <PlansManagement
                plans={plans}
                setPlans={setPlans}
                showToast={showToast}
              />
            </div>
          )}

          {activeTab === 'tickets' && (
            <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px', minWidth: 0 }}>
              <SupportTicketManagement
                restaurants={restaurants}
                showToast={showToast}
              />
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px', minWidth: 0 }}>
              <NotificationsManagement
                restaurants={restaurants}
                showToast={showToast}
              />
            </div>
          )}

          {activeTab === 'reports' && (
            <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px', minWidth: 0 }}>
              <ReportsAnalytics
                restaurants={restaurants}
                showToast={showToast}
              />
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px', minWidth: 0 }}>
              <SystemSettings
                restaurantDetails={restaurantDetails}
                onUpdateRestaurantDetails={onUpdateRestaurantDetails}
                showToast={showToast}
                setSystemLogs={setSystemLogs}
              />
            </div>
          )}

        </div>
      </div>

      {/* Branch Performance Modal */}
      {renderPerformanceModal()}

      {/* Confirm Action Modal Overlay */}
      {confirmModal && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            background: 'rgba(9, 13, 22, 0.45)',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 1100,
            padding: '20px'
          }}
          onClick={() => setConfirmModal(null)}
        >
          <div
            className="animate-fade-in"
            style={{
              background: '#ffffff',
              borderRadius: '20px',
              padding: '36px 32px 28px',
              width: '90%',
              maxWidth: '440px',
              boxShadow: '0 20px 60px rgba(0,0,0,0.18)',
              textAlign: 'center'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ margin: '0 0 12px', fontSize: '1.15rem', fontWeight: '800', color: '#0f172a' }}>
              {confirmModal.title}
            </h3>
            <p style={{ margin: '0 0 28px', fontSize: '0.9rem', color: '#64748b', lineHeight: '1.6' }}>
              {confirmModal.message}
            </p>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                onClick={() => setConfirmModal(null)}
                style={{
                  flex: 1,
                  padding: '10px 24px',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  background: '#ffffff',
                  color: '#64748b',
                  fontWeight: '600',
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  transition: 'background 0.18s'
                }}
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  confirmModal.onConfirm();
                  setConfirmModal(null);
                }}
                style={{
                  flex: 1,
                  padding: '10px 24px',
                  borderRadius: '8px',
                  border: 'none',
                  background: confirmModal.confirmColor || '#ef4444',
                  color: '#ffffff',
                  fontWeight: '600',
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  transition: 'background 0.18s'
                }}
              >
                {confirmModal.confirmText}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Subscription Details Modal Overlay */}
      {viewingSubscriptionRest && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            background: 'rgba(9, 13, 22, 0.45)',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 1100,
            padding: '20px'
          }}
          onClick={() => setViewingSubscriptionRest(null)}
        >
          <div
            className="animate-fade-in"
            style={{
              background: '#ffffff',
              borderRadius: '20px',
              padding: '32px',
              width: '95%',
              maxWidth: '420px',
              boxShadow: '0 20px 60px rgba(0,0,0,0.18)',
              position: 'relative',
              textAlign: 'left'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid var(--border-color)', paddingBottom: '14px' }}>
              <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: '900', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Gem style={{ width: '18px', height: '18px', color: 'var(--primary)' }} />
                Subscription Information
              </h3>
              <button
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '4px' }}
                onClick={() => setViewingSubscriptionRest(null)}
              >
                <X style={{ width: '18px', height: '18px' }} />
              </button>
            </div>

            {/* Details Content */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '10px' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: '600' }}>Restaurant Name</span>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-main)', fontWeight: '800' }}>{viewingSubscriptionRest.name}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '10px' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: '600' }}>Plan Name</span>
                <span style={{
                  fontSize: '0.8rem',
                  fontWeight: '800',
                  padding: '3px 8px',
                  borderRadius: '4px',
                  background: viewingSubscriptionRest.subscriptionPlan?.includes('Enterprise') ? 'rgba(124, 58, 237, 0.1)' : viewingSubscriptionRest.subscriptionPlan?.includes('Premium') ? 'rgba(59, 130, 246, 0.1)' : 'rgba(16, 185, 129, 0.1)',
                  color: viewingSubscriptionRest.subscriptionPlan?.includes('Enterprise') ? '#7c3aed' : viewingSubscriptionRest.subscriptionPlan?.includes('Premium') ? '#3b82f6' : '#10b981'
                }}>
                  {viewingSubscriptionRest.subscriptionPlan || 'Basic Plan'}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '10px' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: '600' }}>Start Date</span>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-main)', fontWeight: '700', fontFamily: 'monospace' }}>
                  {viewingSubscriptionRest.createdDate || '—'}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '10px' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: '600' }}>End Date</span>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-main)', fontWeight: '700', fontFamily: 'monospace' }}>
                  {viewingSubscriptionRest.expiryDate || '—'}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '10px' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: '600' }}>Renewal Date</span>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-main)', fontWeight: '700', fontFamily: 'monospace' }}>
                  {viewingSubscriptionRest.renewalDate || viewingSubscriptionRest.expiryDate || '—'}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '10px' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: '600' }}>Subscription Status</span>
                <span style={{
                  fontSize: '0.8rem',
                  fontWeight: '800',
                  padding: '3px 8px',
                  borderRadius: '4px',
                  background: viewingSubscriptionRest.subscriptionStatus === 'Active' ? 'rgba(16, 185, 129, 0.1)' : viewingSubscriptionRest.subscriptionStatus === 'Expiring Soon' ? 'rgba(245, 158, 11, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                  color: viewingSubscriptionRest.subscriptionStatus === 'Active' ? '#10b981' : viewingSubscriptionRest.subscriptionStatus === 'Expiring Soon' ? '#f59e0b' : '#ef4444'
                }}>
                  {viewingSubscriptionRest.subscriptionStatus || 'Active'}
                </span>
              </div>
            </div>

            {/* Actions */}
            <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'flex-end' }}>
              <button
                className="btn-black"
                style={{ padding: '8px 18px', borderRadius: '8px', cursor: 'pointer', fontWeight: '700', fontSize: '0.8rem' }}
                onClick={() => setViewingSubscriptionRest(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
