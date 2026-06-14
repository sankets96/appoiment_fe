'use client';

import { useState, useEffect, useRef } from 'react';
import { Card, Avatar, Field, Badge, useToast, ProfilePhotoEditor, IconButton } from '@/components/ui';
import { useAppStore } from '@/lib/store-client';
import { userEndpoints, apiGet, apiPut, apiPostFormData, apiDel, BASE_URL } from '@/config/api';

// Hook for responsive grid columns
function useGridColumns() {
  const [columns, setColumns] = useState('repeat(auto-fit, minmax(280px, 1fr))');

  useEffect(() => {
    const updateColumns = () => {
      if (window.innerWidth < 480) {
        setColumns('1fr');
      } else if (window.innerWidth < 768) {
        setColumns('repeat(auto-fit, minmax(220px, 1fr))');
      } else {
        setColumns('repeat(auto-fit, minmax(280px, 1fr))');
      }
    };

    updateColumns();
    window.addEventListener('resize', updateColumns);
    return () => window.removeEventListener('resize', updateColumns);
  }, []);

  return columns;
}

const SPECIALTIES = [
  'General Physician',
  'Cardiologist',
  'Neurologist',
  'Pediatrician',
  'Dermatologist',
  'Orthopedic Surgeon',
  'Gynecologist',
  'ENT Specialist',
  'Ophthalmologist',
  'Dentist',
  'Psychiatrist',
  'Endocrinologist',
  'Gastroenterologist',
  'Pulmonologist',
  'Nephrologist',
  'Oncologist',
  'Rheumatologist',
  'Urologist',
  'Plastic Surgeon',
  'Homeopath',
  'Ayurveda',
  'Physiotherapist',
  'Psychologist',
  'Nutritionist',
  'Other'
];

const GENDER_OPTIONS = [
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
  { value: 'other', label: 'Other' }
];

const BLOOD_GROUPS = [
  'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'
];

