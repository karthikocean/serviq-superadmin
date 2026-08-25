import React, { useState } from 'react';
import { X, RefreshCw } from 'lucide-react';
import PaymentDetailsForm from './PaymentDetailsForm';

export default function RenewSubscriptionModal({ subscription, onClose, onConfirm }) {
  const [formState, setFormState] = useState({
    paymentMethod: 'Bank Transfer',
    referenceId: '',
    paymentProof: null,
    notes: ''
  });
  const [formErrors, setFormErrors] = useState({});

  if (!subscription) return null;

  // Assuming planPrice comes from subscription.planName or standard rates
  const planPrice = subscription.planName?.includes('Premium') ? 49999 : 
                    subscription.planName?.includes('Standard') ? 19999 : 9999;
  
  // Calculate add-on amount based on current extra branches
  const extraBranches = subscription.extraBranches || 0;
  const addonPrice = extraBranches * 1500; // Mock addon price per branch
  
  const finalAmount = planPrice + addonPrice;

  const handleSubmit = () => {
    if (formState.paymentMethod !== 'Complimentary' && !formState.referenceId) {
      setFormErrors({ referenceId: 'Reference ID is required' });
      return;
    }
    
    // Pass the payment details back to the parent component
    onConfirm({
      ...formState,
      amount: finalAmount
    });
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0, left: 0, width: '100vw', height: '100vh',
        background: 'rgba(9, 13, 22, 0.45)',
        backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)',
        display: 'flex', justifyContent: 'center', alignItems: 'center',
        zIndex: 1100, padding: '20px'
      }}
      onClick={onClose}
    >
      <div
        className="animate-fade-in"
        style={{
          background: '#ffffff',
          borderRadius: '20px', padding: '32px',
          width: '95%', maxWidth: '500px',
          boxShadow: '0 20px 60px rgba(0,0,0,0.18)',
          position: 'relative', textAlign: 'left',
          maxHeight: '90vh', overflowY: 'auto'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid var(--border-color)', paddingBottom: '14px' }}>
          <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: '900', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <RefreshCw style={{ width: '18px', height: '18px', color: '#10b981' }} />
            Renew Subscription
          </h3>
          <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }} onClick={onClose}>
            <X style={{ width: '18px', height: '18px' }} />
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '10px' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: '600' }}>Restaurant</span>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-main)', fontWeight: '800' }}>{subscription.restaurantName}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '10px' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: '600' }}>Current Plan</span>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-main)', fontWeight: '800' }}>{subscription.planName}</span>
          </div>
          
          <div style={{ background: 'var(--bg-app)', padding: '16px', borderRadius: '12px', display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '8px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: '600' }}>Plan Price</span>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-main)', fontWeight: '700' }}>₹{planPrice.toLocaleString()}</span>
            </div>
            {extraBranches > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: '600' }}>Add-on Amount ({extraBranches} Extra Branches)</span>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-main)', fontWeight: '700' }}>₹{addonPrice.toLocaleString()}</span>
              </div>
            )}
            <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--border-color)', paddingTop: '8px', marginTop: '4px' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-main)', fontWeight: '800' }}>Final Amount</span>
              <span style={{ fontSize: '0.9rem', color: '#10b981', fontWeight: '900' }}>₹{finalAmount.toLocaleString()}</span>
            </div>
          </div>
        </div>

        <PaymentDetailsForm formState={formState} setFormState={setFormState} formErrors={formErrors} />

        <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
          <button className="btn-outline" style={{ padding: '8px 18px', borderRadius: '8px', cursor: 'pointer', fontWeight: '700', fontSize: '0.8rem' }} onClick={onClose}>
            Cancel
          </button>
          <button onClick={handleSubmit} style={{ padding: '8px 18px', borderRadius: '8px', cursor: 'pointer', fontWeight: '700', fontSize: '0.8rem', background: '#10b981', color: 'white', border: 'none' }}>
            Confirm Renew
          </button>
        </div>
      </div>
    </div>
  );
}
