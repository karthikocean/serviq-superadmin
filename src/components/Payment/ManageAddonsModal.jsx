import React, { useState } from 'react';
import { X, Plus, Minus, Layers } from 'lucide-react';
import PaymentDetailsForm from './PaymentDetailsForm';
import { useAddons } from '../../hooks/useAddons';

export default function ManageAddonsModal({ subscription, onClose, onConfirm }) {
  const { addons } = useAddons();
  const currentExtraBranches = subscription?.extraBranches || 0;
  const [newExtraBranches, setNewExtraBranches] = useState(currentExtraBranches);
  
  const [formState, setFormState] = useState({
    paymentMethod: 'Bank Transfer',
    referenceId: '',
    paymentProof: null,
    notes: ''
  });
  const [formErrors, setFormErrors] = useState({});

  if (!subscription) return null;

  // Calculate Additional Quantity
  const additionalBranches = Math.max(0, newExtraBranches - currentExtraBranches);
  
  // Base Price for Addon
  const branchAddon = addons?.find(a => a.addonType === 'BRANCH');
  let PRICE_PER_BRANCH = 1500; // Fallback
  if (branchAddon) {
      PRICE_PER_BRANCH = subscription?.billingCycle === 'Annually' ? branchAddon.annualPrice : branchAddon.monthlyPrice;
  }
  
  const addonAmount = additionalBranches * PRICE_PER_BRANCH;
  
  // Mock Prorated amount (Say 50% time left for visual purposes)
  const proratedAmount = Math.floor(addonAmount * 0.5);

  const handleSubmit = () => {
    if (additionalBranches === 0) {
      alert("Please increase the number of branches to continue.");
      return;
    }
    if (formState.paymentMethod !== 'Complimentary' && !formState.referenceId) {
      setFormErrors({ referenceId: 'Reference ID is required' });
      return;
    }
    
    onConfirm({
      extraBranches: newExtraBranches,
      additionalBranches: additionalBranches,
      ...formState,
      amount: proratedAmount
    });
  };

  return (
    <div
      style={{
        position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
        background: 'rgba(9, 13, 22, 0.45)', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)',
        display: 'flex', justifyContent: 'center', alignItems: 'center',
        zIndex: 1100, padding: '20px'
      }}
      onClick={onClose}
    >
      <div
        className="animate-fade-in"
        style={{
          background: '#ffffff', borderRadius: '20px', padding: '32px',
          width: '95%', maxWidth: '500px', boxShadow: '0 20px 60px rgba(0,0,0,0.18)',
          position: 'relative', textAlign: 'left', maxHeight: '90vh', overflowY: 'auto'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid var(--border-color)', paddingBottom: '14px' }}>
          <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: '900', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Layers style={{ width: '18px', height: '18px', color: '#f59e0b' }} />
            Manage Add-ons
          </h3>
          <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }} onClick={onClose}>
            <X style={{ width: '18px', height: '18px' }} />
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: '1.4' }}>
            Add additional branches to {subscription.restaurantName}'s plan.
          </p>
          
          {/* Branch Counter */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg-app)', padding: '16px', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
            <div>
              <span style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-main)', fontWeight: '700' }}>Extra Branches</span>
              <span style={{ display: 'block', fontSize: '0.7rem', color: 'var(--text-muted)' }}>Current Extra: {currentExtraBranches} | Plan Base Limit: {subscription.maxBranches || 3}</span>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <button 
                onClick={() => setNewExtraBranches(Math.max(currentExtraBranches, newExtraBranches - 1))}
                disabled={newExtraBranches <= currentExtraBranches}
                style={{ 
                  width: '32px', height: '32px', borderRadius: '8px', 
                  background: newExtraBranches <= currentExtraBranches ? 'var(--bg-card)' : '#fff', 
                  border: '1px solid var(--border-color)', display: 'flex', justifyContent: 'center', alignItems: 'center', 
                  cursor: newExtraBranches <= currentExtraBranches ? 'not-allowed' : 'pointer',
                  color: newExtraBranches <= currentExtraBranches ? 'var(--text-muted)' : 'var(--text-main)'
                }}
              >
                <Minus style={{ width: '16px', height: '16px' }} />
              </button>
              
              <span style={{ fontSize: '1.2rem', fontWeight: '800', color: 'var(--text-main)', width: '24px', textAlign: 'center' }}>
                {newExtraBranches}
              </span>
              
              <button 
                onClick={() => setNewExtraBranches(newExtraBranches + 1)}
                style={{ 
                  width: '32px', height: '32px', borderRadius: '8px', background: '#fff', border: '1px solid var(--border-color)', 
                  display: 'flex', justifyContent: 'center', alignItems: 'center', cursor: 'pointer', color: 'var(--text-main)'
                }}
              >
                <Plus style={{ width: '16px', height: '16px' }} />
              </button>
            </div>
          </div>
          
          {/* Proration Calculation Display */}
          {additionalBranches > 0 && (
            <div style={{ background: 'rgba(245, 158, 11, 0.05)', padding: '16px', borderRadius: '12px', display: 'flex', flexDirection: 'column', gap: '8px', border: '1px solid rgba(245, 158, 11, 0.2)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: '600' }}>Additional Branches</span>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-main)', fontWeight: '700' }}>{additionalBranches} x ₹{PRICE_PER_BRANCH}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: '600' }}>Total Add-on Value</span>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-main)', fontWeight: '700' }}>₹{addonAmount.toLocaleString()}</span>
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid rgba(245, 158, 11, 0.2)', paddingTop: '8px', marginTop: '4px' }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-main)', fontWeight: '800' }}>Final Prorated Amount</span>
                <span style={{ fontSize: '0.9rem', color: '#f59e0b', fontWeight: '900' }}>₹{proratedAmount.toLocaleString()}</span>
              </div>
              <p style={{ margin: '8px 0 0 0', fontSize: '0.65rem', color: 'var(--text-muted)', fontStyle: 'italic', textAlign: 'center' }}>
                * Cost is prorated for the remaining days of the current billing cycle.
              </p>
            </div>
          )}
        </div>

        {additionalBranches > 0 && (
          <PaymentDetailsForm formState={formState} setFormState={setFormState} formErrors={formErrors} />
        )}

        <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
          <button className="btn-outline" style={{ padding: '8px 18px', borderRadius: '8px', cursor: 'pointer', fontWeight: '700', fontSize: '0.8rem' }} onClick={onClose}>
            Cancel
          </button>
          <button 
            disabled={additionalBranches === 0}
            onClick={handleSubmit} 
            style={{ 
              padding: '8px 18px', borderRadius: '8px', cursor: additionalBranches > 0 ? 'pointer' : 'not-allowed', 
              fontWeight: '700', fontSize: '0.8rem', 
              background: additionalBranches > 0 ? '#f59e0b' : 'var(--border-color)', 
              color: additionalBranches > 0 ? 'white' : 'var(--text-muted)', border: 'none' 
            }}
          >
            Confirm Add-on
          </button>
        </div>
      </div>
    </div>
  );
}