export default function DoctorProfilePage() {
  const { user, updateDoctorProfile } = useAppStore();
  const toast = useToast();
  const gridColumns = useGridColumns();
  const [isEditing, setIsEditing] = useState(false);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [profileData, setProfileData] = useState(null);
  const [editorOpen, setEditorOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [avatarDragOver, setAvatarDragOver] = useState(false);

  // Fetch profile data from API
  useEffect(() => {
    const fetchProfile = async () => {
      if (!user?.id) {
        setLoading(false);
        return;
      }

      try {
        const res = await apiGet(userEndpoints.profile({ id: user.id }));
        console.log('Profile API response:', res.user);
        setProfileData(res.user);
      } catch (err) {
        console.error('Error fetching profile:', err);
        toast?.showToast('Failed to load profile', 'error', 'Error');
        setProfileData(user);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [user?.id]);

  const [form, setForm] = useState({
    name: '',
    phone: '',
    bio: '',
    fee: 500,
    specialty: '',
    gender: '',
    dateOfBirth: '',
    bloodGroup: '',
    address: '',
    experience: '',
    licenseNumber: '',
  });

  // Update form when profileData changes
  useEffect(() => {
    if (profileData) {
      setForm({
        name: profileData.name || '',
        phone: profileData.phone || '',
        bio: profileData.bio || '',
        fee: profileData.fee || 500,
        specialty: profileData.specialty || '',
        gender: profileData.gender || '',
        dateOfBirth: profileData.dateOfBirth || '',
        bloodGroup: profileData.bloodGroup || '',
        address: profileData.address || '',
        experience: profileData.experience || '',
        licenseNumber: profileData.licenseNumber || '',
      });
    }
  }, [profileData]);

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const save = async () => {
    // Validate DOB - must be at least 25 years old
    if (form.dateOfBirth && !validateAge(form.dateOfBirth)) {
      const age = calculateAge(form.dateOfBirth);
      toast?.showToast(`You must be at least 25 years old. Current age: ${age}`, 'error', 'Age Validation Failed');
      return;
    }

    // Validate required fields
    if (!form.name || !form.phone || !form.specialty) {
      toast?.showToast('Please fill in all required fields (Name, Phone, Specialty)', 'error', 'Validation Error');
      return;
    }

    // Validate phone number (basic validation - 10 digits)
    const phoneRegex = /^[6-9]\d{9}$/;
    if (form.phone && !phoneRegex.test(form.phone.replace(/\s/g, ''))) {
      toast?.showToast('Please enter a valid 10-digit Indian phone number', 'error', 'Invalid Phone Number');
      return;
    }

    try {
      const payload = {
        name: form.name,
        phone: form.phone,
        bio: form.bio,
        fee: form.fee,
        specialty: form.specialty,
        gender: form.gender,
        dateOfBirth: form.dateOfBirth,
        bloodGroup: form.bloodGroup,
        address: form.address,
        experience: form.experience,
        licenseNumber: form.licenseNumber,
      };

      console.log('Sending PUT request to:', userEndpoints.updateProfile({ id: user.id }));
      console.log('Payload:', JSON.stringify(payload, null, 2));

      await apiPut(userEndpoints.updateProfile({ id: user.id }), payload);

      console.log('Profile update successful');

      toast?.showToast('Profile updated successfully', 'success', 'Profile Updated');

      // Re-fetch the updated profile from API to get all latest data
      const res = await apiGet(userEndpoints.profile({ id: user.id }));
      console.log('Profile re-fetch response:', res.user);
      setProfileData(res.user);

      // Update local store
      updateDoctorProfile(user.id, form);
      setSaved(true);
      setIsEditing(false);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      console.error('Error updating profile:', err);
      toast?.showToast('Failed to update profile', 'error', 'Error');
      // Still update locally even if API fails
      updateDoctorProfile(user.id, form);
      setSaved(true);
      setIsEditing(false);
      setTimeout(() => setSaved(false), 3000);
    }
  };

  const cancel = () => {
    setForm({
      name: profileData?.name || user?.name || '',
      phone: profileData?.phone || '',
      bio: profileData?.bio || '',
      fee: profileData?.fee || 500,
      specialty: profileData?.specialty || '',
      gender: profileData?.gender || '',
      dateOfBirth: profileData?.dateOfBirth || '',
      bloodGroup: profileData?.bloodGroup || '',
      address: profileData?.address || '',
      experience: profileData?.experience || '',
      licenseNumber: profileData?.licenseNumber || '',
    });
    setIsEditing(false);
  };

  // ── Photo editor handlers ─────────────────────────────────
  const handleAvatarClick = () => {
    if (uploading) return;
    setEditorOpen(true);
  };

  const handleAvatarDrop = (e) => {
    e.preventDefault();
    setAvatarDragOver(false);
    if (uploading) return;
    setEditorOpen(true);
  };

  const handleEditorSave = async (file) => {
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('photo', file);
      await apiPostFormData(userEndpoints.uploadPhoto({ id: user.id }), fd);
      const updatedRes = await apiGet(userEndpoints.profile({ id: user.id }));
      setProfileData(updatedRes.user);
      toast?.showToast('Profile photo updated successfully', 'success', 'Photo Uploaded');
    } catch (err) {
      console.error('Error uploading photo:', err);
      toast?.showToast(err.message || 'Failed to upload photo', 'error', 'Upload Failed');
    } finally {
      setUploading(false);
    }
  };

  const handleRemovePhoto = async () => {
    try {
      await apiDel(userEndpoints.deletePhoto({ id: user.id }));
      const updatedRes = await apiGet(userEndpoints.profile({ id: user.id }));
      setProfileData(updatedRes.user);
      toast?.showToast('Profile photo removed', 'success', 'Photo Removed');
    } catch (err) {
      console.error('Error removing photo:', err);
      toast?.showToast(err.message || 'Failed to remove photo', 'error', 'Remove Failed');
    }
  };

  // Validate DOB - must be at least 25 years old
  const validateAge = (dob) => {
    if (!dob) return true; // Allow empty, validate on submit

    const today = new Date();
    const birthDate = new Date(dob);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    // Adjust age if birthday hasn't occurred yet this year
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }

    return age >= 25;
  };

  // Calculate age from DOB
  const calculateAge = (dob) => {
    if (!dob) return 0;
    const today = new Date();
    const birthDate = new Date(dob);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }

    return age;
  };

  if (!user) {
    return (
      <div style={{ textAlign: 'center', padding: 60, color: 'var(--muted)' }}>
        Please login to view your profile
      </div>
    );
  }

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '50vh',
        color: 'var(--muted)'
      }}>
        Loading profile...
      </div>
    );
  }

  const displayData = profileData || user;
  const photoUrl = displayData?.profilePhoto ? `${BASE_URL}${displayData.profilePhoto}` : null;

  return (
    <div className="fade-in" style={{ maxWidth: 900, margin: '0 auto', padding: '0 20px 40px' }}>
      {/* Header */}
      <div style={{
        marginBottom: 32,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: 16
      }}>
        <div>
          <h1 style={{
            fontFamily: 'var(--font-display)',
            fontSize: 32,
            fontStyle: 'italic',
            marginBottom: 6,
            color: 'var(--ink)'
          }}>
            My Profile
          </h1>
          <p style={{ color: 'var(--muted)', fontSize: 14 }}>
            Manage your professional information and consultation details
          </p>
        </div>
      </div>

      {/* Success Message */}
      {saved && (
        <div
          style={{
            background: 'linear-gradient(135deg, #d4edda 0%, #c3e6cb 100%)',
            border: '1.5px solid #28a745',
            color: '#155724',
            padding: '14px 18px',
            borderRadius: 12,
            fontWeight: 600,
            marginBottom: 20,
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            boxShadow: '0 4px 12px rgba(40, 167, 69, 0.15)',
          }}
        >
          <span style={{ fontSize: 20 }}>✓</span>
          Profile updated successfully!
        </div>
      )}

      {/* Profile Card */}
      <Card style={{
        padding: 0,
        overflow: 'hidden',
        borderRadius: 20,
        boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
        border: '1.5px solid var(--border)',
      }}>
        {/* Profile Header */}
        <div
          style={{
            background: 'linear-gradient(135deg, #2d5a3d 0%, #1a3d28 100%)',
            padding: '40px 32px',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {/* Decorative elements */}
          <div style={{
            position: 'absolute',
            top: -50,
            right: -50,
            width: 200,
            height: 200,
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.05)',
          }} />
          <div style={{
            position: 'absolute',
            bottom: -30,
            left: -30,
            width: 120,
            height: 120,
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.03)',
          }} />

          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 24,
            position: 'relative',
            zIndex: 1,
            flexWrap: 'wrap',
          }}>
            <div
              className={`doctor-avatar-wrap${avatarDragOver ? ' doctor-avatar-wrap--over' : ''}`}
              style={{
                position: 'relative',
                width: 100,
                height: 100,
                borderRadius: '50%',
                background: 'rgba(255,255,255,0.95)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
                border: '4px solid rgba(255,255,255,0.3)',
                flexShrink: 0,
                cursor: uploading ? 'wait' : 'pointer',
                overflow: 'hidden',
              }}
              onClick={handleAvatarClick}
              onDragOver={(e) => {
                e.preventDefault();
                if (e.dataTransfer?.types?.includes('Files')) setAvatarDragOver(true);
              }}
              onDragLeave={() => setAvatarDragOver(false)}
              onDrop={handleAvatarDrop}
              title="Click to change photo"
            >
              {photoUrl ? (
                <img
                  src={photoUrl}
                  alt={displayData?.name}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  onError={(e) => { e.target.style.display = 'none'; }}
                />
              ) : (
                <Avatar name={displayData?.name} size={80} color="sage" />
              )}

              <div className="doctor-avatar-overlay">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                  <circle cx="12" cy="13" r="4" />
                </svg>
              </div>

              {photoUrl && (
                <div style={{ position: 'absolute', top: -4, right: -4 }}>
                  <IconButton
                    variant="delete"
                    dark
                    onClick={(e) => { e.stopPropagation(); handleRemovePhoto(); }}
                    title="Remove photo"
                  />
                </div>
              )}
            </div>
            <div style={{ color: '#fff', flex: 1, minWidth: 200 }}>
              <div style={{ fontSize: 28, fontWeight: 800, marginBottom: 6, letterSpacing: '-0.5px' }}>
                {displayData?.name || 'Unknown'}
              </div>
              <div style={{ fontSize: 15, opacity: 0.9, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                <span>{displayData?.specialty || 'Select Specialty'}</span>
                <span style={{ opacity: 0.5 }}>•</span>
                <span>{displayData?.experience || 'Experience not set'}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                <Badge text={displayData?.verified ? '✓ Verified' : '⏳ Pending'} color={displayData?.verified ? 'sage' : 'amber'} />
                <span style={{
                  background: 'rgba(255,255,255,0.2)',
                  padding: '4px 12px',
                  borderRadius: 20,
                  fontSize: 13,
                  fontWeight: 600,
                }}>
                  ₹{displayData?.fee || 500}/consultation
                </span>
              </div>
            </div>
            <IconButton
              variant="edit"
              dark
              onClick={() => setIsEditing(!isEditing)}
              title={isEditing ? 'Cancel editing' : 'Edit profile'}
            />
          </div>

          {/* Mobile responsive styles */}
          <style>{`
            @media (max-width: 480px) {
              .doctor-profile-header {
                padding: 24px 16px !important;
              }
              .doctor-profile-header-avatar {
                width: 70px !important;
                height: 70px !important;
              }
              .doctor-profile-header-name {
                font-size: 20px !important;
              }
              .doctor-profile-header-specialty {
                font-size: 13px !important;
              }
              .doctor-profile-header button {
                position: static !important;
                margin-top: 12px !important;
                width: 100% !important;
                justify-content: center !important;
              }
            }
          `}</style>
        </div>

        {/* Profile Details */}
        <div style={{ padding: 0 }}>
          {isEditing ? (
            /* Edit Mode */
            <div style={{ padding: '32px 32px 24px' }}>
              {/* Personal Information Section */}
              <div style={{ marginBottom: 32 }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  marginBottom: 20,
                  paddingBottom: 12,
                  borderBottom: '2px solid var(--sage-light)',
                }}>
                  <span style={{ fontSize: 18 }}>👤</span>
                  <span style={{ fontSize: 16, fontWeight: 700, color: 'var(--ink)' }}>Personal Information</span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: gridColumns, gap: 20 }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink2)', letterSpacing: '0.3px' }}>
                      Full Name
                    </label>
                    <input
                      value={form.name}
                      onChange={set('name')}
                      style={{
                        width: '100%',
                        padding: '14px 16px',
                        borderRadius: 12,
                        border: '1.5px solid #e5e5e3',
                        fontSize: 14,
                        outline: 'none',
                        transition: 'all 0.2s',
                        background: '#fafaf8',
                      }}
                      onFocus={(e) => {
                        e.target.style.borderColor = 'var(--sage)';
                        e.target.style.background = '#fff';
                        e.target.style.boxShadow = '0 0 0 3px rgba(74,124,89,0.1)';
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = '#e5e5e3';
                        e.target.style.background = '#fafaf8';
                        e.target.style.boxShadow = 'none';
                      }}
                    />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink2)', letterSpacing: '0.3px' }}>
                      Gender
                    </label>
                    <select
                      value={form.gender}
                      onChange={set('gender')}
                      style={{
                        width: '100%',
                        padding: '14px 16px',
                        borderRadius: 12,
                        border: '1.5px solid #e5e5e3',
                        fontSize: 14,
                        outline: 'none',
                        background: '#fafaf8',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                      }}
                      onFocus={(e) => {
                        e.target.style.borderColor = 'var(--sage)';
                        e.target.style.background = '#fff';
                        e.target.style.boxShadow = '0 0 0 3px rgba(74,124,89,0.1)';
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = '#e5e5e3';
                        e.target.style.background = '#fafaf8';
                        e.target.style.boxShadow = 'none';
                      }}
                    >
                      <option value="">Select Gender</option>
                      {GENDER_OPTIONS.map((g) => (
                        <option key={g.value} value={g.value}>{g.label}</option>
                      ))}
                    </select>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink2)', letterSpacing: '0.3px' }}>
                      Date of Birth <span style={{ color: 'var(--muted)', fontWeight: 400 }}>(Must be 25+ years)</span>
                    </label>
                    <input
                      type="date"
                      value={form.dateOfBirth}
                      onChange={set('dateOfBirth')}
                      max={new Date(new Date().setFullYear(new Date().getFullYear() - 25)).toISOString().split('T')[0]}
                      style={{
                        width: '100%',
                        padding: '14px 16px',
                        borderRadius: 12,
                        border: `1.5px solid ${form.dateOfBirth && !validateAge(form.dateOfBirth) ? '#ef4444' : '#e5e5e3'}`,
                        fontSize: 14,
                        outline: 'none',
                        color: form.dateOfBirth ? 'var(--ink)' : 'var(--muted)',
                        background: '#fafaf8',
                        transition: 'all 0.2s',
                      }}
                      onFocus={(e) => {
                        e.target.style.borderColor = form.dateOfBirth && !validateAge(form.dateOfBirth) ? '#ef4444' : 'var(--sage)';
                        e.target.style.background = '#fff';
                        e.target.style.boxShadow = '0 0 0 3px rgba(74,124,89,0.1)';
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = form.dateOfBirth && !validateAge(form.dateOfBirth) ? '#ef4444' : '#e5e5e3';
                        e.target.style.background = '#fafaf8';
                        e.target.style.boxShadow = 'none';
                      }}
                    />
                    {form.dateOfBirth && !validateAge(form.dateOfBirth) && (
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 6,
                        fontSize: 12,
                        color: '#ef4444',
                        fontWeight: 500,
                        marginTop: 4,
                      }}>
                        <span>⚠️</span>
                        Must be at least 25 years old. Current age: {calculateAge(form.dateOfBirth)} years
                      </div>
                    )}
                    {form.dateOfBirth && validateAge(form.dateOfBirth) && (
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 6,
                        fontSize: 12,
                        color: '#10b981',
                        fontWeight: 500,
                        marginTop: 4,
                      }}>
                        <span>✓</span>
                        Age: {calculateAge(form.dateOfBirth)} years (Valid)
                      </div>
                    )}
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink2)', letterSpacing: '0.3px' }}>
                      Blood Group
                    </label>
                    <select
                      value={form.bloodGroup}
                      onChange={set('bloodGroup')}
                      style={{
                        width: '100%',
                        padding: '14px 16px',
                        borderRadius: 12,
                        border: '1.5px solid #e5e5e3',
                        fontSize: 14,
                        outline: 'none',
                        background: '#fafaf8',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                      }}
                      onFocus={(e) => {
                        e.target.style.borderColor = 'var(--sage)';
                        e.target.style.background = '#fff';
                        e.target.style.boxShadow = '0 0 0 3px rgba(74,124,89,0.1)';
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = '#e5e5e3';
                        e.target.style.background = '#fafaf8';
                        e.target.style.boxShadow = 'none';
                      }}
                    >
                      <option value="">Select Blood Group</option>
                      {BLOOD_GROUPS.map((bg) => (
                        <option key={bg} value={bg}>{bg}</option>
                      ))}
                    </select>
                  </div>
                  <div style={{ gridColumn: '1 / -1', display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink2)', letterSpacing: '0.3px' }}>
                      Address
                    </label>
                    <textarea
                      rows={2}
                      value={form.address}
                      onChange={set('address')}
                      placeholder="Enter your full address"
                      style={{
                        width: '100%',
                        padding: '14px 16px',
                        borderRadius: 12,
                        border: '1.5px solid #e5e5e3',
                        fontSize: 14,
                        outline: 'none',
                        resize: 'vertical',
                        fontFamily: 'inherit',
                        background: '#fafaf8',
                        transition: 'all 0.2s',
                        minHeight: 80,
                      }}
                      onFocus={(e) => {
                        e.target.style.borderColor = 'var(--sage)';
                        e.target.style.background = '#fff';
                        e.target.style.boxShadow = '0 0 0 3px rgba(74,124,89,0.1)';
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = '#e5e5e3';
                        e.target.style.background = '#fafaf8';
                        e.target.style.boxShadow = 'none';
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Professional Information Section */}
              <div style={{ marginBottom: 32 }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  marginBottom: 20,
                  paddingBottom: 12,
                  borderBottom: '2px solid var(--sage-light)',
                }}>
                  <span style={{ fontSize: 18 }}>🩺</span>
                  <span style={{ fontSize: 16, fontWeight: 700, color: 'var(--ink)' }}>Professional Information</span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: gridColumns, gap: 20 }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink2)', letterSpacing: '0.3px' }}>
                      Specialty
                    </label>
                    <select
                      value={form.specialty}
                      onChange={set('specialty')}
                      style={{
                        width: '100%',
                        padding: '14px 16px',
                        borderRadius: 12,
                        border: '1.5px solid #e5e5e3',
                        fontSize: 14,
                        outline: 'none',
                        background: '#fafaf8',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                      }}
                      onFocus={(e) => {
                        e.target.style.borderColor = 'var(--sage)';
                        e.target.style.background = '#fff';
                        e.target.style.boxShadow = '0 0 0 3px rgba(74,124,89,0.1)';
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = '#e5e5e3';
                        e.target.style.background = '#fafaf8';
                        e.target.style.boxShadow = 'none';
                      }}
                    >
                      <option value="">Select Specialty</option>
                      {SPECIALTIES.map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink2)', letterSpacing: '0.3px' }}>
                      Experience
                    </label>
                    <select
                      value={form.experience}
                      onChange={set('experience')}
                      style={{
                        width: '100%',
                        padding: '14px 16px',
                        borderRadius: 12,
                        border: '1.5px solid #e5e5e3',
                        fontSize: 14,
                        outline: 'none',
                        background: '#fafaf8',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                      }}
                      onFocus={(e) => {
                        e.target.style.borderColor = 'var(--sage)';
                        e.target.style.background = '#fff';
                        e.target.style.boxShadow = '0 0 0 3px rgba(74,124,89,0.1)';
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = '#e5e5e3';
                        e.target.style.background = '#fafaf8';
                        e.target.style.boxShadow = 'none';
                      }}
                    >
                      <option value="">Select Experience</option>
                      <option value="0–1 years">0–1 years</option>
                      <option value="1–3 years">1–3 years</option>
                      <option value="3–5 years">3–5 years</option>
                      <option value="5–10 years">5–10 years</option>
                      <option value="10+ years">10+ years</option>
                    </select>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink2)', letterSpacing: '0.3px' }}>
                      License Number
                    </label>
                    <input
                      value={form.licenseNumber}
                      onChange={set('licenseNumber')}
                      placeholder="e.g., MH12345"
                      style={{
                        width: '100%',
                        padding: '14px 16px',
                        borderRadius: 12,
                        border: '1.5px solid #e5e5e3',
                        fontSize: 14,
                        outline: 'none',
                        transition: 'all 0.2s',
                        background: '#fafaf8',
                      }}
                      onFocus={(e) => {
                        e.target.style.borderColor = 'var(--sage)';
                        e.target.style.background = '#fff';
                        e.target.style.boxShadow = '0 0 0 3px rgba(74,124,89,0.1)';
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = '#e5e5e3';
                        e.target.style.background = '#fafaf8';
                        e.target.style.boxShadow = 'none';
                      }}
                    />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink2)', letterSpacing: '0.3px' }}>
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      value={form.phone}
                      onChange={set('phone')}
                      placeholder="Enter phone number"
                      style={{
                        width: '100%',
                        padding: '14px 16px',
                        borderRadius: 12,
                        border: '1.5px solid #e5e5e3',
                        fontSize: 14,
                        outline: 'none',
                        transition: 'all 0.2s',
                        background: '#fafaf8',
                      }}
                      onFocus={(e) => {
                        e.target.style.borderColor = 'var(--sage)';
                        e.target.style.background = '#fff';
                        e.target.style.boxShadow = '0 0 0 3px rgba(74,124,89,0.1)';
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = '#e5e5e3';
                        e.target.style.background = '#fafaf8';
                        e.target.style.boxShadow = 'none';
                      }}
                    />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink2)', letterSpacing: '0.3px' }}>
                      Consultation Fee (₹)
                    </label>
                    <input
                      type="number"
                      value={form.fee}
                      onChange={set('fee')}
                      style={{
                        width: '100%',
                        padding: '14px 16px',
                        borderRadius: 12,
                        border: '1.5px solid #e5e5e3',
                        fontSize: 14,
                        outline: 'none',
                        transition: 'all 0.2s',
                        background: '#fafaf8',
                      }}
                      onFocus={(e) => {
                        e.target.style.borderColor = 'var(--sage)';
                        e.target.style.background = '#fff';
                        e.target.style.boxShadow = '0 0 0 3px rgba(74,124,89,0.1)';
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = '#e5e5e3';
                        e.target.style.background = '#fafaf8';
                        e.target.style.boxShadow = 'none';
                      }}
                    />
                  </div>
                </div>
              </div>

              <div style={{ marginBottom: 28 }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  marginBottom: 20,
                  paddingBottom: 12,
                  borderBottom: '2px solid var(--sage-light)',
                }}>
                  <span style={{ fontSize: 18 }}>📝</span>
                  <span style={{ fontSize: 16, fontWeight: 700, color: 'var(--ink)' }}>About</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink2)', letterSpacing: '0.3px' }}>
                    Bio / About
                  </label>
                  <textarea
                    rows={4}
                    value={form.bio}
                    onChange={set('bio')}
                    placeholder="Tell patients about your experience, expertise, and approach to treatment..."
                    style={{
                      width: '100%',
                      padding: '14px 16px',
                      borderRadius: 12,
                      border: '1.5px solid #e5e5e3',
                      fontSize: 14,
                      outline: 'none',
                      resize: 'vertical',
                      minHeight: 120,
                      fontFamily: 'inherit',
                      background: '#fafaf8',
                      transition: 'all 0.2s',
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = 'var(--sage)';
                      e.target.style.background = '#fff';
                      e.target.style.boxShadow = '0 0 0 3px rgba(74,124,89,0.1)';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = '#e5e5e3';
                      e.target.style.background = '#fafaf8';
                      e.target.style.boxShadow = 'none';
                    }}
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{
                display: 'flex',
                gap: 12,
                paddingTop: 20,
                borderTop: '1.5px solid var(--border)',
              }}>
                <button
                  onClick={save}
                  style={{
                    flex: 1,
                    padding: '16px 28px',
                    borderRadius: 12,
                    border: 'none',
                    background: 'linear-gradient(135deg, #4a7c59 0%, #3d6b4a 100%)',
                    color: '#fff',
                    fontWeight: 700,
                    fontSize: 15,
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    boxShadow: '0 4px 14px rgba(74,124,89,0.3)',
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.transform = 'translateY(-2px)';
                    e.target.style.boxShadow = '0 6px 20px rgba(74,124,89,0.4)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.transform = 'translateY(0)';
                    e.target.style.boxShadow = '0 4px 14px rgba(74,124,89,0.3)';
                  }}
                >
                  💾 Save Changes
                </button>
                <button
                  onClick={cancel}
                  style={{
                    padding: '16px 28px',
                    borderRadius: 12,
                    border: '1.5px solid var(--border)',
                    background: '#fff',
                    color: 'var(--ink2)',
                    fontWeight: 600,
                    fontSize: 15,
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.borderColor = 'var(--muted)';
                    e.target.style.background = '#f5f5f5';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.borderColor = 'var(--border)';
                    e.target.style.background = '#fff';
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            /* View Mode */
            <div style={{ padding: '32px 32px 24px' }}>
              {/* Personal Information Section */}
              <div style={{ marginBottom: 32 }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  marginBottom: 20,
                  paddingBottom: 12,
                  borderBottom: '2px solid var(--sage-light)',
                }}>
                  <span style={{ fontSize: 18 }}>👤</span>
                  <span style={{ fontSize: 16, fontWeight: 700, color: 'var(--ink)' }}>Personal Information</span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: gridColumns, gap: 24 }}>
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--muted)', letterSpacing: '0.3px', textTransform: 'uppercase', marginBottom: 8 }}>
                      Full Name
                    </div>
                    <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--ink)' }}>
                      {displayData?.name || 'Not set'}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--muted)', letterSpacing: '0.3px', textTransform: 'uppercase', marginBottom: 8 }}>
                      Gender
                    </div>
                    <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--ink)' }}>
                      {displayData?.gender ? displayData.gender.charAt(0).toUpperCase() + displayData.gender.slice(1) : 'Not set'}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--muted)', letterSpacing: '0.3px', textTransform: 'uppercase', marginBottom: 8 }}>
                      Date of Birth
                    </div>
                    <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--ink)' }}>
                      {displayData?.dateOfBirth || 'Not set'}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--muted)', letterSpacing: '0.3px', textTransform: 'uppercase', marginBottom: 8 }}>
                      Blood Group
                    </div>
                    <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--ink)' }}>
                      {displayData?.bloodGroup || 'Not set'}
                    </div>
                  </div>
                  <div style={{ gridColumn: '1 / -1' }}>
                    <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--muted)', letterSpacing: '0.3px', textTransform: 'uppercase', marginBottom: 8 }}>
                      Address
                    </div>
                    <div style={{ fontSize: 14, color: 'var(--ink)', lineHeight: 1.6 }}>
                      {displayData?.address || 'Not set'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Professional Information Section */}
              <div style={{ marginBottom: 32 }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  marginBottom: 20,
                  paddingBottom: 12,
                  borderBottom: '2px solid var(--sage-light)',
                }}>
                  <span style={{ fontSize: 18 }}>🩺</span>
                  <span style={{ fontSize: 16, fontWeight: 700, color: 'var(--ink)' }}>Professional Information</span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: gridColumns, gap: 24 }}>
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--muted)', letterSpacing: '0.3px', textTransform: 'uppercase', marginBottom: 8 }}>
                      Specialty
                    </div>
                    <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--ink)' }}>
                      {displayData?.specialty || 'Not set'}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--muted)', letterSpacing: '0.3px', textTransform: 'uppercase', marginBottom: 8 }}>
                      Experience
                    </div>
                    <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--ink)' }}>
                      {displayData?.experience || 'Not set'}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--muted)', letterSpacing: '0.3px', textTransform: 'uppercase', marginBottom: 8 }}>
                      License Number
                    </div>
                    <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--ink)' }}>
                      {displayData?.licenseNumber || 'Not set'}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--muted)', letterSpacing: '0.3px', textTransform: 'uppercase', marginBottom: 8 }}>
                      Phone Number
                    </div>
                    <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--ink)' }}>
                      {displayData?.phone || 'Not set'}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--muted)', letterSpacing: '0.3px', textTransform: 'uppercase', marginBottom: 8 }}>
                      Consultation Fee
                    </div>
                    <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--ink)' }}>
                      ₹{displayData?.fee || '500'}/visit
                    </div>
                  </div>
                </div>
              </div>

              {/* About Section */}
              <div style={{ marginBottom: 24 }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  marginBottom: 20,
                  paddingBottom: 12,
                  borderBottom: '2px solid var(--sage-light)',
                }}>
                  <span style={{ fontSize: 18 }}>📝</span>
                  <span style={{ fontSize: 16, fontWeight: 700, color: 'var(--ink)' }}>About</span>
                </div>
                <div style={{ fontSize: 14, color: 'var(--ink)', lineHeight: 1.8, background: '#fafaf8', padding: '16px 18px', borderRadius: 12 }}>
                  {displayData?.bio || 'No bio added yet. Click "Edit Profile" to add information about yourself.'}
                </div>
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* Quick Summary Card */}
      <Card style={{
        marginTop: 24,
        padding: 0,
        borderRadius: 16,
        boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
        border: '1.5px solid var(--border)',
        overflow: 'hidden',
      }}>
        <div style={{
          background: 'linear-gradient(135deg, #f5f3ef 0%, #fafaf8 100%)',
          padding: '20px 24px',
          borderBottom: '1.5px solid var(--border)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 20 }}>📋</span>
            <span style={{ fontSize: 16, fontWeight: 700, color: 'var(--ink)' }}>Quick Summary</span>
          </div>
        </div>
        <div style={{ padding: '24px 24px 20px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 20 }}>
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--muted)', letterSpacing: '0.5px', textTransform: 'uppercase', marginBottom: 6 }}>
                Email Address
              </div>
              <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--ink)' }}>
                {displayData?.email}
              </div>
            </div>
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--muted)', letterSpacing: '0.5px', textTransform: 'uppercase', marginBottom: 6 }}>
                Verification Status
              </div>
              <Badge text={displayData?.verified ? '✓ Verified' : '⏳ Pending'} color={displayData?.verified ? 'sage' : 'amber'} />
            </div>
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--muted)', letterSpacing: '0.5px', textTransform: 'uppercase', marginBottom: 6 }}>
                Account Status
              </div>
              <Badge text={displayData?.status ? '✓ Active' : '○ Inactive'} color={displayData?.status ? 'sage' : 'neutral'} />
            </div>
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--muted)', letterSpacing: '0.5px', textTransform: 'uppercase', marginBottom: 6 }}>
                Member Since
              </div>
              <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--ink)' }}>
                {displayData?.createdAt ? new Date(displayData.createdAt).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' }) : 'N/A'}
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Profile photo editor modal */}
      <ProfilePhotoEditor
        open={editorOpen}
        onClose={() => setEditorOpen(false)}
        onSave={handleEditorSave}
        currentPhotoUrl={photoUrl}
      />
    </div>
  );
}