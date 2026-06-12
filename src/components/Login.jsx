import React, { useState, useRef, useEffect } from 'react'
import { LayoutDashboard, FolderLock, Phone, Eye, EyeOff, Utensils, ChefHat, Pizza, Coffee, Soup, AlertTriangle } from 'lucide-react'

export default function Login({ onLogin, darkMode, onToggleDarkMode, showToast }) {
  const [selectedRole, setSelectedRole] = useState('superadmin') // Default to superadmin as shown in image
  const [phone, setPhone] = useState('') // Empty by default
  const [pin, setPin] = useState(['', '', '', ''])
  const [showPin, setShowPin] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [formErrors, setFormErrors] = useState({})

  const pinRefs = [useRef(), useRef(), useRef(), useRef()]

  useEffect(() => {
    // Focus the first PIN input on mount
    if (pinRefs[0].current) {
      pinRefs[0].current.focus()
    }
  }, [])

  const handlePinChange = (index, value) => {
    // Only allow digits
    const cleanValue = value.replace(/[^0-9]/g, '')
    if (!cleanValue) {
      const newPin = [...pin]
      newPin[index] = ''
      setPin(newPin)
      return
    }

    const digit = cleanValue[cleanValue.length - 1] // Keep only the last character
    const newPin = [...pin]
    newPin[index] = digit
    setPin(newPin)

    // Auto-focus next input if not the last one
    if (index < 3 && digit) {
      pinRefs[index + 1].current.focus()
    }
    if (formErrors.pin) setFormErrors({ ...formErrors, pin: null })
  }

  const handlePinKeyDown = (index, e) => {
    // Handle backspace back-navigation
    if (e.key === 'Backspace') {
      if (!pin[index] && index > 0) {
        const newPin = [...pin]
        newPin[index - 1] = ''
        setPin(newPin)
        pinRefs[index - 1].current.focus()
      } else {
        const newPin = [...pin]
        newPin[index] = ''
        setPin(newPin)
      }
    }
  }

  const handlePinPaste = (e) => {
    e.preventDefault()
    const pastedData = e.clipboardData.getData('text').replace(/[^0-9]/g, '').slice(0, 4)
    if (pastedData) {
      const newPin = [...pin]
      for (let i = 0; i < 4; i++) {
        newPin[i] = pastedData[i] || ''
      }
      setPin(newPin)
      // Focus the last filled or first empty
      const focusIndex = Math.min(pastedData.length, 3)
      if (pinRefs[focusIndex]?.current) {
        pinRefs[focusIndex].current.focus()
      }
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()

    const errors = {}
    if (!phone || !phone.trim()) errors.phone = 'Phone Number is Required'

    const combinedPin = pin.join('')
    if (combinedPin.length < 4) errors.pin = 'Please enter a 4-digit PIN'

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors)
      return
    }
    setFormErrors({})

    if (combinedPin !== '1234') {
      showToast('error', 'Invalid security PIN. (Use simulation PIN: 1234)')
      // Reset PIN inputs and focus first
      setPin(['', '', '', ''])
      if (pinRefs[0].current) pinRefs[0].current.focus()
      return
    }

    setIsLoading(true)
    setTimeout(() => {
      setIsLoading(false)
      onLogin(selectedRole)
    }, 900)
  }

  return (
    <div className="login-container">
      {/* Dynamic inline stylesheet to handle spinner and focus styling */}
      <style dangerouslySetInnerHTML={{
        __html: `
        .login-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 100vh;
          font-family: var(--font-body);
          position: relative;
          overflow: hidden;
          padding: 20px;
        }

        .login-container::before {
          content: "";
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(rgba(0, 0, 0, 0.25), rgba(0, 0, 0, 0.35)), url('/log%20in%20.png') no-repeat center center;
          background-size: cover;
          filter: blur(4px);
          transform: scale(1.03); /* Prevent white edges from blur */
          opacity: 0.95;
          z-index: 1;
        }
        
        .bg-icon {
          display: none;
        }
        
        .login-card {
          width: 100%;
          max-width: 410px;
          background: #ffffff;
          border-radius: 24px;
          padding: 34px 28px;
          box-shadow: 0 15px 30px rgba(0, 0, 0, 0.15);
          display: flex;
          flex-direction: column;
          gap: 20px;
          position: relative;
          z-index: 2;
          animation: card-appear 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        
        @keyframes card-appear {
          from {
            opacity: 0;
            transform: translateY(12px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        
        .pin-input-field:focus {
          border-color: #d27242 !important;
          box-shadow: 0 0 0 2px rgba(210, 114, 66, 0.15) !important;
        }
        
        .phone-input-field:focus {
          box-shadow: 0 0 0 2.5px rgba(224, 231, 255, 0.8) !important;
        }
      ` }} />

      {/* Faint Background Food & Dining Icons */}
      <Utensils className="bg-icon" style={{ top: '15%', left: '8%', transform: 'rotate(-25deg)', width: '64px', height: '64px' }} />
      <Soup className="bg-icon" style={{ top: '48%', left: '6%', transform: 'rotate(15deg)', width: '56px', height: '56px' }} />
      <Coffee className="bg-icon" style={{ bottom: '15%', left: '12%', transform: 'rotate(-10deg)', width: '48px', height: '48px' }} />
      <ChefHat className="bg-icon" style={{ top: '12%', right: '10%', transform: 'rotate(20deg)', width: '60px', height: '60px' }} />
      <Pizza className="bg-icon" style={{ top: '50%', right: '7%', transform: 'rotate(-15deg)', width: '52px', height: '52px' }} />
      <Soup className="bg-icon" style={{ bottom: '18%', right: '11%', transform: 'rotate(10deg)', width: '58px', height: '58px' }} />

      {/* Main card */}
      <div className="login-card">
        {/* Brand/Logo Section */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
          <div style={{
            background: '#d37244',
            color: '#fff',
            width: '36px',
            height: '36px',
            borderRadius: '10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 3px 8px rgba(211, 114, 68, 0.25)'
          }}>
            <Utensils style={{ width: '18px', height: '18px', color: '#fff' }} />
          </div>
          <span style={{ fontSize: '1.5rem', fontWeight: '800', color: '#d37244', letterSpacing: '-0.5px' }}>Serviq</span>
        </div>

        {/* Title */}
        <div style={{ textAlign: 'center', marginTop: '-4px' }}>
          <h2 style={{ fontSize: '1.45rem', fontWeight: '800', color: '#1e293b', margin: 0 }}>Sign In</h2>
          <p style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '6px', lineHeight: '1.3' }}>
            Enter your credentials to access the dashboard
          </p>
        </div>

        <form onSubmit={handleSubmit} noValidate autoComplete="off" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Tab Selector Removed - Super Admin Only */}

          {/* Phone Number Field */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '0.82rem', fontWeight: '700', color: formErrors.phone ? '#dc2626' : '#1e293b' }}>Phone Number</label>
            <div style={{ position: 'relative' }}>
              <Phone style={{ width: '16px', height: '16px', position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: formErrors.phone ? '#dc2626' : '#db2777' }} />
              <input
                type="text"
                value={phone}
                onChange={(e) => {
                  setPhone(e.target.value)
                  if (formErrors.phone) setFormErrors({ ...formErrors, phone: null })
                }}
                className="phone-input-field"
                autoComplete="off"
                name="phone-no-autofill"
                placeholder="Enter phone number"
                style={{
                  width: '100%',
                  padding: '10px 12px 10px 38px',
                  paddingRight: formErrors.phone ? '36px' : '12px',
                  borderRadius: '10px',
                  border: formErrors.phone ? '1px solid #dc2626' : 'none',
                  background: '#eef2ff',
                  color: formErrors.phone ? '#dc2626' : '#1e293b',
                  fontSize: '0.92rem',
                  fontWeight: '600',
                  outline: 'none',
                  transition: 'box-shadow 0.2s',
                  boxSizing: 'border-box'
                }}
              />
              {formErrors.phone && <AlertTriangle style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: '#dc2626', width: '16px', height: '16px' }} />}
            </div>
            {formErrors.phone && <span style={{ color: '#dc2626', fontSize: '0.7rem', marginTop: '2px', display: 'block' }}>{formErrors.phone}</span>}
          </div>

          {/* PIN Input Grid */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '0.82rem', fontWeight: '700', color: '#1e293b' }}>PIN</label>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              {/* Grid & Forgot PIN link grouped together */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: 1 }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px' }} onPaste={handlePinPaste}>
                  {pin.map((digit, idx) => (
                    <input
                      key={idx}
                      ref={pinRefs[idx]}
                      type={showPin ? 'text' : 'password'}
                      value={digit}
                      onChange={(e) => handlePinChange(idx, e.target.value)}
                      onKeyDown={(e) => handlePinKeyDown(idx, e)}
                      maxLength={1}
                      className="pin-input-field"
                      style={{
                        width: '100%',
                        height: '46px',
                        borderRadius: '10px',
                        border: formErrors.pin ? '1.5px solid #dc2626' : '1.5px solid #d27242',
                        background: '#ffffff',
                        color: formErrors.pin ? '#dc2626' : '#1e293b',
                        fontSize: '1.3rem',
                        fontWeight: '700',
                        textAlign: 'center',
                        outline: 'none',
                        transition: 'all 0.2s'
                      }}
                    />
                  ))}
                </div>
                {formErrors.pin && <span style={{ color: '#dc2626', fontSize: '0.7rem', marginTop: '4px', display: 'block' }}>{formErrors.pin}</span>}
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '2px' }}>
                  <a
                    href="#"
                    onClick={(e) => {
                      e.preventDefault()
                      showToast('info', 'For simulation mode, the default PIN is 1234')
                    }}
                    style={{
                      color: '#d37244',
                      fontWeight: '700',
                      textDecoration: 'none',
                      fontSize: '0.78rem'
                    }}
                  >
                    Forgot PIN?
                  </a>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowPin(!showPin)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#64748b',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '6px',
                  alignSelf: 'flex-start',
                  marginTop: '8px'
                }}
              >
                {showPin ? <EyeOff style={{ width: '18px', height: '18px' }} /> : <Eye style={{ width: '18px', height: '18px' }} />}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            style={{
              width: '100%',
              background: '#c2410c',
              color: '#ffffff',
              border: 'none',
              borderRadius: '10px',
              padding: '12px',
              fontSize: '0.92rem',
              fontWeight: '700',
              cursor: 'pointer',
              boxShadow: '0 3px 10px rgba(194, 65, 12, 0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              transition: 'all 0.2s',
              marginTop: '4px'
            }}
          >
            {isLoading ? (
              <>
                <div style={{
                  width: '16px',
                  height: '16px',
                  border: '2px solid rgba(255,255,255,0.3)',
                  borderTopColor: '#fff',
                  borderRadius: '50%',
                  animation: 'spin 0.6s linear infinite'
                }}></div>
                <span>Signing In...</span>
              </>
            ) : (
              <span>Sign In</span>
            )}
          </button>
        </form>

        {/* Footer info inside card */}
        <div style={{ textAlign: 'center', fontSize: '0.72rem', color: '#94a3b8', marginTop: '2px' }}>
          Powered by Serviq
        </div>
      </div>
    </div>
  )
}
