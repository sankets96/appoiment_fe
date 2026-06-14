'use client';

import { useState } from 'react';
import { Card, Avatar, Modal, Field, Btn, useToast, IconButton, BinIcon } from '@/components/ui';
import { useAppStore } from '@/lib/store-client';

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'];
const GENDERS = ['Male', 'Female', 'Other'];

export default function AdminManagePatientsPage() {
  const { getPatients, appointments, updateUser, deleteUser } = useAppStore();
  const patients = getPatients();
  const toast = useToast();

  const [showEdit, setShowEdit] = useState(false);
  const [editIndex, setEditIndex] = useState(null);
  const [form, setForm] = useState({ name: '', phone: '', bloodGroup: '', gender: 'Male', address: '' });
  const [errors, setErrors] = useState({});
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [saving, setSaving] = useState(false);

  const openEdit = (index) => {
    const p = patients[index];
    setForm({
      name: p.name || '',
      phone: p.phone || '',
      bloodGroup: p.blood || p.bloodGroup || 'A+',
      gender: p.gender || 'Male',
      address: p.address || '',
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
    if (!form.name.trim()) e.name = 'Name is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleEdit = () => {
    if (!validateEdit()) return;
    setSaving(true);
    const p = patients[editIndex];
    updateUser(p.id, {
      name: form.name,
      phone: form.phone,
      bloodGroup: form.bloodGroup,
      gender: form.gender,
      address: form.address,
      blood: form.bloodGroup,
    });
    setSaving(false);
    setShowEdit(false);
    setEditIndex(null);
    toast?.showToast('Patient updated successfully', 'success', 'Updated');
  };

  const handleDelete = () => {
    setSaving(true);
    deleteUser(patients[deleteConfirm].id);
    setSaving(false);
    setDeleteConfirm(null);
    toast?.showToast('Patient removed', 'success', 'Removed');
  };

  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontStyle: 'italic' }}>
        Manage Patients
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {patients.map((p, i) => (
          <Card key={p.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
              <Avatar name={p.name} size={40} color="sage" />
              <div>
                <div style={{ fontWeight: 600 }}>{p.name}</div>
                <div style={{ fontSize: 12, color: 'var(--muted)' }}>
                  {p.email} · {p.phone}
                </div>
                {(p.blood || p.bloodGroup) && (
                  <span
                    style={{
                      background: 'var(--rose-light)',
                      color: 'var(--rose)',
                      padding: '2px 8px',
                      borderRadius: 20,
                      fontSize: 11,
                      fontWeight: 600,
                    }}
                  >
                    {p.blood || p.bloodGroup}
                  </span>
                )}
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ fontSize: 13, color: 'var(--muted)' }}>
                {appointments.filter((a) => a.patientId === p.id).length} appointments
              </div>
              <IconButton variant="edit" onClick={() => openEdit(i)} title="Edit patient" />
              <IconButton variant="delete" onClick={() => setDeleteConfirm(i)} title="Remove patient" />
            </div>
          </Card>
        ))}
      </div>

      {patients.length === 0 && (
        <Card>
          <div style={{ textAlign: 'center', padding: '48px 24px', color: 'var(--muted)' }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>👥</div>
            <div style={{ fontWeight: 700, fontSize: 16, color: 'var(--ink2)', marginBottom: 6 }}>
              No patients yet
            </div>
          </div>
        </Card>
      )}

      {/* Edit Patient Modal */}
      <Modal open={showEdit} onClose={() => { setShowEdit(false); setEditIndex(null); setErrors({}); }} title="Edit Patient" width={480}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <Field label="Full Name" required>
            <input
              type="text"
              value={form.name}
              onChange={set('name')}
              placeholder="Enter full name"
              style={{
                width: '100%', padding: '10px 12px', borderRadius: 8,
                border: errors.name ? '1.5px solid var(--rose)' : '1.5px solid var(--border)',
                fontSize: 14, outline: 'none',
              }}
            />
            {errors.name && <div style={{ color: 'var(--rose)', fontSize: 12, marginTop: 4 }}>{errors.name}</div>}
          </Field>
          <Field label="Phone">
            <input
              type="text"
              value={form.phone}
              onChange={set('phone')}
              placeholder="Phone number"
              style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1.5px solid var(--border)', fontSize: 14, outline: 'none' }}
            />
          </Field>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <Field label="Blood Group">
              <select
                value={form.bloodGroup}
                onChange={set('bloodGroup')}
                style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1.5px solid var(--border)', fontSize: 14, outline: 'none' }}
              >
                {BLOOD_GROUPS.map((bg) => (
                  <option key={bg} value={bg}>{bg}</option>
                ))}
              </select>
            </Field>
            <Field label="Gender">
              <select
                value={form.gender}
                onChange={set('gender')}
                style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1.5px solid var(--border)', fontSize: 14, outline: 'none' }}
              >
                {GENDERS.map((g) => (
                  <option key={g} value={g}>{g}</option>
                ))}
              </select>
            </Field>
          </div>
          <Field label="Address">
            <input
              type="text"
              value={form.address}
              onChange={set('address')}
              placeholder="Address"
              style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1.5px solid var(--border)', fontSize: 14, outline: 'none' }}
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
      <Modal open={deleteConfirm !== null} onClose={() => setDeleteConfirm(null)} title="Remove Patient" width={420}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ fontSize: 14, color: 'var(--ink2)', lineHeight: 1.5 }}>
            Are you sure you want to remove <strong>{patients[deleteConfirm]?.name}</strong> from the patient list? This action cannot be undone.
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