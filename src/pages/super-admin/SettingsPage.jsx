import React, { useState, useEffect } from 'react'
import { Save, Settings, AlertTriangle } from 'lucide-react'
import { useNotification } from '../../contexts/NotificationContext'
import { getSettings, updateSettings } from '../../services/settingService'

// ─── Reusable validated input component ───
const ValidatedInput = ({ label, type = 'text', value, onChange, placeholder, required, error, setError, ...rest }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', position: 'relative' }}>
    <label style={{ fontSize: '0.75rem', fontWeight: '700', color: error ? '#ef4444' : 'var(--text-main)' }}>
      {label}{required && <span style={{ color: '#ef4444', marginLeft: '2px' }}>*</span>}
    </label>
    <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
      <input
        type={type}
        value={value}
        onChange={(e) => {
          onChange(e)
          if (error && setError) setError('')
        }}
        required={required}
        style={{
          width: '100%',
          padding: '9px 12px',
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
    </div>
    {error && <span style={{ fontSize: '0.7rem', color: '#ef4444', fontWeight: '600' }}>{error}</span>}
  </div>
)

// ─── Reusable validated select component ───
const ValidatedSelect = ({ label, value, onChange, required, error, setError, children, ...rest }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
    <label style={{ fontSize: '0.75rem', fontWeight: '700', color: error ? '#ef4444' : 'var(--text-main)' }}>
      {label}{required && <span style={{ color: '#ef4444', marginLeft: '2px' }}>*</span>}
    </label>
    <select
      value={value}
      onChange={(e) => {
        onChange(e)
        if (error && setError) setError('')
      }}
      required={required}
      style={{
        width: '100%',
        padding: '9px 12px',
        border: `1.5px solid ${error ? '#ef4444' : 'var(--border-color)'}`,
        background: error ? 'rgba(239,68,68,0.04)' : 'var(--bg-app)',
        color: 'var(--text-main)',
        borderRadius: '8px',
        fontSize: '0.82rem',
        outline: 'none',
        cursor: 'pointer',
        boxSizing: 'border-box',
        transition: 'border-color 0.15s'
      }}
      {...rest}
    >
      {children}
    </select>
    {error && <span style={{ fontSize: '0.7rem', color: '#ef4444', fontWeight: '600' }}>{error}</span>}
  </div>
)

export default function SettingsPage() {
  const { showToast } = useNotification()
  const setSystemLogs = () => { }
  const [formState, setFormState] = useState({
    name: '',
    legalName: '',
    email: '',
    phone: ''
  })
  const [formErrors, setFormErrors] = useState({})
  const [settingsId, setSettingsId] = useState(null)

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const response = await getSettings()
        const data = response?.data
        if (data) {
          setFormState({
            name: data.name || '',
            legalName: data.legalName || '',
            email: data.email || '',
            phone: data.phone || ''
          })
          setSettingsId(data._id)
        }
      } catch (error) {
        showToast('error', 'Failed to load system settings')
      }
    }
    loadSettings()
  }, [])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormState(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSaveDetails = async (e) => {
    e.preventDefault()
    
    try {
      const savedData = await updateSettings(formState)
      if (savedData && savedData._id) {
        setSettingsId(savedData._id)
      }
      showToast('success', 'Global system configurations successfully synchronized system-wide!')
    } catch (error) {
      showToast('error', 'Failed to update configurations')
    }
  }

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border-color)',
        borderRadius: '16px',
        padding: '32px',
        boxShadow: 'var(--shadow-sm)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '24px', borderBottom: '1px solid var(--border-color)', paddingBottom: '16px' }}>
          <div style={{ background: 'var(--primary-light)', color: 'var(--primary)', width: '36px', height: '36px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyRef: 'center', justifyContent: 'center' }}>
            <Settings style={{ width: '20px', height: '20px' }} />
          </div>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: '900', color: 'var(--text-main)' }}>System Settings</h3>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: '600' }}>Configure default system rules, tax percentages, brand information, and operation hours.</span>
          </div>
        </div>

        <form onSubmit={handleSaveDetails} noValidate style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Brand Details */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <ValidatedInput
              label="Brand Name"
              name="name"
              value={formState.name || ''}
              onChange={handleInputChange}
              placeholder="e.g. Serviq Super"
              required
            />
            <ValidatedInput
              label="Legal Company Name"
              name="legalName"
              value={formState.legalName || ''}
              onChange={handleInputChange}
              placeholder="e.g. Serviq Solutions Pvt Ltd"
              required
            />
          </div>

          {/* Contact Details */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <ValidatedInput
              label="Support Email Address"
              name="email"
              type="email"
              value={formState.email || ''}
              onChange={handleInputChange}
              placeholder="support@serviq.com"
              required
            />
            <ValidatedInput
              label="Support Hotline Mobile"
              name="phone"
              value={formState.phone || ''}
              onChange={handleInputChange}
              placeholder="e.g. +91 98765 43210"
              required
            />
          </div>



          <div style={{ gridColumn: '1 / -1', display: 'flex', justifyContent: 'flex-end', marginTop: '14px', borderTop: '1px solid var(--border-color)', paddingTop: '18px' }}>
            <button type="submit" className="btn-black" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Save style={{ width: '16px', height: '16px' }} /> Save Configurations
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
