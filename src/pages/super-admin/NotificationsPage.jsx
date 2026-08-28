import React, { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import {
  Bell,
  Send,
  Calendar,
  Mail,
  MessageSquare,
  MessageCircle,
  Plus,
  Trash2,
  Clock,
  CheckCircle,
  AlertTriangle,
  Info,
  ChevronDown
} from 'lucide-react'

import { useRestaurant } from '../../hooks/useRestaurants'
import { useNotification } from '../../contexts/NotificationContext'
import { TableTopControls, TableBottomPagination } from '../../components/common/TablePagination'
import { getNotifications, createNotification, cancelNotification, sendDraftNotification, deleteNotification } from '../../services/notificationService'
import { getAllPlansApi } from '../../services/planService'
import { useAuth } from '../../contexts/AuthContext'

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState([])
  const [totalRecords, setTotalRecords] = useState(0)
  const { restaurants } = useRestaurant()
  const { showToast } = useNotification()
  const { hasPermission, isSuperOwner } = useAuth()

  const canAdd = isSuperOwner || hasPermission('notifications', 'add')
  const canEdit = isSuperOwner || hasPermission('notifications', 'edit')
  const canDelete = isSuperOwner || hasPermission('notifications', 'delete')
  const canView = isSuperOwner || hasPermission('notifications', 'view')

  const [plans, setPlans] = useState([])
  
  // Form states
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [selectedNotification, setSelectedNotification] = useState(null)
  const [newNtf, setNewNtf] = useState({
    subject: '',
    type: 'Subscription Expiry',
    targetType: 'ALL',
    targetPlan: '',
    targetRestaurants: [],
    body: '',
    isScheduled: false,
    scheduledDate: '',
    scheduledTime: ''
  })
  const [errors, setErrors] = useState({})
  const [resDropdownOpen, setResDropdownOpen] = useState(false)
  const [filterType, setFilterType] = useState('All')

  // Listen for sidebar click reset event to open main module list
  useEffect(() => {
    const handleReset = () => {
      setShowCreateModal(false)
      setSelectedNotification(null)
    }
    window.addEventListener('reset_module_view', handleReset)
    return () => window.removeEventListener('reset_module_view', handleReset)
  }, [])

  // Constants
  const types = ['Subscription Expiry', 'Maintenance Notice', 'Feature Updates', 'Promotional Messages']
  
  const fetchPlans = async () => {
    try {
      const data = await getAllPlansApi(0, 100);
      setPlans(data.data || []);
    } catch (err) {
      console.error("Failed to fetch plans", err);
    }
  }

  useEffect(() => {
    fetchPlans();
  }, []);

  const [currentPage, setCurrentPage] = useState(0)
  const [entriesPerPage, setEntriesPerPage] = useState(10)

  const fetchNotifications = async () => {
    try {
      const data = await getNotifications({
        page: currentPage,
        limit: entriesPerPage,
        filterType
      })
      setNotifications(data.data || [])
      setTotalRecords(data.total || 0)
    } catch (error) {
      console.error(error)
      showToast('error', 'Failed to fetch notifications')
    }
  }

  useEffect(() => {
    fetchNotifications()
  }, [currentPage, entriesPerPage, filterType])

  const handleCreateSubmit = async (e) => {
    e.preventDefault()
    const errs = {}
    if (!newNtf.subject.trim()) errs.subject = 'Subject is required'
    if (!newNtf.body.trim()) errs.body = 'Message body is required'
    if (newNtf.isScheduled) {
      if (!newNtf.scheduledDate) errs.scheduledDate = 'Date is required for scheduling'
      if (!newNtf.scheduledTime) errs.scheduledTime = 'Time is required for scheduling'
    }

    if (newNtf.targetType === 'PLAN' && !newNtf.targetPlan) errs.targetPlan = 'Please select a subscription plan'
    if (newNtf.targetType === 'RESTAURANT' && newNtf.targetRestaurants.length === 0) errs.targetRestaurants = 'Please select at least one restaurant'

    if (Object.keys(errs).length > 0) {
      setErrors(errs)
      return
    }

    try {
      const payload = {
        ...newNtf,
        targetPlan: newNtf.targetType === 'PLAN' ? newNtf.targetPlan : null,
        targetRestaurants: newNtf.targetType === 'RESTAURANT' ? newNtf.targetRestaurants : []
      }

      await createNotification(payload)
      setShowCreateModal(false)
      setNewNtf({
        subject: '',
        type: 'Subscription Expiry',
        targetType: 'ALL',
        targetPlan: '',
        targetRestaurants: [],
        body: '',
        isScheduled: false,
        scheduledDate: '',
        scheduledTime: ''
      })
      setErrors({})
      showToast('success', newNtf.isScheduled ? 'Notification scheduled successfully!' : 'Notification sent immediately!')
      fetchNotifications()
    } catch (error) {
      showToast('error', error.response?.data?.message || 'Failed to create notification')
    }
  }

  const handleCancelScheduled = async (id) => {
    try {
      await cancelNotification(id)
      showToast('info', `Notification schedule cancelled and moved to Drafts.`)
      fetchNotifications()
    } catch (error) {
      showToast('error', 'Failed to cancel notification')
    }
  }

  const handleSendDraft = async (id) => {
    try {
      await sendDraftNotification(id)
      showToast('success', `Draft sent immediately!`)
      fetchNotifications()
    } catch (error) {
      showToast('error', 'Failed to send draft')
    }
  }

  const handleDelete = async (id) => {
    try {
      await deleteNotification(id)
      showToast('error', `Notification deleted.`)
      fetchNotifications()
    } catch (error) {
      showToast('error', 'Failed to delete notification')
    }
  }

  const getTypeStyle = (type) => {
    switch (type) {
      case 'Subscription Expiry': return { bg: 'rgba(239, 68, 68, 0.08)', text: '#ef4444' }
      case 'Maintenance Notice': return { bg: 'rgba(245, 158, 11, 0.08)', text: '#f59e0b' }
      case 'Feature Updates': return { bg: 'rgba(99, 102, 241, 0.08)', text: '#6366f1' }
      default: return { bg: 'rgba(16, 185, 129, 0.08)', text: '#10b981' }
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Sent': return <CheckCircle style={{ width: '12px', height: '12px', color: '#10b981' }} />
      case 'Scheduled': return <Clock style={{ width: '12px', height: '12px', color: '#f59e0b' }} />
      default: return <Info style={{ width: '12px', height: '12px', color: '#64748b' }} />
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'Sent': return '#10b981'
      case 'Scheduled': return '#f59e0b'
      default: return '#64748b'
    }
  }

  // Count totals
  const totalSent = notifications.filter(n => n.status === 'Sent').length
  const totalScheduled = notifications.filter(n => n.status === 'Scheduled').length
  const totalDraft = notifications.filter(n => n.status === 'Draft').length

  const paginatedNotifications = notifications

  return (
    <div className="animate-fade-in" style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '24px',
      width: '100%',
      boxSizing: 'border-box',
      position: 'relative'
    }}>
      
      {/* Counters Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
        {[
          { label: 'Sent Notifications', count: totalSent, color: '#10b981', bg: 'rgba(16, 185, 129, 0.04)', border: 'rgba(16, 185, 129, 0.12)' },
          { label: 'Scheduled Queue', count: totalScheduled, color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.04)', border: 'rgba(245, 158, 11, 0.12)' },
          { label: 'Drafts', count: totalDraft, color: '#64748b', bg: 'rgba(100, 116, 139, 0.04)', border: 'rgba(100, 116, 139, 0.12)' }
        ].map((item, idx) => (
          <div key={idx} className="glass-card" style={{
            padding: '20px',
            background: 'var(--bg-card)',
            border: `1px solid ${item.border}`,
            borderRadius: '12px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <div>
              <span style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{item.label}</span>
              <h3 style={{ margin: '8px 0 0 0', fontSize: '1.8rem', fontWeight: '900', color: item.color, lineHeight: 1 }}>{item.count}</h3>
            </div>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              background: item.bg,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: item.color
            }}>
              <Bell style={{ width: '18px', height: '18px' }} />
            </div>
          </div>
        ))}
      </div>

      {/* Control & History Glass Card */}
      <div className="glass-card" style={{
        padding: '24px',
        background: 'var(--bg-card)',
        border: '1px solid var(--border-color)',
        borderRadius: '16px',
        display: 'flex',
        flexDirection: 'column',
        gap: '20px'
      }}>
        
        {/* Header Row */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '16px', marginBottom: '16px' }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: '900', color: 'var(--text-main)' }}>Notifications Management</h3>
          </div>
          {canAdd && (
            <button
              onClick={() => {
                setErrors({})
                setNewNtf({
                  subject: '',
                  type: 'Subscription Expiry',
                  targetType: 'ALL',
                  targetPlan: '',
                  targetRestaurants: [],
                  body: '',
                  isScheduled: false,
                  scheduledDate: '',
                  scheduledTime: ''
                })
                setShowCreateModal(true)
              }}
              className="btn-black"
              style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer' }}
            >
              <Plus style={{ width: '16px', height: '16px' }} /> Compose Notification
            </button>
          )}
        </div>

        {/* History Table */}
        <TableTopControls
          entriesPerPage={entriesPerPage}
          onEntriesPerPageChange={(num) => { setEntriesPerPage(num); setCurrentPage(0); }}
          searchTerm=""
          onSearchChange={() => {}}
          showSearch={false}
        />
        <div style={{ overflowX: 'auto', background: 'var(--bg-app)', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
          <table className="menu-data-table" style={{ width: '100%', borderCollapse: 'collapse', whiteSpace: 'nowrap' }}>
            <thead>
              <tr style={{ background: 'rgba(255,255,255,0.02)' }}>
                <th style={{ textAlign: 'left', padding: '12px 18px', fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '800' }}>Subject</th>
                <th style={{ textAlign: 'left', padding: '12px 18px', fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '800', width: '150px' }}>Type</th>
                <th style={{ textAlign: 'left', padding: '12px 18px', fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '800', width: '150px' }}>Target Group</th>
                <th style={{ textAlign: 'left', padding: '12px 18px', fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '800', width: '160px' }}>Schedule/Sent Time</th>
                <th style={{ textAlign: 'center', padding: '12px 18px', fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '800', width: '110px' }}>Status</th>
                <th style={{ textAlign: 'right', padding: '12px 18px', fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '800', width: '150px' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedNotifications.length > 0 ? (
                paginatedNotifications.map(n => {
                  const typeStyle = getTypeStyle(n.type)
                  return (
                    <tr key={n._id} style={{ borderBottom: '1px solid var(--border-color)', transition: 'background 0.2s' }} onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.01)'} onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}>
                      <td style={{ padding: '14px 18px' }}>
                        <span style={{ fontSize: '0.82rem', fontWeight: '700', color: 'var(--text-main)', display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '280px' }} title={n.subject}>{n.subject}</span>
                      </td>
                      <td style={{ padding: '14px 18px' }}>
                        <span style={{ fontSize: '0.68rem', fontWeight: '800', padding: '3px 8px', borderRadius: '6px', background: typeStyle.bg, color: typeStyle.text, display: 'inline-block' }}>{n.type}</span>
                      </td>
                      <td style={{ padding: '14px 18px', fontSize: '0.8rem', color: 'var(--text-main)', fontWeight: '600' }}>
                        {n.targetType === 'ALL' ? 'All Restaurants' : n.targetType === 'PLAN' ? 'Subscription Plan' : 'Specific Restaurants'}
                      </td>
                      <td style={{ padding: '14px 18px', fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: '600' }}>{n.scheduledDate}</td>
                      <td style={{ padding: '14px 18px', textAlign: 'center' }}>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', fontWeight: '800', color: getStatusColor(n.status) }}>
                          {getStatusIcon(n.status)}
                          {n.status}
                        </div>
                      </td>
                      <td style={{ padding: '14px 18px', textAlign: 'right' }}>
                        <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                          {canView && (
                            <button
                              onClick={() => setSelectedNotification(n)}
                              className="btn-outline"
                              style={{ padding: '5px 8px', fontSize: '0.72rem', borderRadius: '6px', fontWeight: '700', cursor: 'pointer' }}
                            >
                              View
                            </button>
                          )}
                          {canEdit && n.status === 'Scheduled' && (
                            <button
                              onClick={() => handleCancelScheduled(n._id)}
                              style={{ padding: '5px 8px', fontSize: '0.72rem', borderRadius: '6px', fontWeight: '700', cursor: 'pointer', background: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b', border: '1px solid rgba(245, 158, 11, 0.15)' }}
                            >
                              Cancel
                            </button>
                          )}
                          {canEdit && n.status === 'Draft' && (
                            <button
                              onClick={() => handleSendDraft(n._id)}
                              style={{ padding: '5px 8px', fontSize: '0.72rem', borderRadius: '6px', fontWeight: '700', cursor: 'pointer', background: 'rgba(16, 185, 129, 0.12)', color: '#10b981', border: '1px solid rgba(16, 185, 129, 0.2)' }}
                            >
                              Send
                            </button>
                          )}
                          {canDelete && (
                            <button
                              onClick={() => handleDelete(n._id)}
                              style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444', padding: '4px' }}
                              title="Delete Notification"
                            >
                              <Trash2 style={{ width: '14px', height: '14px' }} />
                            </button>
                          )}
                          {!canView && !canEdit && !canDelete && (
                            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>-</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })
              ) : (
                <tr>
                  <td colSpan="8" style={{ padding: '40px 18px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                    No notifications recorded under this classification.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <TableBottomPagination
          totalEntries={totalRecords}
          currentPage={currentPage}
          entriesPerPage={entriesPerPage}
          onPageChange={setCurrentPage}
        />
      </div>

      {/* CREATE / SCHEDULE MODAL */}
      {showCreateModal && createPortal(
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
        }} onClick={() => setShowCreateModal(false)}>
          <div className="menu-edit-panel animate-fade-in" style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border-color)',
            borderRadius: '16px',
            padding: '28px',
            width: '90%',
            maxWidth: '520px',
            boxShadow: 'var(--shadow-premium)',
            position: 'relative',
            top: 'auto'
          }} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: '800', color: 'var(--text-main)', margin: '0 0 20px 0', borderBottom: '1px solid var(--border-color)', paddingBottom: '10px' }}>
              Compose Broadcast Notification
            </h3>

            <form onSubmit={handleCreateSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              
              {/* Type */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-main)' }}>Notification Type</label>
                <select
                  value={newNtf.type}
                  onChange={(e) => setNewNtf({ ...newNtf, type: e.target.value })}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-app)', color: 'var(--text-main)', fontSize: '0.82rem', outline: 'none' }}
                >
                  {types.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>

              {/* Target Audience Segmented Control */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-main)' }}>Target Audience</label>
                <div style={{ display: 'flex', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-color)', borderRadius: '8px', overflow: 'hidden' }}>
                  {['ALL', 'PLAN', 'RESTAURANT'].map(type => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setNewNtf({ ...newNtf, targetType: type, targetPlan: '', targetRestaurants: [] })}
                      style={{
                        flex: 1,
                        padding: '8px 0',
                        fontSize: '0.75rem',
                        fontWeight: '700',
                        border: 'none',
                        background: newNtf.targetType === type ? 'var(--text-main)' : 'transparent',
                        color: newNtf.targetType === type ? '#ffffff' : 'var(--text-muted)',
                        cursor: 'pointer',
                        transition: 'all 0.2s'
                      }}
                    >
                      {type === 'ALL' ? 'All' : type === 'PLAN' ? 'Subscription Plan' : 'Restaurants'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Conditional Target Inputs */}
              {newNtf.targetType === 'PLAN' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', padding: '12px', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                  <label style={{ fontSize: '0.75rem', fontWeight: '700', color: errors.targetPlan ? '#ef4444' : 'var(--text-main)' }}>Select Plan *</label>
                  <select
                    value={newNtf.targetPlan}
                    onChange={(e) => {
                      setNewNtf({ ...newNtf, targetPlan: e.target.value })
                      if (errors.targetPlan) setErrors({ ...errors, targetPlan: '' })
                    }}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: `1px solid ${errors.targetPlan ? '#ef4444' : 'var(--border-color)'}`, background: 'var(--bg-app)', color: 'var(--text-main)', fontSize: '0.82rem', outline: 'none' }}
                  >
                    <option value="" disabled>-- Select Subscription Plan --</option>
                    {plans.map(p => <option key={p._id || p.id} value={p._id || p.id}>{p.planName}</option>)}
                  </select>
                  {errors.targetPlan && <span style={{ fontSize: '0.7rem', color: '#ef4444', fontWeight: '600' }}>{errors.targetPlan}</span>}
                </div>
              )}

              {newNtf.targetType === 'RESTAURANT' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', padding: '12px', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                  <label style={{ fontSize: '0.75rem', fontWeight: '700', color: errors.targetRestaurants ? '#ef4444' : 'var(--text-main)' }}>Select Restaurants *</label>
                  
                  <div style={{ position: 'relative' }}>
                    <div 
                      onClick={() => setResDropdownOpen(!resDropdownOpen)}
                      style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', padding: '9px 12px', borderRadius: '8px', border: `1px solid ${errors.targetRestaurants ? '#ef4444' : 'var(--border-color)'}`, background: 'var(--bg-app)', color: 'var(--text-main)', fontSize: '0.82rem', cursor: 'pointer' }}
                    >
                      <span>{newNtf.targetRestaurants.length === 0 ? '-- Select Restaurants --' : `${newNtf.targetRestaurants.length} Restaurants Selected`}</span>
                      <ChevronDown style={{ width: '14px', height: '14px', transform: resDropdownOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
                    </div>

                    {resDropdownOpen && (
                      <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, marginTop: '4px', background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', zIndex: 10, maxHeight: '200px', overflowY: 'auto', display: 'flex', flexDirection: 'column', padding: '8px', gap: '6px' }}>
                        {restaurants.map(r => (
                          <label key={r._id} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', color: 'var(--text-main)', cursor: 'pointer', padding: '4px 8px', borderRadius: '6px', transition: 'background 0.2s' }} onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.03)'} onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}>
                            <input
                              type="checkbox"
                              checked={newNtf.targetRestaurants.includes(r._id)}
                              onChange={(e) => {
                                let updated = [...newNtf.targetRestaurants];
                                if (e.target.checked) updated.push(r._id);
                                else updated = updated.filter(id => id !== r._id);
                                setNewNtf({ ...newNtf, targetRestaurants: updated });
                                if (errors.targetRestaurants) setErrors({ ...errors, targetRestaurants: '' });
                              }}
                              style={{ cursor: 'pointer' }}
                            />
                            {r.name}
                          </label>
                        ))}
                        {restaurants.length === 0 && <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', padding: '4px' }}>No restaurants found.</span>}
                      </div>
                    )}
                  </div>
                  {errors.targetRestaurants && <span style={{ fontSize: '0.7rem', color: '#ef4444', fontWeight: '600', marginTop: '4px' }}>{errors.targetRestaurants}</span>}
                </div>
              )}

              {/* Subject */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label style={{ fontSize: '0.75rem', fontWeight: '700', color: errors.subject ? '#ef4444' : 'var(--text-main)' }}>Message Subject *</label>
                <input
                  type="text"
                  value={newNtf.subject}
                  onChange={(e) => {
                    setNewNtf({ ...newNtf, subject: e.target.value })
                    if (errors.subject) setErrors({ ...errors, subject: '' })
                  }}
                  placeholder="e.g. System upgrade alert"
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: `1.5px solid ${errors.subject ? '#ef4444' : 'var(--border-color)'}`, background: errors.subject ? 'rgba(239,68,68,0.04)' : 'var(--bg-app)', color: 'var(--text-main)', fontSize: '0.82rem', outline: 'none', transition: 'border-color 0.15s' }}
                />
                {errors.subject && <span style={{ fontSize: '0.7rem', color: '#ef4444', fontWeight: '600' }}>{errors.subject}</span>}
              </div>

              {/* Message Body */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label style={{ fontSize: '0.75rem', fontWeight: '700', color: errors.body ? '#ef4444' : 'var(--text-main)' }}>Message Body (Content) *</label>
                <textarea
                  rows="4"
                  value={newNtf.body}
                  onChange={(e) => {
                    setNewNtf({ ...newNtf, body: e.target.value })
                    if (errors.body) setErrors({ ...errors, body: '' })
                  }}
                  placeholder="Type message text here..."
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: `1.5px solid ${errors.body ? '#ef4444' : 'var(--border-color)'}`, background: errors.body ? 'rgba(239,68,68,0.04)' : 'var(--bg-app)', color: 'var(--text-main)', fontSize: '0.82rem', outline: 'none', resize: 'vertical', transition: 'border-color 0.15s' }}
                />
                {errors.body && <span style={{ fontSize: '0.7rem', color: '#ef4444', fontWeight: '600' }}>{errors.body}</span>}
              </div>

              {/* Scheduling Checkbox */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: '4px 0' }}>
                <input
                  type="checkbox"
                  id="schedule-chk"
                  checked={newNtf.isScheduled}
                  onChange={(e) => setNewNtf({ ...newNtf, isScheduled: e.target.checked })}
                  style={{ cursor: 'pointer' }}
                />
                <label htmlFor="schedule-chk" style={{ fontSize: '0.8rem', fontWeight: '700', cursor: 'pointer', color: 'var(--text-main)' }}>Schedule for later dispatch</label>
              </div>

              {/* Schedule Fields */}
              {newNtf.isScheduled && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', background: 'var(--bg-app)', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <label style={{ fontSize: '0.7rem', fontWeight: '700', color: errors.scheduledDate ? '#ef4444' : 'var(--text-main)' }}>Date *</label>
                    <input
                      type="date"
                      value={newNtf.scheduledDate}
                      onChange={(e) => {
                        setNewNtf({ ...newNtf, scheduledDate: e.target.value })
                        if (errors.scheduledDate) setErrors({ ...errors, scheduledDate: '' })
                      }}
                      style={{ padding: '8px', borderRadius: '6px', border: `1.5px solid ${errors.scheduledDate ? '#ef4444' : 'var(--border-color)'}`, background: errors.scheduledDate ? 'rgba(239,68,68,0.04)' : 'var(--bg-card)', color: 'var(--text-main)', fontSize: '0.78rem', outline: 'none', transition: 'border-color 0.15s' }}
                    />
                    {errors.scheduledDate && <span style={{ fontSize: '0.65rem', color: '#ef4444' }}>{errors.scheduledDate}</span>}
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <label style={{ fontSize: '0.7rem', fontWeight: '700', color: errors.scheduledTime ? '#ef4444' : 'var(--text-main)' }}>Time *</label>
                    <input
                      type="time"
                      value={newNtf.scheduledTime}
                      onChange={(e) => {
                        setNewNtf({ ...newNtf, scheduledTime: e.target.value })
                        if (errors.scheduledTime) setErrors({ ...errors, scheduledTime: '' })
                      }}
                      style={{ padding: '8px', borderRadius: '6px', border: `1.5px solid ${errors.scheduledTime ? '#ef4444' : 'var(--border-color)'}`, background: errors.scheduledTime ? 'rgba(239,68,68,0.04)' : 'var(--bg-card)', color: 'var(--text-main)', fontSize: '0.78rem', outline: 'none', transition: 'border-color 0.15s' }}
                    />
                    {errors.scheduledTime && <span style={{ fontSize: '0.65rem', color: '#ef4444' }}>{errors.scheduledTime}</span>}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div style={{ display: 'flex', gap: '10px', marginTop: '14px', borderTop: '1px solid var(--border-color)', paddingTop: '16px' }}>
                <button type="submit" className="btn-black" style={{ flex: 1, padding: '10px', borderRadius: '8px', border: 'none', background: '#000000', color: '#ffffff', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                  {newNtf.isScheduled ? <Calendar style={{ width: '15px', height: '15px' }} /> : <Send style={{ width: '15px', height: '15px' }} />}
                  {newNtf.isScheduled ? 'Schedule dispatch' : 'Broadcast Now'}
                </button>
                <button type="button" className="btn-outline" onClick={() => { setShowCreateModal(false); setErrors({}); }} style={{ flex: 1, padding: '10px', borderRadius: '8px', border: '1px solid var(--border-color)', background: '#ffffff', color: 'var(--text-muted)', fontWeight: '700', cursor: 'pointer' }}>Cancel</button>
              </div>

            </form>
          </div>
        </div>,
        document.body
      )}

      {/* VIEW NOTIFICATION DETAILS MODAL */}
      {selectedNotification && createPortal(
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
        }} onClick={() => setSelectedNotification(null)}>
          <div className="menu-edit-panel animate-fade-in" style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border-color)',
            borderRadius: '16px',
            padding: '28px',
            width: '90%',
            maxWidth: '500px',
            boxShadow: 'var(--shadow-premium)',
            position: 'relative',
            top: 'auto'
          }} onClick={(e) => e.stopPropagation()}>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
              <div>
                <span style={{ fontSize: '0.72rem', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Broadcast Message</span>
                <h3 style={{ fontSize: '1.1rem', fontWeight: '900', color: 'var(--text-main)', margin: '4px 0 0 0' }}>
                  {selectedNotification._id}
                </h3>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', fontWeight: '800', color: getStatusColor(selectedNotification.status) }}>
                {getStatusIcon(selectedNotification.status)}
                {selectedNotification.status}
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', borderTop: '1px solid var(--border-color)', paddingTop: '16px' }}>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '12px' }}>
                <div>
                  <span style={{ display: 'block', fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: '700', textTransform: 'uppercase' }}>Message Category</span>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-main)', fontWeight: '700' }}>{selectedNotification.type}</span>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <span style={{ display: 'block', fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: '700', textTransform: 'uppercase' }}>Recipient Group</span>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-main)', fontWeight: '700' }}>
                    {selectedNotification.targetType === 'ALL' ? 'All Restaurants' : selectedNotification.targetType === 'PLAN' ? 'Subscription Plan' : `${selectedNotification.targetRestaurants?.length || 0} Specific Restaurants`}
                  </span>
                </div>
                <div>
                  <span style={{ display: 'block', fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: '700', textTransform: 'uppercase' }}>Sent / Scheduled Time</span>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-main)', fontWeight: '700' }}>{selectedNotification.scheduledDate}</span>
                </div>
              </div>

              <div>
                <span style={{ display: 'block', fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: '700', textTransform: 'uppercase' }}>Subject Text</span>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-main)', fontWeight: '700' }}>{selectedNotification.subject}</span>
              </div>

              <div>
                <span style={{ display: 'block', fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: '700', textTransform: 'uppercase' }}>Message Content</span>
                <div style={{
                  padding: '12px',
                  background: 'var(--bg-app)',
                  borderRadius: '8px',
                  border: '1px solid var(--border-color)',
                  fontSize: '0.82rem',
                  color: 'var(--text-main)',
                  lineHeight: '1.45',
                  marginTop: '4px',
                  whiteSpace: 'pre-wrap'
                }}>
                  {selectedNotification.body}
                </div>
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                {selectedNotification.status === 'Draft' && (
                  <button
                    onClick={() => {
                      handleSendDraft(selectedNotification._id)
                      setSelectedNotification(null)
                    }}
                    className="btn-black"
                    style={{ flex: 1, padding: '10px', borderRadius: '8px', border: 'none', background: '#10b981', color: '#ffffff', fontWeight: '700', cursor: 'pointer' }}
                  >
                    Broadcast Now
                  </button>
                )}
                <button type="button" className="btn-outline" onClick={() => setSelectedNotification(null)} style={{ flex: 1, padding: '10px', borderRadius: '8px', border: '1px solid var(--border-color)', background: '#ffffff', color: 'var(--text-muted)', fontWeight: '700', cursor: 'pointer' }}>Dismiss</button>
              </div>

            </div>
          </div>
        </div>,
        document.body
      )}

    </div>
  )
}
