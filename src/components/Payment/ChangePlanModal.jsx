import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, ArrowRight } from 'lucide-react';
import PaymentDetailsForm from './PaymentDetailsForm';
import CustomSelect from '../common/CustomSelect';
import { usePlans } from '../../hooks/usePlans';
import { prorateChangePlanAPI } from '../../services/api';

export default function ChangePlanModal({ subscription, onClose, onConfirm }) {
  const { plans } = usePlans();
  const [selectedPlanId, setSelectedPlanId] = useState('');
  const [formState, setFormState] = useState({
    paymentMethod: 'Bank Transfer',
    referenceId: '',
    paymentProof: null,
    notes: ''
  });
  const [formErrors, setFormErrors] = useState({});

  const [prorationData, setProrationData] = useState(null);
  const [isLoadingProration, setIsLoadingProration] = useState(false);

  // Prevent background scrolling when modal is open
  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, []);

  if (!subscription) return null;

  // Find the selected plan object
  const newPlan = plans?.find(p => p._id === selectedPlanId) || null;

  useEffect(() => {
    const fetchProration = async () => {
      if (!selectedPlanId || !subscription?.restaurantId) {
        setProrationData(null);
        return;
      }
      setIsLoadingProration(true);
      try {
        const res = await prorateChangePlanAPI({
          restaurantId: subscription.restaurantId,
          newPlanId: selectedPlanId
        });
        if (res.success) {
          setProrationData(res.data);
        }
      } catch (err) {
        console.error("Failed to fetch proration", err);
      } finally {
        setIsLoadingProration(false);
      }
    };
    fetchProration();
  }, [selectedPlanId, subscription?.restaurantId]);

  const handleSubmit = () => {
    if (!selectedPlanId) {
      alert("Please select a new plan");
      return;
    }
    if (formState.paymentMethod !== 'Complimentary' && !formState.referenceId) {
      setFormErrors({ referenceId: 'Reference ID is required' });
      return;
    }
    
    onConfirm({
      newPlanId: selectedPlanId,
      ...formState,
      amount: prorationData?.finalPayable || 0
    });
  };

  return createPortal(
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        width: '100vw',
        height: '100vh',
        background: 'rgba(9, 13, 22, 0.55)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 99999,
        padding: '20px',
        overflowY: 'auto'
      }}
      onClick={onClose}
    >
      <div
        className="animate-fade-in"
        style={{
          background: '#ffffff',
          borderRadius: '20px',
          padding: '28px',
          width: '100%',
          maxWidth: '560px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          position: 'relative',
          textAlign: 'left',
          maxHeight: 'calc(100vh - 40px)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px', flexShrink: 0 }}>
          <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: '900', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ArrowRight style={{ width: '18px', height: '18px', color: '#3b82f6' }} />
            Change Subscription Plan
          </h3>
          <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }} onClick={onClose}>
            <X style={{ width: '18px', height: '18px' }} />
          </button>
        </div>

        {/* Scrollable Body */}
        <div style={{ overflowY: 'auto', paddingRight: '4px', flex: 1, display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Plan Selection */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', alignItems: 'center', gap: '12px' }}>
            <div style={{ padding: '12px', background: 'var(--bg-app)', borderRadius: '8px', border: '1px solid var(--border-color)', textAlign: 'center' }}>
              <span style={{ display: 'block', fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: '600' }}>Current Plan</span>
              <span style={{ display: 'block', fontSize: '0.9rem', color: 'var(--text-main)', fontWeight: '800', marginTop: '4px' }}>{subscription.planName}</span>
            </div>
            
            <ArrowRight style={{ width: '20px', height: '20px', color: 'var(--text-muted)' }} />
            
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ display: 'block', fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: '600', marginBottom: '4px' }}>Select New Plan</span>
              <CustomSelect
                options={(plans?.filter(p => p.name !== subscription.planName && p.status === 'Active') || []).map(p => ({
                  value: p._id,
                  label: `${p.name} - ₹${p.monthlyPrice || p.annualPrice}`
                }))}
                value={selectedPlanId}
                onChange={(val) => {
                  const selected = typeof val === 'object' && val !== null && val.target ? val.target.value : val
                  setSelectedPlanId(selected)
                }}
                placeholder="Choose Plan"
              />
            </div>
          </div>
          
          {/* Proration Calculation Display */}
          {selectedPlanId && (
            <div style={{ background: 'var(--bg-app)', padding: '16px', borderRadius: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {isLoadingProration ? (
                <div style={{ textAlign: 'center', padding: '20px', color: 'var(--text-muted)' }}>Calculating proration...</div>
              ) : prorationData ? (
                <>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: '600' }}>Current Plan Value</span>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-main)', fontWeight: '700' }}>₹{(prorationData.currentPlanValue || 0).toLocaleString()}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: '600' }}>Unused Plan Credit (Prorated)</span>
                    <span style={{ fontSize: '0.8rem', color: '#10b981', fontWeight: '700' }}>+ ₹{(prorationData.unusedCredit || 0).toLocaleString()}</span>
                  </div>
                  {prorationData.previousWalletBalance > 0 && (
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: '600' }}>Previous Wallet Balance</span>
                      <span style={{ fontSize: '0.8rem', color: '#10b981', fontWeight: '700' }}>+ ₹{(prorationData.previousWalletBalance).toLocaleString()}</span>
                    </div>
                  )}
                  {prorationData.previousWalletBalance > 0 && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '8px', borderBottom: '1px dashed var(--border-color)' }}>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: '600' }}>Total Available Credit</span>
                      <span style={{ fontSize: '0.8rem', color: '#10b981', fontWeight: '700' }}>₹{(prorationData.totalAvailableCredit || 0).toLocaleString()}</span>
                    </div>
                  )}

                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: prorationData.previousWalletBalance > 0 ? '8px' : '0' }}>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: '600' }}>New Plan Base Price</span>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-main)', fontWeight: '700' }}>₹{(prorationData.newPlanPrice || 0).toLocaleString()}</span>
                  </div>
                  {prorationData.newAddonAmount > 0 && (
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: '600' }}>Carry-over Add-on Amount</span>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-main)', fontWeight: '700' }}>+ ₹{(prorationData.newAddonAmount).toLocaleString()}</span>
                    </div>
                  )}
                  {prorationData.newAddonAmount > 0 && (
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: '600' }}>Total New Plan Value</span>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-main)', fontWeight: '700' }}>₹{(prorationData.totalNewPrice || 0).toLocaleString()}</span>
                    </div>
                  )}
                  
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--border-color)', paddingTop: '8px', marginTop: '4px' }}>
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-main)', fontWeight: '800' }}>Final Payable</span>
                    <span style={{ fontSize: '0.9rem', color: '#3b82f6', fontWeight: '900' }}>₹{(prorationData.finalPayable || 0).toLocaleString()}</span>
                  </div>

                  {prorationData.creditApplied > 0 && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '4px' }}>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '600' }}>Credit Applied</span>
                      <span style={{ fontSize: '0.75rem', color: '#10b981', fontWeight: '700' }}>- ₹{(prorationData.creditApplied).toLocaleString()}</span>
                    </div>
                  )}
                  {prorationData.remainingWalletBalance > 0 && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '4px' }}>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '600' }}>Remaining Wallet Balance</span>
                      <span style={{ fontSize: '0.75rem', color: '#f59e0b', fontWeight: '700' }}>₹{(prorationData.remainingWalletBalance).toLocaleString()}</span>
                    </div>
                  )}
                  <p style={{ margin: '8px 0 0 0', fontSize: '0.65rem', color: 'var(--text-muted)', fontStyle: 'italic', textAlign: 'center' }}>
                    * Final proration is accurately calculated by the backend based on actual days used.
                  </p>
                </>
              ) : (
                <div style={{ textAlign: 'center', padding: '10px', color: '#ef4444' }}>Failed to calculate.</div>
              )}
            </div>
          )}

          {selectedPlanId && (
            <PaymentDetailsForm formState={formState} setFormState={setFormState} formErrors={formErrors} />
          )}
        </div>

        {/* Footer Actions */}
        <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid var(--border-color)', display: 'flex', justifyContent: 'flex-end', gap: '12px', flexShrink: 0 }}>
          <button className="btn-outline" style={{ padding: '8px 18px', borderRadius: '8px', cursor: 'pointer', fontWeight: '700', fontSize: '0.8rem' }} onClick={onClose}>
            Cancel
          </button>
          <button 
            disabled={!selectedPlanId}
            onClick={handleSubmit} 
            style={{ 
              padding: '8px 18px', borderRadius: '8px', cursor: selectedPlanId ? 'pointer' : 'not-allowed', 
              fontWeight: '700', fontSize: '0.8rem', 
              background: selectedPlanId ? '#3b82f6' : 'var(--border-color)', 
              color: selectedPlanId ? 'white' : 'var(--text-muted)', border: 'none' 
            }}
          >
            Confirm Change
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
