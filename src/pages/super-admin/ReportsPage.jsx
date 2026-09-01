import React, { useState, useEffect } from 'react'
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
  RefreshCw,
  TrendingDown
} from 'lucide-react'

import { useRestaurant } from '../../hooks/useRestaurants'
import { useSubscriptions } from '../../hooks/useSubscriptions'
import { useNotification } from '../../contexts/NotificationContext'
import { useAuth } from '../../contexts/AuthContext'
import CustomSelect from '../../components/common/CustomSelect'
import { getReportsAnalyticsApi } from '../../services/dashboardService'

export default function ReportsPage() {
  const { restaurants } = useRestaurant()
  const { subscriptions, fetchSubscriptions } = useSubscriptions()
  const { showToast } = useNotification()
  const { hasPermission, isSuperOwner } = useAuth()

  const canView = isSuperOwner || hasPermission('reports', 'view')

  const [activeReportTab, setActiveReportTab] = useState('revenue')
  const [selectedPlan, setSelectedPlan] = useState('All')
  const [searchQuery, setSearchQuery] = useState('')
  const [isExporting, setIsExporting] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [reportsData, setReportsData] = useState(null)
  const [hoveredPoint, setHoveredPoint] = useState(null)

  const fetchAnalytics = async () => {
    setIsLoading(true)
    try {
      const res = await getReportsAnalyticsApi()
      if (res && res.success && res.data) {
        setReportsData(res.data)
      }
    } catch (err) {
      console.error('Failed to fetch reports analytics:', err)
      showToast('error', 'Failed to load reports analytics.')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchAnalytics()
    fetchSubscriptions()
  }, [])

  // KPI calculations from live API
  const cumulativeRevenue = reportsData?.cumulativeRevenue?.amount ?? 0
  const revenueGrowth = reportsData?.cumulativeRevenue?.growth ?? 0
  const activeSubsCount = reportsData?.activeSubscriptions?.count ?? subscriptions.filter(s => s.status === 'Active').length
  const subsGrowth = reportsData?.activeSubscriptions?.growth ?? 0

  const monthlyRevenueList = reportsData?.monthlyRevenueGrowth || [
    { month: 'Jan', revenue: 0 },
    { month: 'Feb', revenue: 0 },
    { month: 'Mar', revenue: 0 },
    { month: 'Apr', revenue: 0 },
    { month: 'May', revenue: 0 },
    { month: 'Jun', revenue: 0 },
    { month: 'Jul', revenue: 0 },
    { month: 'Aug', revenue: 0 },
    { month: 'Sep', revenue: 0 },
    { month: 'Oct', revenue: 0 },
    { month: 'Nov', revenue: 0 },
    { month: 'Dec', revenue: 0 }
  ]

  const planBreakdown = reportsData?.revenueBySubscriptionPlan || [
    { planName: 'Premium Plan', activeCount: 0, amount: 0, percentage: 0 },
    { planName: 'Standard Plan', activeCount: 0, amount: 0, percentage: 0 },
    { planName: 'Basic Plan', activeCount: 0, amount: 0, percentage: 0 }
  ]

  const avgBillingRate = reportsData?.avgBillingRate ?? 0
  const totalArrEstimate = reportsData?.totalArrEstimate ?? 0

  // Subscriptions ledger list
  const subscriptionsList = subscriptions.length > 0 ? subscriptions.map(s => ({
    id: s.restaurantCode || (s.id ? `SUB-${s.id.slice(-5).toUpperCase()}` : 'SUB-001'),
    name: s.restaurantName || 'Unknown Branch',
    plan: s.planName || 'Standard Plan',
    status: s.status || 'Active',
    startDate: s.startDate || '—',
    expiryDate: s.renewalDate || s.endDate || '—'
  })) : [
    { id: 'SUB-001', name: 'Spice Garden Bistro', plan: 'Premium Plan', status: 'Active', startDate: '2026-01-15', expiryDate: '2026-07-15' },
    { id: 'SUB-002', name: 'Urban Tiffin House', plan: 'Standard Plan', status: 'Active', startDate: '2026-02-10', expiryDate: '2026-08-10' },
    { id: 'SUB-003', name: 'Blue Plate Cafe', plan: 'Premium Plan', status: 'Active', startDate: '2025-12-05', expiryDate: '2026-12-05' },
    { id: 'SUB-004', name: 'Noodle Express', plan: 'Basic Plan', status: 'Active', startDate: '2025-05-10', expiryDate: '2026-05-10' },
    { id: 'SUB-005', name: 'The Burger Joint', plan: 'Basic Plan', status: 'Active', startDate: '2025-06-01', expiryDate: '2026-06-01' }
  ]

  // Filter subscriptions
  const filteredSubs = subscriptionsList.filter(s => {
    const matchesSearch = s.name.toLowerCase().includes(searchQuery.toLowerCase()) || s.id.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesPlan = selectedPlan === 'All' || s.plan.toLowerCase().includes(selectedPlan.toLowerCase())
    return matchesSearch && matchesPlan
  })

  // SVG Chart Calculations
  const maxRevenueVal = Math.max(...monthlyRevenueList.map(d => d.revenue || 0), 1000) * 1.15
  const chartWidth = 500
  const chartHeight = 200
  const paddingLeft = 45
  const paddingRight = 20
  const paddingTop = 25
  const paddingBottom = 30
  const usableWidth = chartWidth - paddingLeft - paddingRight
  const usableHeight = chartHeight - paddingTop - paddingBottom

  const getPointX = (index) => {
    if (monthlyRevenueList.length <= 1) return paddingLeft + usableWidth / 2
    return paddingLeft + index * (usableWidth / (monthlyRevenueList.length - 1))
  }

  const getPointY = (val) => {
    const ratio = Math.max(0, val) / maxRevenueVal
    return chartHeight - paddingBottom - ratio * usableHeight
  }

  const linePathD = monthlyRevenueList.map((item, idx) => {
    const x = getPointX(idx)
    const y = getPointY(item.revenue || 0)
    return `${idx === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`
  }).join(' ')

  const areaPathD = `${linePathD} L ${getPointX(monthlyRevenueList.length - 1).toFixed(1)} ${(chartHeight - paddingBottom).toFixed(1)} L ${getPointX(0).toFixed(1)} ${(chartHeight - paddingBottom).toFixed(1)} Z`

  // Export handlers
  const handleExport = (format) => {
    setIsExporting(true)
    showToast('info', `Preparing ${format.toUpperCase()} export...`)

    try {
      if (format === 'csv') {
        let csvContent = ''
        if (activeReportTab === 'revenue') {
          csvContent = 'data:text/csv;charset=utf-8,Month,Revenue (INR)\n'
          monthlyRevenueList.forEach(m => {
            csvContent += `${m.month},${(m.revenue || 0).toFixed(2)}\n`
          })
          csvContent += `\nCumulative Revenue,${cumulativeRevenue.toFixed(2)}\n`
          csvContent += `Active Subscriptions,${activeSubsCount}\n`
          csvContent += `Average Monthly Billing Rate,${avgBillingRate.toFixed(2)}\n`
          csvContent += `Total ARR Estimate,${totalArrEstimate.toFixed(2)}\n`
        } else {
          csvContent = 'data:text/csv;charset=utf-8,Subscription ID,Restaurant Branch,Plan Tier,Start Date,Expiry Date,Status\n'
          filteredSubs.forEach(s => {
            csvContent += `"${s.id}","${s.name}","${s.plan}","${s.startDate}","${s.expiryDate}","${s.status}"\n`
          })
        }

        const encodedUri = encodeURI(csvContent)
        const link = document.createElement('a')
        link.setAttribute('href', encodedUri)
        link.setAttribute('download', `${activeReportTab}_report_${new Date().toISOString().split('T')[0]}.csv`)
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        showToast('success', `Export completed! ${activeReportTab}_report.csv downloaded.`)
      } else {
        window.print()
        showToast('success', `Print dialog opened for PDF export.`)
      }
    } catch (err) {
      showToast('error', 'Error generating export file.')
    } finally {
      setIsExporting(false)
    }
  }

  const getPlanColor = (planName = '') => {
    const name = planName.toLowerCase()
    if (name.includes('premium')) return '#3b82f6'
    if (name.includes('standard')) return '#10b981'
    if (name.includes('basic')) return '#f59e0b'
    return '#8b5cf6'
  }

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px', width: '100%', boxSizing: 'border-box' }}>
      
      {/* High-Level KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
        {[
          {
            label: 'Cumulative Revenue',
            value: `₹${Math.round(cumulativeRevenue).toLocaleString('en-IN')}`,
            change: `${revenueGrowth >= 0 ? '+' : ''}${revenueGrowth}%`,
            isUp: revenueGrowth >= 0,
            icon: <DollarSign size={20} />,
            grad: 'linear-gradient(135deg, rgba(16, 185, 129, 0.04), rgba(16, 185, 129, 0.08))',
            border: 'rgba(16, 185, 129, 0.15)',
            color: '#10b981'
          },
          {
            label: 'Active Subscriptions',
            value: activeSubsCount,
            change: `${subsGrowth >= 0 ? '+' : ''}${subsGrowth}%`,
            isUp: subsGrowth >= 0,
            icon: <Layers size={20} />,
            grad: 'linear-gradient(135deg, rgba(59, 130, 246, 0.04), rgba(59, 130, 246, 0.08))',
            border: 'rgba(59, 130, 246, 0.15)',
            color: '#3b82f6'
          }
        ].map((kpi, idx) => (
          <div key={idx} className="glass-card" style={{
            padding: '20px 24px',
            background: 'var(--bg-card)',
            border: `1px solid ${kpi.border}`,
            borderRadius: '14px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <div>
              <span style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{kpi.label}</span>
              <h3 style={{ margin: '8px 0 4px 0', fontSize: '1.65rem', fontWeight: '900', color: 'var(--text-main)', lineHeight: 1 }}>
                {isLoading ? '...' : kpi.value}
              </h3>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '4px' }}>
                <span style={{ fontSize: '0.72rem', color: kpi.isUp ? '#10b981' : '#ef4444', fontWeight: '800' }}>
                  {kpi.change}
                </span>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>vs previous period</span>
              </div>
            </div>
            <div style={{
              width: '44px',
              height: '44px',
              borderRadius: '12px',
              background: kpi.grad,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: kpi.color,
              border: `1px solid ${kpi.border}`
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
            { id: 'subscriptions', label: 'Subscriptions' }
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
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <button
            onClick={fetchAnalytics}
            disabled={isLoading}
            className="btn-outline"
            style={{
              padding: '9px 12px',
              fontSize: '0.78rem',
              borderRadius: '10px',
              fontWeight: '700',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              cursor: 'pointer'
            }}
            title="Refresh analytics data"
          >
            <RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} />
          </button>

          {canView && (
            <>
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
            </>
          )}
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
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Aggregated subscription billings across all 12 months</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', color: '#10b981', fontWeight: '800', background: 'rgba(16, 185, 129, 0.08)', padding: '4px 10px', borderRadius: '8px' }}>
                <TrendingUp style={{ width: '14px', height: '14px' }} /> ₹{Math.round(cumulativeRevenue).toLocaleString('en-IN')} Total
              </div>
            </div>

            {/* Custom SVG Line Chart */}
            <div style={{ width: '100%', height: '230px', position: 'relative', marginTop: '10px' }}>
              <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} style={{ width: '100%', height: '100%', overflow: 'visible' }}>
                {/* Horizontal Grid Lines */}
                <line x1={paddingLeft} y1={paddingTop} x2={chartWidth - paddingRight} y2={paddingTop} stroke="var(--border-color)" strokeWidth="1" strokeDasharray="3" opacity="0.6" />
                <line x1={paddingLeft} y1={paddingTop + usableHeight * 0.33} x2={chartWidth - paddingRight} y2={paddingTop + usableHeight * 0.33} stroke="var(--border-color)" strokeWidth="1" strokeDasharray="3" opacity="0.6" />
                <line x1={paddingLeft} y1={paddingTop + usableHeight * 0.66} x2={chartWidth - paddingRight} y2={paddingTop + usableHeight * 0.66} stroke="var(--border-color)" strokeWidth="1" strokeDasharray="3" opacity="0.6" />
                <line x1={paddingLeft} y1={chartHeight - paddingBottom} x2={chartWidth - paddingRight} y2={chartHeight - paddingBottom} stroke="var(--border-color)" strokeWidth="1" opacity="0.8" />

                {/* Y-axis Labels */}
                <text x={paddingLeft - 8} y={paddingTop + 4} fontSize="8.5" fontWeight="700" fill="var(--text-muted)" textAnchor="end">
                  {maxRevenueVal >= 1000 ? `${Math.round(maxRevenueVal / 1000)}K` : Math.round(maxRevenueVal)}
                </text>
                <text x={paddingLeft - 8} y={paddingTop + usableHeight * 0.5 + 4} fontSize="8.5" fontWeight="700" fill="var(--text-muted)" textAnchor="end">
                  {maxRevenueVal >= 1000 ? `${Math.round((maxRevenueVal * 0.5) / 1000)}K` : Math.round(maxRevenueVal * 0.5)}
                </text>
                <text x={paddingLeft - 8} y={chartHeight - paddingBottom + 3} fontSize="8.5" fontWeight="700" fill="var(--text-muted)" textAnchor="end">
                  0
                </text>

                {/* Area Gradient */}
                <defs>
                  <linearGradient id="area-grad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.28" />
                    <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.01" />
                  </linearGradient>
                </defs>

                {/* Shaded Area */}
                <path d={areaPathD} fill="url(#area-grad)" />

                {/* Line Path */}
                <path
                  d={linePathD}
                  fill="none"
                  stroke="#3b82f6"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />

                {/* Data Points and Month Labels */}
                {monthlyRevenueList.map((item, idx) => {
                  const x = getPointX(idx)
                  const y = getPointY(item.revenue || 0)
                  const isHovered = hoveredPoint === idx
                  const hasRevenue = (item.revenue || 0) > 0

                  return (
                    <g key={idx} onMouseEnter={() => setHoveredPoint(idx)} onMouseLeave={() => setHoveredPoint(null)} style={{ cursor: 'pointer' }}>
                      <circle
                        cx={x}
                        cy={y}
                        r={isHovered ? 6.5 : (hasRevenue ? 4.5 : 3)}
                        fill={hasRevenue ? '#3b82f6' : 'var(--bg-card)'}
                        stroke={hasRevenue ? '#ffffff' : 'var(--border-color)'}
                        strokeWidth={hasRevenue ? 2 : 1.5}
                        style={{ transition: 'r 0.15s ease' }}
                      />

                      {/* Tooltip on point hover or for active months */}
                      {(isHovered || (hasRevenue && monthlyRevenueList.filter(m => (m.revenue || 0) > 0).length <= 2)) && (
                        <g>
                          <rect
                            x={x - 30}
                            y={Math.max(5, y - 26)}
                            width="60"
                            height="18"
                            rx="4"
                            fill="#0f172a"
                            opacity="0.9"
                          />
                          <text
                            x={x}
                            y={Math.max(5, y - 26) + 12}
                            fontSize="8"
                            fontWeight="800"
                            fill="#ffffff"
                            textAnchor="middle"
                          >
                            ₹{Math.round(item.revenue || 0).toLocaleString('en-IN')}
                          </text>
                        </g>
                      )}

                      {/* Month Text */}
                      <text
                        x={x}
                        y={chartHeight - 12}
                        fontSize="9"
                        fontWeight={hasRevenue ? '800' : '600'}
                        fill={hasRevenue ? 'var(--text-main)' : 'var(--text-muted)'}
                        textAnchor="middle"
                      >
                        {item.month}
                      </text>
                    </g>
                  )
                })}
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
                const planColor = getPlanColor(item.planName)
                const percentage = item.percentage ?? 0
                const amount = item.amount ?? 0
                const activeCount = item.activeCount ?? 0

                return (
                  <div key={idx} style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', fontWeight: '700' }}>
                      <span style={{ color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: planColor, display: 'inline-block' }} />
                        {item.planName} ({activeCount} active)
                      </span>
                      <span style={{ color: 'var(--text-muted)' }}>₹{Math.round(amount).toLocaleString('en-IN')} ({percentage}%)</span>
                    </div>
                    <div style={{ width: '100%', height: '8px', background: 'var(--bg-app)', borderRadius: '4px', overflow: 'hidden' }}>
                      <div style={{ width: `${Math.max(percentage, amount > 0 ? 3 : 0)}%`, height: '100%', background: planColor, borderRadius: '4px', transition: 'width 0.4s ease' }}></div>
                    </div>
                  </div>
                )
              })}
            </div>

            <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '16px', marginTop: 'auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div style={{ textAlign: 'center', background: 'var(--bg-app)', padding: '10px', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
                <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontWeight: '700' }}>AVG BILLING RATE</span>
                <h5 style={{ margin: '4px 0 0 0', fontSize: '1.15rem', color: 'var(--text-main)', fontWeight: '800' }}>
                  ₹{Math.round(avgBillingRate).toLocaleString('en-IN')}/mo
                </h5>
              </div>
              <div style={{ textAlign: 'center', background: 'var(--bg-app)', padding: '10px', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
                <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontWeight: '700' }}>TOTAL ARR ESTIMATE</span>
                <h5 style={{ margin: '4px 0 0 0', fontSize: '1.15rem', color: 'var(--text-main)', fontWeight: '800' }}>
                  ₹{Math.round(totalArrEstimate).toLocaleString('en-IN')}
                </h5>
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
            
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
              <div style={{ position: 'relative' }}>
                <input
                  type="text"
                  value={searchQuery}
                  onKeyDown={(e) => {
                    if (e.key === ' ' || e.code === 'Space' || e.keyCode === 32) {
                      e.preventDefault();
                    }
                  }}
                  onChange={(e) => setSearchQuery(e.target.value.replace(/\s+/g, ''))}
                  placeholder="Search restaurant name..."
                  style={{ padding: '8px 10px 8px 30px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-app)', color: 'var(--text-main)', fontSize: '0.78rem', outline: 'none', width: '200px' }}
                />
                <Search style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', width: '13px', height: '13px', color: 'var(--text-muted)' }} />
              </div>

              <div style={{ width: '140px' }}>
                <CustomSelect
                  options={[
                    { value: 'All', label: 'All Plans' },
                    { value: 'Basic', label: 'Basic' },
                    { value: 'Standard', label: 'Standard' },
                    { value: 'Premium', label: 'Premium' }
                  ]}
                  value={selectedPlan}
                  onChange={(val) => setSelectedPlan(typeof val === 'object' && val !== null && val.target ? val.target.value : val)}
                />
              </div>
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
                  filteredSubs.map(sub => {
                    const planColor = getPlanColor(sub.plan)
                    return (
                      <tr key={sub.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                        <td style={{ padding: '14px 18px', fontSize: '0.8rem', color: 'var(--text-main)', fontWeight: '800' }}>{sub.id}</td>
                        <td style={{ padding: '14px 18px', fontSize: '0.82rem', color: 'var(--text-main)', fontWeight: '700' }}>{sub.name}</td>
                        <td style={{ padding: '14px 18px' }}>
                          <span style={{
                            fontSize: '0.68rem',
                            fontWeight: '800',
                            padding: '3px 8px',
                            borderRadius: '6px',
                            background: `${planColor}15`,
                            color: planColor
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
                    )
                  })
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

    </div>
  )
}
