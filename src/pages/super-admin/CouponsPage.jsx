import React, { useState } from 'react';
import { Tag, Plus, Search, Edit2, Trash2, Eye, X, ArrowLeft } from 'lucide-react';
import { TableTopControls, TableBottomPagination } from '../../components/common/TablePagination';
import CustomSelect from '../../components/common/CustomSelect';

export default function CouponsPage() {
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingCouponId, setEditingCouponId] = useState(null);
  const [viewingCouponId, setViewingCouponId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Sample data
  const [coupons, setCoupons] = useState([
    { id: 'C-01', code: 'WELCOME20', name: 'Welcome Offer', description: '20% discount for new restaurants', type: 'Percentage', value: 20, maxDiscount: 5000, minAmount: 10000, plans: ['Basic', 'Standard', 'Premium'], startDate: '2026-08-14', endDate: '2026-12-31', limit: 100, used: 45, usagePerRest: 1, usageFor: 'All Restaurants', status: 'Active' },
    { id: 'C-02', code: 'FLAT500', name: 'Festive Discount', description: 'Flat ₹500 off on Premium plan', type: 'Fixed Amount', value: 500, maxDiscount: null, minAmount: 2000, plans: ['Premium'], startDate: '2026-09-01', endDate: '2026-09-30', limit: 50, used: 50, usagePerRest: 1, usageFor: 'All Restaurants', status: 'Inactive' }
  ]);

  const defaultFormState = {
    code: '', name: '', description: '', type: 'Percentage', value: '', maxDiscount: '', minAmount: '',
    plans: [], startDate: '', endDate: '', limit: '', usagePerRest: '', usageFor: 'All Restaurants', status: 'Active'
  };

  const [formData, setFormData] = useState(defaultFormState);

  const handlePlanToggle = (plan) => {
    setFormData(prev => {
      if (prev.plans.includes(plan)) {
        return { ...prev, plans: prev.plans.filter(p => p !== plan) };
      } else {
        return { ...prev, plans: [...prev.plans, plan] };
      }
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingCouponId) {
      setCoupons(prev => prev.map(c => c.id === editingCouponId ? { ...c, ...formData } : c));
    } else {
      const newCoupon = { id: `C-${String(coupons.length + 1).padStart(2, '0')}`, ...formData, used: 0 };
      setCoupons([newCoupon, ...coupons]);
    }
    setShowAddModal(false);
    setEditingCouponId(null);
  };

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this coupon?")) {
      setCoupons(prev => prev.filter(c => c.id !== id));
    }
  };

  const handleEdit = (coupon) => {
    setFormData({ ...coupon });
    setEditingCouponId(coupon.id);
  };

  const filteredCoupons = coupons.filter(c => 
    c.code.toLowerCase().includes(searchQuery.toLowerCase()) || 
    c.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const activeCoupon = viewingCouponId ? coupons.find(c => c.id === viewingCouponId) : null;

  return (
    <div style={{ width: '100%' }}>
      {showAddModal || editingCouponId ? (
        <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '1000px', margin: '0 auto', width: '100%' }}>
          <div className="glass-card" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '16px', overflow: 'hidden' }}>
            
            {/* Header */}
            <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '16px' }}>
              <button 
                type="button" 
                onClick={() => { setShowAddModal(false); setEditingCouponId(null); }}
                style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '8px', borderRadius: '50%', transition: 'background 0.2s' }}
                onMouseOver={(e) => e.currentTarget.style.background = 'rgba(0,0,0,0.05)'}
                onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
              >
                <ArrowLeft size={20} />
              </button>
              <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(249, 94, 16, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#F95E10' }}>
                <Tag size={18} />
              </div>
              <div>
                <h2 style={{ margin: 0, fontSize: '1.1rem', fontWeight: '800', color: 'var(--text-main)' }}>
                  {editingCouponId ? 'EDIT COUPON' : 'CREATE COUPON'}
                </h2>
                <p style={{ margin: '4px 0 0 0', fontSize: '0.8rem', color: 'var(--text-muted)' }}>Configure promotional codes and discounts for restaurants.</p>
              </div>
            </div>

            {/* Form Body */}
            <div style={{ padding: '24px' }}>
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                
                {/* Row 1 */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--text-main)' }}>Coupon Code <span style={{ color: '#ef4444' }}>*</span></label>
                    <input 
                      type="text" 
                      name="code"
                      value={formData.code}
                      onChange={handleChange}
                      placeholder="e.g. WELCOME20" 
                      required
                      style={{ padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-app)', color: 'var(--text-main)', fontSize: '0.85rem', outline: 'none', textTransform: 'uppercase' }}
                    />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--text-main)' }}>Coupon Name <span style={{ color: '#ef4444' }}>*</span></label>
                    <input 
                      type="text" 
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="e.g. Welcome Offer" 
                      required
                      style={{ padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-app)', color: 'var(--text-main)', fontSize: '0.85rem', outline: 'none' }}
                    />
                  </div>
                </div>

                {/* Row 2 */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--text-main)' }}>Description</label>
                  <textarea 
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="20% discount for new restaurants..." 
                    rows="3"
                    style={{ padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-app)', color: 'var(--text-main)', fontSize: '0.85rem', outline: 'none', resize: 'vertical' }}
                  />
                </div>

                {/* Row 3 */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--text-main)' }}>Discount Type <span style={{ color: '#ef4444' }}>*</span></label>
                    <CustomSelect 
                      options={['Percentage', 'Fixed Amount']}
                      value={formData.type}
                      onChange={(val) => handleChange({ target: { name: 'type', value: val }})}
                      placeholder="Select Type..."
                    />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--text-main)' }}>Discount Value <span style={{ color: '#ef4444' }}>*</span></label>
                    <input 
                      type="number" 
                      name="value"
                      value={formData.value}
                      onChange={handleChange}
                      placeholder="e.g. 20" 
                      min="0"
                      onKeyDown={(e) => ['-', '+', 'e', 'E'].includes(e.key) && e.preventDefault()}
                      required
                      style={{ padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-app)', color: 'var(--text-main)', fontSize: '0.85rem', outline: 'none' }}
                    />
                  </div>
                </div>

                {/* Row 4 */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--text-main)' }}>Maximum Discount</label>
                    <input 
                      type="number" 
                      name="maxDiscount"
                      value={formData.maxDiscount}
                      onChange={handleChange}
                      placeholder="e.g. 5000"
                      min="0"
                      onKeyDown={(e) => ['-', '+', 'e', 'E'].includes(e.key) && e.preventDefault()} 
                      style={{ padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-app)', color: 'var(--text-main)', fontSize: '0.85rem', outline: 'none' }}
                    />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--text-main)' }}>Minimum Amount</label>
                    <input 
                      type="number" 
                      name="minAmount"
                      value={formData.minAmount}
                      onChange={handleChange}
                      placeholder="e.g. 10000"
                      min="0"
                      onKeyDown={(e) => ['-', '+', 'e', 'E'].includes(e.key) && e.preventDefault()} 
                      style={{ padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-app)', color: 'var(--text-main)', fontSize: '0.85rem', outline: 'none' }}
                    />
                  </div>
                </div>

                {/* Applicable Plans */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--text-main)' }}>Applicable Plans <span style={{ color: '#ef4444' }}>*</span></label>
                  <CustomSelect 
                    options={['Basic', 'Standard', 'Premium']}
                    value={formData.plans}
                    onChange={(val) => setFormData(p => ({ ...p, plans: val }))}
                    isMulti={true}
                    placeholder="Select Applicable Plans..."
                  />
                </div>

                {/* Row 5 */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--text-main)' }}>Start Date <span style={{ color: '#ef4444' }}>*</span></label>
                    <input 
                      type="date" 
                      name="startDate"
                      value={formData.startDate}
                      onChange={handleChange}
                      required
                      style={{ padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-app)', color: 'var(--text-main)', fontSize: '0.85rem', outline: 'none' }}
                    />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--text-main)' }}>End Date <span style={{ color: '#ef4444' }}>*</span></label>
                    <input 
                      type="date" 
                      name="endDate"
                      value={formData.endDate}
                      onChange={handleChange}
                      required
                      style={{ padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-app)', color: 'var(--text-main)', fontSize: '0.85rem', outline: 'none' }}
                    />
                  </div>
                </div>

                {/* Row 6 */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--text-main)' }}>Total Usage Limit</label>
                    <input 
                      type="number" 
                      name="limit"
                      value={formData.limit}
                      onChange={handleChange}
                      placeholder="e.g. 100"
                      min="0"
                      onKeyDown={(e) => ['-', '+', 'e', 'E'].includes(e.key) && e.preventDefault()} 
                      style={{ padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-app)', color: 'var(--text-main)', fontSize: '0.85rem', outline: 'none' }}
                    />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--text-main)' }}>Usage/Restaurant</label>
                    <input 
                      type="number" 
                      name="usagePerRest"
                      value={formData.usagePerRest}
                      onChange={handleChange}
                      placeholder="e.g. 1"
                      min="0"
                      onKeyDown={(e) => ['-', '+', 'e', 'E'].includes(e.key) && e.preventDefault()} 
                      style={{ padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-app)', color: 'var(--text-main)', fontSize: '0.85rem', outline: 'none' }}
                    />
                  </div>
                </div>

                {/* Usage For & Status */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--text-main)' }}>Usage For</label>
                    <CustomSelect 
                      options={['All Restaurants', 'Specific Restaurants']}
                      value={formData.usageFor}
                      onChange={(val) => handleChange({ target: { name: 'usageFor', value: val }})}
                      placeholder="Select Usage..."
                    />
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <label style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--text-main)' }}>Status</label>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }} onClick={() => setFormData(p => ({ ...p, status: p.status === 'Active' ? 'Inactive' : 'Active' }))}>
                      <div style={{ 
                        width: '36px', height: '20px', borderRadius: '20px', 
                        background: formData.status === 'Active' ? '#10b981' : 'var(--border-color)',
                        position: 'relative', transition: 'all 0.2s'
                      }}>
                        <div style={{ 
                          width: '16px', height: '16px', borderRadius: '50%', background: '#fff',
                          position: 'absolute', top: '2px', left: formData.status === 'Active' ? '18px' : '2px',
                          transition: 'all 0.2s'
                        }}></div>
                      </div>
                      <span style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-main)' }}>
                        {formData.status}
                      </span>
                    </div>
                  </div>
                </div>

                <hr style={{ border: 'none', borderTop: '1px solid var(--border-color)', margin: '10px 0' }} />

                {/* Actions */}
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                  <button 
                    type="button" 
                    onClick={() => {
                      setShowAddModal(false);
                      setEditingCouponId(null);
                    }}
                    style={{
                      padding: '10px 20px',
                      borderRadius: '8px',
                      background: 'transparent',
                      border: '1px solid var(--border-color)',
                      color: 'var(--text-main)',
                      fontWeight: '600',
                      fontSize: '0.85rem',
                      cursor: 'pointer'
                    }}
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    style={{
                      padding: '10px 24px',
                      borderRadius: '8px',
                      background: '#000000',
                      border: 'none',
                      color: '#ffffff',
                      fontWeight: '700',
                      fontSize: '0.85rem',
                      cursor: 'pointer'
                    }}
                  >
                    {editingCouponId ? 'Save Changes' : 'Create Coupon'}
                  </button>
                </div>

              </form>
            </div>
          </div>
        </div>
      ) : viewingCouponId ? (
        <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '800px', margin: '0 auto', width: '100%' }}>
          <div className="glass-card" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '16px', overflow: 'hidden' }}>
            <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(249, 94, 16, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#F95E10' }}>
                  <Tag size={18} />
                </div>
                <div>
                  <h2 style={{ margin: 0, fontSize: '1.1rem', fontWeight: '800', color: 'var(--text-main)' }}>COUPON DETAILS</h2>
                  <p style={{ margin: '4px 0 0 0', fontSize: '0.8rem', color: 'var(--text-muted)' }}>{activeCoupon?.code}</p>
                </div>
              </div>
              <button 
                onClick={() => setViewingCouponId(null)}
                style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
              >
                <X size={20} />
              </button>
            </div>

            <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <div>
                  <p style={{ margin: '0 0 4px 0', fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '700' }}>COUPON NAME</p>
                  <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-main)', fontWeight: '600' }}>{activeCoupon?.name}</p>
                </div>
                <div>
                  <p style={{ margin: '0 0 4px 0', fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '700' }}>DESCRIPTION</p>
                  <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-main)', fontWeight: '600' }}>{activeCoupon?.description || '-'}</p>
                </div>
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <div>
                  <p style={{ margin: '0 0 4px 0', fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '700' }}>DISCOUNT TYPE</p>
                  <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-main)', fontWeight: '600' }}>{activeCoupon?.type}</p>
                </div>
                <div>
                  <p style={{ margin: '0 0 4px 0', fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '700' }}>DISCOUNT VALUE</p>
                  <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-main)', fontWeight: '600' }}>{activeCoupon?.type === 'Percentage' ? `${activeCoupon?.value}%` : `₹${activeCoupon?.value}`}</p>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <div>
                  <p style={{ margin: '0 0 4px 0', fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '700' }}>VALIDITY</p>
                  <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-main)', fontWeight: '600' }}>{activeCoupon?.startDate} to {activeCoupon?.endDate}</p>
                </div>
                <div>
                  <p style={{ margin: '0 0 4px 0', fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '700' }}>APPLICABLE PLANS</p>
                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '4px' }}>
                    {activeCoupon?.plans?.map(p => (
                       <span key={p} style={{ padding: '2px 8px', borderRadius: '4px', background: 'var(--bg-app)', border: '1px solid var(--border-color)', fontSize: '0.75rem', fontWeight: '600' }}>{p}</span>
                    ))}
                  </div>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <div>
                  <p style={{ margin: '0 0 4px 0', fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '700' }}>USAGE</p>
                  <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-main)', fontWeight: '600' }}>{activeCoupon?.used} / {activeCoupon?.limit || '∞'}</p>
                </div>
                <div>
                  <p style={{ margin: '0 0 4px 0', fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '700' }}>STATUS</p>
                  <span style={{
                    display: 'inline-block',
                    padding: '4px 10px',
                    borderRadius: '6px',
                    fontSize: '0.75rem',
                    fontWeight: '800',
                    background: activeCoupon?.status === 'Active' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                    color: activeCoupon?.status === 'Active' ? '#10b981' : '#ef4444',
                    marginTop: '4px'
                  }}>
                    {activeCoupon?.status}
                  </span>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '10px' }}>
                <button 
                  onClick={() => { setViewingCouponId(null); handleEdit(activeCoupon); }}
                  style={{ padding: '8px 20px', background: 'var(--primary, #f95e10)', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '700', fontSize: '0.85rem' }}
                >
                  Edit Coupon
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', alignItems: 'stretch' }} className="animate-fade-in">
          
          {/* Main Table View */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', background: 'var(--bg-card)', padding: '24px', borderRadius: '16px', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-sm)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ margin: '4px 0 0 0', fontSize: '1.2rem', fontWeight: '900', color: 'var(--text-main)' }}>Coupons Management</h3>
              </div>
              <button
                onClick={() => {
                  setFormData(defaultFormState);
                  setShowAddModal(true);
                }}
                className="btn-black"
                style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', background: '#000', color: '#fff', border: 'none' }}
              >
                <Plus style={{ width: '16px', height: '16px' }} /> Create Coupon
              </button>
            </div>
            
            <div style={{ borderTop: '1px solid var(--border-color)', margin: '4px 0' }}></div>

            <TableTopControls
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              placeholder="Search coupon code or name..."
            />

            <div style={{ overflowX: 'auto', background: 'var(--bg-app)', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: 'rgba(255,255,255,0.02)' }}>
                    <th style={{ textAlign: 'left', padding: '12px 18px', fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '800' }}>Coupon Code</th>
                    <th style={{ textAlign: 'left', padding: '12px 18px', fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '800' }}>Discount</th>
                    <th style={{ textAlign: 'left', padding: '12px 18px', fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '800' }}>Valid Until</th>
                    <th style={{ textAlign: 'center', padding: '12px 18px', fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '800' }}>Usage</th>
                    <th style={{ textAlign: 'center', padding: '12px 18px', fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '800' }}>Status</th>
                    <th style={{ textAlign: 'right', padding: '12px 18px', fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '800' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCoupons.map((coupon) => (
                    <tr key={coupon.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                      <td style={{ padding: '14px 18px' }}>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                          <span style={{ fontSize: '0.85rem', color: 'var(--text-main)', fontWeight: '800', textTransform: 'uppercase' }}>{coupon.code}</span>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{coupon.name}</span>
                        </div>
                      </td>
                      <td style={{ padding: '14px 18px', fontSize: '0.8rem', color: 'var(--text-main)', fontWeight: '700' }}>
                        {coupon.type === 'Percentage' ? `${coupon.value}%` : `₹${coupon.value}`}
                      </td>
                      <td style={{ padding: '14px 18px', fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: '600' }}>
                        {coupon.endDate}
                      </td>
                      <td style={{ padding: '14px 18px', textAlign: 'center', fontSize: '0.8rem', color: 'var(--text-main)', fontWeight: '700' }}>
                        {coupon.used} / {coupon.limit || '∞'}
                      </td>
                      <td style={{ padding: '14px 18px', textAlign: 'center' }}>
                        <span style={{
                          padding: '4px 10px',
                          borderRadius: '6px',
                          fontSize: '0.7rem',
                          fontWeight: '800',
                          background: coupon.status === 'Active' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                          color: coupon.status === 'Active' ? '#10b981' : '#ef4444'
                        }}>
                          {coupon.status}
                        </span>
                      </td>
                      <td style={{ padding: '14px 18px', textAlign: 'right' }}>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                          <button onClick={() => setViewingCouponId(coupon.id)} style={{ background: 'transparent', border: 'none', color: '#3b82f6', cursor: 'pointer', padding: '4px' }}>
                            <Eye size={16} />
                          </button>
                          <button onClick={() => handleEdit(coupon)} style={{ background: 'transparent', border: 'none', color: '#10b981', cursor: 'pointer', padding: '4px' }}>
                            <Edit2 size={16} />
                          </button>
                          <button onClick={() => handleDelete(coupon.id)} style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '4px' }}>
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filteredCoupons.length === 0 && (
                    <tr>
                      <td colSpan="6" style={{ padding: '30px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                        No coupons found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <TableBottomPagination
              currentPage={1}
              totalPages={1}
              totalItems={filteredCoupons.length}
              itemsPerPage={10}
            />

          </div>
        </div>
      )}
    </div>
  );
}
