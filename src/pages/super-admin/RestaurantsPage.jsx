import React, { useState, useEffect, useRef } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import {
  Building,
  AlertTriangle,
  MapPin,
  Clock,
  Gem,
  Calendar,
  X,
  Lock,
  Unlock,
  Eye,
  EyeOff,
  Edit2,
  Trash2,
  Plus,
  Shield,
  ChevronDown,
  Upload,
  CreditCard,
} from 'lucide-react'
import { getPlans, createRestaurant, updateRestaurant as updateRestaurantApi, updateRestaurantStatus as updateRestaurantStatusApi, deleteRestaurant as deleteRestaurantApi, uploadImage, getManagers, updateManager } from '../../services/api'
import { TableTopControls, TableBottomPagination } from '../../components/common/TablePagination'
import { ValidatedSelect } from '../../components/common/CustomSelect'
import { formatDate } from '../../utils/dateFormat'
import { getImageUrl } from '../../utils/imageUrl'
import { useRestaurant } from '../../hooks/useRestaurants'
import { useNotification } from '../../contexts/NotificationContext'
import { useAuth } from '../../contexts/AuthContext'

// ─── Reusable validated input component ───
const ValidatedInput = ({ label, type = 'text', value, onChange, placeholder, required, error, setError, autoComplete = 'new-password', name, preventAutofill = false, allowOnlyNumbers = false, allowDecimal = false, ...rest }) => {
  const [isFocused, setIsFocused] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const isNumeric = type === 'number' || allowOnlyNumbers || allowDecimal
  const inputType = type === 'password' ? (showPassword ? 'text' : 'password') : (isNumeric ? 'text' : type)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', position: 'relative' }}>
      <label style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-main)' }}>
        {label}{required && <span style={{ color: '#ef4444', marginLeft: '2px' }}>*</span>}
      </label>
      <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
        <input
          type={inputType}
          inputMode={isNumeric ? (allowDecimal ? 'decimal' : 'numeric') : undefined}
          value={value}
          onChange={(e) => {
            if (isNumeric) {
              const rawVal = e.target.value;
              const regex = allowDecimal ? /[^0-9.]/g : /[^0-9]/g;
              let cleaned = rawVal.replace(regex, '');
              if (allowDecimal) {
                const parts = cleaned.split('.');
                if (parts.length > 2) {
                  cleaned = parts[0] + '.' + parts.slice(1).join('');
                }
              }
              e.target.value = cleaned;
            }
            onChange(e)
            if (error && setError) setError('')
          }}
          onKeyDown={(e) => {
            if (isNumeric) {
              if (['e', 'E', '+', '-'].includes(e.key)) {
                e.preventDefault()
              }
            }
            if (rest.onKeyDown) rest.onKeyDown(e)
          }}
          onFocus={(e) => {
            setIsFocused(true)
            if (preventAutofill) e.target.removeAttribute('readOnly')
          }}
          readOnly={preventAutofill && !isFocused}
          placeholder={placeholder}
          required={required}
          autoComplete={autoComplete}
          name={name}
          style={{
            width: '100%',
            padding: type === 'password' ? '9px 38px 9px 12px' : '9px 12px',
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
        {type === 'password' && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            style={{
              position: 'absolute',
              right: error ? '30px' : '10px',
              top: '50%',
              transform: 'translateY(-50%)',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '2px',
              color: 'var(--text-muted)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 2
            }}
            title={showPassword ? "Hide Password" : "Show Password"}
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

// ─── Custom Image File Upload Button Component ───
const ImageUploadButton = ({ label, value, onChange, onClear, error, setError }) => {
  const fileInputRef = useRef(null)
  const [isUploading, setIsUploading] = useState(false)
  const [localError, setLocalError] = useState('')

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    const allowedMimeTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml']
    const allowedExtensions = /\.(jpe?g|png|webp|gif|svg)$/i

    // Validate file format
    if (!allowedMimeTypes.includes(file.type) && !allowedExtensions.test(file.name)) {
      const err = 'Invalid file format. Please select an image file (JPG, PNG, WEBP, GIF, SVG).'
      setLocalError(err)
      if (setError) setError(err)
      if (fileInputRef.current) fileInputRef.current.value = ''
      return
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      const err = 'File size exceeds 5MB limit. Please upload a smaller image.'
      setLocalError(err)
      if (setError) setError(err)
      if (fileInputRef.current) fileInputRef.current.value = ''
      return
    }

    setLocalError('')
    if (setError) setError('')

    // Instantly generate local data URL for preview so the user sees their image immediately
    const reader = new FileReader()
    reader.onload = async (uploadEvt) => {
      const dataUrl = uploadEvt.target?.result
      if (dataUrl) {
        onChange(dataUrl)
      }

      setIsUploading(true)
      try {
        const response = await uploadImage(file)
        const remoteUrl =
          response?.url ||
          response?.data?.url ||
          response?.imageUrl ||
          response?.data?.imageUrl ||
          response?.filePath ||
          response?.data?.filePath ||
          (typeof response === 'string' ? response : '')

        if (remoteUrl) {
          onChange(getImageUrl(remoteUrl))
        }
      } catch (uploadErr) {
        console.warn('Image upload API notice:', uploadErr)
        // Keep the local dataUrl in onChange so the form has the image
      } finally {
        setIsUploading(false)
      }
    }
    reader.readAsDataURL(file)
  }

  const displayedError = localError || error
  const resolvedSrc = getImageUrl(value)

  return (
    <div style={{ marginTop: '8px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
      {label && <label style={{ fontSize: '0.72rem', fontWeight: '700', color: 'var(--text-muted)' }}>{label}</label>}

      <input
        type="file"
        ref={fileInputRef}
        accept="image/jpeg,image/png,image/webp,image/gif,image/svg+xml"
        onChange={handleFileChange}
        style={{ display: 'none' }}
        disabled={isUploading}
      />

      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
        <button
          type="button"
          onClick={() => {
            setLocalError('')
            if (setError) setError('')
            fileInputRef.current?.click()
          }}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '7px 14px',
            borderRadius: '8px',
            background: displayedError ? 'rgba(239,68,68,0.04)' : 'var(--bg-app)',
            border: displayedError ? '1.5px dashed #ef4444' : '1px dashed var(--border-color)',
            color: displayedError ? '#ef4444' : 'var(--text-main)',
            fontSize: '0.78rem',
            fontWeight: '700',
            cursor: 'pointer',
            transition: 'all 0.15s'
          }}
          onMouseOver={(e) => {
            if (!displayedError) {
              e.currentTarget.style.borderColor = 'var(--primary, #f95e10)'
              e.currentTarget.style.color = 'var(--primary, #f95e10)'
            }
          }}
          onMouseOut={(e) => {
            if (!displayedError) {
              e.currentTarget.style.borderColor = 'var(--border-color)'
              e.currentTarget.style.color = 'var(--text-main)'
            }
          }}
        >
          <Upload style={{ width: '14px', height: '14px' }} />
          {isUploading ? 'Uploading...' : 'Choose Image File'}
        </button>

        {value ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '6px',
              overflow: 'hidden',
              border: '1px solid var(--border-color)',
              background: 'var(--bg-app)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}>
              <img
                src={resolvedSrc}
                alt="Preview"
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                onError={(e) => {
                  e.currentTarget.onerror = null
                  e.currentTarget.src = 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=60&auto=format&fit=crop&q=60'
                }}
              />
            </div>
            <span style={{ fontSize: '0.72rem', color: '#10b981', fontWeight: '700' }}>Selected</span>
            <button
              type="button"
              onClick={() => {
                setLocalError('')
                if (setError) setError('')
                if (fileInputRef.current) fileInputRef.current.value = ''
                onClear()
              }}
              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '2px', color: '#ef4444', display: 'flex', alignItems: 'center' }}
              title="Remove image"
            >
              <X style={{ width: '14px', height: '14px' }} />
            </button>
          </div>
        ) : (
          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>No file chosen</span>
        )}
      </div>

      {displayedError && (
        <span style={{ fontSize: '0.7rem', color: '#ef4444', fontWeight: '600', marginTop: '2px' }}>
          {displayedError}
        </span>
      )}
    </div>
  )
}

// ─── Reusable 12-hour Time Picker component with custom dropdown opening BELOW input ───
const TimePickerWithAMPM = ({ label, value, onChange, required, error, setError }) => {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef(null)

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const parseValue = (val) => {
    if (!val || String(val).trim() === '') return { time: '', period: 'AM', isSelected: false }
    const parts = String(val).trim().split(/\s+/)
    if (parts.length >= 2) {
      return { time: parts[0], period: parts[1].toUpperCase() === 'PM' ? 'PM' : 'AM', isSelected: true }
    }
    // If format is "11:00" without AM/PM or HH:MM
    if (val.includes(':')) {
      const [hStr, mStr] = val.split(':')
      let h = parseInt(hStr) || 11
      const period = h >= 12 ? 'PM' : 'AM'
      if (h === 0) h = 12
      else if (h > 12) h = h - 12
      const formattedH = String(h).padStart(2, '0')
      const formattedM = mStr ? mStr.slice(0, 2) : '00'
      return { time: `${formattedH}:${formattedM}`, period, isSelected: true }
    }
    return { time: '', period: 'AM', isSelected: false }
  }

  const { time, period, isSelected } = parseValue(value)

  const handleSelectTime = (selectedTime) => {
    const combined = `${selectedTime} ${period}`
    onChange(combined)
    setIsOpen(false)
    if (error && setError) setError('')
  }

  const handlePeriodToggle = (newPeriod) => {
    const currentTime = isSelected ? time : '11:00'
    const combined = `${currentTime} ${newPeriod}`
    onChange(combined)
    if (error && setError) setError('')
  }

  const timeOptions = [
    '06:00', '06:30', '07:00', '07:30', '08:00', '08:30', '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
    '12:00', '12:30', '01:00', '01:30', '02:00', '02:30', '03:00', '03:30', '04:00', '04:30', '05:00', '05:30'
  ]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', position: 'relative' }} ref={dropdownRef}>
      <label style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-main)' }}>
        {label}{required && <span style={{ color: '#ef4444', marginLeft: '2px' }}>*</span>}
      </label>
      <div style={{ display: 'flex', gap: '6px' }}>
        {/* Custom time trigger input */}
        <div
          onClick={() => setIsOpen(!isOpen)}
          style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '9px 12px',
            border: `1.5px solid ${isOpen ? 'var(--primary, #f95e10)' : error ? '#ef4444' : 'var(--border-color)'}`,
            background: error ? 'rgba(239,68,68,0.04)' : 'var(--bg-app)',
            color: 'var(--text-main)',
            borderRadius: '8px',
            fontSize: '0.82rem',
            fontWeight: '700',
            cursor: 'pointer',
            userSelect: 'none',
            boxSizing: 'border-box',
            boxShadow: isOpen ? '0 0 0 3px rgba(249, 94, 16, 0.15)' : 'none',
            transition: 'all 0.15s'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Clock style={{ width: '14px', height: '14px', color: 'var(--text-muted)' }} />
            <span style={{ color: isSelected ? 'var(--text-main)' : 'var(--text-muted)' }}>
              {isSelected ? time : 'Select Time'}
            </span>
          </div>
          <ChevronDown style={{ width: '14px', height: '14px', color: 'var(--text-muted)', transform: isOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
        </div>

        {/* AM / PM Toggle */}
        <div style={{ display: 'flex', border: '1.5px solid var(--border-color)', borderRadius: '8px', overflow: 'hidden', background: 'var(--bg-app)' }}>
          <button
            type="button"
            onClick={() => handlePeriodToggle('AM')}
            style={{
              padding: '0 10px',
              border: 'none',
              background: period === 'AM' ? 'var(--primary, #f95e10)' : 'transparent',
              color: period === 'AM' ? '#ffffff' : 'var(--text-muted)',
              fontWeight: '800',
              fontSize: '0.75rem',
              cursor: 'pointer',
              transition: 'all 0.15s'
            }}
          >
            AM
          </button>
          <button
            type="button"
            onClick={() => handlePeriodToggle('PM')}
            style={{
              padding: '0 10px',
              border: 'none',
              background: period === 'PM' ? 'var(--primary, #f95e10)' : 'transparent',
              color: period === 'PM' ? '#ffffff' : 'var(--text-muted)',
              fontWeight: '800',
              fontSize: '0.75rem',
              cursor: 'pointer',
              transition: 'all 0.15s'
            }}
          >
            PM
          </button>
        </div>
      </div>

      {/* Custom Floating Dropdown Menu opening ALWAYS BELOW the input field */}
      {isOpen && (
        <div style={{
          position: 'absolute',
          top: '100%',
          left: 0,
          right: '85px',
          marginTop: '4px',
          maxHeight: '200px',
          overflowY: 'auto',
          background: '#ffffff',
          border: '1px solid var(--border-color)',
          borderRadius: '10px',
          boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.15), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
          zIndex: 9999,
          padding: '6px',
          display: 'flex',
          flexDirection: 'column',
          gap: '2px'
        }}>
          {timeOptions.map(t => {
            const isSelected = t === time
            return (
              <div
                key={t}
                onClick={() => handleSelectTime(t)}
                style={{
                  padding: '8px 12px',
                  borderRadius: '6px',
                  fontSize: '0.82rem',
                  fontWeight: isSelected ? '800' : '600',
                  color: isSelected ? 'var(--primary, #f95e10)' : 'var(--text-main)',
                  background: isSelected ? 'rgba(249, 94, 16, 0.08)' : 'transparent',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  transition: 'background 0.15s'
                }}
                onMouseOver={(e) => {
                  if (!isSelected) e.currentTarget.style.background = 'var(--bg-app)'
                }}
                onMouseOut={(e) => {
                  if (!isSelected) e.currentTarget.style.background = 'transparent'
                }}
              >
                <span>{t}</span>
                {isSelected && <span style={{ fontSize: '0.75rem', color: 'var(--primary, #f95e10)' }}>✓</span>}
              </div>
            )
          })}
        </div>
      )}
      {error && <span style={{ fontSize: '0.7rem', color: '#ef4444', fontWeight: '600' }}>{error}</span>}
    </div>
  )
}

