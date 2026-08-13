import React, { useState, useEffect } from 'react'
import { Plus, Unlock, Lock, Edit2, Trash2, AlertTriangle } from 'lucide-react'

import { useNotification } from '../../contexts/NotificationContext'

export default function RolesPage() {
  const { showToast } = useNotification()
  const [confirmModal, setConfirmModal] = useState(null)
  const [systemRoles, setSystemRoles] = useState([
    {
      id: 'role-1',
      name: 'Super Admin',
      status: 'Active',
      desc: 'Complete control over all restaurants and billing.',
      perms: {
        dashboard: { view: true, add: true, edit: true, delete: true },
        restaurants: { view: true, add: true, edit: true, delete: true },
        roles: { view: true, add: true, edit: true, delete: true },
        adminUsers: { view: true, add: true, edit: true, delete: true },
        subscriptions: { view: true, add: true, edit: true, delete: true },
        plans: { view: true, add: true, edit: true, delete: true },
        revenue: { view: true, add: true, edit: true, delete: true }
      }
    },
    {
      id: 'role-2',
      name: 'Branch Admin',
      status: 'Active',
      desc: 'Manage specific restaurant branch settings and staff.',
      perms: {
        dashboard: { view: true, add: true, edit: true, delete: true },
        restaurants: { view: true, add: true, edit: true, delete: true },
        roles: { view: true, add: true, edit: true, delete: true },
        adminUsers: { view: true, add: true, edit: true, delete: true },
        subscriptions: { view: true, add: true, edit: true, delete: true },
        plans: { view: true, add: true, edit: true, delete: true },
        revenue: { view: false, add: false, edit: false, delete: false }
      }
    },
    {
      id: 'role-3',
      name: 'Branch Manager',
      status: 'Active',
      desc: 'Oversees day-to-day operations and staff.',
      perms: {
        dashboard: { view: false, add: false, edit: false, delete: false },
        restaurants: { view: false, add: false, edit: false, delete: false },
        roles: { view: true, add: true, edit: true, delete: true },
        adminUsers: { view: true, add: true, edit: true, delete: true },
        subscriptions: { view: true, add: true, edit: true, delete: true },
        plans: { view: true, add: true, edit: true, delete: true },
        revenue: { view: false, add: false, edit: false, delete: false }
      }
    },
    {
      id: 'role-4',
      name: 'Cashier',
      status: 'Active',
      desc: 'Handles billing and payment collections.',
      perms: {
        dashboard: { view: true, add: true, edit: true, delete: true },
        restaurants: { view: false, add: false, edit: false, delete: false },
        roles: { view: false, add: false, edit: false, delete: false },
        adminUsers: { view: false, add: false, edit: false, delete: false },
        subscriptions: { view: false, add: false, edit: false, delete: false },
        plans: { view: false, add: false, edit: false, delete: false },
        revenue: { view: false, add: false, edit: false, delete: false }
      }
    },
    {
      id: 'role-5',
      name: 'Waiter',
      status: 'Active',
      desc: 'Takes orders and serves tables.',
      perms: {
        dashboard: { view: false, add: false, edit: false, delete: false },
        restaurants: { view: false, add: false, edit: false, delete: false },
        roles: { view: false, add: false, edit: false, delete: false },
        adminUsers: { view: true, add: true, edit: true, delete: true },
        subscriptions: { view: true, add: true, edit: true, delete: true },
        plans: { view: true, add: true, edit: true, delete: true },
        revenue: { view: false, add: false, edit: false, delete: false }
      }
    },
    {
      id: 'role-6',
      name: 'Kitchen Staff',
      status: 'Active',
      desc: 'Prepares food and updates order status.',
      perms: {
        dashboard: { view: false, add: false, edit: false, delete: false },
        restaurants: { view: false, add: false, edit: false, delete: false },
        roles: { view: false, add: false, edit: false, delete: false },
        adminUsers: { view: false, add: false, edit: false, delete: false },
        subscriptions: { view: true, add: true, edit: true, delete: true },
        plans: { view: true, add: true, edit: true, delete: true },
        revenue: { view: false, add: false, edit: false, delete: false }
      }
    }
  ])

  const [editingRoleId, setEditingRoleId] = useState(() => {
    return localStorage.getItem('serviq_editingRoleId') || null
  })

  useEffect(() => {
    if (editingRoleId) {
      localStorage.setItem('serviq_editingRoleId', editingRoleId)
    } else {
      localStorage.removeItem('serviq_editingRoleId')
    }
  }, [editingRoleId])

  // Listen for sidebar click reset event to open main module list
  useEffect(() => {
    const handleReset = (e) => {
      if (e.detail?.tab === 'roles') {
        setEditingRoleId(null)
        localStorage.removeItem('serviq_editingRoleId')
      }
    }
    window.addEventListener('reset_module_view', handleReset)
    return () => window.removeEventListener('reset_module_view', handleReset)
  }, [])

  const [roleFormErrors, setRoleFormErrors] = useState({})
  const [roleFormState, setRoleFormState] = useState({
    name: '',
    desc: '',
    status: 'Active',
    perms: {
      dashboard: { view: false, add: false, edit: false, delete: false },
      restaurants: { view: false, add: false, edit: false, delete: false },
      roles: { view: false, add: false, edit: false, delete: false },
      adminUsers: { view: false, add: false, edit: false, delete: false },
      subscriptions: { view: false, add: false, edit: false, delete: false },
      plans: { view: false, add: false, edit: false, delete: false },
      revenue: { view: false, add: false, edit: false, delete: false }
    }
  })

  // Prefill roleFormState when editingRoleId changes or is restored on page refresh
  useEffect(() => {
    if (editingRoleId && editingRoleId !== 'new') {
      const roleToEdit = systemRoles.find(r => r.id === editingRoleId)
      if (roleToEdit) {
        setRoleFormState({ ...roleToEdit })
      }
    }
  }, [editingRoleId, systemRoles])

  const handleSaveRole = (e) => {
    e.preventDefault()

    const errors = {}
    if (!roleFormState.name || !roleFormState.name.trim()) {
      errors.name = 'Role Name is Required'
    }

    if (Object.keys(errors).length > 0) {
      setRoleFormErrors(errors)
      return
    }

    setRoleFormErrors({})

    if (editingRoleId === 'new') {
      const nextIdNum = systemRoles.length > 0 ? Math.max(...systemRoles.map(r => parseInt(r.id.replace('role-', '')) || 0)) + 1 : 1
      const newId = `role-${nextIdNum}`
      setSystemRoles([...systemRoles, { ...roleFormState, id: newId }])
      setEditingRoleId(newId)
      showToast('success', 'Custom Role created successfully!')
    } else {
      setSystemRoles(systemRoles.map(r => r.id === editingRoleId ? { ...roleFormState, id: editingRoleId } : r))
      showToast('success', 'Role updated successfully!')
    }
  }

  const handleDeleteRole = (id) => {
    setConfirmModal({
      title: "Delete Role",
      message: "Are you sure you want to permanently delete this role?",
      confirmText: "Confirm Delete",
      confirmColor: "#ef4444",
      onConfirm: () => {
        setSystemRoles(systemRoles.filter(r => r.id !== id))
        showToast('error', 'Role has been deleted.')
      }
    })
  }

  const handleToggleRoleStatus = (roleId) => {
    const target = systemRoles.find(r => r.id === roleId)
    if (!target) return
    const nextStatus = target.status === 'Active' ? 'Disabled' : 'Active'
    const updated = systemRoles.map(r => r.id === roleId ? { ...r, status: nextStatus } : r)
    setSystemRoles(updated)
    showToast('info', `Role "${target.name}" status changed to ${nextStatus.toUpperCase()}`)
  }

  const handlePermChange = (module, action, checked) => {
    setRoleFormState(prev => ({
      ...prev,
      perms: {
        ...prev.perms,
        [module]: {
          ...prev.perms[module],
          [action]: checked
        }
      }
    }))
  }

  const toggleSelectAll = (action) => {
    const allChecked = ['dashboard', 'restaurants', 'roles', 'adminUsers', 'subscriptions', 'revenue'].every(
      module => roleFormState.perms[module]?.[action]
    )
    const updatedPerms = { ...roleFormState.perms }
    const nextVal = !allChecked
    ;['dashboard', 'restaurants', 'roles', 'adminUsers', 'subscriptions', 'revenue'].forEach(module => {
      updatedPerms[module] = {
        ...updatedPerms[module],
        [action]: nextVal
      }
    })
    setRoleFormState(prev => ({
      ...prev,
      perms: updatedPerms
    }))
  }

  const isAllChecked = (action) => {
    return ['dashboard', 'restaurants', 'roles', 'adminUsers', 'subscriptions', 'revenue'].every(
      module => roleFormState.perms[module]?.[action]
    )
  }

  return editingRoleId ? (
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
            <h3 style={{ margin: '4px 0 0 0', fontSize: '1.4rem', fontWeight: '900', color: 'var(--text-main)' }}>
              {editingRoleId === 'new' ? 'Add New Role' : 'Edit Role & Permissions'}
            </h3>
          </div>
          <button
            className="btn-outline"
            style={{ padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: '700' }}
            onClick={() => setEditingRoleId(null)}
          >
            Back to Roles
          </button>
        </div>

        <form onSubmit={handleSaveRole} noValidate style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
            <div className="form-group">
              <label style={{ fontSize: '0.85rem', fontWeight: '700', color: roleFormErrors.name ? '#dc2626' : '#334155', display: 'block', marginBottom: '6px' }}>
                Role Name <span style={{ color: '#d81b60' }}>*</span>
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type="text"
                  value={roleFormState.name}
                  onChange={(e) => {
                    setRoleFormState({ ...roleFormState, name: e.target.value })
                    if (roleFormErrors.name) setRoleFormErrors({ ...roleFormErrors, name: null })
                  }}
                  placeholder="E.g. Sales Manager"
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    paddingRight: roleFormErrors.name ? '40px' : '16px',
                    border: roleFormErrors.name ? '1px solid #dc2626' : '1px solid #cbd5e1',
                    background: '#ffffff',
                    color: roleFormErrors.name ? '#dc2626' : '#0f172a',
                    borderRadius: '8px',
                    fontSize: '0.9rem',
                    outline: 'none',
                    boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.02)'
                  }}
                />
                {roleFormErrors.name && (
                  <AlertTriangle style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: '#dc2626', width: '18px', height: '18px' }} />
                )}
              </div>
              {roleFormErrors.name && (
                <span style={{ color: '#dc2626', fontSize: '0.75rem', marginTop: '6px', display: 'block' }}>{roleFormErrors.name}</span>
              )}
            </div>

            <div className="form-group">
              <label style={{ fontSize: '0.85rem', fontWeight: '700', color: '#334155', display: 'block', marginBottom: '6px' }}>
                Slug
              </label>
              <input
                type="text"
                value={roleFormState.slug || ''}
                onChange={(e) => setRoleFormState({ ...roleFormState, slug: e.target.value })}
                placeholder="e.g. sales-manager"
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  border: '1px solid #cbd5e1',
                  background: '#ffffff',
                  color: '#0f172a',
                  borderRadius: '8px',
                  fontSize: '0.9rem',
                  outline: 'none',
                  boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.02)'
                }}
              />
            </div>

            <div className="form-group">
              <label style={{ fontSize: '0.85rem', fontWeight: '700', color: '#334155', display: 'block', marginBottom: '6px' }}>
                Role Status
              </label>
              <select
                value={roleFormState.status || 'Active'}
                onChange={(e) => setRoleFormState({ ...roleFormState, status: e.target.value })}
                required
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  border: '1px solid #cbd5e1',
                  background: '#ffffff',
                  color: '#0f172a',
                  borderRadius: '8px',
                  fontSize: '0.9rem',
                  outline: 'none',
                  height: '46px',
                  boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.02)'
                }}
              >
                <option value="Active">Active</option>
                <option value="Disabled">Disabled</option>
              </select>
            </div>
          </div>

          <div style={{ marginTop: '16px' }}>
            <h4 style={{ margin: '0 0 12px 0', fontSize: '0.95rem', color: '#334155', fontWeight: '800' }}>Access Permissions</h4>
            <div style={{ overflowX: 'auto', border: '1px solid #cbd5e1', borderRadius: '12px' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', background: '#ffffff', minWidth: '600px' }}>
                <thead>
                  <tr style={{ background: '#d81b60', color: '#ffffff' }}>
                    <th style={{ padding: '16px 20px', textAlign: 'left', fontWeight: '700', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.5px', borderBottom: 'none' }}>Modules</th>
                    {['view', 'add', 'edit', 'delete'].map(action => (
                      <th key={action} style={{ padding: '16px 20px', textAlign: 'center', fontWeight: '700', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.5px', borderBottom: 'none', width: '100px' }}>
                        <div style={{ marginBottom: '6px' }}>{action}</div>
                        <div
                          onClick={() => toggleSelectAll(action)}
                          style={{
                            width: '18px',
                            height: '18px',
                            borderRadius: '50%',
                            border: '2px solid #ffffff',
                            background: isAllChecked(action) ? '#ffffff' : 'transparent',
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                            margin: '0 auto'
                          }}
                        >
                          {isAllChecked(action) && (
                            <div style={{
                              width: '8px',
                              height: '8px',
                              borderRadius: '50%',
                              background: 'var(--text-main)'
                            }} />
                          )}
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {['dashboard', 'restaurants', 'roles', 'adminUsers', 'subscriptions', 'plans', 'revenue'].map((module, idx) => {
                    const displayNames = {
                      dashboard: 'Dashboard',
                      restaurants: 'Restaurants',
                      roles: 'Roles & Permissions',
                      adminUsers: 'Admin Users',
                      subscriptions: 'Subscriptions',
                      plans: 'Plans',
                      revenue: 'Revenue & Billing'
                    }
                    return (
                      <tr key={module} style={{ borderBottom: idx === 6 ? 'none' : '1px solid #f1f5f9' }}>
                        <td style={{ padding: '16px 20px', fontWeight: '700', color: '#1e293b', fontSize: '0.85rem' }}>
                          {displayNames[module]}
                        </td>
                        {['view', 'add', 'edit', 'delete'].map(action => {
                          const checked = !!roleFormState.perms[module]?.[action]
                          return (
                            <td key={action} style={{ padding: '16px 20px', textAlign: 'center' }}>
                              <div
                                onClick={() => handlePermChange(module, action, !checked)}
                                style={{
                                  width: '18px',
                                  height: '18px',
                                  borderRadius: '50%',
                                  border: `2px solid ${checked ? 'var(--text-main)' : '#cbd5e1'}`,
                                  background: checked ? 'var(--text-main)' : 'transparent',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  cursor: 'pointer',
                                  transition: 'all 0.2s',
                                  margin: '0 auto'
                                }}
                              >
                                {checked && (
                                  <div style={{
                                    width: '6px',
                                    height: '6px',
                                    borderRadius: '50%',
                                    background: '#ffffff'
                                  }} />
                                )}
                              </div>
                            </td>
                          )
                        })}
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '32px', paddingTop: '24px', borderTop: '1px solid var(--border-color)' }}>
            <button type="button" className="btn-outline" onClick={() => setEditingRoleId(null)} style={{ padding: '10px 24px', fontWeight: '600', borderRadius: '8px', cursor: 'pointer', background: '#ffffff', color: '#64748b', border: '1px solid #cbd5e1' }}>Cancel</button>
            <button type="submit" className="btn-black" style={{ padding: '10px 24px', fontWeight: '600', borderRadius: '8px', cursor: 'pointer', background: '#000000', color: '#ffffff', border: 'none' }}>{editingRoleId === 'new' ? 'Create Role' : 'Save Changes'}</button>
          </div>
        </form>
      </div>
    </div>
  ) : (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px', minWidth: 0 }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', background: 'var(--bg-card)', padding: '24px', borderRadius: '16px', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-sm)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h3 style={{ margin: '4px 0 0 0', fontSize: '1.2rem', fontWeight: '900', color: 'var(--text-main)' }}>Roles & Permissions</h3>
          </div>
          <button
            onClick={() => {
              setEditingRoleId('new')
              setRoleFormErrors({})
              setRoleFormState({
                name: '',
                desc: '',
                status: 'Active',
                perms: {
                  dashboard: { view: false, add: false, edit: false, delete: false },
                  restaurants: { view: false, add: false, edit: false, delete: false },
                  roles: { view: false, add: false, edit: false, delete: false },
                  adminUsers: { view: false, add: false, edit: false, delete: false },
                  subscriptions: { view: false, add: false, edit: false, delete: false },
                  revenue: { view: false, add: false, edit: false, delete: false }
                }
              })
            }}
            className="btn-black"
            style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer' }}
          >
            <Plus style={{ width: '16px', height: '16px' }} /> Add Custom Role
          </button>
        </div>

        <div style={{ overflowX: 'auto', background: 'var(--bg-app)', borderRadius: '12px', border: '1px solid var(--border-color)', position: 'relative' }}>
          <table className="menu-data-table" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr>
                <th style={{ padding: '12px 18px', fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '800', borderBottom: '1px solid var(--border-color)', width: '60px' }}>S.No</th>
                <th style={{ padding: '12px 18px', fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '800', borderBottom: '1px solid var(--border-color)' }}>Role Name</th>
                <th style={{ padding: '12px 18px', fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '800', borderBottom: '1px solid var(--border-color)' }}>Status</th>
                <th style={{ padding: '12px 18px', fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '800', borderBottom: '1px solid var(--border-color)', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {systemRoles.map((role, index) => (
                <tr key={role.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                  <td style={{ padding: '14px 18px', fontWeight: '600', color: 'var(--text-muted)' }}>{index + 1}</td>
                  <td style={{ padding: '14px 18px', fontWeight: '800', color: 'var(--text-main)' }}>{role.name}</td>
                  <td style={{ padding: '14px 18px', whiteSpace: 'nowrap' }}>
                    <span style={{
                      fontSize: '0.7rem',
                      fontWeight: '800',
                      padding: '4px 10px',
                      borderRadius: '6px',
                      background: (role.status || 'Active') === 'Active' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                      color: (role.status || 'Active') === 'Active' ? '#10b981' : '#ef4444',
                      display: 'inline-block',
                      border: (role.status || 'Active') === 'Active' ? '1px solid rgba(16, 185, 129, 0.2)' : '1px solid rgba(239, 68, 68, 0.2)'
                    }}>{role.status || 'Active'}</span>
                  </td>
                  <td style={{ padding: '14px 18px', textAlign: 'right' }}>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', alignItems: 'center' }}>
                      <button
                        style={{
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          padding: '6px',
                          color: (role.status || 'Active') === 'Active' ? '#10b981' : '#ef4444',
                          transition: 'opacity 0.2s',
                          display: 'flex',
                          alignItems: 'center'
                        }}
                        onClick={() => handleToggleRoleStatus(role.id)}
                        title={(role.status || 'Active') === 'Active' ? "Disable Role" : "Enable Role"}
                      >
                        {(role.status || 'Active') === 'Active' ? (
                          <Unlock style={{ width: '16px', height: '16px' }} />
                        ) : (
                          <Lock style={{ width: '16px', height: '16px' }} />
                        )}
                      </button>
                      <button
                        onClick={() => {
                          setEditingRoleId(role.id)
                          setRoleFormErrors({})
                          setRoleFormState(role)
                        }}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '6px', color: 'var(--text-muted)', transition: 'color 0.2s', display: 'flex', alignItems: 'center' }}
                        title="Edit Role"
                      >
                        <Edit2 style={{ width: '16px', height: '16px' }} />
                      </button>
                      {role.id !== 'role-1' && (
                        <button
                          onClick={() => handleDeleteRole(role.id)}
                          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '6px', color: '#ef4444', transition: 'opacity 0.2s', display: 'flex', alignItems: 'center' }}
                          title="Delete Role"
                        >
                          <Trash2 style={{ width: '16px', height: '16px' }} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
