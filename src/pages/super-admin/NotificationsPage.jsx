import React, { useState, useEffect, useRef } from 'react'
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
  ChevronDown,
  FileText,
  Eye,
  Edit2,
  Ban,
  Search,
  Filter,
  RotateCcw
} from 'lucide-react'

import { useRestaurant } from '../../hooks/useRestaurants'
import { useNotification } from '../../contexts/NotificationContext'
import { TableTopControls, TableBottomPagination } from '../../components/common/TablePagination'
import CustomSelect, { ValidatedSelect } from '../../components/common/CustomSelect'
import {
  getNotifications,
  getSystemNotifications,
  createNotification,
  updateNotification,
  cancelNotification,
  sendDraftNotification,
  deleteNotification,
  getNotificationDetails,
  getSystemNotificationById
} from '../../services/notificationService'
import { getAllPlansApi } from '../../services/planService'
import { useAuth } from '../../contexts/AuthContext'
import { formatDate } from '../../utils/dateFormat'

export const getEffectiveNotificationStatus = (n) => {
  if (!n) return 'Draft';
  const rawStatus = n.status || (n.isScheduled ? 'Scheduled' : 'Sent');
  if (rawStatus === 'Cancelled' || rawStatus === 'Canceled') return 'Cancelled';
  if (rawStatus === 'Draft') return 'Draft';

  if (rawStatus === 'Scheduled' || Boolean(n.isScheduled)) {
    let schedTime = null;
    const schedRaw = n.scheduledAt || n.sendAt || n.scheduledFor || n.scheduledDateTime || n.scheduledDate;

    if (n.scheduledDate && n.scheduledTime) {
      const timeStr = n.scheduledTime.length === 5 ? `${n.scheduledTime}:00` : n.scheduledTime;
      const d = new Date(`${n.scheduledDate}T${timeStr}`);
      if (!isNaN(d.getTime())) schedTime = d.getTime();
    } else if (schedRaw) {
      const s = String(schedRaw);
      const d = new Date(s);
      if (!isNaN(d.getTime())) schedTime = d.getTime();
    }

    if (schedTime && schedTime <= Date.now()) {
      return 'Sent';
    }
    return 'Scheduled';
  }

  return rawStatus;
};

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
  const [editingNtfId, setEditingNtfId] = useState(null)
  const [selectedNotification, setSelectedNotification] = useState(null)
  const [newNtf, setNewNtf] = useState({
    subject: '',
    type: 'Subscription Expiry',
    targetType: 'ALL',
    targetPlan: [],
    targetRestaurants: [],
    body: '',
    isScheduled: false,
    scheduledDate: '',
    scheduledTime: ''
  })
  const [deliveryOption, setDeliveryOption] = useState('broadcast') // 'broadcast' | 'schedule' | 'draft'
  const [errors, setErrors] = useState({})
  const [resDropdownOpen, setResDropdownOpen] = useState(false)
  const resDropdownRef = useRef(null)
  const [filterType, setFilterType] = useState('All')
  const [statusFilter, setStatusFilter] = useState('All')
  const [searchTerm, setSearchTerm] = useState('')

  // Close restaurant dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (resDropdownRef.current && !resDropdownRef.current.contains(e.target)) {
        setResDropdownOpen(false)
      }
    }
    if (resDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      document.addEventListener('pointerdown', handleClickOutside)
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('pointerdown', handleClickOutside)
    }
  }, [resDropdownOpen])

  // Listen for sidebar click reset event to open main module list
  useEffect(() => {
    const handleReset = () => {
      setShowCreateModal(false)
      setEditingNtfId(null)
      setSelectedNotification(null)
    }
    window.addEventListener('reset_module_view', handleReset)
    return () => window.removeEventListener('reset_module_view', handleReset)
  }, [])

  const handleEditClick = (n) => {
    setEditingNtfId(n._id || n.id)
    setErrors({})
    const isSched = n.status === 'Scheduled' || Boolean(n.isScheduled)
    const isDraft = n.status === 'Draft' || Boolean(n.isDraft)
    setDeliveryOption(isSched ? 'schedule' : isDraft ? 'draft' : 'broadcast')

    // Parse targetPlan to pure IDs
    let parsedPlans = []
    const rawPlans = n.targetPlans || n.targetPlan || n.plans || []
    if (Array.isArray(rawPlans)) {
      parsedPlans = rawPlans.map(p => (typeof p === 'object' && p !== null ? (p._id || p.id || p.value) : p)).filter(Boolean)
    } else if (typeof rawPlans === 'object' && rawPlans !== null) {
      parsedPlans = [rawPlans._id || rawPlans.id || rawPlans.value].filter(Boolean)
    } else if (rawPlans) {
      parsedPlans = [rawPlans]
    }

    // Parse targetRestaurants to pure IDs
    let parsedRestaurants = []
    const rawRestaurants = n.targetRestaurants || n.targetRestaurant || n.restaurants || []
    if (Array.isArray(rawRestaurants)) {
      parsedRestaurants = rawRestaurants.map(r => (typeof r === 'object' && r !== null ? (r._id || r.id || r.value) : r)).filter(Boolean)
    } else if (typeof rawRestaurants === 'object' && rawRestaurants !== null) {
      parsedRestaurants = [rawRestaurants._id || rawRestaurants.id || rawRestaurants.value].filter(Boolean)
    } else if (rawRestaurants) {
      parsedRestaurants = [rawRestaurants]
    }

    let dateVal = ''
    let timeVal = ''
    const schedRaw = n.scheduledDate || n.scheduledFor || n.scheduledAt || n.sendAt || n.scheduledDateTime
    if (schedRaw) {
      const s = String(schedRaw)
      if (s.includes('T')) {
        const parts = s.split('T')
        dateVal = parts[0]
        if (parts[1]) {
          timeVal = parts[1].substring(0, 5)
        }
      } else {
        dateVal = s
      }
    }
    if (n.scheduledTime) timeVal = n.scheduledTime

    setNewNtf({
      subject: n.subject || n.title || '',
      type: n.type || 'Subscription Expiry',
      targetType: n.targetType || 'ALL',
      targetPlan: parsedPlans,
      targetRestaurants: parsedRestaurants,
      body: n.body || n.message || n.content || '',
      isScheduled: isSched,
      scheduledDate: dateVal,
      scheduledTime: timeVal
    })
    setShowCreateModal(true)
  }

  // Constants
  const types = ['Subscription Expiry', 'Maintenance Notice', 'Feature Updates', 'Promotional Messages']

  const fetchPlans = async () => {
    try {
      const data = await getAllPlansApi(0, 100);
      const rawList = Array.isArray(data?.data) ? data.data : (Array.isArray(data) ? data : []);
      const activeOnly = rawList.filter(p => {
        if (p.status && String(p.status).trim().toLowerCase() === 'inactive') return false;
        if (p.isActive === false) return false;
        if (p.status && String(p.status).trim().toLowerCase() !== 'active') return false;
        return true;
      });
      setPlans(activeOnly);
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
      const data = await getSystemNotifications({ page: 0, limit: 1000 })
      const list = Array.isArray(data?.data) ? data.data : Array.isArray(data) ? data : []
      setNotifications(list)
      const count = data?.pagination?.totalItems
        ?? data?.total
        ?? data?.totalCount
        ?? data?.count
        ?? data?.totalRecords
        ?? list.length
      setTotalRecords(Number(count) || (list.length > 0 ? list.length : 0))

      // Check if any scheduled item has reached its scheduled time, and sync with backend
      list.forEach(async (n) => {
        if ((n.status === 'Scheduled' || n.isScheduled) && getEffectiveNotificationStatus(n) === 'Sent') {
          try {
            const id = n._id || n.id;
            if (id) {
              await updateNotification(id, { status: 'Sent', isScheduled: false });
            }
          } catch (e) {
            // silent sync
          }
        }
      });
    } catch (error) {
      console.error(error)
      showToast('error', 'Failed to fetch notifications')
    }
  }

  useEffect(() => {
    fetchNotifications()
    const interval = setInterval(() => {
      fetchNotifications()
    }, 10000)
    return () => clearInterval(interval)
  }, [])

  const handleViewDetails = async (n) => {
    setSelectedNotification(n)
    try {
      const id = n._id || n.id
      if (id) {
        const res = await getNotificationDetails(id)
        const details = res?.data || res?.notification || (res?.success ? res.data : res)
        if (details && typeof details === 'object') {
          setSelectedNotification(prev => ({ ...(prev || {}), ...details }))
        }
      }
    } catch (err) {
      console.log('Error fetching notification details:', err)
    }
  }

  const handleCreateSubmit = async (e) => {
    e.preventDefault()
    if (deliveryOption === 'draft') {
      return handleSaveDraft()
    }
    const errs = {}
    if (!newNtf.subject.trim()) errs.subject = 'Subject is required'
    if (!newNtf.body.trim()) errs.body = 'Message body is required'
    if (deliveryOption === 'schedule' || newNtf.isScheduled) {
      if (!newNtf.scheduledDate) errs.scheduledDate = 'Date is required for scheduling'
      if (!newNtf.scheduledTime) errs.scheduledTime = 'Time is required for scheduling'
    }

    if (newNtf.targetType === 'PLAN') {
      const hasPlan = Array.isArray(newNtf.targetPlan) ? newNtf.targetPlan.length > 0 : Boolean(newNtf.targetPlan)
      if (!hasPlan) errs.targetPlan = 'Please select at least one subscription plan'
    }
    if (newNtf.targetType === 'RESTAURANT' && (!Array.isArray(newNtf.targetRestaurants) || newNtf.targetRestaurants.length === 0)) {
      errs.targetRestaurants = 'Please select at least one restaurant'
    }

    if (Object.keys(errs).length > 0) {
      setErrors(errs)
      return
    }

    try {
      const isSched = deliveryOption === 'schedule'
      
      const cleanPlanIds = (Array.isArray(newNtf.targetPlan) ? newNtf.targetPlan : (newNtf.targetPlan ? [newNtf.targetPlan] : []))
        .map(p => (typeof p === 'object' && p !== null ? (p._id || p.id || p.value) : p))
        .filter(Boolean)

      const cleanRestaurantIds = (Array.isArray(newNtf.targetRestaurants) ? newNtf.targetRestaurants : [])
        .map(r => (typeof r === 'object' && r !== null ? (r._id || r.id || r.value) : r))
        .filter(Boolean)

      let combinedIsoDate = null
      let rawDateTimeString = null
      if (isSched && newNtf.scheduledDate) {
        const timeStr = newNtf.scheduledTime ? (newNtf.scheduledTime.length === 5 ? `${newNtf.scheduledTime}:00` : newNtf.scheduledTime) : '00:00:00'
        rawDateTimeString = `${newNtf.scheduledDate}T${timeStr}`
        const d = new Date(rawDateTimeString)
        combinedIsoDate = !isNaN(d.getTime()) ? d.toISOString() : rawDateTimeString
      }

      const payload = {
        subject: newNtf.subject.trim(),
        title: newNtf.subject.trim(),
        type: newNtf.type || 'Subscription Expiry',
        targetType: newNtf.targetType || 'ALL',
        targetPlan: newNtf.targetType === 'PLAN' ? (cleanPlanIds.length === 1 ? cleanPlanIds[0] : (cleanPlanIds.length > 0 ? cleanPlanIds : null)) : null,
        targetPlans: newNtf.targetType === 'PLAN' ? cleanPlanIds : [],
        targetRestaurants: newNtf.targetType === 'RESTAURANT' ? cleanRestaurantIds : [],
        targetRestaurant: newNtf.targetType === 'RESTAURANT' ? (cleanRestaurantIds.length === 1 ? cleanRestaurantIds[0] : cleanRestaurantIds) : null,
        body: newNtf.body.trim(),
        message: newNtf.body.trim(),
        content: newNtf.body.trim(),
        isScheduled: isSched,
        deliveryOption: isSched ? 'schedule' : 'broadcast',
        scheduledDate: isSched ? (newNtf.scheduledDate || '') : '',
        scheduledTime: isSched ? (newNtf.scheduledTime || '') : '',
        scheduledAt: isSched ? (combinedIsoDate || rawDateTimeString) : null,
        scheduledFor: isSched ? (combinedIsoDate || rawDateTimeString) : null,
        sendAt: isSched ? (combinedIsoDate || rawDateTimeString) : null,
        scheduledDateTime: isSched ? (rawDateTimeString || combinedIsoDate) : null,
        status: isSched ? 'Scheduled' : 'Sent'
      }

      if (editingNtfId) {
        await updateNotification(editingNtfId, payload)
        if (!isSched) {
          try {
            await sendDraftNotification(editingNtfId)
          } catch (sendErr) {
            console.log('Broadcast send fallback result:', sendErr)
          }
        }
        showToast('success', isSched ? 'Notification updated & scheduled!' : 'Notification updated and broadcast successfully!')
      } else {
        const res = await createNotification(payload)
        const createdId = res?.data?._id || res?.data?.id || res?._id || res?.id
        if (!isSched && createdId) {
          try {
            await sendDraftNotification(createdId)
          } catch (sendErr) {
            console.log('Send draft broadcast fallback result:', sendErr)
          }
        }
        showToast('success', isSched ? 'Notification scheduled successfully!' : 'Notification sent immediately!')
      }

      setShowCreateModal(false)
      setEditingNtfId(null)
      setNewNtf({
        subject: '',
        type: 'Subscription Expiry',
        targetType: 'ALL',
        targetPlan: [],
        targetRestaurants: [],
        body: '',
        isScheduled: false,
        scheduledDate: '',
        scheduledTime: ''
      })
      setDeliveryOption('broadcast')
      setErrors({})
      await fetchNotifications()
    } catch (error) {
      showToast('error', error.response?.data?.message || error.message || 'Failed to save notification')
    }
  }

  const handleSaveDraft = async () => {
    const errs = {}
    if (!newNtf.subject.trim()) errs.subject = 'Subject is required'
    if (!newNtf.body.trim()) errs.body = 'Message body is required'

    if (Object.keys(errs).length > 0) {
      setErrors(errs)
      return
    }

    try {
      const cleanPlanIds = (Array.isArray(newNtf.targetPlan) ? newNtf.targetPlan : (newNtf.targetPlan ? [newNtf.targetPlan] : []))
        .map(p => (typeof p === 'object' && p !== null ? (p._id || p.id || p.value) : p))
        .filter(Boolean)

      const cleanRestaurantIds = (Array.isArray(newNtf.targetRestaurants) ? newNtf.targetRestaurants : [])
        .map(r => (typeof r === 'object' && r !== null ? (r._id || r.id || r.value) : r))
        .filter(Boolean)

      const payload = {
        subject: newNtf.subject.trim(),
        title: newNtf.subject.trim(),
        type: newNtf.type || 'Subscription Expiry',
        targetType: newNtf.targetType || 'ALL',
        targetPlan: newNtf.targetType === 'PLAN' ? (cleanPlanIds.length === 1 ? cleanPlanIds[0] : (cleanPlanIds.length > 0 ? cleanPlanIds : null)) : null,
        targetPlans: newNtf.targetType === 'PLAN' ? cleanPlanIds : [],
        targetRestaurants: newNtf.targetType === 'RESTAURANT' ? cleanRestaurantIds : [],
        targetRestaurant: newNtf.targetType === 'RESTAURANT' ? (cleanRestaurantIds.length === 1 ? cleanRestaurantIds[0] : cleanRestaurantIds) : null,
        body: newNtf.body.trim(),
        message: newNtf.body.trim(),
        content: newNtf.body.trim(),
        isScheduled: false,
        deliveryOption: 'draft',
        scheduledDate: '',
        scheduledTime: '',
        scheduledAt: null,
        scheduledFor: null,
        sendAt: null,
        scheduledDateTime: null,
        status: 'Draft'
      }

      if (editingNtfId) {
        await updateNotification(editingNtfId, payload)
        showToast('success', 'Draft notification updated successfully!')
      } else {
        await createNotification(payload)
        showToast('success', 'Notification saved as Draft successfully!')
      }

      setShowCreateModal(false)
      setEditingNtfId(null)
      setNewNtf({
        subject: '',
        type: 'Subscription Expiry',
        targetType: 'ALL',
        targetPlan: [],
        targetRestaurants: [],
        body: '',
        isScheduled: false,
        scheduledDate: '',
        scheduledTime: ''
      })
      setDeliveryOption('broadcast')
      setErrors({})
      await fetchNotifications()
    } catch (error) {
      showToast('error', error.response?.data?.message || error.message || 'Failed to save draft notification')
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
      case 'Cancelled':
      case 'Canceled': return <AlertTriangle style={{ width: '12px', height: '12px', color: '#ef4444' }} />
      default: return <Info style={{ width: '12px', height: '12px', color: '#64748b' }} />
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'Sent': return '#10b981'
      case 'Scheduled': return '#f59e0b'
      case 'Cancelled':
      case 'Canceled': return '#ef4444'
      default: return '#64748b'
    }
  }

  // Count totals using effective real-time status
  const totalSent = notifications.filter(n => getEffectiveNotificationStatus(n) === 'Sent').length
  const totalScheduled = notifications.filter(n => getEffectiveNotificationStatus(n) === 'Scheduled').length
  const totalDraft = notifications.filter(n => getEffectiveNotificationStatus(n) === 'Draft').length
  const totalCanceled = notifications.filter(n => {
    const s = getEffectiveNotificationStatus(n)
    return s === 'Cancelled' || s === 'Canceled'
  }).length

  // Filter notifications by status, category type, and search keyword
  const filteredNotifications = notifications.filter(n => {
    const effStatus = getEffectiveNotificationStatus(n)

    // 1. Status Filter
    if (statusFilter !== 'All') {
      if (statusFilter === 'Cancelled') {
        if (effStatus !== 'Cancelled' && effStatus !== 'Canceled') return false
      } else if (effStatus.toLowerCase() !== statusFilter.toLowerCase()) {
        return false
      }
    }

    // 2. Type/Category Filter
    if (filterType !== 'All' && n.type !== filterType) {
      return false
    }

    // 3. Search Query Filter
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase()
      const subject = (n.subject || n.title || '').toLowerCase()
      const body = (n.body || n.message || n.content || '').toLowerCase()
      const targetGroup = (n.targetType === 'ALL' ? 'all restaurants' : n.targetType === 'PLAN' ? 'subscription plan' : 'specific restaurants').toLowerCase()
      if (!subject.includes(q) && !body.includes(q) && !targetGroup.includes(q)) {
        return false
      }
    }

    return true
  })

  const paginatedNotifications = filteredNotifications.slice(
    currentPage * entriesPerPage,
    (currentPage + 1) * entriesPerPage
  )

  return (
    <div className="animate-fade-in" style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '24px',
      width: '100%',
      boxSizing: 'border-box',
      position: 'relative'
    }}>

      {/* Counters Grid - Clickable for quick status filtering */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
        {[
          { label: 'Sent Notifications', statusKey: 'Sent', count: totalSent, color: '#10b981', bg: 'rgba(16, 185, 129, 0.04)', border: 'rgba(16, 185, 129, 0.12)' },
          { label: 'Scheduled Queue', statusKey: 'Scheduled', count: totalScheduled, color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.04)', border: 'rgba(245, 158, 11, 0.12)' },
          { label: 'Drafts', statusKey: 'Draft', count: totalDraft, color: '#64748b', bg: 'rgba(100, 116, 139, 0.04)', border: 'rgba(100, 116, 139, 0.12)' },
          { label: 'Canceled', statusKey: 'Cancelled', count: totalCanceled, color: '#ef4444', bg: 'rgba(239, 68, 68, 0.04)', border: 'rgba(239, 68, 68, 0.12)' }
        ].map((item, idx) => {
          const isSelected = statusFilter.toLowerCase() === item.statusKey.toLowerCase()
          return (
            <div
              key={idx}
              className="glass-card"
              onClick={() => {
                setStatusFilter(isSelected ? 'All' : item.statusKey)
                setCurrentPage(0)
              }}
              style={{
                padding: '20px',
                background: isSelected ? 'var(--bg-app)' : 'var(--bg-card)',
                border: isSelected ? `2px solid ${item.color}` : `1px solid ${item.border}`,
                borderRadius: '12px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                boxShadow: isSelected ? `0 6px 20px -4px ${item.color}40` : 'none'
              }}
              title={`Filter by ${item.label}`}
            >
              <div>
                <span style={{ fontSize: '0.75rem', fontWeight: '700', color: isSelected ? item.color : 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{item.label}</span>
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
          )
        })}
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
          {canAdd && (
            <button
              onClick={() => {
                setErrors({})
                setEditingNtfId(null)
                setNewNtf({
                  subject: '',
                  type: 'Subscription Expiry',
                  targetType: 'ALL',
                  targetPlan: [],
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

        {/* Filter & Search Toolbar */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '12px',
          flexWrap: 'wrap',
          marginBottom: '8px'
        }}>
          {/* Left: Show Entries Selector */}
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
                  const num = Number(typeof val === 'object' && val !== null && val.target ? val.target.value : val)
                  setEntriesPerPage(num)
                  setCurrentPage(0)
                }}
              />
            </div>
            <span>entries</span>
          </div>

          {/* Right: Filters & Search */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            {/* Status Filter */}
            <div style={{ minWidth: '150px' }}>
              <CustomSelect
                options={[
                  { value: 'All', label: 'All Statuses' },
                  { value: 'Sent', label: 'Sent' },
                  { value: 'Scheduled', label: 'Scheduled' },
                  { value: 'Draft', label: 'Draft' },
                  { value: 'Cancelled', label: 'Cancelled' }
                ]}
                value={statusFilter}
                onChange={(val) => {
                  const selected = typeof val === 'object' && val !== null && val.target ? val.target.value : val
                  setStatusFilter(selected)
                  setCurrentPage(0)
                }}
                placeholder="Filter Status"
              />
            </div>

            {/* Category / Type Filter */}
            <div style={{ minWidth: '175px' }}>
              <CustomSelect
                options={[
                  { value: 'All', label: 'All Categories' },
                  { value: 'Subscription Expiry', label: 'Subscription Expiry' },
                  { value: 'Maintenance Notice', label: 'Maintenance Notice' },
                  { value: 'Feature Updates', label: 'Feature Updates' },
                  { value: 'Promotional Messages', label: 'Promotional Messages' }
                ]}
                value={filterType}
                onChange={(val) => {
                  const selected = typeof val === 'object' && val !== null && val.target ? val.target.value : val
                  setFilterType(selected)
                  setCurrentPage(0)
                }}
                placeholder="Filter Category"
              />
            </div>

            {/* Search Input */}
            <div style={{ position: 'relative', width: '220px' }}>
              <Search style={{
                position: 'absolute',
                left: '10px',
                top: '50%',
                transform: 'translateY(-50%)',
                width: '14px',
                height: '14px',
                color: '#94a3b8'
              }} />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value)
                  setCurrentPage(0)
                }}
                placeholder="Search notifications..."
                style={{
                  width: '100%',
                  padding: '7px 12px 7px 32px',
                  borderRadius: '8px',
                  border: '1.5px solid #cbd5e1',
                  background: '#ffffff',
                  color: '#0f172a',
                  fontSize: '0.82rem',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            {/* Reset Filters */}
            {(statusFilter !== 'All' || filterType !== 'All' || searchTerm.trim() !== '') && (
              <button
                type="button"
                onClick={() => {
                  setStatusFilter('All')
                  setFilterType('All')
                  setSearchTerm('')
                  setCurrentPage(0)
                }}
                className="btn-outline"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  padding: '7px 12px',
                  borderRadius: '8px',
                  fontSize: '0.78rem',
                  fontWeight: '700',
                  color: '#ef4444',
                  borderColor: 'rgba(239, 68, 68, 0.25)',
                  background: 'rgba(239, 68, 68, 0.04)',
                  cursor: 'pointer'
                }}
                title="Reset all filters"
              >
                <RotateCcw style={{ width: '12px', height: '12px' }} /> Reset
              </button>
            )}
          </div>
        </div>
        <div style={{ overflowX: 'auto', background: 'var(--bg-app)', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
          <table className="menu-data-table" style={{ width: '100%', borderCollapse: 'collapse', whiteSpace: 'nowrap' }}>
            <thead>
              <tr style={{ background: 'rgba(255,255,255,0.02)' }}>
                <th style={{ textAlign: 'left', padding: '12px 18px', fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '800' }}>Subject</th>
                <th style={{ textAlign: 'left', padding: '12px 18px', fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '800', width: '150px' }}>Type</th>
                <th style={{ textAlign: 'left', padding: '12px 18px', fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '800', width: '150px' }}>Target Group</th>
                <th style={{ textAlign: 'left', padding: '12px 18px', fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '800', width: '160px' }}>Schedule/Sent Time</th>
                <th style={{ textAlign: 'center', padding: '12px 18px', fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '800', width: '110px' }}>Status</th>
                <th style={{ textAlign: 'right', padding: '12px 18px', fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '800', width: '180px' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedNotifications.length > 0 ? (
                paginatedNotifications.map(n => {
                  const typeStyle = getTypeStyle(n.type)
                  const effStatus = getEffectiveNotificationStatus(n)
                  return (
                    <tr key={n._id} style={{ borderBottom: '1px solid var(--border-color)', transition: 'background 0.2s' }} onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.01)'} onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}>
                      <td style={{ padding: '14px 18px' }}>
                        <span style={{ fontSize: '0.82rem', fontWeight: '700', color: 'var(--text-main)', display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '280px' }} title={n.subject || n.title}>{n.subject || n.title}</span>
                        <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '280px', marginTop: '2px' }}>{n.body || n.message || n.content || ''}</span>
                      </td>
                      <td style={{ padding: '14px 18px' }}>
                        <span style={{ fontSize: '0.68rem', fontWeight: '800', padding: '3px 8px', borderRadius: '6px', background: typeStyle.bg, color: typeStyle.text, display: 'inline-block' }}>{n.type}</span>
                      </td>
                      <td style={{ padding: '14px 18px', fontSize: '0.8rem', color: 'var(--text-main)', fontWeight: '600' }}>
                        {n.targetType === 'ALL' ? 'All Restaurants' : n.targetType === 'PLAN' ? 'Subscription Plan' : 'Specific Restaurants'}
                      </td>
                      <td style={{ padding: '14px 18px', fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: '600' }}>{(n.scheduledDate || n.scheduledAt || n.sendAt || n.scheduledFor) ? formatDate(n.scheduledDate || n.scheduledAt || n.sendAt || n.scheduledFor) : (n.createdAt ? formatDate(n.createdAt) : '—')}</td>
                      <td style={{ padding: '14px 18px', textAlign: 'center' }}>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', fontWeight: '800', color: getStatusColor(effStatus) }}>
                          {getStatusIcon(effStatus)}
                          {effStatus}
                        </div>
                      </td>
                      <td style={{ padding: '14px 18px', textAlign: 'right' }}>
                        <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end', alignItems: 'center' }}>
                          {canView && (
                            <button
                              onClick={() => handleViewDetails(n)}
                              className="btn-outline"
                              style={{
                                width: '28px',
                                height: '28px',
                                padding: 0,
                                display: 'inline-flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                borderRadius: '6px',
                                cursor: 'pointer'
                              }}
                              title="View Notification Details"
                            >
                              <Eye style={{ width: '13px', height: '13px' }} />
                            </button>
                          )}
                          {canEdit && (
                            <button
                              onClick={() => effStatus !== 'Sent' && handleEditClick(n)}
                              disabled={effStatus === 'Sent'}
                              className="btn-outline"
                              style={{
                                width: '28px',
                                height: '28px',
                                padding: 0,
                                display: 'inline-flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                borderRadius: '6px',
                                cursor: effStatus === 'Sent' ? 'not-allowed' : 'pointer',
                                opacity: effStatus === 'Sent' ? 0.35 : 1,
                                color: effStatus === 'Sent' ? 'var(--text-muted)' : 'var(--text-main)',
                                background: 'transparent'
                              }}
                              title={effStatus === 'Sent' ? 'Cannot edit sent notification' : 'Edit Notification'}
                            >
                              <Edit2 style={{ width: '13px', height: '13px' }} />
                            </button>
                          )}
                          {canEdit && effStatus === 'Scheduled' && (
                            <button
                              onClick={() => handleCancelScheduled(n._id || n.id)}
                              style={{
                                width: '28px',
                                height: '28px',
                                padding: 0,
                                display: 'inline-flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                borderRadius: '6px',
                                cursor: 'pointer',
                                background: 'rgba(245, 158, 11, 0.12)',
                                color: '#f59e0b',
                                border: '1px solid rgba(245, 158, 11, 0.25)'
                              }}
                              title="Cancel Scheduled Notification"
                            >
                              <Ban style={{ width: '13px', height: '13px' }} />
                            </button>
                          )}
                          {canEdit && effStatus === 'Draft' && (
                            <button
                              onClick={() => handleSendDraft(n._id || n.id)}
                              style={{
                                width: '28px',
                                height: '28px',
                                padding: 0,
                                display: 'inline-flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                borderRadius: '6px',
                                cursor: 'pointer',
                                background: 'rgba(16, 185, 129, 0.12)',
                                color: '#10b981',
                                border: '1px solid rgba(16, 185, 129, 0.25)'
                              }}
                              title="Send Draft Now"
                            >
                              <Send style={{ width: '12px', height: '12px' }} />
                            </button>
                          )}
                          {canDelete && (
                            <button
                              onClick={() => handleDelete(n._id || n.id)}
                              className="btn-outline"
                              style={{
                                width: '28px',
                                height: '28px',
                                padding: 0,
                                display: 'inline-flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                borderRadius: '6px',
                                cursor: 'pointer',
                                color: '#ef4444'
                              }}
                              title="Delete Notification"
                            >
                              <Trash2 style={{ width: '13px', height: '13px' }} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })
              ) : (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '36px', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                    No notification history found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <TableBottomPagination
          totalEntries={filteredNotifications.length}
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
          padding: '20px',
          overflowY: 'auto'
        }} onClick={() => setShowCreateModal(false)}>
          <div className="menu-edit-panel invisible-scrollbar animate-fade-in" style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border-color)',
            borderRadius: '16px',
            padding: '28px',
            width: '90%',
            maxWidth: '540px',
            boxShadow: 'var(--shadow-premium)',
            position: 'relative',
            top: 'auto',
            maxHeight: 'calc(100vh - 40px)',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            scrollbarWidth: 'none',
            msOverflowStyle: 'none'
          }} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: '800', color: 'var(--text-main)', margin: '0 0 16px 0', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px', flexShrink: 0 }}>
              {editingNtfId ? 'Edit Broadcast Notification' : 'Compose Broadcast Notification'}
            </h3>

            <form onSubmit={handleCreateSubmit} className="invisible-scrollbar" style={{ display: 'flex', flexDirection: 'column', gap: '14px', overflowY: 'auto', paddingRight: '4px', flex: 1, scrollbarWidth: 'none', msOverflowStyle: 'none' }}>

              {/* Type */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-main)' }}>Notification Type</label>
                <CustomSelect
                  options={types.map(t => ({ value: t, label: t }))}
                  value={newNtf.type}
                  onChange={(val) => {
                    const selected = typeof val === 'object' && val !== null && val.target ? val.target.value : val
                    setNewNtf({ ...newNtf, type: selected })
                  }}
                  placeholder="Select Notification Type"
                />
              </div>

              {/* Target Audience Segmented Control */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-main)' }}>Target Audience</label>
                <div style={{ display: 'flex', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-color)', borderRadius: '8px', overflow: 'hidden' }}>
                  {['ALL', 'PLAN', 'RESTAURANT'].map(type => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setNewNtf({ ...newNtf, targetType: type, targetPlan: [], targetRestaurants: [] })}
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
                  <label style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-main)' }}>Select Subscription Plan(s) *</label>
                  <CustomSelect
                    isMulti={true}
                    options={plans
                      .filter(p => {
                        if (p.status && String(p.status).trim().toLowerCase() === 'inactive') return false;
                        if (p.isActive === false) return false;
                        if (p.status && String(p.status).trim().toLowerCase() !== 'active') return false;
                        return true;
                      })
                      .map(p => ({ value: p._id || p.id, label: p.planName || p.name }))}
                    value={Array.isArray(newNtf.targetPlan) ? newNtf.targetPlan : (newNtf.targetPlan ? [newNtf.targetPlan] : [])}
                    onChange={(val) => {
                      const selected = Array.isArray(val) ? val : (typeof val === 'object' && val !== null && val.target ? val.target.value : [val])
                      setNewNtf({ ...newNtf, targetPlan: Array.isArray(selected) ? selected : (selected ? [selected] : []) })
                      if (errors.targetPlan) setErrors({ ...errors, targetPlan: '' })
                    }}
                    error={errors.targetPlan}
                    placeholder="-- Select Subscription Plans --"
                  />
                  {errors.targetPlan && <span style={{ fontSize: '0.7rem', color: '#ef4444', fontWeight: '600' }}>{errors.targetPlan}</span>}
                </div>
              )}

              {newNtf.targetType === 'RESTAURANT' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', padding: '12px', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                  <label style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-main)' }}>Select Restaurants *</label>

                  <div style={{ position: 'relative' }} ref={resDropdownRef}>
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
                <label style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-main)' }}>Message Subject *</label>
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
                <label style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-main)' }}>Message Body (Content) *</label>
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

              {/* Delivery Option Segmented Control */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '2px' }}>
                <label style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-main)' }}>Delivery Option</label>
                <div style={{ display: 'flex', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-color)', borderRadius: '8px', overflow: 'hidden' }}>
                  {[
                    { id: 'broadcast', label: 'Broadcast Now', icon: Send },
                    { id: 'schedule', label: 'Schedule', icon: Calendar },
                    { id: 'draft', label: 'Save Draft', icon: FileText }
                  ].map(opt => {
                    const Icon = opt.icon
                    const isSelected = deliveryOption === opt.id
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => {
                          setDeliveryOption(opt.id)
                          setNewNtf({ ...newNtf, isScheduled: opt.id === 'schedule' })
                        }}
                        style={{
                          flex: 1,
                          padding: '8px 0',
                          fontSize: '0.75rem',
                          fontWeight: '700',
                          border: 'none',
                          background: isSelected ? 'var(--text-main)' : 'transparent',
                          color: isSelected ? '#ffffff' : 'var(--text-muted)',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '6px',
                          transition: 'all 0.2s'
                        }}
                      >
                        <Icon style={{ width: '13px', height: '13px' }} />
                        {opt.label}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Schedule Inputs */}
              {(deliveryOption === 'schedule' || newNtf.isScheduled) && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', padding: '12px', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <label style={{ fontSize: '0.7rem', fontWeight: '700', color: 'var(--text-main)' }}>Date *</label>
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
                    <label style={{ fontSize: '0.7rem', fontWeight: '700', color: 'var(--text-main)' }}>Time *</label>
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
              <div style={{ display: 'flex', gap: '10px', marginTop: '14px', borderTop: '1px solid var(--border-color)', paddingTop: '16px', flexShrink: 0, flexWrap: 'wrap' }}>
                <button type="submit" className="btn-black" style={{ flex: 1, minWidth: '130px', padding: '10px', borderRadius: '8px', border: 'none', background: '#000000', color: '#ffffff', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                  {editingNtfId ? (
                    <><Send style={{ width: '15px', height: '15px' }} /> Update & Save</>
                  ) : deliveryOption === 'draft' ? (
                    <><FileText style={{ width: '15px', height: '15px' }} /> Save as Draft</>
                  ) : deliveryOption === 'schedule' ? (
                    <><Calendar style={{ width: '15px', height: '15px' }} /> Schedule dispatch</>
                  ) : (
                    <><Send style={{ width: '15px', height: '15px' }} /> Broadcast Now</>
                  )}
                </button>
                {deliveryOption !== 'draft' && (
                  <button type="button" onClick={handleSaveDraft} className="btn-outline" style={{ flex: 1, minWidth: '120px', padding: '10px', borderRadius: '8px', border: '1.5px solid var(--primary, #f95e10)', color: 'var(--primary, #f95e10)', background: 'transparent', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px' }}>
                    <FileText style={{ width: '14px', height: '14px' }} /> {editingNtfId ? 'Save as Draft' : 'Save as Draft'}
                  </button>
                )}
                <button type="button" className="btn-outline" onClick={() => { setShowCreateModal(false); setEditingNtfId(null); setErrors({}); }} style={{ padding: '10px 18px', borderRadius: '8px', border: '1px solid var(--border-color)', background: '#ffffff', color: 'var(--text-muted)', fontWeight: '700', cursor: 'pointer' }}>Cancel</button>
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
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', fontWeight: '800', color: getStatusColor(getEffectiveNotificationStatus(selectedNotification)) }}>
                {getStatusIcon(getEffectiveNotificationStatus(selectedNotification))}
                {getEffectiveNotificationStatus(selectedNotification)}
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
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-main)', fontWeight: '700' }}>{(selectedNotification.scheduledDate || selectedNotification.scheduledAt || selectedNotification.sendAt || selectedNotification.scheduledFor) ? formatDate(selectedNotification.scheduledDate || selectedNotification.scheduledAt || selectedNotification.sendAt || selectedNotification.scheduledFor) : (selectedNotification.createdAt ? formatDate(selectedNotification.createdAt) : '—')}</span>
                </div>
              </div>

              <div>
                <span style={{ display: 'block', fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: '700', textTransform: 'uppercase' }}>Subject Text</span>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-main)', fontWeight: '700' }}>{selectedNotification.subject || selectedNotification.title}</span>
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
                  {selectedNotification.body || selectedNotification.message || selectedNotification.content || 'No message content.'}
                </div>
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '10px', flexWrap: 'wrap' }}>
                {getEffectiveNotificationStatus(selectedNotification) === 'Draft' && canEdit && (
                  <button
                    onClick={() => {
                      handleSendDraft(selectedNotification._id || selectedNotification.id)
                      setSelectedNotification(null)
                    }}
                    className="btn-black"
                    style={{ flex: 1, minWidth: '120px', padding: '10px', borderRadius: '8px', border: 'none', background: '#10b981', color: '#ffffff', fontWeight: '700', cursor: 'pointer' }}
                  >
                    Broadcast Now
                  </button>
                )}
                {getEffectiveNotificationStatus(selectedNotification) === 'Scheduled' && canEdit && (
                  <button
                    type="button"
                    onClick={async () => {
                      await handleCancelScheduled(selectedNotification._id || selectedNotification.id)
                      setSelectedNotification(null)
                    }}
                    className="btn-outline"
                    style={{
                      flex: 1,
                      minWidth: '120px',
                      padding: '10px',
                      borderRadius: '8px',
                      border: '1.5px solid #f59e0b',
                      color: '#f59e0b',
                      background: 'transparent',
                      fontWeight: '700',
                      cursor: 'pointer'
                    }}
                  >
                    Cancel Schedule
                  </button>
                )}
                <button type="button" className="btn-outline" onClick={() => setSelectedNotification(null)} style={{ flex: 1, minWidth: '80px', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-color)', background: '#ffffff', color: 'var(--text-muted)', fontWeight: '700', cursor: 'pointer' }}>Dismiss</button>
              </div>

            </div>
          </div>
        </div>,
        document.body
      )}

    </div>
  )
}
