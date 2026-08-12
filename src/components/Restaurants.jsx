import React, { useState, useEffect } from 'react'
import {
  Building,
  AlertTriangle,
  MapPin,
  Clock,
  Gem,
  Calendar,
  X,
  Lock,
  Unlock,
  Eye,
  Edit2,
  Trash2,
  Plus,
  Shield
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
      {error && (
        <span style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', color: '#ef4444', pointerEvents: 'none', display: 'flex' }}><AlertTriangle style={{ width: '14px', height: '14px' }} /></span>
      )}
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

export default function Restaurants({
  restaurants = [],
  onUpdateRestaurants,
  activeRestaurantId,
  onSetActiveRestaurantId,
  onUpdateRestaurantDetails,
  showToast,
  setConfirmModal
}) {
  const [showAddModal, setShowAddModal] = useState(() => {
    return localStorage.getItem('serviq_showAddRestModal') === 'true'
  })
  const [editingRestId, setEditingRestId] = useState(() => {
    return localStorage.getItem('serviq_editingRestId') || null
  })
  const [viewingRestId, setViewingRestId] = useState(() => {
    return localStorage.getItem('serviq_viewingRestId') || null
  })
  const [viewingSubscriptionRest, setViewingSubscriptionRest] = useState(null)
  const [editFormState, setEditFormState] = useState(null)
  const [formErrors, setFormErrors] = useState({})

  useEffect(() => {
    if (editingRestId) {
      localStorage.setItem('serviq_editingRestId', editingRestId)
    } else {
      localStorage.removeItem('serviq_editingRestId')
    }
  }, [editingRestId])

  useEffect(() => {
    if (viewingRestId) {
      localStorage.setItem('serviq_viewingRestId', viewingRestId)
    } else {
      localStorage.removeItem('serviq_viewingRestId')
    }
  }, [viewingRestId])

  useEffect(() => {
    if (showAddModal) {
      localStorage.setItem('serviq_showAddRestModal', 'true')
    } else {
      localStorage.removeItem('serviq_showAddRestModal')
    }
  }, [showAddModal])

  // Listen for sidebar click reset event to open main module list
  useEffect(() => {
    const handleReset = (e) => {
      if (e.detail?.tab === 'details') {
        setEditingRestId(null)
        setViewingRestId(null)
        setShowAddModal(false)
        localStorage.removeItem('serviq_editingRestId')
        localStorage.removeItem('serviq_viewingRestId')
        localStorage.removeItem('serviq_showAddRestModal')
      }
    }
    window.addEventListener('reset_module_view', handleReset)
    return () => window.removeEventListener('reset_module_view', handleReset)
  }, [])

  // Prefill editFormState when editingRestId is restored on page refresh
  useEffect(() => {
    if (editingRestId) {
      const rest = restaurants.find(r => r.id === editingRestId)
      if (rest) {
        setEditFormState({ ...rest })
      }
    }
  }, [editingRestId, restaurants])

  const [newRestState, setNewRestState] = useState({
    name: '',
    legalName: '',
    branch: '',
    license: '',
    gstin: '',
    pan: '',
    phone: '',
    email: '',
    website: '',
    address: '',
    currency: 'INR',
    taxRate: 5,
    serviceCharge: 5,
    openingTime: '11:00 AM',
    closingTime: '11:00 PM',
    status: 'Active',
    subscriptionPlan: 'Standard',
    createdDate: new Date().toISOString().split('T')[0],
    password: '',
    confirmPassword: '',
    ownerName: '',
    mobileNumber: '',
    city: '',
    state: '',
    country: '',
    logo: '',
    banner: ''
  })

  // Synchronize new restaurant default values
  useEffect(() => {
    setNewRestState(prev => ({
      ...prev,
      createdDate: new Date().toISOString().split('T')[0]
    }))
  }, [])

  const handleEditClick = (rest) => {
    setViewingRestId(null)
    setEditingRestId(rest.id)
    setEditFormState({ ...rest })
  }

  // Handle Create Restaurant
  const handleCreateRestaurant = (e) => {
    e.preventDefault()

    const errors = {}
    const requiredFields = {
      name: 'Tenant',
      legalName: 'Business Name',
      ownerName: 'Owner Name',
      mobileNumber: 'Mobile Number',
      email: 'Email',
      address: 'Registered Location Address',
      city: 'City',
      state: 'State',
      country: 'Country',
      license: 'FSSAI License Number',
      gstin: 'GSTIN Number',
      pan: 'PAN Number',
      openingTime: 'Opening Time',
      closingTime: 'Closing Time',
      password: 'Create Password',
      confirmPassword: 'Confirm Password'
    }

    for (const [field, label] of Object.entries(requiredFields)) {
      if (!newRestState[field] || String(newRestState[field]).trim() === '') {
        errors[field] = `${label} is Required`
      }
    }

    if (newRestState.password && newRestState.confirmPassword && newRestState.password !== newRestState.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match'
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors)
      return
    }

    setFormErrors({})
    const nextIdNum = restaurants.length > 0
      ? Math.max(...restaurants.map(r => parseInt(r.id.replace('R-', '')) || 0)) + 1
      : 1
    const newId = `R-${String(nextIdNum).padStart(2, '0')}`
    const expiry = new Date()
    expiry.setFullYear(expiry.getFullYear() + 1)
    const expiryStr = expiry.toISOString().split('T')[0]
    const restaurantToAdd = { 
      ...newRestState, 
      id: newId,
      subscriptionStatus: 'Active',
      expiryDate: expiryStr
    }
    onUpdateRestaurants([...restaurants, restaurantToAdd])
    onSetActiveRestaurantId(newId)
    setShowAddModal(false)
    showToast('success', `Branch "${newRestState.name}" registered successfully under code ${newId}!`)

    // Clear state
    setNewRestState({
      name: '',
      legalName: '',
      branch: '',
      license: '',
      gstin: '',
      pan: '',
      phone: '',
      email: '',
      website: '',
      address: '',
      currency: 'INR',
      taxRate: 5,
      serviceCharge: 5,
      openingTime: '11:00 AM',
      closingTime: '11:00 PM',
      status: 'Active',
      subscriptionPlan: 'Standard',
      createdDate: new Date().toISOString().split('T')[0],
      password: '',
      confirmPassword: '',
      ownerName: '',
      mobileNumber: '',
      city: '',
      state: '',
      country: '',
      logo: '',
      banner: ''
    })
  }

  // Handle Delete Restaurant
  const handleDeleteRestaurant = (id) => {
    const targetRest = restaurants.find(r => r.id === id)
    if (!targetRest) return
    setConfirmModal({
      title: "Delete Franchise Branch",
      message: `Are you sure you want to permanently delete the branch "${targetRest.name}"? This action cannot be undone.`,
      confirmText: "Confirm Delete",
      confirmColor: "#ef4444",
      onConfirm: () => {
        const remaining = restaurants.filter(r => r.id !== id)
        onUpdateRestaurants(remaining)
        if (id === activeRestaurantId && remaining.length > 0) {
          onSetActiveRestaurantId(remaining[0].id)
          onUpdateRestaurantDetails(remaining[0])
        }
        showToast('error', `Branch "${targetRest.name}" successfully removed.`)
      }
    })
  }

  const handleUpdateRestaurantSubmit = (e) => {
    e.preventDefault()

    const errors = {}
    const requiredFields = {
      name: 'Tenant',
      legalName: 'Business Name',
      ownerName: 'Owner Name',
      mobileNumber: 'Mobile Number',
      email: 'Email',
      address: 'Registered Location Address',
      city: 'City',
      state: 'State',
      country: 'Country',
      license: 'FSSAI License Number',
      gstin: 'GSTIN Number',
      pan: 'PAN Number',
      openingTime: 'Opening Time',
      closingTime: 'Closing Time',
    }

    for (const [field, label] of Object.entries(requiredFields)) {
      if (!editFormState[field] || String(editFormState[field]).trim() === '') {
        errors[field] = `${label} is Required`
      }
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors)
      return
    }

    setFormErrors({})

    const updatedRestaurants = restaurants.map(r => r.id === editingRestId ? editFormState : r)
    onUpdateRestaurants(updatedRestaurants)

    if (editingRestId === activeRestaurantId) {
      onUpdateRestaurantDetails(editFormState)
    }

    showToast('success', `Branch details for "${editFormState.name}" updated successfully!`)
  }

  return (
    <div style={{ width: '100%' }}>
      {showAddModal ? (
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
                <h3 style={{ margin: '4px 0 0 0', fontSize: '1.25rem', fontWeight: '900', color: 'var(--text-main)' }}>Register Restaurant</h3>
              </div>
              <button
                className="btn-outline"
                style={{ padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: '700' }}
                onClick={() => setShowAddModal(false)}
              >
                Back to Registry
              </button>
            </div>

            <form onSubmit={handleCreateRestaurant} noValidate style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {/* Card 1: Restaurant Information */}
              <div style={{
                background: 'var(--bg-app)',
                border: '1px solid var(--border-color)',
                borderRadius: '12px',
                padding: '20px',
                display: 'flex',
                flexDirection: 'column',
                gap: '16px'
              }}>
                <h4 style={{ margin: '0 0 4px 0', fontSize: '0.85rem', fontWeight: '800', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px solid var(--border-color)', paddingBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  <Building style={{ width: '15px', height: '15px', color: '#F95E10' }} />
                  Restaurant Information
                </h4>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <ValidatedInput
                    label="Tenant"
                    type="text"
                    value={newRestState.name}
                    onChange={(e) => setNewRestState({ ...newRestState, name: e.target.value })}
                    placeholder="e.g. serveiq_main"
                    required
                    error={formErrors.name}
                    setError={(val) => setFormErrors({ ...formErrors, name: val })}
                  />
                  <ValidatedInput
                    label="Business Name"
                    type="text"
                    value={newRestState.legalName}
                    onChange={(e) => setNewRestState({ ...newRestState, legalName: e.target.value })}
                    placeholder="e.g. Serviq Hospitality Pvt. Ltd."
                    required
                    error={formErrors.legalName}
                    setError={(val) => setFormErrors({ ...formErrors, legalName: val })}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <ValidatedInput
                    label="Owner Name"
                    type="text"
                    value={newRestState.ownerName}
                    onChange={(e) => setNewRestState({ ...newRestState, ownerName: e.target.value })}
                    placeholder="e.g. Rajesh Kumar"
                    required
                    error={formErrors.ownerName}
                    setError={(val) => setFormErrors({ ...formErrors, ownerName: val })}
                  />
                  <ValidatedInput
                    label="Mobile Number"
                    type="text"
                    value={newRestState.mobileNumber}
                    onChange={(e) => setNewRestState({ ...newRestState, mobileNumber: e.target.value, phone: e.target.value })}
                    placeholder="e.g. +91 98765 43210"
                    required
                    error={formErrors.mobileNumber}
                    setError={(val) => setFormErrors({ ...formErrors, mobileNumber: val })}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <ValidatedInput
                    label="Email"
                    type="email"
                    value={newRestState.email}
                    onChange={(e) => setNewRestState({ ...newRestState, email: e.target.value })}
                    placeholder="e.g. contact@serviqbistro.com"
                    required
                    error={formErrors.email}
                    setError={(val) => setFormErrors({ ...formErrors, email: val })}
                  />
                  <ValidatedInput
                    label="Website Domain"
                    type="text"
                    value={newRestState.website}
                    onChange={(e) => setNewRestState({ ...newRestState, website: e.target.value })}
                    placeholder="e.g. https://serviqbistro.com"
                    error={formErrors.website}
                    setError={(val) => setFormErrors({ ...formErrors, website: val })}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <ValidatedInput
                    label="Opening Time"
                    type="text"
                    value={newRestState.openingTime}
                    onChange={(e) => setNewRestState({ ...newRestState, openingTime: e.target.value })}
                    placeholder="e.g. 11:00 AM"
                    required
                    error={formErrors.openingTime}
                    setError={(val) => setFormErrors({ ...formErrors, openingTime: val })}
                  />
                  <ValidatedInput
                    label="Closing Time"
                    type="text"
                    value={newRestState.closingTime}
                    onChange={(e) => setNewRestState({ ...newRestState, closingTime: e.target.value })}
                    placeholder="e.g. 11:00 PM"
                    required
                    error={formErrors.closingTime}
                    setError={(val) => setFormErrors({ ...formErrors, closingTime: val })}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
                  <ValidatedInput
                    label="Tax Rate (%)"
                    type="number"
                    value={newRestState.taxRate}
                    onChange={(e) => setNewRestState({ ...newRestState, taxRate: parseFloat(e.target.value) || 0 })}
                    min="0" max="30" step="0.5" required
                    error={formErrors.taxRate}
                    setError={(val) => setFormErrors({ ...formErrors, taxRate: val })}
                  />
                  <ValidatedInput
                    label="Service Fee (%)"
                    type="number"
                    value={newRestState.serviceCharge}
                    onChange={(e) => setNewRestState({ ...newRestState, serviceCharge: parseFloat(e.target.value) || 0 })}
                    min="0" max="20" step="0.5" required
                    error={formErrors.serviceCharge}
                    setError={(val) => setFormErrors({ ...formErrors, serviceCharge: val })}
                  />
                  <ValidatedSelect
                    label="Initial Status"
                    value={newRestState.status}
                    onChange={(e) => setNewRestState({ ...newRestState, status: e.target.value })}
                    error={formErrors.status}
                    setError={(val) => setFormErrors({ ...formErrors, status: val })}
                  >
                    <option value="Active">Active</option>
                    <option value="Suspended">Suspended</option>
                    <option value="Inactive">Inactive</option>
                  </ValidatedSelect>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <ValidatedInput
                    label="Restaurant Logo URL"
                    type="text"
                    value={newRestState.logo}
                    onChange={(e) => setNewRestState({ ...newRestState, logo: e.target.value })}
                    placeholder="https://images.unsplash.com/... (Logo)"
                    error={formErrors.logo}
                    setError={(val) => setFormErrors({ ...formErrors, logo: val })}
                  />
                  <ValidatedInput
                    label="Restaurant Banner URL"
                    type="text"
                    value={newRestState.banner}
                    onChange={(e) => setNewRestState({ ...newRestState, banner: e.target.value })}
                    placeholder="https://images.unsplash.com/... (Banner)"
                    error={formErrors.banner}
                    setError={(val) => setFormErrors({ ...formErrors, banner: val })}
                  />
                </div>
              </div>

              {/* Card 2: Address Information */}
              <div style={{
                background: 'var(--bg-app)',
                border: '1px solid var(--border-color)',
                borderRadius: '12px',
                padding: '20px',
                display: 'flex',
                flexDirection: 'column',
                gap: '16px'
              }}>
                <h4 style={{ margin: '0 0 4px 0', fontSize: '0.85rem', fontWeight: '800', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px solid var(--border-color)', paddingBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  <MapPin style={{ width: '15px', height: '15px', color: '#F95E10' }} />
                  Address Information
                </h4>

                <ValidatedInput
                  label="Registered Location Address"
                  type="text"
                  value={newRestState.address}
                  onChange={(e) => setNewRestState({ ...newRestState, address: e.target.value })}
                  placeholder="e.g. 12, Khader Nawaz Khan Road, Nungambakkam"
                  required
                  error={formErrors.address}
                  setError={(val) => setFormErrors({ ...formErrors, address: val })}
                />

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
                  <ValidatedInput
                    label="City"
                    type="text"
                    value={newRestState.city}
                    onChange={(e) => setNewRestState({ ...newRestState, city: e.target.value, branch: `${e.target.value}` })}
                    placeholder="e.g. Chennai"
                    required
                    error={formErrors.city}
                    setError={(val) => setFormErrors({ ...formErrors, city: val })}
                  />
                  <ValidatedInput
                    label="State"
                    type="text"
                    value={newRestState.state}
                    onChange={(e) => setNewRestState({ ...newRestState, state: e.target.value })}
                    placeholder="e.g. Tamil Nadu"
                    required
                    error={formErrors.state}
                    setError={(val) => setFormErrors({ ...formErrors, state: val })}
                  />
                  <ValidatedInput
                    label="Country"
                    type="text"
                    value={newRestState.country}
                    onChange={(e) => setNewRestState({ ...newRestState, country: e.target.value })}
                    placeholder="e.g. India"
                    required
                    error={formErrors.country}
                    setError={(val) => setFormErrors({ ...formErrors, country: val })}
                  />
                </div>
              </div>

              {/* Card 3: Compliance Information */}
              <div style={{
                background: 'var(--bg-app)',
                border: '1px solid var(--border-color)',
                borderRadius: '12px',
                padding: '20px',
                display: 'flex',
                flexDirection: 'column',
                gap: '16px'
              }}>
                <h4 style={{ margin: '0 0 4px 0', fontSize: '0.85rem', fontWeight: '800', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px solid var(--border-color)', paddingBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  <Shield style={{ width: '15px', height: '15px', color: '#F95E10' }} />
                  Compliance Information
                </h4>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
                  <ValidatedInput
                    label="FSSAI License Number"
                    type="text"
                    value={newRestState.license}
                    onChange={(e) => setNewRestState({ ...newRestState, license: e.target.value })}
                    placeholder="FSSAI-12345678901234"
                    required
                    error={formErrors.license}
                    setError={(val) => setFormErrors({ ...formErrors, license: val })}
                  />
                  <ValidatedInput
                    label="GSTIN Number"
                    type="text"
                    value={newRestState.gstin}
                    onChange={(e) => setNewRestState({ ...newRestState, gstin: e.target.value })}
                    placeholder="33AAAAA1111A1Z1"
                    required
                    error={formErrors.gstin}
                    setError={(val) => setFormErrors({ ...formErrors, gstin: val })}
                  />
                  <ValidatedInput
                    label="PAN Number"
                    type="text"
                    value={newRestState.pan}
                    onChange={(e) => setNewRestState({ ...newRestState, pan: e.target.value })}
                    placeholder="ABCDE1234F"
                    required
                    error={formErrors.pan}
                    setError={(val) => setFormErrors({ ...formErrors, pan: val })}
                  />
                </div>
              </div>

              {/* Card 4: Password Management */}
              <div style={{
                background: 'var(--bg-app)',
                border: '1px solid var(--border-color)',
                borderRadius: '12px',
                padding: '20px',
                display: 'flex',
                flexDirection: 'column',
                gap: '16px'
              }}>
                <h4 style={{ margin: '0 0 4px 0', fontSize: '0.85rem', fontWeight: '800', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px solid var(--border-color)', paddingBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  <Lock style={{ width: '15px', height: '15px', color: '#F95E10' }} />
                  Password Management
                </h4>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <ValidatedInput
                    label="Create Password"
                    type="password"
                    value={newRestState.password || ''}
                    onChange={(e) => setNewRestState({ ...newRestState, password: e.target.value })}
                    required
                    placeholder="Enter account password"
                    error={formErrors.password}
                    setError={(val) => setFormErrors({ ...formErrors, password: val })}
                  />
                  
                  <ValidatedInput
                    label="Confirm Password"
                    type="password"
                    value={newRestState.confirmPassword || ''}
                    onChange={(e) => setNewRestState({ ...newRestState, confirmPassword: e.target.value })}
                    required
                    placeholder="Re-enter account password"
                    error={formErrors.confirmPassword}
                    setError={(val) => setFormErrors({ ...formErrors, confirmPassword: val })}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '20px' }}>
                <button type="button" onClick={() => setShowAddModal(false)} style={{ padding: '10px 24px', fontWeight: '600', borderRadius: '8px', cursor: 'pointer', background: '#ffffff', color: '#64748b', border: '1px solid #cbd5e1' }}>Cancel</button>
                <button type="submit" style={{ padding: '10px 24px', fontWeight: '600', borderRadius: '8px', cursor: 'pointer', background: '#000000', color: '#ffffff', border: 'none' }}>Register</button>
              </div>
            </form>
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', alignItems: 'stretch', transition: 'all 0.3s ease' }} className="animate-fade-in">

          {/* Multi-Restaurant Switcher Header Selector Table */}
          {!viewingRestId && !editingRestId && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', background: 'var(--bg-card)', padding: '24px', borderRadius: '16px', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-sm)', minWidth: 0 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h3 style={{ margin: '4px 0 0 0', fontSize: '1.2rem', fontWeight: '900', color: 'var(--text-main)' }}>Restaurant Management</h3>
                </div>
                <button
                  onClick={() => { setViewingRestId(null); setEditingRestId(null); setShowAddModal(true); }}
                  className="btn-black"
                  style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer' }}
                >
                  <Plus style={{ width: '16px', height: '16px' }} /> Register
                </button>
              </div>

              <div className="dish-admin-list" style={{ overflowX: 'auto', background: '#ffffff', borderRadius: '12px', border: '1px solid var(--border-color)', position: 'relative' }}>
                <table className="menu-data-table" style={{ width: '100%', borderCollapse: 'collapse', background: '#ffffff' }}>
                  <thead>
                    <tr>
                      <th style={{ position: 'sticky', top: 0, zIndex: 10, background: 'var(--bg-app)', borderBottom: '1px solid var(--border-color)', textAlign: 'left', padding: '12px 18px', fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '800', width: '60px', whiteSpace: 'nowrap' }}>S.No</th>
                      <th style={{ position: 'sticky', top: 0, zIndex: 10, background: 'var(--bg-app)', borderBottom: '1px solid var(--border-color)', textAlign: 'left', padding: '12px 18px', fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '800', width: '120px', whiteSpace: 'nowrap' }}>Restaurant ID</th>
                      <th style={{ position: 'sticky', top: 0, zIndex: 10, background: 'var(--bg-app)', borderBottom: '1px solid var(--border-color)', textAlign: 'left', padding: '12px 18px', fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '800', whiteSpace: 'nowrap' }}>Restaurant Name</th>
                      <th style={{ position: 'sticky', top: 0, zIndex: 10, background: 'var(--bg-app)', borderBottom: '1px solid var(--border-color)', textAlign: 'left', padding: '12px 18px', fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '800', whiteSpace: 'nowrap' }}>Owner Name</th>
                      <th style={{ position: 'sticky', top: 0, zIndex: 10, background: 'var(--bg-app)', borderBottom: '1px solid var(--border-color)', textAlign: 'left', padding: '12px 18px', fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '800', whiteSpace: 'nowrap' }}>Email</th>
                      <th style={{ position: 'sticky', top: 0, zIndex: 10, background: 'var(--bg-app)', borderBottom: '1px solid var(--border-color)', textAlign: 'left', padding: '12px 18px', fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '800', whiteSpace: 'nowrap' }}>Subscription Plan</th>
                      <th style={{ position: 'sticky', top: 0, zIndex: 10, background: 'var(--bg-app)', borderBottom: '1px solid var(--border-color)', textAlign: 'left', padding: '12px 18px', fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '800', whiteSpace: 'nowrap' }}>Phone Number</th>
                      <th style={{ position: 'sticky', top: 0, zIndex: 10, background: 'var(--bg-app)', borderBottom: '1px solid var(--border-color)', textAlign: 'left', padding: '12px 18px', fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '800', width: '120px', whiteSpace: 'nowrap' }}>Status</th>
                      <th style={{ position: 'sticky', top: 0, zIndex: 10, background: 'var(--bg-app)', borderBottom: '1px solid var(--border-color)', textAlign: 'right', padding: '12px 60px', fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '800', width: '220px', whiteSpace: 'nowrap' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {restaurants.map((rest, index) => {
                      const isActive = rest.id === activeRestaurantId

                      return (
                        <tr
                          key={rest.id}
                          onClick={() => onSetActiveRestaurantId(rest.id)}
                          style={{
                            borderBottom: '1px solid var(--border-color)',
                            background: isActive ? 'var(--primary-light)' : 'transparent',
                            transition: 'background-color 0.2s',
                            cursor: 'pointer'
                          }}
                        >
                          <td style={{ padding: '14px 18px', fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: '700', whiteSpace: 'nowrap' }}>
                            {index + 1}
                          </td>
                          <td style={{ padding: '14px 18px', fontSize: '0.8rem', color: 'var(--text-main)', fontWeight: '800', fontFamily: 'monospace', whiteSpace: 'nowrap' }}>
                            {rest.id}
                          </td>
                          <td style={{ padding: '14px 18px', whiteSpace: 'nowrap' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                              <div className="dish-admin-img" style={{ width: '38px', height: '38px', flexShrink: 0, padding: 0, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '6px', border: isActive ? '2px solid var(--primary)' : '1px solid var(--border-color)' }}>
                                <img src={rest.logo || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=120&auto=format&fit=crop&q=60'} alt={rest.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                              </div>
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', overflow: 'hidden' }}>
                                <h4 style={{ fontSize: '0.85rem', fontWeight: '800', color: isActive ? 'var(--primary)' : 'var(--text-main)', margin: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
                                  {rest.name}
                                </h4>
                              </div>
                            </div>
                          </td>
                          <td style={{ padding: '14px 18px', fontSize: '0.8rem', color: 'var(--text-main)', fontWeight: '700', whiteSpace: 'nowrap' }}>
                            {rest.ownerName || '—'}
                          </td>
                          <td style={{ padding: '14px 18px', fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: '600', whiteSpace: 'nowrap' }}>
                            {rest.email || '—'}
                          </td>
                          <td style={{ padding: '14px 18px', whiteSpace: 'nowrap' }}>
                            <span style={{
                              fontSize: '0.7rem',
                              fontWeight: '800',
                              padding: '4px 10px',
                              borderRadius: '6px',
                              background: rest.subscriptionPlan?.includes('Premium') ? 'rgba(59, 130, 246, 0.1)' : 'rgba(16, 185, 129, 0.1)',
                              color: rest.subscriptionPlan?.includes('Premium') ? '#3b82f6' : '#10b981',
                              border: rest.subscriptionPlan?.includes('Premium') ? '1px solid rgba(59, 130, 246, 0.2)' : '1px solid rgba(16, 185, 129, 0.2)',
                              display: 'inline-block'
                            }}>
                              {rest.subscriptionPlan || 'Standard Plan'}
                            </span>
                          </td>
                          <td style={{ padding: '14px 18px', fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: '600', whiteSpace: 'nowrap' }}>
                            {rest.phone || rest.mobileNumber || '—'}
                          </td>
                          <td style={{ padding: '14px 18px', whiteSpace: 'nowrap' }}>
                            <span style={{
                              fontSize: '0.7rem',
                              fontWeight: '800',
                              padding: '4px 10px',
                              borderRadius: '6px',
                              background: rest.status === 'Active' ? 'rgba(16, 185, 129, 0.1)' : rest.status === 'Suspended' ? 'rgba(245, 158, 11, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                              color: rest.status === 'Active' ? '#10b981' : rest.status === 'Suspended' ? '#f59e0b' : '#ef4444',
                              display: 'inline-block',
                              border: rest.status === 'Active' ? '1px solid rgba(16, 185, 129, 0.2)' : rest.status === 'Suspended' ? '1px solid rgba(245, 158, 11, 0.2)' : '1px solid rgba(239, 68, 68, 0.2)'
                            }}>
                              {rest.status || 'Active'}
                            </span>
                          </td>
                          <td style={{ padding: '14px 18px', textAlign: 'right', whiteSpace: 'nowrap' }}>
                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', alignItems: 'center' }}>

                              {/* Suspend / Resume action */}
                              <button
                                style={{
                                  background: 'none',
                                  border: 'none',
                                  cursor: 'pointer',
                                  padding: '6px',
                                  color: rest.status === 'Suspended' ? '#ef4444' : '#10b981',
                                  transition: 'opacity 0.2s',
                                  display: 'flex',
                                  alignItems: 'center'
                                }}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  const nextStatus = rest.status === 'Suspended' ? 'Active' : 'Suspended'
                                  const updated = { ...rest, status: nextStatus }
                                  onUpdateRestaurants(restaurants.map(r => r.id === rest.id ? updated : r))
                                  if (rest.id === activeRestaurantId) {
                                    onUpdateRestaurantDetails(updated)
                                  }
                                  showToast('info', `Branch "${rest.name}" status updated to ${nextStatus.toUpperCase()}`)
                                }}
                                title={rest.status === 'Suspended' ? "Activate Restaurant" : "Suspend Restaurant"}
                              >
                                {rest.status === 'Suspended' ? (
                                  <Lock style={{ width: '16px', height: '16px' }} />
                                ) : (
                                  <Unlock style={{ width: '16px', height: '16px' }} />
                                )}
                              </button>

                              <button
                                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '6px', color: 'var(--text-muted)', transition: 'color 0.2s', display: 'flex', alignItems: 'center' }}
                                onClick={(e) => { e.stopPropagation(); setViewingSubscriptionRest(rest); }}
                                title="View Subscription Details"
                                onMouseOver={(e) => e.currentTarget.style.color = 'var(--text-main)'}
                                onMouseOut={(e) => e.currentTarget.style.color = 'var(--text-muted)'}
                              >
                                <Gem style={{ width: '16px', height: '16px' }} />
                              </button>

                              <button
                                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '6px', color: 'var(--text-muted)', transition: 'color 0.2s', display: 'flex', alignItems: 'center' }}
                                onClick={(e) => { e.stopPropagation(); setEditingRestId(null); setViewingRestId(rest.id); }}
                                title="View Branch Showcase"
                                onMouseOver={(e) => e.currentTarget.style.color = 'var(--text-main)'}
                                onMouseOut={(e) => e.currentTarget.style.color = 'var(--text-muted)'}
                              >
                                <Eye style={{ width: '16px', height: '16px' }} />
                              </button>

                              <button
                                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '6px', color: 'var(--text-muted)', transition: 'color 0.2s', display: 'flex', alignItems: 'center' }}
                                onClick={(e) => { e.stopPropagation(); handleEditClick(rest); }}
                                title="Edit Branch Details"
                                onMouseOver={(e) => e.currentTarget.style.color = 'var(--text-main)'}
                                onMouseOut={(e) => e.currentTarget.style.color = 'var(--text-muted)'}
                              >
                                <Edit2 style={{ width: '16px', height: '16px' }} />
                              </button>

                              {restaurants.length > 1 && (
                                <button
                                  style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '6px', color: '#ef4444', transition: 'opacity 0.2s', display: 'flex', alignItems: 'center' }}
                                  onClick={(e) => { e.stopPropagation(); handleDeleteRestaurant(rest.id); }}
                                  title="Delete Branch"
                                  onMouseOver={(e) => e.currentTarget.style.opacity = '0.7'}
                                  onMouseOut={(e) => e.currentTarget.style.opacity = '1'}
                                >
                                  <Trash2 style={{ width: '16px', height: '16px' }} />
                                </button>
                              )}
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

          {viewingRestId && (() => {
            const viewedRest = restaurants.find(r => r.id === viewingRestId)
            if (!viewedRest) return null
            return (
              <div className="glass-card animate-fade-in" style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border-color)',
                borderRadius: '16px',
                padding: '32px',
                boxShadow: 'var(--shadow-sm)',
                width: '100%',
                position: 'relative'
              }}>
                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ background: 'var(--primary)', color: '#fff', padding: '4px 8px', borderRadius: '6px', fontSize: '0.65rem', fontWeight: '900' }}>
                      {viewedRest.id}
                    </span>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: '900', color: 'var(--text-main)', margin: 0 }}>
                      {viewedRest.name}
                    </h3>
                  </div>
                  <button
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '4px' }}
                    onClick={() => setViewingRestId(null)}
                  >
                    <X style={{ width: '16px', height: '16px' }} />
                  </button>
                </div>

                {/* Body */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  {/* Photo & Basic Details Banner */}
                  <div style={{ display: 'flex', gap: '16px', alignItems: 'center', background: 'var(--bg-app)', padding: '14px', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                    <div style={{ width: '70px', height: '70px', overflow: 'hidden', borderRadius: '8px', flexShrink: 0, border: '1px solid var(--border-color)' }}>
                      <img
                        src={viewedRest.logo || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=120&auto=format&fit=crop&q=60'}
                        alt={viewedRest.name}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', overflow: 'hidden' }}>
                      <span style={{ fontSize: '0.8rem', color: 'var(--primary)', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.5px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {viewedRest.city || 'Chennai'}, {viewedRest.state || 'Tamil Nadu'}, {viewedRest.country || 'India'}
                      </span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{
                          fontSize: '0.7rem',
                          padding: '3px 8px',
                          borderRadius: '4px',
                          fontWeight: '800',
                          background: viewedRest.status === 'Active' ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)',
                          color: viewedRest.status === 'Active' ? '#10b981' : '#ef4444'
                        }}>
                          STATUS: {viewedRest.status ? viewedRest.status.toUpperCase() : 'ACTIVE'}
                        </span>
                        {viewedRest.id === activeRestaurantId && (
                          <span style={{ fontSize: '0.7rem', background: 'var(--primary)', color: '#fff', padding: '3px 8px', borderRadius: '4px', fontWeight: '800' }}>
                            ACTIVE DIRECTORY ROOT
                          </span>
                        )}
                      </div>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        <MapPin style={{ width: '12px', height: '12px', display: 'inline', marginRight: '4px' }} />{viewedRest.address}
                      </span>
                    </div>
                  </div>

                  {/* Corporate Credentials */}
                  <div style={{ padding: '14px', background: 'var(--bg-app)', border: '1px solid var(--border-color)', borderRadius: '10px' }}>
                    <h4 style={{ margin: '0 0 10px 0', fontSize: '0.75rem', color: 'var(--primary)', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      Corporate Credentials
                    </h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '4px' }}>
                        <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: '600' }}>Owner Name</span>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-main)', fontWeight: '700' }}>{viewedRest.ownerName || 'Rajesh Kumar'}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '4px' }}>
                        <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: '600' }}>Business Name</span>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-main)', fontWeight: '700', maxWidth: '180px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={viewedRest.legalName}>{viewedRest.legalName}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '4px' }}>
                        <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: '600' }}>FSSAI Food License Number</span>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-main)', fontWeight: '700', fontFamily: 'monospace' }}>{viewedRest.license}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '4px' }}>
                        <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: '600' }}>Tax Identification Number (GSTIN)</span>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-main)', fontWeight: '700', fontFamily: 'monospace' }}>{viewedRest.gstin}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: '600' }}>PAN Number</span>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-main)', fontWeight: '700', fontFamily: 'monospace' }}>{viewedRest.pan || 'N/A'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Tariffs & Operating Hours */}
                  <div style={{ padding: '14px', background: 'var(--bg-app)', border: '1px solid var(--border-color)', borderRadius: '10px' }}>
                    <h4 style={{ margin: '0 0 10px 0', fontSize: '0.75rem', color: 'var(--primary)', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      Tariffs & Operating Hours
                    </h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '4px' }}>
                        <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: '600' }}>Accrued GST</span>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-main)', fontWeight: '700' }}>{viewedRest.taxRate}%</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '4px' }}>
                        <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: '600' }}>Service Fee</span>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-main)', fontWeight: '700' }}>{viewedRest.serviceCharge}%</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '4px' }}>
                        <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: '600' }}>Operating Schedule</span>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-main)', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '4px' }}><Clock style={{ width: '12px', height: '12px' }} />{viewedRest.openingTime} - {viewedRest.closingTime}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '4px' }}>
                        <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: '600' }}>Subscription Plan</span>
                        <span style={{ fontSize: '0.75rem', color: 'var(--primary)', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '4px' }}><Gem style={{ width: '12px', height: '12px' }} />{viewedRest.subscriptionPlan || 'Free Plan'}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '4px' }}>
                        <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: '600' }}>Created Date</span>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-main)', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '4px' }}><Calendar style={{ width: '12px', height: '12px' }} />{viewedRest.createdDate || '—'}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: '600' }}>Simulated Base Currency</span>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-main)', fontWeight: '700' }}>
                          {viewedRest.currency === 'INR' ? 'Indian Rupee (₹)' : viewedRest.currency === 'USD' ? 'US Dollar ($)' : 'Euro (€)'}
                        </span>
                      </div>
                      <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'flex-end' }}>
                        <button
                          className="btn-black"
                          style={{ padding: '10px 20px', borderRadius: '8px', cursor: 'pointer', fontWeight: '700' }}
                          onClick={() => setViewingRestId(null)}
                        >
                          Close Showcase
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )
          })()}

          {editingRestId && editFormState && (
            <div className="glass-card animate-fade-in" style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border-color)',
              borderRadius: '16px',
              padding: '32px',
              boxShadow: 'var(--shadow-sm)',
              width: '100%',
              position: 'relative'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', borderBottom: '1px solid var(--border-color)', paddingBottom: '16px' }}>
                <div>
                  <span style={{ fontSize: '0.7rem', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block', letterSpacing: '0.5px' }}>Corporate Directory Root Registry</span>
                  <h3 style={{ margin: '4px 0 0 0', fontSize: '1.25rem', fontWeight: '900', color: 'var(--text-main)' }}>Modify Branch Profile: {editingRestId}</h3>
                </div>
                <button
                  className="btn-outline"
                  style={{ padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: '700' }}
                  onClick={() => setEditingRestId(null)}
                >
                  Back to Registry
                </button>
              </div>

              <form onSubmit={handleUpdateRestaurantSubmit} noValidate style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <ValidatedInput
                    label="Tenant"
                    type="text"
                    value={editFormState.name}
                    onChange={(e) => setEditFormState({ ...editFormState, name: e.target.value })}
                    required
                    error={formErrors.name}
                    setError={(val) => setFormErrors({ ...formErrors, name: val })}
                  />
                  <ValidatedInput
                    label="Business Name"
                    type="text"
                    value={editFormState.legalName}
                    onChange={(e) => setEditFormState({ ...editFormState, legalName: e.target.value })}
                    required
                    error={formErrors.legalName}
                    setError={(val) => setFormErrors({ ...formErrors, legalName: val })}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <ValidatedInput
                    label="Owner Name"
                    type="text"
                    value={editFormState.ownerName}
                    onChange={(e) => setEditFormState({ ...editFormState, ownerName: e.target.value })}
                    required
                    error={formErrors.ownerName}
                    setError={(val) => setFormErrors({ ...formErrors, ownerName: val })}
                  />
                  <ValidatedInput
                    label="Mobile Number"
                    type="text"
                    value={editFormState.mobileNumber}
                    onChange={(e) => setEditFormState({ ...editFormState, mobileNumber: e.target.value, phone: e.target.value })}
                    required
                    error={formErrors.mobileNumber}
                    setError={(val) => setFormErrors({ ...formErrors, mobileNumber: val })}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <ValidatedInput
                    label="Email"
                    type="email"
                    value={editFormState.email}
                    onChange={(e) => setEditFormState({ ...editFormState, email: e.target.value })}
                    required
                    error={formErrors.email}
                    setError={(val) => setFormErrors({ ...formErrors, email: val })}
                  />
                  <ValidatedInput
                    label="Website Domain"
                    type="text"
                    value={editFormState.website || ''}
                    onChange={(e) => setEditFormState({ ...editFormState, website: e.target.value })}
                    error={formErrors.website}
                    setError={(val) => setFormErrors({ ...formErrors, website: val })}
                  />
                </div>

                <ValidatedInput
                  label="Registered Location Address"
                  type="text"
                  value={editFormState.address}
                  onChange={(e) => setEditFormState({ ...editFormState, address: e.target.value })}
                  required
                  error={formErrors.address}
                  setError={(val) => setFormErrors({ ...formErrors, address: val })}
                />

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
                  <ValidatedInput
                    label="City"
                    type="text"
                    value={editFormState.city}
                    onChange={(e) => setEditFormState({ ...editFormState, city: e.target.value, branch: `${e.target.value}` })}
                    required
                    error={formErrors.city}
                    setError={(val) => setFormErrors({ ...formErrors, city: val })}
                  />
                  <ValidatedInput
                    label="State"
                    type="text"
                    value={editFormState.state}
                    onChange={(e) => setEditFormState({ ...editFormState, state: e.target.value })}
                    required
                    error={formErrors.state}
                    setError={(val) => setFormErrors({ ...formErrors, state: val })}
                  />
                  <ValidatedInput
                    label="Country"
                    type="text"
                    value={editFormState.country}
                    onChange={(e) => setEditFormState({ ...editFormState, country: e.target.value })}
                    required
                    error={formErrors.country}
                    setError={(val) => setFormErrors({ ...formErrors, country: val })}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
                  <ValidatedInput
                    label="FSSAI License Number"
                    type="text"
                    value={editFormState.license}
                    onChange={(e) => setEditFormState({ ...editFormState, license: e.target.value })}
                    required
                    error={formErrors.license}
                    setError={(val) => setFormErrors({ ...formErrors, license: val })}
                  />
                  <ValidatedInput
                    label="GSTIN Number"
                    type="text"
                    value={editFormState.gstin}
                    onChange={(e) => setEditFormState({ ...editFormState, gstin: e.target.value })}
                    required
                    error={formErrors.gstin}
                    setError={(val) => setFormErrors({ ...formErrors, gstin: val })}
                  />
                  <ValidatedInput
                    label="PAN Number"
                    type="text"
                    value={editFormState.pan}
                    onChange={(e) => setEditFormState({ ...editFormState, pan: e.target.value })}
                    required
                    error={formErrors.pan}
                    setError={(val) => setFormErrors({ ...formErrors, pan: val })}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <ValidatedInput
                    label="Opening Time"
                    type="text"
                    value={editFormState.openingTime}
                    onChange={(e) => setEditFormState({ ...editFormState, openingTime: e.target.value })}
                    required
                    error={formErrors.openingTime}
                    setError={(val) => setFormErrors({ ...formErrors, openingTime: val })}
                  />
                  <ValidatedInput
                    label="Closing Time"
                    type="text"
                    value={editFormState.closingTime}
                    onChange={(e) => setEditFormState({ ...editFormState, closingTime: e.target.value })}
                    required
                    error={formErrors.closingTime}
                    setError={(val) => setFormErrors({ ...formErrors, closingTime: val })}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
                  <ValidatedInput
                    label="Tax Rate (%)"
                    type="number"
                    value={editFormState.taxRate}
                    onChange={(e) => setEditFormState({ ...editFormState, taxRate: parseFloat(e.target.value) || 0 })}
                    min="0" max="30" step="0.5" required
                    error={formErrors.taxRate}
                    setError={(val) => setFormErrors({ ...formErrors, taxRate: val })}
                  />
                  <ValidatedInput
                    label="Service Fee (%)"
                    type="number"
                    value={editFormState.serviceCharge}
                    onChange={(e) => setEditFormState({ ...editFormState, serviceCharge: parseFloat(e.target.value) || 0 })}
                    min="0" max="20" step="0.5" required
                    error={formErrors.serviceCharge}
                    setError={(val) => setFormErrors({ ...formErrors, serviceCharge: val })}
                  />
                  <ValidatedSelect
                    label="Status"
                    value={editFormState.status}
                    onChange={(e) => setEditFormState({ ...editFormState, status: e.target.value })}
                    error={formErrors.status}
                    setError={(val) => setFormErrors({ ...formErrors, status: val })}
                  >
                    <option value="Active">Active</option>
                    <option value="Suspended">Suspended</option>
                    <option value="Inactive">Inactive</option>
                  </ValidatedSelect>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <ValidatedInput
                    label="Restaurant Logo URL"
                    type="text"
                    value={editFormState.logo || ''}
                    onChange={(e) => setEditFormState({ ...editFormState, logo: e.target.value })}
                    placeholder="https://images.unsplash.com/... (Logo)"
                    error={formErrors.logo}
                    setError={(val) => setFormErrors({ ...formErrors, logo: val })}
                  />
                  <ValidatedInput
                    label="Restaurant Banner URL"
                    type="text"
                    value={editFormState.banner || ''}
                    onChange={(e) => setEditFormState({ ...editFormState, banner: e.target.value })}
                    placeholder="https://images.unsplash.com/... (Banner)"
                    error={formErrors.banner}
                    setError={(val) => setFormErrors({ ...formErrors, banner: val })}
                  />
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '32px', paddingTop: '24px', borderTop: '1px solid var(--border-color)' }}>
                  <button type="button" className="btn-outline" onClick={() => setEditingRestId(null)} style={{ padding: '10px 24px', fontWeight: '600', borderRadius: '8px', cursor: 'pointer', background: '#ffffff', color: '#64748b', border: '1px solid #cbd5e1' }}>Cancel</button>
                  <button type="submit" className="btn-black" style={{ padding: '10px 24px', fontWeight: '600', borderRadius: '8px', cursor: 'pointer', background: '#000000', color: '#ffffff', border: 'none' }}>Save Changes</button>
                </div>
              </form>
            </div>
          )}

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
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: '600' }}>Plan Name</span>
                <span style={{
                  fontSize: '0.8rem',
                  fontWeight: '800',
                  padding: '3px 8px',
                  borderRadius: '4px',
                  background: viewingSubscriptionRest.subscriptionPlan?.includes('Premium') ? 'rgba(59, 130, 246, 0.1)' : 'rgba(16, 185, 129, 0.1)',
                  color: viewingSubscriptionRest.subscriptionPlan?.includes('Premium') ? '#3b82f6' : '#10b981'
                }}>
                  {viewingSubscriptionRest.subscriptionPlan || 'Standard Plan'}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '10px' }}>
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
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '10px' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: '600' }}>Expiry Date</span>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-main)', fontWeight: '700', fontFamily: 'monospace' }}>
                  {viewingSubscriptionRest.expiryDate || 'N/A'}
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
    </div>
  )
}
