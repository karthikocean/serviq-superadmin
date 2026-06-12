import React, { useState } from 'react'
import {
  TrendingUp,
  Download,
  Calendar,
  Filter,
  DollarSign,
  Layers,
  Building,
  QrCode,
  FileSpreadsheet,
  FileText,
  Search,
  ChevronDown
} from 'lucide-react'

export default function ReportsAnalytics({ restaurants = [], showToast }) {
  const [activeReportTab, setActiveReportTab] = useState('revenue')
  const [selectedMonth, setSelectedMonth] = useState('All')
  const [selectedPlan, setSelectedPlan] = useState('All')
  const [searchQuery, setSearchQuery] = useState('')
  const [isExporting, setIsExporting] = useState(false)

  // Mock Data
  const monthlyRevenue = [
    { month: 'Jan', revenue: 120000, planStandard: 50000, planPremium: 70000 },
    { month: 'Feb', revenue: 145000, planStandard: 60000, planPremium: 85000 },
    { month: 'Mar', revenue: 160000, planStandard: 70000, planPremium: 90000 },
    { month: 'Apr', revenue: 195000, planStandard: 80000, planPremium: 115000 },
    { month: 'May', revenue: 230000, planStandard: 95000, planPremium: 135000 },
    { month: 'Jun', revenue: 275000, planStandard: 115000, planPremium: 160000 }
  ]

  const planBreakdown = [
    { plan: 'Standard Plan', active: 14, price: 1999, total: 27986 },
    { plan: 'Premium Plan', active: 22, price: 4999, total: 109978 }
  ]

  const subscriptionsList = [
    { id: 'SUB-001', name: 'Spice Garden Bistro', plan: 'Premium Plan', status: 'Active', startDate: '2026-01-15', expiryDate: '2026-07-15' },
    { id: 'SUB-002', name: 'Urban Tiffin House', plan: 'Standard Plan', status: 'Active', startDate: '2026-02-10', expiryDate: '2026-08-10' },
    { id: 'SUB-003', name: 'Blue Plate Cafe', plan: 'Premium Plan', status: 'Active', startDate: '2025-12-05', expiryDate: '2026-12-05' },
    { id: 'SUB-004', name: 'Noodle Express', plan: 'Standard Plan', status: 'Expired', startDate: '2025-05-10', expiryDate: '2026-05-10' },
    { id: 'SUB-005', name: 'The Burger Joint', plan: 'Premium Plan', status: 'Expired', startDate: '2025-06-01', expiryDate: '2026-06-01' },
    { id: 'SUB-006', name: 'Royal Tandoor', plan: 'Premium Plan', status: 'Active', startDate: '2026-04-20', expiryDate: '2026-10-20' }
  ]

  const restaurantsList = [
    { id: 'R-01', name: 'Spice Garden Bistro', status: 'Active', city: 'Mumbai', orders: 450, scans: 1850 },
    { id: 'R-02', name: 'Urban Tiffin House', status: 'Active', city: 'Bangalore', orders: 320, scans: 1400 },
    { id: 'R-03', name: 'Blue Plate Cafe', status: 'Active', city: 'Delhi', orders: 580, scans: 2500 },
    { id: 'R-04', name: 'Noodle Express', status: 'Inactive', city: 'Mumbai', orders: 120, scans: 450 },
    { id: 'R-05', name: 'The Burger Joint', status: 'Inactive', city: 'Chennai', orders: 85, scans: 310 },
    { id: 'R-06', name: 'Royal Tandoor', status: 'Active', city: 'Hyderabad', orders: 290, scans: 1150 }
  ]

  const handleExport = (format) => {
    setIsExporting(true)
    showToast('info', `Generating ${format.toUpperCase()} export payload...`)
    setTimeout(() => {
      setIsExporting(false)
      showToast('success', `Export completed! ${activeReportTab}_report.${format} downloaded successfully.`)
    }, 1200)
  }

  // Derived variables
  const totalRevenue = monthlyRevenue.reduce((sum, item) => sum + item.revenue, 0)
  const totalScans = restaurantsList.reduce((sum, item) => sum + item.scans, 0)
  const totalOrders = restaurantsList.reduce((sum, item) => sum + item.orders, 0)

  // Filters application
  const filteredSubs = subscriptionsList.filter(s => {
    const matchesSearch = s.name.toLowerCase().includes(searchQuery.toLowerCase()) || s.id.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesPlan = selectedPlan === 'All' || s.plan.includes(selectedPlan)
    return matchesSearch && matchesPlan
  })

  const filteredRest = restaurantsList.filter(r => {
    const matchesSearch = r.name.toLowerCase().includes(searchQuery.toLowerCase()) || r.city.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesSearch
  })

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px', width: '100%', boxSizing: 'border-box' }}>
      
      {/* High-Level KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
        {[
          { label: 'Cumulative Revenue', value: `₹${totalRevenue.toLocaleString()}`, change: '+24.5%', isUp: true, icon: <DollarSign />, grad: 'linear-gradient(135deg, rgba(16, 185, 129, 0.04), rgba(16, 185, 129, 0.08))', border: 'rgba(16, 185, 129, 0.12)', color: '#10b981' },
          { label: 'Active Subscriptions', value: subscriptionsList.filter(s => s.status === 'Active').length, change: '+12.3%', isUp: true, icon: <Layers />, grad: 'linear-gradient(135deg, rgba(59, 130, 246, 0.04), rgba(59, 130, 246, 0.08))', border: 'rgba(59, 130, 246, 0.12)', color: '#3b82f6' },
          { label: 'Franchise Footprint', value: `${restaurantsList.filter(r => r.status === 'Active').length} Active`, change: '6 In Total', isUp: true, icon: <Building />, grad: 'linear-gradient(135deg, rgba(249, 115, 22, 0.04), rgba(249, 115, 22, 0.08))', border: 'rgba(249, 115, 22, 0.12)', color: '#f97316' },
          { label: 'Network Operations', value: `${totalOrders.toLocaleString()} Orders`, change: `${totalScans.toLocaleString()} Scans`, isUp: true, icon: <QrCode />, grad: 'linear-gradient(135deg, rgba(99, 102, 241, 0.04), rgba(99, 102, 241, 0.08))', border: 'rgba(99, 102, 241, 0.12)', color: '#6366f1' }
        ].map((kpi, idx) => (
          <div key={idx} className="glass-card" style={{
            padding: '20px',
            background: 'var(--bg-card)',
            border: `1px solid ${kpi.border}`,
            borderRadius: '12px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <div>
              <span style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{kpi.label}</span>
              <h3 style={{ margin: '8px 0 4px 0', fontSize: '1.6rem', fontWeight: '900', color: 'var(--text-main)', lineHeight: 1 }}>{kpi.value}</h3>
              <span style={{ fontSize: '0.7rem', color: kpi.isUp ? '#10b981' : '#ef4444', fontWeight: '700' }}>{kpi.change}</span>
            </div>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              background: kpi.grad,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: kpi.color
            }}>
              {kpi.icon}
            </div>
          </div>
        ))}
      </div>

      {/* Navigation Sub-Tabs & Export Controls */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        
        {/* Report Type Subtabs */}
        <div style={{ display: 'flex', background: 'var(--bg-app)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '4px' }}>
          {[
            { id: 'revenue', label: 'Revenue Report' },
            { id: 'subscriptions', label: 'Subscriptions' },
            { id: 'restaurants', label: 'Restaurants' },
            { id: 'usage', label: 'Network Usage' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveReportTab(tab.id)
                setSearchQuery('')
              }}
              style={{
                padding: '8px 16px',
                borderRadius: '8px',
                border: 'none',
                background: activeReportTab === tab.id ? 'var(--bg-card)' : 'transparent',
                color: activeReportTab === tab.id ? 'var(--text-main)' : 'var(--text-muted)',
                fontWeight: activeReportTab === tab.id ? '800' : '600',
                fontSize: '0.8rem',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                boxShadow: activeReportTab === tab.id ? 'var(--shadow-sm)' : 'none'
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Global Export Options */}
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={() => handleExport('csv')}
            disabled={isExporting}
            className="btn-outline"
            style={{
              padding: '9px 14px',
              fontSize: '0.78rem',
              borderRadius: '10px',
              fontWeight: '700',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              cursor: 'pointer'
            }}
          >
            <FileSpreadsheet style={{ width: '15px', height: '15px', color: '#10b981' }} /> Export CSV
          </button>
          <button
            onClick={() => handleExport('pdf')}
            disabled={isExporting}
            className="btn-black"
            style={{
              padding: '9px 14px',
              fontSize: '0.78rem',
              borderRadius: '10px',
              fontWeight: '700',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              cursor: 'pointer',
              background: '#000000',
              color: '#ffffff',
              border: 'none'
            }}
          >
            <FileText style={{ width: '15px', height: '15px', color: '#ef4444' }} /> Download PDF
          </button>
        </div>
      </div>

      {/* TAB 1: REVENUE REPORT */}
      {activeReportTab === 'revenue' && (
        <div style={{ display: 'grid', gridTemplateColumns: '3fr 2fr', gap: '20px' }}>
          
          {/* Revenue Chart Panel */}
          <div className="glass-card" style={{ padding: '24px', background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '16px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: '800', color: 'var(--text-main)' }}>Monthly Revenue Growth</h4>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Aggregated subscription billings (Jan - Jun 2026)</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.72rem', color: '#10b981', fontWeight: '700' }}>
                <TrendingUp style={{ width: '14px', height: '14px' }} /> +129% Growth YTD
              </div>
            </div>

            {/* Custom SVG Line Chart */}
            <div style={{ width: '100%', height: '220px', position: 'relative', marginTop: '10px' }}>
              <svg viewBox="0 0 500 200" style={{ width: '100%', height: '100%', overflow: 'visible' }}>
                {/* Grid Lines */}
                <line x1="40" y1="20" x2="480" y2="20" stroke="var(--border-color)" strokeWidth="1" strokeDasharray="3" />
                <line x1="40" y1="70" x2="480" y2="70" stroke="var(--border-color)" strokeWidth="1" strokeDasharray="3" />
                <line x1="40" y1="120" x2="480" y2="120" stroke="var(--border-color)" strokeWidth="1" strokeDasharray="3" />
                <line x1="40" y1="170" x2="480" y2="170" stroke="var(--border-color)" strokeWidth="1" strokeDasharray="3" />

                {/* Area Gradient */}
                <defs>
                  <linearGradient id="area-grad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.25" />
                    <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.0" />
                  </linearGradient>
                </defs>

                {/* Area Path (Jan: 120k -> Jun: 275k) */}
                <path
                  d="M 40 170 L 40 130 L 128 115 L 216 106 L 304 85 L 392 65 L 480 38 L 480 170 Z"
                  fill="url(#area-grad)"
                />

                {/* Line Path */}
                <path
                  d="M 40 130 L 128 115 L 216 106 L 304 85 L 392 65 L 480 38"
                  fill="none"
                  stroke="#3b82f6"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />

                {/* Data Points */}
                <circle cx="40" cy="130" r="5" fill="#3b82f6" stroke="var(--bg-card)" strokeWidth="2" />
                <circle cx="128" cy="115" r="5" fill="#3b82f6" stroke="var(--bg-card)" strokeWidth="2" />
                <circle cx="216" cy="106" r="5" fill="#3b82f6" stroke="var(--bg-card)" strokeWidth="2" />
                <circle cx="304" cy="85" r="5" fill="#3b82f6" stroke="var(--bg-card)" strokeWidth="2" />
                <circle cx="392" cy="65" r="5" fill="#3b82f6" stroke="var(--bg-card)" strokeWidth="2" />
                <circle cx="480" cy="38" r="5" fill="#3b82f6" stroke="var(--bg-card)" strokeWidth="2" />

                {/* Labels */}
                <text x="40" y="190" fontSize="10" fontWeight="700" fill="var(--text-muted)" textAnchor="middle">Jan</text>
                <text x="128" y="190" fontSize="10" fontWeight="700" fill="var(--text-muted)" textAnchor="middle">Feb</text>
                <text x="216" y="190" fontSize="10" fontWeight="700" fill="var(--text-muted)" textAnchor="middle">Mar</text>
                <text x="304" y="190" fontSize="10" fontWeight="700" fill="var(--text-muted)" textAnchor="middle">Apr</text>
                <text x="392" y="190" fontSize="10" fontWeight="700" fill="var(--text-muted)" textAnchor="middle">May</text>
                <text x="480" y="190" fontSize="10" fontWeight="700" fill="var(--text-muted)" textAnchor="middle">Jun</text>

                <text x="30" y="133" fontSize="9" fontWeight="800" fill="var(--text-muted)" textAnchor="end">120K</text>
                <text x="30" y="73" fontSize="9" fontWeight="800" fill="var(--text-muted)" textAnchor="end">200K</text>
                <text x="30" y="41" fontSize="9" fontWeight="800" fill="var(--text-muted)" textAnchor="end">275K</text>
              </svg>
            </div>
          </div>

          {/* Plan Breakdown Panel */}
          <div className="glass-card" style={{ padding: '24px', background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '16px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: '800', color: 'var(--text-main)' }}>Revenue by Subscription Plan</h4>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Financial share breakdown per tariff tier</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginTop: '10px' }}>
              {planBreakdown.map((item, idx) => {
                const totalTarget = planBreakdown.reduce((sum, p) => sum + p.total, 0)
                const percentage = Math.round((item.total / totalTarget) * 100)
                const fillBarColor = item.plan.includes('Premium') ? '#3b82f6' : '#10b981'
                return (
                  <div key={idx} style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', fontWeight: '700' }}>
                      <span style={{ color: 'var(--text-main)' }}>{item.plan} ({item.active} active)</span>
                      <span style={{ color: 'var(--text-muted)' }}>₹{item.total.toLocaleString()} ({percentage}%)</span>
                    </div>
                    <div style={{ width: '100%', height: '8px', background: 'var(--bg-app)', borderRadius: '4px', overflow: 'hidden' }}>
                      <div style={{ width: `${percentage}%`, height: '100%', background: fillBarColor, borderRadius: '4px' }}></div>
                    </div>
                  </div>
                )
              })}
            </div>

            <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '14px', marginTop: 'auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <div style={{ textAlign: 'center' }}>
                <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontWeight: '700' }}>AVG BILLING RATE</span>
                <h5 style={{ margin: '4px 0 0 0', fontSize: '1.15rem', color: 'var(--text-main)', fontWeight: '800' }}>₹4,950/mo</h5>
              </div>
              <div style={{ textAlign: 'center' }}>
                <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontWeight: '700' }}>TOTAL ARR ESTIMATE</span>
                <h5 style={{ margin: '4px 0 0 0', fontSize: '1.15rem', color: 'var(--text-main)', fontWeight: '800' }}>₹26.1 Lakhs</h5>
              </div>
            </div>
          </div>

        </div>
      )}

      {/* TAB 2: SUBSCRIPTIONS REPORT */}
      {activeReportTab === 'subscriptions' && (
        <div className="glass-card" style={{ padding: '24px', background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '16px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* Header Controls */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px' }}>
            <div>
              <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: '800', color: 'var(--text-main)' }}>Subscription Ledger</h4>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Register of franchise plans status, start date, and expiries</span>
            </div>
            
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              <div style={{ position: 'relative' }}>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search restaurant name..."
                  style={{ padding: '8px 10px 8px 30px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-app)', color: 'var(--text-main)', fontSize: '0.78rem', outline: 'none' }}
                />
                <Search style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', width: '13px', height: '13px', color: 'var(--text-muted)' }} />
              </div>

              <select
                value={selectedPlan}
                onChange={(e) => setSelectedPlan(e.target.value)}
                style={{ padding: '8px 10px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-app)', color: 'var(--text-main)', fontSize: '0.78rem', cursor: 'pointer' }}
              >
                <option value="All">All Plans</option>
                <option value="Standard">Standard</option>
                <option value="Premium">Premium</option>
              </select>
            </div>
          </div>

          {/* Table */}
          <div style={{ overflowX: 'auto', background: 'var(--bg-app)', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
            <table className="menu-data-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: 'rgba(255,255,255,0.02)' }}>
                  <th style={{ textAlign: 'left', padding: '12px 18px', fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '800' }}>ID</th>
                  <th style={{ textAlign: 'left', padding: '12px 18px', fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '800' }}>Restaurant Branch</th>
                  <th style={{ textAlign: 'left', padding: '12px 18px', fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '800' }}>Tier</th>
                  <th style={{ textAlign: 'left', padding: '12px 18px', fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '800' }}>Assigned Date</th>
                  <th style={{ textAlign: 'left', padding: '12px 18px', fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '800' }}>Expiry Date</th>
                  <th style={{ textAlign: 'center', padding: '12px 18px', fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '800', width: '110px' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredSubs.length > 0 ? (
                  filteredSubs.map(sub => (
                    <tr key={sub.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                      <td style={{ padding: '14px 18px', fontSize: '0.8rem', color: 'var(--text-main)', fontWeight: '800' }}>{sub.id}</td>
                      <td style={{ padding: '14px 18px', fontSize: '0.82rem', color: 'var(--text-main)', fontWeight: '700' }}>{sub.name}</td>
                      <td style={{ padding: '14px 18px' }}>
                        <span style={{
                          fontSize: '0.68rem',
                          fontWeight: '800',
                          padding: '3px 8px',
                          borderRadius: '6px',
                          background: sub.plan.includes('Premium') ? 'rgba(59, 130, 246, 0.08)' : 'rgba(16, 185, 129, 0.08)',
                          color: sub.plan.includes('Premium') ? '#3b82f6' : '#10b981'
                        }}>{sub.plan}</span>
                      </td>
                      <td style={{ padding: '14px 18px', fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: '600' }}>{sub.startDate}</td>
                      <td style={{ padding: '14px 18px', fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: '600' }}>{sub.expiryDate}</td>
                      <td style={{ padding: '14px 18px', textAlign: 'center' }}>
                        <span style={{
                          fontSize: '0.68rem',
                          fontWeight: '800',
                          padding: '3px 8px',
                          borderRadius: '6px',
                          background: sub.status === 'Active' ? 'rgba(16, 185, 129, 0.08)' : 'rgba(239, 68, 68, 0.08)',
                          color: sub.status === 'Active' ? '#10b981' : '#ef4444'
                        }}>{sub.status}</span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" style={{ padding: '40px 18px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>No subscriptions match search parameters.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: RESTAURANTS REPORT */}
      {activeReportTab === 'restaurants' && (
        <div className="glass-card" style={{ padding: '24px', background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '16px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px' }}>
            <div>
              <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: '800', color: 'var(--text-main)' }}>Franchise Audit Register</h4>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Overview of branch geographic spreads and overall business statuses</span>
            </div>
            
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search name or location..."
                style={{ padding: '8px 10px 8px 30px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-app)', color: 'var(--text-main)', fontSize: '0.78rem', outline: 'none' }}
              />
              <Search style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', width: '13px', height: '13px', color: 'var(--text-muted)' }} />
            </div>
          </div>

          <div style={{ overflowX: 'auto', background: 'var(--bg-app)', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
            <table className="menu-data-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: 'rgba(255,255,255,0.02)' }}>
                  <th style={{ textAlign: 'left', padding: '12px 18px', fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '800' }}>Code</th>
                  <th style={{ textAlign: 'left', padding: '12px 18px', fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '800' }}>Branch Name</th>
                  <th style={{ textAlign: 'left', padding: '12px 18px', fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '800' }}>City Location</th>
                  <th style={{ textAlign: 'center', padding: '12px 18px', fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '800' }}>Processed Orders</th>
                  <th style={{ textAlign: 'center', padding: '12px 18px', fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '800' }}>Active QR Scans</th>
                  <th style={{ textAlign: 'center', padding: '12px 18px', fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '800', width: '110px' }}>Franchise status</th>
                </tr>
              </thead>
              <tbody>
                {filteredRest.length > 0 ? (
                  filteredRest.map(rest => (
                    <tr key={rest.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                      <td style={{ padding: '14px 18px', fontSize: '0.8rem', color: 'var(--text-main)', fontWeight: '800' }}>{rest.id}</td>
                      <td style={{ padding: '14px 18px', fontSize: '0.82rem', color: 'var(--text-main)', fontWeight: '700' }}>{rest.name}</td>
                      <td style={{ padding: '14px 18px', fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: '600' }}>{rest.city}</td>
                      <td style={{ padding: '14px 18px', textAlign: 'center', fontSize: '0.8rem', color: 'var(--text-main)', fontWeight: '700' }}>{rest.orders}</td>
                      <td style={{ padding: '14px 18px', textAlign: 'center', fontSize: '0.8rem', color: 'var(--text-main)', fontWeight: '700' }}>{rest.scans}</td>
                      <td style={{ padding: '14px 18px', textAlign: 'center' }}>
                        <span style={{
                          fontSize: '0.68rem',
                          fontWeight: '800',
                          padding: '3px 8px',
                          borderRadius: '6px',
                          background: rest.status === 'Active' ? 'rgba(16, 185, 129, 0.08)' : 'rgba(239, 68, 68, 0.08)',
                          color: rest.status === 'Active' ? '#10b981' : '#ef4444'
                        }}>{rest.status}</span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" style={{ padding: '40px 18px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>No restaurant entries recorded.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: USAGE REPORT */}
      {activeReportTab === 'usage' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
          
          {/* QR Scans Traffic */}
          <div className="glass-card" style={{ padding: '24px', background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '16px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: '800', color: 'var(--text-main)' }}>QR Scan Hits Network Traffic</h4>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Scan operations distribution by active restaurant branch</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '10px' }}>
              {restaurantsList.map((rest, idx) => {
                const totalTarget = restaurantsList.reduce((sum, r) => sum + r.scans, 0)
                const percentage = Math.round((rest.scans / totalTarget) * 100)
                return (
                  <div key={idx} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', fontWeight: '700' }}>
                      <span style={{ color: 'var(--text-main)' }}>{rest.name}</span>
                      <span style={{ color: 'var(--text-muted)' }}>{rest.scans.toLocaleString()} scans ({percentage}%)</span>
                    </div>
                    <div style={{ width: '100%', height: '6px', background: 'var(--bg-app)', borderRadius: '3px', overflow: 'hidden' }}>
                      <div style={{ width: `${percentage}%`, height: '100%', background: '#6366f1', borderRadius: '3px' }}></div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Orders Processed Traffic */}
          <div className="glass-card" style={{ padding: '24px', background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '16px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: '800', color: 'var(--text-main)' }}>Simulated Orders Settled</h4>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Total order flow volume processed across restaurant branches</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '10px' }}>
              {restaurantsList.map((rest, idx) => {
                const totalTarget = restaurantsList.reduce((sum, r) => sum + r.orders, 0)
                const percentage = Math.round((rest.orders / totalTarget) * 100)
                return (
                  <div key={idx} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', fontWeight: '700' }}>
                      <span style={{ color: 'var(--text-main)' }}>{rest.name}</span>
                      <span style={{ color: 'var(--text-muted)' }}>{rest.orders.toLocaleString()} orders ({percentage}%)</span>
                    </div>
                    <div style={{ width: '100%', height: '6px', background: 'var(--bg-app)', borderRadius: '3px', overflow: 'hidden' }}>
                      <div style={{ width: `${percentage}%`, height: '100%', background: '#f97316', borderRadius: '3px' }}></div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

        </div>
      )}

    </div>
  )
}
