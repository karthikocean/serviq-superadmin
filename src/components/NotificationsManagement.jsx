import React, { useState } from 'react'
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

export default function NotificationsManagement({ restaurants = [], showToast }) {
  const [notifications, setNotifications] = useState([
    {
      id: 'NTF-101',
      subject: 'Scheduled Platform Maintenance - June 15th',
      type: 'Maintenance Notice',
      channel: 'Email',
      recipients: 'All Restaurants',
      status: 'Scheduled',
      scheduledDate: '2026-06-15 02:00 AM',
      body: 'Our platform will undergo scheduled maintenance to optimize order routing speeds on June 15th between 2:00 AM and 4:00 AM IST. QR menus will remain active, but KDS sync might experience brief interruptions.'
    },
    {
      id: 'NTF-102',
      subject: 'Urgent: Subscription Expiring Soon',
      type: 'Subscription Expiry',
      channel: 'SMS',
      recipients: 'Spice Garden Bistro',
      status: 'Sent',
      scheduledDate: '2026-06-10 10:30 AM',
      body: 'Your Serviq QR Menu Standard Subscription expires in 3 days. Renew now to avoid interruption of guests scanning menu tables.'
    },
    {
      id: 'NTF-103',
      subject: 'Introduce UPI Auto-Settlements for Cashiers!',
      type: 'Feature Updates',
      channel: 'WhatsApp',
      recipients: 'Premium Subscribers',
      status: 'Sent',
      scheduledDate: '2026-06-08 04:15 PM',
      body: 'You can now configure instant UPI bank deposits directly in your settlement panel. Go to Settings > Billing to try it out!'
    },
    {
      id: 'NTF-104',
      subject: 'Monsoon Feast Special Promotional Campaigns',
      type: 'Promotional Messages',
      channel: 'Email',
      recipients: 'All Restaurants',
      status: 'Draft',
      scheduledDate: 'Unscheduled',
      body: 'Get up to 25% discount on custom QR menu banner prints this monsoon season. Order directly from the Serviq print portal.'
    }
  ])

  // Form states
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [selectedNotification, setSelectedNotification] = useState(null)
  const [newNtf, setNewNtf] = useState({
    subject: '',
    type: 'Subscription Expiry',
    channel: 'Email',
    recipients: 'All Restaurants',
    body: '',
    isScheduled: false,
    scheduledDate: '',
    scheduledTime: ''
  })
  const [errors, setErrors] = useState({})
  const [filterType, setFilterType] = useState('All')

  // Constants
  const channels = ['Email', 'SMS', 'WhatsApp']
  const types = ['Subscription Expiry', 'Maintenance Notice', 'Feature Updates', 'Promotional Messages']
  const recipientGroups = [
    'All Restaurants',
    'Premium Subscribers',
    'Standard Subscribers',
    ...restaurants.map(r => r.name)
  ]

  const handleCreateSubmit = (e) => {
    e.preventDefault()
    const errs = {}
    if (!newNtf.subject.trim()) errs.subject = 'Subject is required'
    if (!newNtf.body.trim()) errs.body = 'Message body is required'
    if (newNtf.isScheduled) {
      if (!newNtf.scheduledDate) errs.scheduledDate = 'Date is required for scheduling'
      if (!newNtf.scheduledTime) errs.scheduledTime = 'Time is required for scheduling'
    }

    if (Object.keys(errs).length > 0) {
      setErrors(errs)
      return
    }

    const nextIdNum = notifications.length > 0
      ? Math.max(...notifications.map(n => parseInt(n.id.replace('NTF-', '')) || 0)) + 1
      : 101
    const newId = `NTF-${nextIdNum}`

    const formattedSchedule = newNtf.isScheduled
      ? `${newNtf.scheduledDate} ${newNtf.scheduledTime}`
      : 'Immediate'

    const itemToAdd = {
      id: newId,
      subject: newNtf.subject,
      type: newNtf.type,
      channel: newNtf.channel,
      recipients: newNtf.recipients,
      status: newNtf.isScheduled ? 'Scheduled' : 'Sent',
      scheduledDate: newNtf.isScheduled ? formattedSchedule : new Date().toLocaleString(),
      body: newNtf.body
    }

    setNotifications([itemToAdd, ...notifications])
    setShowCreateModal(false)
    setNewNtf({
      subject: '',
      type: 'Subscription Expiry',
      channel: 'Email',
      recipients: 'All Restaurants',
      body: '',
      isScheduled: false,
      scheduledDate: '',
      scheduledTime: ''
    })
    setErrors({})
    showToast('success', newNtf.isScheduled ? `Notification ${newId} scheduled successfully!` : `Notification ${newId} sent immediately!`)
  }

  const handleCancelScheduled = (id) => {
    setNotifications(notifications.map(n => n.id === id ? { ...n, status: 'Draft', scheduledDate: 'Unscheduled' } : n))
    showToast('info', `Cancelled schedule. Ticket ${id} moved to Drafts.`)
  }

  const handleSendDraft = (id) => {
    setNotifications(notifications.map(n => n.id === id ? { ...n, status: 'Sent', scheduledDate: new Date().toLocaleString() } : n))
    showToast('success', `Draft ${id} sent immediately!`)
  }

  const handleDelete = (id) => {
    setNotifications(notifications.filter(n => n.id !== id))
    showToast('error', `Notification ${id} deleted.`)
  }

  const getChannelIcon = (channel) => {
    switch (channel) {
      case 'Email': return <Mail style={{ width: '13px', height: '13px' }} />
      case 'SMS': return <MessageSquare style={{ width: '13px', height: '13px' }} />
      default: return <MessageCircle style={{ width: '13px', height: '13px' }} />
    }
  }

  const getChannelStyle = (channel) => {
    switch (channel) {
      case 'Email': return { bg: 'rgba(59, 130, 246, 0.08)', text: '#3b82f6' }
      case 'SMS': return { bg: 'rgba(249, 115, 22, 0.08)', text: '#f97316' }
      default: return { bg: 'rgba(16, 185, 129, 0.08)', text: '#10b981' }
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

  const filteredNotifications = filterType === 'All'
    ? notifications
    : notifications.filter(n => n.type === filterType)

  return (
    <div className="animate-fade-in" style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '24px',
      width: '100%',
      boxSizing: 'border-box',
      position: (showCreateModal || selectedNotification) ? 'relative' : 'static',
      zIndex: (showCreateModal || selectedNotification) ? 100000 : 'auto'
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
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '16px', marginBottom: '4px' }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: '900', color: 'var(--text-main)' }}>Notifications Management</h3>
          </div>
          <button
            onClick={() => {
              setErrors({})
              setNewNtf({
                subject: '',
                type: 'Subscription Expiry',
                channel: 'Email',
                recipients: 'All Restaurants',
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
        </div>

        {/* Controls Bar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Filter Type:</span>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              style={{ padding: '8px 12px', borderRadius: '10px', border: '1px solid var(--border-color)', background: 'var(--bg-app)', color: 'var(--text-main)', fontSize: '0.8rem', outline: 'none', cursor: 'pointer' }}
            >
              <option value="All">All Types</option>
              {types.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
        </div>

        {/* History Table */}
        <div style={{ overflowX: 'auto', background: 'var(--bg-app)', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
          <table className="menu-data-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'rgba(255,255,255,0.02)' }}>
                <th style={{ textAlign: 'left', padding: '12px 18px', fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '800', width: '100px' }}>Msg ID</th>
                <th style={{ textAlign: 'left', padding: '12px 18px', fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '800' }}>Subject</th>
                <th style={{ textAlign: 'left', padding: '12px 18px', fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '800', width: '150px' }}>Type</th>
                <th style={{ textAlign: 'left', padding: '12px 18px', fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '800', width: '110px' }}>Channel</th>
                <th style={{ textAlign: 'left', padding: '12px 18px', fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '800', width: '150px' }}>Target Group</th>
                <th style={{ textAlign: 'left', padding: '12px 18px', fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '800', width: '160px' }}>Schedule/Sent Time</th>
                <th style={{ textAlign: 'center', padding: '12px 18px', fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '800', width: '110px' }}>Status</th>
                <th style={{ textAlign: 'right', padding: '12px 18px', fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '800', width: '150px' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredNotifications.length > 0 ? (
                filteredNotifications.map(n => {
                  const typeStyle = getTypeStyle(n.type)
                  const chanStyle = getChannelStyle(n.channel)
                  return (
                    <tr key={n.id} style={{ borderBottom: '1px solid var(--border-color)', transition: 'background 0.2s' }} onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.01)'} onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}>
                      <td style={{ padding: '14px 18px', fontSize: '0.8rem', color: 'var(--text-main)', fontWeight: '800' }}>{n.id}</td>
                      <td style={{ padding: '14px 18px' }}>
                        <span style={{ fontSize: '0.82rem', fontWeight: '700', color: 'var(--text-main)', display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '280px' }} title={n.subject}>{n.subject}</span>
                      </td>
                      <td style={{ padding: '14px 18px' }}>
                        <span style={{ fontSize: '0.68rem', fontWeight: '800', padding: '3px 8px', borderRadius: '6px', background: typeStyle.bg, color: typeStyle.text, display: 'inline-block' }}>{n.type}</span>
                      </td>
                      <td style={{ padding: '14px 18px' }}>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', fontWeight: '700', padding: '3px 8px', borderRadius: '6px', background: chanStyle.bg, color: chanStyle.text }}>
                          {getChannelIcon(n.channel)}
                          {n.channel}
                        </div>
                      </td>
                      <td style={{ padding: '14px 18px', fontSize: '0.8rem', color: 'var(--text-main)', fontWeight: '600' }}>{n.recipients}</td>
                      <td style={{ padding: '14px 18px', fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: '600' }}>{n.scheduledDate}</td>
                      <td style={{ padding: '14px 18px', textAlign: 'center' }}>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', fontWeight: '800', color: getStatusColor(n.status) }}>
                          {getStatusIcon(n.status)}
                          {n.status}
                        </div>
                      </td>
                      <td style={{ padding: '14px 18px', textAlign: 'right' }}>
                        <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                          <button
                            onClick={() => setSelectedNotification(n)}
                            className="btn-outline"
                            style={{ padding: '5px 8px', fontSize: '0.72rem', borderRadius: '6px', fontWeight: '700', cursor: 'pointer' }}
                          >
                            View
                          </button>
                          {n.status === 'Scheduled' && (
                            <button
                              onClick={() => handleCancelScheduled(n.id)}
                              style={{ padding: '5px 8px', fontSize: '0.72rem', borderRadius: '6px', fontWeight: '700', cursor: 'pointer', background: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b', border: '1px solid rgba(245, 158, 11, 0.15)' }}
                            >
                              Cancel
                            </button>
                          )}
                          {n.status === 'Draft' && (
                            <button
                              onClick={() => handleSendDraft(n.id)}
                              style={{ padding: '5px 8px', fontSize: '0.72rem', borderRadius: '6px', fontWeight: '700', cursor: 'pointer', background: 'rgba(16, 185, 129, 0.12)', color: '#10b981', border: '1px solid rgba(16, 185, 129, 0.2)' }}
                            >
                              Send
                            </button>
                          )}
                          <button
                            onClick={() => handleDelete(n.id)}
                            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444', padding: '4px' }}
                            title="Delete Notification"
                          >
                            <Trash2 style={{ width: '14px', height: '14px' }} />
                          </button>
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
              
              {/* Type and Channel */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
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

                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <label style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-main)' }}>Delivery Channel</label>
                  <select
                    value={newNtf.channel}
                    onChange={(e) => setNewNtf({ ...newNtf, channel: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-app)', color: 'var(--text-main)', fontSize: '0.82rem', outline: 'none' }}
                  >
                    {channels.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>

              {/* Target Recipients */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-main)' }}>Target Recipient Group</label>
                <select
                  value={newNtf.recipients}
                  onChange={(e) => setNewNtf({ ...newNtf, recipients: e.target.value })}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-app)', color: 'var(--text-main)', fontSize: '0.82rem', outline: 'none' }}
                >
                  {recipientGroups.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>

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
                <span style={{ fontSize: '0.72rem', fontWeight: '800', color: getChannelStyle(selectedNotification.channel).text, textTransform: 'uppercase' }}>Broadcast Message</span>
                <h3 style={{ fontSize: '1.1rem', fontWeight: '900', color: 'var(--text-main)', margin: '4px 0 0 0' }}>
                  {selectedNotification.id}
                </h3>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', fontWeight: '800', color: getStatusColor(selectedNotification.status) }}>
                {getStatusIcon(selectedNotification.status)}
                {selectedNotification.status}
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', borderTop: '1px solid var(--border-color)', paddingTop: '16px' }}>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <span style={{ display: 'block', fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: '700', textTransform: 'uppercase' }}>Message Category</span>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-main)', fontWeight: '700' }}>{selectedNotification.type}</span>
                </div>
                <div>
                  <span style={{ display: 'block', fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: '700', textTransform: 'uppercase' }}>Delivery Channel</span>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-main)', fontWeight: '700' }}>{selectedNotification.channel}</span>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <span style={{ display: 'block', fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: '700', textTransform: 'uppercase' }}>Recipient Group</span>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-main)', fontWeight: '700' }}>{selectedNotification.recipients}</span>
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
                      handleSendDraft(selectedNotification.id)
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
