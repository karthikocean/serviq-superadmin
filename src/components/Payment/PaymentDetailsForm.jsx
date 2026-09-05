import React, { useState, useRef } from 'react';
import { UploadCloud, Loader2 } from 'lucide-react';
import { uploadImage } from '../../services/api';
import CustomSelect from '../common/CustomSelect';

export default function PaymentDetailsForm({ formState, setFormState, formErrors }) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const fileInputRef = useRef(null);

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      const allowedMimes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
      const allowedExtensions = /\.(jpe?g|png|pdf)$/i;

      if (!allowedMimes.includes(file.type) && !allowedExtensions.test(file.name)) {
        setUploadError('Invalid file format. Please select a JPG, PNG, or PDF file.');
        e.target.value = '';
        return;
      }

      if (file.size > 2 * 1024 * 1024) {
        setUploadError('File size exceeds 2MB limit. Please upload a smaller file.');
        e.target.value = '';
        return;
      }

      setUploadError('');
      setIsUploading(true);
      try {
        const uploadRes = await uploadImage(file);
        // Save the returned URL in the payload
        const url = uploadRes?.data?.url || uploadRes?.url || '';
        setFormState({ ...formState, paymentProof: url, paymentProofName: file.name });
      } catch (error) {
        console.error("Upload failed", error);
        setUploadError('Failed to upload file. Please try again.');
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
          <CustomSelect
            options={[
              { value: 'Bank Transfer', label: 'Bank Transfer' },
              { value: 'Cash', label: 'Cash' },
              { value: 'UPI', label: 'UPI' },
              { value: 'Cheque', label: 'Cheque' },
              { value: 'Complimentary', label: 'Complimentary' }
            ]}
            value={formState.paymentMethod || 'Bank Transfer'}
            onChange={(val) => {
              const selected = typeof val === 'object' && val !== null && val.target ? val.target.value : val
              setFormState({ ...formState, paymentMethod: selected })
            }}
            error={formErrors?.paymentMethod}
            placeholder="Select Payment Method"
          />
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
              ref={fileInputRef}
              type="file" 
              accept=".jpg,.jpeg,.png,.pdf"
              onChange={handleFileChange}
              disabled={formState.paymentMethod === 'Complimentary' || isUploading}
              style={{ display: 'none' }}
            />
            <button 
              type="button"
              onClick={() => fileInputRef.current?.click()}
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
            </button>
          </div>
          {uploadError && <span style={{ fontSize: '0.7rem', color: '#ef4444', fontWeight: '600', marginTop: '4px' }}>{uploadError}</span>}
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
