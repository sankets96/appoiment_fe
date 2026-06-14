'use client';

import { useState } from 'react';
import { Badge, Card, Avatar, Modal, Field, Btn, useToast, IconButton, EditIcon, BinIcon } from '@/components/ui';
import { useAppStore } from '@/lib/store-client';

export default function PatientAppointmentsPage() {
  const { user, getPatientAppointments, cancelAppointment, updateAppointment } = useAppStore();
  const appts = getPatientAppointments(user?.id);
  const toast = useToast();

  const [showEdit, setShowEdit] = useState(false);
  const [editIndex, setEditIndex] = useState(null);
  const [form, setForm] = useState({ date: '', time: '', reason: '' });
  const [errors, setErrors] = useState({});
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [saving, setSaving] = useState(false);

  const openEdit = (index) => {
    const a = appts[index];
    setForm({ date: a.date || '', time: a.time || '', reason: a.reason || '' });
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
    if (!form.date.trim()) e.date = 'Date is required';
    if (!form.time.trim()) e.time = 'Time is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleEdit = () => {
    if (!validateEdit()) return;
    setSaving(true);
    const a = appts[editIndex];
    updateAppointment(a.id, { date: form.date, time: form.time, reason: form.reason });
    setSaving(false);
    setShowEdit(false);
    setEditIndex(null);
    toast?.showToast('Appointment rescheduled successfully', 'success', 'Updated');
  };

  const handleDelete = () => {
    setSaving(true);
    cancelAppointment(appts[deleteConfirm].id);
    setSaving(false);
    setDeleteConfirm(null);
    toast?.showToast('Appointment cancelled', 'success', 'Cancelled');
  };

  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontStyle: 'italic' }}>
        My Appointments
      </div>
      {appts.length === 0 ? (
        <Card>
          <div style={{ textAlign: 'center', padding: '48px 24px', color: 'var(--muted)' }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>📅</div>
            <div style={{ fontWeight: 700, fontSize: 16, color: 'var(--ink2)', marginBottom: 6 }}>
              No appointments
            </div>
            <div style={{ fontSize: 14 }}>Book your first appointment</div>
          </div>
        </Card>
      ) : (
        appts.map((a, i) => (
          <Card key={a.id}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
                <Avatar name={a.doctorName} size={44} color="sage" />
                <div>
                  <div style={{ fontWeight: 700, fontSize: 15 }}>{a.doctorName}</div>
                  <div style={{ fontSize: 13, color: 'var(--muted)' }}>{a.specialty}</div>
                  <div style={{ fontSize: 13, fontWeight: 600, marginTop: 4 }}>
                    📅 {a.date} · ⏰ {a.time}
                  </div>
                  {a.reason && (
                    <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 2 }}>
                      Reason: {a.reason}
                    </div>
                  )}
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8 }}>
                <Badge text={a.status} />
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  {(a.status === 'confirmed' || a.status === 'pending') && (
                    <IconButton variant="edit" onClick={() => openEdit(i)} title="Reschedule" />
                  )}
                  {a.status !== 'cancelled' && a.status !== 'completed' && (
                    <IconButton variant="delete" onClick={() => setDeleteConfirm(i)} title="Cancel appointment" />
                  )}
                </div>
              </div>
            </div>
          </Card>
        ))
      )}

      {/* Edit / Reschedule Modal */}
      <Modal open={showEdit} onClose={() => { setShowEdit(false); setEditIndex(null); setErrors({}); }} title="Reschedule Appointment" width={480}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <Field label="Date" required>
            <input
              type="date"
              value={form.date}
              onChange={set('date')}
              style={{
                width: '100%', padding: '10px 12px', borderRadius: 8,
                border: errors.date ? '1.5px solid var(--rose)' : '1.5px solid var(--border)',
                fontSize: 14, outline: 'none',
              }}
            />
            {errors.date && <div style={{ color: 'var(--rose)', fontSize: 12, marginTop: 4 }}>{errors.date}</div>}
          </Field>
          <Field label="Time" required>
            <input
              type="time"
              value={form.time}
              onChange={set('time')}
              style={{
                width: '100%', padding: '10px 12px', borderRadius: 8,
                border: errors.time ? '1.5px solid var(--rose)' : '1.5px solid var(--border)',
                fontSize: 14, outline: 'none',
              }}
            />
            {errors.time && <div style={{ color: 'var(--rose)', fontSize: 12, marginTop: 4 }}>{errors.time}</div>}
          </Field>
          <Field label="Reason">
            <input
              type="text"
              value={form.reason}
              onChange={set('reason')}
              placeholder="Reason for visit"
              style={{
                width: '100%', padding: '10px 12px', borderRadius: 8,
                border: '1.5px solid var(--border)', fontSize: 14, outline: 'none',
              }}
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
      <Modal open={deleteConfirm !== null} onClose={() => setDeleteConfirm(null)} title="Cancel Appointment" width={420}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ fontSize: 14, color: 'var(--ink2)', lineHeight: 1.5 }}>
            Are you sure you want to cancel your appointment with <strong>{appts[deleteConfirm]?.doctorName}</strong> on <strong>{appts[deleteConfirm]?.date}</strong>? This action cannot be undone.
          </div>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
            <Btn variant="ghost" onClick={() => setDeleteConfirm(null)} disabled={saving}>
              Go Back
            </Btn>
            <Btn variant="danger" onClick={handleDelete} disabled={saving}>
              {saving ? 'Cancelling...' : <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}><BinIcon size={14} color="var(--rose)" /> Cancel Appointment</span>}
            </Btn>
          </div>
        </div>
      </Modal>
    </div>
  );
}