export default function RestaurantsPage() {
  const location = useLocation()
  const navigate = useNavigate()
  const { restaurants, activeRestaurantId, setActiveRestaurantId: onSetActiveRestaurantId, activeRestaurant, fetchRestaurants } = useRestaurant()
  const { showToast } = useNotification()
  const { hasPermission, isSuperOwner } = useAuth()

  const canAdd = isSuperOwner || hasPermission('restaurants', 'add')
  const canEdit = isSuperOwner || hasPermission('restaurants', 'edit')
  const canDelete = isSuperOwner || hasPermission('restaurants', 'delete')
  const canView = isSuperOwner || hasPermission('restaurants', 'view')

  const [confirmModal, setConfirmModal] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  const [plans, setPlans] = useState([])
  useEffect(() => {
    const loadPlans = async () => {
      try {
        const response = await getPlans();
        if (response.success) {
          const plansList = response.data.results || response.data;
          const activePlans = plansList.filter(p => p.isActive || p.status === 'Active');
          setPlans(activePlans);
          if (!newRestState.planId) {
            setNewRestState(prev => ({
              ...prev,
              planId: activePlans.length > 0 ? activePlans[0]._id : ''
            }))
          }
        }
      } catch (e) {
        console.error("Failed to load plans", e)
      }
    }
    loadPlans()
  }, [])
  
  // mock for compatibility
  const onUpdateRestaurantDetails = (d) => { /* Update active restaurant logic */ }
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingRestId, setEditingRestId] = useState(null)
  const [viewingRestId, setViewingRestId] = useState(null)
  const [viewingSubscriptionRest, setViewingSubscriptionRest] = useState(null)
  const [editFormState, setEditFormState] = useState(null)
  const [formErrors, setFormErrors] = useState({})
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false)

  // Pagination & Search states
  const [currentPage, setCurrentPage] = useState(0)
  const [entriesPerPage, setEntriesPerPage] = useState(10)
  const [searchTerm, setSearchTerm] = useState('')

  const filteredRestaurants = restaurants.filter(r => {
    const term = searchTerm.toLowerCase()
    return !term || 
      (r.name && r.name.toLowerCase().includes(term)) ||
      (r.ownerName && r.ownerName.toLowerCase().includes(term)) ||
      (r.id && r.id.toLowerCase().includes(term)) ||
      (r.email && r.email.toLowerCase().includes(term))
  })

  const paginatedRestaurants = filteredRestaurants.slice(
    currentPage * entriesPerPage,
    (currentPage + 1) * entriesPerPage
  )

  // Listen for sidebar click reset event to open main module list
  useEffect(() => {
    const handleReset = (e) => {
      if (e.detail?.tab === 'details' || e.detail?.tab === 'restaurants' || e.detail?.tab === 'all' || !e.detail?.tab) {
        setEditingRestId(null)
        setViewingRestId(null)
        setShowAddModal(false)
        setViewingSubscriptionRest(null)
        setFormErrors({})
      }
    }
    window.addEventListener('reset_module_view', handleReset)
    return () => window.removeEventListener('reset_module_view', handleReset)
  }, [])

  // Prefill editFormState when editingRestId is restored on page refresh
  useEffect(() => {
    if (editingRestId && !editFormState) {
      setFormErrors({})
      const rest = restaurants.find(r => r.id === editingRestId)
      if (rest) {
        const defaultPan = rest.pan || (rest.gstin && rest.gstin.length >= 12 ? rest.gstin.slice(2, 12) : 'AAAAA1111A')
        setEditFormState({
          ...rest,
          ownerName: rest.ownerName || 'Rajesh Kumar',
          mobileNumber: rest.mobileNumber || rest.phone || '',
          email: rest.email || '',
          website: rest.website || '',
          address: rest.address || '',
          city: rest.city || 'Chennai',
          state: rest.state || 'Tamil Nadu',
          country: rest.country || 'India',
          license: rest.license || '',
          gstin: rest.gstin || '',
          pan: defaultPan,
          taxRate: rest.taxRate !== undefined ? rest.taxRate : '',
          serviceCharge: rest.serviceCharge !== undefined ? rest.serviceCharge : '',
          openingTime: rest.openingTime || '',
          closingTime: rest.closingTime || '',
          status: rest.status || 'Active',
          logo: rest.logo || rest.logoUrl || '',
          password: '',
          confirmPassword: ''
        })
      }
    }
  }, [editingRestId, restaurants, editFormState])

  const [newRestState, setNewRestState] = useState({
    name: '',
    branch: '',
    license: '',
    gstin: '',
    pan: '',
    phone: '',
    email: '',
    website: '',
    address: '',
    currency: 'INR',
    taxRate: '',
    serviceCharge: '',
    openingTime: '',
    closingTime: '',
    status: 'Active',
    subscriptionPlan: 'Standard',
    createdDate: new Date().toISOString().split('T')[0],
    password: '',
    confirmPassword: '',
    ownerName: '',
    mobileNumber: '',
    city: '',
    state: '',
    country: '',
    logo: '',
    banner: '',
    startDate: '',
    endDate: '',
    renewalDate: '',
    planId: '',
    billingCycle: 'Monthly'
  })

  // Synchronize new restaurant default values
  useEffect(() => {
    setNewRestState(prev => ({
      ...prev,
      createdDate: new Date().toISOString().split('T')[0]
    }))
  }, [])

  // Handle lead conversion redirection
  const [conversionLeadId, setConversionLeadId] = useState(null)
  useEffect(() => {
    if (location.state?.convertFromLead) {
      const lead = location.state.convertFromLead
      setConversionLeadId(lead._id)
      setNewRestState(prev => ({
        ...prev,
        name: lead.businessName || '',
        ownerName: lead.contactPerson || '',
        email: lead.emailAddress || '',
        mobileNumber: lead.mobileNumber || ''
      }))
      setShowAddModal(true)
      
      // Clean up state so refresh doesn't trigger it again
      navigate(location.pathname, { replace: true, state: {} })
    }
  }, [location.state, navigate])

  const handleEditClick = (rest) => {
    setViewingRestId(null)
    setEditingRestId(rest.id)
    setFormErrors({})
    const defaultPan = rest.pan || (rest.gstin && rest.gstin.length >= 12 ? rest.gstin.slice(2, 12) : 'AAAAA1111A')
    setEditFormState({
      ...rest,
      ownerName: rest.ownerName || 'Rajesh Kumar',
      mobileNumber: rest.mobileNumber || rest.phone || '',
      email: rest.email || '',
      website: rest.website || '',
      address: rest.address || '',
      city: rest.city || 'Chennai',
      state: rest.state || 'Tamil Nadu',
      country: rest.country || 'India',
      license: rest.license || '',
      gstin: rest.gstin || '',
      pan: defaultPan,
      taxRate: rest.taxRate !== undefined ? rest.taxRate : '',
      serviceCharge: rest.serviceCharge !== undefined ? rest.serviceCharge : '',
      openingTime: rest.openingTime || '',
      closingTime: rest.closingTime || '',
      status: rest.status || 'Active',
      logo: rest.logo || '',
      password: '',
      confirmPassword: ''
    })
  }

  // Handle Create Restaurant
  const handleCreateRestaurant = async (e) => {
    e.preventDefault()

    const errors = {}
    const requiredFields = {
      name: 'Business Name',
      ownerName: 'Owner Name',
      mobileNumber: 'Mobile Number',
      email: 'Email',
      address: 'Registered Location Address',
      city: 'City',
      state: 'State',
      country: 'Country',
      license: 'FSSAI License Number',
      pan: 'PAN Number',
      openingTime: 'Opening Time',
      closingTime: 'Closing Time',
      password: 'Create Password',
      confirmPassword: 'Confirm Password'
    }

    for (const [field, label] of Object.entries(requiredFields)) {
      if (!newRestState[field] || String(newRestState[field]).trim() === '') {
        errors[field] = `${label} is Required`
      }
    }

    // Owner Name: letters and spaces only
    if (newRestState.ownerName && !/^[a-zA-Z\s]+$/.test(newRestState.ownerName.trim())) {
      errors.ownerName = 'Owner Name must contain letters and spaces only'
    }

    // Mobile Number: 10-digit Indian number starting with 6-9, no duplicates
    const mob = (newRestState.mobileNumber || '').trim()
    if (mob && !/^[6-9]\d{9}$/.test(mob)) {
      errors.mobileNumber = 'Enter a valid 10-digit mobile number'
    } else if (mob && restaurants.some(r => r.mobileNumber === mob || r.phone === mob)) {
      errors.mobileNumber = 'Mobile number already registered by another restaurant'
    }

    // Email: mandatory @ symbol
    const emailVal = (newRestState.email || '').trim()
    if (emailVal && (!emailVal.includes('@') || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailVal))) {
      errors.email = 'Valid email address containing "@" is required'
    }

    // City, State, Country: letters and spaces only
    if (newRestState.city && !/^[a-zA-Z\s]+$/.test(newRestState.city.trim())) {
      errors.city = 'City must contain letters and spaces only'
    }
    if (newRestState.state && !/^[a-zA-Z\s]+$/.test(newRestState.state.trim())) {
      errors.state = 'State must contain letters and spaces only'
    }
    if (newRestState.country && !/^[a-zA-Z\s]+$/.test(newRestState.country.trim())) {
      errors.country = 'Country must contain letters and spaces only'
    }

    const fssaiVal = (newRestState.license || '').trim()
    if (fssaiVal && !/^1\d{13}$/.test(fssaiVal)) {
      errors.license = 'FSSAI License Number must contain exactly 14 digits and start with 1.'
    }

    const gstinVal = (newRestState.gstin || '').trim().toUpperCase()
    if (gstinVal && !/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/.test(gstinVal)) {
      errors.gstin = 'Invalid GSTIN. Please enter a valid 15-character GSTIN.'
    }

    const panVal = (newRestState.pan || '').trim().toUpperCase()
    if (panVal && !/^[A-Z]{5}[0-9]{4}[A-Z]$/.test(panVal)) {
      errors.pan = 'Invalid PAN number. Please enter a valid 10-character PAN.'
    }

    if (newRestState.password && newRestState.confirmPassword && newRestState.password !== newRestState.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match'
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors)
      return
    }

    setFormErrors({})
    setIsSubmitting(true)
    try {
      const payload = {
        restaurantName: newRestState.name,
        ownerName: newRestState.ownerName,
        email: newRestState.email,
        phoneNumber: newRestState.mobileNumber,
        planId: newRestState.planId || undefined,
        password: newRestState.password,
        billingCycle: newRestState.billingCycle || "Monthly",
        address: newRestState.address,
        city: newRestState.city,
        state: newRestState.state,
        country: newRestState.country,
        fssaiLicense: newRestState.license,
        gstinNumber: newRestState.gstin,
        panNumber: newRestState.pan,
        openingTime: newRestState.openingTime,
        closingTime: newRestState.closingTime,
        logoUrl: newRestState.logo,
        bannerUrl: newRestState.banner,
        startDate: newRestState.startDate || undefined,
        endDate: newRestState.endDate || undefined,
        renewalDate: newRestState.renewalDate || undefined,
        leadId: conversionLeadId || undefined,
        status: newRestState.status || 'Active',
        isActive: (newRestState.status || 'Active') === 'Active'
      };

      const response = await createRestaurant(payload);
      if (response.success) {
        await fetchRestaurants();
        setShowAddModal(false);
        setConversionLeadId(null);
        showToast('success', `Restaurant "${newRestState.name}" registered successfully!`);
        // Clear state
        setNewRestState({
          name: '',
          branch: '',
          license: '',
          gstin: '',
          pan: '',
          phone: '',
          email: '',
          website: '',
          address: '',
          currency: 'INR',
          taxRate: '',
          serviceCharge: '',
          openingTime: '',
          closingTime: '',
          status: 'Active',
          subscriptionPlan: 'Standard',
          planId: plans.length > 0 ? plans[0]._id : '',
          createdDate: new Date().toISOString().split('T')[0],
          password: '',
          confirmPassword: '',
          ownerName: '',
          mobileNumber: '',
          city: '',
          state: '',
          country: '',
          logo: '',
          banner: ''
        })
      } else {
        showToast('error', response.message || 'Error creating restaurant');
      }
    } catch (err) {
      showToast('error', err.response?.data?.message || 'Error creating restaurant');
    } finally {
      setIsSubmitting(false)
    }
  }

  // Handle Delete Restaurant
  const handleDeleteRestaurant = (id) => {
    const targetRest = restaurants.find(r => r.id === id || r._id === id)
    if (!targetRest) return
    setConfirmModal({
      title: "Delete Franchise Branch",
      message: `Are you sure you want to permanently delete the branch "${targetRest.name}"? This action cannot be undone.`,
      confirmText: "Confirm Delete",
      confirmColor: "#ef4444",
      onConfirm: async () => {
        try {
          const response = await deleteRestaurantApi(targetRest._id);
          if (response.success) {
            await fetchRestaurants()
            if ((id === activeRestaurantId || targetRest._id === activeRestaurantId) && restaurants.length > 1) {
              const remaining = restaurants.filter(r => r._id !== targetRest._id)
              onSetActiveRestaurantId(remaining[0]._id)
            }
            showToast('error', `Branch "${targetRest.name}" successfully removed.`)
          } else {
             showToast('error', response.message || 'Error deleting restaurant');
          }
        } catch (err) {
           showToast('error', err.response?.data?.message || 'Error deleting restaurant');
        }
      }
    })
  }

  const handleQuickPasswordUpdate = async () => {
    const pwErrors = {}
    if (!editFormState?.password || String(editFormState.password).trim() === '') {
      pwErrors.password = 'New Password is required'
    }
    if (!editFormState?.confirmPassword || String(editFormState.confirmPassword).trim() === '') {
      pwErrors.confirmPassword = 'Confirm Password is required'
    } else if (editFormState.password !== editFormState.confirmPassword) {
      pwErrors.confirmPassword = 'Passwords do not match'
    }

    if (Object.keys(pwErrors).length > 0) {
      setFormErrors(prev => ({ ...prev, ...pwErrors }))
      return
    }

    setFormErrors(prev => ({ ...prev, password: '', confirmPassword: '' }))
    setIsUpdatingPassword(true)

    try {
      const targetRest = restaurants.find(r => r.id === editingRestId || r._id === editingRestId)
      if (!targetRest) {
        showToast('error', 'Restaurant not found')
        return
      }

      let restUpdated = false
      try {
        const restRes = await updateRestaurantApi(targetRest._id, { password: editFormState.password })
        if (restRes.success) restUpdated = true
      } catch (err) {
        console.warn('Direct restaurant password update note:', err)
      }

      let managerUpdated = false
      try {
        const mgrRes = await getManagers(0, 100)
        if (mgrRes.success) {
          const mgrList = mgrRes.data.results || mgrRes.data || []
          const matchingMgr = mgrList.find(m => 
            (m.email && (m.email.toLowerCase() === (editFormState.email || '').toLowerCase() || m.email.toLowerCase() === (targetRest.email || '').toLowerCase())) ||
            m.restaurantId === targetRest._id ||
            m.restaurantId === targetRest.id
          )
          if (matchingMgr) {
            const updateMgrRes = await updateManager(matchingMgr._id, { password: editFormState.password })
            if (updateMgrRes.success) managerUpdated = true
          }
        }
      } catch (err) {
        console.warn('Manager password update note:', err)
      }

      
      // Sync password across user collections
      const syncId = (editFormState.email || targetRest.email || editFormState.mobileNumber || targetRest.phoneNumber || targetRest.phone || '').trim();
      if (syncId && editFormState.password) {
        try {
          await fetch('/api/auth/reset-password', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: syncId, newPassword: editFormState.password, pin: editFormState.password })
          });
        } catch (e) {}
        try {
          await fetch('http://localhost:5055/api/auth/reset-password', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: syncId, newPassword: editFormState.password, pin: editFormState.password })
          });
        } catch (e) {}
      }

      if (restUpdated || managerUpdated) {
        showToast('success', 'Password updated successfully!')
        setEditFormState(prev => ({ ...prev, password: '', confirmPassword: '' }))
      } else {
        const fallbackRes = await updateRestaurantApi(targetRest._id, { password: editFormState.password })
        if (fallbackRes.success) {
          showToast('success', 'Password updated successfully!')
          setEditFormState(prev => ({ ...prev, password: '', confirmPassword: '' }))
        } else {
          showToast('error', fallbackRes.message || 'Failed to update password')
        }
      }
    } catch (err) {
      console.error(err)
      showToast('error', err.response?.data?.message || 'Error updating password')
    } finally {
      setIsUpdatingPassword(false)
    }
  }

  const handleUpdateRestaurantSubmit = async (e) => {
    e.preventDefault()

    const errors = {}
    const requiredFields = {
      name: 'Business Name',
      ownerName: 'Owner Name',
      mobileNumber: 'Mobile Number',
      email: 'Email',
      address: 'Registered Location Address',
      city: 'City',
      state: 'State',
      country: 'Country',
      license: 'FSSAI License Number',
      pan: 'PAN Number',
      openingTime: 'Opening Time',
      closingTime: 'Closing Time',
    }

    for (const [field, label] of Object.entries(requiredFields)) {
      if (!editFormState[field] || String(editFormState[field]).trim() === '') {
        errors[field] = `${label} is Required`
      }
    }

    // Owner Name: letters and spaces only
    if (editFormState.ownerName && !/^[a-zA-Z\s]+$/.test(editFormState.ownerName.trim())) {
      errors.ownerName = 'Owner Name must contain letters and spaces only'
    }

    // Mobile Number: 10-digit Indian number starting with 6-9, no duplicates
    const mob = (editFormState.mobileNumber || editFormState.phone || '').trim()
    if (mob && !/^[6-9]\d{9}$/.test(mob)) {
      errors.mobileNumber = 'Enter a valid 10-digit Indian mobile number (starts with 6, 7, 8, or 9)'
    } else if (mob && restaurants.some(r => r.id !== editingRestId && (r.mobileNumber === mob || r.phone === mob))) {
      errors.mobileNumber = 'Mobile number already registered by another restaurant'
    }

    // Email: mandatory @ symbol
    const emailVal = (editFormState.email || '').trim()
    if (emailVal && (!emailVal.includes('@') || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailVal))) {
      errors.email = 'Valid email address containing "@" is required'
    }

    // City, State, Country: letters and spaces only
    if (editFormState.city && !/^[a-zA-Z\s]+$/.test(editFormState.city.trim())) {
      errors.city = 'City must contain letters and spaces only'
    }
    if (editFormState.state && !/^[a-zA-Z\s]+$/.test(editFormState.state.trim())) {
      errors.state = 'State must contain letters and spaces only'
    }
    if (editFormState.country && !/^[a-zA-Z\s]+$/.test(editFormState.country.trim())) {
      errors.country = 'Country must contain letters and spaces only'
    }

    const editFssaiVal = (editFormState.license || '').trim()
    if (editFssaiVal && !/^1\d{13}$/.test(editFssaiVal)) {
      errors.license = 'FSSAI License Number must contain exactly 14 digits and start with 1.'
    }

    const editGstinVal = (editFormState.gstin || '').trim().toUpperCase()
    if (editGstinVal && !/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/.test(editGstinVal)) {
      errors.gstin = 'Invalid GSTIN. Please enter a valid 15-character GSTIN.'
    }

    const editPanVal = (editFormState.pan || '').trim().toUpperCase()
    if (editPanVal && !/^[A-Z]{5}[0-9]{4}[A-Z]$/.test(editPanVal)) {
      errors.pan = 'Invalid PAN number. Please enter a valid 10-character PAN.'
    }

    const hasPassword = editFormState.password && String(editFormState.password).trim() !== ''
    const hasConfirmPassword = editFormState.confirmPassword && String(editFormState.confirmPassword).trim() !== ''

    if (hasPassword && !hasConfirmPassword) {
      errors.confirmPassword = 'Confirm Password is required'
    } else if (!hasPassword && hasConfirmPassword) {
      errors.password = 'New Password is required'
    } else if (hasPassword && hasConfirmPassword && editFormState.password !== editFormState.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match'
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors)
      return
    }

    setFormErrors({})
    setIsSubmitting(true)
    try {
      const targetRest = restaurants.find(r => r.id === editingRestId || r._id === editingRestId)
      const payload = {
        restaurantName: editFormState.name,
        ownerName: editFormState.ownerName,
        email: editFormState.email,
        phoneNumber: editFormState.mobileNumber,
        address: editFormState.address,
        city: editFormState.city,
        state: editFormState.state,
        country: editFormState.country,
        fssaiLicense: editFormState.license,
        gstinNumber: editFormState.gstin,
        panNumber: editFormState.pan,
        openingTime: editFormState.openingTime,
        closingTime: editFormState.closingTime,
        logoUrl: editFormState.logo || '',
        logo: editFormState.logo || '',
        bannerUrl: editFormState.banner || '',
        websiteDomain: editFormState.website,
        status: editFormState.status || 'Active',
        isActive: (editFormState.status || 'Active') === 'Active',
        ...(hasPassword ? { password: editFormState.password } : {})
      }
      
      const response = await updateRestaurantApi(targetRest._id, payload);
      if (response.success) {
        if (hasPassword) {
          try {
            const mgrRes = await getManagers(0, 100);
            if (mgrRes.success) {
              const mgrList = mgrRes.data.results || mgrRes.data || [];
              const matchingMgr = mgrList.find(m =>
                (m.email && (m.email.toLowerCase() === (editFormState.email || '').toLowerCase() || m.email.toLowerCase() === (targetRest.email || '').toLowerCase())) ||
                m.restaurantId === targetRest._id ||
                m.restaurantId === targetRest.id
              );
              if (matchingMgr) {
                await updateManager(matchingMgr._id, { password: editFormState.password });
              }
            }
          } catch (mgrErr) {
            console.warn('Manager password sync warning:', mgrErr);
          }
        }
        await fetchRestaurants();
        setEditingRestId(null)
        setEditFormState(null)
        showToast('success', 'Branch updated successfully');
      } else {
        showToast('error', response.message || 'Error updating restaurant');
      }
    } catch (err) {
      showToast('error', err.response?.data?.message || 'Error updating restaurant');
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div style={{ width: '100%' }}>
      {showAddModal ? (
        <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{
            background: '#ffffff',
            border: '1px solid var(--border-color)',
            borderRadius: '16px',
            padding: '32px',
            boxShadow: 'var(--shadow-sm)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', borderBottom: '1px solid var(--border-color)', paddingBottom: '16px' }}>
              <div>
                <h3 style={{ margin: '4px 0 0 0', fontSize: '1.25rem', fontWeight: '900', color: 'var(--text-main)' }}>Register Restaurant</h3>
              </div>
              <button
                className="btn-outline"
                style={{ padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: '700' }}
                onClick={() => { setShowAddModal(false); setFormErrors({}); }}
              >
                Back
              </button>
            </div>

            <form onSubmit={handleCreateRestaurant} autoComplete="off" noValidate style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {/* Chrome AutoFill Trap */}
              <input type="text" name="chrome_fake_user" style={{ display: 'none' }} tabIndex={-1} autoComplete="off" />
              <input type="password" name="chrome_fake_pass" style={{ display: 'none' }} tabIndex={-1} autoComplete="new-password" />
              {/* Card 1: Restaurant Information */}
              <div style={{
                background: 'var(--bg-app)',
                border: '1px solid var(--border-color)',
                borderRadius: '12px',
                padding: '20px',
                display: 'flex',
                flexDirection: 'column',
                gap: '16px'
              }}>
                <h4 style={{ margin: '0 0 4px 0', fontSize: '0.85rem', fontWeight: '800', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px solid var(--border-color)', paddingBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  <Building style={{ width: '15px', height: '15px', color: '#F95E10' }} />
                  Restaurant Information
                </h4>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <ValidatedInput
                    label="Business Name"
                    type="text"
                    value={newRestState.name}
                    onChange={(e) => setNewRestState({ ...newRestState, name: e.target.value })}
                    placeholder="Enter Business Name"
                    required
                    error={formErrors.name}
                    setError={(val) => setFormErrors({ ...formErrors, name: val })}
                  />
                  <ValidatedInput
                    label="Owner Name"
                    type="text"
                    value={newRestState.ownerName}
                    onChange={(e) => {
                      const lettersOnly = e.target.value.replace(/[^a-zA-Z\s]/g, '')
                      setNewRestState({ ...newRestState, ownerName: lettersOnly })
                    }}
                    placeholder="Enter Owner Name"
                    required
                    error={formErrors.ownerName}
                    setError={(val) => setFormErrors({ ...formErrors, ownerName: val })}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <ValidatedInput
                    label="Email"
                    type="text"
                    inputMode="email"
                    value={newRestState.email}
                    onChange={(e) => setNewRestState({ ...newRestState, email: e.target.value })}
                    placeholder="Enter Email"
                    required
                    preventAutofill={true}
                    autoComplete="new-password"
                    name="new_tenant_email_no_autofill"
                    error={formErrors.email}
                    setError={(val) => setFormErrors({ ...formErrors, email: val })}
                  />
                  <ValidatedInput
                    label="Mobile Number"
                    type="text"
                    inputMode="numeric"
                    value={newRestState.mobileNumber}
                    onChange={(e) => {
                      const digitsOnly = e.target.value.replace(/[^0-9]/g, '').slice(0, 10)
                      setNewRestState({ ...newRestState, mobileNumber: digitsOnly, phone: digitsOnly })
                    }}
                    placeholder="Enter Mobile Number"
                    required
                    error={formErrors.mobileNumber}
                    setError={(val) => setFormErrors({ ...formErrors, mobileNumber: val })}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <TimePickerWithAMPM
                    label="Opening Time"
                    value={newRestState.openingTime}
                    onChange={(val) => setNewRestState({ ...newRestState, openingTime: val })}
                    required
                    error={formErrors.openingTime}
                    setError={(val) => setFormErrors({ ...formErrors, openingTime: val })}
                  />
                  <TimePickerWithAMPM
                    label="Closing Time"
                    value={newRestState.closingTime}
                    onChange={(val) => setNewRestState({ ...newRestState, closingTime: val })}
                    required
                    error={formErrors.closingTime}
                    setError={(val) => setFormErrors({ ...formErrors, closingTime: val })}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <ValidatedSelect
                    label="Initial Status"
                    value={newRestState.status}
                    onChange={(e) => setNewRestState({ ...newRestState, status: e.target.value })}
                    error={formErrors.status}
                    setError={(val) => setFormErrors({ ...formErrors, status: val })}
                  >
                    <option value="Active">Active</option>
                    <option value="Suspended">Suspended</option>
                    <option value="Inactive">Inactive</option>
                  </ValidatedSelect>
                  <ValidatedInput
                    label="Website Domain"
                    type="text"
                    value={newRestState.website}
                    onChange={(e) => setNewRestState({ ...newRestState, website: e.target.value })}
                    placeholder=" Enter Website Domain"
                    error={formErrors.website}
                    setError={(val) => setFormErrors({ ...formErrors, website: val })}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', alignItems: 'end' }}>
                  <ValidatedInput
                    label="Restaurant Logo URL"
                    type="text"
                    value={newRestState.logo}
                    onChange={(e) => setNewRestState({ ...newRestState, logo: e.target.value })}
                    placeholder="Enter Restaurant Logo URL"
                    error={formErrors.logo}
                    setError={(val) => setFormErrors({ ...formErrors, logo: val })}
                  />
                  <div style={{ paddingBottom: '2px' }}>
                    <ImageUploadButton
                      value={newRestState.logo}
                      onChange={(dataUrl) => {
                        setNewRestState(prev => ({ ...prev, logo: dataUrl }))
                        if (formErrors.logo) setFormErrors(prev => ({ ...prev, logo: '' }))
                      }}
                      onClear={() => {
                        setNewRestState(prev => ({ ...prev, logo: '' }))
                        if (formErrors.logo) setFormErrors(prev => ({ ...prev, logo: '' }))
                      }}
                      error={formErrors.logo}
                      setError={(val) => setFormErrors(prev => ({ ...prev, logo: val }))}
                    />
                  </div>
                </div>
              </div>

              {/* Card 2: Address Information */}
              <div style={{
                background: 'var(--bg-app)',
                border: '1px solid var(--border-color)',
                borderRadius: '12px',
                padding: '20px',
                display: 'flex',
                flexDirection: 'column',
                gap: '16px'
              }}>
                <h4 style={{ margin: '0 0 4px 0', fontSize: '0.85rem', fontWeight: '800', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px solid var(--border-color)', paddingBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  <MapPin style={{ width: '15px', height: '15px', color: '#F95E10' }} />
                  Address Information
                </h4>

                <ValidatedInput
                  label="Registered Location Address"
                  type="text"
                  value={newRestState.address}
                  onChange={(e) => setNewRestState({ ...newRestState, address: e.target.value })}
                  placeholder="Enter Your Address"
                  required
                  error={formErrors.address}
                  setError={(val) => setFormErrors({ ...formErrors, address: val })}
                />

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
                  <ValidatedInput
                    label="City"
                    type="text"
                    value={newRestState.city}
                    onChange={(e) => {
                      const lettersOnly = e.target.value.replace(/[^a-zA-Z\s]/g, '')
                      setNewRestState({ ...newRestState, city: lettersOnly, branch: lettersOnly })
                    }}
                    placeholder="Enter City"
                    required
                    error={formErrors.city}
                    setError={(val) => setFormErrors({ ...formErrors, city: val })}
                  />
                  <ValidatedInput
                    label="State"
                    type="text"
                    value={newRestState.state}
                    onChange={(e) => {
                      const lettersOnly = e.target.value.replace(/[^a-zA-Z\s]/g, '')
                      setNewRestState({ ...newRestState, state: lettersOnly })
                    }}
                    placeholder="Enter State"
                    required
                    error={formErrors.state}
                    setError={(val) => setFormErrors({ ...formErrors, state: val })}
                  />
                  <ValidatedInput
                    label="Country"
                    type="text"
                    value={newRestState.country}
                    onChange={(e) => {
                      const lettersOnly = e.target.value.replace(/[^a-zA-Z\s]/g, '')
                      setNewRestState({ ...newRestState, country: lettersOnly })
                    }}
                    placeholder="Enter Country"
                    required
                    error={formErrors.country}
                    setError={(val) => setFormErrors({ ...formErrors, country: val })}
                  />
                </div>
              </div>

              {/* Card 3: Compliance Information */}
              <div style={{
                background: 'var(--bg-app)',
                border: '1px solid var(--border-color)',
                borderRadius: '12px',
                padding: '20px',
                display: 'flex',
                flexDirection: 'column',
                gap: '16px'
              }}>
                <h4 style={{ margin: '0 0 4px 0', fontSize: '0.85rem', fontWeight: '800', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px solid var(--border-color)', paddingBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  <Shield style={{ width: '15px', height: '15px', color: '#F95E10' }} />
                  Compliance Information
                </h4>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
                  <ValidatedInput
                    label="FSSAI License Number"
                    type="text"
                    value={newRestState.license}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, '').slice(0, 14);
                      setNewRestState({ ...newRestState, license: val });
                      if (formErrors.license) setFormErrors({ ...formErrors, license: null });
                    }}
                    onBlur={(e) => {
                      const val = e.target.value;
                      if (val && !/^1\d{13}$/.test(val)) {
                         setFormErrors({ ...formErrors, license: 'FSSAI License Number must contain exactly 14 digits and start with 1.' });
                      }
                    }}
                    placeholder="Enter FSSAI License Number"
                    required
                    error={formErrors.license}
                    setError={(val) => setFormErrors({ ...formErrors, license: val })}
                  />
                  <ValidatedInput
                    label="GSTIN Number"
                    type="text"
                    value={newRestState.gstin}
                    onChange={(e) => {
                      let val = e.target.value.replace(/[^a-zA-Z0-9]/g, '').toUpperCase().slice(0, 15);
                      setNewRestState({ ...newRestState, gstin: val });
                      if (formErrors.gstin) setFormErrors({ ...formErrors, gstin: null });
                    }}
                    onBlur={(e) => {
                      const val = e.target.value;
                      if (val && !/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/.test(val)) {
                         setFormErrors({ ...formErrors, gstin: 'Invalid GSTIN. Please enter a valid 15-character GSTIN.' });
                      }
                    }}
                    placeholder="Enter GSTIN Number"
                    error={formErrors.gstin}
                    setError={(val) => setFormErrors({ ...formErrors, gstin: val })}
                  />
                  <ValidatedInput
                    label="PAN Number"
                    type="text"
                    value={newRestState.pan}
                    onChange={(e) => {
                      let val = e.target.value.replace(/[^a-zA-Z0-9]/g, '').toUpperCase().slice(0, 10);
                      setNewRestState({ ...newRestState, pan: val });
                      if (formErrors.pan) setFormErrors({ ...formErrors, pan: null });
                    }}
                    onBlur={(e) => {
                      const val = e.target.value;
                      if (val && !/^[A-Z]{5}[0-9]{4}[A-Z]$/.test(val)) {
                         setFormErrors({ ...formErrors, pan: 'Invalid PAN number. Please enter a valid 10-character PAN.' });
                      }
                    }}
                    placeholder="Enter PAN Number"
                    required
                    error={formErrors.pan}
                    setError={(val) => setFormErrors({ ...formErrors, pan: val })}
                  />
                </div>

              </div>

              {/* Card 4: Subscription Information */}
              <div style={{
                background: 'var(--bg-app)',
                border: '1px solid var(--border-color)',
                borderRadius: '12px',
                padding: '20px',
                display: 'flex',
                flexDirection: 'column',
                gap: '16px'
              }}>
                <h4 style={{ margin: '0 0 4px 0', fontSize: '0.85rem', fontWeight: '800', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px solid var(--border-color)', paddingBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  <CreditCard style={{ width: '15px', height: '15px', color: '#F95E10' }} />
                  Subscription Information
                </h4>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <ValidatedSelect
                    label="Choose Plan"
                    value={newRestState.planId || ''}
                    onChange={(e) => {
                      const selectedPlanId = e.target.value;
                      if (!selectedPlanId) {
                        setNewRestState(prev => ({ ...prev, planId: '', startDate: '', endDate: '', renewalDate: '' }));
                        return;
                      }
                      
                      const today = new Date();
                      const end = new Date(today);
                      if (newRestState.billingCycle === 'Annually') {
                        end.setFullYear(end.getFullYear() + 1);
                      } else {
                        end.setMonth(end.getMonth() + 1);
                      }
                      const formatDate = (date) => date.toISOString().split('T')[0];

                      setNewRestState(prev => ({ 
                        ...prev, 
                        planId: selectedPlanId,
                        startDate: formatDate(today),
                        endDate: formatDate(end),
                        renewalDate: formatDate(end)
                      }));
                    }}
                    error={formErrors.planId}
                    setError={(val) => setFormErrors({ ...formErrors, planId: val })}
                  >
                    <option value="">Select a plan</option>
                    {plans.map(p => (
                      <option key={p._id} value={p._id}>{p.planName}</option>
                    ))}
                  </ValidatedSelect>
                  
                  <ValidatedSelect
                    label="Billing Cycle"
                    value={newRestState.billingCycle}
                    onChange={(e) => {
                      const cycle = e.target.value;
                      const updates = { billingCycle: cycle };
                      if (newRestState.planId && newRestState.startDate) {
                        const start = new Date(newRestState.startDate);
                        const end = new Date(start);
                        if (cycle === 'Annually') {
                          end.setFullYear(end.getFullYear() + 1);
                        } else {
                          end.setMonth(end.getMonth() + 1);
                        }
                        const formatDate = (date) => date.toISOString().split('T')[0];
                        updates.endDate = formatDate(end);
                        updates.renewalDate = formatDate(end);
                      }
                      setNewRestState(prev => ({ ...prev, ...updates }));
                    }}
                    error={formErrors.billingCycle}
                    setError={(val) => setFormErrors({ ...formErrors, billingCycle: val })}
                  >
                    <option value="Monthly">Monthly</option>
                    <option value="Annually">Annually</option>
                  </ValidatedSelect>
                </div>

                {newRestState.planId && (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }} className="animate-fade-in">
                    <ValidatedInput
                      label="Start Date"
                      type="date"
                      value={newRestState.startDate}
                      onChange={(e) => setNewRestState({ ...newRestState, startDate: e.target.value })}
                      error={formErrors.startDate}
                      setError={(val) => setFormErrors({ ...formErrors, startDate: val })}
                    />
                    <ValidatedInput
                      label="End Date (Renewal Date)"
                      type="date"
                      value={newRestState.endDate}
                      onChange={(e) => {
                        setNewRestState({ ...newRestState, endDate: e.target.value, renewalDate: e.target.value })
                      }}
                      error={formErrors.endDate}
                      setError={(val) => setFormErrors({ ...formErrors, endDate: val })}
                    />
                  </div>
                )}
              </div>

              {/* Card 5: Password Management */}
              <div style={{
                background: 'var(--bg-app)',
                border: '1px solid var(--border-color)',
                borderRadius: '12px',
                padding: '20px',
                display: 'flex',
                flexDirection: 'column',
                gap: '16px'
              }}>
                <h4 style={{ margin: '0 0 4px 0', fontSize: '0.85rem', fontWeight: '800', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px solid var(--border-color)', paddingBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  <Lock style={{ width: '15px', height: '15px', color: '#F95E10' }} />
                  Password Management
                </h4>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <ValidatedInput
                    label="Create Password"
                    type="password"
                    value={newRestState.password || ''}
                    onChange={(e) => setNewRestState({ ...newRestState, password: e.target.value })}
                    required
                    placeholder="Enter password"
                    error={formErrors.password}
                    setError={(val) => setFormErrors({ ...formErrors, password: val })}
                  />
                  
                  <ValidatedInput
                    label="Confirm Password"
                    type="password"
                    value={newRestState.confirmPassword || ''}
                    onChange={(e) => setNewRestState({ ...newRestState, confirmPassword: e.target.value })}
                    required
                    placeholder="Re-Enter password"
                    error={formErrors.confirmPassword}
                    setError={(val) => setFormErrors({ ...formErrors, confirmPassword: val })}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '20px' }}>
                <button type="button" onClick={() => setShowAddModal(false)} style={{ padding: '10px 24px', fontWeight: '600', borderRadius: '8px', cursor: 'pointer', background: '#ffffff', color: '#64748b', border: '1px solid #cbd5e1' }}>Cancel</button>
                <button type="submit" style={{ padding: '10px 24px', fontWeight: '600', borderRadius: '8px', cursor: 'pointer', background: '#000000', color: '#ffffff', border: 'none' }}>Register</button>
              </div>
            </form>
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', alignItems: 'stretch', transition: 'all 0.3s ease' }} className="animate-fade-in">

          {/* Multi-Restaurant Switcher Header Selector Table */}
          {!viewingRestId && !editingRestId && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', background: 'var(--bg-card)', padding: '24px', borderRadius: '16px', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-sm)', minWidth: 0 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h3 style={{ margin: '4px 0 0 0', fontSize: '1.2rem', fontWeight: '900', color: 'var(--text-main)' }}>Restaurant Management</h3>
                </div>
                {canAdd && (
                  <button
                    onClick={() => {
                      setViewingRestId(null)
                      setEditingRestId(null)
                      setFormErrors({})
                      setNewRestState({
                        name: '', branch: '', license: '', gstin: '', pan: '',
                        phone: '', email: '', website: '', address: '', currency: 'INR',
                        taxRate: '', serviceCharge: '', openingTime: '', closingTime: '',
                        status: 'Active', subscriptionPlan: 'Standard',
                        createdDate: new Date().toISOString().split('T')[0],
                        password: '', confirmPassword: '', ownerName: '', mobileNumber: '',
                        city: '', state: '', country: '', logo: '', banner: '',
                        startDate: '', endDate: '', renewalDate: '', planId: '', billingCycle: 'Monthly'
                      })
                      setShowAddModal(true)
                    }}
                    className="btn-black"
                    style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer' }}
                  >
                    <Plus style={{ width: '16px', height: '16px' }} /> Register
                  </button>
                )}
              </div>
              <TableTopControls
                entriesPerPage={entriesPerPage}
                onEntriesPerPageChange={(num) => { setEntriesPerPage(num); setCurrentPage(0); }}
                searchTerm={searchTerm}
                onSearchChange={(val) => { setSearchTerm(val); setCurrentPage(0); }}
                searchPlaceholder="Search restaurants..."
              />

              <div className="dish-admin-list" style={{ overflowX: 'auto', background: '#ffffff', borderRadius: '12px', border: '1px solid var(--border-color)', position: 'relative' }}>
                <table className="menu-data-table" style={{ width: '100%', borderCollapse: 'collapse', background: '#ffffff' }}>
                  <thead>
                    <tr>
                      <th style={{ position: 'sticky', top: 0, zIndex: 10, background: 'var(--bg-app)', borderBottom: '1px solid var(--border-color)', textAlign: 'left', padding: '12px 18px', fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '800', width: '60px', whiteSpace: 'nowrap' }}>S.No</th>
                      <th style={{ position: 'sticky', top: 0, zIndex: 10, background: 'var(--bg-app)', borderBottom: '1px solid var(--border-color)', textAlign: 'left', padding: '12px 18px', fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '800', width: '120px', whiteSpace: 'nowrap' }}>Restaurant ID</th>
                      <th style={{ position: 'sticky', top: 0, zIndex: 10, background: 'var(--bg-app)', borderBottom: '1px solid var(--border-color)', textAlign: 'left', padding: '12px 18px', fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '800', width: '120px', whiteSpace: 'nowrap' }}>Restaurant Name</th>
                      <th style={{ position: 'sticky', top: 0, zIndex: 10, background: 'var(--bg-app)', borderBottom: '1px solid var(--border-color)', textAlign: 'left', padding: '12px 18px', fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '800', whiteSpace: 'nowrap' }}>Owner Name</th>
                      <th style={{ position: 'sticky', top: 0, zIndex: 10, background: 'var(--bg-app)', borderBottom: '1px solid var(--border-color)', textAlign: 'left', padding: '12px 18px', fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '800', whiteSpace: 'nowrap' }}>Email</th>
                      <th style={{ position: 'sticky', top: 0, zIndex: 10, background: 'var(--bg-app)', borderBottom: '1px solid var(--border-color)', textAlign: 'center', padding: '12px 18px', fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '800', whiteSpace: 'nowrap' }}>Subscription Plan</th>
                      <th style={{ position: 'sticky', top: 0, zIndex: 10, background: 'var(--bg-app)', borderBottom: '1px solid var(--border-color)', textAlign: 'left', padding: '12px 18px', fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '800', whiteSpace: 'nowrap' }}>Phone Number</th>
                      <th style={{ position: 'sticky', top: 0, zIndex: 10, background: 'var(--bg-app)', borderBottom: '1px solid var(--border-color)', textAlign: 'left', padding: '12px 18px', fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '800', width: '120px', whiteSpace: 'nowrap' }}>Status</th>
                      <th style={{ position: 'sticky', top: 0, zIndex: 10, background: 'var(--bg-app)', borderBottom: '1px solid var(--border-color)', textAlign: 'right', padding: '12px 60px', fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '800', width: '220px', whiteSpace: 'nowrap' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedRestaurants.map((rest, index) => {
                      const isActive = rest.id === activeRestaurantId
                      const serialNum = currentPage * entriesPerPage + index + 1

                      return (
                        <tr
                          key={rest.id}
                          onClick={() => onSetActiveRestaurantId(rest.id)}
                          style={{
                            borderBottom: '1px solid var(--border-color)',
                            background: isActive ? 'var(--primary-light)' : 'transparent',
                            transition: 'background-color 0.2s',
                            cursor: 'pointer'
                          }}
                        >
                          <td style={{ padding: '14px 18px', fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: '700', whiteSpace: 'nowrap' }}>
                            {serialNum}
                          </td>
                          <td style={{ padding: '14px 18px', fontSize: '0.8rem', color: 'var(--text-main)', fontWeight: '800', fontFamily: 'monospace', whiteSpace: 'nowrap' }}>
                            {rest.id}
                          </td>
                          <td style={{ padding: '14px 18px', whiteSpace: 'nowrap' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                              <div className="dish-admin-img" style={{ width: '38px', height: '38px', flexShrink: 0, padding: 0, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '6px', border: isActive ? '2px solid var(--primary)' : '1px solid var(--border-color)' }}>
                                <img 
                                  src={getImageUrl(rest.logo) || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=120&auto=format&fit=crop&q=60'} 
                                  alt={rest.name} 
                                  style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                                  onError={(e) => {
                                    e.currentTarget.onerror = null
                                    e.currentTarget.src = 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=120&auto=format&fit=crop&q=60'
                                  }}
                                />
                              </div>
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', overflow: 'hidden' }}>
                                <h4 style={{ fontSize: '0.85rem', fontWeight: '800', color: isActive ? 'var(--primary)' : 'var(--text-main)', margin: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
                                  {rest.name}
                                </h4>
                              </div>
                            </div>
                          </td>
                          <td style={{ padding: '14px 18px', fontSize: '0.8rem', color: 'var(--text-main)', fontWeight: '700', whiteSpace: 'nowrap' }}>
                            {rest.ownerName || '—'}
                          </td>
                          <td style={{ padding: '14px 18px', fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: '600', whiteSpace: 'nowrap' }}>
                            {rest.email || '—'}
                          </td>
                          <td style={{ padding: '14px 18px', textAlign: 'center', whiteSpace: 'nowrap' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                              <span style={{
                                fontSize: '0.7rem',
                                fontWeight: '800',
                                padding: '4px 10px',
                                borderRadius: '6px',
                                background: rest.subscriptionPlan?.toLowerCase().includes('premium') ? 'rgba(59, 130, 246, 0.1)' : rest.subscriptionPlan?.toLowerCase().includes('basic') ? 'rgba(245, 158, 11, 0.1)' : 'rgba(16, 185, 129, 0.1)',
                                color: rest.subscriptionPlan?.toLowerCase().includes('premium') ? '#3b82f6' : rest.subscriptionPlan?.toLowerCase().includes('basic') ? '#f59e0b' : '#10b981',
                                border: rest.subscriptionPlan?.toLowerCase().includes('premium') ? '1px solid rgba(59, 130, 246, 0.2)' : rest.subscriptionPlan?.toLowerCase().includes('basic') ? '1px solid rgba(245, 158, 11, 0.2)' : '1px solid rgba(16, 185, 129, 0.2)',
                                display: 'inline-block',
                                lineHeight: 1
                              }}>
                                {rest.subscriptionPlan ? rest.subscriptionPlan.replace(' Plan', '') : 'Standard'}
                              </span>
                              <span style={{
                                fontSize: '0.65rem',
                                fontWeight: '700',
                                color: rest.subscriptionStatus === 'Active' ? '#10b981' : (rest.subscriptionStatus === 'Expiring Soon' ? '#f59e0b' : '#ef4444')
                              }}>
                                {rest.subscriptionStatus || 'No Plan'}
                              </span>
                            </div>
                          </td>
                          <td style={{ padding: '14px 18px', fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: '600', whiteSpace: 'nowrap' }}>
                            {rest.phone || rest.mobileNumber || '—'}
                          </td>
                          <td style={{ padding: '14px 18px', whiteSpace: 'nowrap' }}>
                            <span style={{
                              fontSize: '0.7rem',
                              fontWeight: '800',
                              padding: '4px 10px',
                              borderRadius: '6px',
                              background: rest.status === 'Active' ? 'rgba(16, 185, 129, 0.1)' : rest.status === 'Suspended' ? 'rgba(245, 158, 11, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                              color: rest.status === 'Active' ? '#10b981' : rest.status === 'Suspended' ? '#f59e0b' : '#ef4444',
                              display: 'inline-block',
                              border: rest.status === 'Active' ? '1px solid rgba(16, 185, 129, 0.2)' : rest.status === 'Suspended' ? '1px solid rgba(245, 158, 11, 0.2)' : '1px solid rgba(239, 68, 68, 0.2)'
                            }}>
                              {rest.status || 'Active'}
                            </span>
                          </td>
                          <td style={{ padding: '14px 18px', textAlign: 'right', whiteSpace: 'nowrap' }}>
                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', alignItems: 'center' }}>

                              {/* Suspend / Inactivate / Activate action */}
                              {canEdit && (
                                <button
                                  style={{
                                    background: 'none',
                                    border: 'none',
                                    cursor: 'pointer',
                                    padding: '6px',
                                    color: (rest.status === 'Suspended' || rest.status === 'Inactive') ? '#ef4444' : '#10b981',
                                    transition: 'opacity 0.2s',
                                    display: 'flex',
                                    alignItems: 'center'
                                  }}
                                  onClick={async (e) => {
                                    e.stopPropagation();
                                    try {
                                      const isCurrentlyInactive = rest.status === 'Suspended' || rest.status === 'Inactive' || rest.isActive === false;
                                      const nextStatusStr = isCurrentlyInactive ? 'Active' : 'Inactive';
                                      const response = await updateRestaurantStatusApi(rest._id || rest.id, nextStatusStr);
                                      if (response.success) {
                                         await fetchRestaurants();
                                         showToast(nextStatusStr === 'Active' ? 'success' : 'error', `Branch "${rest.name}" status updated to ${nextStatusStr.toUpperCase()}`)
                                      }
                                    } catch (err) {
                                       showToast('error', err.response?.data?.message || 'Error updating status');
                                    }
                                  }}
                                  title={(rest.status === 'Suspended' || rest.status === 'Inactive') ? "Activate Restaurant" : "Deactivate / Inactivate Restaurant"}
                                >
                                  {(rest.status === 'Suspended' || rest.status === 'Inactive') ? (
                                    <Lock style={{ width: '16px', height: '16px' }} />
                                  ) : (
                                    <Unlock style={{ width: '16px', height: '16px' }} />
                                  )}
                                </button>
                              )}

                              {canView && (
                                <button
                                  style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '6px', color: 'var(--text-muted)', transition: 'color 0.2s', display: 'flex', alignItems: 'center' }}
                                  onClick={(e) => { e.stopPropagation(); setEditingRestId(null); setViewingRestId(rest.id); }}
                                  title="View Branch Showcase"
                                  onMouseOver={(e) => e.currentTarget.style.color = 'var(--text-main)'}
                                  onMouseOut={(e) => e.currentTarget.style.color = 'var(--text-muted)'}
                                >
                                  <Eye style={{ width: '16px', height: '16px' }} />
                                </button>
                              )}

                              {canEdit && (
                                <button
                                  style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '6px', color: 'var(--text-muted)', transition: 'color 0.2s', display: 'flex', alignItems: 'center' }}
                                  onClick={(e) => { e.stopPropagation(); handleEditClick(rest); }}
                                  title="Edit Branch Details"
                                  onMouseOver={(e) => e.currentTarget.style.color = 'var(--text-main)'}
                                  onMouseOut={(e) => e.currentTarget.style.color = 'var(--text-muted)'}
                                >
                                  <Edit2 style={{ width: '16px', height: '16px' }} />
                                </button>
                              )}

                              {canDelete && restaurants.length > 1 && (
                                <button
                                  style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '6px', color: '#ef4444', transition: 'opacity 0.2s', display: 'flex', alignItems: 'center' }}
                                  onClick={(e) => { e.stopPropagation(); handleDeleteRestaurant(rest.id); }}
                                  title="Delete Branch"
                                  onMouseOver={(e) => e.currentTarget.style.opacity = '0.7'}
                                  onMouseOut={(e) => e.currentTarget.style.opacity = '1'}
                                >
                                  <Trash2 style={{ width: '16px', height: '16px' }} />
                                </button>
                              )}
                              {!canEdit && !canView && !canDelete && (
                                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>-</span>
                              )}
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
              <TableBottomPagination
                totalEntries={filteredRestaurants.length}
                currentPage={currentPage}
                entriesPerPage={entriesPerPage}
                onPageChange={setCurrentPage}
              />
            </div>
          )}

          {viewingRestId && (() => {
            const viewedRest = restaurants.find(r => r.id === viewingRestId)
            if (!viewedRest) return null
            return (
              <div className="glass-card animate-fade-in" style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border-color)',
                borderRadius: '16px',
                padding: '32px',
                boxShadow: 'var(--shadow-sm)',
                width: '100%',
                position: 'relative'
              }}>
                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ background: 'var(--primary)', color: '#fff', padding: '4px 8px', borderRadius: '6px', fontSize: '0.65rem', fontWeight: '900' }}>
                      {viewedRest.id}
                    </span>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: '900', color: 'var(--text-main)', margin: 0 }}>
                      {viewedRest.name}
                    </h3>
                  </div>
                  <button
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '4px' }}
                    onClick={() => setViewingRestId(null)}
                  >
                    <X style={{ width: '16px', height: '16px' }} />
                  </button>
                </div>

                {/* Body */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  {/* Photo & Basic Details Banner */}
                  <div style={{ display: 'flex', gap: '16px', alignItems: 'center', background: 'var(--bg-app)', padding: '14px', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                    <div style={{ width: '70px', height: '70px', overflow: 'hidden', borderRadius: '8px', flexShrink: 0, border: '1px solid var(--border-color)' }}>
                      <img
                        src={getImageUrl(viewedRest.logo) || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=120&auto=format&fit=crop&q=60'}
                        alt={viewedRest.name}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        onError={(e) => {
                          e.currentTarget.onerror = null
                          e.currentTarget.src = 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=120&auto=format&fit=crop&q=60'
                        }}
                      />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', overflow: 'hidden' }}>
                      <span style={{ fontSize: '0.8rem', color: 'var(--primary)', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.5px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {viewedRest.city || 'Chennai'}, {viewedRest.state || 'Tamil Nadu'}, {viewedRest.country || 'India'}
                      </span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{
                          fontSize: '0.7rem',
                          padding: '3px 8px',
                          borderRadius: '4px',
                          fontWeight: '800',
                          background: viewedRest.status === 'Active' ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)',
                          color: viewedRest.status === 'Active' ? '#10b981' : '#ef4444'
                        }}>
                          STATUS: {viewedRest.status ? viewedRest.status.toUpperCase() : 'ACTIVE'}
                        </span>
                        {viewedRest.id === activeRestaurantId && (
                          <span style={{ fontSize: '0.7rem', background: 'var(--primary)', color: '#fff', padding: '3px 8px', borderRadius: '4px', fontWeight: '800' }}>
                            ACTIVE DIRECTORY ROOT
                          </span>
                        )}
                      </div>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        <MapPin style={{ width: '12px', height: '12px', display: 'inline', marginRight: '4px' }} />{viewedRest.address}
                      </span>
                    </div>
                  </div>

                  {/* Corporate Credentials */}
                  <div style={{ padding: '14px', background: 'var(--bg-app)', border: '1px solid var(--border-color)', borderRadius: '10px' }}>
                    <h4 style={{ margin: '0 0 10px 0', fontSize: '0.75rem', color: 'var(--primary)', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      Corporate Credentials & Contact
                    </h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '4px' }}>
                        <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: '600' }}>Owner Name</span>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-main)', fontWeight: '700' }}>{viewedRest.ownerName || 'Rajesh Kumar'}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '4px' }}>
                        <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: '600' }}>Mobile Number</span>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-main)', fontWeight: '700' }}>{viewedRest.mobileNumber || viewedRest.phone || 'N/A'}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '4px' }}>
                        <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: '600' }}>Email Address</span>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-main)', fontWeight: '700' }}>{viewedRest.email || 'N/A'}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '4px' }}>
                        <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: '600' }}>Business Name</span>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-main)', fontWeight: '700', maxWidth: '180px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={viewedRest.legalName}>{viewedRest.legalName}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '4px' }}>
                        <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: '600' }}>Website Domain</span>
                        <span style={{ fontSize: '0.75rem', color: 'var(--primary)', fontWeight: '700' }}>{viewedRest.website || 'N/A'}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '4px' }}>
                        <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: '600' }}>FSSAI Food License Number</span>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-main)', fontWeight: '700', fontFamily: 'monospace' }}>{viewedRest.license}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '4px' }}>
                        <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: '600' }}>Tax Identification Number (GSTIN)</span>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-main)', fontWeight: '700', fontFamily: 'monospace' }}>{viewedRest.gstin}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: '600' }}>PAN Number</span>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-main)', fontWeight: '700', fontFamily: 'monospace' }}>{viewedRest.pan || 'N/A'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Tariffs & Operating Hours */}
                  <div style={{ padding: '14px', background: 'var(--bg-app)', border: '1px solid var(--border-color)', borderRadius: '10px' }}>
                    <h4 style={{ margin: '0 0 10px 0', fontSize: '0.75rem', color: 'var(--primary)', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      Tariffs & Operating Hours
                    </h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '4px' }}>
                        <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: '600' }}>Accrued GST</span>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-main)', fontWeight: '700' }}>{viewedRest.taxRate}%</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '4px' }}>
                        <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: '600' }}>Service Fee</span>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-main)', fontWeight: '700' }}>{viewedRest.serviceCharge}%</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '4px' }}>
                        <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: '600' }}>Operating Schedule</span>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-main)', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '4px' }}><Clock style={{ width: '12px', height: '12px' }} />{viewedRest.openingTime} - {viewedRest.closingTime}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '4px' }}>
                        <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: '600' }}>Subscription Plan</span>
                        <span style={{ fontSize: '0.75rem', color: 'var(--primary)', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '4px' }}><Gem style={{ width: '12px', height: '12px' }} />{viewedRest.subscriptionPlan || 'Free Plan'}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '4px' }}>
                        <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: '600' }}>Created Date</span>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-main)', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '4px' }}><Calendar style={{ width: '12px', height: '12px' }} />{viewedRest.createdDate || '—'}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: '600' }}>Simulated Base Currency</span>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-main)', fontWeight: '700' }}>
                          {viewedRest.currency === 'INR' ? 'Indian Rupee (₹)' : viewedRest.currency === 'USD' ? 'US Dollar ($)' : 'Euro (€)'}
                        </span>
                      </div>
                      <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'flex-end' }}>
                        <button
                          className="btn-black"
                          style={{ padding: '10px 20px', borderRadius: '8px', cursor: 'pointer', fontWeight: '700' }}
                          onClick={() => setViewingRestId(null)}
                        >
                          Close Showcase
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )
          })()}

          {editingRestId && editFormState && (
            <div className="glass-card animate-fade-in" style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border-color)',
              borderRadius: '16px',
              padding: '32px',
              boxShadow: 'var(--shadow-sm)',
              width: '100%',
              position: 'relative'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', borderBottom: '1px solid var(--border-color)', paddingBottom: '16px' }}>
                <div>
                  <span style={{ fontSize: '0.7rem', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block', letterSpacing: '0.5px' }}>Corporate Directory Root Registry</span>
                  <h3 style={{ margin: '4px 0 0 0', fontSize: '1.25rem', fontWeight: '900', color: 'var(--text-main)' }}>Modify Branch Profile: {editingRestId}</h3>
                </div>
                <button
                  className="btn-outline"
                  style={{ padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: '700' }}
                  onClick={() => { setEditingRestId(null); setFormErrors({}); }}
                >
                  Back
                </button>
              </div>

              <form onSubmit={handleUpdateRestaurantSubmit} noValidate style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {/* Chrome AutoFill Trap */}
                <input type="text" name="chrome_fake_user" style={{ display: 'none' }} tabIndex={-1} autoComplete="off" />
                <input type="password" name="chrome_fake_pass" style={{ display: 'none' }} tabIndex={-1} autoComplete="new-password" />
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <ValidatedInput
                    label="Business Name"
                    type="text"
                    value={editFormState.name}
                    onChange={(e) => setEditFormState({ ...editFormState, name: e.target.value })}
                    required
                    error={formErrors.name}
                    setError={(val) => setFormErrors({ ...formErrors, name: val })}
                  />
                  <ValidatedInput
                    label="Owner Name"
                    type="text"
                    value={editFormState.ownerName}
                    onChange={(e) => {
                      const lettersOnly = e.target.value.replace(/[^a-zA-Z\s]/g, '')
                      setEditFormState({ ...editFormState, ownerName: lettersOnly })
                    }}
                    required
                    error={formErrors.ownerName}
                    setError={(val) => setFormErrors({ ...formErrors, ownerName: val })}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <ValidatedInput
                    label="Email"
                    type="text"
                    inputMode="email"
                    value={editFormState.email}
                    onChange={(e) => setEditFormState({ ...editFormState, email: e.target.value })}
                    required
                    preventAutofill={true}
                    autoComplete="new-password"
                    name="edit_tenant_email_no_autofill"
                    error={formErrors.email}
                    setError={(val) => setFormErrors({ ...formErrors, email: val })}
                  />
                  <ValidatedInput
                    label="Mobile Number"
                    type="text"
                    inputMode="numeric"
                    value={editFormState.mobileNumber}
                    onChange={(e) => {
                      const digitsOnly = e.target.value.replace(/[^0-9]/g, '').slice(0, 10)
                      setEditFormState({ ...editFormState, mobileNumber: digitsOnly, phone: digitsOnly })
                    }}
                    required
                    error={formErrors.mobileNumber}
                    setError={(val) => setFormErrors({ ...formErrors, mobileNumber: val })}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <ValidatedSelect
                    label="Status"
                    value={editFormState.status}
                    onChange={(e) => setEditFormState({ ...editFormState, status: e.target.value })}
                    error={formErrors.status}
                    setError={(val) => setFormErrors({ ...formErrors, status: val })}
                  >
                    <option value="Active">Active</option>
                    <option value="Suspended">Suspended</option>
                    <option value="Inactive">Inactive</option>
                  </ValidatedSelect>
                  <ValidatedInput
                    label="Website Domain"
                    type="text"
                    value={editFormState.website || ''}
                    onChange={(e) => setEditFormState({ ...editFormState, website: e.target.value })}
                    error={formErrors.website}
                    setError={(val) => setFormErrors({ ...formErrors, website: val })}
                  />
                </div>

                <ValidatedInput
                  label="Registered Location Address"
                  type="text"
                  value={editFormState.address}
                  onChange={(e) => setEditFormState({ ...editFormState, address: e.target.value })}
                  required
                  error={formErrors.address}
                  setError={(val) => setFormErrors({ ...formErrors, address: val })}
                />

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
                  <ValidatedInput
                    label="City"
                    type="text"
                    value={editFormState.city}
                    onChange={(e) => {
                      const lettersOnly = e.target.value.replace(/[^a-zA-Z\s]/g, '')
                      setEditFormState({ ...editFormState, city: lettersOnly, branch: lettersOnly })
                    }}
                    placeholder="e.g. Chennai"
                    required
                    error={formErrors.city}
                    setError={(val) => setFormErrors({ ...formErrors, city: val })}
                  />
                  <ValidatedInput
                    label="State"
                    type="text"
                    value={editFormState.state}
                    onChange={(e) => {
                      const lettersOnly = e.target.value.replace(/[^a-zA-Z\s]/g, '')
                      setEditFormState({ ...editFormState, state: lettersOnly })
                    }}
                    placeholder="e.g. Tamil Nadu"
                    required
                    error={formErrors.state}
                    setError={(val) => setFormErrors({ ...formErrors, state: val })}
                  />
                  <ValidatedInput
                    label="Country"
                    type="text"
                    value={editFormState.country}
                    onChange={(e) => {
                      const lettersOnly = e.target.value.replace(/[^a-zA-Z\s]/g, '')
                      setEditFormState({ ...editFormState, country: lettersOnly })
                    }}
                    placeholder="e.g. India"
                    required
                    error={formErrors.country}
                    setError={(val) => setFormErrors({ ...formErrors, country: val })}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
                  <ValidatedInput
                    label="FSSAI License Number"
                    type="text"
                    value={editFormState.license}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, '').slice(0, 14);
                      setEditFormState({ ...editFormState, license: val });
                      if (formErrors.license) setFormErrors({ ...formErrors, license: null });
                    }}
                    onBlur={(e) => {
                      const val = e.target.value;
                      if (val && !/^1\d{13}$/.test(val)) {
                         setFormErrors({ ...formErrors, license: 'FSSAI License Number must contain exactly 14 digits and start with 1.' });
                      }
                    }}
                    required
                    error={formErrors.license}
                    setError={(val) => setFormErrors({ ...formErrors, license: val })}
                  />
                  <ValidatedInput
                    label="GSTIN Number"
                    type="text"
                    value={editFormState.gstin}
                    onChange={(e) => {
                      let val = e.target.value.replace(/[^a-zA-Z0-9]/g, '').toUpperCase().slice(0, 15);
                      setEditFormState({ ...editFormState, gstin: val });
                      if (formErrors.gstin) setFormErrors({ ...formErrors, gstin: null });
                    }}
                    onBlur={(e) => {
                      const val = e.target.value;
                      if (val && !/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/.test(val)) {
                         setFormErrors({ ...formErrors, gstin: 'Invalid GSTIN. Please enter a valid 15-character GSTIN.' });
                      }
                    }}
                    error={formErrors.gstin}
                    setError={(val) => setFormErrors({ ...formErrors, gstin: val })}
                  />
                  <ValidatedInput
                    label="PAN Number"
                    type="text"
                    value={editFormState.pan}
                    onChange={(e) => {
                      let val = e.target.value.replace(/[^a-zA-Z0-9]/g, '').toUpperCase().slice(0, 10);
                      setEditFormState({ ...editFormState, pan: val });
                      if (formErrors.pan) setFormErrors({ ...formErrors, pan: null });
                    }}
                    onBlur={(e) => {
                      const val = e.target.value;
                      if (val && !/^[A-Z]{5}[0-9]{4}[A-Z]$/.test(val)) {
                         setFormErrors({ ...formErrors, pan: 'Invalid PAN number. Please enter a valid 10-character PAN.' });
                      }
                    }}
                    required
                    error={formErrors.pan}
                    setError={(val) => setFormErrors({ ...formErrors, pan: val })}
                  />
                </div>


                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <TimePickerWithAMPM
                    label="Opening Time"
                    value={editFormState.openingTime}
                    onChange={(val) => setEditFormState({ ...editFormState, openingTime: val })}
                    required
                    error={formErrors.openingTime}
                    setError={(val) => setFormErrors({ ...formErrors, openingTime: val })}
                  />
                  <TimePickerWithAMPM
                    label="Closing Time"
                    value={editFormState.closingTime}
                    onChange={(val) => setEditFormState({ ...editFormState, closingTime: val })}
                    required
                    error={formErrors.closingTime}
                    setError={(val) => setFormErrors({ ...formErrors, closingTime: val })}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', alignItems: 'end' }}>
                  <ValidatedInput
                    label="Restaurant Logo URL"
                    type="text"
                    value={editFormState.logo || ''}
                    onChange={(e) => setEditFormState({ ...editFormState, logo: e.target.value })}
                    placeholder="Enter Restaurant Logo URL"
                    error={formErrors.logo}
                    setError={(val) => setFormErrors({ ...formErrors, logo: val })}
                  />
                  <div style={{ paddingBottom: '2px' }}>
                    <ImageUploadButton
                      value={editFormState.logo || ''}
                      onChange={(dataUrl) => {
                        setEditFormState(prev => ({ ...prev, logo: dataUrl || '' }))
                        if (formErrors.logo) setFormErrors(prev => ({ ...prev, logo: '' }))
                      }}
                      onClear={() => {
                        setEditFormState(prev => ({ ...prev, logo: '' }))
                        if (formErrors.logo) setFormErrors(prev => ({ ...prev, logo: '' }))
                      }}
                      error={formErrors.logo}
                      setError={(val) => setFormErrors(prev => ({ ...prev, logo: val }))}
                    />
                  </div>
                </div>

                {/* Password Management */}
                <div style={{
                  background: 'var(--bg-app)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '12px',
                  padding: '20px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '16px',
                  marginTop: '8px'
                }}>
                  <h4 style={{ margin: '0 0 4px 0', fontSize: '0.85rem', fontWeight: '800', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px solid var(--border-color)', paddingBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    <Lock style={{ width: '15px', height: '15px', color: '#F95E10' }} />
                    Password Management
                  </h4>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <ValidatedInput
                      label="New Password"
                      type="password"
                      value={editFormState.password || ''}
                      onChange={(e) => setEditFormState({ ...editFormState, password: e.target.value })}
                      placeholder="Enter new password (leave blank to keep current)"
                      preventAutofill={true}
                      autoComplete="new-password"
                      name="edit_rest_new_password"
                      error={formErrors.password}
                      setError={(val) => setFormErrors({ ...formErrors, password: val })}
                    />
                    
                    <ValidatedInput
                      label="Confirm Password"
                      type="password"
                      value={editFormState.confirmPassword || ''}
                      onChange={(e) => setEditFormState({ ...editFormState, confirmPassword: e.target.value })}
                      placeholder="Re-enter new password"
                      preventAutofill={true}
                      autoComplete="new-password"
                      name="edit_rest_confirm_password"
                      error={formErrors.confirmPassword}
                      setError={(val) => setFormErrors({ ...formErrors, confirmPassword: val })}
                    />

                    <div style={{ gridColumn: '1 / -1', display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '12px', marginTop: '4px' }}>
                      <button
                        type="button"
                        disabled={isUpdatingPassword || !editFormState.password}
                        onClick={handleQuickPasswordUpdate}
                        style={{
                          padding: '8px 18px',
                          borderRadius: '8px',
                          background: (editFormState.password && editFormState.confirmPassword) ? '#000000' : 'var(--border-color)',
                          color: (editFormState.password && editFormState.confirmPassword) ? '#ffffff' : 'var(--text-muted)',
                          border: 'none',
                          fontSize: '0.8rem',
                          fontWeight: '700',
                          cursor: (isUpdatingPassword || !editFormState.password) ? 'not-allowed' : 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          transition: 'all 0.2s'
                        }}
                      >
                        <Lock style={{ width: '13px', height: '13px' }} />
                        {isUpdatingPassword ? 'Updating Password...' : 'Update Password'}
                      </button>
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '32px', paddingTop: '24px', borderTop: '1px solid var(--border-color)' }}>
                  <button type="button" className="btn-outline" onClick={() => setEditingRestId(null)} style={{ padding: '10px 24px', fontWeight: '600', borderRadius: '8px', cursor: 'pointer', background: '#ffffff', color: '#64748b', border: '1px solid #cbd5e1' }}>Cancel</button>
                  <button type="submit" className="btn-black" style={{ padding: '10px 24px', fontWeight: '600', borderRadius: '8px', cursor: 'pointer', background: '#000000', color: '#ffffff', border: 'none' }}>Save Changes</button>
                </div>
              </form>
            </div>
          )}

        </div>
      )}

      {/* Subscription Details Modal Overlay */}
      {viewingSubscriptionRest && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            background: 'rgba(9, 13, 22, 0.45)',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 1100,
            padding: '20px'
          }}
          onClick={() => setViewingSubscriptionRest(null)}
        >
          <div
            className="animate-fade-in"
            style={{
              background: '#ffffff',
              borderRadius: '20px',
              padding: '32px',
              width: '95%',
              maxWidth: '420px',
              boxShadow: '0 20px 60px rgba(0,0,0,0.18)',
              position: 'relative',
              textAlign: 'left'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid var(--border-color)', paddingBottom: '14px' }}>
              <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: '900', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Gem style={{ width: '18px', height: '18px', color: 'var(--primary)' }} />
                Subscription Information
              </h3>
              <button
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '4px' }}
                onClick={() => setViewingSubscriptionRest(null)}
              >
                <X style={{ width: '18px', height: '18px' }} />
              </button>
            </div>

            {/* Details Content */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '10px' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: '600' }}>Plan Name</span>
                <span style={{
                  fontSize: '0.8rem',
                  fontWeight: '800',
                  padding: '3px 8px',
                  borderRadius: '4px',
                  background: viewingSubscriptionRest.subscriptionPlan?.includes('Premium') ? 'rgba(59, 130, 246, 0.1)' : 'rgba(16, 185, 129, 0.1)',
                  color: viewingSubscriptionRest.subscriptionPlan?.includes('Premium') ? '#3b82f6' : '#10b981'
                }}>
                  {viewingSubscriptionRest.subscriptionPlan || 'Standard Plan'}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '10px' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: '600' }}>Subscription Status</span>
                <span style={{
                  fontSize: '0.8rem',
                  fontWeight: '800',
                  padding: '3px 8px',
                  borderRadius: '4px',
                  background: viewingSubscriptionRest.subscriptionStatus === 'Active' ? 'rgba(16, 185, 129, 0.1)' : viewingSubscriptionRest.subscriptionStatus === 'Expiring Soon' ? 'rgba(245, 158, 11, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                  color: viewingSubscriptionRest.subscriptionStatus === 'Active' ? '#10b981' : viewingSubscriptionRest.subscriptionStatus === 'Expiring Soon' ? '#f59e0b' : '#ef4444'
                }}>
                  {viewingSubscriptionRest.subscriptionStatus || 'Active'}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '10px' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: '600' }}>Expiry Date</span>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-main)', fontWeight: '700', fontFamily: 'monospace' }}>
                  {viewingSubscriptionRest.expiryDate || 'N/A'}
                </span>
              </div>
            </div>

            {/* Actions */}
            <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'flex-end' }}>
              <button
                className="btn-black"
                style={{ padding: '8px 18px', borderRadius: '8px', cursor: 'pointer', fontWeight: '700', fontSize: '0.8rem' }}
                onClick={() => setViewingSubscriptionRest(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal Overlay */}
      {confirmModal && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            background: 'rgba(9, 13, 22, 0.45)',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 1200,
            padding: '20px'
          }}
          onClick={() => setConfirmModal(null)}
        >
          <div
            className="animate-fade-in"
            style={{
              background: '#ffffff',
              borderRadius: '24px',
              padding: '36px 32px 28px',
              width: '90%',
              maxWidth: '420px',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              textAlign: 'center'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Top Soft Red Circular Icon Container */}
            <div style={{
              width: '60px',
              height: '60px',
              borderRadius: '50%',
              background: '#fee2e2',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '20px'
            }}>
              <Trash2 style={{ width: '28px', height: '28px', color: '#ef4444' }} />
            </div>

            {/* Title */}
            <h3 style={{ margin: '0 0 10px', fontSize: '1.25rem', fontWeight: '800', color: '#0f172a' }}>
              {confirmModal.title}
            </h3>

            {/* Subtitle Message */}
            <p style={{ margin: '0 0 28px', fontSize: '0.9rem', color: '#64748b', lineHeight: '1.5', maxWidth: '340px' }}>
              {confirmModal.message}
            </p>

            {/* Action Buttons */}
            <div style={{ display: 'flex', gap: '14px', width: '100%' }}>
              <button
                type="button"
                onClick={() => setConfirmModal(null)}
                style={{
                  flex: 1,
                  padding: '12px 20px',
                  borderRadius: '12px',
                  border: '1.5px solid #cbd5e1',
                  background: '#ffffff',
                  color: '#334155',
                  fontWeight: '700',
                  fontSize: '0.9rem',
                  cursor: 'pointer',
                  transition: 'all 0.15s'
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  if (confirmModal.onConfirm) confirmModal.onConfirm();
                  setConfirmModal(null);
                }}
                style={{
                  flex: 1,
                  padding: '12px 20px',
                  borderRadius: '12px',
                  border: 'none',
                  background: confirmModal.confirmColor || '#dc2626',
                  color: '#ffffff',
                  fontWeight: '700',
                  fontSize: '0.9rem',
                  cursor: 'pointer',
                  boxShadow: '0 4px 12px rgba(220, 38, 38, 0.25)',
                  transition: 'all 0.15s'
                }}
              >
                {confirmModal.confirmText || 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
