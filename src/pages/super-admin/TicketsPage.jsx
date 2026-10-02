import React, { useState, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { useNavigate } from 'react-router-dom'
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
  UserX,
  RotateCcw,
  Tag,
  ChevronDown,
  MessageSquare,
  Send,
  Check,
  ExternalLink,
  Users,
  Zap,
  Building,
  Mail,
  MapPin,
  Calendar,
  Paperclip,
  Loader2,
  FileText
} from 'lucide-react'

import { useRestaurant } from '../../hooks/useRestaurants'
import { useNotification } from '../../contexts/NotificationContext'
import { TableTopControls, TableBottomPagination } from '../../components/common/TablePagination'
import CustomSelect, { ValidatedSelect } from '../../components/common/CustomSelect'
import {
  getTickets,
  getTicketById,
  createTicket,
  updateTicketStatus,
  assignTicket,
  replyToTicket,
  updateTicket
} from '../../services/ticketService'
import { getManagers } from '../../services/api'
import { useAuth } from '../../contexts/AuthContext'
import { ROUTES } from '../../constants/routes'

// ─── Custom Floating Ticket Assign Dropdown ───
const TicketAssignDropdown = ({ ticket, canEdit, supportStaff, onAssign }) => {
  const navigate = useNavigate()
  const [isOpen, setIsOpen] = useState(false)
  const buttonRef = useRef(null)
  const menuRef = useRef(null)
  const [coords, setCoords] = useState({ top: 0, left: 0, width: 230 })
  const [customName, setCustomName] = useState('')
  const [showCustomInput, setShowCustomInput] = useState(false)

  const updatePosition = () => {
    if (!buttonRef.current) return
    const rect = buttonRef.current.getBoundingClientRect()
    const estimatedHeight = Math.min((supportStaff.length + 3) * 36 + 60, 290)
    const spaceBelow = window.innerHeight - rect.bottom
    const spaceAbove = rect.top
    const openUpwards = spaceBelow < estimatedHeight + 10 && spaceAbove > spaceBelow

    const menuWidth = 230
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
      setShowCustomInput(false)
      setCustomName('')
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
  const rawAssigned = ticket.assignedUser || ticket.assignedTo || ''
  const currentAssigned = typeof rawAssigned === 'object' && rawAssigned !== null
    ? (rawAssigned.name || rawAssigned.userName || '')
    : (typeof rawAssigned === 'string' ? rawAssigned : String(rawAssigned || ''))
  const isCurrentlyUnassigned = !currentAssigned || currentAssigned.toLowerCase() === 'unassigned'

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
            padding: '6px',
            zIndex: 999999,
            maxHeight: '300px',
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: '2px'
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <div style={{ padding: '4px 8px 6px', fontSize: '0.68rem', fontWeight: '800', color: 'var(--text-muted, #64748b)', textTransform: 'uppercase', letterSpacing: '0.5px', borderBottom: '1px solid #f1f5f9' }}>
            Assign Support Agent
          </div>

          {/* Unassign Option */}
          <button
            type="button"
            onClick={() => {
              onAssign(ticket._id, 'Unassigned')
              setIsOpen(false)
            }}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '7px 8px',
              borderRadius: '6px',
              border: 'none',
              background: isCurrentlyUnassigned ? 'rgba(100, 116, 139, 0.08)' : 'transparent',
              color: isCurrentlyUnassigned ? '#475569' : 'var(--text-muted, #64748b)',
              fontSize: '0.78rem',
              fontWeight: isCurrentlyUnassigned ? '700' : '500',
              cursor: 'pointer',
              textAlign: 'left'
            }}
            onMouseEnter={(e) => {
              if (!isCurrentlyUnassigned) e.currentTarget.style.background = '#f8fafc'
            }}
            onMouseLeave={(e) => {
              if (!isCurrentlyUnassigned) e.currentTarget.style.background = 'transparent'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <UserX style={{ width: '13px', height: '13px', color: '#94a3b8' }} />
              <span>Unassigned</span>
            </div>
            {isCurrentlyUnassigned && <Check style={{ width: '13px', height: '13px', color: '#64748b' }} />}
          </button>

          {/* Staff List */}
          {supportStaff.map((staffItem) => {
            const agentName = typeof staffItem === 'string' ? staffItem : (staffItem?.name || '')
            const rawRole = typeof staffItem === 'object' && staffItem !== null ? staffItem.role : ''
            const agentRole = typeof rawRole === 'object' && rawRole !== null
              ? (rawRole.roleName || rawRole.name || '')
              : (typeof rawRole === 'string' ? rawRole : '')
            const isAssigned = typeof currentAssigned === 'string' && typeof agentName === 'string' && currentAssigned.toLowerCase() === agentName.toLowerCase()

            return (
              <button
                key={staffItem?.id || agentName}
                type="button"
                onClick={() => {
                  onAssign(ticket._id, agentName)
                  setIsOpen(false)
                }}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '7px 8px',
                  borderRadius: '6px',
                  border: 'none',
                  background: isAssigned ? 'rgba(59, 130, 246, 0.08)' : 'transparent',
                  color: isAssigned ? '#2563eb' : 'var(--text-main, #0f172a)',
                  fontSize: '0.78rem',
                  fontWeight: isAssigned ? '700' : '500',
                  cursor: 'pointer',
                  textAlign: 'left'
                }}
                onMouseEnter={(e) => {
                  if (!isAssigned) e.currentTarget.style.background = '#f8fafc'
                }}
                onMouseLeave={(e) => {
                  if (!isAssigned) e.currentTarget.style.background = 'transparent'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', overflow: 'hidden', minWidth: 0 }}>
                  <User style={{ width: '12px', height: '12px', color: isAssigned ? '#2563eb' : 'var(--text-muted)', flexShrink: 0 }} />
                  <div style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0 }}>
                    <span style={{ textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>{agentName}</span>
                    {agentRole ? (
                      <span style={{ fontSize: '0.65rem', color: 'var(--text-muted, #94a3b8)', lineHeight: 1.1 }}>{agentRole}</span>
                    ) : null}
                  </div>
                </div>
                {isAssigned && <Check style={{ width: '13px', height: '13px', color: '#2563eb', flexShrink: 0 }} />}
              </button>
            )
          })}

          {/* Quick Custom Name Assign */}
          <div style={{ borderTop: '1px solid #f1f5f9', marginTop: '4px', paddingTop: '4px' }}>
            {!showCustomInput ? (
              <button
                type="button"
                onClick={() => setShowCustomInput(true)}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '6px 8px',
                  borderRadius: '6px',
                  border: 'none',
                  background: 'transparent',
                  color: '#2563eb',
                  fontSize: '0.74rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  textAlign: 'left'
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(37, 99, 235, 0.05)'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
              >
                <Plus style={{ width: '12px', height: '12px' }} />
                <span>Enter custom agent name</span>
              </button>
            ) : (
              <div style={{ display: 'flex', gap: '4px', padding: '4px 2px' }}>
                <input
                  type="text"
                  autoFocus
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && customName.trim()) {
                      e.preventDefault()
                      onAssign(ticket._id, customName.trim())
                      setIsOpen(false)
                    }
                  }}
                  placeholder="Agent name..."
                  style={{
                    flex: 1,
                    padding: '5px 8px',
                    fontSize: '0.74rem',
                    border: '1px solid #cbd5e1',
                    borderRadius: '5px',
                    outline: 'none'
                  }}
                />
                <button
                  type="button"
                  disabled={!customName.trim()}
                  onClick={() => {
                    if (customName.trim()) {
                      onAssign(ticket._id, customName.trim())
                      setIsOpen(false)
                    }
                  }}
                  style={{
                    padding: '4px 8px',
                    fontSize: '0.7rem',
                    fontWeight: '700',
                    background: '#2563eb',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '5px',
                    cursor: customName.trim() ? 'pointer' : 'not-allowed',
                    opacity: customName.trim() ? 1 : 0.5
                  }}
                >
                  Save
                </button>
              </div>
            )}

            {/* Manage Support Team Link */}
            <button
              type="button"
              onClick={() => {
                setIsOpen(false)
                navigate(ROUTES.SUPER_ADMIN.USERS)
              }}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '6px 8px',
                borderRadius: '6px',
                border: 'none',
                background: 'transparent',
                color: 'var(--text-muted, #64748b)',
                fontSize: '0.72rem',
                fontWeight: '600',
                cursor: 'pointer',
                textAlign: 'left',
                marginTop: '2px'
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = '#f8fafc'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                <Users style={{ width: '12px', height: '12px' }} />
                <span>Manage Support Team</span>
              </div>
              <ExternalLink style={{ width: '11px', height: '11px' }} />
            </button>
          </div>
        </div>,
        document.body
      )}
    </>
  )
}

