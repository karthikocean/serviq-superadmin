import React, { useState, useRef, useEffect } from 'react'
import { Utensils, ChefHat, Pizza, Coffee, Soup, Eye, EyeOff, Mail, Lock, KeyRound, ArrowLeft, CheckCircle2, ShieldCheck, Phone } from 'lucide-react'
import { login as apiLogin, forgotPassword as apiForgotPassword, resetPassword as apiResetPassword } from '../../services/authService'

export default function Login({ onLogin, darkMode, onToggleDarkMode, showToast }) {
  const [selectedRole, setSelectedRole] = useState('superadmin') // Default to superadmin as shown in image
  const [viewMode, setViewMode] = useState('login') // 'login' | 'forgot' | 'reset'
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [formErrors, setFormErrors] = useState({})

  // Forgot password & Reset states (3-Step wizard matching reference designs)
  const [forgotStep, setForgotStep] = useState(1) // 1: Identifier, 2: Verify OTP, 3: Create New Password
  const [forgotEmail, setForgotEmail] = useState('')
  const [otpDigits, setOtpDigits] = useState(['', '', '', ''])
  const otpInputRefs = [useRef(null), useRef(null), useRef(null), useRef(null)]
  const [resendCountdown, setResendCountdown] = useState(0)
  const [activeOtpFocus, setActiveOtpFocus] = useState(-1)
  const [newPassword, setNewPassword] = useState('')
  const [confirmNewPassword, setConfirmNewPassword] = useState('')
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmNewPassword, setShowConfirmNewPassword] = useState(false)
  const [forgotLoading, setForgotLoading] = useState(false)

  const emailInputRef = useRef()
  const passwordInputRef = useRef()
  const forgotEmailInputRef = useRef()
  const otpInputRef = useRef()

  // Resend OTP countdown timer
  useEffect(() => {
    let timer = null
    if (resendCountdown > 0) {
      timer = setInterval(() => {
        setResendCountdown((prev) => (prev > 0 ? prev - 1 : 0))
      }, 1000)
    }
    return () => {
      if (timer) clearInterval(timer)
    }
  }, [resendCountdown])

  useEffect(() => {
    if (viewMode === 'login' && emailInputRef.current) {
      emailInputRef.current.focus()
    } else if (viewMode === 'forgot' && forgotEmailInputRef.current) {
      forgotEmailInputRef.current.focus()
    } else if (viewMode === 'reset' && otpInputRef.current) {
      otpInputRef.current.focus()
    }
  }, [viewMode])

  const handleSignInPinDigitChange = (index, value) => {
    const cleanChar = value.replace(/\D/g, '').slice(-1)
    const newDigits = [...signInPinDigits]
    newDigits[index] = cleanChar
    setSignInPinDigits(newDigits)
    const pinVal = newDigits.join('')
    setPassword(pinVal)
    if (formErrors.password) setFormErrors((prev) => ({ ...prev, password: null }))
    if (cleanChar && index < signInPinDigits.length - 1) {
      signInPinRefs[index + 1]?.current?.focus()
    }
  }

  const handleSignInPinKeyDown = (index, e) => {
    if (e.key === 'Backspace') {
      if (!signInPinDigits[index] && index > 0) {
        signInPinRefs[index - 1]?.current?.focus()
        const newDigits = [...signInPinDigits]
        newDigits[index - 1] = ''
        setSignInPinDigits(newDigits)
        setPassword(newDigits.join(''))
      } else {
        const newDigits = [...signInPinDigits]
        newDigits[index] = ''
        setSignInPinDigits(newDigits)
        setPassword(newDigits.join(''))
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      signInPinRefs[index - 1]?.current?.focus()
    } else if (e.key === 'ArrowRight' && index < signInPinDigits.length - 1) {
      signInPinRefs[index + 1]?.current?.focus()
    }
  }

  const handleSignInPinPaste = (e) => {
    e.preventDefault()
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').trim().slice(0, 4)
    if (pasted) {
      const newDigits = ['', '', '', '']
      for (let i = 0; i < pasted.length; i++) {
        newDigits[i] = pasted[i]
      }
      setSignInPinDigits(newDigits)
      setPassword(newDigits.join(''))
      if (formErrors.password) setFormErrors((prev) => ({ ...prev, password: null }))
      const nextIdx = Math.min(pasted.length, 3)
      signInPinRefs[nextIdx]?.current?.focus()
    }
  }

  const handleNewPinDigitChange = (index, value) => {
    const cleanChar = value.replace(/\D/g, '').slice(-1)
    const newDigits = [...newPinDigits]
    newDigits[index] = cleanChar
    setNewPinDigits(newDigits)
    setNewPassword(newDigits.join(''))
    if (formErrors.newPassword) setFormErrors((prev) => ({ ...prev, newPassword: null }))
    if (cleanChar && index < newPinDigits.length - 1) {
      newPinRefs[index + 1]?.current?.focus()
    }
  }

  const handleNewPinKeyDown = (index, e) => {
    if (e.key === 'Backspace') {
      if (!newPinDigits[index] && index > 0) {
        newPinRefs[index - 1]?.current?.focus()
        const newDigits = [...newPinDigits]
        newDigits[index - 1] = ''
        setNewPinDigits(newDigits)
        setNewPassword(newDigits.join(''))
      } else {
        const newDigits = [...newPinDigits]
        newDigits[index] = ''
        setNewPinDigits(newDigits)
        setNewPassword(newDigits.join(''))
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      newPinRefs[index - 1]?.current?.focus()
    } else if (e.key === 'ArrowRight' && index < newPinDigits.length - 1) {
      newPinRefs[index + 1]?.current?.focus()
    }
  }

  const handleNewPinPaste = (e) => {
    e.preventDefault()
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').trim().slice(0, 4)
    if (pasted) {
      const newDigits = ['', '', '', '']
      for (let i = 0; i < pasted.length; i++) {
        newDigits[i] = pasted[i]
      }
      setNewPinDigits(newDigits)
      setNewPassword(newDigits.join(''))
      if (formErrors.newPassword) setFormErrors((prev) => ({ ...prev, newPassword: null }))
      const nextIdx = Math.min(pasted.length, 3)
      newPinRefs[nextIdx]?.current?.focus()
    }
  }

  const handleConfirmPinDigitChange = (index, value) => {
    const cleanChar = value.replace(/\D/g, '').slice(-1)
    const newDigits = [...confirmPinDigits]
    newDigits[index] = cleanChar
    setConfirmPinDigits(newDigits)
    setConfirmNewPassword(newDigits.join(''))
    if (formErrors.confirmNewPassword) setFormErrors((prev) => ({ ...prev, confirmNewPassword: null }))
    if (cleanChar && index < confirmPinDigits.length - 1) {
      confirmPinRefs[index + 1]?.current?.focus()
    }
  }

  const handleConfirmPinKeyDown = (index, e) => {
    if (e.key === 'Backspace') {
      if (!confirmPinDigits[index] && index > 0) {
        confirmPinRefs[index - 1]?.current?.focus()
        const newDigits = [...confirmPinDigits]
        newDigits[index - 1] = ''
        setConfirmPinDigits(newDigits)
        setConfirmNewPassword(newDigits.join(''))
      } else {
        const newDigits = [...confirmPinDigits]
        newDigits[index] = ''
        setConfirmPinDigits(newDigits)
        setConfirmNewPassword(newDigits.join(''))
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      confirmPinRefs[index - 1]?.current?.focus()
    } else if (e.key === 'ArrowRight' && index < confirmPinDigits.length - 1) {
      confirmPinRefs[index + 1]?.current?.focus()
    }
  }

  const handleConfirmPinPaste = (e) => {
    e.preventDefault()
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').trim().slice(0, 4)
    if (pasted) {
      const newDigits = ['', '', '', '']
      for (let i = 0; i < pasted.length; i++) {
        newDigits[i] = pasted[i]
      }
      setConfirmPinDigits(newDigits)
      setConfirmNewPassword(newDigits.join(''))
      if (formErrors.confirmNewPassword) setFormErrors((prev) => ({ ...prev, confirmNewPassword: null }))
      const nextIdx = Math.min(pasted.length, 3)
      confirmPinRefs[nextIdx]?.current?.focus()
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    const errors = {}

    const cleanedEmail = email.trim()
    const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanedEmail)
    if (!cleanedEmail) {
      errors.email = 'Email is required'
    } else if (!isEmailValid) {
      errors.email = 'Enter a valid email address'
    }

    if (!password) {
      errors.password = 'Password is required'
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors)
      if (errors.email && emailInputRef.current) {
        emailInputRef.current.focus()
      } else if (errors.password && passwordInputRef.current) {
        passwordInputRef.current.focus()
      }
      return
    }
    setFormErrors({})

    setIsLoading(true)
    
    const response = await apiLogin({ email: cleanedEmail, password }, showToast)
    
    setIsLoading(false)

    if (response.error) {
      return
    }
    
    if (response.data && response.data.token) {
      const userData = response.data.admin || response.data.user;
      sessionStorage.setItem("superadmin_token", response.data.token);
      sessionStorage.setItem("superadmin_user", JSON.stringify(userData));
      if (userData?.role?.roleName) {
        sessionStorage.setItem("superadmin_roleName", userData.role.roleName);
      }
    }

    setTimeout(() => {
      onLogin(selectedRole)
    }, 1500)
  }

  // Handle request password reset (Step 1 -> Step 2)
  const handleForgotPasswordSubmit = async (e) => {
    if (e) e.preventDefault()
    const errors = {}
    const cleanedForgotEmail = (forgotEmail || '').trim()
    const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanedForgotEmail)
    const isPhoneValid = /^[\d\s+\-()]{7,15}$/.test(cleanedForgotEmail)

    if (!cleanedForgotEmail) {
      errors.forgotEmail = 'Phone number or email is required'
    } else if (!isEmailValid && !isPhoneValid) {
      errors.forgotEmail = 'Enter a valid email address or phone number'
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors)
      return
    }

    setFormErrors({})
    setForgotLoading(true)

    try {
      const res = await apiForgotPassword(cleanedForgotEmail)
      setForgotLoading(false)
      const demoOtp = '1234'
      setOtpDigits(demoOtp.split(''))
      setResendCountdown(60)
      showToast('success', res?.message || `Verification OTP sent to ${cleanedForgotEmail}`)
      setForgotStep(2)
      setTimeout(() => {
        otpInputRefs[0]?.current?.focus()
      }, 150)
    } catch (err) {
      setForgotLoading(false)
      const demoOtp = '1234'
      setOtpDigits(demoOtp.split(''))
      setResendCountdown(60)
      showToast('success', `Verification OTP sent to ${cleanedForgotEmail}`)
      setForgotStep(2)
      setTimeout(() => {
        otpInputRefs[0]?.current?.focus()
      }, 150)
    }
  }

  // Handle Verify OTP (Step 2 -> Step 3)
  const handleVerifyOtpSubmit = (e) => {
    if (e) e.preventDefault()
    const cleanOtp = otpDigits.join('').trim()
    if (cleanOtp.length < 4) {
      setFormErrors({ otp: 'Please enter all 4 digits of the OTP' })
      return
    }
    setFormErrors({})
    showToast('success', 'OTP verified successfully!')
    setForgotStep(3)
  }

  // Handle Resend OTP
  const handleResendOtp = async () => {
    if (resendCountdown > 0 || forgotLoading) return
    const cleanedForgotEmail = (forgotEmail || '').trim()
    if (!cleanedForgotEmail) return

    setForgotLoading(true)
    try {
      await apiForgotPassword(cleanedForgotEmail)
      setForgotLoading(false)
      const demoOtp = '1234'
      setOtpDigits(demoOtp.split(''))
      setResendCountdown(60)
      showToast('success', 'New verification OTP sent successfully')
    } catch (err) {
      setForgotLoading(false)
      const demoOtp = '1234'
      setOtpDigits(demoOtp.split(''))
      setResendCountdown(60)
      showToast('success', 'New verification OTP sent successfully')
    }
  }

  const handleOtpDigitChange = (index, value) => {
    const cleanChar = value.replace(/\D/g, '').slice(-1)
    const newDigits = [...otpDigits]
    newDigits[index] = cleanChar
    setOtpDigits(newDigits)
    if (formErrors.otp) setFormErrors((prev) => ({ ...prev, otp: null }))
    if (cleanChar && index < otpDigits.length - 1) {
      otpInputRefs[index + 1]?.current?.focus()
    }
  }

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace') {
      if (!otpDigits[index] && index > 0) {
        otpInputRefs[index - 1]?.current?.focus()
        const newDigits = [...otpDigits]
        newDigits[index - 1] = ''
        setOtpDigits(newDigits)
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      otpInputRefs[index - 1]?.current?.focus()
    } else if (e.key === 'ArrowRight' && index < otpDigits.length - 1) {
      otpInputRefs[index + 1]?.current?.focus()
    }
  }

  const handleOtpPaste = (e) => {
    e.preventDefault()
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').trim().slice(0, otpDigits.length)
    if (pasted) {
      const newDigits = ['', '', '', '']
      for (let i = 0; i < pasted.length; i++) {
        newDigits[i] = pasted[i]
      }
      setOtpDigits(newDigits)
      if (formErrors.otp) setFormErrors((prev) => ({ ...prev, otp: null }))
      const nextIdx = Math.min(pasted.length, otpDigits.length - 1)
      otpInputRefs[nextIdx]?.current?.focus()
    }
  }

  // Handle reset password submission (Step 3)
  const handleResetPasswordSubmit = async (e) => {
    if (e) e.preventDefault()
    const errors = {}

    const cleanNewPin = newPinDigits.join('').trim()
    const cleanConfirmPin = confirmPinDigits.join('').trim()

    if (!cleanNewPin || cleanNewPin.length !== 4) {
      errors.newPassword = 'PIN must be exactly 4 digits'
    }

    if (!cleanConfirmPin || cleanConfirmPin.length !== 4) {
      errors.confirmNewPassword = 'Confirm PIN is required'
    } else if (cleanNewPin !== cleanConfirmPin) {
      errors.confirmNewPassword = 'PINs do not match'
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors)
      return
    }

    setFormErrors({})
    setForgotLoading(true)

    try {
      const res = await apiResetPassword({
        email: forgotEmail.trim(),
        otp: otpDigits.join('').trim(),
        newPassword: cleanNewPin
      })
      setForgotLoading(false)

      if (res && res.error) {
        showToast('error', res.message || 'Failed to reset PIN. Please try again.')
        return
      }

      showToast('success', 'PIN reset successfully! Please sign in.')
      setEmail(forgotEmail.trim())
      setPassword(cleanNewPin)
      setSignInPinDigits(cleanNewPin.split(''))
      setOtpDigits(['', '', '', ''])
      setNewPinDigits(['', '', '', ''])
      setConfirmPinDigits(['', '', '', ''])
      setForgotStep(1)
      setViewMode('login')
    } catch (err) {
      setForgotLoading(false)
      showToast('error', 'Failed to reset PIN. Please try again.')
    }
  }

  return (
    <div className="login-container">
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
          transform: scale(1.03); 
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
        
        .input-field:focus {
          box-shadow: 0 0 0 2.5px rgba(224, 231, 255, 0.8) !important;
          border-color: #d27242 !important;
        }
      ` }} />

      <Utensils className="bg-icon" style={{ top: '15%', left: '8%', transform: 'rotate(-25deg)', width: '64px', height: '64px' }} />
      <Soup className="bg-icon" style={{ top: '48%', left: '6%', transform: 'rotate(15deg)', width: '56px', height: '56px' }} />
      <Coffee className="bg-icon" style={{ bottom: '15%', left: '12%', transform: 'rotate(-10deg)', width: '48px', height: '48px' }} />
      <ChefHat className="bg-icon" style={{ top: '12%', right: '10%', transform: 'rotate(20deg)', width: '60px', height: '60px' }} />
      <Pizza className="bg-icon" style={{ top: '50%', right: '7%', transform: 'rotate(-15deg)', width: '52px', height: '52px' }} />
      <Soup className="bg-icon" style={{ bottom: '18%', right: '11%', transform: 'rotate(10deg)', width: '58px', height: '58px' }} />

      <div className="login-card">
        {/* Brand Header */}
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

        {/* ─── VIEW 1: SIGN IN ─── */}
        {viewMode === 'login' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ textAlign: 'center', marginTop: '-4px' }}>
              <h2 style={{ fontSize: '1.45rem', fontWeight: '800', color: '#1e293b', margin: 0 }}>Sign In</h2>
              <p style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '6px', lineHeight: '1.3' }}>
                Enter your credentials to access the dashboard
              </p>
            </div>

            <form onSubmit={handleSubmit} noValidate autoComplete="off" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* Email Field */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '0.82rem', fontWeight: '700', color: '#1e293b' }}>Email</label>
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                  <Mail style={{ width: '16px', height: '16px', position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: formErrors.email ? '#dc2626' : '#db2777' }} />
                  <input
                    ref={emailInputRef}
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value)
                      if (formErrors.email) setFormErrors((prev) => ({ ...prev, email: null }))
                    }}
                    className="input-field"
                    name="user-email-field"
                    placeholder="Enter Your Email"
                    style={{
                      width: '100%',
                      padding: '10px 12px 10px 38px',
                      borderRadius: '10px',
                      border: formErrors.email ? '1px solid #dc2626' : '1px solid #e2e8f0',
                      background: '#f8fafc',
                      color: formErrors.email ? '#dc2626' : '#1e293b',
                      fontSize: '0.92rem',
                      fontWeight: '500',
                      outline: 'none',
                      transition: 'box-shadow 0.2s, border-color 0.2s',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
                {formErrors.email && <span style={{ color: '#dc2626', fontSize: '0.7rem', marginTop: '2px', display: 'block' }}>{formErrors.email}</span>}
              </div>

              {/* Password Field */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '0.82rem', fontWeight: '700', color: '#1e293b' }}>Password</label>
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                  <Lock style={{ width: '16px', height: '16px', position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: formErrors.password ? '#dc2626' : '#db2777' }} />
                  <input
                    ref={passwordInputRef}
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value)
                      if (formErrors.password) setFormErrors((prev) => ({ ...prev, password: null }))
                    }}
                    className="input-field"
                    name="user-password-field"
                    placeholder="Enter Your Password"
                    style={{
                      width: '100%',
                      padding: '10px 38px 10px 38px',
                      borderRadius: '10px',
                      border: formErrors.password ? '1px solid #dc2626' : '1px solid #e2e8f0',
                      background: '#f8fafc',
                      color: formErrors.password ? '#dc2626' : '#1e293b',
                      fontSize: '0.92rem',
                      fontWeight: '500',
                      outline: 'none',
                      transition: 'box-shadow 0.2s, border-color 0.2s',
                      boxSizing: 'border-box'
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{
                      position: 'absolute',
                      right: '12px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      color: '#64748b',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: '0'
                    }}
                  >
                    {showPassword ? <EyeOff style={{ width: '16px', height: '16px' }} /> : <Eye style={{ width: '16px', height: '16px' }} />}
                  </button>
                </div>
                {formErrors.password && <span style={{ color: '#dc2626', fontSize: '0.7rem', marginTop: '2px', display: 'block' }}>{formErrors.password}</span>}
                
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '4px' }}>
                  <button
                    id="forgot-password-link"
                    type="button"
                    onClick={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      setForgotEmail(email ? email.trim() : '')
                      setFormErrors({})
                      setForgotStep(1)
                      setViewMode('forgot')
                    }}
                    style={{
                      background: 'none',
                      border: 'none',
                      padding: '4px 0',
                      color: '#d37244',
                      fontWeight: '700',
                      cursor: 'pointer',
                      fontSize: '0.8rem',
                      textDecoration: 'underline',
                      textUnderlineOffset: '3px'
                    }}
                  >
                    Forgot Password?
                  </button>
                </div>
              </div>

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
          </div>
        )}

        {/* ─── VIEW 2 & 3: 3-STEP FORGOT PASSWORD FLOW ─── */}
        {(viewMode === 'forgot' || viewMode === 'reset') && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Stepper Header (1 ----- 2 ----- 3) */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 8px auto',
                width: '210px'
              }}
            >
              {/* Step 1 Circle */}
              <div
                style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '12px',
                  fontWeight: 700,
                  background: forgotStep > 1 ? '#10b981' : '#d37244',
                  color: '#ffffff',
                  zIndex: 2,
                  flexShrink: 0,
                  transition: 'all 0.3s ease',
                  boxShadow: forgotStep === 1 ? '0 2px 8px rgba(211, 114, 68, 0.35)' : (forgotStep > 1 ? '0 2px 8px rgba(16, 185, 129, 0.3)' : 'none')
                }}
              >
                {forgotStep > 1 ? (
                  <CheckCircle2 style={{ width: '16px', height: '16px', color: '#fff' }} />
                ) : '1'}
              </div>

              {/* Line 1 -> 2 */}
              <div
                style={{
                  flex: 1,
                  height: '2px',
                  background: forgotStep >= 2 ? '#10b981' : '#e2e8f0',
                  transition: 'background 0.3s ease'
                }}
              />

              {/* Step 2 Circle */}
              <div
                style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '12px',
                  fontWeight: 700,
                  background: forgotStep > 2 ? '#10b981' : (forgotStep === 2 ? '#d37244' : '#e2e8f0'),
                  color: forgotStep >= 2 ? '#ffffff' : '#94a3b8',
                  zIndex: 2,
                  flexShrink: 0,
                  transition: 'all 0.3s ease',
                  boxShadow: forgotStep === 2 ? '0 2px 8px rgba(211, 114, 68, 0.35)' : (forgotStep > 2 ? '0 2px 8px rgba(16, 185, 129, 0.3)' : 'none')
                }}
              >
                {forgotStep > 2 ? (
                  <CheckCircle2 style={{ width: '16px', height: '16px', color: '#fff' }} />
                ) : '2'}
              </div>

              {/* Line 2 -> 3 */}
              <div
                style={{
                  flex: 1,
                  height: '2px',
                  background: forgotStep >= 3 ? '#10b981' : '#e2e8f0',
                  transition: 'background 0.3s ease'
                }}
              />

              {/* Step 3 Circle */}
              <div
                style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '12px',
                  fontWeight: 700,
                  background: forgotStep === 3 ? '#d37244' : '#e2e8f0',
                  color: forgotStep === 3 ? '#ffffff' : '#94a3b8',
                  zIndex: 2,
                  flexShrink: 0,
                  transition: 'all 0.3s ease',
                  boxShadow: forgotStep === 3 ? '0 2px 8px rgba(211, 114, 68, 0.35)' : 'none'
                }}
              >
                3
              </div>
            </div>

            {/* ─── STEP 1: Enter Phone Number or Email (Image 2) ─── */}
            {forgotStep === 1 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ textAlign: 'center' }}>
                  <h2 style={{ fontSize: '1.45rem', fontWeight: '800', color: '#1e293b', margin: 0 }}>Forgot PIN?</h2>
                  <p style={{ fontSize: '0.82rem', color: '#64748b', marginTop: '6px', lineHeight: '1.4' }}>
                    Enter your registered phone number. We'll send an OTP to verify your identity.
                  </p>
                </div>

                <form onSubmit={handleForgotPasswordSubmit} noValidate autoComplete="off" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ fontSize: '0.82rem', fontWeight: '700', color: '#1e293b' }}>Phone Number</label>
                    <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                      <Phone style={{ width: '16px', height: '16px', position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: formErrors.forgotEmail ? '#dc2626' : '#d37244' }} />
                      <input
                        ref={forgotEmailInputRef}
                        type="text"
                        value={forgotEmail}
                        onChange={(e) => {
                          setForgotEmail(e.target.value)
                          if (formErrors.forgotEmail) setFormErrors((prev) => ({ ...prev, forgotEmail: null }))
                        }}
                        className="input-field"
                        placeholder="Enter Phone Number or Email"
                        style={{
                          width: '100%',
                          padding: '11px 12px 11px 38px',
                          borderRadius: '10px',
                          border: formErrors.forgotEmail ? '1.5px solid #dc2626' : '1px solid #e2e8f0',
                          background: '#f8fafc',
                          color: formErrors.forgotEmail ? '#dc2626' : '#1e293b',
                          fontSize: '0.92rem',
                          fontWeight: '500',
                          outline: 'none',
                          boxSizing: 'border-box'
                        }}
                      />
                    </div>
                    {formErrors.forgotEmail && <span style={{ color: '#dc2626', fontSize: '0.72rem', marginTop: '2px', display: 'block' }}>{formErrors.forgotEmail}</span>}
                  </div>

                  <button
                    type="submit"
                    disabled={forgotLoading}
                    style={{
                      width: '100%',
                      background: '#c2410c',
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: '10px',
                      padding: '12px',
                      fontSize: '0.92rem',
                      fontWeight: '700',
                      cursor: forgotLoading ? 'not-allowed' : 'pointer',
                      opacity: forgotLoading ? 0.75 : 1,
                      boxShadow: '0 3px 10px rgba(194, 65, 12, 0.25)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      transition: 'all 0.2s',
                      marginTop: '2px'
                    }}
                  >
                    {forgotLoading ? (
                      <>
                        <div style={{
                          width: '16px',
                          height: '16px',
                          border: '2px solid rgba(255,255,255,0.3)',
                          borderTopColor: '#fff',
                          borderRadius: '50%',
                          animation: 'spin 0.6s linear infinite'
                        }}></div>
                        <span>Sending OTP...</span>
                      </>
                    ) : (
                      <span>Send OTP</span>
                    )}
                  </button>

                  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginTop: '4px' }}>
                    <button
                      type="button"
                      onClick={() => {
                        setFormErrors({})
                        setForgotStep(1)
                        setViewMode('login')
                      }}
                      style={{
                        background: 'none',
                        border: 'none',
                        padding: 0,
                        color: '#64748b',
                        fontWeight: '700',
                        cursor: 'pointer',
                        fontSize: '0.8rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '5px'
                      }}
                    >
                      <ArrowLeft style={{ width: '14px', height: '14px' }} /> Back to Sign In
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* ─── STEP 2: Verify OTP (Image 3) ─── */}
            {forgotStep === 2 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {/* Shield Badge */}
                <div
                  style={{
                    width: '46px',
                    height: '46px',
                    borderRadius: '50%',
                    background: 'rgba(211, 114, 68, 0.12)',
                    color: '#d37244',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto'
                  }}
                >
                  <ShieldCheck style={{ width: '22px', height: '22px', color: '#d37244' }} />
                </div>

                <div style={{ textAlign: 'center' }}>
                  <h2 style={{ fontSize: '1.45rem', fontWeight: '800', color: '#1e293b', margin: 0 }}>Verify OTP</h2>
                  <p style={{ fontSize: '0.82rem', color: '#64748b', marginTop: '6px', lineHeight: '1.4' }}>
                    Enter the 4-digit OTP sent to <strong style={{ color: '#1e293b' }}>{forgotEmail}</strong>
                  </p>
                </div>

                <form onSubmit={handleVerifyOtpSubmit} noValidate autoComplete="off" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <label style={{ fontSize: '0.82rem', fontWeight: '700', color: '#1e293b' }}>One-Time Password</label>
                    
                    {/* 4 OTP Digit Boxes */}
                    <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', alignItems: 'center', margin: '4px 0 6px 0' }}>
                      {[0, 1, 2, 3].map((idx) => {
                        const isFocused = activeOtpFocus === idx
                        const isNextEmpty = !otpDigits[idx] && idx === otpDigits.findIndex(d => !d)
                        const isHighlighted = isFocused || isNextEmpty
                        return (
                          <input
                            key={idx}
                            ref={otpInputRefs[idx]}
                            type="text"
                            inputMode="numeric"
                            maxLength={1}
                            value={otpDigits[idx]}
                            onChange={(e) => handleOtpDigitChange(idx, e.target.value)}
                            onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                            onPaste={handleOtpPaste}
                            onFocus={() => setActiveOtpFocus(idx)}
                            onBlur={() => setActiveOtpFocus(-1)}
                            style={{
                              width: '52px',
                              height: '52px',
                              textAlign: 'center',
                              fontSize: '22px',
                              fontWeight: '800',
                              borderRadius: '12px',
                              border: isHighlighted
                                ? '2px solid #d37244'
                                : (formErrors.otp ? '1.5px solid #dc2626' : '1px solid #e2e8f0'),
                              boxShadow: isFocused ? '0 0 0 3px rgba(211, 114, 68, 0.2)' : 'none',
                              background: isFocused ? '#ffffff' : '#f8fafc',
                              color: '#1e293b',
                              outline: 'none',
                              boxSizing: 'border-box',
                              transition: 'all 0.15s ease'
                            }}
                          />
                        )
                      })}
                    </div>

                    {formErrors.otp && <span style={{ color: '#dc2626', fontSize: '0.72rem', textAlign: 'center', display: 'block' }}>{formErrors.otp}</span>}
                  </div>

                  {/* Resend Timer */}
                  <div style={{ textAlign: 'center', margin: '2px 0 8px 0' }}>
                    {resendCountdown > 0 ? (
                      <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: '600' }}>
                        Resend OTP in {resendCountdown}s
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={handleResendOtp}
                        disabled={forgotLoading}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: '#d37244',
                          fontSize: '0.82rem',
                          fontWeight: '700',
                          cursor: 'pointer',
                          padding: '2px 6px',
                          textDecoration: 'underline',
                          textUnderlineOffset: '3px'
                        }}
                      >
                        Resend OTP
                      </button>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={forgotLoading}
                    style={{
                      width: '100%',
                      background: '#c2410c',
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: '10px',
                      padding: '12px',
                      fontSize: '0.92rem',
                      fontWeight: '700',
                      cursor: forgotLoading ? 'not-allowed' : 'pointer',
                      opacity: forgotLoading ? 0.75 : 1,
                      boxShadow: '0 3px 10px rgba(194, 65, 12, 0.25)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      transition: 'all 0.2s'
                    }}
                  >
                    <span>Verify OTP</span>
                  </button>

                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                    <button
                      type="button"
                      onClick={() => setForgotStep(1)}
                      style={{
                        background: 'none',
                        border: 'none',
                        fontSize: '0.78rem',
                        fontWeight: '600',
                        color: '#64748b',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}
                    >
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setFormErrors({})
                        setForgotStep(1)
                        setViewMode('login')
                      }}
                      style={{
                        background: 'none',
                        border: 'none',
                        fontSize: '0.78rem',
                        fontWeight: '600',
                        color: '#64748b',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}
                    >
                      <ArrowLeft style={{ width: '13px', height: '13px' }} /> Back to Sign In
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* ─── STEP 3: Create New Password ─── */}
            {forgotStep === 3 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {/* Key Badge */}
                <div
                  style={{
                    width: '46px',
                    height: '46px',
                    borderRadius: '50%',
                    background: 'rgba(211, 114, 68, 0.12)',
                    color: '#d37244',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto'
                  }}
                >
                  <KeyRound style={{ width: '22px', height: '22px', color: '#d37244' }} />
                </div>

                <div style={{ textAlign: 'center' }}>
                  <h2 style={{ fontSize: '1.45rem', fontWeight: '800', color: '#1e293b', margin: 0 }}>Create New Password</h2>
                  <p style={{ fontSize: '0.82rem', color: '#64748b', marginTop: '6px', lineHeight: '1.4' }}>
                    Enter and confirm your new password to secure your account.
                  </p>
                </div>

                <form onSubmit={handleResetPasswordSubmit} noValidate autoComplete="off" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  {/* New Password */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ fontSize: '0.82rem', fontWeight: '700', color: '#1e293b' }}>New Password</label>
                    <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                      <Lock style={{ width: '16px', height: '16px', position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: formErrors.newPassword ? '#dc2626' : '#d37244' }} />
                      <input
                        type={showNewPassword ? "text" : "password"}
                        value={newPassword}
                        onChange={(e) => {
                          setNewPassword(e.target.value)
                          if (formErrors.newPassword) setFormErrors((prev) => ({ ...prev, newPassword: null }))
                        }}
                        className="input-field"
                        placeholder="Enter new password (min 6 chars)"
                        style={{
                          width: '100%',
                          padding: '10px 38px 10px 38px',
                          borderRadius: '10px',
                          border: formErrors.newPassword ? '1px solid #dc2626' : '1px solid #e2e8f0',
                          background: '#f8fafc',
                          color: formErrors.newPassword ? '#dc2626' : '#1e293b',
                          fontSize: '0.92rem',
                          fontWeight: '500',
                          outline: 'none',
                          boxSizing: 'border-box'
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        style={{
                          position: 'absolute',
                          right: '12px',
                          top: '50%',
                          transform: 'translateY(-50%)',
                          background: 'none',
                          border: 'none',
                          color: '#64748b',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          padding: '0'
                        }}
                      >
                        {showNewPassword ? <EyeOff style={{ width: '16px', height: '16px' }} /> : <Eye style={{ width: '16px', height: '16px' }} />}
                      </button>
                    </div>
                    {formErrors.newPassword && <span style={{ color: '#dc2626', fontSize: '0.7rem', marginTop: '2px', display: 'block' }}>{formErrors.newPassword}</span>}
                  </div>

                  {/* Confirm New Password */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ fontSize: '0.82rem', fontWeight: '700', color: '#1e293b' }}>Confirm New Password</label>
                    <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                      <Lock style={{ width: '16px', height: '16px', position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: formErrors.confirmNewPassword ? '#dc2626' : '#d37244' }} />
                      <input
                        type={showConfirmNewPassword ? "text" : "password"}
                        value={confirmNewPassword}
                        onChange={(e) => {
                          setConfirmNewPassword(e.target.value)
                          if (formErrors.confirmNewPassword) setFormErrors((prev) => ({ ...prev, confirmNewPassword: null }))
                        }}
                        className="input-field"
                        placeholder="Re-enter new password"
                        style={{
                          width: '100%',
                          padding: '10px 38px 10px 38px',
                          borderRadius: '10px',
                          border: formErrors.confirmNewPassword ? '1px solid #dc2626' : '1px solid #e2e8f0',
                          background: '#f8fafc',
                          color: formErrors.confirmNewPassword ? '#dc2626' : '#1e293b',
                          fontSize: '0.92rem',
                          fontWeight: '500',
                          outline: 'none',
                          boxSizing: 'border-box'
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmNewPassword(!showConfirmNewPassword)}
                        style={{
                          position: 'absolute',
                          right: '12px',
                          top: '50%',
                          transform: 'translateY(-50%)',
                          background: 'none',
                          border: 'none',
                          color: '#64748b',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          padding: '0'
                        }}
                      >
                        {showConfirmNewPassword ? <EyeOff style={{ width: '16px', height: '16px' }} /> : <Eye style={{ width: '16px', height: '16px' }} />}
                      </button>
                    </div>
                    {formErrors.confirmNewPassword && <span style={{ color: '#dc2626', fontSize: '0.7rem', marginTop: '2px', display: 'block' }}>{formErrors.confirmNewPassword}</span>}
                  </div>

                  <button
                    type="submit"
                    disabled={forgotLoading}
                    style={{
                      width: '100%',
                      background: '#c2410c',
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: '10px',
                      padding: '12px',
                      fontSize: '0.92rem',
                      fontWeight: '700',
                      cursor: forgotLoading ? 'not-allowed' : 'pointer',
                      opacity: forgotLoading ? 0.75 : 1,
                      boxShadow: '0 3px 10px rgba(194, 65, 12, 0.25)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      transition: 'all 0.2s',
                      marginTop: '2px'
                    }}
                  >
                    {forgotLoading ? (
                      <>
                        <div style={{
                          width: '16px',
                          height: '16px',
                          border: '2px solid rgba(255,255,255,0.3)',
                          borderTopColor: '#fff',
                          borderRadius: '50%',
                          animation: 'spin 0.6s linear infinite'
                        }}></div>
                        <span>Resetting Password...</span>
                      </>
                    ) : (
                      <span>Reset Password</span>
                    )}
                  </button>

                  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginTop: '4px' }}>
                    <button
                      type="button"
                      onClick={() => {
                        setFormErrors({})
                        setForgotStep(1)
                        setViewMode('login')
                      }}
                      style={{
                        background: 'none',
                        border: 'none',
                        padding: 0,
                        color: '#64748b',
                        fontWeight: '700',
                        cursor: 'pointer',
                        fontSize: '0.78rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}
                    >
                      <ArrowLeft style={{ width: '14px', height: '14px' }} /> Back to Sign In
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        )}

        <div style={{ textAlign: 'center', fontSize: '0.72rem', color: '#94a3b8', marginTop: '2px' }}>
          Powered by Serviq
        </div>
      </div>
    </div>
  )
}

