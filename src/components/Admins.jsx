import React, { useState, useEffect } from 'react'
import {
  Plus,
  Key,
  Unlock,
  Lock,
  Edit2,
  Trash2,
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

export default function Admins({
  restaurants = [],
  restaurantAdmins = [],
  onUpdateRestaurantAdmins,
  showToast,
  setConfirmModal
}) {
  const [showAddAdminModal, setShowAddAdminModal] = useState(false)
  const [editingAdminId, setEditingAdminId] = useState(null)
  const [resettingPasswordAdminId, setResettingPasswordAdminId] = useState(null)
  const [passwordResetValue, setPasswordResetValue] = useState('')
  const [passwordConfirmValue, setPasswordConfirmValue] = useState('')
  const [formErrors, setFormErrors] = useState({})

  const [adminFormState, setAdminFormState] = useState({
    name: '',
    email: '',
    phone: '',
    restaurantName: '',
    role: 'Branch Admin',
    status: 'Active',
    password: ''
  })

  // Synchronize new admin initial restaurant assign
  useEffect(() => {
    if (restaurants.length > 0 && !adminFormState.restaurantName) {
      setAdminFormState(prev => ({ ...prev, restaurantName: restaurants[0].name }))
    }
  }, [restaurants, adminFormState.restaurantName])

  const handleCreateAdminSubmit = (e) => {
    e.preventDefault()

    const errors = {}
    const requiredFields = {
      name: 'Full Name',
      email: 'Email Address',
      phone: 'Mobile Number',
      role: 'System Role',
    }

    for (const [field, label] of Object.entries(requiredFields)) {
      if (!adminFormState[field] || String(adminFormState[field]).trim() === '') {
        errors[field] = `${label} is Required`
      }
    }

    if (!adminFormState.password || String(adminFormState.password).trim() === '') {
      errors.password = "Temporary Password is Required"
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors)
      return
    }

    setFormErrors({})

    const nextIdNum = restaurantAdmins.length > 0
      ? Math.max(...restaurantAdmins.map(a => parseInt(a.id.replace('ADM-', '')) || 0)) + 1
      : 1
    const newId = `ADM-${String(nextIdNum).padStart(2, '0')}`

    const newAdmin = {
      id: newId,
      name: adminFormState.name,
      email: adminFormState.email,
      phone: adminFormState.phone,
      restaurantName: adminFormState.restaurantName || restaurants[0]?.name || 'Serviq Grand Bistro',
      role: adminFormState.role,
      status: adminFormState.status,
      lastLogin: 'Never logged in',
      password: adminFormState.password || 'Serviq@123'
    }

    onUpdateRestaurantAdmins([...restaurantAdmins, newAdmin])
    setShowAddAdminModal(false)
    showToast('success', `User account "${newAdmin.name}" registered successfully!`)

    setAdminFormState({
      name: '',
      email: '',
      phone: '',
      restaurantName: restaurants[0]?.name || '',
      role: 'Branch Admin',
      status: 'Active',
      password: ''
    })
  }

  const handleEditAdminClick = (admin) => {
    setEditingAdminId(admin.id)
    setAdminFormState({
      name: admin.name,
      email: admin.email,
      phone: admin.phone,
      restaurantName: admin.restaurantName,
      role: admin.role,
      status: admin.status,
      password: ''
    })
  }

  const handleUpdateAdminSubmit = (e) => {
    e.preventDefault()

    const errors = {}
    const requiredFields = {
      name: 'Full Name',
      email: 'Email Address',
      phone: 'Mobile Number',
      role: 'System Role',
    }

    for (const [field, label] of Object.entries(requiredFields)) {
      if (!adminFormState[field] || String(adminFormState[field]).trim() === '') {
        errors[field] = `${label} is Required`
      }
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors)
      return
    }

    setFormErrors({})

    const updated = restaurantAdmins.map(a => a.id === editingAdminId ? {
      ...a,
      name: adminFormState.name,
      email: adminFormState.email,
      phone: adminFormState.phone,
      restaurantName: adminFormState.restaurantName,
      role: adminFormState.role,
      status: adminFormState.status
    } : a)
    onUpdateRestaurantAdmins(updated)
    setEditingAdminId(null)
    showToast('success', `User profile for "${adminFormState.name}" updated successfully!`)
  }

  const handleResetPasswordSubmit = (e) => {
    e.preventDefault()

    const errors = {}

    if (!passwordResetValue || String(passwordResetValue).trim() === '') {
      errors.passwordResetValue = "New Password is Required"
    }

    if (!passwordConfirmValue || String(passwordConfirmValue).trim() === '') {
      errors.passwordConfirmValue = "Confirm Password is Required"
    }

    if (passwordResetValue !== passwordConfirmValue) {
      errors.passwordConfirmValue = 'Passwords do not match'
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors)
      return
    }

    setFormErrors({})

    const updated = restaurantAdmins.map(a => a.id === resettingPasswordAdminId ? {
      ...a,
      password: passwordResetValue
    } : a)
    onUpdateRestaurantAdmins(updated)
    setResettingPasswordAdminId(null)
    setPasswordResetValue('')
    setPasswordConfirmValue('')
    showToast('success', 'User security password successfully updated!')
  }

  const handleToggleAdminStatus = (adminId) => {
    const target = restaurantAdmins.find(a => a.id === adminId)
    if (!target) return
    const nextStatus = target.status === 'Active' ? 'Disabled' : 'Active'
    const updated = restaurantAdmins.map(a => a.id === adminId ? { ...a, status: nextStatus } : a)
    onUpdateRestaurantAdmins(updated)
    showToast('info', `User "${target.name}" status changed to ${nextStatus.toUpperCase()}`)
  }

  const handleDeleteAdmin = (adminId) => {
    const target = restaurantAdmins.find(a => a.id === adminId)
    if (!target) return
    setConfirmModal({
      title: "Delete User Account",
      message: `Are you sure you want to permanently delete the user profile for "${target.name}"? This action cannot be undone.`,
      confirmText: "Confirm Delete",
      confirmColor: "#ef4444",
      onConfirm: () => {
        onUpdateRestaurantAdmins(restaurantAdmins.filter(a => a.id !== adminId))
        showToast('error', `User account "${target.name}" deleted.`)
      }
    })
  }

  return (
    <div style={{ width: '100%' }}>
      {showAddAdminModal ? (
        <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border-color)',
            borderRadius: '16px',
            padding: '32px',
            boxShadow: 'var(--shadow-sm)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', borderBottom: '1px solid var(--border-color)', paddingBottom: '16px' }}>
              <div>
                <span style={{ fontSize: '0.7rem', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block', letterSpacing: '0.5px' }}></span>
                <h3 style={{ margin: '4px 0 0 0', fontSize: '1.25rem', fontWeight: '900', color: 'var(--text-main)' }}>Create New Restaurant User</h3>
              </div>
              <button
                className="btn-outline"
                style={{ padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: '700' }}
                onClick={() => setShowAddAdminModal(false)}
              >
                Back to Users
              </button>
            </div>

            <form onSubmit={handleCreateAdminSubmit} noValidate style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <ValidatedInput
                label="Full Name"
                type="text"
                value={adminFormState.name}
                onChange={(e) => setAdminFormState({ ...adminFormState, name: e.target.value })}
                placeholder="e.g. Ramesh Kumar"
                required
                error={formErrors.name}
                setError={(val) => setFormErrors({ ...formErrors, name: val })}
              />

              <ValidatedInput
                label="Email Address"
                type="email"
                value={adminFormState.email}
                onChange={(e) => setAdminFormState({ ...adminFormState, email: e.target.value })}
                placeholder="e.g. ramesh@serviq.com"
                required
                error={formErrors.email}
                setError={(val) => setFormErrors({ ...formErrors, email: val })}
              />

              <ValidatedInput
                label="Phone Number"
                type="text"
                value={adminFormState.phone}
                onChange={(e) => setAdminFormState({ ...adminFormState, phone: e.target.value })}
                placeholder="e.g. +91 98765 43210"
                required
                error={formErrors.phone}
                setError={(val) => setFormErrors({ ...formErrors, phone: val })}
              />

              <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '12px' }}>
                <ValidatedSelect
                  label="Access Role"
                  value={adminFormState.role}
                  onChange={(e) => setAdminFormState({ ...adminFormState, role: e.target.value })}
                  required
                  error={formErrors.role}
                  setError={(val) => setFormErrors({ ...formErrors, role: val })}
                >
                  <option value="Branch Admin">Branch Admin</option>
                  <option value="Branch Manager">Branch Manager</option>
                  <option value="Super Admin">Super Admin</option>
                </ValidatedSelect>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <ValidatedSelect
                  label="Account Status"
                  value={adminFormState.status}
                  onChange={(e) => setAdminFormState({ ...adminFormState, status: e.target.value })}
                  required
                  error={formErrors.status}
                  setError={(val) => setFormErrors({ ...formErrors, status: val })}
                >
                  <option value="Active">Active</option>
                  <option value="Disabled">Disabled</option>
                </ValidatedSelect>
                <ValidatedInput
                  label="Security Password"
                  type="password"
                  value={adminFormState.password}
                  onChange={(e) => setAdminFormState({ ...adminFormState, password: e.target.value })}
                  placeholder="Default: Serviq@123"
                  error={formErrors.password}
                  setError={(val) => setFormErrors({ ...formErrors, password: val })}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '20px' }}>
                <button type="button" onClick={() => setShowAddAdminModal(false)} style={{ padding: '10px 24px', fontWeight: '600', borderRadius: '8px', cursor: 'pointer', background: '#ffffff', color: '#64748b', border: '1px solid #cbd5e1' }}>Cancel</button>
                <button type="submit" style={{ padding: '10px 24px', fontWeight: '600', borderRadius: '8px', cursor: 'pointer', background: '#000000', color: '#ffffff', border: 'none' }}>Create Account</button>
              </div>
            </form>
          </div>
        </div>
      ) : editingAdminId ? (
        <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border-color)',
            borderRadius: '16px',
            padding: '32px',
            boxShadow: 'var(--shadow-sm)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', borderBottom: '1px solid var(--border-color)', paddingBottom: '16px' }}>
              <div>
                <span style={{ fontSize: '0.7rem', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block', letterSpacing: '0.5px' }}>Branch Security & Credentials</span>
                <h3 style={{ margin: '4px 0 0 0', fontSize: '1.25rem', fontWeight: '900', color: 'var(--text-main)' }}>Edit User Profile: {editingAdminId}</h3>
              </div>
              <button
                className="btn-outline"
                style={{ padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: '700' }}
                onClick={() => setEditingAdminId(null)}
              >
                Back to Users
              </button>
            </div>

            <form onSubmit={handleUpdateAdminSubmit} noValidate style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <ValidatedInput
                label="Full Name"
                type="text"
                value={adminFormState.name}
                onChange={(e) => setAdminFormState({ ...adminFormState, name: e.target.value })}
                placeholder="e.g. Ramesh Kumar"
                required
                error={formErrors.name}
                setError={(val) => setFormErrors({ ...formErrors, name: val })}
              />

              <ValidatedInput
                label="Email Address"
                type="email"
                value={adminFormState.email}
                onChange={(e) => setAdminFormState({ ...adminFormState, email: e.target.value })}
                placeholder="e.g. ramesh@serviq.com"
                required
                error={formErrors.email}
                setError={(val) => setFormErrors({ ...formErrors, email: val })}
              />

              <ValidatedInput
                label="Phone Number"
                type="text"
                value={adminFormState.phone}
                onChange={(e) => setAdminFormState({ ...adminFormState, phone: e.target.value })}
                placeholder="e.g. +91 98765 43210"
                required
                error={formErrors.phone}
                setError={(val) => setFormErrors({ ...formErrors, phone: val })}
              />

              <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '12px' }}>
                <ValidatedSelect
                  label="Access Role"
                  value={adminFormState.role}
                  onChange={(e) => setAdminFormState({ ...adminFormState, role: e.target.value })}
                  required
                  error={formErrors.role}
                  setError={(val) => setFormErrors({ ...formErrors, role: val })}
                >
                  <option value="Branch Admin">Branch Admin</option>
                  <option value="Branch Manager">Branch Manager</option>
                  <option value="Super Admin">Super Admin</option>
                </ValidatedSelect>
              </div>

              <ValidatedSelect
                label="Account Status"
                value={adminFormState.status}
                onChange={(e) => setAdminFormState({ ...adminFormState, status: e.target.value })}
                required
                error={formErrors.status}
                setError={(val) => setFormErrors({ ...formErrors, status: val })}
              >
                <option value="Active">Active</option>
                <option value="Disabled">Disabled</option>
              </ValidatedSelect>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '20px' }}>
                <button type="button" onClick={() => setEditingAdminId(null)} style={{ padding: '10px 24px', fontWeight: '600', borderRadius: '8px', cursor: 'pointer', background: '#ffffff', color: '#64748b', border: '1px solid #cbd5e1' }}>Cancel</button>
                <button type="submit" style={{ padding: '10px 24px', fontWeight: '600', borderRadius: '8px', cursor: 'pointer', background: '#000000', color: '#ffffff', border: 'none' }}>Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      ) : (
        <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px', minWidth: 0 }}>

          {/* Header / Top Control Panel */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', background: 'var(--bg-card)', padding: '24px', borderRadius: '16px', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-sm)', minWidth: 0 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <span style={{ fontSize: '0.7rem', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block', letterSpacing: '0.5px' }}></span>
                <h3 style={{ margin: '4px 0 0 0', fontSize: '1.2rem', fontWeight: '900', color: 'var(--text-main)' }}>Users List</h3>
              </div>
              <button
                onClick={() => {
                  setShowAddAdminModal(true)
                  setAdminFormState({
                    name: '',
                    email: '',
                    phone: '',
                    restaurantName: restaurants[0]?.name || '',
                    role: 'Branch Admin',
                    status: 'Active',
                    password: ''
                  })
                }}
                className="btn-black"
                style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer' }}
              >
                <Plus style={{ width: '16px', height: '16px' }} /> Create User
              </button>
            </div>

            {/* Data Table */}
            <div className="dish-admin-list" style={{ overflowX: 'auto', background: 'var(--bg-app)', borderRadius: '12px', border: '1px solid var(--border-color)', position: 'relative' }}>
              <table className="menu-data-table">
                <thead>
                  <tr>
                    <th style={{ position: 'sticky', top: 0, zIndex: 10, background: 'var(--bg-app)', borderBottom: '1px solid var(--border-color)', textAlign: 'left', padding: '12px 24px', fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '800', whiteSpace: 'nowrap', width: '60px' }}>S.No.</th>
                    <th style={{ position: 'sticky', top: 0, zIndex: 10, background: 'var(--bg-app)', borderBottom: '1px solid var(--border-color)', textAlign: 'left', padding: '12px 18px', fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '800', whiteSpace: 'nowrap' }}>User ID</th>
                    <th style={{ position: 'sticky', top: 0, zIndex: 10, background: 'var(--bg-app)', borderBottom: '1px solid var(--border-color)', textAlign: 'left', padding: '12px 18px', fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '800', whiteSpace: 'nowrap' }}>Name</th>
                    <th style={{ position: 'sticky', top: 0, zIndex: 10, background: 'var(--bg-app)', borderBottom: '1px solid var(--border-color)', textAlign: 'left', padding: '12px 18px', fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '800', whiteSpace: 'nowrap' }}>Email</th>
                    <th style={{ position: 'sticky', top: 0, zIndex: 10, background: 'var(--bg-app)', borderBottom: '1px solid var(--border-color)', textAlign: 'left', padding: '12px 18px', fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '800', whiteSpace: 'nowrap' }}>Phone</th>
                    <th style={{ position: 'sticky', top: 0, zIndex: 10, background: 'var(--bg-app)', borderBottom: '1px solid var(--border-color)', textAlign: 'left', padding: '12px 18px', fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '800', whiteSpace: 'nowrap' }}>Restaurant Name</th>
                    <th style={{ position: 'sticky', top: 0, zIndex: 10, background: 'var(--bg-app)', borderBottom: '1px solid var(--border-color)', textAlign: 'left', padding: '12px 18px', fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '800', whiteSpace: 'nowrap' }}>Role</th>
                    <th style={{ position: 'sticky', top: 0, zIndex: 10, background: 'var(--bg-app)', borderBottom: '1px solid var(--border-color)', textAlign: 'left', padding: '12px 18px', fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '800', whiteSpace: 'nowrap' }}>Status</th>
                    <th style={{ position: 'sticky', top: 0, zIndex: 10, background: 'var(--bg-app)', borderBottom: '1px solid var(--border-color)', textAlign: 'left', padding: '12px 18px', fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '800', whiteSpace: 'nowrap' }}>Last Login Tracker</th>
                    <th style={{ position: 'sticky', top: 0, zIndex: 10, background: 'var(--bg-app)', borderBottom: '1px solid var(--border-color)', textAlign: 'right', padding: '12px 18px', fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '800', whiteSpace: 'nowrap' }}>Operational Control</th>
                  </tr>
                </thead>
                <tbody>
                  {restaurantAdmins.map((admin, idx) => (
                    <tr key={admin.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                      <td style={{ padding: '14px 24px', fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: '700', whiteSpace: 'nowrap' }}>{idx + 1}</td>
                      <td style={{ padding: '14px 18px', fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: '700', whiteSpace: 'nowrap' }}>{admin.id}</td>
                      <td style={{ padding: '14px 18px', fontSize: '0.85rem', fontWeight: '800', color: 'var(--text-main)', whiteSpace: 'nowrap' }}>{admin.name}</td>
                      <td style={{ padding: '14px 18px', fontSize: '0.8rem', color: 'var(--text-main)', fontFamily: 'monospace', whiteSpace: 'nowrap' }}>{admin.email}</td>
                      <td style={{ padding: '14px 18px', fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: '600', whiteSpace: 'nowrap' }}>{admin.phone || 'N/A'}</td>
                      <td style={{ padding: '14px 18px', fontSize: '0.8rem', color: 'var(--text-main)', fontWeight: '700', whiteSpace: 'nowrap' }}>{admin.restaurantName}</td>
                      <td style={{ padding: '14px 18px', whiteSpace: 'nowrap' }}>
                        <span className="badge badge-new" style={{ fontSize: '0.65rem', textTransform: 'uppercase' }}>{admin.role}</span>
                      </td>
                      <td style={{ padding: '14px 18px', whiteSpace: 'nowrap' }}>
                        <span style={{
                          fontSize: '0.7rem',
                          fontWeight: '800',
                          padding: '4px 10px',
                          borderRadius: '6px',
                          background: admin.status === 'Active' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                          color: admin.status === 'Active' ? '#10b981' : '#ef4444',
                          display: 'inline-block',
                          border: admin.status === 'Active' ? '1px solid rgba(16, 185, 129, 0.2)' : '1px solid rgba(239, 68, 68, 0.2)'
                        }}>{admin.status}</span>
                      </td>
                      <td style={{ padding: '14px 18px', fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: '600', whiteSpace: 'nowrap' }}>
                        {admin.lastLogin}
                      </td>
                      <td style={{ padding: '14px 18px', textAlign: 'right' }}>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', alignItems: 'center' }}>
                          <button
                            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '6px', color: 'var(--primary)', transition: 'color 0.2s', display: 'flex', alignItems: 'center' }}
                            onClick={() => setResettingPasswordAdminId(admin.id)}
                            title="Reset Password"
                          >
                            <Key style={{ width: '16px', height: '16px' }} />
                          </button>
                          <button
                            style={{
                              background: 'none',
                              border: 'none',
                              cursor: 'pointer',
                              padding: '6px',
                              color: admin.status === 'Active' ? '#10b981' : '#ef4444',
                              transition: 'opacity 0.2s',
                              display: 'flex',
                              alignItems: 'center'
                            }}
                            onClick={() => handleToggleAdminStatus(admin.id)}
                            title={admin.status === 'Active' ? "Disable Account" : "Enable Account"}
                          >
                            {admin.status === 'Active' ? (
                              <Unlock style={{ width: '16px', height: '16px' }} />
                            ) : (
                              <Lock style={{ width: '16px', height: '16px' }} />
                            )}
                          </button>
                          <button
                            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '6px', color: 'var(--text-muted)', transition: 'color 0.2s', display: 'flex', alignItems: 'center' }}
                            onClick={() => handleEditAdminClick(admin)}
                            title="Edit Admin"
                          >
                            <Edit2 style={{ width: '16px', height: '16px' }} />
                          </button>
                          <button
                            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '6px', color: '#ef4444', transition: 'opacity 0.2s', display: 'flex', alignItems: 'center' }}
                            onClick={() => handleDeleteAdmin(admin.id)}
                            title="Delete Admin"
                          >
                            <Trash2 style={{ width: '16px', height: '16px' }} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Dynamic Reset Password Modal Overlay */}
      {resettingPasswordAdminId && (
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
        }} onClick={() => { setResettingPasswordAdminId(null); setPasswordResetValue(''); setPasswordConfirmValue(''); }}>
          <div className="menu-edit-panel animate-fade-in" style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border-color)',
            borderRadius: '16px',
            padding: '32px',
            width: '90%',
            maxWidth: '400px',
            boxShadow: 'var(--shadow-lg)',
            position: 'relative',
            top: 'auto'
          }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '1.05rem', fontWeight: '800', color: 'var(--text-main)', margin: 0 }}>
                Reset Security Password
              </h3>
              <button
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '4px' }}
                onClick={() => { setResettingPasswordAdminId(null); setPasswordResetValue(''); setPasswordConfirmValue(''); }}
              >
                <X style={{ width: '16px', height: '16px' }} />
              </button>
            </div>

            <form onSubmit={handleResetPasswordSubmit} noValidate style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ padding: '12px', background: 'var(--primary-light)', border: '1px solid var(--border-color)', borderRadius: '8px', fontSize: '0.75rem', color: 'var(--primary)', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Key style={{ width: '14px', height: '14px', flexShrink: 0 }} /> Updating password credentials for User Account ID: {resettingPasswordAdminId}
              </div>

              <ValidatedInput
                label="New Secret Password"
                type="password"
                value={passwordResetValue}
                onChange={(e) => setPasswordResetValue(e.target.value)}
                placeholder="Enter new strong password"
                required
                error={formErrors.passwordResetValue}
                setError={(val) => setFormErrors({ ...formErrors, passwordResetValue: val })}
              />

              <ValidatedInput
                label="Confirm Secret Password"
                type="password"
                value={passwordConfirmValue}
                onChange={(e) => setPasswordConfirmValue(e.target.value)}
                placeholder="Confirm new secret password"
                required
                error={formErrors.passwordConfirmValue}
                setError={(val) => setFormErrors({ ...formErrors, passwordConfirmValue: val })}
              />

              <div style={{ display: 'flex', gap: '10px', marginTop: '14px' }}>
                <button type="submit" className="btn-black" style={{ flex: 1, padding: '10px 24px', fontWeight: '600', borderRadius: '8px', cursor: 'pointer', background: '#000000', color: '#ffffff', border: 'none' }}>Update Password</button>
                <button type="button" className="btn-outline" onClick={() => { setResettingPasswordAdminId(null); setPasswordResetValue(''); setPasswordConfirmValue(''); }} style={{ flex: 1, padding: '10px 24px', fontWeight: '600', borderRadius: '8px', cursor: 'pointer', background: '#ffffff', color: '#64748b', border: '1px solid #cbd5e1' }}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
