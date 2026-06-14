'use client';

import { useState } from 'react';
import { Badge, Card, Modal, Field, Btn, useToast, IconButton, BinIcon } from '@/components/ui';
import { useAppStore } from '@/lib/store-client';

export default function AdminAllAppointmentsPage() {
  const { appointments, updateAppointmentStatus, updateAppointment } = useAppStore();
  const toast = useToast();

  const [showEdit, setShowEdit] = useState(false);
  const [editAppt, setEditAppt] = useState(null);
  const [form, setForm] = useState({ date: '', time: '' });
  const [errors, setErrors] = useState({});
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [saving, setSaving] = useState(false);

  const openEdit = (a) => {
    setEditAppt(a);
    setForm({ date: a.date || '', time: a.time || '' });
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
    updateAppointment(editAppt.id, { date: form.date, time: form.time });
    setSaving(false);
    setShowEdit(false);
    setEditAppt(null);
    toast?.showToast('Appointment rescheduled', 'success', 'Updated');
  };

  const handleDelete = () => {
    setSaving(true);
    updateAppointmentStatus(appointments[deleteConfirm].id, 'cancelled');
    setSaving(false);
    setDeleteConfirm(null);
    toast?.showToast('Appointment cancelled', 'success', 'Cancelled');
  };

  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontStyle: 'italic' }}>
        All Appointments
      </div>

      {appointments.length === 0 ? (
        <Card>
          <div style={{ textAlign: 'center', padding: '48px 24px', color: 'var(--muted)' }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>📅</div>
            <div style={{ fontWeight: 700, fontSize: 16, color: 'var(--ink2)', marginBottom: 6 }}>
              No appointments
            </div>
          </div>
        </Card>
      ) : (
        appointments.map((a, i) => (
          <Card key={a.id}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16, flex: 1 }}>
                <div>
                  <div style={{ fontSize: 11, color: 'var(--muted)', fontWeight: 700, letterSpacing: 0.5 }}>PATIENT</div>
                  <div style={{ fontWeight: 600 }}>{a.patientName}</div>
                </div>
                <div>
                  <div style={{ fontSize: 11, color: 'var(--muted)', fontWeight: 700, letterSpacing: 0.5 }}>DOCTOR</div>
                  <div style={{ fontWeight: 600 }}>{a.doctorName}</div>
                </div>
                <div>
                  <div style={{ fontSize: 11, color: 'var(--muted)', fontWeight: 700, letterSpacing: 0.5 }}>DATE & TIME</div>
                  <div style={{ fontWeight: 600 }}>{a.date} · {a.time}</div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginLeft: 16 }}>
                <Badge text={a.status} />
                {a.status !== 'cancelled' && a.status !== 'completed' && (
                  <IconButton variant="edit" onClick={() => openEdit(a)} title="Reschedule" />
                )}
                {a.status !== 'cancelled' && (
                  <IconButton variant="delete" onClick={() => setDeleteConfirm(i)} title="Cancel appointment" />
                )}
              </div>
            </div>
          </Card>
        ))
      )}

      {/* Reschedule Modal */}
      <Modal open={showEdit} onClose={() => { setShowEdit(false); setEditAppt(null); setErrors({}); }} title="Reschedule Appointment" width={480}>
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
          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 8 }}>
            <Btn variant="ghost" onClick={() => { setShowEdit(false); setEditAppt(null); setErrors({}); }} disabled={saving}>
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
            Are you sure you want to cancel the appointment between <strong>{appointments[deleteConfirm]?.patientName}</strong> and <strong>{appointments[deleteConfirm]?.doctorName}</strong>? This action cannot be undone.
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