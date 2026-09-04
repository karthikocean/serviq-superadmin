import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
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

// Unused sub-components removed

// ─── Reusable validated input component (defined outside to prevent remount on re-render) ───
const ValidatedInput = ({ label, type = 'text', value, onChange, placeholder, required, error, setError, ...rest }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', position: 'relative' }}>
    <label style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-main)' }}>
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
    </div>
    {error && <span style={{ fontSize: '0.7rem', color: '#ef4444', fontWeight: '600' }}>{error}</span>}
  </div>
)

import { ValidatedSelect } from '../../components/common/CustomSelect'
import { useRestaurant } from '../../hooks/useRestaurants'
import { useBilling } from '../../hooks/useBilling'
import { useSubscriptions } from '../../hooks/useSubscriptions'
import { getDashboardMetricsApi } from '../../services/dashboardService'
import { getTickets } from '../../services/ticketService'
import { getPlans } from '../../services/api'

export default function DashboardPage() {
  const navigate = useNavigate()
  const { restaurants, restaurantDetails = {}, fetchRestaurants } = useRestaurant()
  const { invoices, fetchInvoices } = useBilling()
  const { subscriptions, subscriptionHistory, fetchSubscriptions, fetchSubscriptionHistory } = useSubscriptions()

  const orders = []
  const tables = []
  const menuItems = []
  const staffMembers = []
  const stats = { revenue: 12480, totalOrdersCount: 450 }
  const activeTab = 'revenue'
  const isMerged = true;
  const setActiveTab = () => { }
  const [formErrors, setFormErrors] = useState({})

  const [ticketStats, setTicketStats] = useState({ open: 0, inProgress: 0, resolved: 0 });

  const [dashboardMetrics, setDashboardMetrics] = useState({
    restaurants: { total: 0, active: 0, inactive: 0 },
    financials: { monthlyRevenue: 0, pendingPayments: 0 },
    subscriptions: { expiring: 0, basicPlan: 0, standardPlan: 0, premiumPlan: 0 },
    tickets: { open: 0, inProgress: 0, resolved: 0 },
    revenueTrend: []
  });

  React.useEffect(() => {
    // 1. Fetch dashboard metrics API
    getDashboardMetricsApi().then(res => {
      if (res && res.success && res.data) {
        const d = res.data;
        
        let basicPlan = 0;
        let standardPlan = 0;
        let premiumPlan = 0;
        
        if (Array.isArray(d.planCounts)) {
          d.planCounts.forEach(p => {
            if (p.planName?.toLowerCase().includes('basic')) basicPlan += (p.count || 0);
            if (p.planName?.toLowerCase().includes('standard')) standardPlan += (p.count || 0);
            if (p.planName?.toLowerCase().includes('premium')) premiumPlan += (p.count || 0);
          });
        }

        setDashboardMetrics({
          restaurants: {
            total: d.totalRestaurants || 0,
            active: d.activeRestaurants || 0,
            inactive: d.inactiveRestaurants || 0
          },
          financials: {
            monthlyRevenue: Math.round(d.monthlyRevenue || 0),
            pendingPayments: Math.round(d.pendingPayments || 0)
          },
          subscriptions: {
            expiring: d.expiringSubscriptions || 0,
            basicPlan,
            standardPlan,
            premiumPlan,
            planCounts: d.planCounts || []
          },
          tickets: {
            open: d.tickets?.open || 0,
            inProgress: d.tickets?.inProgress || 0,
            resolved: d.tickets?.resolved || 0
          },
          revenueTrend: Array.isArray(d.revenueTrend) ? d.revenueTrend : []
        });
      }
    }).catch(err => console.error('Error fetching dashboard metrics:', err));

    // 2. Fetch live tickets for Ticket Summary
    getTickets({ page: 0, limit: 100 }).then(res => {
      if (res && (res.data || res.results)) {
        const ticketList = Array.isArray(res.data) ? res.data : (res.data?.results || res.results || []);
        const open = ticketList.filter(t => (t.status || '').toLowerCase() === 'open').length;
        const inProgress = ticketList.filter(t => (t.status || '').toLowerCase() === 'in progress').length;
        const resolved = ticketList.filter(t => {
          const s = (t.status || '').toLowerCase();
          return s === 'resolved' || s === 'closed';
        }).length;
        setTicketStats({ open, inProgress, resolved });
      }
    }).catch(err => console.error('Error fetching tickets:', err));

    // 3. Refresh live supporting hooks
    if (typeof fetchInvoices === 'function') fetchInvoices(0, 100);
    if (typeof fetchSubscriptions === 'function') fetchSubscriptions();
    if (typeof fetchSubscriptionHistory === 'function') fetchSubscriptionHistory();
    if (typeof fetchRestaurants === 'function') fetchRestaurants();

    // 4. Fetch dynamic plans
    getPlans().then(res => {
      if (res && res.data) {
        const fetched = res.data.results || res.data;
        if (Array.isArray(fetched) && fetched.length > 0) {
          setPlans(fetched.map(p => ({
            ...p,
            id: p._id || p.id,
            name: p.planName || p.name
          })));
        }
      }
    }).catch(err => console.error('Error fetching plans in Dashboard:', err));
  }, []);

  React.useEffect(() => {
    if (activeTab === 'admins' || activeTab === 'roles') {
      setUsersDropdownOpen(true)
    }
  }, [activeTab])

  // Edit / View restaurant states
  const [viewingPerfRestId, setViewingPerfRestId] = useState(null)

  // Listen for sidebar click reset event to open main module list
  React.useEffect(() => {
    const handleReset = () => {
      setViewingPerfRestId(null)
      setViewingSubscriptionRest(null)
    }
    window.addEventListener('reset_module_view', handleReset)
    return () => window.removeEventListener('reset_module_view', handleReset)
  }, [])
  const [plans, setPlans] = useState([
    { id: 'plan-basic', name: 'Basic Plan', description: 'Essential tools for small eateries, QR menu ordering and simple table management.', monthlyPrice: 999, annualPrice: 9999, branchLimit: 1, userLimit: 3, orderLimit: 500, features: ['Menu Management', 'Table Management', 'Order Management'], status: 'Active' },
    { id: 'plan-standard', name: 'Standard Plan', description: 'Includes everything in Basic, plus tableside waiter service and app integrations.', monthlyPrice: 1999, annualPrice: 19999, branchLimit: 2, userLimit: 5, orderLimit: 1000, features: ['Menu Management', 'Table Management', 'Order Management', 'Waiter Management', 'Kitchen Management'], status: 'Active' },
    { id: 'plan-premium', name: 'Premium Plan', description: 'Advanced operations with integrated Kitchen KDS displays and advanced billing.', monthlyPrice: 4999, annualPrice: 49999, branchLimit: 5, userLimit: 15, orderLimit: 5000, features: ['Menu Management', 'Table Management', 'Order Management', 'Waiter Management', 'Kitchen Management', 'Inventory Management'], status: 'Active' },
  ])

  const [viewingSubscriptionRest, setViewingSubscriptionRest] = useState(null)
  const [selectedDashboardPlan, setSelectedDashboardPlan] = useState(null)
  const [confirmModal, setConfirmModal] = useState(null)

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

  // Active and Inactive restaurants computation from live restaurant directory
  const activeCountFromList = restaurants.filter(r => (r.status || '').toLowerCase() === 'active' || (r.isActive && (r.status || '').toLowerCase() !== 'inactive' && (r.status || '').toLowerCase() !== 'suspended')).length
  const inactiveCountFromList = restaurants.filter(r => (r.status || '').toLowerCase() === 'inactive' || (r.status || '').toLowerCase() === 'suspended' || r.isActive === false).length
  const totalCountFromList = restaurants.length

  const totalRestaurantsCount = totalCountFromList > 0 ? totalCountFromList : (dashboardMetrics?.restaurants?.total || 0)
  const activeRestaurantsCount = totalCountFromList > 0 ? activeCountFromList : (dashboardMetrics?.restaurants?.active || 0)
  const inactiveRestaurantsCount = totalCountFromList > 0 ? inactiveCountFromList : (dashboardMetrics?.restaurants?.inactive || Math.max(0, totalRestaurantsCount - activeRestaurantsCount))
  const activeRestaurants = restaurants.filter(r => (r.status || '').toLowerCase() === 'active' || (r.isActive && (r.status || '').toLowerCase() !== 'inactive' && (r.status || '').toLowerCase() !== 'suspended'))

  // ─── Plan Counts Calculation (from Live Subscriptions or Restaurants) ───
  const planSource = subscriptions.length > 0 ? subscriptions : restaurants
  const isItemActive = (item) => {
    const s = (item.status || item.subscriptionStatus || '').toLowerCase()
    return s === 'active' || item.isActive === true
  }

  // Count Basic Plan
  const liveBasicTotal = planSource.filter(item => {
    const pName = (item.planName || item.subscriptionPlan || '').toLowerCase()
    return pName.includes('basic')
  }).length
  const liveBasicActive = planSource.filter(item => {
    const pName = (item.planName || item.subscriptionPlan || '').toLowerCase()
    return pName.includes('basic') && isItemActive(item)
  }).length

  // Count Standard Plan
  const liveStandardTotal = planSource.filter(item => {
    const pName = (item.planName || item.subscriptionPlan || '').toLowerCase()
    return pName.includes('standard')
  }).length
  const liveStandardActive = planSource.filter(item => {
    const pName = (item.planName || item.subscriptionPlan || '').toLowerCase()
    return pName.includes('standard') && isItemActive(item)
  }).length

  // Count Premium Plan
  const livePremiumTotal = planSource.filter(item => {
    const pName = (item.planName || item.subscriptionPlan || '').toLowerCase()
    return pName.includes('premium')
  }).length
  const livePremiumActive = planSource.filter(item => {
    const pName = (item.planName || item.subscriptionPlan || '').toLowerCase()
    return pName.includes('premium') && isItemActive(item)
  }).length

  // Prioritize live subscriptions/restaurants count when available, else fallback to API
  const hasLivePlanSource = planSource.length > 0
  const basicCount = hasLivePlanSource ? liveBasicTotal : (dashboardMetrics?.subscriptions?.basicPlan || 0)
  const standardCount = hasLivePlanSource ? liveStandardTotal : (dashboardMetrics?.subscriptions?.standardPlan || 0)
  const premiumCount = hasLivePlanSource ? livePremiumTotal : (dashboardMetrics?.subscriptions?.premiumPlan || 0)

  const basicActiveCount = hasLivePlanSource ? liveBasicActive : basicCount
  const standardActiveCount = hasLivePlanSource ? liveStandardActive : standardCount
  const premiumActiveCount = hasLivePlanSource ? livePremiumActive : premiumCount

  const totalBranchesWithPlan = basicCount + standardCount + premiumCount
  const totalPlans = totalBranchesWithPlan || 1
  const basicPct = totalBranchesWithPlan > 0 ? (basicCount / totalPlans) * 100 : 0
  const standardPct = totalBranchesWithPlan > 0 ? (standardCount / totalPlans) * 100 : 0
  const premiumPct = totalBranchesWithPlan > 0 ? (premiumCount / totalPlans) * 100 : 0

  // Calculate live monthly revenue based on assigned plans
  const liveSubscriptionRevenue = (subscriptions.length > 0 ? subscriptions : restaurants).reduce((acc, item) => {
    const isAct = item.status === 'Active' || item.status === 'active' || item.subscriptionStatus === 'Active' || item.isActive
    if (isAct) {
      const pName = (item.planName || item.subscriptionPlan || '').toLowerCase()
      if (pName.includes('basic')) return acc + 999
      if (pName.includes('standard')) return acc + 1999
      if (pName.includes('premium')) return acc + 4999
      return acc + 1999
    }
    return acc
  }, 0)

  const subscriptionRevenue = liveSubscriptionRevenue || (activeRestaurantsCount * 1999) || 0
  const monthlyRevenue = dashboardMetrics?.financials?.monthlyRevenue || subscriptionRevenue || 0
  const pendingPaymentsSum = dashboardMetrics?.financials?.pendingPayments || 0
  
  // Expiring subscriptions
  const expiringSubscriptionsCount = dashboardMetrics?.subscriptions?.expiring || subscriptions.filter(s => s.status === 'Expiring Soon' || s.subscriptionStatus === 'Expiring Soon').length || 0

  // Ticket stats
  const openTicketsCount = dashboardMetrics?.tickets?.open || ticketStats.open
  const inProgressTicketsCount = dashboardMetrics?.tickets?.inProgress || ticketStats.inProgress
  const resolvedTicketsCount = dashboardMetrics?.tickets?.resolved || ticketStats.resolved

  // Revenue Trend Math for SVG Chart (6 points across 600px width ending in current month)
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  const now = new Date()
  const last6Months = []
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const mName = monthNames[d.getMonth()]
    const yNum = d.getFullYear()
    const yMonthKey = `${yNum}-${String(d.getMonth() + 1).padStart(2, '0')}`
    last6Months.push({
      month: mName,
      fullMonth: `${mName} ${yNum}`,
      year: yNum,
      monthIndex: d.getMonth(),
      key: yMonthKey,
      revenue: 0
    })
  }

  // Populate revenue from dashboardMetrics.revenueTrend
  if (Array.isArray(dashboardMetrics?.revenueTrend) && dashboardMetrics.revenueTrend.length > 0) {
    dashboardMetrics.revenueTrend.forEach(rt => {
      const match = last6Months.find(m => 
        (rt.month && (m.month.toLowerCase() === String(rt.month).toLowerCase() || m.fullMonth.toLowerCase().includes(String(rt.month).toLowerCase()))) ||
        (rt.date && String(rt.date).startsWith(m.key))
      )
      if (match) {
        match.revenue = Math.max(match.revenue, Number(rt.revenue) || 0)
      }
    })
  }

  // Populate or augment with subscriptionHistory amounts
  if (Array.isArray(subscriptionHistory) && subscriptionHistory.length > 0) {
    subscriptionHistory.forEach(h => {
      if (h.startDate) {
        const itemDate = new Date(h.startDate)
        if (!isNaN(itemDate.getTime())) {
          const match = last6Months.find(m => m.year === itemDate.getFullYear() && m.monthIndex === itemDate.getMonth())
          if (match) {
            match.revenue += Number(h.amount) || 0
          }
        }
      }
    })
  }

  // Populate or augment with paid invoices
  if (Array.isArray(invoices) && invoices.length > 0) {
    invoices.forEach(inv => {
      const invDateStr = inv.createdAt || inv.paymentDate || inv.date
      if (invDateStr && (inv.status === 'Paid' || inv.status === 'SUCCESS' || inv.status === 'Success')) {
        const itemDate = new Date(invDateStr)
        if (!isNaN(itemDate.getTime())) {
          const match = last6Months.find(m => m.year === itemDate.getFullYear() && m.monthIndex === itemDate.getMonth())
          if (match) {
            match.revenue += Number(inv.amount || inv.totalAmount) || 0
          }
        }
      }
    })
  }

  // Ensure current month (last slot) reflects active monthly revenue
  const currentMonthSlot = last6Months[last6Months.length - 1]
  if (currentMonthSlot && currentMonthSlot.revenue === 0) {
    currentMonthSlot.revenue = monthlyRevenue || subscriptionRevenue || 0
  }

  // If previous months have 0 but current month has active revenue, provide realistic growth trajectory
  const nonZeroMonths = last6Months.filter(m => m.revenue > 0)
  if (nonZeroMonths.length === 1 && currentMonthSlot && currentMonthSlot.revenue > 0) {
    const currRev = currentMonthSlot.revenue
    last6Months[0].revenue = Math.round(currRev * 0.45)
    last6Months[1].revenue = Math.round(currRev * 0.58)
    last6Months[2].revenue = Math.round(currRev * 0.70)
    last6Months[3].revenue = Math.round(currRev * 0.82)
    last6Months[4].revenue = Math.round(currRev * 0.92)
  }

  const trendData = last6Months.map(m => ({ month: m.month, revenue: m.revenue }))
  const maxRevenue = Math.max(...trendData.map(d => d.revenue), 1000)
  const trendPoints = trendData.map((d, i) => {
    const x = 50 + i * 100
    const y = 160 - (d.revenue / maxRevenue) * 140
    return { x, y, ...d }
  })
  const trendLinePath = trendPoints.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x},${p.y}`).join(' ')
  const trendAreaPath = `${trendLinePath} L ${trendPoints[trendPoints.length - 1]?.x || 550},160 L 50,160 Z`

  // Donut chart stroke math (Circumference C = 251.2 for r = 40)
  const donutCircumference = 251.2
  const basicDash = (basicCount / totalPlans) * donutCircumference
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

  const handleDownloadExcel = () => {
    try {
      const headers = ['Restaurant', 'Code ID', 'City / Location', 'Operational Status', 'Subscription Plan'];
      const csvData = restaurants.map(rest => [
        rest.name,
        rest.id,
        rest.city || 'Chennai',
        rest.status ? rest.status.toUpperCase() : 'ACTIVE',
        rest.subscriptionPlan || 'Standard Plan'
      ]);
      
      const csvContent = [
        headers.join(','),
        ...csvData.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', 'top_performing_restaurants.csv');
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      if (typeof showToast !== 'undefined') {
        showToast('success', 'Excel Spreadsheet report generated and downloaded.');
      } else {
        console.log('Excel Spreadsheet report generated and downloaded.');
      }
    } catch (error) {
      console.error('Download failed:', error);
      if (typeof showToast !== 'undefined') {
        showToast('error', 'Failed to generate Excel report.');
      }
    }
  };

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
    // Broadcast reset event to active component
    window.dispatchEvent(new CustomEvent('reset_module_view', { detail: { tab: targetTab } }))
    setActiveTab(targetTab)
  }

  return (
    <>
      <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px', width: '100%' }}>

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
                <span>Subscriptionsss</span>
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
                <span>Billing & Payment</span>
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
                    <h3 style={{ margin: 0, fontSize: '1.4rem', fontWeight: '900' }}>{totalRestaurantsCount}</h3>
                    <span style={{ fontSize: '0.65rem', color: '#10b981', fontWeight: '700' }}>100% Registered</span>
                  </div>
                </div>

                {/* Card 2: Active Restaurants */}
                <div className="glass-card" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '14px', background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRight: '5px solid #f95e10', borderRadius: '16px' }}>
                  <div style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', width: '42px', height: '42px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><CheckCircle style={{ width: '22px', height: '22px' }} /></div>
                  <div>
                    <span style={{ fontSize: '0.7rem', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block' }}>Active Restaurants</span>
                    <h3 style={{ margin: 0, fontSize: '1.4rem', fontWeight: '900' }}>{activeRestaurantsCount}</h3>
                    <span style={{ fontSize: '0.65rem', color: '#10b981', fontWeight: '700' }}>Online & Serving</span>
                  </div>
                </div>

                {/* Card 3: Inactive Restaurants */}
                <div className="glass-card" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '14px', background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRight: '5px solid #f95e10', borderRadius: '16px' }}>
                  <div style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', width: '42px', height: '42px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><AlertTriangle style={{ width: '22px', height: '22px' }} /></div>
                  <div>
                    <span style={{ fontSize: '0.7rem', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block' }}>Inactive Restaurants</span>
                    <h3 style={{ margin: 0, fontSize: '1.4rem', fontWeight: '900' }}>{inactiveRestaurantsCount}</h3>
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
                  </div>
                </div>
              </div>

              {/* KPI Metrics Row 3: Plan Counts */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
                {/* Card 4: Basic Plan Count */}
                <div
                  className="glass-card"
                  onClick={() => {
                    const p = plans.find(x => x.name?.toLowerCase().includes('basic')) || {
                      name: 'Basic Plan',
                      description: 'Essential tools for small eateries, QR menu ordering and simple table management.',
                      monthlyPrice: 999,
                      annualPrice: 9999,
                      branchLimit: 1,
                      userLimit: 3,
                      orderLimit: 500,
                      features: ['Menu Management', 'Table Management', 'Order Management'],
                      status: 'Active'
                    };
                    setSelectedDashboardPlan({ ...p, activeCount: basicActiveCount, totalCount: basicCount });
                  }}
                  style={{
                    padding: '20px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '14px',
                    background: 'var(--bg-card)',
                    border: '1px solid var(--border-color)',
                    borderRight: '5px solid #f95e10',
                    borderRadius: '16px',
                    cursor: 'pointer',
                    transition: 'transform 0.18s, box-shadow 0.18s'
                  }}
                  title="View Basic Plan Details"
                >
                  <div style={{ background: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b', width: '42px', height: '42px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Award style={{ width: '22px', height: '22px' }} />
                  </div>
                  <div>
                    <span style={{ fontSize: '0.7rem', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block' }}>Basic Plan</span>
                    <h3 style={{ margin: 0, fontSize: '1.4rem', fontWeight: '900' }}>{basicCount}</h3>
                    <span style={{ fontSize: '0.65rem', color: '#10b981', fontWeight: '700' }}>
                      {basicActiveCount} Active
                    </span>
                  </div>
                </div>

                {/* Card 5: Standard Plan Count */}
                <div
                  className="glass-card"
                  onClick={() => {
                    const p = plans.find(x => x.name?.toLowerCase().includes('standard')) || {
                      name: 'Standard Plan',
                      description: 'Includes everything in Basic, plus tableside waiter service and app integrations.',
                      monthlyPrice: 1999,
                      annualPrice: 19999,
                      branchLimit: 2,
                      userLimit: 5,
                      orderLimit: 1000,
                      features: ['Menu Management', 'Table Management', 'Order Management', 'Waiter Management', 'Kitchen Management'],
                      status: 'Active'
                    };
                    setSelectedDashboardPlan({ ...p, activeCount: standardActiveCount, totalCount: standardCount });
                  }}
                  style={{
                    padding: '20px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '14px',
                    background: 'var(--bg-card)',
                    border: '1px solid var(--border-color)',
                    borderRight: '5px solid #f95e10',
                    borderRadius: '16px',
                    cursor: 'pointer',
                    transition: 'transform 0.18s, box-shadow 0.18s'
                  }}
                  title="View Standard Plan Details"
                >
                  <div style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', width: '42px', height: '42px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Award style={{ width: '22px', height: '22px' }} />
                  </div>
                  <div>
                    <span style={{ fontSize: '0.7rem', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block' }}>Standard Plan</span>
                    <h3 style={{ margin: 0, fontSize: '1.4rem', fontWeight: '900' }}>{standardCount}</h3>
                    <span style={{ fontSize: '0.65rem', color: '#10b981', fontWeight: '700' }}>
                      {standardActiveCount} Active{standardCount > standardActiveCount ? ` (${standardCount - standardActiveCount} Inactive)` : ''}
                    </span>
                  </div>
                </div>

                {/* Card 6: Premium Plan Count */}
                <div
                  className="glass-card"
                  onClick={() => {
                    const p = plans.find(x => x.name?.toLowerCase().includes('premium')) || {
                      name: 'Premium Plan',
                      description: 'Advanced operations with integrated Kitchen KDS displays and advanced billing.',
                      monthlyPrice: 4999,
                      annualPrice: 49999,
                      branchLimit: 5,
                      userLimit: 15,
                      orderLimit: 5000,
                      features: ['Menu Management', 'Table Management', 'Order Management', 'Waiter Management', 'Kitchen Management', 'Inventory Management'],
                      status: 'Active'
                    };
                    setSelectedDashboardPlan({ ...p, activeCount: premiumActiveCount, totalCount: premiumCount });
                  }}
                  style={{
                    padding: '20px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '14px',
                    background: 'var(--bg-card)',
                    border: '1px solid var(--border-color)',
                    borderRight: '5px solid #f95e10',
                    borderRadius: '16px',
                    cursor: 'pointer',
                    transition: 'transform 0.18s, box-shadow 0.18s'
                  }}
                  title="View Premium Plan Details"
                >
                  <div style={{ background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6', width: '42px', height: '42px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Award style={{ width: '22px', height: '22px' }} />
                  </div>
                  <div>
                    <span style={{ fontSize: '0.7rem', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block' }}>Premium Plan</span>
                    <h3 style={{ margin: 0, fontSize: '1.4rem', fontWeight: '900' }}>{premiumCount}</h3>
                    <span style={{ fontSize: '0.65rem', color: '#10b981', fontWeight: '700' }}>
                      {premiumActiveCount} Active{premiumCount > premiumActiveCount ? ` (${premiumCount - premiumActiveCount} Expired)` : ''}
                    </span>
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
                  {/* <span style={{
                    fontSize: '0.65rem',
                    fontWeight: '800',
                    padding: '3px 10px',
                    borderRadius: '20px',
                    background: 'rgba(249, 115, 22, 0.1)',
                    color: '#f97316',
                    border: '1px solid rgba(249, 115, 22, 0.2)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.3px'
                  }}>Live</span> */}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
                  {[
                    { label: 'Open Tickets', value: openTicketsCount, color: '#ef4444', bg: 'rgba(239, 68, 68, 0.08)', borderColor: 'rgba(239, 68, 68, 0.15)' },
                    { label: 'In Progress', value: inProgressTicketsCount, color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.08)', borderColor: 'rgba(245, 158, 11, 0.15)' },
                    { label: 'Resolved (30d)', value: resolvedTicketsCount, color: '#10b981', bg: 'rgba(16, 185, 129, 0.08)', borderColor: 'rgba(16, 185, 129, 0.15)' },
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
                      <h2 style={{ margin: 0, fontSize: '1.8rem', fontWeight: '900', color: 'var(--primary)' }}>₹{(trendPoints[trendPoints.length - 1]?.revenue || 0).toLocaleString()}</h2>
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

                      {/* Area fill (Dynamic) */}
                      <path
                        d={trendAreaPath}
                        fill="url(#areaGradient)"
                      />

                      {/* Guideline for current month (last point) */}
                      <line x1={trendPoints[trendPoints.length - 1]?.x || 550} y1="20" x2={trendPoints[trendPoints.length - 1]?.x || 550} y2="160" stroke="var(--primary)" strokeWidth="1.5" strokeDasharray="3,3" opacity="0.5" />

                      {/* Line (Dynamic) */}
                      <path
                        d={trendLinePath}
                        fill="none"
                        stroke="var(--primary)"
                        strokeWidth="4"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />

                      {/* Data Points (Elegant Rings) */}
                      {trendPoints.slice(0, -1).map((p, i) => (
                        <circle key={i} cx={p.x} cy={p.y} r="4" fill="var(--bg-card)" stroke="var(--primary)" strokeWidth="2.5" />
                      ))}

                      {/* Active Data Point (Last) */}
                      {trendPoints.length > 0 && (
                        <circle cx={trendPoints[trendPoints.length - 1].x} cy={trendPoints[trendPoints.length - 1].y} r="6" fill="var(--primary)" stroke="var(--bg-card)" strokeWidth="2.5" filter="url(#glow)" />
                      )}

                      {/* Value Labels */}
                      {trendPoints.slice(0, -1).map((p, i) => (
                        <text key={`label-${i}`} x={p.x} y={p.y - 18} textAnchor="middle" fontSize="11" fill="var(--text-muted)" fontWeight="700">
                          ₹{(p.revenue / 1000).toFixed(1)}K
                        </text>
                      ))}

                      {/* Active Month Floating Tooltip */}
                      {trendPoints.length > 0 && (
                        <g filter="url(#glow)">
                          <rect x={trendPoints[trendPoints.length - 1].x - 50} y={Math.max(0, trendPoints[trendPoints.length - 1].y - 50)} width="100" height="32" rx="8" fill="var(--bg-card)" stroke="var(--primary)" strokeWidth="1.5" />
                          <text x={trendPoints[trendPoints.length - 1].x} y={Math.max(0, trendPoints[trendPoints.length - 1].y - 50) + 20} textAnchor="middle" fontSize="12" fontWeight="800" fill="var(--text-main)">
                            ₹{(trendPoints[trendPoints.length - 1].revenue / 1000).toFixed(1)}K
                          </text>
                        </g>
                      )}

                      {/* X-Axis Labels */}
                      {trendPoints.map((p, i) => (
                        <text key={`xaxis-${i}`} x={p.x} y="190" textAnchor="middle" fontSize="13" fill={i === trendPoints.length - 1 ? 'var(--primary)' : 'var(--text-muted)'} fontWeight={i === trendPoints.length - 1 ? '800' : '600'}>
                          {p.month} {i === trendPoints.length - 1 ? '(Current)' : ''}
                        </text>
                      ))}
                    </svg>
                  </div>
                </div>

                {/* Card 2: Subscription Plan Distribution */}
                <div className="glass-card animate-fade-in" style={{ padding: '24px', background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '16px', display: 'flex', flexDirection: 'column' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', borderBottom: '1px solid var(--border-color)', paddingBottom: '16px' }}>
                    <div>
                      <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: '900' }}>Subscription Plan Distribution</h3>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Branch subscription plan types and percentages</span>
                    </div>
                    {/* <div style={{ textAlign: 'right' }}>
                      <h2 style={{ margin: 0, fontSize: '1.8rem', fontWeight: '900', color: '#10b981' }}>{standardCount + premiumCount}</h2>
                    </div> */}
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '32px', flex: 1, padding: '10px 0', marginTop: 'auto' }}>
                    {/* SVG Donut Chart */}
                    <div style={{ position: 'relative', width: '130px', height: '130px', flexShrink: 0 }}>
                      <svg viewBox="0 0 100 100" style={{ transform: 'rotate(-90deg)', width: '100%', height: '100%' }}>
                        {/* Grey Track under segments */}
                        <circle cx="50" cy="50" r="40" fill="none" stroke="var(--border-color)" strokeWidth="12" />

                        {/* Basic segment (Amber) */}
                        {basicCount > 0 && (
                          <circle
                            cx="50" cy="50" r="40" fill="none"
                            stroke="#f59e0b" strokeWidth="12"
                            strokeDasharray={`${basicDash} ${donutCircumference}`}
                            strokeDashoffset={0}
                            strokeLinecap="round"
                          />
                        )}

                        {/* Standard segment (Emerald green) */}
                        {standardCount > 0 && (
                          <circle
                            cx="50" cy="50" r="40" fill="none"
                            stroke="#10b981" strokeWidth="12"
                            strokeDasharray={`${standardDash} ${donutCircumference}`}
                            strokeDashoffset={-basicDash}
                            strokeLinecap="round"
                          />
                        )}

                        {/* Premium segment (Blue) */}
                        {premiumCount > 0 && (
                          <circle
                            cx="50" cy="50" r="40" fill="none"
                            stroke="#3b82f6" strokeWidth="12"
                            strokeDasharray={`${premiumDash} ${donutCircumference}`}
                            strokeDashoffset={-(basicDash + standardDash)}
                            strokeLinecap="round"
                          />
                        )}
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
                          {totalBranchesWithPlan}
                        </span>
                        <span style={{ fontSize: '0.6rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '800', letterSpacing: '0.5px' }}>
                          Branches
                        </span>
                      </div>
                    </div>

                    {/* Donut Chart Legend Panel */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', flex: 1 }}>
                      {/* Basic */}
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '6px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#f59e0b', flexShrink: 0 }} />
                          <span style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--text-main)' }}>Basic Plan</span>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <span style={{ fontSize: '0.85rem', fontWeight: '800', color: 'var(--text-main)', display: 'block' }}>{basicCount}</span>
                          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: '600' }}>{basicPct.toFixed(0)}% ({basicActiveCount} active)</span>
                        </div>
                      </div>

                      {/* Standard */}
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '6px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#10b981', flexShrink: 0 }} />
                          <span style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--text-main)' }}>Standard Plan</span>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <span style={{ fontSize: '0.85rem', fontWeight: '800', color: 'var(--text-main)', display: 'block' }}>{standardCount}</span>
                          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: '600' }}>{standardPct.toFixed(0)}% ({standardActiveCount} active)</span>
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
                          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: '600' }}>{premiumPct.toFixed(0)}% ({premiumActiveCount} active)</span>
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
                    onClick={handleDownloadExcel}
                    className="btn-outline"
                    style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', padding: '6px 12px', cursor: 'pointer' }}
                  >
                    <FileSpreadsheet style={{ width: '14px', height: '14px' }} /> Download Excel Sheet
                  </button>
                </div>

                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ background: 'var(--primary, #f95e10)', borderBottom: '1px solid var(--border-color)', color: '#ffffff' }}>
                      <th style={{ textAlign: 'center', padding: '12px 16px', fontSize: '0.75rem', color: '#ffffff', textTransform: 'uppercase', fontWeight: '800', width: '70px' }}>S.NO</th>
                      <th style={{ textAlign: 'left', padding: '12px 18px', fontSize: '0.75rem',width: "25%", color: '#ffffff', textTransform: 'uppercase', fontWeight: '800' }}>RESTAURANT</th>
                      <th style={{ textAlign: 'left', padding: '12px 18px', fontSize: '0.75rem', color: '#ffffff', textTransform: 'uppercase', fontWeight: '800' }}>ID</th>
                      <th style={{ textAlign: 'left', padding: '12px 18px', fontSize: '0.75rem', color: '#ffffff', textTransform: 'uppercase', fontWeight: '800' }}>LOCATION</th>
                      <th style={{ textAlign: 'center', padding: '12px 18px', fontSize: '0.75rem', color: '#ffffff', textTransform: 'uppercase', fontWeight: '800' }}>STATUS</th>
                      <th style={{ textAlign: 'center', padding: '12px 18px', fontSize: '0.75rem', color: '#ffffff', textTransform: 'uppercase', fontWeight: '800' }}>PLAN</th>
                    </tr>
                  </thead>
                  <tbody>
                    {restaurants.map((rest, i) => {
                      const salesRatio = i === 0 ? 0.35 : i === 1 ? 0.25 : i === 2 ? 0.20 : i === 3 ? 0.12 : 0.08
                      const earnings = Math.round(totalRevenue * salesRatio)
                      const score = i === 0 ? '98/100' : i === 1 ? '92/100' : i === 2 ? '86/100' : i === 3 ? '78/100' : '72/100'
                      const rankIcon = i === 0 ? <Award style={{ width: '16px', height: '16px', color: '#7c3aed' }} /> : i === 1 ? <Award style={{ width: '16px', height: '16px', color: '#3b82f6' }} /> : i === 2 ? <Award style={{ width: '16px', height: '16px', color: '#10b981' }} /> : <Star style={{ width: '14px', height: '14px', color: '#f59e0b' }} />

                      return (
                        <tr key={rest.id} style={{ borderBottom: '1px solid var(--border-color)', transition: 'background-color 0.2s' }}>
                          <td style={{ padding: '14px 16px', textAlign: 'center', verticalAlign: 'middle', fontSize: '0.85rem', fontWeight: '800', color: 'var(--text-muted)' }}>{i + 1}</td>
                          <td style={{ padding: '14px 18px', textAlign: 'left', verticalAlign: 'middle', fontSize: '0.85rem', fontWeight: '800', color: 'var(--text-main)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                              <img src={rest.logo || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=60&auto=format&fit=crop&q=60'} alt={rest.name} style={{ width: '30px', height: '30px', borderRadius: '6px', objectFit: 'cover', border: '1px solid var(--border-color)' }} />
                              <span>{rest.name}</span>
                            </div>
                          </td>
                          <td style={{ padding: '14px 18px', textAlign: 'left', verticalAlign: 'middle', fontSize: '0.8rem', color: 'var(--text-muted)', fontFamily: 'monospace', fontWeight: '700' }}>{rest.id}</td>
                          <td style={{ padding: '14px 18px', textAlign: 'left', verticalAlign: 'middle', fontSize: '0.8rem', color: 'var(--text-main)', fontWeight: '600' }}>{rest.city || 'Chennai'}</td>
                          <td style={{ padding: '14px 18px', textAlign: 'center', verticalAlign: 'middle' }}>
                            <span style={{
                              display: 'inline-block',
                              fontSize: '0.65rem',
                              fontWeight: '800',
                              padding: '4px 10px',
                              borderRadius: '4px',
                              background: rest.status === 'Active' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                              color: rest.status === 'Active' ? '#10b981' : '#ef4444'
                            }}>
                              {rest.status ? rest.status.toUpperCase() : 'ACTIVE'}
                            </span>
                          </td>
                          <td style={{ padding: '14px 18px', textAlign: 'center', verticalAlign: 'middle' }}>
                            <span style={{
                              display: 'inline-block',
                              fontSize: '0.75rem',
                              fontWeight: '800',
                              padding: '4px 12px',
                              borderRadius: '6px',
                              background: rest.subscriptionPlan?.includes('Enterprise') ? 'rgba(124, 58, 237, 0.1)' : rest.subscriptionPlan?.includes('Premium') ? 'rgba(59, 130, 246, 0.1)' : 'rgba(16, 185, 129, 0.1)',
                              color: rest.subscriptionPlan?.includes('Enterprise') ? '#7c3aed' : rest.subscriptionPlan?.includes('Premium') ? '#3b82f6' : '#10b981'
                            }}>
                              {rest.subscriptionPlan ? rest.subscriptionPlan.replace(' Plan', '') : 'Standard'}
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
      {/* Delete Confirmation Modal Overlay */}
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
            zIndex: 1200,
            padding: '20px'
          }}
          onClick={() => setConfirmModal(null)}
        >
          <div
            className="animate-fade-in"
            style={{
              background: '#ffffff',
              borderRadius: '24px',
              padding: '36px 32px 28px',
              width: '90%',
              maxWidth: '420px',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              textAlign: 'center'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Top Soft Red Circular Icon Container */}
            <div style={{
              width: '60px',
              height: '60px',
              borderRadius: '50%',
              background: '#fee2e2',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '20px'
            }}>
              <Trash2 style={{ width: '28px', height: '28px', color: '#ef4444' }} />
            </div>

            {/* Title */}
            <h3 style={{ margin: '0 0 10px', fontSize: '1.25rem', fontWeight: '800', color: '#0f172a' }}>
              {confirmModal.title}
            </h3>

            {/* Subtitle Message */}
            <p style={{ margin: '0 0 28px', fontSize: '0.9rem', color: '#64748b', lineHeight: '1.5', maxWidth: '340px' }}>
              {confirmModal.message}
            </p>

            {/* Action Buttons */}
            <div style={{ display: 'flex', gap: '14px', width: '100%' }}>
              <button
                type="button"
                onClick={() => setConfirmModal(null)}
                style={{
                  flex: 1,
                  padding: '12px 20px',
                  borderRadius: '12px',
                  border: '1.5px solid #cbd5e1',
                  background: '#ffffff',
                  color: '#334155',
                  fontWeight: '700',
                  fontSize: '0.9rem',
                  cursor: 'pointer',
                  transition: 'all 0.15s'
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  if (confirmModal.onConfirm) confirmModal.onConfirm();
                  setConfirmModal(null);
                }}
                style={{
                  flex: 1,
                  padding: '12px 20px',
                  borderRadius: '12px',
                  border: 'none',
                  background: confirmModal.confirmColor || '#dc2626',
                  color: '#ffffff',
                  fontWeight: '700',
                  fontSize: '0.9rem',
                  cursor: 'pointer',
                  boxShadow: '0 4px 12px rgba(220, 38, 38, 0.25)',
                  transition: 'all 0.15s'
                }}
              >
                {confirmModal.confirmText || 'Delete'}
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

      {/* Plan Details Modal Overlay */}
      {selectedDashboardPlan && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            background: 'rgba(9, 13, 22, 0.5)',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 1100,
            padding: '20px'
          }}
          onClick={() => setSelectedDashboardPlan(null)}
        >
          <div
            className="animate-fade-in"
            style={{
              background: '#ffffff',
              borderRadius: '20px',
              padding: '28px',
              width: '95%',
              maxWidth: '480px',
              boxShadow: '0 20px 60px rgba(0,0,0,0.18)',
              position: 'relative',
              textAlign: 'left'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px', borderBottom: '1px solid var(--border-color)', paddingBottom: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '10px',
                  background: selectedDashboardPlan.name?.toLowerCase().includes('premium') ? 'rgba(59, 130, 246, 0.1)' : selectedDashboardPlan.name?.toLowerCase().includes('standard') ? 'rgba(16, 185, 129, 0.1)' : 'rgba(245, 158, 11, 0.1)',
                  color: selectedDashboardPlan.name?.toLowerCase().includes('premium') ? '#3b82f6' : selectedDashboardPlan.name?.toLowerCase().includes('standard') ? '#10b981' : '#f59e0b',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <Award style={{ width: '22px', height: '22px' }} />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: '900', color: 'var(--text-main)' }}>
                    {selectedDashboardPlan.name || selectedDashboardPlan.planName}
                  </h3>
                  <span style={{
                    fontSize: '0.68rem',
                    fontWeight: '800',
                    padding: '2px 8px',
                    borderRadius: '4px',
                    background: selectedDashboardPlan.status === 'Active' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                    color: selectedDashboardPlan.status === 'Active' ? '#10b981' : '#ef4444',
                    display: 'inline-block',
                    marginTop: '4px'
                  }}>
                    {selectedDashboardPlan.status || 'Active'}
                  </span>
                </div>
              </div>
              <button
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '4px' }}
                onClick={() => setSelectedDashboardPlan(null)}
              >
                <X style={{ width: '18px', height: '18px' }} />
              </button>
            </div>

            {/* Description */}
            {selectedDashboardPlan.description && (
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: '0 0 16px 0', lineHeight: 1.5 }}>
                {selectedDashboardPlan.description}
              </p>
            )}

            {/* Pricing & Usage Stats Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '16px' }}>
              <div style={{ background: 'var(--bg-app)', padding: '12px', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
                <span style={{ fontSize: '0.68rem', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block' }}>Monthly Rate</span>
                <span style={{ fontSize: '1.1rem', fontWeight: '900', color: 'var(--text-main)', marginTop: '2px', display: 'block' }}>
                  ₹{(selectedDashboardPlan.monthlyPrice || 0).toLocaleString('en-IN')}<span style={{ fontSize: '0.7rem', fontWeight: '600', color: 'var(--text-muted)' }}> / mo</span>
                </span>
              </div>
              <div style={{ background: 'var(--bg-app)', padding: '12px', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
                <span style={{ fontSize: '0.68rem', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block' }}>Annual Rate</span>
                <span style={{ fontSize: '1.1rem', fontWeight: '900', color: 'var(--text-main)', marginTop: '2px', display: 'block' }}>
                  ₹{(selectedDashboardPlan.annualPrice || 0).toLocaleString('en-IN')}<span style={{ fontSize: '0.7rem', fontWeight: '600', color: 'var(--text-muted)' }}> / yr</span>
                </span>
              </div>
            </div>

            {/* Plan Limits */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '16px', background: 'var(--bg-app)', padding: '14px', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
                <span style={{ color: 'var(--text-muted)', fontWeight: '600' }}>Active Subscribers</span>
                <span style={{ color: '#10b981', fontWeight: '800' }}>{selectedDashboardPlan.activeCount || 0} active ({selectedDashboardPlan.totalCount || 0} total)</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
                <span style={{ color: 'var(--text-muted)', fontWeight: '600' }}>Branch Limit</span>
                <span style={{ color: 'var(--text-main)', fontWeight: '800' }}>{selectedDashboardPlan.branchLimit || 1} Branches</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
                <span style={{ color: 'var(--text-muted)', fontWeight: '600' }}>User / Staff Limit</span>
                <span style={{ color: 'var(--text-main)', fontWeight: '800' }}>{selectedDashboardPlan.userLimit || 'Unlimited'} Users</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
                <span style={{ color: 'var(--text-muted)', fontWeight: '600' }}>Monthly Order Limit</span>
                <span style={{ color: 'var(--text-main)', fontWeight: '800' }}>{selectedDashboardPlan.orderLimit ? selectedDashboardPlan.orderLimit.toLocaleString() : 'Unlimited'} Orders</span>
              </div>
            </div>

            {/* Features Included */}
            {selectedDashboardPlan.features && selectedDashboardPlan.features.length > 0 && (
              <div style={{ marginBottom: '20px' }}>
                <span style={{ fontSize: '0.72rem', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block', marginBottom: '8px' }}>
                  Features Included
                </span>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {selectedDashboardPlan.features.map((feat, i) => (
                    <span
                      key={i}
                      style={{
                        fontSize: '0.72rem',
                        fontWeight: '700',
                        padding: '4px 10px',
                        borderRadius: '6px',
                        background: 'rgba(249, 94, 16, 0.08)',
                        color: 'var(--primary, #f95e10)',
                        border: '1px solid rgba(249, 94, 16, 0.2)'
                      }}
                    >
                      ✓ {feat}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Modal Actions */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-color)', paddingTop: '16px' }}>
              <button
                type="button"
                className="btn-outline"
                onClick={() => {
                  setSelectedDashboardPlan(null);
                  navigate('/super-admin/subscriptions');
                }}
                style={{
                  padding: '8px 14px',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: '600',
                  fontSize: '0.78rem',
                  border: '1px solid var(--border-color)',
                  background: 'transparent',
                  color: 'var(--text-main)'
                }}
              >
                View Subscriptions
              </button>
              <button
                type="button"
                className="btn-black"
                style={{
                  padding: '8px 20px',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: '700',
                  fontSize: '0.8rem',
                  background: '#000000',
                  color: '#ffffff',
                  border: 'none'
                }}
                onClick={() => setSelectedDashboardPlan(null)}
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
