import React, { useState, useEffect } from 'react'
import {
  Plus,
  FileText,
  FileSpreadsheet,
  RefreshCw,
  AlertTriangle,
  X
} from 'lucide-react'

// ─── Reusable validated input component ───
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
    </div>
    {error && <span style={{ fontSize: '0.7rem', color: '#ef4444', fontWeight: '600' }}>{error}</span>}
  </div>
)

// ─── Reusable validated select component ───
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

import { useSearchParams } from 'react-router-dom'
import { useRestaurant } from '../../hooks/useRestaurants'
import { usePlans } from '../../hooks/usePlans'
import { useBilling } from '../../hooks/useBilling'
import { useNotification } from '../../contexts/NotificationContext'

export default function BillingPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const { restaurants } = useRestaurant()
  const { plans } = usePlans()
  const { invoices, setInvoices } = useBilling()
  const { showToast } = useNotification()
  const onUpdateInvoices = setInvoices

  const [showGenerateInvoiceModal, setShowGenerateInvoiceModalState] = useState(() => {
    return searchParams.get('action') === 'generate' || sessionStorage.getItem('serviq_billing_action') === 'generate'
  })

  const setShowGenerateInvoiceModal = (val) => {
    setShowGenerateInvoiceModalState(val)
    if (val) {
      sessionStorage.setItem('serviq_billing_action', 'generate')
      setSearchParams({ action: 'generate' }, { replace: true })
    } else {
      sessionStorage.removeItem('serviq_billing_action')
      setSearchParams({}, { replace: true })
    }
  }

  useEffect(() => {
    const action = searchParams.get('action')
    if (action === 'generate') {
      setShowGenerateInvoiceModalState(true)
      sessionStorage.setItem('serviq_billing_action', 'generate')
    } else if (action === null) {
      const storedAction = sessionStorage.getItem('serviq_billing_action')
      if (storedAction === 'generate') {
        setShowGenerateInvoiceModalState(true)
        setSearchParams({ action: 'generate' }, { replace: true })
      } else {
        setShowGenerateInvoiceModalState(false)
      }
    }
  }, [searchParams])
  const [newInvoiceFormState, setNewInvoiceFormState] = useState({
    restaurantName: '',
    subscriptionPlan: 'Standard Plan',
    amount: 1999,
    taxAmount: 360,
    paymentMethod: 'UPI',
    paymentDate: '',
    dueDate: '',
    status: 'Paid',
    transactionId: ''
  })
  const [viewingInvoice, setViewingInvoice] = useState(null)
  const [refundModalInvoice, setRefundModalInvoice] = useState(null)
  const [refundReason, setRefundReason] = useState('')
  const [invoiceSearchQuery, setInvoiceSearchQuery] = useState('')
  const [invoiceStatusFilter, setInvoiceStatusFilter] = useState('All')
  const [formErrors, setFormErrors] = useState({})

  // Listen for sidebar click reset event to open main module list
  useEffect(() => {
    const handleReset = () => {
      setShowGenerateInvoiceModalState(false)
      setViewingInvoice(null)
      setRefundModalInvoice(null)
      sessionStorage.removeItem('serviq_billing_action')
      setSearchParams({}, { replace: true })
    }
    window.addEventListener('reset_module_view', handleReset)
    return () => window.removeEventListener('reset_module_view', handleReset)
  }, [])

  // Synchronize new invoice default restaurant selection
  useEffect(() => {
    if (restaurants.length > 0 && !newInvoiceFormState.restaurantName) {
      setNewInvoiceFormState(prev => ({ ...prev, restaurantName: restaurants[0].name }))
    }
  }, [restaurants, newInvoiceFormState.restaurantName])

  const handleGenerateInvoiceSubmit = (e) => {
    e.preventDefault()

    const errors = {}
    const requiredFields = {
      restaurantName: 'Restaurant Name',
      subscriptionPlan: 'Subscription Plan',
      amount: 'Amount',
      status: 'Payment Status',
      dueDate: 'Due Date',
    }

    for (const [field, label] of Object.entries(requiredFields)) {
      if (!newInvoiceFormState[field] || String(newInvoiceFormState[field]).trim() === '') {
        errors[field] = `${label} is Required`
      }
    }

    if (newInvoiceFormState.paymentDate && newInvoiceFormState.dueDate) {
      if (new Date(newInvoiceFormState.dueDate) < new Date(newInvoiceFormState.paymentDate)) {
        errors.dueDate = 'Due Date cannot be earlier than Payment Date'
      }
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors)
      return
    }

    setFormErrors({})

    const year = new Date().getFullYear()
    const nextNum = invoices.length > 0
      ? Math.max(...invoices.map(inv => {
        const parts = inv.id.split('-')
        return parts[parts.length - 1] ? (parseInt(parts[parts.length - 1]) || 0) : 0
      })) + 1
      : 1
    const nextInvId = `INV-${year}-${String(nextNum).padStart(3, '0')}`

    const amountVal = parseFloat(newInvoiceFormState.amount) || 0
    const taxVal = parseFloat(newInvoiceFormState.taxAmount) >= 0 ? parseFloat(newInvoiceFormState.taxAmount) : Math.round(amountVal * 0.18)
    const generatedTxnId = newInvoiceFormState.status === 'Pending' ? '—' : (newInvoiceFormState.transactionId || `TXN-${Math.floor(100000000 + Math.random() * 900000000)}`)

    const newInv = {
      id: nextInvId,
      restaurantName: newInvoiceFormState.restaurantName || (restaurants[0]?.name || 'Serviq Bistro'),
      subscriptionPlan: newInvoiceFormState.subscriptionPlan,
      amount: amountVal,
      taxAmount: taxVal,
      paymentMethod: newInvoiceFormState.status === 'Pending' ? 'N/A' : newInvoiceFormState.paymentMethod,
      paymentDate: newInvoiceFormState.status === 'Pending' ? '' : (newInvoiceFormState.paymentDate || new Date().toISOString().split('T')[0]),
      dueDate: newInvoiceFormState.dueDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      status: newInvoiceFormState.status,
      transactionId: generatedTxnId
    }

    onUpdateInvoices([newInv, ...invoices])
    setShowGenerateInvoiceModal(false)
    showToast('success', `Invoice ${nextInvId} generated successfully!`)

    setNewInvoiceFormState({
      restaurantName: restaurants[0]?.name || '',
      subscriptionPlan: 'Standard Plan',
      amount: 1999,
      taxAmount: 360,
      paymentMethod: 'UPI',
      paymentDate: '',
      dueDate: '',
      status: 'Paid',
      transactionId: ''
    })
  }

  const handleRefundSubmit = (e) => {
    e.preventDefault()

    const errors = {}

    if (!refundReason || String(refundReason).trim() === '') {
      errors.refundReason = "Reason for Refund is Required"
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors)
      return
    }

    setFormErrors({})

    if (!refundModalInvoice) return

    const updated = invoices.map(inv => inv.id === refundModalInvoice.id ? {
      ...inv,
      status: 'Refunded'
    } : inv)
    onUpdateInvoices(updated)

    showToast('success', `Refund of ₹${refundModalInvoice.amount.toLocaleString()} for ${refundModalInvoice.restaurantName} processed successfully.`)
    setRefundModalInvoice(null)
    setRefundReason('')
  }

  return (
    <>
      {showGenerateInvoiceModal ? (
        <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{
            background: '#ffffff',
            border: '1px solid var(--border-color)',
            borderRadius: '16px',
            padding: '32px',
            boxShadow: 'var(--shadow-sm)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', borderBottom: '1px solid var(--border-color)', paddingBottom: '16px' }}>
              <div>
                <span style={{ fontSize: '0.7rem', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block', letterSpacing: '0.5px' }}>Revenue & Billing Ledger</span>
                <h3 style={{ margin: '4px 0 0 0', fontSize: '1.25rem', fontWeight: '900', color: 'var(--text-main)' }}>Generate Subscription Invoice</h3>
              </div>
              <button
                className="btn-outline"
                style={{ padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: '700' }}
                onClick={() => setShowGenerateInvoiceModal(false)}
              >
                Back
              </button>
            </div>

            <form onSubmit={handleGenerateInvoiceSubmit} noValidate style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <ValidatedSelect
                  label="Restaurant Name"
                  value={newInvoiceFormState.restaurantName}
                  onChange={(e) => setNewInvoiceFormState({ ...newInvoiceFormState, restaurantName: e.target.value })}
                  required
                  error={formErrors.restaurantName}
                  setError={(val) => setFormErrors({ ...formErrors, restaurantName: val })}
                >
                  {restaurants.map(rest => (
                    <option key={rest.id} value={rest.name}>{rest.name}</option>
                  ))}
                </ValidatedSelect>

                <ValidatedSelect
                  label="Subscription Plan"
                  value={newInvoiceFormState.subscriptionPlan}
                  onChange={(e) => {
                    const selectedPlanName = e.target.value
                    const foundPlan = plans.find(p => p.name === selectedPlanName)
                    const price = foundPlan ? foundPlan.monthlyPrice : 0
                    setNewInvoiceFormState({
                      ...newInvoiceFormState,
                      subscriptionPlan: selectedPlanName,
                      amount: price,
                      taxAmount: Math.round(price * 0.18)
                    })
                  }}
                  required
                  error={formErrors.subscriptionPlan}
                  setError={(val) => setFormErrors({ ...formErrors, subscriptionPlan: val })}
                >
                  {plans.map(p => (
                    <option key={p.id} value={p.name}>{p.name}</option>
                  ))}
                </ValidatedSelect>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <ValidatedInput
                  label="Amount (₹)"
                  type="text"
                  inputMode="numeric"
                  value={newInvoiceFormState.amount}
                  onChange={(e) => {
                    const cleaned = e.target.value.replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1')
                    const numVal = parseFloat(cleaned) || 0
                    setNewInvoiceFormState({
                      ...newInvoiceFormState,
                      amount: cleaned,
                      taxAmount: cleaned ? Math.round(numVal * 0.18) : ''
                    })
                  }}
                  placeholder="e.g. 1999"
                  required
                  error={formErrors.amount}
                  setError={(val) => setFormErrors({ ...formErrors, amount: val })}
                />

                <ValidatedInput
                  label="Tax Amount (GST 18% Incl.) (₹)"
                  type="text"
                  inputMode="numeric"
                  value={newInvoiceFormState.taxAmount}
                  onChange={(e) => {
                    const onlyNums = e.target.value.replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1')
                    setNewInvoiceFormState({ ...newInvoiceFormState, taxAmount: onlyNums })
                  }}
                  placeholder="e.g. 360"
                  required
                  error={formErrors.taxAmount}
                  setError={(val) => setFormErrors({ ...formErrors, taxAmount: val })}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <ValidatedSelect
                  label="Payment Method"
                  value={newInvoiceFormState.paymentMethod}
                  onChange={(e) => setNewInvoiceFormState({ ...newInvoiceFormState, paymentMethod: e.target.value })}
                  disabled={newInvoiceFormState.status === 'Pending'}
                  error={formErrors.paymentMethod}
                  setError={(val) => setFormErrors({ ...formErrors, paymentMethod: val })}
                >
                  <option value="UPI">UPI</option>
                  <option value="Credit Card">Credit Card</option>
                  <option value="Net Banking">Net Banking</option>
                  <option value="N/A">N/A</option>
                </ValidatedSelect>

                <ValidatedSelect
                  label="Payment Status"
                  value={newInvoiceFormState.status}
                  onChange={(e) => {
                    const nextStatus = e.target.value
                    setNewInvoiceFormState({
                      ...newInvoiceFormState,
                      status: nextStatus,
                      paymentMethod: nextStatus === 'Pending' ? 'N/A' : (newInvoiceFormState.paymentMethod === 'N/A' ? 'UPI' : newInvoiceFormState.paymentMethod),
                      paymentDate: nextStatus === 'Pending' ? '' : (newInvoiceFormState.paymentDate || new Date().toISOString().split('T')[0]),
                      transactionId: nextStatus === 'Pending' ? '' : newInvoiceFormState.transactionId
                    })
                  }}
                  required
                  error={formErrors.status}
                  setError={(val) => setFormErrors({ ...formErrors, status: val })}
                >
                  <option value="Paid">Paid</option>
                  <option value="Pending">Pending</option>
                  <option value="Failed">Failed</option>
                </ValidatedSelect>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <ValidatedInput
                  label="Payment Date"
                  type="date"
                  value={newInvoiceFormState.paymentDate}
                  onChange={(e) => {
                    const newPayDate = e.target.value
                    let currentDueDate = newInvoiceFormState.dueDate
                    if (currentDueDate && newPayDate && currentDueDate < newPayDate) {
                      currentDueDate = newPayDate
                    }
                    setNewInvoiceFormState({
                      ...newInvoiceFormState,
                      paymentDate: newPayDate,
                      dueDate: currentDueDate
                    })
                    if (formErrors.dueDate) setFormErrors({ ...formErrors, dueDate: '' })
                  }}
                  disabled={newInvoiceFormState.status === 'Pending'}
                  error={formErrors.paymentDate}
                  setError={(val) => setFormErrors({ ...formErrors, paymentDate: val })}
                />

                <ValidatedInput
                  label="Due Date"
                  type="date"
                  value={newInvoiceFormState.dueDate}
                  min={newInvoiceFormState.paymentDate || undefined}
                  onChange={(e) => {
                    const selectedDueDate = e.target.value
                    if (newInvoiceFormState.paymentDate && selectedDueDate && selectedDueDate < newInvoiceFormState.paymentDate) {
                      setFormErrors({ ...formErrors, dueDate: 'Due Date cannot be earlier than Payment Date' })
                    } else {
                      if (formErrors.dueDate) setFormErrors({ ...formErrors, dueDate: '' })
                      setNewInvoiceFormState({ ...newInvoiceFormState, dueDate: selectedDueDate })
                    }
                  }}
                  required
                  error={formErrors.dueDate}
                  setError={(val) => setFormErrors({ ...formErrors, dueDate: val })}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <ValidatedInput
                  label="Transaction ID"
                  type="text"
                  value={newInvoiceFormState.transactionId}
                  onChange={(e) => setNewInvoiceFormState({ ...newInvoiceFormState, transactionId: e.target.value })}
                  placeholder="e.g. TXN-129847184"
                  disabled={newInvoiceFormState.status === 'Pending'}
                  error={formErrors.transactionId}
                  setError={(val) => setFormErrors({ ...formErrors, transactionId: val })}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '32px', paddingTop: '24px', borderTop: '1px solid var(--border-color)' }}>
                <button type="button" className="btn-outline" onClick={() => setShowGenerateInvoiceModal(false)} style={{ padding: '10px 24px', fontWeight: '600', borderRadius: '8px', cursor: 'pointer', background: '#ffffff', color: '#64748b', border: '1px solid #cbd5e1' }}>Cancel</button>
                <button type="submit" className="btn-black" style={{ padding: '10px 24px', fontWeight: '600', borderRadius: '8px', cursor: 'pointer', background: '#000000', color: '#ffffff', border: 'none' }}>Generate Invoice</button>
              </div>
            </form>
          </div>
        </div>
      ) : (
        <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div className="glass-card animate-fade-in" style={{ background: 'var(--bg-card)', borderRadius: '16px', border: '1px solid var(--border-color)', overflow: 'hidden', display: 'flex', flexDirection: 'column', gap: '0' }}>
            <div style={{ padding: '20px 20px 10px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', flexWrap: 'wrap', gap: '16px' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: '900' }}>Revenue & Billing Ledger</h3>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Generate subscription invoices, download PDFs, and process refunds.</span>
              </div>

              <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
                <input
                  type="text"
                  placeholder="Search..."
                  value={invoiceSearchQuery}
                  onChange={(e) => setInvoiceSearchQuery(e.target.value)}
                  style={{ padding: '6px 12px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-app)', color: 'var(--text-main)', fontSize: '0.75rem', width: '180px' }}
                />

                <select
                  value={invoiceStatusFilter}
                  onChange={(e) => setInvoiceStatusFilter(e.target.value)}
                  style={{ padding: '6px 10px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-app)', color: 'var(--text-main)', fontSize: '0.75rem', cursor: 'pointer' }}
                >
                  <option value="All">All Statuses</option>
                  <option value="Paid">Paid</option>
                  <option value="Pending">Pending</option>
                  <option value="Failed">Failed</option>
                  <option value="Refunded">Refunded</option>
                </select>

                <button
                  onClick={() => {
                    setShowGenerateInvoiceModal(true)
                    setNewInvoiceFormState({
                      restaurantName: restaurants[0]?.name || '',
                      subscriptionPlan: 'Standard Plan',
                      amount: 1999,
                      taxAmount: 360,
                      paymentMethod: 'UPI',
                      paymentDate: new Date().toISOString().split('T')[0],
                      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                      status: 'Paid'
                    })
                  }}
                  className="btn-black"
                  style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', padding: '7px 14px', borderRadius: '8px', cursor: 'pointer', border: 'none' }}
                >
                  <Plus style={{ width: '14px', height: '14px' }} /> Generate Invoice
                </button>
              </div>
            </div>

            <div style={{ padding: '20px 20px 10px' }}>
              <div className="dish-admin-list" style={{ overflowX: 'auto', background: 'var(--bg-app)', borderRadius: '12px', border: '1px solid var(--border-color)', position: 'relative' }}>
                <table className="menu-data-table">
                  <thead>
                    <tr style={{ background: 'var(--bg-app)', borderBottom: '1px solid var(--border-color)' }}>
                      <th style={{ textAlign: 'left', padding: '12px 24px', fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '800', width: '60px', whiteSpace: 'nowrap' }}>S.No.</th>
                      <th style={{ textAlign: 'left', padding: '12px 18px', fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '800', whiteSpace: 'nowrap' }}>Invoice Number</th>
                      <th style={{ textAlign: 'left', padding: '12px 18px', fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '800', whiteSpace: 'nowrap' }}>Restaurant Name</th>
                      <th style={{ textAlign: 'left', padding: '12px 18px', fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '800', whiteSpace: 'nowrap' }}>Plan Name</th>
                      <th style={{ textAlign: 'left', padding: '12px 18px', fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '800', whiteSpace: 'nowrap' }}>Amount</th>
                      <th style={{ textAlign: 'left', padding: '12px 18px', fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '800', whiteSpace: 'nowrap' }}>Tax Amount</th>
                      <th style={{ textAlign: 'left', padding: '12px 18px', fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '800', whiteSpace: 'nowrap' }}>Payment Date</th>
                      <th style={{ textAlign: 'left', padding: '12px 18px', fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '800', whiteSpace: 'nowrap' }}>Payment Status</th>
                      <th style={{ textAlign: 'left', padding: '12px 18px', fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '800', whiteSpace: 'nowrap' }}>Transaction ID</th>
                      <th style={{ textAlign: 'right', padding: '12px 18px', fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '800', whiteSpace: 'nowrap' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {invoices
                      .filter(inv => {
                        const matchesSearch = inv.id.toLowerCase().includes(invoiceSearchQuery.toLowerCase()) ||
                          inv.restaurantName.toLowerCase().includes(invoiceSearchQuery.toLowerCase()) ||
                          inv.subscriptionPlan.toLowerCase().includes(invoiceSearchQuery.toLowerCase());
                        const matchesStatus = invoiceStatusFilter === 'All' || inv.status === invoiceStatusFilter;
                        return matchesSearch && matchesStatus;
                      })
                      .map((inv, idx) => (
                        <tr key={inv.id} style={{ borderBottom: '1px solid var(--border-color)', transition: 'background-color 0.2s' }}>
                          <td style={{ padding: '14px 24px', fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: '700', whiteSpace: 'nowrap' }}>
                            {idx + 1}
                          </td>
                          <td style={{ padding: '14px 18px', fontSize: '0.8rem', color: 'var(--text-muted)', fontFamily: 'monospace', fontWeight: '700', whiteSpace: 'nowrap' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <FileText style={{ width: '14px', height: '14px', color: 'var(--primary)' }} />
                              <span>{inv.id}</span>
                            </div>
                          </td>
                          <td style={{ padding: '14px 18px', fontSize: '0.85rem', fontWeight: '800', color: 'var(--text-main)', whiteSpace: 'nowrap' }}>{inv.restaurantName}</td>
                          <td style={{ padding: '14px 18px', whiteSpace: 'nowrap' }}>
                            <span style={{
                              fontSize: '0.7rem',
                              fontWeight: '800',
                              padding: '4px 10px',
                              borderRadius: '6px',
                              background: inv.subscriptionPlan.includes('Enterprise') ? 'rgba(124, 58, 237, 0.1)' : inv.subscriptionPlan.includes('Premium') ? 'rgba(59, 130, 246, 0.1)' : inv.subscriptionPlan.includes('Standard') ? 'rgba(16, 185, 129, 0.1)' : 'rgba(100, 116, 139, 0.1)',
                              color: inv.subscriptionPlan.includes('Enterprise') ? '#7c3aed' : inv.subscriptionPlan.includes('Premium') ? '#3b82f6' : inv.subscriptionPlan.includes('Standard') ? '#10b981' : '#64748b',
                              display: 'inline-block'
                            }}>{inv.subscriptionPlan}</span>
                          </td>
                          <td style={{ padding: '14px 18px', fontSize: '0.8rem', color: 'var(--text-main)', fontWeight: '700', whiteSpace: 'nowrap' }}>
                            ₹{inv.amount.toLocaleString()}
                          </td>
                          <td style={{ padding: '14px 18px', fontSize: '0.8rem', color: 'var(--text-main)', fontWeight: '700', whiteSpace: 'nowrap' }}>
                            ₹{(inv.taxAmount !== undefined ? inv.taxAmount : Math.round(inv.amount * 0.18)).toLocaleString()}
                          </td>
                          <td style={{ padding: '14px 18px', fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: '600', whiteSpace: 'nowrap' }}>
                            {inv.paymentDate || '—'}
                          </td>
                          <td style={{ padding: '14px 18px', whiteSpace: 'nowrap' }}>
                            <span style={{
                              fontSize: '0.7rem',
                              fontWeight: '800',
                              padding: '4px 10px',
                              borderRadius: '6px',
                              background: inv.status === 'Paid' ? 'rgba(16, 185, 129, 0.1)' : inv.status === 'Pending' ? 'rgba(245, 158, 11, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                              color: inv.status === 'Paid' ? '#10b981' : inv.status === 'Pending' ? '#f59e0b' : '#ef4444',
                              display: 'inline-block',
                              border: inv.status === 'Paid' ? '1px solid rgba(16, 185, 129, 0.2)' : inv.status === 'Pending' ? '1px solid rgba(245, 158, 11, 0.2)' : '1px solid rgba(239, 68, 68, 0.2)'
                            }}>
                              {inv.status.toUpperCase()}
                            </span>
                          </td>
                          <td style={{ padding: '14px 18px', fontSize: '0.8rem', color: 'var(--text-muted)', fontFamily: 'monospace', fontWeight: '700', whiteSpace: 'nowrap' }}>
                            {inv.transactionId || '—'}
                          </td>
                          <td style={{ padding: '14px 18px', textAlign: 'right', whiteSpace: 'nowrap' }}>
                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', alignItems: 'center' }}>
                              <button
                                onClick={() => setViewingInvoice(inv)}
                                className="btn-outline"
                                style={{
                                  padding: '5px 10px',
                                  fontSize: '0.7rem',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '4px',
                                  cursor: 'pointer',
                                  borderRadius: '6px'
                                }}
                                title="Download Invoice"
                              >
                                <FileSpreadsheet style={{ width: '12px', height: '12px' }} /> Download
                              </button>

                              <button
                                onClick={() => {
                                  if (inv.status === 'Paid') {
                                    setRefundModalInvoice(inv)
                                    setRefundReason('')
                                  } else {
                                    showToast('info', 'Refunds can only be processed on Paid invoices.')
                                  }
                                }}
                                disabled={inv.status !== 'Paid'}
                                className="btn-outline"
                                style={{
                                  padding: '5px 10px',
                                  fontSize: '0.7rem',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '4px',
                                  cursor: inv.status === 'Paid' ? 'pointer' : 'not-allowed',
                                  borderRadius: '6px',
                                  borderColor: inv.status === 'Paid' ? '#7c3aed' : 'var(--border-color)',
                                  color: inv.status === 'Paid' ? '#7c3aed' : 'var(--text-muted)',
                                  opacity: inv.status === 'Paid' ? 1 : 0.5
                                }}
                                title="Refund Process"
                              >
                                <RefreshCw style={{ width: '12px', height: '12px' }} /> Refund
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    {invoices.filter(inv => {
                      const matchesSearch = inv.id.toLowerCase().includes(invoiceSearchQuery.toLowerCase()) ||
                        inv.restaurantName.toLowerCase().includes(invoiceSearchQuery.toLowerCase()) ||
                        inv.subscriptionPlan.toLowerCase().includes(invoiceSearchQuery.toLowerCase());
                      const matchesStatus = invoiceStatusFilter === 'All' || inv.status === invoiceStatusFilter;
                      return matchesSearch && matchesStatus;
                    }).length === 0 && (
                      <tr>
                        <td colSpan="10" style={{ textAlign: 'center', padding: '30px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                          No invoice records found matching your filters.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Invoice PDF Preview Modal Overlay */}
      {viewingInvoice && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(9, 13, 22, 0.45)',
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 99999,
          padding: '20px'
        }} onClick={() => setViewingInvoice(null)}>
          <div className="menu-edit-panel animate-fade-in" style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border-color)',
            borderRadius: '16px',
            padding: '24px',
            width: '95%',
            maxWidth: '600px',
            boxShadow: 'var(--shadow-lg)',
            position: 'relative',
            top: 'auto',
            maxHeight: '90vh',
            overflowY: 'auto'
          }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
              <div>
                <h3 style={{ fontSize: '1.05rem', fontWeight: '800', color: 'var(--text-main)', margin: 0 }}>
                  Invoice Receipt: {viewingInvoice.id}
                </h3>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Serviq Subscription Billing System</span>
              </div>
              <button
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '4px' }}
                onClick={() => setViewingInvoice(null)}
              >
                <X style={{ width: '16px', height: '16px' }} />
              </button>
            </div>

            <div id="printable-invoice-card" style={{ padding: '24px', background: 'var(--bg-app)', border: '1px solid var(--border-color)', borderRadius: '12px', color: 'var(--text-main)', fontSize: '0.8rem', fontFamily: 'sans-serif' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px' }}>
                <div>
                  <h2 style={{ fontSize: '1.5rem', fontWeight: '900', color: 'var(--primary)', margin: '0 0 4px 0', letterSpacing: '-0.5px' }}>SERVIQ</h2>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block' }}>E-Commerce POS & Operations</span>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Tech Park, Chennai, TN, India</span>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <h4 style={{ margin: '0 0 4px 0', fontSize: '0.95rem', fontWeight: '800' }}>INVOICE</h4>
                  <span style={{ fontSize: '0.75rem', fontWeight: '700', fontFamily: 'monospace', color: 'var(--text-muted)', display: 'block' }}>{viewingInvoice.id}</span>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Status: <strong>{viewingInvoice.status.toUpperCase()}</strong></span>
                </div>
              </div>

              <div style={{ borderTop: '1px dashed var(--border-color)', margin: '16px 0' }}></div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
                <div>
                  <span style={{ fontSize: '0.65rem', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>Billed To:</span>
                  <strong style={{ fontSize: '0.85rem', color: 'var(--text-main)' }}>{viewingInvoice.restaurantName}</strong>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block', marginTop: '2px' }}>Operational Branch</span>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Invoice Date: </span>
                    <span style={{ fontWeight: '700' }}>{viewingInvoice.paymentDate || viewingInvoice.dueDate}</span>
                  </div>
                  <div style={{ marginTop: '4px' }}>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Due Date: </span>
                    <span style={{ fontWeight: '700' }}>{viewingInvoice.dueDate}</span>
                  </div>
                  <div style={{ marginTop: '4px' }}>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Payment Method: </span>
                    <span style={{ fontWeight: '700' }}>{viewingInvoice.paymentMethod}</span>
                  </div>
                  {viewingInvoice.transactionId && viewingInvoice.transactionId !== '—' && (
                    <div style={{ marginTop: '4px' }}>
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Transaction ID: </span>
                      <span style={{ fontWeight: '700' }}>{viewingInvoice.transactionId}</span>
                    </div>
                  )}
                </div>
              </div>

              <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '24px' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid var(--border-color)' }}>
                    <th style={{ textAlign: 'left', paddingBottom: '8px', fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '800' }}>Item Description</th>
                    <th style={{ textAlign: 'right', paddingBottom: '8px', fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '800' }}>Qty</th>
                    <th style={{ textAlign: 'right', paddingBottom: '8px', fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '800' }}>Unit Rate</th>
                    <th style={{ textAlign: 'right', paddingBottom: '8px', fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '800' }}>Total Amount</th>
                  </tr>
                </thead>
                <tbody>
                  <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                    <td style={{ padding: '10px 0', fontWeight: '700', color: 'var(--text-main)' }}>
                      Subscription Plan: {viewingInvoice.subscriptionPlan}
                      <span style={{ display: 'block', fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 'normal', marginTop: '2px' }}>Monthly recurring platform license fee</span>
                    </td>
                    <td style={{ padding: '10px 0', textAlign: 'right', fontWeight: '700' }}>1</td>
                    <td style={{ padding: '10px 0', textAlign: 'right' }}>₹{(viewingInvoice.amount - (viewingInvoice.taxAmount !== undefined ? viewingInvoice.taxAmount : Math.round(viewingInvoice.amount * 0.18))).toLocaleString()}</td>
                    <td style={{ padding: '10px 0', textAlign: 'right', fontWeight: '800', color: 'var(--text-main)' }}>₹{(viewingInvoice.amount - (viewingInvoice.taxAmount !== undefined ? viewingInvoice.taxAmount : Math.round(viewingInvoice.amount * 0.18))).toLocaleString()}</td>
                  </tr>
                  <tr>
                    <td colSpan="2" style={{ padding: '10px 0' }}></td>
                    <td style={{ padding: '10px 0', textAlign: 'right', color: 'var(--text-muted)', fontWeight: '600' }}>Subtotal</td>
                    <td style={{ padding: '10px 0', textAlign: 'right', fontWeight: '700', color: 'var(--text-main)' }}>₹{(viewingInvoice.amount - (viewingInvoice.taxAmount !== undefined ? viewingInvoice.taxAmount : Math.round(viewingInvoice.amount * 0.18))).toLocaleString()}</td>
                  </tr>
                  <tr>
                    <td colSpan="2" style={{ padding: '4px 0' }}></td>
                    <td style={{ padding: '4px 0', textAlign: 'right', color: 'var(--text-muted)', fontWeight: '600' }}>Tax (GST 18% Incl.)</td>
                    <td style={{ padding: '4px 0', textAlign: 'right', color: 'var(--text-muted)', fontWeight: '700' }}>₹{(viewingInvoice.taxAmount !== undefined ? viewingInvoice.taxAmount : Math.round(viewingInvoice.amount * 0.18)).toLocaleString()}</td>
                  </tr>
                  <tr style={{ borderTop: '2px solid var(--border-color)' }}>
                    <td colSpan="2" style={{ padding: '12px 0' }}></td>
                    <td style={{ padding: '12px 0', textAlign: 'right', fontWeight: '800', fontSize: '0.85rem', color: 'var(--text-main)' }}>Grand Total</td>
                    <td style={{ padding: '12px 0', textAlign: 'right', fontWeight: '900', fontSize: '0.9rem', color: 'var(--primary)' }}>₹{viewingInvoice.amount.toLocaleString()}</td>
                  </tr>
                </tbody>
              </table>

              <div style={{ borderTop: '1px dashed var(--border-color)', margin: '16px 0' }}></div>

              <div style={{ textAlign: 'center', fontSize: '0.65rem', color: 'var(--text-muted)' }}>
                <span>Thank you for choosing Serviq platform operations!</span>
                <span style={{ display: 'block', marginTop: '4px' }}>For billing disputes or support: billing@serviq.com</span>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
              <button
                onClick={() => {
                  window.print()
                  showToast('success', `Simulating print download for Invoice ${viewingInvoice.id}`)
                }}
                className="btn-black"
                style={{ flex: 1, padding: '10px', fontWeight: '700', borderRadius: '8px', cursor: 'pointer', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
              >
                <FileSpreadsheet style={{ width: '16px', height: '16px' }} /> Print / Download PDF
              </button>
              <button
                type="button"
                className="btn-outline"
                onClick={() => setViewingInvoice(null)}
                style={{ flex: 1, padding: '10px', fontWeight: '700', borderRadius: '8px', cursor: 'pointer' }}
              >
                Close Receipt
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Refund Management Processing Modal Overlay */}
      {refundModalInvoice && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(9, 13, 22, 0.45)',
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 99999,
          padding: '20px'
        }} onClick={() => setRefundModalInvoice(null)}>
          <div className="menu-edit-panel animate-fade-in" style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border-color)',
            borderRadius: '16px',
            padding: '32px',
            width: '90%',
            maxWidth: '450px',
            boxShadow: 'var(--shadow-lg)',
            position: 'relative',
            top: 'auto'
          }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
              <h3 style={{ fontSize: '1.05rem', fontWeight: '800', color: 'var(--text-main)', margin: 0 }}>
                Process Payment Refund
              </h3>
              <button
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '4px' }}
                onClick={() => setRefundModalInvoice(null)}
              >
                <X style={{ width: '16px', height: '16px' }} />
              </button>
            </div>

            <form onSubmit={handleRefundSubmit} noValidate style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ padding: '14px', background: 'rgba(124, 58, 237, 0.08)', border: '1px solid rgba(124, 58, 237, 0.2)', borderRadius: '8px', fontSize: '0.75rem', color: '#7c3aed', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <div><strong>Invoice Reference:</strong> <span style={{ fontFamily: 'monospace', fontWeight: 'bold' }}>{refundModalInvoice.id}</span></div>
                <div><strong>Restaurant Branch:</strong> <span>{refundModalInvoice.restaurantName}</span></div>
                <div><strong>Refund Amount:</strong> <span style={{ fontWeight: 'bold' }}>₹{refundModalInvoice.amount.toLocaleString()}</span></div>
                <div><strong>Original Method:</strong> <span>{refundModalInvoice.paymentMethod}</span></div>
              </div>

              <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label style={{ fontSize: '0.75rem', fontWeight: '700', color: formErrors.refundReason ? '#ef4444' : 'var(--text-main)' }}>Reason for Refund {formErrors.refundReason && '*'}</label>
                <div style={{ position: 'relative' }}>
                  <textarea
                    value={refundReason}
                    onChange={(e) => {
                      setRefundReason(e.target.value)
                      if (formErrors.refundReason) {
                        setFormErrors({ ...formErrors, refundReason: '' })
                      }
                    }}
                    placeholder="Provide detailed description for processing this refund request (e.g. Overcharged billing tier error)..."
                    required
                    rows="3"
                    style={{ width: '100%', padding: '8px 12px', border: `1px solid ${formErrors.refundReason ? '#ef4444' : 'var(--border-color)'}`, background: formErrors.refundReason ? 'rgba(239, 68, 68, 0.05)' : 'var(--bg-app)', color: 'var(--text-main)', borderRadius: '6px', fontSize: '0.8rem', resize: 'vertical' }}
                  />
                  {formErrors.refundReason && (
                    <div style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: '#ef4444', pointerEvents: 'none' }}>
                      <AlertTriangle style={{ width: '16px', height: '16px' }} />
                    </div>
                  )}
                </div>
                {formErrors.refundReason && <span style={{ fontSize: '0.7rem', color: '#ef4444', fontWeight: '600', marginTop: '2px' }}>{formErrors.refundReason}</span>}
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '14px' }}>
                <button type="submit" className="btn-black" style={{ flex: 1, padding: '10px 24px', fontWeight: '600', borderRadius: '8px', cursor: 'pointer', background: '#000000', color: '#ffffff', border: 'none' }}>Approve & Refund</button>
                <button type="button" className="btn-outline" onClick={() => setRefundModalInvoice(null)} style={{ flex: 1, padding: '10px 24px', fontWeight: '600', borderRadius: '8px', cursor: 'pointer', background: '#ffffff', color: '#64748b', border: '1px solid #cbd5e1' }}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
