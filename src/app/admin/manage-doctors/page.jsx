'use client';

import { useState, useEffect } from 'react';
import { Badge, Card, Avatar, Modal, Field, Btn, useToast, IconButton, EditIcon, BinIcon } from '@/components/ui';
import { userEndpoints, doctorEndpoints, apiGet, apiPost, apiPut } from '@/config/api';

const SPECIALTIES = [
  'Cardiology', 'Dermatology', 'General Physician', 'Orthopedics',
  'Neurology', 'Pediatrics', 'Oncology', 'Gynecology', 'ENT', 'Ophthalmology', 'Other'
];

export default function AdminManageDoctorsPage() {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  const [showEdit, setShowEdit] = useState(false);
  const [editIndex, setEditIndex] = useState(null);
  const [form, setForm] = useState({ specialty: '', fee: '', bio: '', experience: '' });
  const [errors, setErrors] = useState({});
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchDoctors();
  }, []);

  const fetchDoctors = async () => {
    try {
      const res = await apiGet(userEndpoints.getAllDoctors() + '?status=all');
      setDoctors(res.doctors || []);
    } catch (err) {
      console.log('Error fetching doctors:', err);
      toast?.showToast('Failed to load doctors', 'error', 'Error');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (doctorId, doctorName, currentStatus) => {
    try {
      const newStatus = currentStatus === 'active' ? 'suspended' : 'active';
      await apiPost(doctorEndpoints.updateStatus({ id: doctorId }), { status: newStatus });
      toast?.showToast(
        `Dr. ${doctorName} is now ${newStatus}`,
        newStatus === 'active' ? 'success' : 'warning',
        currentStatus === 'active' ? 'Doctor Suspended' : 'Doctor Activated'
      );
      fetchDoctors();
    } catch (err) {
      toast?.showToast(err.message || 'Failed to update status', 'error', 'Error');
    }
  };

  const openEdit = (index) => {
    const d = doctors[index];
    setForm({
      specialty: d.specialty || '',
      fee: d.fee || '',
      bio: d.bio || '',
      experience: d.experience || '',
    });
    setEditIndex(index);
    setErrors({});
    setShowEdit(true);
  };

  const set = (k) => (e) => {
    setForm((f) => ({ ...f, [k]: e.target.value }));
    setErrors((er) => { const n = { ...er }; delete n[k]; return n; });
  };

  const validateEdit = () => {
    const e = {};
    if (!form.specialty.trim()) e.specialty = 'Specialty is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleEdit = async () => {
    if (!validateEdit()) return;
    setSaving(true);
    try {
      const d = doctors[editIndex];
      await apiPut(userEndpoints.updateProfile({ id: d.user_id || d._id }), {
        specialty: form.specialty,
        fee: form.fee ? Number(form.fee) : 500,
        bio: form.bio,
        experience: form.experience,
      });
      toast?.showToast('Doctor updated successfully', 'success', 'Updated');
      fetchDoctors();
      setShowEdit(false);
      setEditIndex(null);
    } catch (err) {
      toast?.showToast(err.message || 'Failed to update doctor', 'error', 'Error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setSaving(true);
    try {
      const d = doctors[deleteConfirm];
      await apiPost(doctorEndpoints.updateStatus({ id: d._id }), { status: 'suspended', isDeleted: true });
      toast?.showToast('Doctor removed', 'success', 'Removed');
      fetchDoctors();
    } catch (err) {
      toast?.showToast(err.message || 'Failed to remove doctor', 'error', 'Error');
    } finally {
      setSaving(false);
      setDeleteConfirm(null);
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: 48, color: 'var(--muted)' }}>
        Loading doctors...
      </div>
    );
  }

  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontStyle: 'italic' }}>
        Manage Doctors
      </div>

      {doctors.length === 0 ? (
        <Card>
          <div style={{ textAlign: 'center', padding: '48px 24px', color: 'var(--muted)' }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>👨‍⚕️</div>
            <div style={{ fontWeight: 700, fontSize: 16, color: 'var(--ink2)', marginBottom: 6 }}>
              No doctors yet
            </div>
            <div style={{ fontSize: 14 }}>Approved doctors will appear here</div>
          </div>
        </Card>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill,minmax(320px,1fr))',
            gap: 14,
          }}
        >
          {doctors.map((d, i) => (
            <Card key={d._id}>
              <div style={{ display: 'flex', gap: 12, marginBottom: 12 }}>
                <Avatar name={d.name} size={44} color={d.verified ? 'sage' : 'neutral'} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700 }}>{d.name}</div>
                  <div style={{ fontSize: 12, color: 'var(--muted)' }}>
                    {d.specialty || 'General'} · {d.experience || 'N/A'} yrs exp
                  </div>
                </div>
                <Badge text={d.verified ? 'verified' : 'pending'} />
              </div>
              <div
                style={{
                  fontSize: 12,
                  color: 'var(--muted)',
                  fontFamily: 'var(--font-mono)',
                  marginBottom: 8,
                }}
              >
                License: {d.licenseNumber || 'N/A'}
              </div>
              <div style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 12 }}>
                Email: {d.email}
              </div>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <button
                  onClick={() => handleToggleStatus(d._id, d.name, d.status)}
                  disabled={!d.verified}
                  style={{
                    padding: '6px 12px',
                    borderRadius: 8,
                    border: d.status === 'active' ? '1.5px solid var(--rose)' : '1.5px solid var(--sage)',
                    background: d.verified ? 'transparent' : 'var(--border)',
                    color: d.verified ? (d.status === 'active' ? 'var(--rose)' : 'var(--sage)') : 'var(--muted)',
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: d.verified ? 'pointer' : 'not-allowed',
                    opacity: d.verified ? 1 : 0.5,
                  }}
                >
                  {d.verified ? (d.status === 'active' ? 'Suspend' : 'Activate') : 'Pending Approval'}
                </button>
                <IconButton variant="edit" onClick={() => openEdit(i)} title="Edit doctor" />
                <IconButton variant="delete" onClick={() => setDeleteConfirm(i)} title="Remove doctor" />
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Edit Doctor Modal */}
      <Modal open={showEdit} onClose={() => { setShowEdit(false); setEditIndex(null); setErrors({}); }} title="Edit Doctor" width={480}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <Field label="Specialty" required>
            <select
              value={form.specialty}
              onChange={set('specialty')}
              style={{
                width: '100%', padding: '10px 12px', borderRadius: 8,
                border: errors.specialty ? '1.5px solid var(--rose)' : '1.5px solid var(--border)',
                fontSize: 14, outline: 'none',
              }}
            >
              <option value="">Select specialty</option>
              {SPECIALTIES.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
            {errors.specialty && <div style={{ color: 'var(--rose)', fontSize: 12, marginTop: 4 }}>{errors.specialty}</div>}
          </Field>
          <Field label="Consultation Fee (₹)">
            <input
              type="number"
              value={form.fee}
              onChange={set('fee')}
              placeholder="e.g. 500"
              style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1.5px solid var(--border)', fontSize: 14, outline: 'none' }}
            />
          </Field>
          <Field label="Experience">
            <input
              type="text"
              value={form.experience}
              onChange={set('experience')}
              placeholder="e.g. 8 years"
              style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1.5px solid var(--border)', fontSize: 14, outline: 'none' }}
            />
          </Field>
          <Field label="Bio">
            <textarea
              value={form.bio}
              onChange={set('bio')}
              placeholder="Short bio about the doctor"
              rows={3}
              style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1.5px solid var(--border)', fontSize: 14, outline: 'none', resize: 'vertical', fontFamily: 'inherit' }}
            />
          </Field>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 8 }}>
            <Btn variant="ghost" onClick={() => { setShowEdit(false); setEditIndex(null); setErrors({}); }} disabled={saving}>
              Cancel
            </Btn>
            <Btn variant="primary" onClick={handleEdit} disabled={saving}>
              {saving ? 'Saving...' : 'Save Changes'}
            </Btn>
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal open={deleteConfirm !== null} onClose={() => setDeleteConfirm(null)} title="Remove Doctor" width={420}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ fontSize: 14, color: 'var(--ink2)', lineHeight: 1.5 }}>
            Are you sure you want to remove <strong>Dr. {doctors[deleteConfirm]?.name}</strong>? This action cannot be undone.
          </div>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
            <Btn variant="ghost" onClick={() => setDeleteConfirm(null)} disabled={saving}>
              Cancel
            </Btn>
            <Btn variant="danger" onClick={handleDelete} disabled={saving}>
              {saving ? 'Removing...' : <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}><BinIcon size={14} color="var(--rose)" /> Remove</span>}
            </Btn>
          </div>
        </div>
      </Modal>
    </div>
  );
}