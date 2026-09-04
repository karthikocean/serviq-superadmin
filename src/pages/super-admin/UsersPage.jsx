import React, { useState, useEffect } from 'react'
import {
  Plus,
  Key,
  Unlock,
  Lock,
  Edit2,
  Trash2,
  AlertTriangle,
  X,
  Eye,
  EyeOff
} from 'lucide-react'
import { TableTopControls, TableBottomPagination } from '../../components/common/TablePagination'
import { ValidatedSelect } from '../../components/common/CustomSelect'
import { getManagers, createManager, updateManager, deleteManager } from '../../services/api'
import { useAuth } from '../../contexts/AuthContext'

const ValidatedInput = ({ label, type = 'text', value, onChange, placeholder, required, error, setError, ...rest }) => {
  const [showPassword, setShowPassword] = useState(false)
  const isPassword = type === 'password'
  const inputType = isPassword ? (showPassword ? 'text' : 'password') : type

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', position: 'relative' }}>
      <label style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-main)' }}>
        {label}{required && <span style={{ color: '#ef4444', marginLeft: '2px' }}>*</span>}
      </label>
      <div style={{ position: 'relative', display: 'flex', alignItems: 'center', width: '100%' }}>
        <input
          type={inputType}
          value={value}
          onChange={(e) => {
            onChange(e)
            if (error && setError) setError('')
          }}
          required={required}
          style={{
            width: '100%',
            padding: isPassword ? '9px 40px 9px 12px' : '9px 12px',
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
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            style={{
              position: 'absolute',
              right: '12px',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--text-muted)',
              display: 'flex',
              alignItems: 'center',
              padding: '4px'
            }}
          >
            {showPassword ? (
              <EyeOff style={{ width: '16px', height: '16px' }} />
            ) : (
              <Eye style={{ width: '16px', height: '16px' }} />
            )}
          </button>
        )}
      </div>
      {error && <span style={{ fontSize: '0.7rem', color: '#ef4444', fontWeight: '600' }}>{error}</span>}
    </div>
  )
}



import { useRestaurant } from '../../hooks/useRestaurants'
import { useNotification } from '../../contexts/NotificationContext'
import { useRoles } from '../../hooks/useRoles'

