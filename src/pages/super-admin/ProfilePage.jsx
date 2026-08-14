import React, { useState, useEffect } from 'react';
import { User, Shield, Check, Lock, Save, Camera, Mail, Phone, Hash } from 'lucide-react';
import { getProfile, updateProfile, updatePassword } from '../../services/authService';
import { useNotification } from '../../contexts/NotificationContext';

export default function ProfilePage() {
  const { showToast } = useNotification();
  const [activeTab, setActiveTab] = useState('personal');
  const [loading, setLoading] = useState(true);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phoneNumber: '',
    role: 'Super Admin'
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  useEffect(() => {
    const loadProfile = async () => {
      try {
        setLoading(true);
        const res = await getProfile();
        if (res?.data) {
          setFormData({
            name: res.data.name || '',
            email: res.data.email || '',
            phoneNumber: res.data.phoneNumber || '',
            role: res.data.role?.roleName || 'Super Admin'
          });
        }
      } catch (error) {
        showToast('error', 'Failed to load profile');
      } finally {
        setLoading(false);
      }
    };
    loadProfile();
  }, []);

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({ ...prev, [name]: value }));
  };

  const savePersonalInfo = async (e) => {
    e.preventDefault();
    try {
      await updateProfile({
        name: formData.name,
        phoneNumber: formData.phoneNumber
      });
      showToast('success', 'Profile updated successfully!');
    } catch (error) {
      showToast('error', error.response?.data?.message || 'Failed to update profile');
    }
  };

  const savePassword = async (e) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      showToast('error', "Passwords don't match!");
      return;
    }
    
    try {
      await updatePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });
      showToast('success', 'Password updated successfully!');
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error) {
      showToast('error', error.response?.data?.message || 'Failed to update password');
    }
  };

  if (loading) {
    return <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>Loading profile...</div>;
  }

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '20px', padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>

      {/* Page Header */}
      {/* <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--text-main)', margin: 0 }}>My Profile</h1>
      </div> */}

      <div style={{ display: 'flex', gap: '24px', alignItems: 'flex-start' }}>

        {/* Left Sidebar Profile Card & Tabs */}
        <div style={{ width: '280px', display: 'flex', flexDirection: 'column', gap: '20px', flexShrink: 0 }}>

          {/* Avatar Card */}
          <div style={{ background: '#fff', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '24px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
            <div style={{ position: 'relative' }}>
              <div style={{ width: '90px', height: '90px', borderRadius: '50%', background: 'rgba(249, 94, 16, 0.1)', border: '2px solid #F95E10', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#F95E10', fontSize: '2rem', fontWeight: '800' }}>
                {formData.name ? formData.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : 'SA'}
              </div>
              <button style={{ position: 'absolute', bottom: '0', right: '0', width: '32px', height: '32px', borderRadius: '50%', background: '#fff', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-main)', cursor: 'pointer', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                <Camera size={14} />
              </button>
            </div>
            <div style={{ textAlign: 'center' }}>
              <h2 style={{ margin: '0 0 4px 0', fontSize: '1.1rem', fontWeight: '700', color: 'var(--text-main)' }}>{formData.name}</h2>
              <p style={{ margin: '0 0 8px 0', fontSize: '0.85rem', color: 'var(--text-muted)' }}>{formData.email}</p>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', background: 'rgba(249, 94, 16, 0.1)', color: '#F95E10', padding: '4px 10px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: '600' }}>
                <Shield size={12} /> {formData.role}
              </div>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div style={{ background: '#fff', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '12px', display: 'flex', flexDirection: 'column', gap: '4px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
            <button
              onClick={() => setActiveTab('personal')}
              style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', borderRadius: '8px', background: activeTab === 'personal' ? 'rgba(249, 94, 16, 0.08)' : 'transparent', color: activeTab === 'personal' ? '#F95E10' : 'var(--text-main)', border: 'none', cursor: 'pointer', fontSize: '0.9rem', fontWeight: activeTab === 'personal' ? '700' : '500', transition: 'all 0.2s', textAlign: 'left' }}
              onMouseOver={(e) => { if (activeTab !== 'personal') e.currentTarget.style.background = 'var(--bg-app)' }}
              onMouseOut={(e) => { if (activeTab !== 'personal') e.currentTarget.style.background = 'transparent' }}
            >
              <User size={18} /> Personal Information
            </button>
            <button
              onClick={() => setActiveTab('security')}
              style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', borderRadius: '8px', background: activeTab === 'security' ? 'rgba(249, 94, 16, 0.08)' : 'transparent', color: activeTab === 'security' ? '#F95E10' : 'var(--text-main)', border: 'none', cursor: 'pointer', fontSize: '0.9rem', fontWeight: activeTab === 'security' ? '700' : '500', transition: 'all 0.2s', textAlign: 'left' }}
              onMouseOver={(e) => { if (activeTab !== 'security') e.currentTarget.style.background = 'var(--bg-app)' }}
              onMouseOut={(e) => { if (activeTab !== 'security') e.currentTarget.style.background = 'transparent' }}
            >
              <Lock size={18} /> Security Options
            </button>
          </div>
        </div>

        {/* Right Content Area */}
        <div style={{ flex: 1, background: '#fff', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>

          {activeTab === 'personal' && (
            <div className="animate-fade-in">
              <h2 style={{ margin: '0 0 8px 0', fontSize: '1.2rem', fontWeight: '700', color: 'var(--text-main)' }}>Personal Information</h2>
              <p style={{ margin: '0 0 24px 0', fontSize: '0.85rem', color: 'var(--text-muted)' }}>Update your personal details and contact information.</p>

              <form onSubmit={savePersonalInfo} style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '600px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--text-main)' }}>Full Name <span style={{ color: '#ef4444' }}>*</span></label>
                  <input type="text" name="name" value={formData.name} onChange={handleFormChange} required style={{ padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-app)', color: 'var(--text-main)', fontSize: '0.85rem', outline: 'none' }} />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    Email Address <span style={{ fontSize: '0.7rem', color: '#ef4444', background: 'rgba(239, 68, 68, 0.1)', padding: '2px 8px', borderRadius: '12px' }}>Read Only</span>
                  </label>
                  <input type="email" value={formData.email} readOnly style={{ padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-app)', color: 'var(--text-muted)', fontSize: '0.85rem', outline: 'none', cursor: 'not-allowed', opacity: 0.7 }} />
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Email address cannot be changed as it is used for login. Contact support to update.</span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--text-main)' }}>Phone Number <span style={{ color: '#ef4444' }}>*</span></label>
                  <input type="text" name="phoneNumber" value={formData.phoneNumber} onChange={handleFormChange} required style={{ padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-app)', color: 'var(--text-main)', fontSize: '0.85rem', outline: 'none' }} />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--text-main)' }}>Role</label>
                  <input type="text" value={formData.role} readOnly style={{ padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-app)', color: 'var(--text-muted)', fontSize: '0.85rem', outline: 'none', cursor: 'not-allowed', opacity: 0.7 }} />
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-start', marginTop: '10px' }}>
                  <button type="submit" style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#F95E10', color: '#fff', border: 'none', padding: '10px 24px', borderRadius: '8px', fontSize: '0.85rem', fontWeight: '600', cursor: 'pointer' }}>
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="animate-fade-in">
              <h2 style={{ margin: '0 0 8px 0', fontSize: '1.2rem', fontWeight: '700', color: 'var(--text-main)' }}>Security Options</h2>
              <p style={{ margin: '0 0 24px 0', fontSize: '0.85rem', color: 'var(--text-muted)' }}>Change your password to keep your account secure.</p>

              <form onSubmit={savePassword} style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '600px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--text-main)' }}>Current Password <span style={{ color: '#ef4444' }}>*</span></label>
                  <input type="password" name="currentPassword" value={passwordData.currentPassword} onChange={handlePasswordChange} required placeholder="Enter current password" style={{ padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-app)', color: 'var(--text-main)', fontSize: '0.85rem', outline: 'none' }} />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--text-main)' }}>New Password <span style={{ color: '#ef4444' }}>*</span></label>
                  <input type="password" name="newPassword" value={passwordData.newPassword} onChange={handlePasswordChange} required placeholder="Enter new password" style={{ padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-app)', color: 'var(--text-main)', fontSize: '0.85rem', outline: 'none' }} />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--text-main)' }}>Confirm New Password <span style={{ color: '#ef4444' }}>*</span></label>
                  <input type="password" name="confirmPassword" value={passwordData.confirmPassword} onChange={handlePasswordChange} required placeholder="Re-enter new password" style={{ padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-app)', color: 'var(--text-main)', fontSize: '0.85rem', outline: 'none' }} />
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-start', marginTop: '10px' }}>
                  <button type="submit" style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#F95E10', color: '#fff', border: 'none', padding: '10px 24px', borderRadius: '8px', fontSize: '0.85rem', fontWeight: '600', cursor: 'pointer' }}>
                    Update Password
                  </button>
                </div>
              </form>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
