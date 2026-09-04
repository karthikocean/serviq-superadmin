import React, { useState, useEffect } from 'react'
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
  ChevronDown,
  MessageSquare,
  Send
} from 'lucide-react'

import { useRestaurant } from '../../hooks/useRestaurants'
import { useNotification } from '../../contexts/NotificationContext'
import { TableTopControls, TableBottomPagination } from '../../components/common/TablePagination'
import CustomSelect, { ValidatedSelect } from '../../components/common/CustomSelect'
import { getTickets, createTicket, updateTicketStatus, assignTicket, replyToTicket } from '../../services/ticketService'
import { useAuth } from '../../contexts/AuthContext'

export default function TicketsPage() {
  const [tickets, setTickets] = useState([])
  const [totalRecords, setTotalRecords] = useState(0)
  const { restaurants } = useRestaurant()
  const { showToast } = useNotification()
  const { hasPermission, isSuperOwner } = useAuth()

  const canAdd = isSuperOwner || hasPermission('tickets', 'add')
  const canEdit = isSuperOwner || hasPermission('tickets', 'edit')
  const canDelete = isSuperOwner || hasPermission('tickets', 'delete')
  const canView = isSuperOwner || hasPermission('tickets', 'view')

  // Filters & Search
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')
  const [priorityFilter, setPriorityFilter] = useState('All')
  const [categoryFilter, setCategoryFilter] = useState('All')

  // Modals & Forms State
  const [selectedTicket, setSelectedTicket] = useState(null)
  const [replyText, setReplyText] = useState('')
  const [assignUser, setAssignUser] = useState('')
  const [assignTicketId, setAssignTicketId] = useState(null)
  const [assignTicketData, setAssignTicketData] = useState(null) // full ticket obj for assign
  const [assignError, setAssignError] = useState('')

  // Listen for sidebar click reset event to open main module list
  useEffect(() => {
    const handleReset = () => {
      setSelectedTicket(null)
      setAssignTicketId(null)
      setAssignTicketData(null)
    }
    window.addEventListener('reset_module_view', handleReset)
    return () => window.removeEventListener('reset_module_view', handleReset)
  }, [])

  // Constants
  const categories = ['QR Scanning', 'Billing', 'KDS Lag', 'Menu', 'Other']
  const priorities = ['Low', 'Medium', 'High']
  const statuses = ['Open', 'In Progress', 'Resolved']
  const supportStaff = ['Admin User', 'Jane Doe (Support)', 'John Smith (Dev)', 'Platform Super']

  const [currentPage, setCurrentPage] = useState(0)
  const [entriesPerPage, setEntriesPerPage] = useState(10)

  // Handlers
  const fetchTickets = async () => {
    try {
      const data = await getTickets({
        page: currentPage,
        limit: entriesPerPage,
        searchTerm,
        statusFilter,
        priorityFilter,
        categoryFilter
      })
      setTickets(data.data || [])
      setTotalRecords(data.pagination?.totalItems ?? data.total ?? data.count ?? (data.data ? data.data.length : 0))
    } catch (error) {
      console.error(error)
      showToast('error', 'Failed to fetch tickets')
    }
  }

  useEffect(() => {
    fetchTickets()
  }, [currentPage, entriesPerPage, searchTerm, statusFilter, priorityFilter, categoryFilter])



  const handleQuickResolve = async (ticketId) => {
    try {
      await updateTicketStatus(ticketId, 'Resolved')
      showToast('success', `Ticket has been marked as RESOLVED.`)
      fetchTickets()
      if (selectedTicket && selectedTicket._id === ticketId) {
        setSelectedTicket(null)
      }
    } catch (error) {
      showToast('error', 'Failed to resolve ticket')
    }
  }

  const handleMarkInProgress = async (ticketId) => {
    try {
      await updateTicketStatus(ticketId, 'In Progress')
      showToast('success', `Ticket marked as IN PROGRESS.`)
      fetchTickets()
      if (selectedTicket && selectedTicket._id === ticketId) {
        setSelectedTicket(prev => prev ? { ...prev, status: 'In Progress' } : null)
      }
    } catch (error) {
      showToast('error', 'Failed to update ticket status')
    }
  }

  const handleUpdateStatus = async (ticketId, nextStatus) => {
    try {
      await updateTicketStatus(ticketId, nextStatus)
      showToast('success', `Ticket status changed to ${nextStatus.toUpperCase()}`)
      fetchTickets()
    } catch (error) {
      showToast('error', 'Failed to update ticket status')
    }
  }

  const handleSendReply = async () => {
    if (!replyText.trim()) return
    try {
      if (typeof replyToTicket === 'function') {
        await replyToTicket(selectedTicket._id, replyText.trim())
      }
      showToast('success', 'Reply sent successfully.')
      setReplyText('')
      fetchTickets()
    } catch (error) {
      showToast('error', 'Failed to send reply')
    }
  }

  const handleAssignTicketSubmit = async (e) => {
    e.preventDefault()
    if (!assignUser) {
      setAssignError('Please select a support agent')
      return
    }
    setAssignError('')
    try {
      await assignTicket(assignTicketId, assignUser)
      setAssignTicketId(null)
      setAssignTicketData(null)
      setAssignUser('')
      showToast('success', `Ticket successfully assigned to ${assignUser}`)
      fetchTickets()
    } catch (error) {
      showToast('error', 'Failed to assign ticket')
    }
  }


  const isTicketUnassigned = (t) => {
    const u = t?.assignedUser || t?.assignedTo
    return !u || u.trim() === '' || u.toLowerCase() === 'unassigned' || u === 'null' || u === 'undefined'
  }

  const paginatedTickets = tickets.filter(t => t.status !== 'Closed')

  // Statistics
  const openCount = tickets.filter(t => t.status === 'Open').length
  const progressCount = tickets.filter(t => t.status === 'In Progress').length
  const resolvedCount = tickets.filter(t => t.status === 'Resolved').length

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
      position: 'relative'
    }}>
      
      {/* Overview Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
        {[
          { label: 'Open Tickets', count: openCount, bg: 'rgba(239, 68, 68, 0.04)', border: 'rgba(239, 68, 68, 0.12)', color: '#ef4444' },
          { label: 'In Progress', count: progressCount, bg: 'rgba(245, 158, 11, 0.04)', border: 'rgba(245, 158, 11, 0.12)', color: '#f59e0b' },
          { label: 'Resolved', count: resolvedCount, bg: 'rgba(16, 185, 129, 0.04)', border: 'rgba(16, 185, 129, 0.12)', color: '#10b981' },
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
        </div>

        {/* Controls Bar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          
          {/* Search and Filters */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap', flex: 1 }}>
            <div style={{ position: 'relative', minWidth: '240px', flex: '1 1 auto' }}>
              <input
                type="text"
                value={searchTerm}
                onKeyDown={(e) => {
                  if (e.key === ' ' || e.code === 'Space' || e.keyCode === 32) {
                    e.preventDefault();
                  }
                }}
                onChange={(e) => setSearchTerm(e.target.value.replace(/\s+/g, ''))}
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
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
              <div style={{ width: '145px' }}>
                <CustomSelect
                  options={['All', ...statuses].map(s => ({ value: s, label: s === 'All' ? 'All Statuses' : s }))}
                  value={statusFilter}
                  onChange={(val) => setStatusFilter(typeof val === 'object' && val !== null && val.target ? val.target.value : val)}
                />
              </div>

              <div style={{ width: '145px' }}>
                <CustomSelect
                  options={['All', ...priorities].map(p => ({ value: p, label: p === 'All' ? 'All Priorities' : p }))}
                  value={priorityFilter}
                  onChange={(val) => setPriorityFilter(typeof val === 'object' && val !== null && val.target ? val.target.value : val)}
                />
              </div>

              <div style={{ width: '155px' }}>
                <CustomSelect
                  options={['All', ...categories].map(c => ({ value: c, label: c === 'All' ? 'All Categories' : c }))}
                  value={categoryFilter}
                  onChange={(val) => setCategoryFilter(typeof val === 'object' && val !== null && val.target ? val.target.value : val)}
                />
              </div>

              <button
                onClick={() => {
                  setSearchTerm('')
                  setStatusFilter('All')
                  setPriorityFilter('All')
                  setCategoryFilter('All')
                  setCurrentPage(0)
                }}
                className="btn-outline"
                style={{ padding: '8px 12px', borderRadius: '10px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}
                title="Reset Filters"
              >
                <RefreshCw style={{ width: '13px', height: '13px' }} />
                Reset
              </button>
            </div>
          </div>
        </div>

        {/* Table View */}
        <div style={{ overflowX: 'auto', background: 'var(--bg-app)', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
          <table className="menu-data-table" style={{ width: '100%', borderCollapse: 'collapse', whiteSpace: 'nowrap' }}>
            <thead>
              <tr style={{ background: 'rgba(255,255,255,0.02)' }}>
                <th style={{ textAlign: 'left', padding: '12px 18px', fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '800' }}>Ticket #</th>
                <th style={{ textAlign: 'left', padding: '12px 18px', fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '800' }}>Restaurant</th>
                <th style={{ textAlign: 'left', padding: '12px 18px', fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '800' }}>Subject</th>
                <th style={{ textAlign: 'left', padding: '12px 18px', fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '800' }}>Category</th>
                <th style={{ textAlign: 'center', padding: '12px 18px', fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '800' }}>Priority</th>
                <th style={{ textAlign: 'left', padding: '12px 18px', fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '800' }}>Assigned To</th>
                <th style={{ textAlign: 'center', padding: '12px 18px', fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '800' }}>Status</th>
                <th style={{ textAlign: 'right', padding: '12px 18px', fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '800' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedTickets.length > 0 ? (
                paginatedTickets.map((ticket) => {
                  const priorityStyle = getPriorityStyle(ticket.priority)
                  const statusStyle = getStatusStyle(ticket.status)
                  const isUnassigned = isTicketUnassigned(ticket)

                  return (
                    <tr key={ticket._id} style={{ borderBottom: '1px solid var(--border-color)', transition: 'background-color 0.2s' }}>
                      <td style={{ padding: '14px 18px', fontSize: '0.8rem', color: 'var(--text-main)', fontWeight: '800', fontFamily: 'monospace', verticalAlign: 'middle' }}>
                        {ticket.ticketNumber}
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
                          <span>{isUnassigned ? 'Unassigned' : ticket.assignedUser}</span>
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
                          <span>{ticket.status}</span>
                        </div>
                      </td>
                      <td style={{ padding: '14px 18px', verticalAlign: 'middle', textAlign: 'right', width: '160px' }}>
                        <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                          {canView && (
                            <button
                              onClick={() => { setSelectedTicket(ticket); setReplyText(''); }}
                              className="btn-outline"
                              style={{ padding: '5px 10px', fontSize: '0.7rem', borderRadius: '6px', cursor: 'pointer' }}
                            >
                              View
                            </button>
                          )}
                          {canEdit && isUnassigned && (
                            <button
                              onClick={() => {
                                setAssignTicketId(ticket._id)
                                setAssignTicketData(ticket)
                                setAssignUser('')
                              }}
                              className="btn-outline"
                              style={{ padding: '5px 10px', fontSize: '0.7rem', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '3px' }}
                            >
                              <UserPlus style={{ width: '11px', height: '11px' }} />
                              Assign
                            </button>
                          )}
                          {!canView && (!canEdit || !isUnassigned) && (
                            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>-</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })
              ) : (
                <tr>
                  <td colSpan="6" style={{ padding: '40px 18px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                    No support tickets found matching current criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <TableBottomPagination
          totalEntries={totalRecords || tickets.length}
          currentPage={currentPage}
          entriesPerPage={entriesPerPage}
          onPageChange={setCurrentPage}
        />
      </div>


      {/* ASSIGN TICKET MODAL OVERLAY */}
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
        }} onClick={() => { setAssignTicketId(null); setAssignTicketData(null); }}>
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
            <h3 style={{ fontSize: '1.02rem', fontWeight: '800', color: 'var(--text-main)', margin: '0 0 4px 0' }}>
              Assign Ticket
            </h3>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: '0 0 16px 0' }}>
              Ticket: <strong>{assignTicketData?.ticketNumber}</strong>
            </p>

            <form onSubmit={handleAssignTicketSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <ValidatedSelect
                  label="Support Agent"
                  required
                  value={assignUser}
                  onChange={(e) => {
                    const selected = typeof e === 'object' && e !== null && e.target ? e.target.value : e
                    setAssignUser(selected)
                    if (assignError) setAssignError('')
                  }}
                  error={assignError}
                  setError={setAssignError}
                  options={[
                    { value: '', label: 'Select Agent' },
                    ...supportStaff.map(s => ({ value: s, label: s }))
                  ]}
                  placeholder="Select Agent"
                />

              <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
                <button type="submit" className="btn-black" style={{ flex: 1, padding: '10px', borderRadius: '8px', border: 'none', background: '#000000', color: '#ffffff', fontWeight: '700', cursor: 'pointer' }}>
                  Assign
                </button>
                <button type="button" className="btn-outline" onClick={() => { setAssignTicketId(null); setAssignTicketData(null); }} style={{ flex: 1, padding: '10px', borderRadius: '8px', border: '1px solid var(--border-color)', background: '#ffffff', color: 'var(--text-muted)', fontWeight: '700', cursor: 'pointer' }}>Cancel</button>
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
          alignItems: 'flex-start',
          zIndex: 99999,
          padding: '40px 20px',
          overflowY: 'auto'
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
            top: 'auto',
            marginTop: 'auto',
            marginBottom: 'auto'
          }} onClick={(e) => e.stopPropagation()}>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
              <div>
                <span style={{ fontSize: '0.72rem', fontWeight: '800', color: 'hsl(var(--primary-hue), 95%, 52%)', textTransform: 'uppercase' }}>Ticket Details</span>
                <h3 style={{ fontSize: '1.2rem', fontWeight: '900', color: 'var(--text-main)', margin: '4px 0 0 0' }}>
                  {selectedTicket.ticketNumber}
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
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-main)', fontWeight: '700' }}>{selectedTicket.assignedUser || 'Unassigned'}</span>
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

              {/* Reply Field */}
              {canEdit && (
                <div>
                  <span style={{ display: 'block', fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: '700', textTransform: 'uppercase', marginBottom: '6px' }}>
                    <MessageSquare style={{ width: '11px', height: '11px', display: 'inline', marginRight: '4px' }} />
                    Reply to Customer
                  </span>
                  <textarea
                    rows={3}
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder="Type your reply here..."
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: '8px',
                      border: '1.5px solid var(--border-color)',
                      background: 'var(--bg-app)',
                      color: 'var(--text-main)',
                      fontSize: '0.82rem',
                      outline: 'none',
                      resize: 'vertical',
                      boxSizing: 'border-box'
                    }}
                  />
                  <button
                    type="button"
                    onClick={handleSendReply}
                    disabled={!replyText.trim()}
                    style={{
                      marginTop: '8px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '7px 14px',
                      borderRadius: '8px',
                      background: replyText.trim() ? '#3b82f6' : 'var(--border-color)',
                      color: replyText.trim() ? '#fff' : 'var(--text-muted)',
                      border: 'none',
                      fontSize: '0.78rem',
                      fontWeight: '700',
                      cursor: replyText.trim() ? 'pointer' : 'not-allowed'
                    }}
                  >
                    <Send style={{ width: '13px', height: '13px' }} /> Send Reply
                  </button>
                </div>
              )}

              {/* Status Action Buttons */}
              <div style={{ display: 'flex', gap: '10px', marginTop: '4px' }}>
                {canEdit && selectedTicket.status !== 'In Progress' && (
                  <button
                    onClick={() => handleMarkInProgress(selectedTicket._id)}
                    className="btn-outline"
                    style={{ flex: 1, padding: '10px', borderRadius: '8px', border: '1.5px solid #f59e0b', color: '#f59e0b', background: 'rgba(245,158,11,0.06)', fontWeight: '700', cursor: 'pointer', fontSize: '0.82rem' }}
                  >
                    Mark In Progress
                  </button>
                )}
                <button type="button" className="btn-outline" onClick={() => setSelectedTicket(null)} style={{ flex: 1, padding: '10px', borderRadius: '8px', border: '1px solid var(--border-color)', background: '#ffffff', color: 'var(--text-muted)', fontWeight: '700', cursor: 'pointer', fontSize: '0.82rem' }}>Close Details</button>
              </div>

            </div>
          </div>
        </div>,
        document.body
      )}

    </div>
  )
}
