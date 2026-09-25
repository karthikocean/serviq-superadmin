import React, { useState, useEffect } from 'react';
import { Tag, Plus, Search, Edit2, Trash2, Eye, X, ArrowLeft, AlertCircle, CheckCircle2, Lock, Unlock } from 'lucide-react';
import { TableTopControls, TableBottomPagination } from '../../components/common/TablePagination';
import CustomSelect from '../../components/common/CustomSelect';
import { getCouponsApi, createCouponApi, updateCouponApi, deleteCouponApi } from '../../services/couponService';
import { getAllPlansApi } from '../../services/planService';
import { useAuth } from '../../contexts/AuthContext';
import { formatDate } from '../../utils/dateFormat';

export default function CouponsPage() {
  const { hasPermission, isSuperOwner } = useAuth();
  const canAdd = isSuperOwner || hasPermission('coupons', 'add');
  const canEdit = isSuperOwner || hasPermission('coupons', 'edit');
  const canDelete = isSuperOwner || hasPermission('coupons', 'delete');
  const canView = isSuperOwner || hasPermission('coupons', 'view');

  const [showAddModal, setShowAddModal] = useState(false);
  const [editingCouponId, setEditingCouponId] = useState(null);
  const [viewingCouponId, setViewingCouponId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  const [errors, setErrors] = useState({});

  const [availablePlans, setAvailablePlans] = useState([]);

  const [coupons, setCoupons] = useState([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const defaultFormState = {
    code: '', name: '', description: '', type: 'Percentage', value: '', maxDiscount: '', minAmount: '',
    plans: [], startDate: '', endDate: '', limit: '', usagePerRest: '', status: 'Active'
  };

  const [formData, setFormData] = useState(defaultFormState);
  const [toast, setToast] = useState(null);
  const [confirmModal, setConfirmModal] = useState(null);

  const showToast = (type, message) => {
    setToast({ type, message });
    setTimeout(() => {
      setToast((current) => (current?.message === message ? null : current));
    }, 4000);
  };

  const cleanErrorMessage = (err, defaultMsg = "An error occurred") => {
    if (!err) return defaultMsg;
    let rawStr = "";
    if (typeof err === "string") {
      rawStr = err;
    } else if (typeof err === "object") {
      rawStr = err.response?.data?.message || err.response?.data?.error || err.message || JSON.stringify(err);
    }
    if (!rawStr || typeof rawStr !== "string") return defaultMsg;
    
    if (rawStr.includes("<") && rawStr.includes(">")) {
      try {
        const doc = new DOMParser().parseFromString(rawStr, "text/html");
        const text = doc.body.textContent || doc.body.innerText || "";
        if (text.trim()) {
          const firstLine = text.trim().split("\n").map(s => s.trim()).filter(Boolean)[0] || defaultMsg;
          return firstLine.length > 150 ? firstLine.slice(0, 150) + "..." : firstLine;
        }
      } catch (e) {
        const stripped = rawStr.replace(/<[^>]*>?/gm, "").trim();
        if (stripped) return stripped.length > 150 ? stripped.slice(0, 150) + "..." : stripped;
      }
    }
    return rawStr;
  };

  const [isServerPaginated, setIsServerPaginated] = useState(false);

  const fetchCoupons = async () => {
    try {
      const data = await getCouponsApi(currentPage, itemsPerPage, searchQuery);
      if (data && (data.success || Array.isArray(data.data) || Array.isArray(data))) {
        const list = Array.isArray(data.data) ? data.data : Array.isArray(data) ? data : [];
        const formattedData = list.map(c => ({
          ...c,
          id: c._id,
          startDate: c.startDate ? new Date(c.startDate).toISOString().split('T')[0] : '',
          endDate: c.endDate ? new Date(c.endDate).toISOString().split('T')[0] : '',
          plans: c.plans || []
        }));
        setCoupons(formattedData);
        
        const rawCount = data.pagination?.totalItems 
          ?? data.total 
          ?? data.totalCount 
          ?? data.totalItems
          ?? data.count 
          ?? data.totalRecords;

        const total = rawCount !== undefined && rawCount !== null ? Number(rawCount) : (list.length > 0 ? list.length : 0);
        setTotalItems(total);

        const serverPaginated = data.totalPages !== undefined || (rawCount !== undefined && Number(rawCount) > list.length);
        setIsServerPaginated(serverPaginated);

        const pages = data.totalPages || Math.ceil(total / itemsPerPage) || 1;
        setTotalPages(pages);
      }
    } catch (error) {
      console.error("Error fetching coupons:", error);
    }
  };

  useEffect(() => {
    setCurrentPage(0);
  }, [searchQuery]);

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const data = await getAllPlansApi(0, 100);
        if (data.success) {
          const mappedPlans = data.data.map(p => ({ label: p.planName, value: p._id }));
          setAvailablePlans(mappedPlans);
        }
      } catch (error) {
        console.error("Error fetching plans:", error);
      }
    };
    fetchPlans();
  }, []);

  useEffect(() => {
    fetchCoupons();
  }, [currentPage, itemsPerPage, searchQuery]);



  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const validateForm = () => {
    const errs = {};
    if (!formData.code.trim()) errs.code = 'Coupon Code is required';
    if (!formData.name.trim()) errs.name = 'Coupon Name is required';
    if (!formData.type) errs.type = 'Discount Type is required';
    if (!formData.value) errs.value = 'Discount Value is required';
    if (!formData.plans || formData.plans.length === 0) errs.plans = 'At least one Applicable Plan is required';
    if (!formData.startDate) errs.startDate = 'Start Date is required';
    if (!formData.endDate) errs.endDate = 'End Date is required';
    
    if (formData.startDate && formData.endDate && new Date(formData.startDate) > new Date(formData.endDate)) {
      errs.endDate = 'End Date must be after Start Date';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    try {
      const rawPlans = Array.isArray(formData.plans) 
        ? formData.plans 
        : typeof formData.plans === 'object' && formData.plans !== null && formData.plans.target 
          ? formData.plans.target.value 
          : [];

      const cleanPlans = (Array.isArray(rawPlans) ? rawPlans : [])
        .map(p => typeof p === 'object' && p !== null ? (p._id || p.value || p) : p)
        .filter(Boolean);

      const rawType = typeof formData.type === 'object' && formData.type !== null && formData.type.target
        ? formData.type.target.value
        : formData.type;

      const payload = {
        code: formData.code?.trim().toUpperCase(),
        name: formData.name?.trim(),
        description: formData.description?.trim(),
        type: rawType,
        value: Number(formData.value) || 0,
        maxDiscount: formData.maxDiscount !== '' && formData.maxDiscount !== null ? Number(formData.maxDiscount) : undefined,
        minAmount: formData.minAmount !== '' && formData.minAmount !== null ? Number(formData.minAmount) : 0,
        plans: cleanPlans,
        startDate: formData.startDate,
        endDate: formData.endDate,
        limit: formData.limit !== '' && formData.limit !== null ? Number(formData.limit) : undefined,
        usagePerRest: formData.usagePerRest !== '' && formData.usagePerRest !== null ? Number(formData.usagePerRest) : undefined,
        status: formData.status || 'Active'
      };
      
      let data;
      if (editingCouponId) {
        data = await updateCouponApi(editingCouponId, payload);
      } else {
        data = await createCouponApi(payload);
      }
      
      if (data.success) {
        showToast("success", editingCouponId ? "Coupon updated successfully!" : "Coupon created successfully!");
        fetchCoupons();
        setShowAddModal(false);
        setEditingCouponId(null);
        setFormData(defaultFormState);
      } else {
        showToast("error", cleanErrorMessage(data.message, "Failed to save coupon"));
      }
    } catch (error) {
      console.error("Error saving coupon:", error);
      showToast("error", cleanErrorMessage(error, "Failed to save coupon"));
    }
  };

  const handleDelete = (coupon) => {
    const couponId = typeof coupon === 'object' && coupon !== null ? coupon.id : coupon;
    const couponCode = typeof coupon === 'object' && coupon !== null ? coupon.code : '';
    setConfirmModal({
      title: "Are you sure you want to delete?",
      message: couponCode ? `Are you sure you want to delete coupon "${couponCode}"? This action cannot be undone.` : "Are you sure you want to delete this coupon? This action cannot be undone.",
      onConfirm: async () => {
        try {
          const data = await deleteCouponApi(couponId);
          if (data.success) {
            showToast("success", "Coupon deleted successfully!");
            fetchCoupons();
          } else {
            showToast("error", cleanErrorMessage(data.message, "Failed to delete coupon"));
          }
        } catch (error) {
          console.error("Error deleting coupon:", error);
          showToast("error", cleanErrorMessage(error, "Failed to delete coupon"));
        }
      }
    });
  };

  const handleToggleCouponStatus = async (coupon) => {
    const couponId = coupon.id || coupon._id;
    const nextStatus = coupon.status === 'Active' ? 'Inactive' : 'Active';
    try {
      const payload = {
        code: coupon.code,
        discountType: coupon.discountType || 'PERCENTAGE',
        discountValue: Number(coupon.discountValue || 0),
        status: nextStatus,
        isActive: nextStatus === 'Active'
      };
      const data = await updateCouponApi(couponId, payload);
      if (data && data.success !== false) {
        showToast(nextStatus === 'Active' ? 'success' : 'error', `Coupon "${coupon.code}" status updated to ${nextStatus.toUpperCase()}!`);
        fetchCoupons();
      }
    } catch (error) {
      console.error("Error updating coupon status:", error);
      showToast("error", cleanErrorMessage(error, "Failed to update status"));
    }
  };

  const handleEdit = (coupon) => {
    setFormData({ 
      ...coupon,
      startDate: coupon.startDate ? new Date(coupon.startDate).toISOString().split('T')[0] : '',
      endDate: coupon.endDate ? new Date(coupon.endDate).toISOString().split('T')[0] : '',
      plans: coupon.plans ? coupon.plans.map(p => typeof p === 'object' ? p._id : p) : []
    });
    setEditingCouponId(coupon.id);
    setShowAddModal(true);
  };

  const activeCoupon = viewingCouponId ? coupons.find(c => c.id === viewingCouponId) : null;

  const filteredCoupons = searchQuery && !isServerPaginated
    ? coupons.filter(c => 
        (c.code && c.code.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (c.name && c.name.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    : coupons;

  const currentCount = isServerPaginated ? totalItems : filteredCoupons.length;

  const displayCoupons = isServerPaginated 
    ? coupons 
    : filteredCoupons.slice(currentPage * itemsPerPage, (currentPage + 1) * itemsPerPage);

  return (
    <div style={{ width: '100%' }}>
      {showAddModal || editingCouponId ? (
        <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '1000px', margin: '0 auto', width: '100%' }}>
          <div className="glass-card" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '16px', overflow: 'hidden' }}>
            
            {/* Header */}
            <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '16px' }}>
              <button 
                type="button" 
                onClick={() => { setShowAddModal(false); setEditingCouponId(null); setErrors({}); }}
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
                      style={{ padding: '10px 14px', borderRadius: '8px', border: errors.code ? '1.5px solid #ef4444' : '1px solid var(--border-color)', background: errors.code ? 'rgba(239,68,68,0.04)' : 'var(--bg-app)', color: 'var(--text-main)', fontSize: '0.85rem', outline: 'none', textTransform: 'uppercase', transition: 'border-color 0.15s' }}
                    />
                    {errors.code && <span style={{ fontSize: '0.7rem', color: '#ef4444', fontWeight: '600' }}>{errors.code}</span>}
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--text-main)' }}>Coupon Name <span style={{ color: '#ef4444' }}>*</span></label>
                    <input 
                      type="text" 
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="e.g. Welcome Offer" 
                      style={{ padding: '10px 14px', borderRadius: '8px', border: errors.name ? '1.5px solid #ef4444' : '1px solid var(--border-color)', background: errors.name ? 'rgba(239,68,68,0.04)' : 'var(--bg-app)', color: 'var(--text-main)', fontSize: '0.85rem', outline: 'none', transition: 'border-color 0.15s' }}
                    />
                    {errors.name && <span style={{ fontSize: '0.7rem', color: '#ef4444', fontWeight: '600' }}>{errors.name}</span>}
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
                    <div style={{ border: errors.type ? '1.5px solid #ef4444' : 'none', borderRadius: '8px', transition: 'border-color 0.15s' }}>
                      <CustomSelect 
                        options={['Percentage', 'Fixed Amount']}
                        value={formData.type}
                        onChange={(val) => { 
                          const selected = typeof val === 'object' && val !== null && val.target ? val.target.value : val;
                          setFormData(p => ({ ...p, type: selected })); 
                          if(errors.type) setErrors(p=>({...p, type: ''})); 
                        }}
                        placeholder="Select Type..."
                      />
                    </div>
                    {errors.type && <span style={{ fontSize: '0.7rem', color: '#ef4444', fontWeight: '600' }}>{errors.type}</span>}
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
                      style={{ padding: '10px 14px', borderRadius: '8px', border: errors.value ? '1.5px solid #ef4444' : '1px solid var(--border-color)', background: errors.value ? 'rgba(239,68,68,0.04)' : 'var(--bg-app)', color: 'var(--text-main)', fontSize: '0.85rem', outline: 'none', transition: 'border-color 0.15s' }}
                    />
                    {errors.value && <span style={{ fontSize: '0.7rem', color: '#ef4444', fontWeight: '600' }}>{errors.value}</span>}
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
                  <div style={{ border: errors.plans ? '1.5px solid #ef4444' : 'none', borderRadius: '8px', transition: 'border-color 0.15s' }}>
                    <CustomSelect 
                      options={availablePlans}
                      value={formData.plans}
                      onChange={(val) => { 
                        const selected = typeof val === 'object' && val !== null && val.target ? val.target.value : val;
                        const plansArray = Array.isArray(selected) ? selected : [selected].filter(Boolean);
                        setFormData(p => ({ ...p, plans: plansArray })); 
                        if(errors.plans) setErrors(p=>({...p, plans: ''})); 
                      }}
                      isMulti={true}
                      placeholder="Select Applicable Plans..."
                    />
                  </div>
                  {errors.plans && <span style={{ fontSize: '0.7rem', color: '#ef4444', fontWeight: '600' }}>{errors.plans}</span>}
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
                      style={{ padding: '10px 14px', borderRadius: '8px', border: errors.startDate ? '1.5px solid #ef4444' : '1px solid var(--border-color)', background: errors.startDate ? 'rgba(239,68,68,0.04)' : 'var(--bg-app)', color: 'var(--text-main)', fontSize: '0.85rem', outline: 'none', transition: 'border-color 0.15s' }}
                    />
                    {errors.startDate && <span style={{ fontSize: '0.7rem', color: '#ef4444', fontWeight: '600' }}>{errors.startDate}</span>}
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--text-main)' }}>End Date <span style={{ color: '#ef4444' }}>*</span></label>
                    <input 
                      type="date" 
                      name="endDate"
                      value={formData.endDate}
                      onChange={handleChange}
                      style={{ padding: '10px 14px', borderRadius: '8px', border: errors.endDate ? '1.5px solid #ef4444' : '1px solid var(--border-color)', background: errors.endDate ? 'rgba(239,68,68,0.04)' : 'var(--bg-app)', color: 'var(--text-main)', fontSize: '0.85rem', outline: 'none', transition: 'border-color 0.15s' }}
                    />
                    {errors.endDate && <span style={{ fontSize: '0.7rem', color: '#ef4444', fontWeight: '600' }}>{errors.endDate}</span>}
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

                {/* Status */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
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
                      setErrors({});
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
                  <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-main)', fontWeight: '600' }}>{formatDate(activeCoupon?.startDate)} to {formatDate(activeCoupon?.endDate)}</p>
                </div>
                <div>
                  <p style={{ margin: '0 0 4px 0', fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '700' }}>APPLICABLE PLANS</p>
                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '4px' }}>
                    {activeCoupon?.plans?.map(p => {
                       const planId = typeof p === 'object' && p !== null ? p._id : p;
                       const planName = typeof p === 'object' && p !== null ? (p.planName || p.name || p.label || p._id) : (availablePlans.find(ap => ap.value === p)?.label || p);
                       return <span key={planId} style={{ padding: '2px 8px', borderRadius: '4px', background: 'var(--bg-app)', border: '1px solid var(--border-color)', fontSize: '0.75rem', fontWeight: '600' }}>{planName}</span>
                    })}
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
              {canAdd && (
                <button
                  onClick={() => {
                    setFormData(defaultFormState);
                    setErrors({});
                    setShowAddModal(true);
                  }}
                  className="btn-black"
                  style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', background: '#000', color: '#fff', border: 'none' }}
                >
                  <Plus style={{ width: '16px', height: '16px' }} /> Create Coupon
                </button>
              )}
            </div>
            
            <div style={{ borderTop: '1px solid var(--border-color)', margin: '4px 0' }}></div>

            <TableTopControls
              entriesPerPage={itemsPerPage}
              onEntriesPerPageChange={(newLimit) => {
                setItemsPerPage(newLimit);
                setCurrentPage(0);
              }}
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
                    <th style={{ textAlign: 'left', padding: '12px 18px', fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '800' }}>Plans</th>
                    <th style={{ textAlign: 'center', padding: '12px 18px', fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '800' }}>Usage</th>
                    <th style={{ textAlign: 'center', padding: '12px 18px', fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '800' }}>Status</th>
                    <th style={{ textAlign: 'right', padding: '12px 18px', fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '800' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {displayCoupons.map((coupon) => (
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
                        {formatDate(coupon.endDate)}
                      </td>
                      <td style={{ padding: '14px 18px' }}>
                        {coupon.plans && coupon.plans.length > 0 ? (
                          <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                            {coupon.plans.map(p => {
                              const planId = typeof p === 'object' && p !== null ? p._id : p;
                              const planName = typeof p === 'object' && p !== null ? (p.planName || p.name || p.label || p._id) : (availablePlans.find(ap => ap.value === p)?.label || p);
                              return <span key={planId} style={{ fontSize: '0.65rem', padding: '2px 6px', borderRadius: '4px', background: 'rgba(249, 94, 16, 0.1)', color: '#F95E10', fontWeight: '700' }}>{planName}</span>
                            })}
                          </div>
                        ) : (
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>-</span>
                        )}
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
                          {canView && (
                            <button onClick={() => setViewingCouponId(coupon.id)} style={{ background: 'transparent', border: 'none', color: '#3b82f6', cursor: 'pointer', padding: '4px' }}>
                              <Eye size={16} />
                            </button>
                          )}
                          {canEdit && (
                            <button onClick={() => handleToggleCouponStatus(coupon)} title={coupon.status === 'Active' ? "Deactivate Coupon" : "Activate Coupon"} style={{ background: 'transparent', border: 'none', color: coupon.status === 'Active' ? '#10b981' : '#ef4444', cursor: 'pointer', padding: '4px' }}>
                              {coupon.status === 'Active' ? <Unlock size={16} /> : <Lock size={16} />}
                            </button>
                          )}
                          {canEdit && (
                            <button onClick={() => handleEdit(coupon)} title="Edit Coupon" style={{ background: 'transparent', border: 'none', color: '#3b82f6', cursor: 'pointer', padding: '4px' }}>
                              <Edit2 size={16} />
                            </button>
                          )}
                          {canDelete && (
                            <button onClick={() => handleDelete(coupon)} style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '4px' }}>
                              <Trash2 size={16} />
                            </button>
                          )}
                          {!canView && !canEdit && !canDelete && (
                            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>-</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                  {displayCoupons.length === 0 && (
                    <tr>
                      <td colSpan="7" style={{ padding: '30px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                        No coupons found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <TableBottomPagination
              currentPage={currentPage}
              totalPages={Math.max(1, Math.ceil(currentCount / itemsPerPage))}
              totalEntries={currentCount}
              totalItems={currentCount}
              entriesPerPage={itemsPerPage}
              itemsPerPage={itemsPerPage}
              onPageChange={(page) => setCurrentPage(page)}
            />

          </div>
        </div>
      )}

      {/* Toast Notification Banner */}
      {toast && (
        <div
          className="animate-fade-in"
          style={{
            position: 'fixed',
            top: '24px',
            right: '24px',
            zIndex: 9999999,
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '14px 20px',
            borderRadius: '12px',
            background: toast.type === 'error' ? '#fef2f2' : '#f0fdf4',
            border: `1.5px solid ${toast.type === 'error' ? '#fca5a5' : '#86efac'}`,
            boxShadow: '0 10px 30px rgba(0,0,0,0.12)',
            color: toast.type === 'error' ? '#991b1b' : '#166534',
            fontSize: '0.88rem',
            fontWeight: '600',
            maxWidth: '450px'
          }}
        >
          <div style={{ flexShrink: 0 }}>
            {toast.type === 'error' ? <AlertCircle size={20} color="#dc2626" /> : <CheckCircle2 size={20} color="#16a34a" />}
          </div>
          <div style={{ flex: 1, wordBreak: 'break-word' }}>{toast.message}</div>
          <button
            onClick={() => setToast(null)}
            style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'inherit', padding: '2px', display: 'flex' }}
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* Delete Confirmation Modal Overlay */}
      {confirmModal && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            background: 'rgba(9, 13, 22, 0.45)',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 999999,
            padding: '20px'
          }}
          onClick={() => setConfirmModal(null)}
        >
          <div
            className="animate-fade-in"
            style={{
              background: '#ffffff',
              borderRadius: '24px',
              padding: '36px 32px 28px',
              width: '90%',
              maxWidth: '420px',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              textAlign: 'center'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{
              width: '60px',
              height: '60px',
              borderRadius: '50%',
              background: '#fee2e2',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '20px'
            }}>
              <Trash2 style={{ width: '28px', height: '28px', color: '#ef4444' }} />
            </div>

            <h3 style={{ margin: '0 0 10px', fontSize: '1.2rem', fontWeight: '800', color: '#0f172a' }}>
              {confirmModal.title || 'Are you sure you want to delete?'}
            </h3>

            <p style={{ margin: '0 0 28px', fontSize: '0.88rem', color: '#64748b', lineHeight: '1.5', maxWidth: '340px' }}>
              {confirmModal.message}
            </p>

            <div style={{ display: 'flex', gap: '14px', width: '100%' }}>
              <button
                type="button"
                onClick={() => setConfirmModal(null)}
                style={{
                  flex: 1,
                  padding: '12px 20px',
                  borderRadius: '12px',
                  border: '1.5px solid #cbd5e1',
                  background: '#ffffff',
                  color: '#334155',
                  fontWeight: '700',
                  fontSize: '0.88rem',
                  cursor: 'pointer',
                  transition: 'all 0.15s'
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  if (confirmModal.onConfirm) confirmModal.onConfirm();
                  setConfirmModal(null);
                }}
                style={{
                  flex: 1,
                  padding: '12px 20px',
                  borderRadius: '12px',
                  border: 'none',
                  background: '#dc2626',
                  color: '#ffffff',
                  fontWeight: '700',
                  fontSize: '0.88rem',
                  cursor: 'pointer',
                  boxShadow: '0 4px 12px rgba(220, 38, 38, 0.25)',
                  transition: 'all 0.15s'
                }}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
