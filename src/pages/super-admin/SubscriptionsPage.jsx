import React, { useState, useEffect } from 'react'
import {
  X,
  Gem,
  Plus,
  Minus,
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
import { useAddons } from '../../hooks/useAddons'
import { useNotification } from '../../contexts/NotificationContext'
import { assignSubscriptionAPI, uploadImage, changePlanAPI, renewSubscriptionAPI, manageAddonsAPI, cancelSubscriptionAPI, server } from '../../services/api'
import PaymentDetailsForm from '../../components/Payment/PaymentDetailsForm'
import RenewSubscriptionModal from '../../components/Payment/RenewSubscriptionModal'
import ChangePlanModal from '../../components/Payment/ChangePlanModal'
import ManageAddonsModal from '../../components/Payment/ManageAddonsModal'
import CustomSelect, { ValidatedSelect } from '../../components/common/CustomSelect'
import { useAuth } from '../../contexts/AuthContext'

export default function SubscriptionsPage() {
  const { subscriptions, fetchSubscriptions, subscriptionHistory, fetchSubscriptionHistory } = useSubscriptions()
  const { plans } = usePlans()
  const { restaurants, setRestaurants } = useRestaurant()
  const { addons } = useAddons()
  const { showToast } = useNotification()
  const { hasPermission, isSuperOwner } = useAuth()

  const canAdd = isSuperOwner || hasPermission('subscriptions', 'add')
  const canEdit = isSuperOwner || hasPermission('subscriptions', 'edit')
  const canDelete = isSuperOwner || hasPermission('subscriptions', 'delete')
  const canView = isSuperOwner || hasPermission('subscriptions', 'view')
  
  // Use subscriptions for table instead of restaurants
  const [viewingSubscriptionRest, setViewingSubscriptionRest] = useState(null)
  const [editingSubscriptionRest, setEditingSubscriptionRest] = useState(null)
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false)
  const [activeTab, setActiveTab] = useState('current') // 'current' or 'history'
  const [currentFilter, setCurrentFilter] = useState('All') // 'All', 'Active', 'Expiring Soon', 'Expired', 'Cancelled'
  const [activeDropdown, setActiveDropdown] = useState(null)
  const [actionModal, setActionModal] = useState({ type: null, subscription: null })
  
  const [historySearchTerm, setHistorySearchTerm] = useState('')
  const [historyPlanFilter, setHistoryPlanFilter] = useState('All Plans')
  const [historyStatusFilter, setHistoryStatusFilter] = useState('All Status')

  const [formState, setFormState] = useState({
    restaurantId: '',
    planName: 'Basic Plan',
    billingCycle: 'Annual',
    startDate: '',
    endDate: '',
    renewalDate: '',
    extraBranches: 0
  })
  const [formErrors, setFormErrors] = useState({})

  // Listen for sidebar click reset event to open main module list
  React.useEffect(() => {
    const handleReset = () => {
      setViewingSubscriptionRest(null)
      setEditingSubscriptionRest(null)
      setIsAssignModalOpen(false)
      setActiveTab('current')
      setActiveDropdown(null)
    }
    const handleClickOutside = (e) => {
      if (!e.target.closest('.action-dropdown-container')) {
        setActiveDropdown(null)
      }
    }
    window.addEventListener('reset_module_view', handleReset)
    document.addEventListener('click', handleClickOutside)
    return () => {
      window.removeEventListener('reset_module_view', handleReset)
      document.removeEventListener('click', handleClickOutside)
    }
  }, [])

  // Compute stats based on true subscriptions
  const totalSubscribed = subscriptions.length
  const activeSubscribed = subscriptions.filter(s => s.status === 'Active').length
  const expiringSoonSubscribed = subscriptions.filter(s => s.status === 'Expiring Soon').length
  const expiredSubscribed = subscriptions.filter(s => s.status === 'Expired').length
  const cancelledSubscribed = subscriptions.filter(s => s.status === 'Cancelled' || s.status === 'Suspended').length

  const filteredHistory = (subscriptionHistory || []).filter(record => {
    const matchSearch = record.restaurantName?.toLowerCase().includes(historySearchTerm.toLowerCase()) || false;
    const matchPlan = historyPlanFilter === 'All Plans' || record.planName?.includes(historyPlanFilter);
    const matchStatus = historyStatusFilter === 'All Status' || record.status === historyStatusFilter;
    return matchSearch && matchPlan && matchStatus;
  });

  // Calculate Prices for the Assign Plan Form
  const selectedPlanObj = plans.find(p => p.name === formState.planName);
  const currentPlanPrice = selectedPlanObj 
    ? (formState.billingCycle === 'Annual' ? selectedPlanObj.annualPrice : selectedPlanObj.monthlyPrice) 
    : 0;

  const branchAddon = addons?.find(a => a.addonType === 'BRANCH');
  const addonPricePerBranch = branchAddon 
    ? (formState.billingCycle === 'Annual' ? branchAddon.annualPrice : branchAddon.monthlyPrice) 
    : 1500;
  
  const totalAddonPrice = formState.extraBranches * addonPricePerBranch;
  const totalAssignPrice = currentPlanPrice + totalAddonPrice;

  const handleDateOrCycleChange = (field, value) => {
    const newState = { ...formState, [field]: value }
    if (!newState.startDate) {
      setFormState(newState)
      return
    }
    
    const start = new Date(newState.startDate)
    if (isNaN(start.getTime())) {
      setFormState(newState)
      return
    }

    const end = new Date(start)
    if (newState.billingCycle === 'Monthly') {
      end.setMonth(end.getMonth() + 1)
    } else {
      end.setFullYear(end.getFullYear() + 1)
    }
    
    const endStr = end.toISOString().split('T')[0]
    newState.endDate = endStr
    newState.renewalDate = endStr
    setFormState(newState)
  }

  const handleOpenAssignModal = () => {
    const todayStr = new Date().toISOString().split('T')[0]
    const nextYear = new Date()
    nextYear.setFullYear(nextYear.getFullYear() + 1)
    const nextYearStr = nextYear.toISOString().split('T')[0]

    setFormState({
      restaurantId: restaurants[0]?.id || '',
      planName: plans.filter(p => p.status === 'Active')[0]?.name || 'Basic Plan',
      billingCycle: 'Annual',
      startDate: todayStr,
      endDate: nextYearStr,
      renewalDate: nextYearStr,
      extraBranches: 0
    })
    setFormErrors({})
    setIsAssignModalOpen(true)
  }

  const handleOpenEditModal = (restaurant) => {
    setEditingSubscriptionRest(restaurant)
    setFormState({
      restaurantId: restaurant.id,
      planName: restaurant.subscriptionPlan || 'Basic Plan',
      billingCycle: 'Annual',
      startDate: restaurant.createdDate || '',
      endDate: restaurant.expiryDate || '',
      renewalDate: restaurant.renewalDate || restaurant.expiryDate || ''
    })
    setFormErrors({})
  }

  const handleSaveSubscription = async (e) => {
    e.preventDefault()
    const errors = {}
    if (!formState.restaurantId) errors.restaurantId = 'Restaurant is required'
    if (!formState.startDate) errors.startDate = 'Start Date is required'
    if (formState.paymentMethod !== 'Complimentary' && !formState.referenceId) {
      errors.referenceId = 'Reference ID (UTR / Txn ID) is required'
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors)
      showToast('error', 'Please resolve subscription form validation errors.')
      return
    }

    const selectedRest = restaurants.find(r => r.id === formState.restaurantId)
    if (!selectedRest) return

    if (!editingSubscriptionRest) {
      try {
        const payload = {
          restaurant: selectedRest._id, // Sending the MongoDB ObjectId
          plan: plans.find(p => p.name === formState.planName)?._id,
          billingCycle: formState.billingCycle,
          startDate: formState.startDate,
          status: 'Active',
          extraBranches: formState.extraBranches,
          paymentMethod: formState.paymentMethod,
          referenceId: formState.referenceId,
          notes: formState.notes,
          paymentProof: formState.paymentProof
        }
        await assignSubscriptionAPI(payload)
        showToast('success', `New subscription assigned to "${selectedRest.name}"!`)
      } catch (err) {
        showToast('error', err.response?.data?.message || 'Failed to assign subscription.')
        console.error(err)
        return
      }
    } else {
      // Mockup edit logic for now
      showToast('success', `Subscription details for "${selectedRest.name}" updated successfully.`)
    }

    // Update frontend state temporarily to avoid reload
    const updated = restaurants.map(r => {
      if (r.id === formState.restaurantId) {
        return {
          ...r,
          subscriptionPlan: formState.planName,
          subscriptionStatus: 'Active',
          createdDate: formState.startDate,
          expiryDate: formState.endDate,
          renewalDate: formState.renewalDate
        }
      }
      return r
    })

    // Fetch real history from API if we are assigning
    if (!editingSubscriptionRest) {
      fetchSubscriptionHistory();
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

  const handleQuickCancel = async (subscription) => {
    try {
      if (!subscription || !subscription.id) return;
      await cancelSubscriptionAPI(subscription.id);
      showToast('success', `Subscription for "${subscription.restaurantName}" has been CANCELLED.`);
      fetchSubscriptions();
      fetchSubscriptionHistory();
    } catch (err) {
      console.error(err);
      showToast('error', err.response?.data?.message || 'Failed to cancel subscription');
    }
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

                {/* Restaurant Name, Plan Name & Billing Cycle (Horizontal Row) */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
                  {/* Restaurant Name Dropdown */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-main)' }}>Restaurant Name <span style={{ color: '#ef4444' }}>*</span></label>
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
                      <CustomSelect
                        options={restaurants.map(r => ({ value: r.id, label: `${r.name} (${r.id})` }))}
                        value={formState.restaurantId}
                        onChange={(val) => {
                          const selected = typeof val === 'object' && val !== null && val.target ? val.target.value : val
                          setFormState({ ...formState, restaurantId: selected })
                          if (formErrors.restaurantId) setFormErrors({ ...formErrors, restaurantId: '' })
                        }}
                        error={formErrors.restaurantId}
                        placeholder="-- Select Restaurant --"
                      />
                    )}
                    {formErrors.restaurantId && <span style={{ fontSize: '0.7rem', color: '#ef4444', fontWeight: '600' }}>{formErrors.restaurantId}</span>}
                  </div>

                  {/* Plan Name Selection */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-main)' }}>Plan Name</label>
                    <CustomSelect
                      options={plans.filter(p => p.status === 'Active').map(p => ({ value: p.name, label: p.name }))}
                      value={formState.planName}
                      onChange={(val) => {
                        const selected = typeof val === 'object' && val !== null && val.target ? val.target.value : val
                        setFormState({ ...formState, planName: selected })
                      }}
                      placeholder="Select Plan"
                    />
                  </div>

                  {/* Billing Cycle Selection */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-main)' }}>Billing Cycle</label>
                    <CustomSelect
                      options={[
                        { value: 'Annual', label: 'Annual (1 Year)' },
                        { value: 'Monthly', label: 'Monthly (1 Month)' }
                      ]}
                      value={formState.billingCycle}
                      onChange={(val) => {
                        const selected = typeof val === 'object' && val !== null && val.target ? val.target.value : val
                        handleDateOrCycleChange('billingCycle', selected)
                      }}
                      placeholder="Select Billing Cycle"
                    />
                  </div>
                </div>

                {/* Date Inputs */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-main)' }}>Start Date <span style={{ color: '#ef4444' }}>*</span></label>
                    <input
                      type="date"
                      value={formState.startDate}
                      onChange={(e) => {
                        handleDateOrCycleChange('startDate', e.target.value)
                        if (formErrors.startDate) setFormErrors({ ...formErrors, startDate: '' })
                      }}
                      style={{
                        width: '100%',
                        padding: '9px 12px',
                        border: formErrors.startDate ? '1.5px solid #ef4444' : '1.5px solid var(--border-color)',
                        background: formErrors.startDate ? 'rgba(239,68,68,0.04)' : 'var(--bg-app)',
                        color: 'var(--text-main)',
                        borderRadius: '8px',
                        fontSize: '0.82rem',
                        outline: 'none',
                        boxSizing: 'border-box',
                        transition: 'border-color 0.15s'
                      }}
                    />
                    {formErrors.startDate && <span style={{ fontSize: '0.7rem', color: '#ef4444', fontWeight: '600' }}>{formErrors.startDate}</span>}
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-main)' }}>End Date</label>
                    <input
                      type="date"
                      value={formState.endDate}
                      disabled
                      style={{
                        width: '100%',
                        padding: '9px 12px',
                        border: '1.5px solid var(--border-color)',
                        background: 'var(--bg-app)',
                        color: 'var(--text-muted)',
                        borderRadius: '8px',
                        fontSize: '0.82rem',
                        outline: 'none',
                        boxSizing: 'border-box',
                        cursor: 'not-allowed'
                      }}
                    />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-main)' }}>Renewal Date</label>
                    <input
                      type="date"
                      value={formState.renewalDate}
                      disabled
                      style={{
                        width: '100%',
                        padding: '9px 12px',
                        border: '1.5px solid var(--border-color)',
                        background: 'var(--bg-app)',
                        color: 'var(--text-muted)',
                        borderRadius: '8px',
                        fontSize: '0.82rem',
                        outline: 'none',
                        boxSizing: 'border-box',
                        cursor: 'not-allowed'
                      }}
                    />
                  </div>
                </div>

                {/* Extra Branches & Pricing Summary */}
                {!editingSubscriptionRest && (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', background: 'var(--bg-app)', padding: '16px', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                    {/* Extra Branches Counter */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      <label style={{ fontSize: '0.8rem', fontWeight: '800', color: 'var(--text-main)' }}>Extra Branches Add-on</label>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <button
                          type="button"
                          disabled={formState.extraBranches === 0}
                          onClick={() => setFormState({ ...formState, extraBranches: Math.max(0, formState.extraBranches - 1) })}
                          style={{
                            width: '32px', height: '32px', borderRadius: '8px', border: '1px solid var(--border-color)',
                            background: formState.extraBranches === 0 ? 'var(--bg-app)' : '#ffffff',
                            color: formState.extraBranches === 0 ? 'var(--text-muted)' : 'var(--text-main)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: formState.extraBranches === 0 ? 'not-allowed' : 'pointer'
                          }}
                        >
                          <Minus size={16} />
                        </button>
                        <span style={{ fontSize: '1rem', fontWeight: '800', color: 'var(--text-main)', minWidth: '30px', textAlign: 'center' }}>
                          {formState.extraBranches}
                        </span>
                        <button
                          type="button"
                          onClick={() => setFormState({ ...formState, extraBranches: formState.extraBranches + 1 })}
                          style={{
                            width: '32px', height: '32px', borderRadius: '8px', border: '1px solid var(--border-color)',
                            background: '#ffffff', color: 'var(--text-main)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer'
                          }}
                        >
                          <Plus size={16} />
                        </button>
                      </div>
                      <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        Price: ₹{addonPricePerBranch.toLocaleString('en-IN')} / branch ({formState.billingCycle})
                      </p>
                    </div>

                    {/* Pricing Summary */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <label style={{ fontSize: '0.8rem', fontWeight: '800', color: 'var(--text-main)' }}>Pricing Summary</label>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                        <span>Plan Price</span>
                        <span>₹{currentPlanPrice.toLocaleString('en-IN')}</span>
                      </div>
                      {formState.extraBranches > 0 && (
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                          <span>Extra Branch × {formState.extraBranches}</span>
                          <span>₹{totalAddonPrice.toLocaleString('en-IN')}</span>
                        </div>
                      )}
                      <div style={{ height: '1px', background: 'var(--border-color)', margin: '4px 0' }}></div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', fontWeight: '800', color: 'var(--text-main)' }}>
                        <span>Total (Excl. Tax)</span>
                        <span>₹{totalAssignPrice.toLocaleString('en-IN')}</span>
                      </div>
                    </div>
                  </div>
                )}

                <PaymentDetailsForm formState={formState} setFormState={setFormState} formErrors={formErrors} />

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
                {canAdd && (
                  <button
                    onClick={() => {
                      setFormState({
                        restaurantId: '',
                        planName: 'Basic Plan',
                        billingCycle: 'Annual',
                        startDate: '',
                        endDate: '',
                        renewalDate: '',
                        extraBranches: 0
                      })
                      setIsAssignModalOpen(true)
                    }}
                    className="btn-black"
                    style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer' }}
                  >
                    <Plus style={{ width: '15px', height: '15px' }} /> Assign Plan
                  </button>
                )}
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

              <div style={{ overflowX: 'auto', paddingBottom: activeDropdown ? '160px' : '0', transition: 'padding 0.2s', background: '#ffffff', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
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
                    {subscriptions
                      .filter(sub => currentFilter === 'All' || sub.status === currentFilter)
                      .map((sub, idx) => {
                        const isPremium = sub.planName?.toLowerCase().includes('premium')
                        const isStandard = sub.planName?.toLowerCase().includes('standard')
                        const isBasic = sub.planName?.toLowerCase().includes('basic')

                        const planBadgeColor = isPremium ? '#3b82f6' : isStandard ? '#10b981' : '#64748b'
                        const planBadgeBg = isPremium ? 'rgba(59, 130, 246, 0.1)' : isStandard ? 'rgba(16, 185, 129, 0.1)' : 'rgba(100, 116, 139, 0.1)'
                        const planBadgeBorder = isPremium ? '1px solid rgba(59, 130, 246, 0.2)' : isStandard ? '1px solid rgba(16, 185, 129, 0.2)' : '1px solid rgba(100, 116, 139, 0.2)'

                        const statusStyles = getStatusColor(sub.status || 'Active')

                        return (
                          <tr key={sub.id} style={{ borderBottom: '1px solid var(--border-color)', transition: 'background-color 0.2s' }}>
                            <td style={{ padding: '14px 18px', fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: '700', width: '60px', whiteSpace: 'nowrap' }}>
                              {idx + 1}
                            </td>
                            <td style={{ padding: '14px 18px', whiteSpace: 'nowrap' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <img src={sub.restaurantLogo || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=60&auto=format&fit=crop&q=60'} alt={sub.restaurantName} style={{ width: '28px', height: '28px', borderRadius: '6px', objectFit: 'cover', border: '1px solid var(--border-color)' }} />
                                <div>
                                  <span style={{ fontSize: '0.85rem', fontWeight: '800', color: 'var(--text-main)', display: 'block' }}>{sub.restaurantName}</span>
                                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontFamily: 'monospace' }}>Code: {sub.restaurantCode}</span>
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
                                }}>{sub.planName || 'Free Plan'}</span>
                              </div>
                            </td>
                            <td style={{ padding: '14px 18px', fontSize: '0.8rem', color: 'var(--text-main)', fontWeight: '600', fontFamily: 'monospace', whiteSpace: 'nowrap' }}>
                              {sub.startDate || '—'}
                            </td>
                            <td style={{ padding: '14px 18px', fontSize: '0.8rem', color: 'var(--text-main)', fontWeight: '600', fontFamily: 'monospace', whiteSpace: 'nowrap' }}>
                              {sub.endDate || '—'}
                            </td>
                            <td style={{ padding: '14px 18px', fontSize: '0.8rem', color: 'var(--text-main)', fontWeight: '600', fontFamily: 'monospace', whiteSpace: 'nowrap' }}>
                              {sub.renewalDate || sub.endDate || '—'}
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
                              }}>{sub.status || 'Active'}</span>
                            </td>
                            <td style={{ padding: '14px 18px', textAlign: 'right', width: '260px', whiteSpace: 'nowrap' }}>
                              {(canView || canEdit || canDelete) ? (
                                <div className="action-dropdown-container" style={{ position: 'relative', display: 'flex', justifyContent: 'flex-end' }}>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setActiveDropdown(activeDropdown === sub.id ? null : sub.id);
                                    }}
                                    style={{
                                      padding: '6px 12px',
                                      borderRadius: '6px',
                                      background: 'var(--bg-app)',
                                      border: '1px solid var(--border-color)',
                                      color: 'var(--text-main)',
                                      fontSize: '0.75rem',
                                      fontWeight: '700',
                                      cursor: 'pointer',
                                      display: 'flex',
                                      alignItems: 'center',
                                      gap: '4px'
                                    }}
                                  >
                                    Manage ▾
                                  </button>

                                  {activeDropdown === sub.id && (
                                    <div style={{
                                      position: 'absolute',
                                      top: 'calc(100% + 4px)',
                                      right: 0,
                                      background: '#ffffff',
                                      border: '1px solid var(--border-color)',
                                      borderRadius: '8px',
                                      boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                                      zIndex: 100,
                                      width: '160px',
                                      display: 'flex',
                                      flexDirection: 'column',
                                      overflow: 'hidden',
                                      textAlign: 'left'
                                    }}>
                                      {canView && (
                                        <button
                                          onClick={() => { setViewingSubscriptionRest(sub); setActiveDropdown(null); }}
                                          style={{ padding: '10px 14px', background: 'none', border: 'none', borderBottom: '1px solid var(--border-color)', cursor: 'pointer', fontSize: '0.75rem', color: 'var(--text-main)', textAlign: 'left' }}
                                          onMouseOver={(e) => e.currentTarget.style.background = 'var(--bg-app)'}
                                          onMouseOut={(e) => e.currentTarget.style.background = 'none'}
                                        >View Subscription</button>
                                      )}
                                      
                                      {canEdit && (
                                        <button
                                          onClick={() => { setActionModal({ type: 'changePlan', subscription: sub }); setActiveDropdown(null); }}
                                          style={{ padding: '10px 14px', background: 'none', border: 'none', borderBottom: '1px solid var(--border-color)', cursor: 'pointer', fontSize: '0.75rem', color: 'var(--text-main)', textAlign: 'left' }}
                                          onMouseOver={(e) => e.currentTarget.style.background = 'var(--bg-app)'}
                                          onMouseOut={(e) => e.currentTarget.style.background = 'none'}
                                        >Change Plan</button>
                                      )}
                                      
                                      {canEdit && (
                                        <button
                                          onClick={() => { setActionModal({ type: 'manageAddons', subscription: sub }); setActiveDropdown(null); }}
                                          style={{ padding: '10px 14px', background: 'none', border: 'none', borderBottom: '1px solid var(--border-color)', cursor: 'pointer', fontSize: '0.75rem', color: 'var(--text-main)', textAlign: 'left' }}
                                          onMouseOver={(e) => e.currentTarget.style.background = 'var(--bg-app)'}
                                          onMouseOut={(e) => e.currentTarget.style.background = 'none'}
                                        >Manage Add-ons</button>
                                      )}
                                      
                                      {canEdit && (
                                        <button
                                          onClick={() => { setActionModal({ type: 'renew', subscription: sub }); setActiveDropdown(null); }}
                                          style={{ padding: '10px 14px', background: 'none', border: 'none', borderBottom: '1px solid var(--border-color)', cursor: 'pointer', fontSize: '0.75rem', color: '#10b981', textAlign: 'left' }}
                                          onMouseOver={(e) => e.currentTarget.style.background = 'var(--bg-app)'}
                                          onMouseOut={(e) => e.currentTarget.style.background = 'none'}
                                        >Renew Subscription</button>
                                      )}
                                      
                                      {canDelete && sub.status !== 'Cancelled' && (
                                        <button
                                          onClick={() => { setActionModal({ type: 'cancel', subscription: sub }); setActiveDropdown(null); }}
                                          style={{ padding: '10px 14px', background: 'none', border: 'none', borderBottom: '1px solid var(--border-color)', cursor: 'pointer', fontSize: '0.75rem', color: '#ef4444', textAlign: 'left' }}
                                          onMouseOver={(e) => e.currentTarget.style.background = 'var(--bg-app)'}
                                          onMouseOut={(e) => e.currentTarget.style.background = 'none'}
                                        >Cancel Subscription</button>
                                      )}
                                      
                                      {canView && (
                                        <button
                                          onClick={() => {
                                            setActiveTab('history');
                                            setHistorySearchTerm(sub.restaurantName);
                                            setActiveDropdown(null);
                                          }}
                                          style={{ padding: '10px 14px', background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.75rem', color: 'var(--text-main)', textAlign: 'left' }}
                                          onMouseOver={(e) => e.currentTarget.style.background = 'var(--bg-app)'}
                                          onMouseOut={(e) => e.currentTarget.style.background = 'none'}
                                        >View History</button>
                                      )}
                                    </div>
                                  )}
                                </div>
                              ) : (
                                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>-</span>
                              )}
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
                  onKeyDown={(e) => {
                    if (e.key === ' ' || e.code === 'Space' || e.keyCode === 32) {
                      e.preventDefault();
                    }
                  }}
                  onChange={(e) => setHistorySearchTerm(e.target.value.replace(/\s+/g, ''))}
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
                <div style={{ width: '140px' }}>
                  <CustomSelect
                    options={['All Plans', 'Premium', 'Standard', 'Basic'].map(p => ({ value: p, label: p }))}
                    value={historyPlanFilter}
                    onChange={(val) => setHistoryPlanFilter(typeof val === 'object' && val !== null && val.target ? val.target.value : val)}
                  />
                </div>
                <div style={{ width: '140px' }}>
                  <CustomSelect
                    options={['All Status', 'Active', 'Completed', 'Cancelled'].map(s => ({ value: s, label: s }))}
                    value={historyStatusFilter}
                    onChange={(val) => setHistoryStatusFilter(typeof val === 'object' && val !== null && val.target ? val.target.value : val)}
                  />
                </div>
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
                <span style={{ fontSize: '0.8rem', color: 'var(--text-main)', fontWeight: '800' }}>{viewingSubscriptionRest.restaurantName}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '10px' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: '600' }}>Plan Name</span>
                <span style={{
                  fontSize: '0.8rem',
                  fontWeight: '800',
                  padding: '3px 8px',
                  borderRadius: '4px',
                  background: viewingSubscriptionRest.planName?.includes('Premium') ? 'rgba(59, 130, 246, 0.1)' : 'rgba(16, 185, 129, 0.1)',
                  color: viewingSubscriptionRest.planName?.includes('Premium') ? '#3b82f6' : '#10b981'
                }}>
                  {viewingSubscriptionRest.planName || 'Basic Plan'}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '10px' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: '600' }}>Start Date</span>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-main)', fontWeight: '700', fontFamily: 'monospace' }}>
                  {viewingSubscriptionRest.startDate || '—'}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '10px' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: '600' }}>End Date</span>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-main)', fontWeight: '700', fontFamily: 'monospace' }}>
                  {viewingSubscriptionRest.endDate || '—'}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '10px' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: '600' }}>Renewal Date</span>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-main)', fontWeight: '700', fontFamily: 'monospace' }}>
                  {viewingSubscriptionRest.renewalDate || viewingSubscriptionRest.endDate || '—'}
                </span>
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '10px', borderBottom: viewingSubscriptionRest.paymentProof ? '1px solid var(--border-color)' : 'none' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: '600' }}>Subscription Status</span>
                <span style={{
                  fontSize: '0.8rem',
                  fontWeight: '800',
                  padding: '3px 8px',
                  borderRadius: '4px',
                  background: getStatusColor(viewingSubscriptionRest.status).bg,
                  color: getStatusColor(viewingSubscriptionRest.status).text
                }}>
                  {viewingSubscriptionRest.status || 'Active'}
                </span>
              </div>
              
              {viewingSubscriptionRest.paymentProof && (
                <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '10px' }}>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: '600' }}>Payment Proof</span>
                  <a 
                    href={`${server}${viewingSubscriptionRest.paymentProof.startsWith('/') ? '' : '/'}${viewingSubscriptionRest.paymentProof}`}
                    target="_blank" 
                    rel="noopener noreferrer"
                    style={{ fontSize: '0.8rem', color: 'var(--primary)', fontWeight: '700', textDecoration: 'underline' }}
                  >
                    View Document
                  </a>
                </div>
              )}
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

      {/* Action Modals */}
      {actionModal.type === 'renew' && (
        <RenewSubscriptionModal 
          subscription={actionModal.subscription} 
          onClose={() => setActionModal({ type: null, subscription: null })}
          onConfirm={async (data) => {
            try {
              const payload = {
                subscriptionId: actionModal.subscription?.id, // Sent in URL
                restaurantId: actionModal.subscription?.restaurantId,
                paymentMethod: data.paymentMethod,
                referenceId: data.referenceId,
                notes: data.notes,
                paymentProof: data.paymentProof
              };
              await renewSubscriptionAPI(payload);
              showToast('success', `Renewed subscription for ${actionModal.subscription?.restaurantName}`);
              fetchSubscriptionHistory();
              fetchSubscriptions();
              setActionModal({ type: null, subscription: null });
            } catch (err) {
              console.error(err);
              showToast('error', err.response?.data?.message || 'Failed to renew subscription.');
            }
          }}
        />
      )}
      
      {actionModal.type === 'changePlan' && (
        <ChangePlanModal 
          subscription={actionModal.subscription} 
          onClose={() => setActionModal({ type: null, subscription: null })}
          onConfirm={async (data) => {
            try {
              const payload = {
                restaurantId: actionModal.subscription?.restaurantId,
                newPlanId: data.newPlanId,
                paymentMethod: data.paymentMethod,
                referenceId: data.referenceId,
                notes: data.notes,
                paymentProof: data.paymentProof
              };
              await changePlanAPI(payload);
              showToast('success', `Changed plan for ${actionModal.subscription?.restaurantName}`);
              fetchSubscriptionHistory();
              fetchSubscriptions();
              setActionModal({ type: null, subscription: null });
            } catch (err) {
              console.error(err);
              showToast('error', err.response?.data?.message || 'Failed to change plan.');
            }
          }}
        />
      )}
      
      {actionModal.type === 'manageAddons' && (
        <ManageAddonsModal 
          subscription={actionModal.subscription} 
          onClose={() => setActionModal({ type: null, subscription: null })}
          onConfirm={async (data) => {
            try {
              const payload = {
                restaurantId: actionModal.subscription?.restaurantId,
                extraBranches: data.extraBranches,
                additionalBranches: data.additionalBranches,
                paymentMethod: data.paymentMethod,
                referenceId: data.referenceId,
                notes: data.notes,
                paymentProof: data.paymentProof
              };
              await manageAddonsAPI(payload);
              showToast('success', `Updated add-ons for ${actionModal.subscription?.restaurantName}`);
              fetchSubscriptionHistory();
              fetchSubscriptions();
              setActionModal({ type: null, subscription: null });
            } catch (err) {
              console.error(err);
              showToast('error', err.response?.data?.message || 'Failed to update add-ons.');
            }
          }}
        />
      )}

      {actionModal.type === 'cancel' && (
        <div
          style={{
            position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
            background: 'rgba(9, 13, 22, 0.45)', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)',
            display: 'flex', justifyContent: 'center', alignItems: 'center',
            zIndex: 1100, padding: '20px'
          }}
          onClick={() => setActionModal({ type: null, subscription: null })}
        >
          <div
            className="animate-fade-in"
            style={{
              background: '#ffffff', borderRadius: '20px', padding: '32px',
              width: '95%', maxWidth: '440px', boxShadow: '0 20px 60px rgba(0,0,0,0.18)',
              position: 'relative', textAlign: 'left'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid var(--border-color)', paddingBottom: '14px' }}>
              <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: '900', color: '#ef4444', display: 'flex', alignItems: 'center', gap: '8px' }}>
                Cancel Subscription
              </h3>
              <button
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
                onClick={() => setActionModal({ type: null, subscription: null })}
              >
                <X style={{ width: '18px', height: '18px' }} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: '1.5' }}>
                Are you sure you want to cancel the subscription for <strong>{actionModal.subscription?.restaurantName}</strong>? This action cannot be undone.
              </p>
            </div>

            <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              <button
                className="btn-outline"
                style={{ padding: '8px 18px', borderRadius: '8px', cursor: 'pointer', fontWeight: '700', fontSize: '0.8rem' }}
                onClick={() => setActionModal({ type: null, subscription: null })}
              >
                Close
              </button>
              <button
                onClick={() => { handleQuickCancel(actionModal.subscription); setActionModal({ type: null, subscription: null }); }}
                style={{ padding: '8px 18px', borderRadius: '8px', cursor: 'pointer', fontWeight: '700', fontSize: '0.8rem', background: '#ef4444', color: 'white', border: 'none' }}
              >
                Confirm Cancel
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}
