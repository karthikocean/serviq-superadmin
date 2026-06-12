import React, { useState } from 'react'
import {
  Plus,
  Edit2,
  AlertTriangle,
  Check,
  X,
  Zap,
  TrendingUp,
  Sparkles,
  Shield,
  ShieldAlert
} from 'lucide-react'

// Reusable validated input component
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
      {error && (
        <span style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', color: '#ef4444', pointerEvents: 'none', display: 'flex' }}><AlertTriangle style={{ width: '14px', height: '14px' }} /></span>
      )}
    </div>
    {error && <span style={{ fontSize: '0.7rem', color: '#ef4444', fontWeight: '600' }}>{error}</span>}
  </div>
)

// Reusable validated select component
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

const CORE_FEATURES = [
  'QR Ordering',
  'Menu Management',
  'Table Management',
  'Order Management',
  'Waiter Management',
  'Kitchen Management'
]

export default function PlansManagement({ plans, setPlans, showToast }) {
  const [editingPlanId, setEditingPlanId] = useState(null)
  const [planFormState, setPlanFormState] = useState({
    name: '',
    description: '',
    monthlyPrice: 0,
    annualPrice: 0,
    branchLimit: 99999,
    userLimit: 99999,
    orderLimit: 99999,
    features: [],
    status: 'Active'
  })
  const [formErrors, setFormErrors] = useState({})

  const handleCreatePlan = (e) => {
    e.preventDefault()

    const errors = {}
    if (!planFormState.name.trim()) errors.name = 'Plan Name is Required'
    if (!planFormState.description.trim()) errors.description = 'Plan Description is Required'
    if (planFormState.monthlyPrice === '' || parseFloat(planFormState.monthlyPrice) < 0) errors.monthlyPrice = 'Valid Monthly Price is Required'
    if (planFormState.annualPrice === '' || parseFloat(planFormState.annualPrice) < 0) errors.annualPrice = 'Valid Annual Price is Required'
    if (planFormState.features.length === 0) errors.features = 'At least one feature must be selected'

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors)
      return
    }

    setFormErrors({})

    const nextPlanId = `plan-${planFormState.name.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}`
    const newPlan = {
      id: nextPlanId,
      name: planFormState.name,
      description: planFormState.description,
      monthlyPrice: parseFloat(planFormState.monthlyPrice) || 0,
      annualPrice: parseFloat(planFormState.annualPrice) || 0,
      branchLimit: parseInt(planFormState.branchLimit) || 99999,
      userLimit: parseInt(planFormState.userLimit) || 99999,
      orderLimit: parseInt(planFormState.orderLimit) || 99999,
      features: planFormState.features,
      status: planFormState.status
    }

    setPlans([...plans, newPlan])
    setEditingPlanId(null)
    showToast('success', `Subscription plan "${newPlan.name}" created successfully!`)
  }

  const handleModifyPlan = (e) => {
    e.preventDefault()

    const errors = {}
    if (!planFormState.name.trim()) errors.name = 'Plan Name is Required'
    if (!planFormState.description.trim()) errors.description = 'Plan Description is Required'
    if (planFormState.monthlyPrice === '' || parseFloat(planFormState.monthlyPrice) < 0) errors.monthlyPrice = 'Valid Monthly Price is Required'
    if (planFormState.annualPrice === '' || parseFloat(planFormState.annualPrice) < 0) errors.annualPrice = 'Valid Annual Price is Required'
    if (planFormState.features.length === 0) errors.features = 'At least one feature must be selected'

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors)
      return
    }

    setFormErrors({})

    const updated = plans.map(p => p.id === editingPlanId ? {
      ...p,
      name: planFormState.name,
      description: planFormState.description,
      monthlyPrice: parseFloat(planFormState.monthlyPrice) || 0,
      annualPrice: parseFloat(planFormState.annualPrice) || 0,
      branchLimit: parseInt(planFormState.branchLimit) || 99999,
      userLimit: parseInt(planFormState.userLimit) || 99999,
      orderLimit: parseInt(planFormState.orderLimit) || 99999,
      features: planFormState.features,
      status: planFormState.status
    } : p)

    setPlans(updated)
    setEditingPlanId(null)
    showToast('success', `Plan "${planFormState.name}" updated successfully!`)
  }

  const togglePlanStatus = (planId) => {
    const updated = plans.map(p => {
      if (p.id === planId) {
        const nextStatus = p.status === 'Active' ? 'Inactive' : 'Active'
        showToast('info', `Plan "${p.name}" status set to ${nextStatus.toUpperCase()}`)
        return { ...p, status: nextStatus }
      }
      return p
    })
    setPlans(updated)
  }

  return (
    editingPlanId ? (
      <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border-color)',
          borderRadius: '16px',
          padding: '32px',
          boxShadow: 'var(--shadow-sm)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', borderBottom: '1px solid var(--border-color)', paddingBottom: '16px' }}>
            <div>
              <h3 style={{ margin: '4px 0 0 0', fontSize: '1.25rem', fontWeight: '900', color: 'var(--text-main)' }}>
                {editingPlanId === 'new' ? 'Create Subscription Plan' : 'Modify Subscription Plan'}
              </h3>
            </div>
            <button
              className="btn-outline"
              style={{ padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: '700' }}
              onClick={() => setEditingPlanId(null)}
            >
              Back to Plans
            </button>
          </div>

          <form onSubmit={editingPlanId === 'new' ? handleCreatePlan : handleModifyPlan} noValidate style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <ValidatedInput
              label="Plan Name"
              type="text"
              value={planFormState.name}
              onChange={(e) => setPlanFormState({ ...planFormState, name: e.target.value })}
              placeholder="e.g. Basic Plan, Standard Plan, Premium Plan"
              required
              error={formErrors.name}
              setError={(val) => setFormErrors({ ...formErrors, name: val })}
            />

            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <label style={{ fontSize: '0.75rem', fontWeight: '700', color: formErrors.description ? '#ef4444' : 'var(--text-main)' }}>
                Plan Description<span style={{ color: '#ef4444', marginLeft: '2px' }}>*</span>
              </label>
              <textarea
                value={planFormState.description}
                onChange={(e) => {
                  setPlanFormState({ ...planFormState, description: e.target.value })
                  if (formErrors.description) setFormErrors({ ...formErrors, description: '' })
                }}
                placeholder="Describe the plan, its target audience and core value proposition..."
                rows={3}
                style={{
                  width: '100%',
                  padding: '9px 12px',
                  border: `1.5px solid ${formErrors.description ? '#ef4444' : 'var(--border-color)'}`,
                  background: formErrors.description ? 'rgba(239,68,68,0.04)' : 'var(--bg-app)',
                  color: 'var(--text-main)',
                  borderRadius: '8px',
                  fontSize: '0.82rem',
                  outline: 'none',
                  boxSizing: 'border-box',
                  resize: 'vertical',
                  fontFamily: 'inherit'
                }}
              />
              {formErrors.description && <span style={{ fontSize: '0.7rem', color: '#ef4444', fontWeight: '600' }}>{formErrors.description}</span>}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <ValidatedInput
                label="Monthly Price (₹)"
                type="number"
                value={planFormState.monthlyPrice}
                onChange={(e) => setPlanFormState({ ...planFormState, monthlyPrice: e.target.value })}
                placeholder="e.g. 999"
                required
                min="0"
                error={formErrors.monthlyPrice}
                setError={(val) => setFormErrors({ ...formErrors, monthlyPrice: val })}
              />
              <ValidatedInput
                label="Annual Price (₹)"
                type="number"
                value={planFormState.annualPrice}
                onChange={(e) => setPlanFormState({ ...planFormState, annualPrice: e.target.value })}
                placeholder="e.g. 9999"
                required
                min="0"
                error={formErrors.annualPrice}
                setError={(val) => setFormErrors({ ...formErrors, annualPrice: val })}
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '0.75rem', fontWeight: '700', color: formErrors.features ? '#ef4444' : 'var(--text-main)' }}>
                Features Included<span style={{ color: '#ef4444', marginLeft: '2px' }}>*</span>
              </label>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                gap: '8px',
                background: 'var(--bg-app)',
                padding: '16px',
                borderRadius: '10px',
                border: '1px solid var(--border-color)'
              }}>
                {CORE_FEATURES.map(feat => {
                  const isChecked = planFormState.features.includes(feat)
                  return (
                    <label key={feat} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.78rem', fontWeight: '600', color: 'var(--text-main)', cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={(e) => {
                          let updated = [...planFormState.features]
                          if (e.target.checked) {
                            updated.push(feat)
                          } else {
                            updated = updated.filter(f => f !== feat)
                          }
                          setPlanFormState({ ...planFormState, features: updated })
                          if (formErrors.features) setFormErrors({ ...formErrors, features: '' })
                        }}
                        style={{ cursor: 'pointer', accentColor: 'var(--primary)' }}
                      />
                      {feat}
                    </label>
                  )
                })}
              </div>
              {formErrors.features && <span style={{ fontSize: '0.7rem', color: '#ef4444', fontWeight: '600' }}>{formErrors.features}</span>}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <ValidatedSelect
                label="Status"
                value={planFormState.status}
                onChange={(e) => setPlanFormState({ ...planFormState, status: e.target.value })}
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </ValidatedSelect>

              {/* Hidden but preserved limits to maintain data schema compatibility */}
              <div style={{ display: 'none' }}>
                <input type="hidden" value={planFormState.branchLimit} />
                <input type="hidden" value={planFormState.userLimit} />
                <input type="hidden" value={planFormState.orderLimit} />
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '32px', paddingTop: '24px', borderTop: '1px solid var(--border-color)' }}>
              <button type="button" className="btn-outline" onClick={() => setEditingPlanId(null)} style={{ padding: '10px 24px', fontWeight: '600', borderRadius: '8px', cursor: 'pointer', background: '#ffffff', color: '#64748b', border: '1px solid #cbd5e1' }}>Cancel</button>
              <button type="submit" className="btn-black" style={{ padding: '10px 24px', fontWeight: '600', borderRadius: '8px', cursor: 'pointer', background: '#000000', color: '#ffffff', border: 'none' }}>{editingPlanId === 'new' ? 'Create Plan' : 'Save Changes'}</button>
            </div>
          </form>
        </div>
      </div>
    ) : (
      <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px', minWidth: 0 }}>
        {/* Top Banner / Actions Control */}
        <div className="glass-card" style={{ padding: '24px', background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h3 style={{ margin: '4px 0 0 0', fontSize: '1.25rem', fontWeight: '900', color: 'var(--text-main)' }}>Subscription Tier Configurations</h3>
          </div>
          <button
            onClick={() => {
              setEditingPlanId('new')
              setPlanFormState({
                name: '',
                description: '',
                monthlyPrice: '',
                annualPrice: '',
                branchLimit: 99999,
                userLimit: 99999,
                orderLimit: 99999,
                features: [],
                status: 'Active'
              })
              setFormErrors({})
            }}
            className="btn-black"
            style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer' }}
          >
            <Plus style={{ width: '16px', height: '16px' }} /> Create Plan
          </button>
        </div>

        {/* Plans Cards Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
          {plans.map(plan => {
            const isBasic = plan.name.toLowerCase().includes('basic')
            const isStandard = plan.name.toLowerCase().includes('standard')
            const isPremium = plan.name.toLowerCase().includes('premium')
            
            return (
              <div key={plan.id} className="glass-card" style={{
                padding: '28px',
                background: 'var(--bg-card)',
                border: plan.status === 'Active' ? '1px solid var(--border-color)' : '1px dashed #ef4444',
                opacity: plan.status === 'Active' ? 1 : 0.8,
                borderRadius: '18px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                gap: '20px',
                position: 'relative',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                boxShadow: plan.status === 'Active' ? '0 4px 20px rgba(0,0,0,0.03)' : 'none'
              }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        {isPremium && <Sparkles style={{ width: '18px', height: '18px', color: '#7c3aed' }} />}
                        {isStandard && <TrendingUp style={{ width: '18px', height: '18px', color: '#3b82f6' }} />}
                        {isBasic && <Zap style={{ width: '18px', height: '18px', color: '#10b981' }} />}
                        <h4 style={{ margin: 0, fontSize: '1.2rem', fontWeight: '900', color: 'var(--text-main)' }}>{plan.name}</h4>
                      </div>
                      <div style={{ display: 'flex', gap: '6px', marginTop: '6px', alignItems: 'center' }}>
                        <span style={{
                          fontSize: '0.65rem',
                          fontWeight: '800',
                          padding: '3px 8px',
                          borderRadius: '6px',
                          background: plan.status === 'Active' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                          color: plan.status === 'Active' ? '#10b981' : '#ef4444',
                          display: 'inline-block'
                        }}>{plan.status}</span>
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '4px' }}>
                      <button
                        onClick={() => {
                          setEditingPlanId(plan.id)
                          setPlanFormState({
                            name: plan.name,
                            description: plan.description || '',
                            monthlyPrice: plan.monthlyPrice.toString(),
                            annualPrice: plan.annualPrice.toString(),
                            branchLimit: (plan.branchLimit || 99999).toString(),
                            userLimit: (plan.userLimit || 99999).toString(),
                            orderLimit: (plan.orderLimit || 99999).toString(),
                            features: plan.features || [],
                            status: plan.status
                          })
                          setFormErrors({})
                        }}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '6px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', borderRadius: '6px', transition: 'all 0.2s' }}
                        title="Modify Plan Details"
                        onMouseOver={(e) => { e.currentTarget.style.background = 'var(--bg-app)'; e.currentTarget.style.color = 'var(--text-main)'; }}
                        onMouseOut={(e) => { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = 'var(--text-muted)'; }}
                      >
                        <Edit2 style={{ width: '15px', height: '15px' }} />
                      </button>
                    </div>
                  </div>

                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: '12px 0 0 0', lineHeight: '1.4', fontWeight: '500' }}>
                    {plan.description || 'No description provided.'}
                  </p>
                </div>

                <div style={{ borderTop: '1px solid var(--border-color)', borderBottom: '1px solid var(--border-color)', padding: '14px 0', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Monthly Rate</span>
                    <span style={{ fontSize: '1.1rem', color: 'var(--text-main)', fontWeight: '900' }}>₹{plan.monthlyPrice.toLocaleString()}<span style={{ fontSize: '0.72rem', fontWeight: '600', color: 'var(--text-muted)' }}>/mo</span></span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Annual Rate</span>
                    <span style={{ fontSize: '0.95rem', color: 'var(--text-muted)', fontWeight: '800' }}>₹{plan.annualPrice.toLocaleString()}<span style={{ fontSize: '0.72rem', fontWeight: '600' }}>/yr</span></span>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Includes Features:</span>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {CORE_FEATURES.map((feat, idx) => {
                      const isIncluded = plan.features?.includes(feat)
                      return (
                        <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.75rem', opacity: isIncluded ? 1 : 0.4 }}>
                          <div style={{
                            width: '14px',
                            height: '14px',
                            borderRadius: '50%',
                            background: isIncluded ? 'rgba(16, 185, 129, 0.12)' : 'rgba(100, 116, 139, 0.1)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: isIncluded ? '#10b981' : '#64748b'
                          }}>
                            {isIncluded ? <Check style={{ width: '10px', height: '10px', strokeWidth: '3px' }} /> : <X style={{ width: '8px', height: '8px' }} />}
                          </div>
                          <span style={{ fontWeight: isIncluded ? '700' : '500', color: isIncluded ? 'var(--text-main)' : 'var(--text-muted)' }}>{feat}</span>
                        </div>
                      )
                    })}
                  </div>
                </div>

                {/* Direct quick action: Activate / Deactivate plan */}
                <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '16px', marginTop: '4px' }}>
                  <button
                    onClick={() => togglePlanStatus(plan.id)}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      borderRadius: '8px',
                      border: 'none',
                      cursor: 'pointer',
                      fontSize: '0.78rem',
                      fontWeight: '800',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px',
                      transition: 'all 0.2s',
                      background: plan.status === 'Active' ? 'rgba(239, 68, 68, 0.08)' : 'rgba(16, 185, 129, 0.08)',
                      color: plan.status === 'Active' ? '#ef4444' : '#10b981'
                    }}
                    onMouseOver={(e) => {
                      e.currentTarget.style.background = plan.status === 'Active' ? 'rgba(239, 68, 68, 0.14)' : 'rgba(16, 185, 129, 0.14)'
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.background = plan.status === 'Active' ? 'rgba(239, 68, 68, 0.08)' : 'rgba(16, 185, 129, 0.08)'
                    }}
                  >
                    {plan.status === 'Active' ? (
                      <>
                        <ShieldAlert style={{ width: '14px', height: '14px' }} /> Deactivate Plan
                      </>
                    ) : (
                      <>
                        <Shield style={{ width: '14px', height: '14px' }} /> Activate Plan
                      </>
                    )}
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    )
  )
}
