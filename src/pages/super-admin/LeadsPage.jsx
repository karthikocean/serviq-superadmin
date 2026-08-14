import React, { useState, useEffect } from 'react'
import { Plus, AlertTriangle } from 'lucide-react'

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

import { useRestaurant } from '../../hooks/useRestaurants'
import { useNotification } from '../../contexts/NotificationContext'
import { TableTopControls, TableBottomPagination } from '../../components/common/TablePagination'

export default function LeadsPage() {
  const { restaurants, setRestaurants: onUpdateRestaurants } = useRestaurant()
  const { showToast } = useNotification()
  const restaurantAdmins = []
  const leadStatuses = ['New Lead', 'Contacted', 'Demo Scheduled', 'Proposal Sent', 'Negotiation', 'Won', 'Lost']
  const leadSources = ['Website', 'Referral', 'Cold Call', 'Walk-in', 'Partner', 'Social Media']

  const [leads, setLeads] = useState([
    { id: 'LEAD-001', businessName: 'Spice Garden Bistro', contactPerson: 'Anita Rao', mobileNumber: '+91 98765 70001', emailAddress: 'anita@spicegarden.in', leadSource: 'Website', leadStatus: 'Demo Scheduled', followUpDate: '2026-06-12', assignedTo: 'Rajesh Kumar', remarks: 'Owner wants a table QR demo for 18 tables.', convertedRestaurantId: '' },
    { id: 'LEAD-002', businessName: 'Urban Tiffin House', contactPerson: 'Karthik Nair', mobileNumber: '+91 98765 70002', emailAddress: 'karthik@urbantiffin.in', leadSource: 'Referral', leadStatus: 'Proposal Sent', followUpDate: '2026-06-14', assignedTo: 'Amit Patel', remarks: 'Asked for Premium Plan with billing module.', convertedRestaurantId: '' },
    { id: 'LEAD-003', businessName: 'Blue Plate Cafe', contactPerson: 'Meera Shah', mobileNumber: '+91 98765 70003', emailAddress: 'meera@blueplate.in', leadSource: 'Cold Call', leadStatus: 'Contacted', followUpDate: '2026-06-10', assignedTo: 'Unassigned', remarks: 'Needs callback after lunch service.', convertedRestaurantId: '' }
  ])

  const [leadFormState, setLeadFormState] = useState({
    businessName: '',
    contactPerson: '',
    mobileNumber: '',
    emailAddress: '',
    leadSource: 'Website',
    leadStatus: 'New Lead',
    followUpDate: '',
    assignedTo: '',
    remarks: ''
  })

  const [leadSearchQuery, setLeadSearchQuery] = useState('')
  const [leadStatusFilter, setLeadStatusFilter] = useState('All')
  const [showCreateLeadForm, setShowCreateLeadForm] = useState(false)
  const [formErrors, setFormErrors] = useState({})

  // Listen for sidebar click reset event to open main module list
  useEffect(() => {
    const handleReset = () => {
      setShowCreateLeadForm(false)
    }
    window.addEventListener('reset_module_view', handleReset)
    return () => window.removeEventListener('reset_module_view', handleReset)
  }, [])

  const resetLeadForm = () => {
    setLeadFormState({
      businessName: '',
      contactPerson: '',
      mobileNumber: '',
      emailAddress: '',
      leadSource: 'Website',
      leadStatus: 'New Lead',
      followUpDate: '',
      assignedTo: restaurantAdmins[0]?.name || '',
      remarks: ''
    })
  }

  const handleCreateLeadSubmit = (e) => {
    e.preventDefault()

    const errors = {}
    const requiredFields = {
      businessName: 'Business Name',
      contactPerson: 'Contact Person',
      mobileNumber: 'Mobile Number',
      emailAddress: 'Email Address',
      leadSource: 'Lead Source',
      leadStatus: 'Lead Status',
      followUpDate: 'Follow-up Date'
    }

    for (const [field, label] of Object.entries(requiredFields)) {
      if (!leadFormState[field] || String(leadFormState[field]).trim() === '') {
        errors[field] = `${label} is Required`
      }
    }

    // Contact Person: letters and spaces only
    if (leadFormState.contactPerson && !/^[a-zA-Z\s]+$/.test(leadFormState.contactPerson.trim())) {
      errors.contactPerson = 'Contact Person must contain letters and spaces only'
    }

    // Mobile Number: 10-digit Indian number starting with 6-9, no duplicates
    const mob = (leadFormState.mobileNumber || '').trim()
    if (mob && !/^[6-9]\d{9}$/.test(mob)) {
      errors.mobileNumber = 'Enter a valid 10-digit mobile number'
    } else if (mob && leads.some(l => l.mobileNumber === mob)) {
      errors.mobileNumber = 'Mobile number already registered by another lead'
    }

    // Email Address: mandatory @ symbol and valid format
    const emailVal = (leadFormState.emailAddress || '').trim()
    if (emailVal && (!emailVal.includes('@') || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailVal))) {
      errors.emailAddress = 'Valid email address containing "@" is required'
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors)
      return
    }

    setFormErrors({})

    const nextIdNum = leads.length > 0
      ? Math.max(...leads.map(lead => parseInt(lead.id.replace('LEAD-', '')) || 0)) + 1
      : 1

    const newLead = {
      id: `LEAD-${String(nextIdNum).padStart(3, '0')}`,
      ...leadFormState,
      assignedTo: leadFormState.assignedTo || restaurantAdmins[0]?.name || 'Unassigned',
      convertedRestaurantId: ''
    }

    setLeads([newLead, ...leads])
    resetLeadForm()
    setShowCreateLeadForm(false)
    showToast('success', `Lead "${newLead.businessName}" created successfully!`)
  }

  const handleLeadStatusChange = (leadId, leadStatus) => {
    setLeads(leads.map(lead => lead.id === leadId ? { ...lead, leadStatus } : lead))
    showToast('success', `Lead status updated to ${leadStatus}.`)
  }

  const handleLeadAssignmentChange = (leadId, assignedTo) => {
    setLeads(leads.map(lead => lead.id === leadId ? { ...lead, assignedTo } : lead))
    showToast('success', `Lead assigned to ${assignedTo}.`)
  }

  const handleLeadFollowUpChange = (leadId, followUpDate) => {
    setLeads(leads.map(lead => lead.id === leadId ? { ...lead, followUpDate } : lead))
    showToast('success', 'Follow-up date scheduled.')
  }

  const handleConvertLeadToRestaurant = (lead) => {
    if (lead.convertedRestaurantId) {
      showToast('info', 'This lead is already converted to a restaurant.')
      return
    }

    const nextIdNum = restaurants.length > 0
      ? Math.max(...restaurants.map(rest => parseInt(String(rest.id).replace('R-', '')) || 0)) + 1
      : 1
    const newRestaurantId = `R-${String(nextIdNum).padStart(2, '0')}`
    const newRestaurant = {
      id: newRestaurantId,
      name: lead.businessName,
      legalName: `${lead.businessName} Pvt. Ltd.`,
      ownerName: lead.contactPerson,
      mobileNumber: lead.mobileNumber,
      phone: lead.mobileNumber,
      email: lead.emailAddress,
      website: '',
      address: '',
      city: '',
      state: '',
      country: 'India',
      license: '',
      gstin: '',
      currency: 'INR',
      taxRate: 5,
      serviceCharge: 5,
      openingTime: '10:00 AM',
      closingTime: '10:00 PM',
      status: 'Active',
      subscriptionPlan: 'Standard',
      subscriptionStatus: 'Active',
      expiryDate: (() => {
        const expiry = new Date()
        expiry.setFullYear(expiry.getFullYear() + 1)
        return expiry.toISOString().split('T')[0]
      })(),
      createdDate: new Date().toISOString().split('T')[0],
      logo: '',
      banner: ''
    }

    onUpdateRestaurants([...restaurants, newRestaurant])
    setLeads(leads.map(item => item.id === lead.id ? {
      ...item,
      leadStatus: 'Won',
      convertedRestaurantId: newRestaurantId,
      remarks: item.remarks ? `${item.remarks} Converted to restaurant ${newRestaurantId}.` : `Converted to restaurant ${newRestaurantId}.`
    } : item))
    showToast('success', `${lead.businessName} converted to restaurant ${newRestaurantId}.`)
  }

  const [currentPage, setCurrentPage] = useState(1)
  const [entriesPerPage, setEntriesPerPage] = useState(10)

  const filteredLeads = leads.filter(lead => {
    const query = leadSearchQuery.toLowerCase()
    const matchesSearch =
      lead.businessName.toLowerCase().includes(query) ||
      lead.contactPerson.toLowerCase().includes(query) ||
      lead.mobileNumber.toLowerCase().includes(query) ||
      lead.emailAddress.toLowerCase().includes(query)
    const matchesStatus = leadStatusFilter === 'All' || lead.leadStatus === leadStatusFilter
    return matchesSearch && matchesStatus
  })

  const paginatedLeads = filteredLeads.slice(
    (currentPage - 1) * entriesPerPage,
    currentPage * entriesPerPage
  )

  const openLeadsCount = leads.filter(lead => !['Won', 'Lost'].includes(lead.leadStatus)).length
  const wonLeadsCount = leads.filter(lead => lead.leadStatus === 'Won').length
  const upcomingFollowUpsCount = leads.filter(lead => lead.followUpDate && !['Won', 'Lost'].includes(lead.leadStatus)).length

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {!showCreateLeadForm && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: '12px' }}>
          {[
            { label: 'Total Leads', value: leads.length, tone: '#0f172a' },
            { label: 'Open Pipeline', value: openLeadsCount, tone: '#f59e0b' },
            { label: 'Follow-ups', value: upcomingFollowUpsCount, tone: '#3b82f6' },
            { label: 'Won / Converted', value: wonLeadsCount, tone: '#10b981' }
          ].map(item => (
            <div key={item.label} className="glass-card" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '10px', padding: '10px 14px' }}>
              <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{item.label}</span>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '4px' }}>
                <strong style={{ fontSize: '1.25rem', fontWeight: '900', color: 'var(--text-main)' }}>{item.value}</strong>
                <span style={{ width: '9px', height: '9px', borderRadius: '50%', background: item.tone }}></span>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="glass-card" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '16px', overflow: 'hidden' }}>
        <div style={{ padding: '18px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', gap: '12px', flexWrap: 'wrap' }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: '900' }}>{showCreateLeadForm ? 'Create Lead' : 'Leads / CRM Pipeline'}</h3>
          </div>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
            {!showCreateLeadForm && (
              <>
                <input
                  type="text"
                  placeholder="Search lead..."
                  value={leadSearchQuery}
                  onChange={(e) => setLeadSearchQuery(e.target.value)}
                  style={{ padding: '7px 12px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-app)', color: 'var(--text-main)', fontSize: '0.75rem', width: '180px' }}
                />
                <select
                  value={leadStatusFilter}
                  onChange={(e) => setLeadStatusFilter(e.target.value)}
                  style={{ padding: '7px 10px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-app)', color: 'var(--text-main)', fontSize: '0.75rem', cursor: 'pointer' }}
                >
                  <option value="All">All Statuses</option>
                  {leadStatuses.map(status => <option key={status} value={status}>{status}</option>)}
                </select>
              </>
            )}
            <button
              type="button"
              className={showCreateLeadForm ? 'btn-outline' : 'btn-black'}
              onClick={() => {
                setFormErrors({})
                resetLeadForm()
                setShowCreateLeadForm(!showCreateLeadForm)
              }}
              style={{ display: 'flex', alignItems: 'center', gap: '6px', borderRadius: '8px', padding: '7px 14px' }}
            >
              {showCreateLeadForm ? 'Back' : 'Create Lead'}
            </button>
          </div>
        </div>

        {showCreateLeadForm && (
          <div className="animate-fade-in" style={{ padding: '20px', borderBottom: '1px solid var(--border-color)', background: 'var(--bg-card)' }}>
            <form onSubmit={handleCreateLeadSubmit} noValidate style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: '12px', alignItems: 'end' }}>
              <ValidatedInput label="Business Name" value={leadFormState.businessName} onChange={(e) => setLeadFormState({ ...leadFormState, businessName: e.target.value })} placeholder="e.g. Green Bowl Cafe" required error={formErrors.businessName} setError={(val) => setFormErrors({ ...formErrors, businessName: val })} />
              <ValidatedInput
                label="Contact Person"
                value={leadFormState.contactPerson}
                onChange={(e) => {
                  const lettersOnly = e.target.value.replace(/[^a-zA-Z\s]/g, '')
                  setLeadFormState({ ...leadFormState, contactPerson: lettersOnly })
                }}
                placeholder="Owner / manager name"
                required
                error={formErrors.contactPerson}
                setError={(val) => setFormErrors({ ...formErrors, contactPerson: val })}
              />
              <ValidatedInput
                label="Mobile Number"
                type="text"
                inputMode="numeric"
                value={leadFormState.mobileNumber}
                onChange={(e) => {
                  const digitsOnly = e.target.value.replace(/[^0-9]/g, '').slice(0, 10)
                  setLeadFormState({ ...leadFormState, mobileNumber: digitsOnly })
                }}
                placeholder="Enter 10-digit mobile number"
                required
                error={formErrors.mobileNumber}
                setError={(val) => setFormErrors({ ...formErrors, mobileNumber: val })}
              />
              <ValidatedInput label="Email Address" type="email" value={leadFormState.emailAddress} onChange={(e) => setLeadFormState({ ...leadFormState, emailAddress: e.target.value })} placeholder="name@business.com" required error={formErrors.emailAddress} setError={(val) => setFormErrors({ ...formErrors, emailAddress: val })} />

              <ValidatedSelect label="Lead Source" value={leadFormState.leadSource} onChange={(e) => setLeadFormState({ ...leadFormState, leadSource: e.target.value })} required error={formErrors.leadSource} setError={(val) => setFormErrors({ ...formErrors, leadSource: val })}>
                {leadSources.map(source => <option key={source} value={source}>{source}</option>)}
              </ValidatedSelect>
              <ValidatedSelect label="Lead Status" value={leadFormState.leadStatus} onChange={(e) => setLeadFormState({ ...leadFormState, leadStatus: e.target.value })} required error={formErrors.leadStatus} setError={(val) => setFormErrors({ ...formErrors, leadStatus: val })}>
                {leadStatuses.map(status => <option key={status} value={status}>{status}</option>)}
              </ValidatedSelect>
              <ValidatedInput label="Follow-up Date" type="date" value={leadFormState.followUpDate} onChange={(e) => setLeadFormState({ ...leadFormState, followUpDate: e.target.value })} required error={formErrors.followUpDate} setError={(val) => setFormErrors({ ...formErrors, followUpDate: val })} />
              <ValidatedInput
                label="Assign Lead"
                value={leadFormState.assignedTo}
                onChange={(e) => setLeadFormState({ ...leadFormState, assignedTo: e.target.value })}
                placeholder="Enter assignee name"
              />

              <div style={{ gridColumn: '1 / -1' }}>
                <label style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-main)', display: 'block', marginBottom: '4px' }}>Remarks</label>
                <textarea
                  value={leadFormState.remarks}
                  onChange={(e) => setLeadFormState({ ...leadFormState, remarks: e.target.value })}
                  placeholder="Lead notes, call outcome, demo preference, proposal details..."
                  rows="3"
                  style={{ width: '100%', padding: '9px 12px', border: '1.5px solid var(--border-color)', borderRadius: '8px', background: 'var(--bg-app)', color: 'var(--text-main)', fontSize: '0.82rem', resize: 'vertical', boxSizing: 'border-box' }}
                />
              </div>

              <div style={{ gridColumn: '1 / -1', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button type="button" className="btn-outline" onClick={resetLeadForm}>Reset</button>
                <button type="submit" className="btn-black" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>Save Lead</button>
              </div>
            </form>
          </div>
        )}

        {!showCreateLeadForm && (
          <div style={{ padding: '20px 20px 10px' }}>
            <div className="dish-admin-list" style={{ overflowX: 'auto', background: 'var(--bg-app)', borderRadius: '12px', border: '1px solid var(--border-color)', position: 'relative' }}>
              <table className="menu-data-table" style={{ width: '100%', borderCollapse: 'collapse', minWidth: '1200px', tableLayout: 'fixed' }}>
              <thead>
                <tr style={{ background: 'var(--bg-app)', borderBottom: '1px solid var(--border-color)' }}>
                  <th style={{ textAlign: 'left', padding: '12px 14px', fontSize: '0.75rem', fontWeight: '800', whiteSpace: 'nowrap', textTransform: 'uppercase', width: '65px' }}>S.No.</th>
                  <th style={{ textAlign: 'left', padding: '12px 14px', fontSize: '0.75rem', fontWeight: '800', whiteSpace: 'nowrap', textTransform: 'uppercase', width: '200px' }}>Lead</th>
                  <th style={{ textAlign: 'left', padding: '12px 14px', fontSize: '0.75rem', fontWeight: '800', whiteSpace: 'nowrap', textTransform: 'uppercase', width: '180px' }}>Contact</th>
                  <th style={{ textAlign: 'left', padding: '12px 14px', fontSize: '0.75rem', fontWeight: '800', whiteSpace: 'nowrap', textTransform: 'uppercase', width: '110px' }}>Source</th>
                  <th style={{ textAlign: 'left', padding: '12px 14px', fontSize: '0.75rem', fontWeight: '800', whiteSpace: 'nowrap', textTransform: 'uppercase', width: '150px' }}>Status</th>
                  <th style={{ textAlign: 'left', padding: '12px 14px', fontSize: '0.75rem', fontWeight: '800', whiteSpace: 'nowrap', textTransform: 'uppercase', width: '160px' }}>Assigned To</th>
                  <th style={{ textAlign: 'left', padding: '12px 14px', fontSize: '0.75rem', fontWeight: '800', whiteSpace: 'nowrap', textTransform: 'uppercase', width: '140px' }}>Follow-up</th>
                  <th style={{ textAlign: 'left', padding: '12px 14px', fontSize: '0.75rem', fontWeight: '800', whiteSpace: 'nowrap', textTransform: 'uppercase', width: '200px' }}>Remarks</th>
                  <th style={{ textAlign: 'right', padding: '12px 14px', fontSize: '0.75rem', fontWeight: '800', whiteSpace: 'nowrap', textTransform: 'uppercase', width: '180px' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedLeads.map((lead, idx) => (
                  <tr key={lead.id} style={{ borderBottom: '1px solid var(--border-color)', transition: 'background-color 0.2s' }}>
                    <td style={{ padding: '12px 14px', verticalAlign: 'middle', fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: '700', whiteSpace: 'nowrap', width: '65px' }}>
                      {(currentPage - 1) * entriesPerPage + idx + 1}
                    </td>
                    <td style={{ padding: '12px 14px', verticalAlign: 'middle', whiteSpace: 'nowrap', width: '200px' }}>
                      <strong style={{ color: 'var(--text-main)', fontSize: '0.85rem', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>{lead.businessName}</strong>
                    </td>
                    <td style={{ padding: '12px 14px', verticalAlign: 'middle', whiteSpace: 'nowrap', width: '180px' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', overflow: 'hidden' }}>
                        <strong style={{ fontSize: '0.82rem', color: 'var(--text-main)', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>{lead.contactPerson}</strong>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{lead.mobileNumber}</span>
                      </div>
                    </td>
                    <td style={{ padding: '12px 14px', verticalAlign: 'middle', fontSize: '0.8rem', color: 'var(--text-main)', fontWeight: '600', whiteSpace: 'nowrap', width: '110px' }}>
                      {lead.leadSource}
                    </td>
                    <td style={{ padding: '12px 14px', verticalAlign: 'middle', whiteSpace: 'nowrap', width: '150px' }}>
                      <select
                        value={lead.leadStatus}
                        onChange={(e) => handleLeadStatusChange(lead.id, e.target.value)}
                        style={{
                          padding: '6px 10px',
                          borderRadius: '8px',
                          border: '1px solid var(--border-color)',
                          background: 'var(--bg-app)',
                          color: 'var(--text-main)',
                          fontSize: '0.75rem',
                          fontWeight: '700',
                          outline: 'none',
                          cursor: 'pointer',
                          boxSizing: 'border-box',
                          width: '100%'
                        }}
                      >
                        {leadStatuses.map(status => <option key={status} value={status}>{status}</option>)}
                      </select>
                    </td>
                    <td style={{ padding: '12px 14px', verticalAlign: 'middle', whiteSpace: 'nowrap', width: '160px' }}>
                      <input
                        type="text"
                        value={lead.assignedTo || ''}
                        onChange={(e) => handleLeadAssignmentChange(lead.id, e.target.value)}
                        placeholder="Unassigned"
                        style={{
                          padding: '6px 10px',
                          borderRadius: '8px',
                          border: '1px solid var(--border-color)',
                          background: 'var(--bg-app)',
                          color: 'var(--text-main)',
                          fontSize: '0.75rem',
                          outline: 'none',
                          boxSizing: 'border-box',
                          width: '100%'
                        }}
                      />
                    </td>
                    <td style={{ padding: '12px 14px', verticalAlign: 'middle', whiteSpace: 'nowrap', width: '140px' }}>
                      <input
                        type="date"
                        value={lead.followUpDate}
                        onChange={(e) => handleLeadFollowUpChange(lead.id, e.target.value)}
                        style={{
                          padding: '6px 10px',
                          borderRadius: '8px',
                          border: '1px solid var(--border-color)',
                          background: 'var(--bg-app)',
                          color: 'var(--text-main)',
                          fontSize: '0.75rem',
                          outline: 'none',
                          boxSizing: 'border-box',
                          width: '100%'
                        }}
                      />
                    </td>
                    <td
                      title={lead.remarks || ''}
                      style={{ padding: '12px 14px', verticalAlign: 'middle', color: 'var(--text-muted)', fontSize: '0.78rem', lineHeight: 1.4, width: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', cursor: lead.remarks ? 'pointer' : 'default' }}
                    >
                      {lead.remarks || '-'}
                    </td>
                    <td style={{ padding: '12px 14px', verticalAlign: 'middle', textAlign: 'right', width: '180px', whiteSpace: 'nowrap' }}>
                      <button
                        type="button"
                        className="btn-outline"
                        disabled={Boolean(lead.convertedRestaurantId) || lead.leadStatus === 'Lost'}
                        onClick={() => handleConvertLeadToRestaurant(lead)}
                        style={{ padding: '6px 10px', fontSize: '0.72rem', borderRadius: '8px', cursor: lead.convertedRestaurantId || lead.leadStatus === 'Lost' ? 'not-allowed' : 'pointer', opacity: lead.convertedRestaurantId || lead.leadStatus === 'Lost' ? 0.55 : 1 }}
                      >
                        {lead.convertedRestaurantId ? `Converted ${lead.convertedRestaurantId}` : 'Convert to Restaurant'}
                      </button>
                    </td>
                  </tr>
                ))}
                {filteredLeads.length === 0 && (
                  <tr>
                    <td colSpan="9" style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)' }}>No leads found matching your filters.</td>
                  </tr>
                )}
              </tbody>
            </table>
            </div>

            <TableBottomPagination
              totalEntries={filteredLeads.length}
              currentPage={currentPage}
              entriesPerPage={entriesPerPage}
              onPageChange={setCurrentPage}
            />
          </div>
        )}
      </div>
    </div>
  )
}
