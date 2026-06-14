'use client';

import { useState, useEffect } from 'react';
import { Card, Avatar, Field, Badge, useToast, ProfilePhotoEditor, IconButton, CrossIcon } from '@/components/ui';
import { useAppStore } from '@/lib/store-client';
import { userEndpoints, apiGet, apiPost, apiPostFormData, apiDel, BASE_URL } from '@/config/api';

export default function PatientProfilePage() {
  const { user, updateUser } = useAppStore();
  const toast = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [profileData, setProfileData] = useState(null);
  const [editorOpen, setEditorOpen] = useState(false);
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
        setProfileData(res.user);
      } catch (err) {
        console.error('Error fetching profile:', err);
        setProfileData(user);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [user?.id]);

  const [form, setForm] = useState({
    name: profileData?.name || user?.name || '',
    phone: profileData?.phone || '',
    dateOfBirth: profileData?.dateOfBirth || '',
    bloodGroup: profileData?.bloodGroup || 'A+',
    gender: profileData?.gender || 'Male',
    address: profileData?.address || '',
  });

  // Update form when profileData changes
  useEffect(() => {
    if (profileData) {
      setForm({
        name: profileData.name || '',
        phone: profileData.phone || '',
        dateOfBirth: profileData.dateOfBirth || '',
        bloodGroup: profileData.bloodGroup || 'A+',
        gender: profileData.gender || 'Male',
        address: profileData.address || '',
      });
    }
  }, [profileData]);

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  // Handle avatar click → open the editor modal. The editor handles file
  // picking, cropping, zoom, and rotation. We just receive the final File.
  const handleAvatarClick = () => {
    if (uploading) return;
    setEditorOpen(true);
  };

  // Handle drag-and-drop directly on the avatar (optional fast path —
  // the editor also accepts drops). We forward the file to the editor
  // by opening the modal after a tiny delay so the state is set up.
  const handleAvatarDrop = (e) => {
    e.preventDefault();
    setAvatarDragOver(false);
    if (uploading) return;
    const f = e.dataTransfer?.files?.[0];
    if (!f) return;
    // For simplicity, opening the editor lets the user crop/zoom the file.
    setEditorOpen(true);
    // Note: the editor's own drop zone will pick up the drop if it occurs
    // *inside* the modal. For a drop *on the avatar*, we surface the same
    // editor. If you want the drop itself to seed the editor with this
    // file, pass it as `initialFile` — but the current editor already
    // accepts drops, so the user can re-drop inside the modal.
  };

  // Save callback invoked by the editor with the cropped File.
  const handleEditorSave = async (file) => {
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('photo', file);
      await apiPostFormData(userEndpoints.uploadPhoto({ id: user.id }), formData);

      // Re-fetch to get updated profile with photo
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

  // Handle profile photo deletion
  const handleRemovePhoto = async () => {
    try {
      await apiDel(userEndpoints.deletePhoto({ id: user.id }));
      toast?.showToast('Profile photo removed successfully', 'success', 'Photo Removed');

      // Re-fetch to get updated profile
      const updatedRes = await apiGet(userEndpoints.profile({ id: user.id }));
      setProfileData(updatedRes.user);
    } catch (err) {
      console.error('Error removing photo:', err);
      toast?.showToast(err.message || 'Failed to remove photo', 'error', 'Remove Failed');
    }
  };

  const save = async () => {
    try {
      await apiPost(userEndpoints.updateProfile({ id: user.id }), {
        name: form.name,
        phone: form.phone,
        dateOfBirth: form.dateOfBirth,
        bloodGroup: form.bloodGroup,
        gender: form.gender,
        address: form.address,
      });

      // Re-fetch the updated profile from API
      const res = await apiGet(userEndpoints.profile({ id: user.id }));
      setProfileData(res.user);

      updateUser(form);
      setSaved(true);
      setIsEditing(false);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      console.error('Error updating profile:', err);
      updateUser(form);
      setSaved(true);
      setIsEditing(false);
      setTimeout(() => setSaved(false), 3000);
    }
  };

  const cancel = () => {
    setForm({
      name: profileData?.name || user?.name || '',
      phone: profileData?.phone || '',
      dateOfBirth: profileData?.dateOfBirth || '',
      bloodGroup: profileData?.bloodGroup || 'A+',
      gender: profileData?.gender || 'Male',
      address: profileData?.address || '',
    });
    setIsEditing(false);
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
    <div className="fade-in" style={{ maxWidth: 680, margin: '0 auto', padding: '0 16px' }}>
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <h1 style={{
          fontFamily: 'var(--font-display)',
          fontSize: 28,
          fontStyle: 'italic',
          marginBottom: 4
        }}>
          My Profile
        </h1>
        <p style={{ color: 'var(--muted)', fontSize: 14 }}>
          Manage your personal information and medical details
        </p>
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
      <Card style={{ padding: 0, overflow: 'hidden' }}>
        {/* Profile Header */}
        <div
          style={{
            background: 'linear-gradient(135deg, var(--sage) 0%, var(--sage-mid) 100%)',
            padding: '32px 28px',
            position: 'relative',
          }}
        >
          <div className="profile-card-header" style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
            {/* Profile Photo Container */}
            <div
              className={`patient-avatar-wrap${avatarDragOver ? ' patient-avatar-wrap--over' : ''}`}
              style={{
                position: 'relative',
                width: 90,
                height: 90,
                borderRadius: '50%',
                background: 'rgba(255,255,255,0.95)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
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
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                  }}
                  onError={(e) => {
                    e.target.style.display = 'none';
                  }}
                />
              ) : (
                <Avatar name={displayData?.name} size={70} color="sage" />
              )}

              {/* Hover overlay with "Edit photo" hint */}
              <div className="patient-avatar-overlay">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                  <circle cx="12" cy="13" r="4" />
                </svg>
              </div>

              {/* Camera icon badge (always visible) */}
              <div
                className="patient-avatar-badge"
                style={{
                  position: 'absolute',
                  bottom: 0,
                  right: 0,
                  width: 32,
                  height: 32,
                  borderRadius: '50%',
                  background: 'var(--sage-dark)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '3px solid #fff',
                  fontSize: 14,
                }}
              >
                📷
              </div>
            </div>

            {/* File input removed — the editor modal handles file selection. */}

            <div style={{ color: '#fff', flex: 1 }}>
              <div style={{ fontSize: 24, fontWeight: 800, marginBottom: 4 }}>
                {displayData?.name || 'Unknown'}
              </div>
              <div style={{ fontSize: 14, opacity: 0.9, marginBottom: 8 }}>
                {displayData?.email || 'No email'}
              </div>
              <Badge text="Patient" color="white" />
            </div>

            {/* Action Buttons — stacked vertically on the right */}
            {!isEditing && (
              <div style={{ position: 'absolute', right: 20, top: 20, display: 'flex', flexDirection: 'column', gap: 8 }}>
                <IconButton variant="edit" dark onClick={() => setIsEditing(true)} title="Edit profile" />
                <IconButton
                  variant="close"
                  dark
                  disabled={!photoUrl}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (photoUrl) {
                      handleRemovePhoto();
                    } else {
                      toast?.showToast('No profile photo to remove', 'warning', 'No Photo');
                    }
                  }}
                  title={photoUrl ? 'Remove photo' : 'No photo to remove'}
                />
              </div>
            )}
          </div>

          {/* Upload status */}
          {uploading && (
            <div
              style={{
                marginTop: 16,
                padding: '10px 14px',
                background: 'rgba(255,255,255,0.2)',
                borderRadius: 8,
                color: '#fff',
                fontSize: 13,
                display: 'flex',
                alignItems: 'center',
                gap: 8,
              }}
            >
              <span style={{ fontSize: 16 }}>⏳</span>
              Uploading photo...
            </div>
          )}
        </div>

        {/* Profile Details */}
        <div style={{ padding: 28 }}>
          {isEditing ? (
            /* Edit Mode */
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <Field label="Full Name">
                  <input
                    value={form.name}
                    onChange={set('name')}
                    style={{
                      width: '100%',
                      padding: '12px 14px',
                      borderRadius: 10,
                      border: '1.5px solid var(--border)',
                      fontSize: 14,
                      outline: 'none',
                      transition: 'border-color 0.2s',
                    }}
                    onFocus={(e) => (e.target.style.borderColor = 'var(--sage)')}
                    onBlur={(e) => (e.target.style.borderColor = 'var(--border)')}
                  />
                </Field>
                <Field label="Phone Number">
                  <input
                    value={form.phone}
                    onChange={set('phone')}
                    placeholder="Enter phone number"
                    style={{
                      width: '100%',
                      padding: '12px 14px',
                      borderRadius: 10,
                      border: '1.5px solid var(--border)',
                      fontSize: 14,
                      outline: 'none',
                      transition: 'border-color 0.2s',
                    }}
                    onFocus={(e) => (e.target.style.borderColor = 'var(--sage)')}
                    onBlur={(e) => (e.target.style.borderColor = 'var(--border)')}
                  />
                </Field>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <Field label="Date of Birth">
                  <input
                    type="date"
                    value={form.dateOfBirth}
                    onChange={set('dateOfBirth')}
                    style={{
                      width: '100%',
                      padding: '12px 14px',
                      borderRadius: 10,
                      border: '1.5px solid var(--border)',
                      fontSize: 14,
                      outline: 'none',
                      transition: 'border-color 0.2s',
                    }}
                    onFocus={(e) => (e.target.style.borderColor = 'var(--sage)')}
                    onBlur={(e) => (e.target.style.borderColor = 'var(--border)')}
                  />
                </Field>
                <Field label="Blood Group">
                  <select
                    value={form.bloodGroup}
                    onChange={set('bloodGroup')}
                    style={{
                      width: '100%',
                      padding: '12px 14px',
                      borderRadius: 10,
                      border: '1.5px solid var(--border)',
                      fontSize: 14,
                      outline: 'none',
                      background: 'var(--surface)',
                      cursor: 'pointer',
                    }}
                    onFocus={(e) => (e.target.style.borderColor = 'var(--sage)')}
                    onBlur={(e) => (e.target.style.borderColor = 'var(--border)')}
                  >
                    {['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'].map((b) => (
                      <option key={b} value={b}>{b}</option>
                    ))}
                  </select>
                </Field>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <Field label="Gender">
                  <select
                    value={form.gender}
                    onChange={set('gender')}
                    style={{
                      width: '100%',
                      padding: '12px 14px',
                      borderRadius: 10,
                      border: '1.5px solid var(--border)',
                      fontSize: 14,
                      outline: 'none',
                      background: 'var(--surface)',
                      cursor: 'pointer',
                    }}
                    onFocus={(e) => (e.target.style.borderColor = 'var(--sage)')}
                    onBlur={(e) => (e.target.style.borderColor = 'var(--border)')}
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </Field>
                <Field label="Address">
                  <input
                    value={form.address}
                    onChange={set('address')}
                    placeholder="City, State"
                    style={{
                      width: '100%',
                      padding: '12px 14px',
                      borderRadius: 10,
                      border: '1.5px solid var(--border)',
                      fontSize: 14,
                      outline: 'none',
                      transition: 'border-color 0.2s',
                    }}
                    onFocus={(e) => (e.target.style.borderColor = 'var(--sage)')}
                    onBlur={(e) => (e.target.style.borderColor = 'var(--border)')}
                  />
                </Field>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
                <button
                  onClick={save}
                  style={{
                    flex: 1,
                    padding: '14px 24px',
                    borderRadius: 10,
                    border: 'none',
                    background: 'var(--sage)',
                    color: '#fff',
                    fontWeight: 700,
                    fontSize: 14,
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                  }}
                  onMouseEnter={(e) => (e.target.style.filter = 'brightness(1.1)')}
                  onMouseLeave={(e) => (e.target.style.filter = 'none')}
                >
                  💾 Save Changes
                </button>
                <button
                  onClick={cancel}
                  style={{
                    padding: '14px 24px',
                    borderRadius: 10,
                    border: '1.5px solid var(--border)',
                    background: 'transparent',
                    color: 'var(--ink2)',
                    fontWeight: 600,
                    fontSize: 14,
                    cursor: 'pointer',
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            /* View Mode */
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--muted)', letterSpacing: 0.5, textTransform: 'uppercase', marginBottom: 6 }}>
                    Full Name
                  </div>
                  <div style={{ fontSize: 16, fontWeight: 600, color: 'var(--ink)' }}>
                    {displayData?.name || 'Not set'}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--muted)', letterSpacing: 0.5, textTransform: 'uppercase', marginBottom: 6 }}>
                    Phone Number
                  </div>
                  <div style={{ fontSize: 16, fontWeight: 600, color: 'var(--ink)' }}>
                    {displayData?.phone || 'Not set'}
                  </div>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--muted)', letterSpacing: 0.5, textTransform: 'uppercase', marginBottom: 6 }}>
                    Date of Birth
                  </div>
                  <div style={{ fontSize: 16, fontWeight: 600, color: 'var(--ink)' }}>
                    {displayData?.dateOfBirth || 'Not set'}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--muted)', letterSpacing: 0.5, textTransform: 'uppercase', marginBottom: 6 }}>
                    Blood Group
                  </div>
                  <div style={{ fontSize: 16, fontWeight: 600, color: 'var(--ink)' }}>
                    {displayData?.bloodGroup || 'Not set'}
                  </div>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--muted)', letterSpacing: 0.5, textTransform: 'uppercase', marginBottom: 6 }}>
                    Gender
                  </div>
                  <div style={{ fontSize: 16, fontWeight: 600, color: 'var(--ink)' }}>
                    {displayData?.gender || 'Not set'}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--muted)', letterSpacing: 0.5, textTransform: 'uppercase', marginBottom: 6 }}>
                    Address
                  </div>
                  <div style={{ fontSize: 16, fontWeight: 600, color: 'var(--ink)' }}>
                    {displayData?.address || 'Not set'}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* Account Info Card */}
      <Card style={{ marginTop: 20, padding: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
          <div style={{ fontSize: 20 }}>ℹ️</div>
          <div style={{ fontSize: 16, fontWeight: 700 }}>Account Information</div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--muted)', letterSpacing: 0.5, textTransform: 'uppercase', marginBottom: 4 }}>
              Email Address
            </div>
            <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--ink)' }}>
              {displayData?.email}
            </div>
          </div>
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--muted)', letterSpacing: 0.5, textTransform: 'uppercase', marginBottom: 4 }}>
              Account Type
            </div>
            <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--ink)', textTransform: 'capitalize' }}>
              {displayData?.role}
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
