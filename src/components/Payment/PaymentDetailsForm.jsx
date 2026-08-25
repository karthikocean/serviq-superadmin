import React, { useState } from 'react';
import { UploadCloud, Loader2 } from 'lucide-react';
import { uploadImage } from '../../services/api';

export default function PaymentDetailsForm({ formState, setFormState, formErrors }) {
  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      setIsUploading(true);
      try {
        const uploadRes = await uploadImage(file);
        // Save the returned URL in the payload
        setFormState({ ...formState, paymentProof: uploadRes.data.url, paymentProofName: file.name });
      } catch (error) {
        console.error("Upload failed", error);
        alert("Failed to upload image. Please try again.");
      } finally {
        setIsUploading(false);
      }
    }
  };

  return (
    <div style={{ marginTop: '24px', padding: '20px', background: 'var(--bg-app)', border: '1px solid var(--border-color)', borderRadius: '12px' }}>
      <h4 style={{ margin: '0 0 16px 0', fontSize: '0.95rem', fontWeight: '800', color: 'var(--text-main)' }}>Payment Details</h4>
      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
        {/* Payment Method */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <label style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-main)' }}>Payment Method <span style={{color: '#ef4444'}}>*</span></label>
          <select
            value={formState.paymentMethod || 'Bank Transfer'}
            onChange={(e) => setFormState({ ...formState, paymentMethod: e.target.value })}
            style={{
              width: '100%',
              padding: '9px 12px',
              border: formErrors?.paymentMethod ? '1.5px solid #ef4444' : '1.5px solid var(--border-color)',
              background: '#fff',
              color: 'var(--text-main)',
              borderRadius: '8px',
              fontSize: '0.82rem',
              outline: 'none',
              cursor: 'pointer'
            }}
          >
            <option value="Bank Transfer">Bank Transfer</option>
            <option value="Cash">Cash</option>
            <option value="UPI">UPI</option>
            <option value="Cheque">Cheque</option>
            <option value="Complimentary">Complimentary</option>
          </select>
          {formErrors?.paymentMethod && <span style={{ fontSize: '0.65rem', color: '#ef4444', fontWeight: '600' }}>{formErrors.paymentMethod}</span>}
        </div>

        {/* Reference ID */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <label style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-main)' }}>Reference ID (UTR / Txn ID)</label>
          <input
            type="text"
            placeholder="e.g. UTR123456789"
            value={formState.referenceId || ''}
            onChange={(e) => setFormState({ ...formState, referenceId: e.target.value })}
            disabled={formState.paymentMethod === 'Complimentary'}
            style={{
              width: '100%',
              padding: '9px 12px',
              border: '1.5px solid var(--border-color)',
              background: formState.paymentMethod === 'Complimentary' ? 'var(--bg-app)' : '#fff',
              color: 'var(--text-main)',
              borderRadius: '8px',
              fontSize: '0.82rem',
              outline: 'none'
            }}
          />
        </div>

        {/* Payment Proof Upload */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', gridColumn: '1 / -1' }}>
          <label style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-main)' }}>Payment Proof (Optional)</label>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '12px',
            padding: '12px',
            border: '1.5px dashed var(--border-color)',
            borderRadius: '8px',
            background: formState.paymentMethod === 'Complimentary' ? 'var(--bg-app)' : '#fff',
            opacity: formState.paymentMethod === 'Complimentary' ? 0.6 : 1
          }}>
            <div style={{ background: 'var(--bg-app)', padding: '8px', borderRadius: '6px' }}>
              <UploadCloud style={{ width: '18px', height: '18px', color: 'var(--text-muted)' }} />
            </div>
            <div style={{ flex: 1 }}>
              <span style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: 'var(--text-main)' }}>
                {formState.paymentProofName || 'Upload Receipt or Screenshot'}
              </span>
              <span style={{ display: 'block', fontSize: '0.65rem', color: 'var(--text-muted)' }}>JPG, PNG or PDF (Max 2MB)</span>
            </div>
            <input 
              type="file" 
              accept=".jpg,.jpeg,.png,.pdf"
              onChange={handleFileChange}
              disabled={formState.paymentMethod === 'Complimentary' || isUploading}
              style={{
                position: 'absolute',
                width: '1px',
                height: '1px',
                padding: 0,
                margin: '-1px',
                overflow: 'hidden',
                clip: 'rect(0,0,0,0)',
                border: 0
              }}
              id="payment-proof-upload"
            />
            <label 
              htmlFor="payment-proof-upload" 
              className="btn-outline" 
              style={{ 
                padding: '6px 12px', 
                fontSize: '0.75rem', 
                borderRadius: '6px', 
                cursor: (formState.paymentMethod === 'Complimentary' || isUploading) ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              {isUploading ? (
                <>
                  <Loader2 style={{ width: '14px', height: '14px', animation: 'spin 1s linear infinite' }} />
                  Uploading...
                </>
              ) : (
                'Browse'
              )}
            </label>
          </div>
        </div>

        {/* Notes */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', gridColumn: '1 / -1' }}>
          <label style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-main)' }}>Notes</label>
          <textarea
            rows="2"
            placeholder="Add any internal notes..."
            value={formState.notes || ''}
            onChange={(e) => setFormState({ ...formState, notes: e.target.value })}
            style={{
              width: '100%',
              padding: '9px 12px',
              border: '1.5px solid var(--border-color)',
              background: '#fff',
              color: 'var(--text-main)',
              borderRadius: '8px',
              fontSize: '0.82rem',
              outline: 'none',
              resize: 'none'
            }}
          />
        </div>
      </div>
    </div>
  );
}
