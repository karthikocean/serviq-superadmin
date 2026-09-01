import React, { useState } from 'react';
import { X, Edit2, Plus, Trash2, CheckCircle2 } from 'lucide-react';
import { useAddons } from '../../hooks/useAddons';
import { useAuth } from '../../contexts/AuthContext';
import CustomSelect from '../common/CustomSelect';

export default function ManageAddonsMasterModal({ onClose }) {
  const { addons, createAddon, updateAddon, deleteAddon, isLoading } = useAddons();
  const { hasPermission, isSuperOwner } = useAuth();
  const canAdd = isSuperOwner || hasPermission('plans', 'add');
  const canEdit = isSuperOwner || hasPermission('plans', 'edit');
  const canDelete = isSuperOwner || hasPermission('plans', 'delete');

  const [editingAddon, setEditingAddon] = useState(null);
  
  const [formState, setFormState] = useState({
    addonName: '',
    addonType: 'BRANCH',
    monthlyPrice: '',
    annualPrice: '',
    isActive: true
  });
  const [errors, setErrors] = useState({});

  const handleOpenEdit = (addon) => {
    setEditingAddon(addon._id);
    setFormState({
      addonName: addon.addonName,
      addonType: addon.addonType,
      monthlyPrice: addon.monthlyPrice,
      annualPrice: addon.annualPrice,
      isActive: addon.isActive
    });
    setErrors({});
  };

  const handleOpenCreate = () => {
    setEditingAddon('new');
    setFormState({
      addonName: '',
      addonType: 'BRANCH',
      monthlyPrice: '',
      annualPrice: '',
      isActive: true
    });
    setErrors({});
  };

  const handleSave = async (e) => {
    e.preventDefault();
    const newErrors = {};
    const addonName = (formState.addonName || '').trim();
    const monthlyPrice = String(formState.monthlyPrice || '').trim();
    const annualPrice = String(formState.annualPrice || '').trim();

    if (!addonName) {
      newErrors.addonName = 'Addon Name is required';
    } else if (addonName.length < 2) {
      newErrors.addonName = 'Addon Name must be at least 2 characters';
    }

    if (monthlyPrice === '') {
      newErrors.monthlyPrice = 'Monthly Price is required';
    } else if (isNaN(monthlyPrice) || Number(monthlyPrice) < 0) {
      newErrors.monthlyPrice = 'Monthly Price must be a valid positive number';
    }

    if (annualPrice === '') {
      newErrors.annualPrice = 'Annual Price is required';
    } else if (isNaN(annualPrice) || Number(annualPrice) < 0) {
      newErrors.annualPrice = 'Annual Price must be a valid positive number';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});

    if (editingAddon === 'new') {
      await createAddon(formState);
    } else {
      await updateAddon(editingAddon, formState);
    }
    setEditingAddon(null);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this add-on?")) {
      await deleteAddon(id);
    }
  };

  return (
    <div
      style={{
        position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
        background: 'rgba(9, 13, 22, 0.45)', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)',
        display: 'flex', justifyContent: 'center', alignItems: 'center',
        zIndex: 1100, padding: '20px'
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          if (editingAddon) setEditingAddon(null);
          else onClose();
        }
      }}
    >
      <div
        className="animate-fade-in"
        style={{
          background: '#ffffff', borderRadius: '20px', padding: '32px',
          width: '100%', maxWidth: '600px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)', position: 'relative',
          maxHeight: '90vh', overflowY: 'auto'
        }}
      >
        <button
          onClick={() => { if (editingAddon) setEditingAddon(null); else onClose(); }}
          style={{
            position: 'absolute', top: '24px', right: '24px',
            background: 'var(--bg-app)', border: '1px solid var(--border-color)',
            borderRadius: '50%', width: '32px', height: '32px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', color: 'var(--text-muted)'
          }}
        >
          <X size={18} />
        </button>

        <h3 style={{ margin: '0 0 24px 0', fontSize: '1.25rem', fontWeight: '900', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '8px' }}>
          Addon Management
        </h3>

        {editingAddon ? (
          <form onSubmit={handleSave} noValidate style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-main)' }}>Addon Name <span style={{ color: '#ef4444' }}>*</span></label>
              <input
                type="text"
                value={formState.addonName}
                onChange={e => {
                  setFormState({ ...formState, addonName: e.target.value });
                  if (errors.addonName) setErrors({ ...errors, addonName: '' });
                }}
                placeholder="e.g. Extra Branch Add-on"
                style={{ width: '100%', padding: '9px 12px', border: errors.addonName ? '1.5px solid #ef4444' : '1.5px solid var(--border-color)', background: errors.addonName ? 'rgba(239,68,68,0.04)' : 'var(--bg-app)', borderRadius: '8px', fontSize: '0.82rem', outline: 'none', transition: 'border-color 0.15s' }}
              />
              {errors.addonName && <span style={{ fontSize: '0.7rem', color: '#ef4444', fontWeight: '600' }}>{errors.addonName}</span>}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-main)' }}>Addon Type</label>
              <CustomSelect
                options={[
                  { value: 'BRANCH', label: 'Branch' }
                ]}
                value={formState.addonType}
                onChange={(val) => {
                  const selected = typeof val === 'object' && val !== null && val.target ? val.target.value : val
                  setFormState({ ...formState, addonType: selected })
                }}
              />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-main)' }}>Monthly Price (₹) <span style={{ color: '#ef4444' }}>*</span></label>
                <input
                  type="number"
                  min="0"
                  value={formState.monthlyPrice}
                  onChange={e => {
                    setFormState({ ...formState, monthlyPrice: e.target.value });
                    if (errors.monthlyPrice) setErrors({ ...errors, monthlyPrice: '' });
                  }}
                  placeholder="e.g. 500"
                  style={{ width: '100%', padding: '9px 12px', border: errors.monthlyPrice ? '1.5px solid #ef4444' : '1.5px solid var(--border-color)', background: errors.monthlyPrice ? 'rgba(239,68,68,0.04)' : 'var(--bg-app)', borderRadius: '8px', fontSize: '0.82rem', outline: 'none', transition: 'border-color 0.15s' }}
                />
                {errors.monthlyPrice && <span style={{ fontSize: '0.7rem', color: '#ef4444', fontWeight: '600' }}>{errors.monthlyPrice}</span>}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-main)' }}>Annual Price (₹) <span style={{ color: '#ef4444' }}>*</span></label>
                <input
                  type="number"
                  min="0"
                  value={formState.annualPrice}
                  onChange={e => {
                    setFormState({ ...formState, annualPrice: e.target.value });
                    if (errors.annualPrice) setErrors({ ...errors, annualPrice: '' });
                  }}
                  placeholder="e.g. 5000"
                  style={{ width: '100%', padding: '9px 12px', border: errors.annualPrice ? '1.5px solid #ef4444' : '1.5px solid var(--border-color)', background: errors.annualPrice ? 'rgba(239,68,68,0.04)' : 'var(--bg-app)', borderRadius: '8px', fontSize: '0.82rem', outline: 'none', transition: 'border-color 0.15s' }}
                />
                {errors.annualPrice && <span style={{ fontSize: '0.7rem', color: '#ef4444', fontWeight: '600' }}>{errors.annualPrice}</span>}
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '12px' }}>
              <input 
                type="checkbox" 
                checked={formState.isActive} onChange={e => setFormState({ ...formState, isActive: e.target.checked })} 
              />
              <label style={{ fontSize: '0.82rem', fontWeight: '700', color: 'var(--text-main)' }}>Active Status</label>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '12px' }}>
              <button type="button" onClick={() => setEditingAddon(null)} className="btn-outline" style={{ padding: '8px 16px', borderRadius: '8px' }}>Cancel</button>
              <button type="submit" className="btn-black" style={{ padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', background: '#000000', color: '#ffffff', border: 'none' }}>Save Addon</button>
            </div>
          </form>
        ) : (
          <>
            {canAdd && (
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '16px' }}>
                <button onClick={handleOpenCreate} className="btn-black" style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', background: '#000000', color: '#ffffff', border: 'none' }}>
                  <Plus size={16} /> Create Addon
                </button>
              </div>
            )}

            {isLoading ? (
              <p style={{ textAlign: 'center' }}>Loading addons...</p>
            ) : addons.length === 0 ? (
              <p style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No addons found.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {addons.map(addon => (
                  <div key={addon._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '16px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontWeight: '800', color: 'var(--text-main)' }}>{addon.addonName}</span>
                        {addon.isActive ? (
                          <span style={{ fontSize: '0.65rem', padding: '2px 6px', background: 'rgba(16,185,129,0.1)', color: '#10b981', borderRadius: '4px', fontWeight: '700' }}>Active</span>
                        ) : (
                          <span style={{ fontSize: '0.65rem', padding: '2px 6px', background: 'rgba(239,68,68,0.1)', color: '#ef4444', borderRadius: '4px', fontWeight: '700' }}>Inactive</span>
                        )}
                      </div>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Type: {addon.addonType}</span>
                      <div style={{ display: 'flex', gap: '16px', marginTop: '4px' }}>
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-main)', fontWeight: '600' }}>₹{addon.monthlyPrice} /mo</span>
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-main)', fontWeight: '600' }}>₹{addon.annualPrice} /yr</span>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      {canEdit && (
                        <button onClick={() => handleOpenEdit(addon)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--primary)' }}>
                          <Edit2 size={16} />
                        </button>
                      )}
                      {canDelete && (
                        <button onClick={() => handleDelete(addon._id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444' }}>
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
