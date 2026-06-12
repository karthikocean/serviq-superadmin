import React, { useState } from 'react'
import { createPortal } from 'react-dom'
import {
  LifeBuoy,
  Plus,
  Search,
  Filter,
  CheckCircle,
  Clock,
  AlertCircle,
  XCircle,
  User,
  UserPlus,
  RefreshCw,
  Tag,
  ChevronDown
} from 'lucide-react'

export default function SupportTicketManagement({ restaurants = [], showToast }) {
  const [tickets, setTickets] = useState([
    {
      id: 'TKT-1001',
      restaurantName: 'Spice Garden Bistro',
      subject: 'QR code not scanning under low light conditions',
      category: 'QR Scanning',
      priority: 'High',
      assignedUser: 'Admin User',
      status: 'Open',
      createdDate: '2026-06-10',
      description: 'Customers are reporting that they cannot scan the QR codes on the corner tables when the ambient dining room lighting is dimmed.'
    },
    {
      id: 'TKT-1002',
      restaurantName: 'Urban Tiffin House',
      subject: 'Billing module GST rounding error',
      category: 'Billing',
      priority: 'Medium',
      assignedUser: 'Jane Doe (Support)',
      status: 'In Progress',
      createdDate: '2026-06-09',
      description: 'The final printed receipt rounds the GST to the nearest rupee, but the simulator screen displays decimals. Need consistent rounding.'
    },
    {
      id: 'TKT-1003',
      restaurantName: 'Blue Plate Cafe',
      subject: 'KDS display screen delay during peak hours',
      category: 'KDS Lag',
      priority: 'Low',
      assignedUser: 'John Smith (Dev)',
      status: 'Resolved',
      createdDate: '2026-06-08',
      description: 'The kitchen orders are taking up to 10 seconds to appear on the secondary display screen when there are more than 15 active tickets.'
    },
    {
      id: 'TKT-1004',
      restaurantName: 'Serviq Bistro',
      subject: 'Menu upload images failing size limits',
      category: 'Menu',
      priority: 'Low',
      assignedUser: 'Unassigned',
      status: 'Closed',
      createdDate: '2026-06-05',
      description: 'Images larger than 2MB fail to upload silently. We should add a warning toast indicating image size limits.'
    }
  ])

  // Filters & Search
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')
  const [priorityFilter, setPriorityFilter] = useState('All')
  const [categoryFilter, setCategoryFilter] = useState('All')

  // Modals & Forms State
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [selectedTicket, setSelectedTicket] = useState(null)
  const [newTicket, setNewTicket] = useState({
    restaurantName: '',
    subject: '',
    category: 'QR Scanning',
    priority: 'Medium',
    assignedUser: 'Unassigned',
    description: ''
  })
  const [assignUser, setAssignUser] = useState('')
  const [assignTicketId, setAssignTicketId] = useState(null)
  const [errors, setErrors] = useState({})

  // Constants
  const categories = ['QR Scanning', 'Billing', 'KDS Lag', 'Menu', 'Other']
  const priorities = ['Low', 'Medium', 'High']
  const statuses = ['Open', 'In Progress', 'Resolved', 'Closed']
  const supportStaff = ['Admin User', 'Jane Doe (Support)', 'John Smith (Dev)', 'Platform Super']

  // Handlers
  const handleCreateTicketSubmit = (e) => {
    e.preventDefault()
    const errs = {}
    if (!newTicket.restaurantName) errs.restaurantName = 'Restaurant Name is required'
    if (!newTicket.subject.trim()) errs.subject = 'Subject is required'
    if (!newTicket.description.trim()) errs.description = 'Description is required'

    if (Object.keys(errs).length > 0) {
      setErrors(errs)
      return
    }

    // Generate unique Ticket ID
    const nextNum = tickets.length > 0 
      ? Math.max(...tickets.map(t => parseInt(t.id.replace('TKT-', '')) || 0)) + 1 
      : 1001
    const newId = `TKT-${nextNum}`

    const ticketToAdd = {
      ...newTicket,
      id: newId,
      status: 'Open',
      createdDate: new Date().toISOString().split('T')[0]
    }

    setTickets([ticketToAdd, ...tickets])
    setShowCreateModal(false)
    setNewTicket({
      restaurantName: restaurants[0]?.name || '',
      subject: '',
      category: 'QR Scanning',
      priority: 'Medium',
      assignedUser: 'Unassigned',
      description: ''
    })
    setErrors({})
    showToast('success', `Support Ticket ${newId} created successfully!`)
  }

  const handleQuickResolve = (ticketId) => {
    setTickets(tickets.map(t => t.id === ticketId ? { ...t, status: 'Resolved' } : t))
    showToast('success', `Ticket ${ticketId} has been marked as RESOLVED.`)
  }

  const handleUpdateStatus = (ticketId, nextStatus) => {
    setTickets(tickets.map(t => t.id === ticketId ? { ...t, status: nextStatus } : t))
    showToast('info', `Ticket ${ticketId} status changed to ${nextStatus.toUpperCase()}`)
  }

  const handleAssignTicketSubmit = (e) => {
    e.preventDefault()
    if (!assignUser) return
    setTickets(tickets.map(t => t.id === assignTicketId ? { ...t, assignedUser: assignUser } : t))
    setAssignTicketId(null)
    setAssignUser('')
    showToast('success', `Ticket successfully assigned to ${assignUser}`)
  }

  // Filter logic
  const filteredTickets = tickets.filter(t => {
    const matchesSearch = t.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          t.restaurantName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          t.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          t.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'All' || t.status === statusFilter
    const matchesPriority = priorityFilter === 'All' || t.priority === priorityFilter
    const matchesCategory = categoryFilter === 'All' || t.category === categoryFilter
    return matchesSearch && matchesStatus && matchesPriority && matchesCategory
  })

  // Statistics
  const openCount = tickets.filter(t => t.status === 'Open').length
  const progressCount = tickets.filter(t => t.status === 'In Progress').length
  const resolvedCount = tickets.filter(t => t.status === 'Resolved').length
  const closedCount = tickets.filter(t => t.status === 'Closed').length

  const getPriorityStyle = (priority) => {
    switch (priority) {
      case 'High': return { bg: 'rgba(239, 68, 68, 0.1)', text: '#ef4444' }
      case 'Medium': return { bg: 'rgba(245, 158, 11, 0.1)', text: '#f59e0b' }
      default: return { bg: 'rgba(16, 185, 129, 0.1)', text: '#10b981' }
    }
  }

  const getStatusStyle = (status) => {
    switch (status) {
      case 'Open': return { bg: 'rgba(239, 68, 68, 0.08)', text: '#ef4444', icon: <AlertCircle style={{ width: '12px', height: '12px' }} /> }
      case 'In Progress': return { bg: 'rgba(245, 158, 11, 0.08)', text: '#f59e0b', icon: <Clock style={{ width: '12px', height: '12px' }} /> }
      case 'Resolved': return { bg: 'rgba(16, 185, 129, 0.08)', text: '#10b981', icon: <CheckCircle style={{ width: '12px', height: '12px' }} /> }
      default: return { bg: 'rgba(100, 116, 139, 0.08)', text: '#64748b', icon: <XCircle style={{ width: '12px', height: '12px' }} /> }
    }
  }

  return (
    <div className="animate-fade-in" style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '24px',
      width: '100%',
      boxSizing: 'border-box',
      position: (showCreateModal || selectedTicket || assignTicketId) ? 'relative' : 'static',
      zIndex: (showCreateModal || selectedTicket || assignTicketId) ? 100000 : 'auto'
    }}>
      
      {/* Overview Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
        {[
          { label: 'Open Tickets', count: openCount, bg: 'rgba(239, 68, 68, 0.04)', border: 'rgba(239, 68, 68, 0.12)', color: '#ef4444' },
          { label: 'In Progress', count: progressCount, bg: 'rgba(245, 158, 11, 0.04)', border: 'rgba(245, 158, 11, 0.12)', color: '#f59e0b' },
          { label: 'Resolved', count: resolvedCount, bg: 'rgba(16, 185, 129, 0.04)', border: 'rgba(16, 185, 129, 0.12)', color: '#10b981' },
          { label: 'Closed', count: closedCount, bg: 'rgba(100, 116, 139, 0.04)', border: 'rgba(100, 116, 139, 0.12)', color: '#64748b' }
        ].map((stat, idx) => (
          <div key={idx} className="glass-card" style={{
            padding: '20px',
            background: 'var(--bg-card)',
            border: `1px solid ${stat.border}`,
            borderRadius: '12px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <div>
              <span style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{stat.label}</span>
              <h3 style={{ margin: '8px 0 0 0', fontSize: '1.8rem', fontWeight: '900', color: stat.color, lineHeight: 1 }}>{stat.count}</h3>
            </div>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              background: stat.bg,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: stat.color
            }}>
              <LifeBuoy style={{ width: '18px', height: '18px' }} />
            </div>
          </div>
        ))}
      </div>

      {/* Main Glass Card with Controls & Grid */}
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
            <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: '900', color: 'var(--text-main)' }}>Support Ticket Management</h3>
          </div>
          <button
            onClick={() => {
              setErrors({})
              setNewTicket({
                restaurantName: restaurants[0]?.name || '',
                subject: '',
                category: 'QR Scanning',
                priority: 'Medium',
                assignedUser: 'Unassigned',
                description: ''
              })
              setShowCreateModal(true)
            }}
            className="btn-black"
            style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer' }}
          >
            <Plus style={{ width: '16px', height: '16px' }} /> Create Ticket
          </button>
        </div>

        {/* Controls Bar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          
          {/* Search and Filters */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap', flex: 1 }}>
            <div style={{ position: 'relative', minWidth: '240px', flex: '1 1 auto' }}>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search ticket number, subject, restaurant..."
                style={{
                  width: '100%',
                  padding: '10px 14px 10px 38px',
                  borderRadius: '10px',
                  border: '1px solid var(--border-color)',
                  background: 'var(--bg-app)',
                  color: 'var(--text-main)',
                  fontSize: '0.85rem',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              />
              <Search style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', width: '16px', height: '16px', color: 'var(--text-muted)' }} />
            </div>

            {/* Filter Dropdowns */}
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                style={{ padding: '9px 12px', borderRadius: '10px', border: '1px solid var(--border-color)', background: 'var(--bg-app)', color: 'var(--text-main)', fontSize: '0.8rem', outline: 'none', cursor: 'pointer' }}
              >
                <option value="All">All Statuses</option>
                {statuses.map(s => <option key={s} value={s}>{s}</option>)}
              </select>

              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                style={{ padding: '9px 12px', borderRadius: '10px', border: '1px solid var(--border-color)', background: 'var(--bg-app)', color: 'var(--text-main)', fontSize: '0.8rem', outline: 'none', cursor: 'pointer' }}
              >
                <option value="All">All Priorities</option>
                {priorities.map(p => <option key={p} value={p}>{p}</option>)}
              </select>

              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                style={{ padding: '9px 12px', borderRadius: '10px', border: '1px solid var(--border-color)', background: 'var(--bg-app)', color: 'var(--text-main)', fontSize: '0.8rem', outline: 'none', cursor: 'pointer' }}
              >
                <option value="All">All Categories</option>
                {categories.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>
        </div>

        {/* Tickets Table Grid */}
        <div style={{ overflowX: 'auto', background: 'var(--bg-app)', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
          <table className="menu-data-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'rgba(255,255,255,0.02)' }}>
                <th style={{ textAlign: 'left', padding: '12px 18px', fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '800', width: '90px' }}>Ticket No.</th>
                <th style={{ textAlign: 'left', padding: '12px 18px', fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '800' }}>Restaurant</th>
                <th style={{ textAlign: 'left', padding: '12px 18px', fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '800', maxWidth: '300px' }}>Subject</th>
                <th style={{ textAlign: 'left', padding: '12px 18px', fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '800', width: '110px' }}>Category</th>
                <th style={{ textAlign: 'center', padding: '12px 18px', fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '800', width: '80px' }}>Priority</th>
                <th style={{ textAlign: 'left', padding: '12px 18px', fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '800', width: '150px' }}>Assigned User</th>
                <th style={{ textAlign: 'center', padding: '12px 18px', fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '800', width: '110px' }}>Status</th>
                <th style={{ textAlign: 'right', padding: '12px 18px', fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '800', width: '180px' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredTickets.length > 0 ? (
                filteredTickets.map(ticket => {
                  const priorityStyle = getPriorityStyle(ticket.priority)
                  const statusStyle = getStatusStyle(ticket.status)

                  return (
                    <tr key={ticket.id} style={{ borderBottom: '1px solid var(--border-color)', transition: 'background-color 0.2s' }}>
                      <td style={{ padding: '14px 18px', fontSize: '0.8rem', color: 'var(--text-main)', fontWeight: '800', fontFamily: 'monospace', verticalAlign: 'middle' }}>
                        {ticket.id}
                      </td>
                      <td style={{ padding: '14px 18px', verticalAlign: 'middle' }}>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                          <span style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--text-main)' }}>{ticket.restaurantName}</span>
                          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>ID: {restaurants.find(r => r.name === ticket.restaurantName)?.id || 'N/A'}</span>
                        </div>
                      </td>
                      <td style={{ padding: '14px 18px', fontSize: '0.82rem', color: 'var(--text-main)', fontWeight: '500', verticalAlign: 'middle', maxWidth: '300px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {ticket.subject}
                      </td>
                      <td style={{ padding: '14px 18px', fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: '600', verticalAlign: 'middle' }}>
                        {ticket.category}
                      </td>
                      <td style={{ padding: '14px 18px', verticalAlign: 'middle', textAlign: 'center' }}>
                        <span style={{
                          padding: '3px 8px',
                          borderRadius: '6px',
                          fontSize: '0.7rem',
                          fontWeight: '700',
                          background: priorityStyle.bg,
                          color: priorityStyle.text
                        }}>{ticket.priority}</span>
                      </td>
                      <td style={{ padding: '14px 18px', fontSize: '0.8rem', color: 'var(--text-main)', verticalAlign: 'middle' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <User style={{ width: '12px', height: '12px', color: 'var(--text-muted)' }} />
                          <span>{ticket.assignedUser}</span>
                        </div>
                      </td>
                      <td style={{ padding: '14px 18px', verticalAlign: 'middle', textAlign: 'center' }}>
                        <div style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          padding: '4px 8px',
                          borderRadius: '6px',
                          fontSize: '0.72rem',
                          fontWeight: '800',
                          background: statusStyle.bg,
                          color: statusStyle.text
                        }}>
                          {statusStyle.icon}
                          <span>{statusStyle.text}</span>
                        </div>
                      </td>
                      <td style={{ padding: '14px 18px', verticalAlign: 'middle', textAlign: 'right', width: '180px' }}>
                        <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                          <button
                            onClick={() => setSelectedTicket(ticket)}
                            className="btn-outline"
                            style={{ padding: '5px 10px', fontSize: '0.7rem', borderRadius: '6px', cursor: 'pointer' }}
                          >
                            View
                          </button>
                          <button
                            onClick={() => {
                              setAssignTicketId(ticket.id)
                              setAssignUser(ticket.assignedUser === 'Unassigned' ? '' : ticket.assignedUser)
                            }}
                            className="btn-outline"
                            style={{ padding: '5px 10px', fontSize: '0.7rem', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '3px' }}
                          >
                            <UserPlus style={{ width: '11px', height: '11px' }} /> Assign
                          </button>
                          {ticket.status !== 'Resolved' && ticket.status !== 'Closed' && (
                            <button
                              onClick={() => handleQuickResolve(ticket.id)}
                              className="btn-black"
                              style={{ padding: '5px 10px', fontSize: '0.7rem', borderRadius: '6px', cursor: 'pointer', background: '#10b981', border: 'none', color: '#ffffff' }}
                            >
                              Resolve
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })
              ) : (
                <tr>
                  <td colSpan="8" style={{ padding: '40px 18px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                    <LifeBuoy style={{ width: '28px', height: '28px', margin: '0 auto 10px auto', opacity: 0.5, display: 'block' }} />
                    No support tickets matching current filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* CREATE TICKET MODAL OVERLAY */}
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
            maxWidth: '500px',
            boxShadow: 'var(--shadow-premium)',
            position: 'relative',
            top: 'auto'
          }} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: '800', color: 'var(--text-main)', margin: '0 0 20px 0', borderBottom: '1px solid var(--border-color)', paddingBottom: '10px' }}>
              File Support Request Ticket
            </h3>

            <form onSubmit={handleCreateTicketSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              
              {/* Restaurant Select */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label style={{ fontSize: '0.75rem', fontWeight: '700', color: errors.restaurantName ? '#ef4444' : 'var(--text-main)' }}>Restaurant Branch *</label>
                <select
                  value={newTicket.restaurantName}
                  onChange={(e) => {
                    setNewTicket({ ...newTicket, restaurantName: e.target.value })
                    if (errors.restaurantName) setErrors({ ...errors, restaurantName: '' })
                  }}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: `1.5px solid ${errors.restaurantName ? '#ef4444' : 'var(--border-color)'}`, background: errors.restaurantName ? 'rgba(239,68,68,0.04)' : 'var(--bg-app)', color: 'var(--text-main)', fontSize: '0.82rem', outline: 'none', transition: 'border-color 0.15s' }}
                >
                  <option value="">Select Restaurant</option>
                  {restaurants.map(r => <option key={r.id} value={r.name}>{r.name}</option>)}
                </select>
                {errors.restaurantName && <span style={{ fontSize: '0.7rem', color: '#ef4444', fontWeight: '600' }}>{errors.restaurantName}</span>}
              </div>

              {/* Subject */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label style={{ fontSize: '0.75rem', fontWeight: '700', color: errors.subject ? '#ef4444' : 'var(--text-main)' }}>Subject / Issue Brief *</label>
                <input
                  type="text"
                  value={newTicket.subject}
                  onChange={(e) => {
                    setNewTicket({ ...newTicket, subject: e.target.value })
                    if (errors.subject) setErrors({ ...errors, subject: '' })
                  }}
                  placeholder="e.g. Menu display issue"
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: `1.5px solid ${errors.subject ? '#ef4444' : 'var(--border-color)'}`, background: errors.subject ? 'rgba(239,68,68,0.04)' : 'var(--bg-app)', color: 'var(--text-main)', fontSize: '0.82rem', outline: 'none', transition: 'border-color 0.15s' }}
                />
                {errors.subject && <span style={{ fontSize: '0.7rem', color: '#ef4444', fontWeight: '600' }}>{errors.subject}</span>}
              </div>

              {/* Category & Priority Row */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <label style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-main)' }}>Category</label>
                  <select
                    value={newTicket.category}
                    onChange={(e) => setNewTicket({ ...newTicket, category: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-app)', color: 'var(--text-main)', fontSize: '0.82rem', outline: 'none' }}
                  >
                    {categories.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <label style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-main)' }}>Priority</label>
                  <select
                    value={newTicket.priority}
                    onChange={(e) => setNewTicket({ ...newTicket, priority: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-app)', color: 'var(--text-main)', fontSize: '0.82rem', outline: 'none' }}
                  >
                    {priorities.map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>
              </div>

              {/* Assign to Staff */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-main)' }}>Initial Assignee</label>
                <select
                  value={newTicket.assignedUser}
                  onChange={(e) => setNewTicket({ ...newTicket, assignedUser: e.target.value })}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-app)', color: 'var(--text-main)', fontSize: '0.82rem', outline: 'none' }}
                >
                  <option value="Unassigned">Leave Unassigned</option>
                  {supportStaff.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>

              {/* Detailed Description */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label style={{ fontSize: '0.75rem', fontWeight: '700', color: errors.description ? '#ef4444' : 'var(--text-main)' }}>Detailed Description *</label>
                <textarea
                  rows="3"
                  value={newTicket.description}
                  onChange={(e) => {
                    setNewTicket({ ...newTicket, description: e.target.value })
                    if (errors.description) setErrors({ ...errors, description: '' })
                  }}
                  placeholder="Describe the issue in detail..."
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: `1.5px solid ${errors.description ? '#ef4444' : 'var(--border-color)'}`, background: errors.description ? 'rgba(239,68,68,0.04)' : 'var(--bg-app)', color: 'var(--text-main)', fontSize: '0.82rem', outline: 'none', resize: 'vertical', transition: 'border-color 0.15s' }}
                />
                {errors.description && <span style={{ fontSize: '0.7rem', color: '#ef4444', fontWeight: '600' }}>{errors.description}</span>}
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: '10px', marginTop: '14px', borderTop: '1px solid var(--border-color)', paddingTop: '16px' }}>
                <button type="submit" className="btn-black" style={{ flex: 1, padding: '10px', borderRadius: '8px', border: 'none', background: '#000000', color: '#ffffff', fontWeight: '700', cursor: 'pointer' }}>Submit Ticket</button>
                <button type="button" className="btn-outline" onClick={() => { setShowCreateModal(false); setErrors({}); }} style={{ flex: 1, padding: '10px', borderRadius: '8px', border: '1px solid var(--border-color)', background: '#ffffff', color: 'var(--text-muted)', fontWeight: '700', cursor: 'pointer' }}>Cancel</button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {/* ASSIGN USER MODAL OVERLAY */}
      {assignTicketId && createPortal(
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
        }} onClick={() => setAssignTicketId(null)}>
          <div className="menu-edit-panel animate-fade-in" style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border-color)',
            borderRadius: '16px',
            padding: '24px',
            width: '90%',
            maxWidth: '380px',
            boxShadow: 'var(--shadow-premium)',
            position: 'relative',
            top: 'auto'
          }} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ fontSize: '1.02rem', fontWeight: '800', color: 'var(--text-main)', margin: '0 0 16px 0' }}>
              Reassign Ticket {assignTicketId}
            </h3>

            <form onSubmit={handleAssignTicketSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-main)' }}>Support Agent</label>
                <select
                  value={assignUser}
                  onChange={(e) => setAssignUser(e.target.value)}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-app)', color: 'var(--text-main)', fontSize: '0.82rem', outline: 'none' }}
                >
                  <option value="">Select Agent</option>
                  <option value="Unassigned">Unassigned</option>
                  {supportStaff.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>

              <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
                <button type="submit" className="btn-black" style={{ flex: 1, padding: '10px', borderRadius: '8px', border: 'none', background: '#000000', color: '#ffffff', fontWeight: '700', cursor: 'pointer' }}>Reassign</button>
                <button type="button" className="btn-outline" onClick={() => setAssignTicketId(null)} style={{ flex: 1, padding: '10px', borderRadius: '8px', border: '1px solid var(--border-color)', background: '#ffffff', color: 'var(--text-muted)', fontWeight: '700', cursor: 'pointer' }}>Cancel</button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {/* VIEW TICKET DETAILS MODAL OVERLAY */}
      {selectedTicket && createPortal(
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
        }} onClick={() => setSelectedTicket(null)}>
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
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
              <div>
                <span style={{ fontSize: '0.72rem', fontWeight: '800', color: 'hsl(var(--primary-hue), 95%, 52%)', textTransform: 'uppercase' }}>Ticket Details</span>
                <h3 style={{ fontSize: '1.2rem', fontWeight: '900', color: 'var(--text-main)', margin: '4px 0 0 0' }}>
                  {selectedTicket.id}
                </h3>
              </div>
              <span style={{
                fontSize: '0.68rem',
                fontWeight: '800',
                padding: '3px 8px',
                borderRadius: '6px',
                background: getStatusStyle(selectedTicket.status).bg,
                color: getStatusStyle(selectedTicket.status).text,
                textTransform: 'uppercase'
              }}>{selectedTicket.status}</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', borderTop: '1px solid var(--border-color)', paddingTop: '16px' }}>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <span style={{ display: 'block', fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: '700', textTransform: 'uppercase' }}>Restaurant Name</span>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-main)', fontWeight: '700' }}>{selectedTicket.restaurantName}</span>
                </div>
                <div>
                  <span style={{ display: 'block', fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: '700', textTransform: 'uppercase' }}>Category / Topic</span>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-main)', fontWeight: '700' }}>{selectedTicket.category}</span>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <span style={{ display: 'block', fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: '700', textTransform: 'uppercase' }}>Assigned Support Agent</span>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-main)', fontWeight: '700' }}>{selectedTicket.assignedUser}</span>
                </div>
                <div>
                  <span style={{ display: 'block', fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: '700', textTransform: 'uppercase' }}>Priority Urgency</span>
                  <span style={{ fontSize: '0.85rem', color: getPriorityStyle(selectedTicket.priority).text, fontWeight: '700' }}>{selectedTicket.priority}</span>
                </div>
              </div>

              <div>
                <span style={{ display: 'block', fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: '700', textTransform: 'uppercase' }}>Subject brief</span>
                <span style={{ fontSize: '0.88rem', color: 'var(--text-main)', fontWeight: '700' }}>{selectedTicket.subject}</span>
              </div>

              <div>
                <span style={{ display: 'block', fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: '700', textTransform: 'uppercase' }}>Full Issue Description</span>
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
                  {selectedTicket.description}
                </div>
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                {selectedTicket.status !== 'Resolved' && selectedTicket.status !== 'Closed' && (
                  <button
                    onClick={() => {
                      handleQuickResolve(selectedTicket.id)
                      setSelectedTicket(null)
                    }}
                    className="btn-black"
                    style={{ flex: 1, padding: '10px', borderRadius: '8px', border: 'none', background: '#10b981', color: '#ffffff', fontWeight: '700', cursor: 'pointer' }}
                  >
                    Mark Resolved
                  </button>
                )}
                <button type="button" className="btn-outline" onClick={() => setSelectedTicket(null)} style={{ flex: 1, padding: '10px', borderRadius: '8px', border: '1px solid var(--border-color)', background: '#ffffff', color: 'var(--text-muted)', fontWeight: '700', cursor: 'pointer' }}>Close Details</button>
              </div>

            </div>
          </div>
        </div>,
        document.body
      )}

    </div>
  )
}