export default function TicketsPage() {
  const { user } = useAuth()
  const [tickets, setTickets] = useState([])
  const [totalRecords, setTotalRecords] = useState(0)
  const { restaurants } = useRestaurant()
  const { showToast } = useNotification()
  const { hasPermission, isSuperOwner } = useAuth()

  const canAdd = isSuperOwner || hasPermission('tickets', 'add')
  const canEdit = isSuperOwner || hasPermission('tickets', 'edit')
  const canDelete = isSuperOwner || hasPermission('tickets', 'delete')
  const canView = isSuperOwner || hasPermission('tickets', 'view')

  // Search & Filter
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')
  const [priorityFilter, setPriorityFilter] = useState('All')
  const [categoryFilter, setCategoryFilter] = useState('All')

  // Modals & Forms State
  const [selectedTicket, setSelectedTicket] = useState(null)
  const [loadingDetails, setLoadingDetails] = useState(false)
  const [resolveTicketData, setResolveTicketData] = useState(null)
  const [resolveStatus, setResolveStatus] = useState('In Progress')
  const [resolveReply, setResolveReply] = useState('')
  const [isSubmittingResolve, setIsSubmittingResolve] = useState(false)
  const [supportStaff, setSupportStaff] = useState([])

  // Fetch real support staff/managers from user management API
  const fetchSupportStaff = async () => {
    try {
      const res = await getManagers(0, 100)
      const rawList = Array.isArray(res?.data?.results)
        ? res.data.results
        : (Array.isArray(res?.data) ? res.data : (Array.isArray(res) ? res : []))
      const activeList = rawList.filter(m => m.status !== 'Inactive' && m.status !== 'Deactivated')
      
      const mapped = activeList.map(m => {
        let roleTitle = 'Support Staff'
        if (typeof m.roleName === 'string' && m.roleName) {
          roleTitle = m.roleName
        } else if (typeof m.role === 'object' && m.role !== null) {
          roleTitle = m.role.roleName || m.role.name || 'Support Staff'
        } else if (typeof m.role === 'string' && m.role) {
          roleTitle = m.role
        }

        return {
          id: m._id || m.id,
          name: m.name || m.userName || 'Team Member',
          role: roleTitle,
          email: m.email || ''
        }
      })

      // Include current logged-in super admin if not in list
      if (user?.name && !mapped.some(s => s.name?.toLowerCase() === user.name?.toLowerCase())) {
        mapped.unshift({
          id: user._id || 'super-admin',
          name: user.name,
          role: 'Super Admin',
          email: user.email || ''
        })
      }

      setSupportStaff(mapped.length > 0 ? mapped : (user?.name ? [
        { id: user._id || 'super-admin', name: user.name, role: 'Super Admin' }
      ] : []))
    } catch (err) {
      console.error('Failed to fetch managers for ticket assignment:', err)
      setSupportStaff(user?.name ? [
        { id: user._id || 'super-admin', name: user.name, role: 'Super Admin' }
      ] : [])
    }
  }

  useEffect(() => {
    fetchSupportStaff()
  }, [])

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

  const [currentPage, setCurrentPage] = useState(0)
  const [entriesPerPage, setEntriesPerPage] = useState(10)

  // Handlers
  const normalizeTicketStatus = (status) => {
    if (!status) return 'Open';
    const s = String(status).trim().toLowerCase();
    if (s === 'resolved' || s === 'closed') return 'Resolved';
    if (s === 'in progress' || s === 'in_progress' || s === 'processing') return 'In Progress';
    if (s === 'open' || s === 'new' || s === 'pending') return 'Open';
    return String(status).trim();
  }

  const fetchTickets = async () => {
    try {
      const data = await getTickets({
        page: currentPage + 1,
        limit: entriesPerPage,
        searchTerm,
        statusFilter,
        priorityFilter,
        categoryFilter
      })
      const rawList = Array.isArray(data?.data) ? data.data : Array.isArray(data) ? data : []
      const list = rawList.map(t => ({
        ...t,
        status: normalizeTicketStatus(t.status)
      }))
      setTickets(list)
      const count =
        data?.total ??
        data?.totalRecords ??
        data?.totalItems ??
        data?.pagination?.totalItems ??
        data?.count ??
        (Array.isArray(data?.data) ? data.data.length : list.length)
      setTotalRecords(Number(count) || (list.length > 0 ? list.length : 0))
    } catch (error) {
      console.error(error)
      showToast('error', error?.response?.data?.message || 'Failed to fetch tickets')
    }
  }

  useEffect(() => {
    fetchTickets()
  }, [currentPage, entriesPerPage, searchTerm, statusFilter, priorityFilter, categoryFilter])

  // View ticket details and fetch full info by ID
  const handleViewTicket = async (ticket) => {
    setSelectedTicket(ticket)
    setLoadingDetails(true)
    try {
      const res = await getTicketById(ticket._id)
      const fullData = res?.data || res
      if (fullData && typeof fullData === 'object') {
        setSelectedTicket(prev => ({
          ...prev,
          ...fullData,
          status: normalizeTicketStatus(fullData.status || prev?.status)
        }))
      }
    } catch (err) {
      console.warn('Failed to fetch full ticket details:', err)
    } finally {
      setLoadingDetails(false)
    }
  }

  const handleOpenResolveModal = (ticket) => {
    const norm = normalizeTicketStatus(ticket.status)
    setResolveTicketData({ ...ticket, status: norm })
    setResolveStatus('Resolved')
    setResolveReply(ticket.resolution || ticket.resolutionMessage || '')
  }

  const handleResolveSubmit = async (e) => {
    e.preventDefault()
    if (!resolveTicketData) return
    setIsSubmittingResolve(true)
    try {
      const trimmedReply = resolveReply.trim()
      const existingResponses = Array.isArray(resolveTicketData.responses)
        ? resolveTicketData.responses
        : Array.isArray(resolveTicketData.replies)
        ? resolveTicketData.replies
        : []

      const newResponseItem = trimmedReply ? {
        message: trimmedReply,
        reply: trimmedReply,
        response: trimmedReply,
        text: trimmedReply,
        sender: user?.name || 'Super Admin',
        senderName: user?.name || 'Super Admin',
        senderRole: 'super_admin',
        role: 'super_admin',
        createdAt: new Date().toISOString()
      } : null

      const updatedResponses = newResponseItem ? [...existingResponses, newResponseItem] : existingResponses

      const fullPayload = {
        status: resolveStatus,
        ticketStatus: resolveStatus,
        resolution: trimmedReply || (resolveStatus === 'Resolved' ? 'Issue marked as resolved by Super Admin' : ''),
        resolutionMessage: trimmedReply || (resolveStatus === 'Resolved' ? 'Issue marked as resolved by Super Admin' : ''),
        resolutionNote: trimmedReply || (resolveStatus === 'Resolved' ? 'Issue marked as resolved by Super Admin' : ''),
        adminResponse: trimmedReply,
        superAdminResponse: trimmedReply,
        isResolved: resolveStatus === 'Resolved',
        resolvedAt: resolveStatus === 'Resolved' ? new Date().toISOString() : null,
        responses: updatedResponses,
        replies: updatedResponses,
        sender: user?.name || 'Super Admin',
        senderName: user?.name || 'Super Admin',
        senderRole: 'super_admin',
        role: 'super_admin',
        ...(trimmedReply ? {
          reply: trimmedReply,
          message: trimmedReply,
          response: trimmedReply,
          text: trimmedReply,
          comment: trimmedReply
        } : {})
      }

      // 1. Send reply to ticket endpoints if reply provided
      if (trimmedReply) {
        try {
          await replyToTicket(resolveTicketData._id, fullPayload)
        } catch (replyErr) {
          console.warn("replyToTicket:", replyErr?.message || replyErr)
        }
      }

      // 2. Always update status & payload
      try {
        await updateTicketStatus(resolveTicketData._id, resolveStatus, fullPayload)
      } catch (statusErr) {
        console.warn("updateTicketStatus:", statusErr?.message || statusErr)
      }

      // 3. Fallback direct update to ensure all fields are saved
      try {
        await updateTicket(resolveTicketData._id, fullPayload)
      } catch (updateErr) {
        // ignore
      }

      showToast('success', `Ticket ${resolveTicketData.ticketNumber} marked as ${resolveStatus.toUpperCase()} successfully!`)
      setResolveTicketData(null)
      setResolveReply('')
      await fetchTickets()
    } catch (err) {
      console.error(err)
      showToast('error', err.response?.data?.message || 'Failed to update ticket')
    } finally {
      setIsSubmittingResolve(false)
    }
  }

  const handleQuickResolve = async (ticketId) => {
    try {
      await updateTicketStatus(ticketId, 'Resolved', {
        resolution: 'Issue marked as resolved by Super Admin',
        resolvedAt: new Date().toISOString()
      })
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
      const staffMember = supportStaff.find(
        s => (typeof s === 'string' ? s : s?.name)?.toLowerCase() === String(agentName).toLowerCase()
      )
      const extraData = staffMember?.id ? { assignedUserId: staffMember.id } : {}

      // Immediate optimistic update
      setTickets(prev =>
        prev.map(t => (t._id === ticketId ? { ...t, assignedUser: agentName } : t))
      )
      if (selectedTicket && selectedTicket._id === ticketId) {
        setSelectedTicket(prev => (prev ? { ...prev, assignedUser: agentName } : null))
      }

      await assignTicket(ticketId, agentName, extraData)
      showToast('success', `Ticket successfully assigned to ${agentName}`)
      fetchTickets()
    } catch (error) {
      showToast('error', error?.response?.data?.message || 'Failed to assign ticket')
      fetchTickets()
    }
  }

  const getAssignedDisplayName = (t) => {
    const raw = t?.assignedUser || t?.assignedTo
    if (!raw) return 'Unassigned'
    if (typeof raw === 'object' && raw !== null) {
      return raw.name || raw.userName || raw.roleName || 'Unassigned'
    }
    if (typeof raw === 'string') return raw.trim() || 'Unassigned'
    return String(raw)
  }

  const isTicketUnassigned = (t) => {
    const displayName = getAssignedDisplayName(t)
    return !displayName || displayName.toLowerCase() === 'unassigned' || displayName === 'null' || displayName === 'undefined'
  }

  const paginatedTickets = tickets.filter(t => t.status !== 'Closed')

  // Statistics
  const totalTicketsCount = totalRecords || tickets.length
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

  const getStatusStyle = (rawStatus) => {
    const status = normalizeTicketStatus(rawStatus)
    switch (status) {
      case 'Open': return { bg: 'rgba(59, 130, 246, 0.08)', text: '#3b82f6', icon: <AlertCircle style={{ width: '12px', height: '12px' }} /> }
      case 'In Progress': return { bg: 'rgba(245, 158, 11, 0.08)', text: '#f59e0b', icon: <Clock style={{ width: '12px', height: '12px' }} /> }
      case 'Resolved': return { bg: 'rgba(16, 185, 129, 0.08)', text: '#10b981', icon: <CheckCircle style={{ width: '12px', height: '12px' }} /> }
      default: return { bg: 'rgba(59, 130, 246, 0.08)', text: '#3b82f6', icon: <AlertCircle style={{ width: '12px', height: '12px' }} /> }
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
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
          {[
            { label: 'Total Tickets', count: totalTicketsCount, bg: 'rgba(59, 130, 246, 0.04)', border: 'rgba(59, 130, 246, 0.12)', color: '#3b82f6', icon: <LifeBuoy style={{ width: '18px', height: '18px' }} /> },
            { label: 'Open', count: openCount, bg: 'rgba(59, 130, 246, 0.06)', border: 'rgba(59, 130, 246, 0.15)', color: '#2563eb', icon: <AlertCircle style={{ width: '18px', height: '18px' }} /> },
            { label: 'In Progress', count: progressCount, bg: 'rgba(245, 158, 11, 0.04)', border: 'rgba(245, 158, 11, 0.12)', color: '#f59e0b', icon: <Clock style={{ width: '18px', height: '18px' }} /> },
            { label: 'Resolved', count: resolvedCount, bg: 'rgba(16, 185, 129, 0.04)', border: 'rgba(16, 185, 129, 0.12)', color: '#10b981', icon: <CheckCircle style={{ width: '18px', height: '18px' }} /> },
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
                {stat.icon}
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
                  {resolveTicketData.isEscalated && (
                    <span style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      padding: '2px 8px',
                      borderRadius: '6px',
                      fontSize: '0.7rem',
                      fontWeight: '800',
                      background: 'rgba(239, 68, 68, 0.1)',
                      color: '#ef4444',
                      border: '1px solid rgba(239, 68, 68, 0.25)',
                      textTransform: 'uppercase'
                    }}>
                      <Zap style={{ width: '10px', height: '10px', fill: '#ef4444' }} />
                      Escalated
                    </span>
                  )}
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
                    {resolveTicketData.isEscalated && (
                      <span style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        padding: '4px 10px',
                        borderRadius: '6px',
                        fontSize: '0.75rem',
                        fontWeight: '800',
                        background: 'rgba(239, 68, 68, 0.1)',
                        color: '#ef4444',
                        border: '1px solid rgba(239, 68, 68, 0.25)'
                      }}>
                        <Zap style={{ width: '12px', height: '12px', fill: '#ef4444' }} />
                        Escalated to Super Admin
                      </span>
                    )}
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

                {/* Escalation Warning in Resolve Form if applicable */}
                {resolveTicketData.isEscalated && (
                  <div style={{
                    background: 'rgba(239, 68, 68, 0.05)',
                    border: '1.5px solid rgba(239, 68, 68, 0.25)',
                    borderRadius: '8px',
                    padding: '12px 14px',
                    fontSize: '0.82rem',
                    color: 'var(--text-main)'
                  }}>
                    <strong style={{ color: '#ef4444' }}>⚡ Escalation Reason: </strong>
                    <span>{resolveTicketData.escalationReason || 'Escalated by restaurant management for core support intervention.'}</span>
                  </div>
                )}

                {/* Info Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px', paddingTop: '12px', borderTop: '1px solid var(--border-color)' }}>
                  <div>
                    <span style={{ display: 'block', fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: '700', textTransform: 'uppercase' }}>Restaurant</span>
                    <strong style={{ fontSize: '0.88rem', color: 'var(--text-main)' }}>
                      {resolveTicketData.restaurantName || resolveTicketData.restaurantId?.restaurantName || 'N/A'}
                    </strong>
                    {resolveTicketData.branchName && (
                      <span style={{ display: 'block', fontSize: '0.7rem', color: 'var(--text-muted)' }}>Branch: {resolveTicketData.branchName}</span>
                    )}
                  </div>
                  <div>
                    <span style={{ display: 'block', fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: '700', textTransform: 'uppercase' }}>Category / Topic</span>
                    <strong style={{ fontSize: '0.88rem', color: 'var(--text-main)' }}>{resolveTicketData.category}</strong>
                  </div>
                  <div>
                    <span style={{ display: 'block', fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: '700', textTransform: 'uppercase' }}>Assigned Support Agent</span>
                    <strong style={{ fontSize: '0.88rem', color: 'var(--text-main)' }}>{getAssignedDisplayName(resolveTicketData)}</strong>
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

                {/* Existing Responses / Replies History */}
                {((Array.isArray(resolveTicketData.responses) && resolveTicketData.responses.length > 0) || (Array.isArray(resolveTicketData.replies) && resolveTicketData.replies.length > 0)) && (
                  <div>
                    <span style={{ display: 'block', fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: '700', textTransform: 'uppercase', marginBottom: '6px' }}>
                      💬 Previous Support Responses ({((resolveTicketData.responses || resolveTicketData.replies) || []).length})
                    </span>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '160px', overflowY: 'auto' }}>
                      {((resolveTicketData.responses || resolveTicketData.replies) || []).map((resp, idx) => (
                        <div key={idx} style={{
                          padding: '8px 12px',
                          background: 'var(--bg-card)',
                          borderRadius: '8px',
                          border: '1px solid var(--border-color)',
                          fontSize: '0.8rem'
                        }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3px', fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                            <strong style={{ color: resp.senderRole === 'super_admin' ? 'hsl(var(--primary-hue), 95%, 52%)' : 'var(--text-main)' }}>
                              {resp.sender || resp.senderName || (resp.senderRole === 'super_admin' ? 'Super Admin' : 'Admin / User')}
                            </strong>
                            <span>{resp.createdAt ? new Date(resp.createdAt).toLocaleString() : ''}</span>
                          </div>
                          <div style={{ color: 'var(--text-main)', whiteSpace: 'pre-wrap', lineHeight: '1.4' }}>
                            {resp.message || resp.reply || resp.response || resp.text}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
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
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(110px, 1fr))', gap: '10px' }}>
                    {[
                      { label: 'In Progress', value: 'In Progress', color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.1)', border: '#f59e0b' },
                      { label: 'Resolved', value: 'Resolved', color: '#10b981', bg: 'rgba(16, 185, 129, 0.1)', border: '#10b981' }
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
                    <RotateCcw style={{ width: '13px', height: '13px' }} />
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

                      return (
                        <tr key={ticket._id} style={{ borderBottom: '1px solid var(--border-color)', transition: 'background-color 0.2s' }}>
                          <td style={{ padding: '14px 18px', fontSize: '0.8rem', color: 'var(--text-main)', fontWeight: '800', fontFamily: 'monospace', verticalAlign: 'middle' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <span>{ticket.ticketNumber}</span>
                              {ticket.isEscalated && (
                                <span
                                  style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '3px',
                                    padding: '2px 7px',
                                    borderRadius: '10px',
                                    fontSize: '0.64rem',
                                    fontWeight: '800',
                                    background: 'rgba(239, 68, 68, 0.1)',
                                    color: '#ef4444',
                                    border: '1px solid rgba(239, 68, 68, 0.25)',
                                    letterSpacing: '0.3px',
                                    textTransform: 'uppercase'
                                  }}
                                  title={ticket.escalationReason || 'Escalated to Super Admin'}
                                >
                                  <Zap style={{ width: '9px', height: '9px', fill: '#ef4444' }} />
                                  Escalated
                                </span>
                              )}
                            </div>
                          </td>
                          <td style={{ padding: '14px 18px', verticalAlign: 'middle' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                              <span style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--text-main)' }}>
                                {ticket.restaurantName || ticket.restaurantId?.restaurantName || 'N/A'}
                              </span>
                              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                                {ticket.branchName ? `Branch: ${ticket.branchName}` : (ticket.restaurantId?.email || 'General Support')}
                              </span>
                            </div>
                          </td>
                          <td style={{ padding: '14px 18px', verticalAlign: 'middle', maxWidth: '280px' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', overflow: 'hidden' }}>
                              <span style={{ fontSize: '0.82rem', color: 'var(--text-main)', fontWeight: '600', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                                {ticket.subject}
                              </span>
                              {ticket.creatorRole && (
                                <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>
                                  Raised by: {ticket.createdByName || ticket.creatorRole}
                                </span>
                              )}
                            </div>
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
                              <span>{getAssignedDisplayName(ticket)}</span>
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
                                  onClick={() => handleViewTicket(ticket)}
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
          background: 'rgba(9, 13, 22, 0.55)',
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
            background: 'var(--bg-card, #ffffff)',
            border: '1px solid var(--border-color, #e2e8f0)',
            borderRadius: '16px',
            padding: '24px',
            width: '100%',
            maxWidth: '620px',
            maxHeight: 'min(90vh, 720px)',
            display: 'flex',
            flexDirection: 'column',
            boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
            position: 'relative',
            boxSizing: 'border-box',
            overflow: 'hidden',
            margin: 'auto'
          }} onClick={(e) => e.stopPropagation()}>
            
            {/* Modal Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px', flexShrink: 0 }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '0.7rem', fontWeight: '800', color: 'hsl(var(--primary-hue), 95%, 52%)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    Ticket Details
                  </span>
                  {loadingDetails && (
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '0.68rem', color: 'var(--text-muted)' }}>
                      <Loader2 style={{ width: '11px', height: '11px', animation: 'spin 1s linear infinite' }} />
                      Syncing...
                    </span>
                  )}
                </div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: '900', color: 'var(--text-main)', margin: '4px 0 0 0', fontFamily: 'monospace' }}>
                  {selectedTicket.ticketNumber}
                </h3>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                {selectedTicket.isEscalated && (
                  <span style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    padding: '4px 9px',
                    borderRadius: '6px',
                    fontSize: '0.7rem',
                    fontWeight: '800',
                    background: 'rgba(239, 68, 68, 0.1)',
                    color: '#ef4444',
                    border: '1px solid rgba(239, 68, 68, 0.25)',
                    textTransform: 'uppercase'
                  }}>
                    <Zap style={{ width: '10px', height: '10px', fill: '#ef4444' }} />
                    Escalated
                  </span>
                )}
                <span style={{
                  fontSize: '0.72rem',
                  fontWeight: '800',
                  padding: '4px 9px',
                  borderRadius: '6px',
                  background: getStatusStyle(selectedTicket.status).bg,
                  color: getStatusStyle(selectedTicket.status).text,
                  textTransform: 'uppercase'
                }}>
                  {selectedTicket.status}
                </span>
              </div>
            </div>

            {/* Modal Scrollable Body */}
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '14px',
              borderTop: '1px solid var(--border-color)',
              paddingTop: '14px',
              overflowY: 'auto',
              flex: 1,
              minHeight: 0,
              paddingRight: '4px'
            }}>

              {/* Escalation Warning Box if ticket is escalated */}
              {selectedTicket.isEscalated && (
                <div style={{
                  background: 'rgba(239, 68, 68, 0.05)',
                  border: '1.5px solid rgba(239, 68, 68, 0.25)',
                  borderRadius: '10px',
                  padding: '12px 14px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '6px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#ef4444', fontWeight: '800', fontSize: '0.78rem' }}>
                    <Zap style={{ width: '14px', height: '14px', fill: '#ef4444' }} />
                    <span>Escalated to Super Admin</span>
                    {selectedTicket.escalatedAt && (
                      <span style={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: '500', marginLeft: 'auto' }}>
                        {new Date(selectedTicket.escalatedAt).toLocaleString()}
                      </span>
                    )}
                  </div>
                  {selectedTicket.escalationReason && (
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-main)', lineHeight: '1.45', background: 'rgba(255,255,255,0.7)', padding: '8px 10px', borderRadius: '6px' }}>
                      <strong style={{ color: '#b91c1c' }}>Reason: </strong>
                      {selectedTicket.escalationReason}
                    </div>
                  )}
                  <div style={{ display: 'flex', gap: '16px', fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                    {selectedTicket.creatorRole && (
                      <span><strong>Source:</strong> {selectedTicket.creatorRole}</span>
                    )}
                    {selectedTicket.ticketRaisedTo && (
                      <span><strong>Target:</strong> {selectedTicket.ticketRaisedTo}</span>
                    )}
                  </div>
                </div>
              )}

              {/* Restaurant & Branch Details Card */}
              <div style={{
                background: 'var(--bg-app)',
                border: '1px solid var(--border-color)',
                borderRadius: '10px',
                padding: '12px 14px',
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                gap: '10px'
              }}>
                <div>
                  <span style={{ display: 'block', fontSize: '0.68rem', color: 'var(--text-muted)', fontWeight: '700', textTransform: 'uppercase' }}>
                    Restaurant Name
                  </span>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-main)', fontWeight: '800' }}>
                    {selectedTicket.restaurantName || selectedTicket.restaurantId?.restaurantName || 'N/A'}
                  </span>
                </div>

                <div>
                  <span style={{ display: 'block', fontSize: '0.68rem', color: 'var(--text-muted)', fontWeight: '700', textTransform: 'uppercase' }}>
                    Branch / Location
                  </span>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-main)', fontWeight: '600' }}>
                    {selectedTicket.branchName || 'Main / Company'}
                  </span>
                </div>

                {selectedTicket.restaurantId?.email && (
                  <div>
                    <span style={{ display: 'block', fontSize: '0.68rem', color: 'var(--text-muted)', fontWeight: '700', textTransform: 'uppercase' }}>
                      Contact Email
                    </span>
                    <span style={{ fontSize: '0.82rem', color: 'var(--text-main)', fontWeight: '500' }}>
                      {selectedTicket.restaurantId.email}
                    </span>
                  </div>
                )}

                {selectedTicket.restaurantId?.address && (
                  <div>
                    <span style={{ display: 'block', fontSize: '0.68rem', color: 'var(--text-muted)', fontWeight: '700', textTransform: 'uppercase' }}>
                      Restaurant Address
                    </span>
                    <span style={{ fontSize: '0.82rem', color: 'var(--text-main)', fontWeight: '500' }}>
                      {selectedTicket.restaurantId.address}
                    </span>
                  </div>
                )}
              </div>

              {/* Ticket Meta Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '10px' }}>
                <div>
                  <span style={{ display: 'block', fontSize: '0.68rem', color: 'var(--text-muted)', fontWeight: '700', textTransform: 'uppercase' }}>Category</span>
                  <span style={{ fontSize: '0.82rem', color: 'var(--text-main)', fontWeight: '700' }}>{selectedTicket.category || 'General'}</span>
                </div>
                <div>
                  <span style={{ display: 'block', fontSize: '0.68rem', color: 'var(--text-muted)', fontWeight: '700', textTransform: 'uppercase' }}>Priority</span>
                  <span style={{ fontSize: '0.82rem', color: getPriorityStyle(selectedTicket.priority).text, fontWeight: '800' }}>{selectedTicket.priority}</span>
                </div>
                <div>
                  <span style={{ display: 'block', fontSize: '0.68rem', color: 'var(--text-muted)', fontWeight: '700', textTransform: 'uppercase' }}>Assigned Agent</span>
                  <span style={{ fontSize: '0.82rem', color: 'var(--text-main)', fontWeight: '700' }}>{getAssignedDisplayName(selectedTicket)}</span>
                </div>
                <div>
                  <span style={{ display: 'block', fontSize: '0.68rem', color: 'var(--text-muted)', fontWeight: '700', textTransform: 'uppercase' }}>Created Date</span>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-main)', fontWeight: '500' }}>
                    {selectedTicket.createdAt ? new Date(selectedTicket.createdAt).toLocaleDateString() : 'N/A'}
                  </span>
                </div>
              </div>

              {/* Subject & Description */}
              <div>
                <span style={{ display: 'block', fontSize: '0.68rem', color: 'var(--text-muted)', fontWeight: '700', textTransform: 'uppercase', marginBottom: '3px' }}>
                  Subject
                </span>
                <div style={{ fontSize: '0.9rem', color: 'var(--text-main)', fontWeight: '800' }}>
                  {selectedTicket.subject}
                </div>
              </div>

              <div>
                <span style={{ display: 'block', fontSize: '0.68rem', color: 'var(--text-muted)', fontWeight: '700', textTransform: 'uppercase', marginBottom: '4px' }}>
                  Issue Description
                </span>
                <div style={{
                  padding: '12px 14px',
                  background: 'var(--bg-app)',
                  borderRadius: '8px',
                  border: '1px solid var(--border-color)',
                  fontSize: '0.82rem',
                  color: 'var(--text-main)',
                  lineHeight: '1.5',
                  whiteSpace: 'pre-wrap'
                }}>
                  {selectedTicket.description || 'No description provided.'}
                </div>
              </div>

              {/* Attachment preview / link if available */}
              {selectedTicket.attachmentUrl && (
                <div>
                  <span style={{ display: 'block', fontSize: '0.68rem', color: 'var(--text-muted)', fontWeight: '700', textTransform: 'uppercase', marginBottom: '4px' }}>
                    Attachment
                  </span>
                  <a
                    href={selectedTicket.attachmentUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '8px 12px',
                      background: 'var(--bg-app)',
                      border: '1px solid var(--border-color)',
                      borderRadius: '8px',
                      fontSize: '0.78rem',
                      color: '#2563eb',
                      fontWeight: '700',
                      textDecoration: 'none'
                    }}
                  >
                    <Paperclip style={{ width: '13px', height: '13px' }} />
                    <span>View Attached File / Image</span>
                    <ExternalLink style={{ width: '11px', height: '11px' }} />
                  </a>
                </div>
              )}

              {/* Resolution details if resolved */}
              {(selectedTicket.resolution || selectedTicket.resolutionMessage) && (
                <div style={{
                  background: 'rgba(16, 185, 129, 0.06)',
                  border: '1.5px solid rgba(16, 185, 129, 0.25)',
                  borderRadius: '10px',
                  padding: '12px 14px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '6px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: '#10b981', fontWeight: '800', fontSize: '0.78rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                      <CheckCircle style={{ width: '14px', height: '14px' }} />
                      <span>Resolution Record</span>
                    </div>
                    {selectedTicket.resolvedAt && (
                      <span style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: '500' }}>
                        {new Date(selectedTicket.resolvedAt).toLocaleString()}
                      </span>
                    )}
                  </div>
                  <div style={{ fontSize: '0.82rem', color: 'var(--text-main)', lineHeight: '1.45', whiteSpace: 'pre-wrap' }}>
                    {selectedTicket.resolution || selectedTicket.resolutionMessage}
                  </div>
                </div>
              )}

              {/* Thread / Activity history */}
              {((Array.isArray(selectedTicket.responses) && selectedTicket.responses.length > 0) || (Array.isArray(selectedTicket.replies) && selectedTicket.replies.length > 0)) && (
                <div>
                  <span style={{ display: 'block', fontSize: '0.68rem', color: 'var(--text-muted)', fontWeight: '700', textTransform: 'uppercase', marginBottom: '6px' }}>
                    💬 Communication Thread ({((selectedTicket.responses || selectedTicket.replies) || []).length})
                  </span>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '160px', overflowY: 'auto' }}>
                    {((selectedTicket.responses || selectedTicket.replies) || []).map((resp, idx) => (
                      <div key={idx} style={{
                        padding: '8px 12px',
                        background: 'var(--bg-app)',
                        borderRadius: '8px',
                        border: '1px solid var(--border-color)',
                        fontSize: '0.8rem'
                      }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3px', fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                          <strong style={{ color: resp.senderRole === 'super_admin' ? 'hsl(var(--primary-hue), 95%, 52%)' : 'var(--text-main)' }}>
                            {resp.sender || resp.senderName || (resp.senderRole === 'super_admin' ? 'Super Admin' : 'Admin / User')}
                          </strong>
                          <span>{resp.createdAt ? new Date(resp.createdAt).toLocaleString() : ''}</span>
                        </div>
                        <div style={{ color: 'var(--text-main)', whiteSpace: 'pre-wrap', lineHeight: '1.4' }}>
                          {resp.message || resp.reply || resp.response || resp.text}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>

            {/* Modal Footer Actions */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginTop: '16px',
              paddingTop: '12px',
              borderTop: '1px solid var(--border-color)',
              flexShrink: 0,
              flexWrap: 'wrap',
              gap: '8px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                {canEdit && (
                  <TicketAssignDropdown
                    ticket={selectedTicket}
                    canEdit={canEdit}
                    supportStaff={supportStaff}
                    onAssign={handleAssignTicket}
                  />
                )}
                {canEdit && selectedTicket.status !== 'Resolved' && (
                  <button
                    type="button"
                    onClick={() => {
                      const t = selectedTicket
                      setSelectedTicket(null)
                      handleOpenResolveModal(t)
                    }}
                    style={{
                      padding: '6px 12px',
                      borderRadius: '6px',
                      background: '#10b981',
                      color: '#ffffff',
                      border: 'none',
                      fontSize: '0.76rem',
                      fontWeight: '700',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    <CheckCircle style={{ width: '12px', height: '12px' }} />
                    <span>Resolve Ticket</span>
                  </button>
                )}
              </div>

              <button
                type="button"
                onClick={() => setSelectedTicket(null)}
                className="btn-outline"
                style={{
                  padding: '7px 18px',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '0.8rem',
                  fontWeight: '700'
                }}
              >
                Close
              </button>
            </div>

          </div>
        </div>,
        document.body
      )}

    </div>
  )
}