export default function UsersPage() {
  const { restaurants } = useRestaurant()
  const { roles } = useRoles()
  const { showToast } = useNotification()
  const { hasPermission, isSuperOwner } = useAuth()

  const canAdd = isSuperOwner || hasPermission('adminUsers', 'add')
  const canEdit = isSuperOwner || hasPermission('adminUsers', 'edit')
  const canDelete = isSuperOwner || hasPermission('adminUsers', 'delete')

  const [confirmModal, setConfirmModal] = useState(null)
  const [restaurantAdmins, setRestaurantAdmins] = useState([])
  const [loading, setLoading] = useState(true)
  const [showAddAdminModal, setShowAddAdminModal] = useState(false)
  const [editingAdminId, setEditingAdminId] = useState(null)
  const [resettingPasswordAdminId, setResettingPasswordAdminId] = useState(null)
  const [passwordResetValue, setPasswordResetValue] = useState('')
  const [passwordConfirmValue, setPasswordConfirmValue] = useState('')
  const [formErrors, setFormErrors] = useState({})

  // Pagination & Search states
  const [currentPage, setCurrentPage] = useState(0)
  const [entriesPerPage, setEntriesPerPage] = useState(10)
  const [searchTerm, setSearchTerm] = useState('')

  const mapBackendManagerToUI = (m) => ({
    id: m._id,
    name: m.name,
    email: m.email,
    phone: m.phoneNumber || '',
    restaurantName: 'Serviq Grand Bistro',
    role: m.role?.roleName || 'Platform Admin',
    roleId: m.role?._id || m.role || '',
    status: m.isActive ? 'Active' : 'Disabled',
    lastLogin: 'Never logged in'
  })

  const fetchPlatformAdmins = async () => {
    setLoading(true)
    try {
      const res = await getManagers(0, 100)
      if (res.success) {
        const mapped = (res.data.results || res.data || []).map(mapBackendManagerToUI)
        setRestaurantAdmins(mapped)
      }
    } catch (err) {
      console.error(err)
      showToast('error', 'Failed to fetch platform admins.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPlatformAdmins()
  }, [])

  const filteredAdmins = restaurantAdmins.filter(a => {
    const term = searchTerm.toLowerCase()
    return !term ||
      (a.name && a.name.toLowerCase().includes(term)) ||
      (a.email && a.email.toLowerCase().includes(term)) ||
      (a.id && a.id.toLowerCase().includes(term)) ||
      (a.restaurantName && a.restaurantName.toLowerCase().includes(term))
  })

  const paginatedAdmins = filteredAdmins.slice(
    currentPage * entriesPerPage,
    (currentPage + 1) * entriesPerPage
  )

  // Listen for sidebar click reset event to open main module list
  useEffect(() => {
    const handleReset = (e) => {
      if (e.detail?.tab === 'admins' || e.detail?.tab === 'users' || e.detail?.tab === 'all' || !e.detail?.tab) {
        setEditingAdminId(null)
        setShowAddAdminModal(false)
      }
    }
    window.addEventListener('reset_module_view', handleReset)
    return () => window.removeEventListener('reset_module_view', handleReset)
  }, [])

  const [adminFormState, setAdminFormState] = useState({
    name: '',
    email: '',
    phone: '',
    restaurantName: 'Serviq Grand Bistro',
    role: '',
    status: 'Active',
    password: ''
  })

  useEffect(() => {
    if (editingAdminId) {
      const admin = restaurantAdmins.find(a => a.id === editingAdminId)
      if (admin) {
        setAdminFormState({
          name: admin.name || '',
          email: admin.email || '',
          phone: admin.phone || '',
          restaurantName: admin.restaurantName || '',
          role: admin.roleId || '',
          status: admin.status || 'Active',
          password: ''
        })
      }
    }
  }, [editingAdminId, restaurantAdmins])

  useEffect(() => {
    if (restaurants.length > 0 && !adminFormState.restaurantName) {
      setAdminFormState(prev => ({ ...prev, restaurantName: restaurants[0].name }))
    }
  }, [restaurants, adminFormState.restaurantName])

  const handleCreateAdminSubmit = async (e) => {
    e.preventDefault()

    const errors = {}
    const requiredFields = {
      name: 'Full Name',
      email: 'Email Address',
      phone: 'Mobile Number',
      role: 'Access Role',
    }

    for (const [field, label] of Object.entries(requiredFields)) {
      if (!adminFormState[field] || String(adminFormState[field]).trim() === '') {
        errors[field] = `${label} is Required`
      }
    }

    if (!adminFormState.password || String(adminFormState.password).trim() === '') {
      errors.password = "Security Password is Required"
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (adminFormState.email && !emailRegex.test(adminFormState.email)) {
      errors.email = "Please enter a valid email address"
    }

    const phoneRegex = /^\d{10}$/
    if (adminFormState.phone && !phoneRegex.test(adminFormState.phone)) {
      errors.phone = "Phone number must be exactly 10 digits"
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors)
      return
    }

    setFormErrors({})

    const payload = {
      name: adminFormState.name,
      email: adminFormState.email,
      phoneNumber: adminFormState.phone,
      roleId: adminFormState.role,
      password: adminFormState.password,
      canLoginAdmin: adminFormState.status === 'Active'
    }

    try {
      const res = await createManager(payload)
      if (res.success) {
        showToast('success', `Platform admin "${payload.name}" registered successfully!`)
        setShowAddAdminModal(false)
        fetchPlatformAdmins()
        setAdminFormState({
          name: '',
          email: '',
          phone: '',
          restaurantName: 'Serviq Grand Bistro',
          role: '',
          status: 'Active',
          password: ''
        })
      }
    } catch (err) {
      console.error(err)
      showToast('error', err.response?.data?.message || 'Failed to register platform admin.')
    }
  }

  const handleEditAdminClick = (admin) => {
    setEditingAdminId(admin.id)
    setAdminFormState({
      name: admin.name,
      email: admin.email,
      phone: admin.phone,
      restaurantName: admin.restaurantName,
      role: admin.roleId,
      status: admin.status,
      password: ''
    })
  }

  const handleUpdateAdminSubmit = async (e) => {
    e.preventDefault()

    const errors = {}
    const requiredFields = {
      name: 'Full Name',
      email: 'Email Address',
      phone: 'Mobile Number',
      role: 'Access Role',
    }

    for (const [field, label] of Object.entries(requiredFields)) {
      if (!adminFormState[field] || String(adminFormState[field]).trim() === '') {
        errors[field] = `${label} is Required`
      }
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (adminFormState.email && !emailRegex.test(adminFormState.email)) {
      errors.email = "Please enter a valid email address"
    }

    const phoneRegex = /^\d{10}$/
    if (adminFormState.phone && !phoneRegex.test(adminFormState.phone)) {
      errors.phone = "Phone number must be exactly 10 digits"
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors)
      return
    }

    setFormErrors({})

    const payload = {
      name: adminFormState.name,
      email: adminFormState.email,
      phoneNumber: adminFormState.phone,
      roleId: adminFormState.role,
      isActive: adminFormState.status === 'Active',
      canLoginAdmin: adminFormState.status === 'Active'
    }

    try {
      const res = await updateManager(editingAdminId, payload)
      if (res.success) {
        setEditingAdminId(null)
        showToast('success', `Platform admin "${adminFormState.name}" updated successfully!`)
        fetchPlatformAdmins()
      }
    } catch (err) {
      console.error(err)
      showToast('error', err.response?.data?.message || 'Failed to update platform admin.')
    }
  }

  const handleResetPasswordSubmit = async (e) => {
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

    try {
      const res = await updateManager(resettingPasswordAdminId, { password: passwordResetValue })
      if (res && res.success !== false) {
        setResettingPasswordAdminId(null)
        setPasswordResetValue('')
        setPasswordConfirmValue('')
        showToast('success', res.message || 'User security password successfully updated!')
        fetchPlatformAdmins()
      } else {
        showToast('error', res?.message || 'Failed to update password.')
      }
    } catch (err) {
      console.error(err)
      showToast('error', err.response?.data?.message || 'Failed to update password.')
    }
  }

  const handleToggleAdminStatus = async (adminId) => {
    const target = restaurantAdmins.find(a => a.id === adminId)
    if (!target) return
    const nextStatus = target.status === 'Active' ? false : true
    try {
      const res = await updateManager(adminId, { isActive: nextStatus, canLoginAdmin: nextStatus })
      if (res.success) {
        showToast('success', `User status changed successfully!`)
        fetchPlatformAdmins()
      }
    } catch (err) {
      console.error(err)
      showToast('error', 'Failed to change status.')
    }
  }

  const handleDeleteAdmin = (adminId) => {
    const target = restaurantAdmins.find(a => a.id === adminId)
    if (!target) return
    setConfirmModal({
      title: "Delete User Account",
      message: `Are you sure you want to permanently delete the user profile for "${target.name}"? This action cannot be undone.`,
      confirmText: "Confirm Delete",
      confirmColor: "#ef4444",
      onConfirm: async () => {
        try {
          const res = await deleteManager(adminId)
          if (res.success) {
            showToast('error', `User account "${target.name}" deleted.`)
            fetchPlatformAdmins()
          }
        } catch (err) {
          console.error(err)
          showToast('error', 'Failed to delete user account.')
        }
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
                onChange={(e) => {
                  const digits = e.target.value.replace(/\D/g, '').slice(0, 10)
                  setAdminFormState({ ...adminFormState, phone: digits })
                }}
                placeholder="e.g. 9876543210 (10 digits)"
                inputMode="numeric"
                maxLength={10}
                required
                error={formErrors.phone}
                setError={(val) => setFormErrors({ ...formErrors, phone: val })}
              />

              <ValidatedSelect
                label="Access Role"
                value={adminFormState.role}
                onChange={(e) => setAdminFormState({ ...adminFormState, role: e.target.value })}
                required
                error={formErrors.role}
                setError={(val) => setFormErrors({ ...formErrors, role: val })}
              >
                <option value="">Select Access Role</option>
                {roles && roles.filter(r => r.isActive !== false).map(r => (
                  <option key={r._id || r.id} value={r._id}>{r.roleName || r.name}</option>
                ))}
                {!roles?.length && (
                  <>
                    <option value="Branch Admin">Branch Admin</option>
                    <option value="Branch Manager">Branch Manager</option>
                    <option value="Super Admin">Super Admin</option>
                  </>
                )}
              </ValidatedSelect>

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
                placeholder="Enter strong password"
                error={formErrors.password}
                setError={(val) => setFormErrors({ ...formErrors, password: val })}
              />

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
                <h3 style={{ margin: '4px 0 0 0', fontSize: '1.25rem', fontWeight: '900', color: 'var(--text-main)' }}>Edit User Profile</h3>
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
                onChange={(e) => {
                  const digits = e.target.value.replace(/\D/g, '').slice(0, 10)
                  setAdminFormState({ ...adminFormState, phone: digits })
                }}
                placeholder="e.g. 9876543210 (10 digits)"
                inputMode="numeric"
                maxLength={10}
                required
                error={formErrors.phone}
                setError={(val) => setFormErrors({ ...formErrors, phone: val })}
              />

              <ValidatedSelect
                label="Access Role"
                value={adminFormState.role}
                onChange={(e) => setAdminFormState({ ...adminFormState, role: e.target.value })}
                required
                error={formErrors.role}
                setError={(val) => setFormErrors({ ...formErrors, role: val })}
              >
                <option value="">Select Access Role</option>
                {roles && roles.filter(r => r.isActive !== false).map(r => (
                  <option key={r._id || r.id} value={r._id}>{r.roleName || r.name}</option>
                ))}
                {!roles?.length && (
                  <>
                    <option value="Branch Admin">Branch Admin</option>
                    <option value="Branch Manager">Branch Manager</option>
                    <option value="Super Admin">Super Admin</option>
                  </>
                )}
              </ValidatedSelect>

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
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', background: 'var(--bg-card)', padding: '24px', borderRadius: '16px', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-sm)', minWidth: 0 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ margin: '4px 0 0 0', fontSize: '1.2rem', fontWeight: '900', color: 'var(--text-main)' }}>Users List</h3>
              </div>
              {canAdd && (
                <button
                  onClick={() => {
                    setShowAddAdminModal(true)
                    setAdminFormState({
                      name: '',
                      email: '',
                      phone: '',
                      restaurantName: 'Serviq Grand Bistro',
                      role: '',
                      status: 'Active',
                      password: ''
                    })
                  }}
                  className="btn-black"
                  style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer' }}
                >
                  <Plus style={{ width: '16px', height: '16px' }} /> Create User
                </button>
              )}
            </div>

            <TableTopControls
              entriesPerPage={entriesPerPage}
              onEntriesPerPageChange={(num) => { setEntriesPerPage(num); setCurrentPage(0); }}
              searchTerm={searchTerm}
              onSearchChange={(val) => { setSearchTerm(val); setCurrentPage(0); }}
              searchPlaceholder="Search users..."
            />

            <div className="dish-admin-list" style={{ overflowX: 'auto', background: 'var(--bg-app)', borderRadius: '12px', border: '1px solid var(--border-color)', position: 'relative' }}>
              <table className="menu-data-table">
                <thead>
                  <tr>
                    <th style={{ position: 'sticky', top: 0, zIndex: 10, background: 'var(--bg-app)', borderBottom: '1px solid var(--border-color)', textAlign: 'left', padding: '12px 24px', fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '800', whiteSpace: 'nowrap', width: '60px' }}>S.No.</th>
                    <th style={{ position: 'sticky', top: 0, zIndex: 10, background: 'var(--bg-app)', borderBottom: '1px solid var(--border-color)', textAlign: 'left', padding: '12px 18px', fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '800', whiteSpace: 'nowrap' }}>Name</th>
                    <th style={{ position: 'sticky', top: 0, zIndex: 10, background: 'var(--bg-app)', borderBottom: '1px solid var(--border-color)', textAlign: 'left', padding: '12px 18px', fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '800', whiteSpace: 'nowrap' }}>Email</th>
                    <th style={{ position: 'sticky', top: 0, zIndex: 10, background: 'var(--bg-app)', borderBottom: '1px solid var(--border-color)', textAlign: 'left', padding: '12px 18px', fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '800', whiteSpace: 'nowrap' }}>Phone</th>
                    <th style={{ position: 'sticky', top: 0, zIndex: 10, background: 'var(--bg-app)', borderBottom: '1px solid var(--border-color)', textAlign: 'left', padding: '12px 18px', fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '800', whiteSpace: 'nowrap' }}>Role</th>
                    <th style={{ position: 'sticky', top: 0, zIndex: 10, background: 'var(--bg-app)', borderBottom: '1px solid var(--border-color)', textAlign: 'left', padding: '12px 18px', fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '800', whiteSpace: 'nowrap' }}>Status</th>
                    <th style={{ position: 'sticky', top: 0, zIndex: 10, background: 'var(--bg-app)', borderBottom: '1px solid var(--border-color)', textAlign: 'left', padding: '12px 18px', fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '800', whiteSpace: 'nowrap' }}>Last Login</th>
                    <th style={{ position: 'sticky', top: 0, zIndex: 10, background: 'var(--bg-app)', borderBottom: '1px solid var(--border-color)', textAlign: 'right', padding: '12px 18px', fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '800', whiteSpace: 'nowrap' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedAdmins.map((admin, idx) => (
                    <tr key={admin.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                      <td style={{ padding: '14px 24px', fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: '700', whiteSpace: 'nowrap' }}>{currentPage * entriesPerPage + idx + 1}</td>
                      <td style={{ padding: '14px 18px', fontSize: '0.85rem', fontWeight: '800', color: 'var(--text-main)', whiteSpace: 'nowrap' }}>{admin.name}</td>
                      <td style={{ padding: '14px 18px', fontSize: '0.8rem', color: 'var(--text-main)', fontFamily: 'monospace', whiteSpace: 'nowrap' }}>{admin.email}</td>
                      <td style={{ padding: '14px 18px', fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: '600', whiteSpace: 'nowrap' }}>{admin.phone || 'N/A'}</td>
                      <td style={{ padding: '14px 18px', whiteSpace: 'nowrap' }}>
                        <span className="badge badge-new" style={{ fontSize: '0.65rem', textTransform: 'uppercase' }}>{admin.role}</span>
                      </td>
                      <td style={{ padding: '14px 18px', whiteSpace: 'nowrap' }}>
                        <span style={{ fontSize: '0.7rem', fontWeight: '800', padding: '4px 10px', borderRadius: '6px', background: admin.status === 'Active' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)', color: admin.status === 'Active' ? '#10b981' : '#ef4444', display: 'inline-block', border: admin.status === 'Active' ? '1px solid rgba(16, 185, 129, 0.2)' : '1px solid rgba(239, 68, 68, 0.2)' }}>{admin.status}</span>
                      </td>
                      <td style={{ padding: '14px 18px', fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: '600', whiteSpace: 'nowrap' }}>{admin.lastLogin}</td>
                      <td style={{ padding: '14px 18px', textAlign: 'right' }}>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', alignItems: 'center' }}>
                          {canEdit && (
                            <button style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '6px', color: 'var(--primary)' }} onClick={() => setResettingPasswordAdminId(admin.id)} title="Reset Password"><Key style={{ width: '16px', height: '16px' }} /></button>
                          )}
                          {canEdit && (
                            <button style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '6px', color: admin.status === 'Active' ? '#10b981' : '#ef4444' }} onClick={() => handleToggleAdminStatus(admin.id)} title="Toggle Status">{admin.status === 'Active' ? <Unlock style={{ width: '16px', height: '16px' }} /> : <Lock style={{ width: '16px', height: '16px' }} />}</button>
                          )}
                          {canEdit && (
                            <button style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '6px', color: 'var(--text-muted)' }} onClick={() => handleEditAdminClick(admin)} title="Edit"><Edit2 style={{ width: '16px', height: '16px' }} /></button>
                          )}
                          {canDelete && (
                            <button style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '6px', color: '#ef4444' }} onClick={() => handleDeleteAdmin(admin.id)} title="Delete"><Trash2 style={{ width: '16px', height: '16px' }} /></button>
                          )}
                          {!canEdit && !canDelete && (
                            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>-</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <TableBottomPagination totalEntries={filteredAdmins.length} currentPage={currentPage} entriesPerPage={entriesPerPage} onPageChange={setCurrentPage} />
          </div>
        </div>
      )}

      {resettingPasswordAdminId && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(9, 13, 22, 0.45)', backdropFilter: 'blur(8px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 99999, padding: '20px' }} onClick={() => setResettingPasswordAdminId(null)}>
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '16px', padding: '32px', width: '90%', maxWidth: '400px' }} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: '800', margin: '0 0 16px' }}>Reset Security Password</h3>
            <form onSubmit={handleResetPasswordSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <ValidatedInput label="New Password" type="password" value={passwordResetValue} onChange={(e) => setPasswordResetValue(e.target.value)} required error={formErrors.passwordResetValue} setError={(val) => setFormErrors({ ...formErrors, passwordResetValue: val })} />
              <ValidatedInput label="Confirm Password" type="password" value={passwordConfirmValue} onChange={(e) => setPasswordConfirmValue(e.target.value)} required error={formErrors.passwordConfirmValue} setError={(val) => setFormErrors({ ...formErrors, passwordConfirmValue: val })} />
              <div style={{ display: 'flex', gap: '10px', marginTop: '14px' }}>
                <button type="submit" style={{ flex: 1, padding: '10px', fontWeight: '600', borderRadius: '8px', cursor: 'pointer', background: '#000', color: '#fff', border: 'none' }}>Update</button>
                <button type="button" onClick={() => setResettingPasswordAdminId(null)} style={{ flex: 1, padding: '10px', fontWeight: '600', borderRadius: '8px', cursor: 'pointer', background: '#fff', border: '1px solid #cbd5e1' }}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {confirmModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(9, 13, 22, 0.45)', backdropFilter: 'blur(8px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1200, padding: '20px' }} onClick={() => setConfirmModal(null)}>
          <div style={{ background: '#ffffff', borderRadius: '24px', padding: '36px', width: '90%', maxWidth: '420px', textAlign: 'center' }} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ margin: '0 0 10px', fontSize: '1.25rem', fontWeight: '800' }}>{confirmModal.title}</h3>
            <p style={{ margin: '0 0 28px', fontSize: '0.9rem', color: '#64748b' }}>{confirmModal.message}</p>
            <div style={{ display: 'flex', gap: '14px' }}>
              <button onClick={() => setConfirmModal(null)} style={{ flex: 1, padding: '12px', borderRadius: '12px', border: '1.5px solid #cbd5e1', background: '#fff', fontWeight: '700' }}>Cancel</button>
              <button onClick={() => { confirmModal.onConfirm(); setConfirmModal(null); }} style={{ flex: 1, padding: '12px', borderRadius: '12px', border: 'none', background: '#dc2626', color: '#fff', fontWeight: '700' }}>Confirm</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
