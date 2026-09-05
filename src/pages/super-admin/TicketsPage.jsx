import React, { useState, useEffect, useRef } from 'react'
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
  Send,
  Check
} from 'lucide-react'

import { useRestaurant } from '../../hooks/useRestaurants'
import { useNotification } from '../../contexts/NotificationContext'
import { TableTopControls, TableBottomPagination } from '../../components/common/TablePagination'
import CustomSelect, { ValidatedSelect } from '../../components/common/CustomSelect'
import { getTickets, createTicket, updateTicketStatus, assignTicket, replyToTicket } from '../../services/ticketService'
import { useAuth } from '../../contexts/AuthContext'

// ─── Custom Floating Ticket Assign Dropdown ───
const TicketAssignDropdown = ({ ticket, canEdit, supportStaff, onAssign }) => {
  const [isOpen, setIsOpen] = useState(false)
  const buttonRef = useRef(null)
  const menuRef = useRef(null)
  const [coords, setCoords] = useState({ top: 0, left: 0, width: 190 })

  const updatePosition = () => {
    if (!buttonRef.current) return
    const rect = buttonRef.current.getBoundingClientRect()
    const estimatedHeight = Math.min(supportStaff.length * 36 + 40, 220)
    const spaceBelow = window.innerHeight - rect.bottom
    const spaceAbove = rect.top
    const openUpwards = spaceBelow < estimatedHeight + 10 && spaceAbove > spaceBelow

    const menuWidth = 190
    let left = rect.right - menuWidth
    if (left < 10) left = Math.max(10, rect.left)
    if (left + menuWidth > window.innerWidth - 10) left = window.innerWidth - menuWidth - 10

    const top = openUpwards
      ? Math.max(10, rect.top - estimatedHeight - 4)
      : Math.min(rect.bottom + 4, window.innerHeight - estimatedHeight - 10)

    setCoords({
      top,
      left,
      width: menuWidth
    })
  }

  const handleToggle = (e) => {
    e.stopPropagation()
    if (ticket.status === 'Resolved' || !canEdit) return
    if (!isOpen) {
      updatePosition()
      setIsOpen(true)
    } else {
      setIsOpen(false)
    }
  }

  useEffect(() => {
    if (!isOpen) return

    const handleScrollOrResize = () => {
      updatePosition()
    }

    const handleClickOutside = (e) => {
      if (
        buttonRef.current && !buttonRef.current.contains(e.target) &&
        menuRef.current && !menuRef.current.contains(e.target)
      ) {
        setIsOpen(false)
      }
    }

    window.addEventListener('resize', handleScrollOrResize)
    window.addEventListener('scroll', handleScrollOrResize, true)
    document.addEventListener('mousedown', handleClickOutside)

    return () => {
      window.removeEventListener('resize', handleScrollOrResize)
      window.removeEventListener('scroll', handleScrollOrResize, true)
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen, supportStaff])

  const isResolved = ticket.status === 'Resolved'

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        disabled={isResolved}
        onClick={handleToggle}
        className="btn-outline"
        style={{
          padding: '5px 10px',
          fontSize: '0.7rem',
          borderRadius: '6px',
          cursor: isResolved ? 'not-allowed' : 'pointer',
          opacity: isResolved ? 0.45 : 1,
          display: 'flex',
          alignItems: 'center',
          gap: '3px',
          borderColor: isOpen ? 'hsl(var(--primary-hue), 95%, 52%)' : undefined,
          background: isOpen ? 'rgba(249, 94, 16, 0.08)' : undefined
        }}
        title={isResolved ? 'Cannot assign resolved ticket' : 'Assign Support Agent'}
      >
        <UserPlus style={{ width: '11px', height: '11px' }} />
        <span>Assign</span>
      </button>

      {isOpen && createPortal(
        <div
          ref={menuRef}
          style={{
            position: 'fixed',
            top: `${coords.top}px`,
            left: `${coords.left}px`,
            width: `${coords.width}px`,
            background: '#ffffff',
            borderRadius: '10px',
            border: '1px solid var(--border-color, #e2e8f0)',
            boxShadow: '0 12px 30px -4px rgba(0, 0, 0, 0.18), 0 6px 12px -2px rgba(0, 0, 0, 0.08)',
            padding: '5px',
            zIndex: 999999,
            maxHeight: '220px',
            overflowY: 'auto'
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <div style={{ padding: '6px 8px 4px', fontSize: '0.68rem', fontWeight: '800', color: 'var(--text-muted, #64748b)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Assign Support Agent
          </div>
          {supportStaff.map((agent) => {
            const isAssigned = ticket.assignedUser === agent || ticket.assignedTo === agent
            return (
              <button
                key={agent}
                type="button"
                onClick={() => {
                  onAssign(ticket._id, agent)
                  setIsOpen(false)
                }}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '7px 10px',
                  borderRadius: '6px',
                  border: 'none',
                  background: isAssigned ? 'rgba(59, 130, 246, 0.08)' : 'transparent',
                  color: isAssigned ? '#2563eb' : 'var(--text-main, #0f172a)',
                  fontSize: '0.78rem',
                  fontWeight: isAssigned ? '700' : '500',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'background 0.12s'
                }}
                onMouseEnter={(e) => {
                  if (!isAssigned) e.currentTarget.style.background = 'rgba(0, 0, 0, 0.04)'
                }}
                onMouseLeave={(e) => {
                  if (!isAssigned) e.currentTarget.style.background = 'transparent'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', overflow: 'hidden' }}>
                  <User style={{ width: '12px', height: '12px', color: isAssigned ? '#2563eb' : 'var(--text-muted)' }} />
                  <span style={{ textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>{agent}</span>
                </div>
                {isAssigned && <Check style={{ width: '13px', height: '13px', color: '#2563eb', flexShrink: 0 }} />}
              </button>
            )
          })}
        </div>,
        document.body
      )}
    </>
  )
}

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
  const [resolveTicketData, setResolveTicketData] = useState(null)
  const [resolveStatus, setResolveStatus] = useState('Resolved')
  const [resolveReply, setResolveReply] = useState('')
  const [isSubmittingResolve, setIsSubmittingResolve] = useState(false)

  // Listen for sidebar click reset event to open main module list
  useEffect(() => {
    const handleReset = () => {
      setSelectedTicket(null)
      setResolveTicketData(null)
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
      const list = Array.isArray(data?.data) ? data.data : Array.isArray(data) ? data : []
      setTickets(list)
      const count = data?.pagination?.totalItems 
        ?? data?.total 
        ?? data?.totalCount 
        ?? data?.count 
        ?? data?.totalRecords
        ?? (Array.isArray(data?.data) ? data.data.length : list.length)
      setTotalRecords(Number(count) || (list.length > 0 ? list.length : 0))
    } catch (error) {
      console.error(error)
      showToast('error', 'Failed to fetch tickets')
    }
  }

  useEffect(() => {
    fetchTickets()
  }, [currentPage, entriesPerPage, searchTerm, statusFilter, priorityFilter, categoryFilter])



  const handleOpenResolveModal = (ticket) => {
    setResolveTicketData(ticket)
    setResolveStatus(ticket.status || 'Open')
    setResolveReply('')
  }

  const handleResolveSubmit = async (e) => {
    e.preventDefault()
    if (!resolveTicketData) return
    setIsSubmittingResolve(true)
    try {
      if (resolveReply.trim()) {
        try {
          await replyToTicket(resolveTicketData._id, resolveReply.trim())
        } catch (replyErr) {
          console.error("Reply error", replyErr)
        }
      }
      if (resolveStatus && resolveStatus !== resolveTicketData.status) {
        await updateTicketStatus(resolveTicketData._id, resolveStatus)
      }
      showToast('success', `Ticket ${resolveTicketData.ticketNumber} updated to ${resolveStatus.toUpperCase()}!`)
      setResolveTicketData(null)
      setResolveReply('')
      fetchTickets()
    } catch (err) {
      console.error(err)
      showToast('error', err.response?.data?.message || 'Failed to update ticket')
    } finally {
      setIsSubmittingResolve(false)
    }
  }

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

  const handleUpdateStatus = async (ticketId, nextStatus) => {
    try {
      await updateTicketStatus(ticketId, nextStatus)
      showToast('success', `Ticket status changed to ${nextStatus.toUpperCase()}`)
      fetchTickets()
    } catch (error) {
      showToast('error', 'Failed to update ticket status')
    }
  }

  const handleAssignTicket = async (ticketId, agentName) => {
    try {
      await assignTicket(ticketId, agentName)
      showToast('success', `Ticket successfully assigned to ${agentName}`)
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
      {!resolveTicketData && (
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
      )}

      {/* Main Glass Card with Controls & Grid or Page Style Resolve Form */}
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
            <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: '900', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              {resolveTicketData ? (
                <>
                  <span>Resolve / Process Ticket</span>
                  <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontFamily: 'monospace' }}>#{resolveTicketData.ticketNumber}</span>
                </>
              ) : (
                'Support Ticket Management'
              )}
            </h3>
          </div>
          {resolveTicketData && (
            <button
              type="button"
              className="btn-outline"
              onClick={() => setResolveTicketData(null)}
              style={{ display: 'flex', alignItems: 'center', gap: '6px', borderRadius: '8px', padding: '7px 14px', cursor: 'pointer' }}
            >
              Back to Tickets
            </button>
          )}
        </div>

        {/* PAGE STYLE RESOLVE VIEW */}
        {resolveTicketData ? (
          <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <form onSubmit={handleResolveSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              
              {/* Ticket Overview Banner */}
              <div style={{
                background: 'var(--bg-app)',
                border: '1px solid var(--border-color)',
                borderRadius: '12px',
                padding: '20px',
                display: 'flex',
                flexDirection: 'column',
                gap: '16px'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                  <div>
                    <span style={{ fontSize: '0.72rem', fontWeight: '800', color: 'hsl(var(--primary-hue), 95%, 52%)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      Ticket Information
                    </span>
                    <h4 style={{ margin: '4px 0 0 0', fontSize: '1.1rem', fontWeight: '900', color: 'var(--text-main)' }}>
                      {resolveTicketData.subject}
                    </h4>
                  </div>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <span style={{
                      padding: '4px 10px',
                      borderRadius: '6px',
                      fontSize: '0.75rem',
                      fontWeight: '700',
                      background: getPriorityStyle(resolveTicketData.priority).bg,
                      color: getPriorityStyle(resolveTicketData.priority).text
                    }}>
                      Priority: {resolveTicketData.priority}
                    </span>
                    <span style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      padding: '4px 10px',
                      borderRadius: '6px',
                      fontSize: '0.75rem',
                      fontWeight: '800',
                      background: getStatusStyle(resolveTicketData.status).bg,
                      color: getStatusStyle(resolveTicketData.status).text
                    }}>
                      {getStatusStyle(resolveTicketData.status).icon}
                      Current: {resolveTicketData.status}
                    </span>
                  </div>
                </div>

                {/* Info Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px', paddingTop: '12px', borderTop: '1px solid var(--border-color)' }}>
                  <div>
                    <span style={{ display: 'block', fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: '700', textTransform: 'uppercase' }}>Restaurant</span>
                    <strong style={{ fontSize: '0.88rem', color: 'var(--text-main)' }}>{resolveTicketData.restaurantName}</strong>
                  </div>
                  <div>
                    <span style={{ display: 'block', fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: '700', textTransform: 'uppercase' }}>Category / Topic</span>
                    <strong style={{ fontSize: '0.88rem', color: 'var(--text-main)' }}>{resolveTicketData.category}</strong>
                  </div>
                  <div>
                    <span style={{ display: 'block', fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: '700', textTransform: 'uppercase' }}>Assigned Support Agent</span>
                    <strong style={{ fontSize: '0.88rem', color: 'var(--text-main)' }}>{resolveTicketData.assignedUser || 'Unassigned'}</strong>
                  </div>
                  <div>
                    <span style={{ display: 'block', fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: '700', textTransform: 'uppercase' }}>Ticket #</span>
                    <strong style={{ fontSize: '0.88rem', color: 'var(--text-main)', fontFamily: 'monospace' }}>{resolveTicketData.ticketNumber}</strong>
                  </div>
                </div>

                {/* Full Description */}
                <div>
                  <span style={{ display: 'block', fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: '700', textTransform: 'uppercase', marginBottom: '6px' }}>
                    Full Issue Description
                  </span>
                  <div style={{
                    padding: '12px 14px',
                    background: 'var(--bg-card)',
                    borderRadius: '8px',
                    border: '1px solid var(--border-color)',
                    fontSize: '0.85rem',
                    color: 'var(--text-main)',
                    lineHeight: '1.5',
                    whiteSpace: 'pre-wrap'
                  }}>
                    {resolveTicketData.description || 'No description provided.'}
                  </div>
                </div>
              </div>

              {/* Status Update & Resolution Note Section */}
              <div style={{
                background: 'var(--bg-app)',
                border: '1px solid var(--border-color)',
                borderRadius: '12px',
                padding: '20px',
                display: 'flex',
                flexDirection: 'column',
                gap: '16px'
              }}>
                {/* Status Selector */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: 'var(--text-main)', textTransform: 'uppercase', marginBottom: '8px' }}>
                    Update Ticket Status <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(120px, 180px))', gap: '10px' }}>
                    {[
                      { label: 'In Progress', value: 'In Progress', color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.1)', border: '#f59e0b' },
                      { label: 'Resolved', value: 'Resolved', color: '#10b981', bg: 'rgba(16, 185, 129, 0.1)', border: '#10b981' },
                      { label: 'Open', value: 'Open', color: '#3b82f6', bg: 'rgba(59, 130, 246, 0.1)', border: '#3b82f6' }
                    ].map((s) => {
                      const isSelected = resolveStatus === s.value
                      return (
                        <button
                          key={s.value}
                          type="button"
                          onClick={() => setResolveStatus(s.value)}
                          style={{
                            padding: '10px 14px',
                            borderRadius: '8px',
                            border: isSelected ? `2px solid ${s.border}` : '1.5px solid var(--border-color)',
                            background: isSelected ? s.bg : 'var(--bg-card)',
                            color: isSelected ? s.color : 'var(--text-main)',
                            fontSize: '0.82rem',
                            fontWeight: isSelected ? '800' : '600',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '6px',
                            transition: 'all 0.15s ease'
                          }}
                        >
                          {isSelected && <CheckCircle style={{ width: '14px', height: '14px' }} />}
                          {s.label}
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* Resolution Reply / Note */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: 'var(--text-main)', textTransform: 'uppercase', marginBottom: '8px' }}>
                    <MessageSquare style={{ width: '13px', height: '13px', display: 'inline', marginRight: '5px' }} />
                    Reply / Resolution Message
                  </label>
                  <textarea
                    rows={4}
                    value={resolveReply}
                    onChange={(e) => setResolveReply(e.target.value)}
                    placeholder="Type resolution notes, actions taken, or a response for the customer..."
                    style={{
                      width: '100%',
                      padding: '12px 14px',
                      borderRadius: '8px',
                      border: '1.5px solid var(--border-color)',
                      background: 'var(--bg-card)',
                      color: 'var(--text-main)',
                      fontSize: '0.85rem',
                      outline: 'none',
                      resize: 'vertical',
                      boxSizing: 'border-box',
                      minHeight: '100px'
                    }}
                  />
                </div>
              </div>

              {/* Form Action Buttons */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '4px' }}>
                <button
                  type="button"
                  onClick={() => setResolveTicketData(null)}
                  className="btn-outline"
                  style={{
                    padding: '10px 20px',
                    borderRadius: '8px',
                    fontWeight: '700',
                    cursor: 'pointer',
                    fontSize: '0.85rem'
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingResolve}
                  style={{
                    padding: '10px 22px',
                    borderRadius: '8px',
                    background: '#000000',
                    color: '#ffffff',
                    border: 'none',
                    fontSize: '0.85rem',
                    fontWeight: '700',
                    cursor: isSubmittingResolve ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                >
                  <Send style={{ width: '14px', height: '14px' }} />
                  {isSubmittingResolve ? 'Updating Ticket...' : 'Save & Update Ticket'}
                </button>
              </div>

            </form>
          </div>
        ) : (
          <>
            {/* Controls Bar */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', marginBottom: '4px' }}>
              
              {/* Show Entries Selector */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', color: '#475569', fontWeight: '500' }}>
                <span>Show</span>
                <div style={{ width: '80px' }}>
                  <CustomSelect
                    options={[
                      { value: 5, label: '5' },
                      { value: 10, label: '10' },
                      { value: 25, label: '25' },
                      { value: 50, label: '50' },
                      { value: 100, label: '100' }
                    ]}
                    value={entriesPerPage}
                    onChange={(val) => {
                      setEntriesPerPage(Number(typeof val === 'object' && val !== null && val.target ? val.target.value : val))
                      setCurrentPage(0)
                    }}
                  />
                </div>
                <span>entries</span>
              </div>

              {/* Search and Filters */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
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
                          <td style={{ padding: '14px 18px', verticalAlign: 'middle', textAlign: 'right', width: '220px' }}>
                            <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end', alignItems: 'center' }}>
                              {canView && (
                                <button
                                  onClick={() => setSelectedTicket(ticket)}
                                  className="btn-outline"
                                  style={{ padding: '5px 10px', fontSize: '0.7rem', borderRadius: '6px', cursor: 'pointer' }}
                                >
                                  View
                                </button>
                              )}
                              {canEdit && (
                                <TicketAssignDropdown
                                  ticket={ticket}
                                  canEdit={canEdit}
                                  supportStaff={supportStaff}
                                  onAssign={handleAssignTicket}
                                />
                              )}
                              {canEdit && (
                                <button
                                  disabled={ticket.status === 'Resolved'}
                                  onClick={() => {
                                    if (ticket.status === 'Resolved') return
                                    handleOpenResolveModal(ticket)
                                  }}
                                  className="btn-outline"
                                  style={{
                                    padding: '5px 10px',
                                    fontSize: '0.7rem',
                                    borderRadius: '6px',
                                    cursor: ticket.status === 'Resolved' ? 'not-allowed' : 'pointer',
                                    opacity: ticket.status === 'Resolved' ? 0.45 : 1,
                                    border: ticket.status === 'Resolved' ? '1px solid var(--border-color)' : '1px solid #10b981',
                                    color: ticket.status === 'Resolved' ? 'var(--text-muted)' : '#10b981',
                                    background: ticket.status === 'Resolved' ? 'transparent' : 'rgba(16, 185, 129, 0.06)',
                                    fontWeight: '700',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '3px'
                                  }}
                                  title={ticket.status === 'Resolved' ? 'Ticket is already resolved' : 'Resolve Ticket'}
                                >
                                  <CheckCircle style={{ width: '11px', height: '11px' }} />
                                  Resolve
                                </button>
                              )}
                              {!canView && !canEdit && (
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
          </>
        )}
      </div>

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
          padding: '16px',
          boxSizing: 'border-box'
        }} onClick={() => setSelectedTicket(null)}>
          <div className="animate-fade-in" style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border-color)',
            borderRadius: '16px',
            padding: '24px',
            width: '100%',
            maxWidth: '520px',
            maxHeight: 'min(90vh, 580px)',
            display: 'flex',
            flexDirection: 'column',
            boxShadow: '0 20px 40px -8px rgba(0,0,0,0.24), 0 8px 16px -4px rgba(0,0,0,0.12)',
            position: 'relative',
            boxSizing: 'border-box',
            overflow: 'hidden',
            margin: 'auto'
          }} onClick={(e) => e.stopPropagation()}>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px', flexShrink: 0 }}>
              <div>
                <span style={{ fontSize: '0.7rem', fontWeight: '800', color: 'hsl(var(--primary-hue), 95%, 52%)', textTransform: 'uppercase' }}>Ticket Details</span>
                <h3 style={{ fontSize: '1.15rem', fontWeight: '900', color: 'var(--text-main)', margin: '3px 0 0 0' }}>
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

            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
              borderTop: '1px solid var(--border-color)',
              paddingTop: '12px',
              overflowY: 'auto',
              flex: 1,
              minHeight: 0,
              paddingRight: '2px'
            }}>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <span style={{ display: 'block', fontSize: '0.68rem', color: 'var(--text-muted)', fontWeight: '700', textTransform: 'uppercase' }}>Restaurant Name</span>
                  <span style={{ fontSize: '0.82rem', color: 'var(--text-main)', fontWeight: '700' }}>{selectedTicket.restaurantName}</span>
                </div>
                <div>
                  <span style={{ display: 'block', fontSize: '0.68rem', color: 'var(--text-muted)', fontWeight: '700', textTransform: 'uppercase' }}>Category / Topic</span>
                  <span style={{ fontSize: '0.82rem', color: 'var(--text-main)', fontWeight: '700' }}>{selectedTicket.category}</span>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <span style={{ display: 'block', fontSize: '0.68rem', color: 'var(--text-muted)', fontWeight: '700', textTransform: 'uppercase' }}>Assigned Support Agent</span>
                  <span style={{ fontSize: '0.82rem', color: 'var(--text-main)', fontWeight: '700' }}>{selectedTicket.assignedUser || 'Unassigned'}</span>
                </div>
                <div>
                  <span style={{ display: 'block', fontSize: '0.68rem', color: 'var(--text-muted)', fontWeight: '700', textTransform: 'uppercase' }}>Priority Urgency</span>
                  <span style={{ fontSize: '0.82rem', color: getPriorityStyle(selectedTicket.priority).text, fontWeight: '700' }}>{selectedTicket.priority}</span>
                </div>
              </div>

              <div>
                <span style={{ display: 'block', fontSize: '0.68rem', color: 'var(--text-muted)', fontWeight: '700', textTransform: 'uppercase' }}>Subject brief</span>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-main)', fontWeight: '700' }}>{selectedTicket.subject}</span>
              </div>

              <div>
                <span style={{ display: 'block', fontSize: '0.68rem', color: 'var(--text-muted)', fontWeight: '700', textTransform: 'uppercase' }}>Full Issue Description</span>
                <div style={{
                  padding: '10px 12px',
                  background: 'var(--bg-app)',
                  borderRadius: '8px',
                  border: '1px solid var(--border-color)',
                  fontSize: '0.8rem',
                  color: 'var(--text-main)',
                  lineHeight: '1.45',
                  marginTop: '4px',
                  whiteSpace: 'pre-wrap'
                }}>
                  {selectedTicket.description}
                </div>
              </div>

              {/* View only close button */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '6px', flexShrink: 0 }}>
                <button
                  type="button"
                  className="btn-outline"
                  onClick={() => setSelectedTicket(null)}
                  style={{
                    width: '100%',
                    padding: '9px',
                    borderRadius: '8px',
                    border: '1.5px solid var(--border-color)',
                    background: '#ffffff',
                    color: 'var(--text-main)',
                    fontWeight: '700',
                    cursor: 'pointer',
                    fontSize: '0.82rem',
                    textAlign: 'center'
                  }}
                >
                  Close Details
                </button>
              </div>

            </div>
          </div>
        </div>,
        document.body
      )}

    </div>
  )
}
