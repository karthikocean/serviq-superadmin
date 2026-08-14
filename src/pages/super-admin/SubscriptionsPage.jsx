import React, { useState, useEffect } from 'react'
import {
  X,
  Gem,
  Plus,
  RefreshCw,
  XCircle,
  CheckCircle2,
  Calendar,
  AlertTriangle,
  Edit3,
  LogOut,
  Info
} from 'lucide-react'

import { useSubscriptions } from '../../hooks/useSubscriptions'
import { usePlans } from '../../hooks/usePlans'
import { useRestaurant } from '../../hooks/useRestaurants'
import { useNotification } from '../../contexts/NotificationContext'

export default function SubscriptionsPage() {
  const { subscriptionHistory, setSubscriptionHistory } = useSubscriptions()
  const { plans } = usePlans()
  const { restaurants, setRestaurants } = useRestaurant()
  const { showToast } = useNotification()
  // Mock onUpdateRestaurants for compatibility
  const onUpdateRestaurants = setRestaurants;
  const [viewingSubscriptionRest, setViewingSubscriptionRest] = useState(null)
  const [editingSubscriptionRest, setEditingSubscriptionRest] = useState(null)
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false)
  const [activeTab, setActiveTab] = useState('current') // 'current' or 'history'
  const [currentFilter, setCurrentFilter] = useState('All') // 'All', 'Active', 'Expiring Soon', 'Expired', 'Cancelled'
  
  const [historySearchTerm, setHistorySearchTerm] = useState('')
  const [historyPlanFilter, setHistoryPlanFilter] = useState('All Plans')
  const [historyStatusFilter, setHistoryStatusFilter] = useState('All Status')

  const [formState, setFormState] = useState({
    restaurantId: '',
    planName: 'Basic Plan',
    startDate: '',
    endDate: '',
    renewalDate: '',
    subscriptionStatus: 'Active'
  })
  const [formErrors, setFormErrors] = useState({})

  // Listen for sidebar click reset event to open main module list
  React.useEffect(() => {
    const handleReset = () => {
      setViewingSubscriptionRest(null)
      setEditingSubscriptionRest(null)
      setIsAssignModalOpen(false)
      setActiveTab('current')
    }
    window.addEventListener('reset_module_view', handleReset)
    return () => window.removeEventListener('reset_module_view', handleReset)
  }, [])

  // Compute stats for the top widget row
  const totalSubscribed = restaurants.length
  const activeSubscribed = restaurants.filter(r => r.subscriptionStatus === 'Active').length
  const expiringSoonSubscribed = restaurants.filter(r => r.subscriptionStatus === 'Expiring Soon').length
  const expiredSubscribed = restaurants.filter(r => r.subscriptionStatus === 'Expired').length
  const cancelledSubscribed = restaurants.filter(r => r.subscriptionStatus === 'Cancelled' || r.subscriptionStatus === 'Suspended').length

  const filteredHistory = (subscriptionHistory || []).filter(record => {
    const matchSearch = record.restaurantName?.toLowerCase().includes(historySearchTerm.toLowerCase()) || false;
    const matchPlan = historyPlanFilter === 'All Plans' || record.planName?.includes(historyPlanFilter);
    const matchStatus = historyStatusFilter === 'All Status' || record.status === historyStatusFilter;
    return matchSearch && matchPlan && matchStatus;
  });

  const handleOpenAssignModal = () => {
    const todayStr = new Date().toISOString().split('T')[0]
    const nextYear = new Date()
    nextYear.setFullYear(nextYear.getFullYear() + 1)
    const nextYearStr = nextYear.toISOString().split('T')[0]

    setFormState({
      restaurantId: restaurants[0]?.id || '',
      planName: plans.filter(p => p.status === 'Active')[0]?.name || 'Basic Plan',
      startDate: todayStr,
      endDate: nextYearStr,
      renewalDate: nextYearStr,
      subscriptionStatus: 'Active'
    })
    setFormErrors({})
    setIsAssignModalOpen(true)
  }

  const handleOpenEditModal = (restaurant) => {
    setEditingSubscriptionRest(restaurant)
    setFormState({
      restaurantId: restaurant.id,
      planName: restaurant.subscriptionPlan || 'Basic Plan',
      startDate: restaurant.createdDate || '',
      endDate: restaurant.expiryDate || '',
      renewalDate: restaurant.renewalDate || restaurant.expiryDate || '',
      subscriptionStatus: restaurant.subscriptionStatus || 'Active'
    })
    setFormErrors({})
  }

  const handleSaveSubscription = (e) => {
    e.preventDefault()
    const errors = {}
    if (!formState.restaurantId) errors.restaurantId = 'Restaurant is required'
    if (!formState.startDate) errors.startDate = 'Start Date is required'
    if (!formState.endDate) errors.endDate = 'End Date is required'
    if (!formState.renewalDate) errors.renewalDate = 'Renewal Date is required'

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors)
      return
    }

    const selectedRest = restaurants.find(r => r.id === formState.restaurantId)
    if (!selectedRest) return

    // Update restaurant subscription fields
    const updated = restaurants.map(r => {
      if (r.id === formState.restaurantId) {
        const isUpgrade = getPlanRank(formState.planName) > getPlanRank(r.subscriptionPlan)
        const isDowngrade = getPlanRank(formState.planName) < getPlanRank(r.subscriptionPlan)

        if (editingSubscriptionRest) {
          if (isUpgrade) {
            showToast('success', `Subscription for "${r.name}" successfully UPGRADED to ${formState.planName}!`)
          } else if (isDowngrade) {
            showToast('info', `Subscription for "${r.name}" successfully DOWNGRADED to ${formState.planName}.`)
          } else {
            showToast('success', `Subscription details for "${r.name}" updated successfully.`)
          }
        } else {
          showToast('success', `New subscription assigned to "${r.name}"!`)
        }

        return {
          ...r,
          subscriptionPlan: formState.planName,
          subscriptionStatus: formState.subscriptionStatus,
          createdDate: formState.startDate,
          expiryDate: formState.endDate,
          renewalDate: formState.renewalDate
        }
      }
      return r
    })

    if (editingSubscriptionRest) {
      // Just update the existing record in history (e.g. latest active)
      const updatedHistory = subscriptionHistory.map(h =>
        (h.restaurantId === selectedRest.id && h.status === 'Active')
          ? {
            ...h,
            planName: formState.planName,
            startDate: formState.startDate,
            endDate: formState.endDate,
            amount: formState.planName.includes('Premium') ? 49999 : formState.planName.includes('Standard') ? 19999 : 9999,
            status: formState.subscriptionStatus
          }
          : h
      )
      setSubscriptionHistory(updatedHistory)
    } else {
      const newHistoryRecord = {
        id: `SUB-${Date.now().toString().slice(-4)}`,
        restaurantId: selectedRest.id,
        restaurantName: selectedRest.name,
        planName: formState.planName,
        startDate: formState.startDate,
        endDate: formState.endDate,
        amount: formState.planName.includes('Premium') ? 49999 : formState.planName.includes('Standard') ? 19999 : 9999,
        status: formState.subscriptionStatus
      }
      setSubscriptionHistory([newHistoryRecord, ...subscriptionHistory])
    }

    onUpdateRestaurants(updated)
    setIsAssignModalOpen(false)
    setEditingSubscriptionRest(null)
  }

  const handleQuickRenew = (restaurant) => {
    const nextYear = new Date(restaurant.expiryDate || Date.now())
    nextYear.setFullYear(nextYear.getFullYear() + 1)
    const nextYearStr = nextYear.toISOString().split('T')[0]
    const todayStr = new Date().toISOString().split('T')[0]

    const updated = restaurants.map(r => {
      if (r.id === restaurant.id) {
        showToast('success', `Subscription for "${r.name}" renewed for 1 year!`)
        return {
          ...r,
          subscriptionStatus: 'Active',
          createdDate: todayStr,
          expiryDate: nextYearStr,
          renewalDate: nextYearStr
        }
      }
      return r
    })

    const latestSub = subscriptionHistory.find(h => h.restaurantId === restaurant.id && h.status === 'Active')

    // Update History
    const newHistoryRecord = {
      id: `SUB-${Date.now().toString().slice(-4)}`,
      restaurantId: restaurant.id,
      restaurantName: restaurant.name,
      planName: restaurant.subscriptionPlan,
      startDate: todayStr,
      endDate: nextYearStr,
      amount: restaurant.subscriptionPlan?.includes('Premium') ? 49999 : restaurant.subscriptionPlan?.includes('Standard') ? 19999 : 9999,
      status: 'Active',
      previousSubscriptionId: latestSub ? latestSub.id : null
    }

    const updatedHistory = subscriptionHistory.map(h =>
      (h.restaurantId === restaurant.id && h.status === 'Active')
        ? { ...h, status: 'Completed' }
        : h
    )

    setSubscriptionHistory([newHistoryRecord, ...updatedHistory])
    onUpdateRestaurants(updated)
  }

  const handleQuickCancel = (restaurant) => {
    const updated = restaurants.map(r => {
      if (r.id === restaurant.id) {
        showToast('error', `Subscription for "${r.name}" has been CANCELLED.`)
        return {
          ...r,
          subscriptionStatus: 'Cancelled'
        }
      }
      return r
    })

    const updatedHistory = subscriptionHistory.map(h =>
      (h.restaurantId === restaurant.id && h.status === 'Active')
        ? { ...h, status: 'Cancelled' }
        : h
    )
    setSubscriptionHistory(updatedHistory)
    onUpdateRestaurants(updated)
  }

  const getPlanRank = (planName) => {
    if (!planName) return 0
    if (planName.toLowerCase().includes('premium')) return 3
    if (planName.toLowerCase().includes('standard')) return 2
    if (planName.toLowerCase().includes('basic')) return 1
    return 0
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'Active':
        return { bg: 'rgba(16, 185, 129, 0.1)', text: '#10b981', border: '1px solid rgba(16, 185, 129, 0.2)' }
      case 'Expiring Soon':
        return { bg: 'rgba(245, 158, 11, 0.1)', text: '#f59e0b', border: '1px solid rgba(245, 158, 11, 0.2)' }
      case 'Expired':
        return { bg: 'rgba(239, 68, 68, 0.1)', text: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.2)' }
      case 'Cancelled':
      case 'Suspended':
      default:
        return { bg: 'rgba(100, 116, 139, 0.1)', text: '#64748b', border: '1px solid rgba(100, 116, 139, 0.2)' }
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', width: '100%' }}>

      {/* Tabs Layout */}
      <div style={{ display: 'flex', gap: '16px', borderBottom: '1px solid var(--border-color)' }}>
        <button
          onClick={() => setActiveTab('current')}
          style={{
            background: 'none',
            border: 'none',
            padding: '12px 16px',
            fontSize: '0.9rem',
            fontWeight: '800',
            color: activeTab === 'current' ? 'var(--primary)' : 'var(--text-muted)',
            borderBottom: activeTab === 'current' ? '3px solid var(--primary)' : '3px solid transparent',
            cursor: 'pointer',
            transition: 'all 0.2s'
          }}
        >
          Current Subscriptions
        </button>
        <button
          onClick={() => setActiveTab('history')}
          style={{
            background: 'none',
            border: 'none',
            padding: '12px 16px',
            fontSize: '0.9rem',
            fontWeight: '800',
            color: activeTab === 'history' ? 'var(--primary)' : 'var(--text-muted)',
            borderBottom: activeTab === 'history' ? '3px solid var(--primary)' : '3px solid transparent',
            cursor: 'pointer',
            transition: 'all 0.2s'
          }}
        >
          Subscription History
        </button>
      </div>

      {activeTab === 'current' ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Top Subscription Metric Widgets Row */}
          {!isAssignModalOpen && !editingSubscriptionRest && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '12px' }}>
              <div style={{ background: 'var(--bg-card)', padding: '16px', borderRadius: '12px', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-sm)' }}>
                <span style={{ fontSize: '0.65rem', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block', letterSpacing: '0.5px' }}>Total Subscriptions</span>
                <span style={{ fontSize: '1.5rem', fontWeight: '900', color: 'var(--text-main)', display: 'block', marginTop: '4px' }}>{totalSubscribed}</span>
              </div>
              <div style={{ background: 'var(--bg-card)', padding: '16px', borderRadius: '12px', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-sm)' }}>
                <span style={{ fontSize: '0.65rem', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block', letterSpacing: '0.5px' }}>Active Plans</span>
                <span style={{ fontSize: '1.5rem', fontWeight: '900', color: '#10b981', display: 'block', marginTop: '4px' }}>{activeSubscribed}</span>
              </div>
              <div style={{ background: 'var(--bg-card)', padding: '16px', borderRadius: '12px', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-sm)' }}>
                <span style={{ fontSize: '0.65rem', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block', letterSpacing: '0.5px' }}>Expiring Soon</span>
                <span style={{ fontSize: '1.5rem', fontWeight: '900', color: '#f59e0b', display: 'block', marginTop: '4px' }}>{expiringSoonSubscribed}</span>
              </div>
              <div style={{ background: 'var(--bg-card)', padding: '16px', borderRadius: '12px', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-sm)' }}>
                <span style={{ fontSize: '0.65rem', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block', letterSpacing: '0.5px' }}>Expired Plans</span>
                <span style={{ fontSize: '1.5rem', fontWeight: '900', color: '#ef4444', display: 'block', marginTop: '4px' }}>{expiredSubscribed}</span>
              </div>
              <div style={{ background: 'var(--bg-card)', padding: '16px', borderRadius: '12px', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-sm)' }}>
                <span style={{ fontSize: '0.65rem', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block', letterSpacing: '0.5px' }}>Cancelled</span>
                <span style={{ fontSize: '1.5rem', fontWeight: '900', color: '#64748b', display: 'block', marginTop: '4px' }}>{cancelledSubscribed}</span>
              </div>
            </div>
          )}

          {(isAssignModalOpen || editingSubscriptionRest) ? (
            <div className="glass-card animate-fade-in" style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border-color)',
              borderRadius: '16px',
              padding: '32px',
              boxShadow: 'var(--shadow-sm)',
              width: '100%',
              position: 'relative',
              textAlign: 'left'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', borderBottom: '1px solid var(--border-color)', paddingBottom: '16px' }}>
                <div>
                  <span style={{ fontSize: '0.7rem', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block', letterSpacing: '0.5px' }}>Subscription Assignment</span>
                  <h3 style={{ margin: '4px 0 0 0', fontSize: '1.25rem', fontWeight: '900', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Gem style={{ width: '18px', height: '18px', color: 'var(--primary)' }} />
                    {editingSubscriptionRest ? 'Edit Subscription Details' : 'Assign Plan Subscription'}
                  </h3>
                </div>
                <button
                  className="btn-outline"
                  style={{ padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: '700' }}
                  onClick={() => { setIsAssignModalOpen(false); setEditingSubscriptionRest(null); }}
                >
                  Back
                </button>
              </div>

              <form onSubmit={handleSaveSubscription} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

                {/* Restaurant Name & Plan Name (Horizontal Row) */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  {/* Restaurant Name Dropdown */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-main)' }}>Restaurant Name</label>
                    {editingSubscriptionRest ? (
                      <input
                        type="text"
                        disabled
                        value={restaurants.find(r => r.id === formState.restaurantId)?.name || ''}
                        style={{
                          width: '100%',
                          padding: '9px 12px',
                          border: '1.5px solid var(--border-color)',
                          background: 'var(--bg-app)',
                          color: 'var(--text-muted)',
                          borderRadius: '8px',
                          fontSize: '0.82rem',
                          outline: 'none',
                          boxSizing: 'border-box'
                        }}
                      />
                    ) : (
                      <select
                        value={formState.restaurantId}
                        onChange={(e) => setFormState({ ...formState, restaurantId: e.target.value })}
                        style={{
                          width: '100%',
                          padding: '9px 12px',
                          border: '1.5px solid var(--border-color)',
                          background: 'var(--bg-app)',
                          color: 'var(--text-main)',
                          borderRadius: '8px',
                          fontSize: '0.82rem',
                          outline: 'none',
                          cursor: 'pointer',
                          boxSizing: 'border-box'
                        }}
                      >
                        {restaurants.map(r => (
                          <option key={r.id} value={r.id}>{r.name} ({r.id})</option>
                        ))}
                      </select>
                    )}
                  </div>

                  {/* Plan Name Selection */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-main)' }}>Plan Name</label>
                    <select
                      value={formState.planName}
                      onChange={(e) => setFormState({ ...formState, planName: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '9px 12px',
                        border: '1.5px solid var(--border-color)',
                        background: 'var(--bg-app)',
                        color: 'var(--text-main)',
                        borderRadius: '8px',
                        fontSize: '0.82rem',
                        outline: 'none',
                        cursor: 'pointer',
                        boxSizing: 'border-box'
                      }}
                    >
                      {plans.filter(p => p.status === 'Active').map(p => (
                        <option key={p.id} value={p.name}>{p.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Date Inputs */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-main)' }}>Start Date</label>
                    <input
                      type="date"
                      value={formState.startDate}
                      onChange={(e) => setFormState({ ...formState, startDate: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '9px 12px',
                        border: '1.5px solid var(--border-color)',
                        background: 'var(--bg-app)',
                        color: 'var(--text-main)',
                        borderRadius: '8px',
                        fontSize: '0.82rem',
                        outline: 'none',
                        boxSizing: 'border-box'
                      }}
                    />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-main)' }}>End Date</label>
                    <input
                      type="date"
                      value={formState.endDate}
                      onChange={(e) => setFormState({ ...formState, endDate: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '9px 12px',
                        border: '1.5px solid var(--border-color)',
                        background: 'var(--bg-app)',
                        color: 'var(--text-main)',
                        borderRadius: '8px',
                        fontSize: '0.82rem',
                        outline: 'none',
                        boxSizing: 'border-box'
                      }}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-main)' }}>Renewal Date</label>
                    <input
                      type="date"
                      value={formState.renewalDate}
                      onChange={(e) => setFormState({ ...formState, renewalDate: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '9px 12px',
                        border: '1.5px solid var(--border-color)',
                        background: 'var(--bg-app)',
                        color: 'var(--text-main)',
                        borderRadius: '8px',
                        fontSize: '0.82rem',
                        outline: 'none',
                        boxSizing: 'border-box'
                      }}
                    />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-main)' }}>Subscription Status</label>
                    <select
                      value={formState.subscriptionStatus}
                      onChange={(e) => setFormState({ ...formState, subscriptionStatus: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '9px 12px',
                        border: '1.5px solid var(--border-color)',
                        background: 'var(--bg-app)',
                        color: 'var(--text-main)',
                        borderRadius: '8px',
                        fontSize: '0.82rem',
                        outline: 'none',
                        cursor: 'pointer',
                        boxSizing: 'border-box'
                      }}
                    >
                      <option value="Active">Active</option>
                      <option value="Expiring Soon">Expiring Soon</option>
                      <option value="Expired">Expired</option>
                      <option value="Cancelled">Cancelled</option>
                    </select>
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '20px', paddingTop: '16px', borderTop: '1px solid var(--border-color)' }}>
                  <button
                    type="button"
                    onClick={() => { setIsAssignModalOpen(false); setEditingSubscriptionRest(null); }}
                    className="btn-outline"
                    style={{ padding: '10px 24px', fontWeight: '600', borderRadius: '8px', cursor: 'pointer' }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn-black"
                    style={{ padding: '10px 24px', fontWeight: '600', borderRadius: '8px', cursor: 'pointer' }}
                  >
                    {editingSubscriptionRest ? 'Save Changes' : 'Assign Plan'}
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <div className="glass-card animate-fade-in" style={{ padding: '24px', background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '16px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h4 style={{ margin: 0, fontSize: '1.1rem', fontWeight: '900', color: 'var(--text-main)' }}>Franchise Subscriptions & Agreements Registry</h4>
                </div>
                <button
                  onClick={handleOpenAssignModal}
                  className="btn-black"
                  style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer' }}
                >
                  <Plus style={{ width: '15px', height: '15px' }} /> Assign Plan
                </button>
              </div>

              <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px' }}>
                {['All', 'Active', 'Expiring Soon', 'Expired', 'Cancelled'].map(filter => (
                  <button
                    key={filter}
                    onClick={() => setCurrentFilter(filter)}
                    style={{
                      padding: '6px 14px',
                      borderRadius: '20px',
                      fontSize: '0.75rem',
                      fontWeight: '700',
                      border: currentFilter === filter ? '1px solid var(--primary)' : '1px solid var(--border-color)',
                      background: currentFilter === filter ? 'var(--primary)' : 'var(--bg-app)',
                      color: currentFilter === filter ? '#fff' : 'var(--text-muted)',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    {filter}
                  </button>
                ))}
              </div>

              <div style={{ overflowX: 'auto', background: '#ffffff', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                <table className="menu-data-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ background: 'var(--bg-app)', borderBottom: '1px solid var(--border-color)' }}>
                      <th style={{ textAlign: 'left', padding: '14px 18px', fontSize: '0.75rem', fontWeight: '800', width: '60px', whiteSpace: 'nowrap' }}>S.No</th>
                      <th style={{ textAlign: 'left', padding: '14px 18px', fontSize: '0.75rem', fontWeight: '800', whiteSpace: 'nowrap' }}>Restaurant Name</th>
                      <th style={{ textAlign: 'left', padding: '14px 18px', fontSize: '0.75rem', fontWeight: '800', whiteSpace: 'nowrap' }}>Plan Name</th>
                      <th style={{ textAlign: 'left', padding: '14px 18px', fontSize: '0.75rem', fontWeight: '800', whiteSpace: 'nowrap' }}>Start Date</th>
                      <th style={{ textAlign: 'left', padding: '14px 18px', fontSize: '0.75rem', fontWeight: '800', whiteSpace: 'nowrap' }}>End Date</th>
                      <th style={{ textAlign: 'left', padding: '14px 18px', fontSize: '0.75rem', fontWeight: '800', whiteSpace: 'nowrap' }}>Renewal Date</th>
                      <th style={{ textAlign: 'left', padding: '14px 18px', fontSize: '0.75rem', fontWeight: '800', whiteSpace: 'nowrap' }}>Status</th>
                      <th style={{ textAlign: 'right', padding: '14px 18px', fontSize: '0.75rem', fontWeight: '800', width: '260px', whiteSpace: 'nowrap' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {restaurants
                      .filter(rest => currentFilter === 'All' || rest.subscriptionStatus === currentFilter)
                      .map((rest, idx) => {
                        const isPremium = rest.subscriptionPlan?.toLowerCase().includes('premium')
                        const isStandard = rest.subscriptionPlan?.toLowerCase().includes('standard')
                        const isBasic = rest.subscriptionPlan?.toLowerCase().includes('basic')

                        const planBadgeColor = isPremium ? '#3b82f6' : isStandard ? '#10b981' : '#64748b'
                        const planBadgeBg = isPremium ? 'rgba(59, 130, 246, 0.1)' : isStandard ? 'rgba(16, 185, 129, 0.1)' : 'rgba(100, 116, 139, 0.1)'
                        const planBadgeBorder = isPremium ? '1px solid rgba(59, 130, 246, 0.2)' : isStandard ? '1px solid rgba(16, 185, 129, 0.2)' : '1px solid rgba(100, 116, 139, 0.2)'

                        const statusStyles = getStatusColor(rest.subscriptionStatus || 'Active')

                        return (
                          <tr key={rest.id} style={{ borderBottom: '1px solid var(--border-color)', transition: 'background-color 0.2s' }}>
                            <td style={{ padding: '14px 18px', fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: '700', width: '60px', whiteSpace: 'nowrap' }}>
                              {idx + 1}
                            </td>
                            <td style={{ padding: '14px 18px', whiteSpace: 'nowrap' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <img src={rest.logo || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=60&auto=format&fit=crop&q=60'} alt={rest.name} style={{ width: '28px', height: '28px', borderRadius: '6px', objectFit: 'cover', border: '1px solid var(--border-color)' }} />
                                <div>
                                  <span style={{ fontSize: '0.85rem', fontWeight: '800', color: 'var(--text-main)', display: 'block' }}>{rest.name}</span>
                                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontFamily: 'monospace' }}>Code: {rest.id}</span>
                                </div>
                              </div>
                            </td>
                            <td style={{ padding: '14px 18px', whiteSpace: 'nowrap' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <span style={{
                                  fontSize: '0.7rem',
                                  fontWeight: '800',
                                  padding: '4px 10px',
                                  borderRadius: '6px',
                                  background: planBadgeBg,
                                  color: planBadgeColor,
                                  border: planBadgeBorder,
                                  display: 'inline-block'
                                }}>{rest.subscriptionPlan || 'Free Plan'}</span>
                              </div>
                            </td>
                            <td style={{ padding: '14px 18px', fontSize: '0.8rem', color: 'var(--text-main)', fontWeight: '600', fontFamily: 'monospace', whiteSpace: 'nowrap' }}>
                              {rest.createdDate || '—'}
                            </td>
                            <td style={{ padding: '14px 18px', fontSize: '0.8rem', color: 'var(--text-main)', fontWeight: '600', fontFamily: 'monospace', whiteSpace: 'nowrap' }}>
                              {rest.expiryDate || '—'}
                            </td>
                            <td style={{ padding: '14px 18px', fontSize: '0.8rem', color: 'var(--text-main)', fontWeight: '600', fontFamily: 'monospace', whiteSpace: 'nowrap' }}>
                              {rest.renewalDate || rest.expiryDate || '—'}
                            </td>
                            <td style={{ padding: '14px 18px', whiteSpace: 'nowrap' }}>
                              <span style={{
                                fontSize: '0.7rem',
                                fontWeight: '800',
                                padding: '4px 10px',
                                borderRadius: '6px',
                                background: statusStyles.bg,
                                color: statusStyles.text,
                                border: statusStyles.border,
                                display: 'inline-block'
                              }}>{rest.subscriptionStatus || 'Active'}</span>
                            </td>
                            <td style={{ padding: '14px 18px', textAlign: 'right', width: '260px', whiteSpace: 'nowrap' }}>
                              <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', alignItems: 'center' }}>

                                {/* Renew Action */}
                                <button
                                  onClick={() => handleQuickRenew(rest)}
                                  className="btn-outline"
                                  style={{
                                    padding: '5px 10px',
                                    borderRadius: '6px',
                                    fontSize: '0.72rem',
                                    fontWeight: '800',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '4px',
                                    background: '#ffffff',
                                    color: '#10b981',
                                    border: '1px solid rgba(16, 185, 129, 0.3)'
                                  }}
                                  title="Renew subscription for 1 year"
                                  onMouseOver={(e) => { e.currentTarget.style.background = 'rgba(16, 185, 129, 0.05)' }}
                                  onMouseOut={(e) => { e.currentTarget.style.background = '#ffffff' }}
                                >
                                  <RefreshCw style={{ width: '12px', height: '12px' }} /> Renew
                                </button>

                                {/* Cancel Action */}
                                {rest.subscriptionStatus !== 'Cancelled' && (
                                  <button
                                    onClick={() => handleQuickCancel(rest)}
                                    style={{
                                      padding: '5px 10px',
                                      borderRadius: '6px',
                                      fontSize: '0.72rem',
                                      fontWeight: '800',
                                      cursor: 'pointer',
                                      display: 'flex',
                                      alignItems: 'center',
                                      gap: '4px',
                                      background: '#ffffff',
                                      color: '#ef4444',
                                      border: '1px solid rgba(239, 68, 68, 0.3)'
                                    }}
                                    title="Cancel subscription"
                                    onMouseOver={(e) => { e.currentTarget.style.background = 'rgba(239, 68, 68, 0.05)' }}
                                    onMouseOut={(e) => { e.currentTarget.style.background = '#ffffff' }}
                                  >
                                    <XCircle style={{ width: '12px', height: '12px' }} /> Cancel
                                  </button>
                                )}

                                {/* Edit/Upgrade/Downgrade Action */}
                                <button
                                  onClick={() => handleOpenEditModal(rest)}
                                  style={{
                                    padding: '5px',
                                    borderRadius: '6px',
                                    border: '1px solid var(--border-color)',
                                    background: 'none',
                                    color: 'var(--text-muted)',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                  }}
                                  title="Assign/Upgrade/Downgrade Plan"
                                  onMouseOver={(e) => { e.currentTarget.style.color = 'var(--text-main)'; e.currentTarget.style.background = 'var(--bg-app)' }}
                                  onMouseOut={(e) => { e.currentTarget.style.color = 'var(--text-muted)'; e.currentTarget.style.background = 'none' }}
                                >
                                  <Edit3 style={{ width: '14px', height: '14px' }} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        )
                      })}
                  </tbody>
                </table>
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
                  maxWidth: '440px',
                  boxShadow: '0 20px 60px rgba(0,0,0,0.18)',
                  position: 'relative',
                  textAlign: 'left'
                }}
                onClick={(e) => e.stopPropagation()}
              >
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
                      background: viewingSubscriptionRest.subscriptionPlan?.includes('Premium') ? 'rgba(59, 130, 246, 0.1)' : 'rgba(16, 185, 129, 0.1)',
                      color: viewingSubscriptionRest.subscriptionPlan?.includes('Premium') ? '#3b82f6' : '#10b981'
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
                      background: getStatusColor(viewingSubscriptionRest.subscriptionStatus).bg,
                      color: getStatusColor(viewingSubscriptionRest.subscriptionStatus).text
                    }}>
                      {viewingSubscriptionRest.subscriptionStatus || 'Active'}
                    </span>
                  </div>
                </div>

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

        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div className="glass-card animate-fade-in" style={{ padding: '24px', background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '16px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h4 style={{ margin: 0, fontSize: '1.1rem', fontWeight: '900', color: 'var(--text-main)' }}>Subscription History</h4>
              </div>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                <input
                  type="text"
                  placeholder="Search restaurant..."
                  value={historySearchTerm}
                  onChange={(e) => setHistorySearchTerm(e.target.value)}
                  style={{
                    padding: '8px 14px',
                    borderRadius: '8px',
                    border: '1.5px solid var(--border-color)',
                    background: 'var(--bg-app)',
                    fontSize: '0.75rem',
                    outline: 'none',
                    minWidth: '200px'
                  }}
                />
                <select 
                  value={historyPlanFilter}
                  onChange={(e) => setHistoryPlanFilter(e.target.value)}
                  style={{ padding: '8px 14px', borderRadius: '8px', border: '1.5px solid var(--border-color)', background: 'var(--bg-app)', fontSize: '0.75rem', outline: 'none' }}
                >
                  <option value="All Plans">All Plans</option>
                  <option value="Premium">Premium</option>
                  <option value="Standard">Standard</option>
                  <option value="Basic">Basic</option>
                </select>
                <select 
                  value={historyStatusFilter}
                  onChange={(e) => setHistoryStatusFilter(e.target.value)}
                  style={{ padding: '8px 14px', borderRadius: '8px', border: '1.5px solid var(--border-color)', background: 'var(--bg-app)', fontSize: '0.75rem', outline: 'none' }}
                >
                  <option value="All Status">All Status</option>
                  <option value="Active">Active</option>
                  <option value="Completed">Completed</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>
            </div>

            <div style={{ overflowX: 'auto', background: '#ffffff', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
              <table className="menu-data-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: 'var(--bg-app)', borderBottom: '1px solid var(--border-color)' }}>
                    <th style={{ textAlign: 'left', padding: '14px 18px', fontSize: '0.75rem', fontWeight: '800', whiteSpace: 'nowrap' }}>Restaurant</th>
                    <th style={{ textAlign: 'left', padding: '14px 18px', fontSize: '0.75rem', fontWeight: '800', whiteSpace: 'nowrap' }}>Subscription ID</th>
                    <th style={{ textAlign: 'left', padding: '14px 18px', fontSize: '0.75rem', fontWeight: '800', whiteSpace: 'nowrap' }}>Plan</th>
                    <th style={{ textAlign: 'left', padding: '14px 18px', fontSize: '0.75rem', fontWeight: '800', whiteSpace: 'nowrap' }}>Start</th>
                    <th style={{ textAlign: 'left', padding: '14px 18px', fontSize: '0.75rem', fontWeight: '800', whiteSpace: 'nowrap' }}>End</th>
                    <th style={{ textAlign: 'left', padding: '14px 18px', fontSize: '0.75rem', fontWeight: '800', whiteSpace: 'nowrap' }}>Amount</th>
                    <th style={{ textAlign: 'left', padding: '14px 18px', fontSize: '0.75rem', fontWeight: '800', whiteSpace: 'nowrap' }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredHistory.map((historyRecord, idx) => {
                    const statusStyles = getStatusColor(historyRecord.status || 'Completed')
                    return (
                      <tr key={historyRecord.id || idx} style={{ borderBottom: '1px solid var(--border-color)', transition: 'background-color 0.2s' }}>
                        <td style={{ padding: '14px 18px', fontSize: '0.8rem', color: 'var(--text-main)', fontWeight: '700', whiteSpace: 'nowrap' }}>
                          {historyRecord.restaurantName}
                        </td>
                        <td style={{ padding: '14px 18px', fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'monospace', fontWeight: '600' }}>
                          {historyRecord.id}
                        </td>
                        <td style={{ padding: '14px 18px', fontSize: '0.8rem', color: 'var(--text-main)', fontWeight: '600', whiteSpace: 'nowrap' }}>
                          {historyRecord.planName}
                        </td>
                        <td style={{ padding: '14px 18px', fontSize: '0.8rem', color: 'var(--text-main)', fontWeight: '600', fontFamily: 'monospace', whiteSpace: 'nowrap' }}>
                          {historyRecord.startDate}
                        </td>
                        <td style={{ padding: '14px 18px', fontSize: '0.8rem', color: 'var(--text-main)', fontWeight: '600', fontFamily: 'monospace', whiteSpace: 'nowrap' }}>
                          {historyRecord.endDate}
                        </td>
                        <td style={{ padding: '14px 18px', fontSize: '0.8rem', color: 'var(--text-main)', fontWeight: '700', whiteSpace: 'nowrap' }}>
                          ₹{(historyRecord.amount || 0).toLocaleString()}
                        </td>
                        <td style={{ padding: '14px 18px', whiteSpace: 'nowrap' }}>
                          <span style={{
                            fontSize: '0.7rem',
                            fontWeight: '800',
                            padding: '4px 10px',
                            borderRadius: '6px',
                            background: historyRecord.status === 'Completed' ? 'rgba(59, 130, 246, 0.1)' : statusStyles.bg,
                            color: historyRecord.status === 'Completed' ? '#3b82f6' : statusStyles.text,
                            border: historyRecord.status === 'Completed' ? '1px solid rgba(59, 130, 246, 0.2)' : statusStyles.border,
                            display: 'inline-block'
                          }}>{historyRecord.status}</span>
                        </td>
                      </tr>
                    )
                  })}
                  {filteredHistory.length === 0 && (
                    <tr>
                      <td colSpan="7" style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: '600' }}>
                        No historical records found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}


    </div>
  )
}
