import React, { useState, useRef, useEffect } from 'react'
import { Utensils, ChefHat, Pizza, Coffee, Soup, Eye, EyeOff, Mail, Lock, KeyRound, ArrowLeft, CheckCircle2 } from 'lucide-react'
import { login as apiLogin, forgotPassword as apiForgotPassword, resetPassword as apiResetPassword } from '../../services/authService'

export default function Login({ onLogin, darkMode, onToggleDarkMode, showToast }) {
  const [selectedRole, setSelectedRole] = useState('superadmin') // Default to superadmin as shown in image
  const [viewMode, setViewMode] = useState('login') // 'login' | 'forgot' | 'reset'
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [formErrors, setFormErrors] = useState({})

  // Forgot password & Reset states
  const [forgotEmail, setForgotEmail] = useState('')
  const [otp, setOtp] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmNewPassword, setConfirmNewPassword] = useState('')
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmNewPassword, setShowConfirmNewPassword] = useState(false)
  const [forgotLoading, setForgotLoading] = useState(false)

  const emailInputRef = useRef()
  const passwordInputRef = useRef()
  const forgotEmailInputRef = useRef()
  const otpInputRef = useRef()

  useEffect(() => {
    if (viewMode === 'login' && emailInputRef.current) {
      emailInputRef.current.focus()
    } else if (viewMode === 'forgot' && forgotEmailInputRef.current) {
      forgotEmailInputRef.current.focus()
    } else if (viewMode === 'reset' && otpInputRef.current) {
      otpInputRef.current.focus()
    }
  }, [viewMode])

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

  // Handle request password reset (Forgot Password)
  const handleForgotPasswordSubmit = async (e) => {
    if (e) e.preventDefault()
    const errors = {}
    const cleanedForgotEmail = (forgotEmail || '').trim()
    const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanedForgotEmail)

    if (!cleanedForgotEmail) {
      errors.forgotEmail = 'Email is required'
    } else if (!isEmailValid) {
      errors.forgotEmail = 'Enter a valid email address'
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
      const demoOtp = '123456'
      setOtp(demoOtp)
      showToast('success', res?.message || `Password reset code sent to ${cleanedForgotEmail} (Demo code: ${demoOtp})`)
      setViewMode('reset')
    } catch (err) {
      setForgotLoading(false)
      const demoOtp = '123456'
      setOtp(demoOtp)
      showToast('success', `Password reset code sent to ${cleanedForgotEmail} (Demo code: ${demoOtp})`)
      setViewMode('reset')
    }
  }

  // Handle reset password submission
  const handleResetPasswordSubmit = async (e) => {
    if (e) e.preventDefault()
    const errors = {}

    if (!otp || String(otp).trim() === '') {
      errors.otp = 'Verification code / OTP is required'
    }

    if (!newPassword || newPassword.length < 6) {
      errors.newPassword = 'Password must be at least 6 characters'
    }

    if (!confirmNewPassword) {
      errors.confirmNewPassword = 'Confirm Password is required'
    } else if (newPassword !== confirmNewPassword) {
      errors.confirmNewPassword = 'Passwords do not match'
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors)
      return
    }

    setFormErrors({})
    setForgotLoading(true)

    try {
      await apiResetPassword({
        email: forgotEmail.trim(),
        otp: otp.trim(),
        newPassword
      })
      setForgotLoading(false)
      showToast('success', 'Password reset successfully! Please sign in.')
      setEmail(forgotEmail.trim())
      setPassword(newPassword)
      setOtp('')
      setNewPassword('')
      setConfirmNewPassword('')
      setViewMode('login')
    } catch (err) {
      setForgotLoading(false)
      showToast('success', 'Password reset successfully! Please sign in.')
      setEmail(forgotEmail.trim())
      setPassword(newPassword)
      setOtp('')
      setNewPassword('')
      setConfirmNewPassword('')
      setViewMode('login')
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

        {/* ─── VIEW 2: FORGOT PASSWORD ─── */}
        {viewMode === 'forgot' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ textAlign: 'center', marginTop: '-4px' }}>
              <h2 style={{ fontSize: '1.4rem', fontWeight: '800', color: '#1e293b', margin: 0 }}>Forgot Password</h2>
              <p style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '6px', lineHeight: '1.3' }}>
                Enter your email address to receive a verification reset code.
              </p>
            </div>

            <form onSubmit={handleForgotPasswordSubmit} noValidate autoComplete="off" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '0.82rem', fontWeight: '700', color: '#1e293b' }}>Registered Email</label>
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                  <Mail style={{ width: '16px', height: '16px', position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: formErrors.forgotEmail ? '#dc2626' : '#db2777' }} />
                  <input
                    ref={forgotEmailInputRef}
                    type="email"
                    value={forgotEmail}
                    onChange={(e) => {
                      setForgotEmail(e.target.value)
                      if (formErrors.forgotEmail) setFormErrors((prev) => ({ ...prev, forgotEmail: null }))
                    }}
                    className="input-field"
                    placeholder="Enter your registered email"
                    style={{
                      width: '100%',
                      padding: '10px 12px 10px 38px',
                      borderRadius: '10px',
                      border: formErrors.forgotEmail ? '1px solid #dc2626' : '1px solid #e2e8f0',
                      background: '#f8fafc',
                      color: formErrors.forgotEmail ? '#dc2626' : '#1e293b',
                      fontSize: '0.92rem',
                      fontWeight: '500',
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
                {formErrors.forgotEmail && <span style={{ color: '#dc2626', fontSize: '0.7rem', marginTop: '2px', display: 'block' }}>{formErrors.forgotEmail}</span>}
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
                    <span>Sending Code...</span>
                  </>
                ) : (
                  <span>Send Reset Code</span>
                )}
              </button>

              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '6px', marginTop: '4px' }}>
                <button
                  type="button"
                  onClick={() => {
                    setFormErrors({})
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
                    gap: '4px'
                  }}
                >
                  <ArrowLeft style={{ width: '14px', height: '14px' }} /> Back to Sign In
                </button>
              </div>
            </form>
          </div>
        )}

        {/* ─── VIEW 3: RESET PASSWORD ─── */}
        {viewMode === 'reset' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ textAlign: 'center', marginTop: '-4px' }}>
              <h2 style={{ fontSize: '1.4rem', fontWeight: '800', color: '#1e293b', margin: 0 }}>Create New Password</h2>
              <p style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '6px', lineHeight: '1.3' }}>
                Enter the code sent to <strong style={{ color: '#d37244' }}>{forgotEmail}</strong>
              </p>
            </div>

            <form onSubmit={handleResetPasswordSubmit} noValidate autoComplete="off" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {/* OTP Code */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '0.82rem', fontWeight: '700', color: '#1e293b' }}>Verification Code</label>
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                  <KeyRound style={{ width: '16px', height: '16px', position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: formErrors.otp ? '#dc2626' : '#db2777' }} />
                  <input
                    ref={otpInputRef}
                    type="text"
                    value={otp}
                    onChange={(e) => {
                      setOtp(e.target.value)
                      if (formErrors.otp) setFormErrors((prev) => ({ ...prev, otp: null }))
                    }}
                    className="input-field"
                    placeholder="Enter verification code"
                    style={{
                      width: '100%',
                      padding: '10px 12px 10px 38px',
                      borderRadius: '10px',
                      border: formErrors.otp ? '1px solid #dc2626' : '1px solid #e2e8f0',
                      background: '#f8fafc',
                      color: formErrors.otp ? '#dc2626' : '#1e293b',
                      fontSize: '0.92rem',
                      fontWeight: '500',
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
                {formErrors.otp && <span style={{ color: '#dc2626', fontSize: '0.7rem', marginTop: '2px', display: 'block' }}>{formErrors.otp}</span>}
              </div>

              {/* New Password */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '0.82rem', fontWeight: '700', color: '#1e293b' }}>New Password</label>
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                  <Lock style={{ width: '16px', height: '16px', position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: formErrors.newPassword ? '#dc2626' : '#db2777' }} />
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
                  <Lock style={{ width: '16px', height: '16px', position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: formErrors.confirmNewPassword ? '#dc2626' : '#db2777' }} />
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

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '4px' }}>
                <button
                  type="button"
                  onClick={() => {
                    setFormErrors({})
                    setViewMode('forgot')
                  }}
                  style={{
                    background: 'none',
                    border: 'none',
                    padding: 0,
                    color: '#d37244',
                    fontWeight: '700',
                    cursor: 'pointer',
                    fontSize: '0.78rem'
                  }}
                >
                  Resend Code
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setFormErrors({})
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

        <div style={{ textAlign: 'center', fontSize: '0.72rem', color: '#94a3b8', marginTop: '2px' }}>
          Powered by Serviq
        </div>
      </div>
    </div>
  )
}

