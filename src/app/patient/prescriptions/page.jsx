'use client';

import { useState } from 'react';
import { Badge, Card, Modal, Field, Btn, useToast, IconButton, EditIcon, BinIcon } from '@/components/ui';
import { useAppStore } from '@/lib/store-client';

const emptyMedicine = () => ({ name: '', dose: '', freq: '', duration: '' });

export default function PatientPrescriptionsPage() {
  const { user, getPatientPrescriptions, updatePrescription, deletePrescription } = useAppStore();
  const prescriptions = getPatientPrescriptions(user?.id);
  const toast = useToast();

  const [showEdit, setShowEdit] = useState(false);
  const [editIndex, setEditIndex] = useState(null);
  const [form, setForm] = useState({ diagnosis: '', medicines: [emptyMedicine()], notes: '' });
  const [errors, setErrors] = useState({});
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [saving, setSaving] = useState(false);

  const openEdit = (index) => {
    const p = prescriptions[index];
    setForm({
      diagnosis: p.diagnosis || '',
      medicines: p.medicines && p.medicines.length > 0 ? p.medicines.map((m) => ({ ...m })) : [emptyMedicine()],
      notes: p.notes || '',
    });
    setEditIndex(index);
    setErrors({});
    setShowEdit(true);
  };

  const set = (k) => (e) => {
    setForm((f) => ({ ...f, [k]: e.target.value }));
    setErrors((er) => { const n = { ...er }; delete n[k]; return n; });
  };

  const updateMedicine = (i, field, value) => {
    setForm((f) => {
      const medicines = f.medicines.map((m, idx) => (idx === i ? { ...m, [field]: value } : m));
      return { ...f, medicines };
    });
  };

  const addMedicineRow = () => {
    setForm((f) => ({ ...f, medicines: [...f.medicines, emptyMedicine()] }));
  };

  const removeMedicineRow = (i) => {
    setForm((f) => ({
      ...f,
      medicines: f.medicines.length > 1 ? f.medicines.filter((_, idx) => idx !== i) : f.medicines,
    }));
  };

  const validateEdit = () => {
    const e = {};
    if (!form.diagnosis.trim()) e.diagnosis = 'Diagnosis is required';
    if (form.medicines.length === 0 || !form.medicines.some((m) => m.name.trim())) {
      e.medicines = 'At least one medicine name is required';
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleEdit = () => {
    if (!validateEdit()) return;
    setSaving(true);
    const p = prescriptions[editIndex];
    updatePrescription(p.id, {
      diagnosis: form.diagnosis,
      medicines: form.medicines,
      notes: form.notes,
    });
    setSaving(false);
    setShowEdit(false);
    setEditIndex(null);
    toast?.showToast('Prescription updated', 'success', 'Updated');
  };

  const handleDelete = () => {
    setSaving(true);
    deletePrescription(prescriptions[deleteConfirm].id);
    setSaving(false);
    setDeleteConfirm(null);
    toast?.showToast('Prescription deleted', 'success', 'Deleted');
  };

  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontStyle: 'italic' }}>
        Prescriptions
      </div>
      {prescriptions.length === 0 ? (
        <Card>
          <div style={{ textAlign: 'center', padding: '48px 24px', color: 'var(--muted)' }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>💊</div>
            <div style={{ fontWeight: 700, fontSize: 16, color: 'var(--ink2)', marginBottom: 6 }}>
              No prescriptions
            </div>
            <div style={{ fontSize: 14 }}>Your prescriptions will appear here</div>
          </div>
        </Card>
      ) : (
        prescriptions.map((p, i) => (
          <Card key={p.id}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 14 }}>
              <div>
                <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 2 }}>{p.doctorName}</div>
                <div style={{ fontSize: 13, color: 'var(--muted)' }}>{p.date}</div>
                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--rose)', marginTop: 4 }}>
                  Diagnosis: {p.diagnosis}
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span
                  style={{
                    background: 'var(--sky-light)',
                    color: 'var(--sky)',
                    padding: '3px 10px',
                    borderRadius: 20,
                    fontSize: 12,
                    fontWeight: 700,
                  }}
                >
                  Rx
                </span>
                <IconButton variant="edit" onClick={() => openEdit(i)} title="Edit prescription" />
                <IconButton variant="delete" onClick={() => setDeleteConfirm(i)} title="Delete prescription" />
              </div>
            </div>
            <div style={{ background: 'var(--bg)', borderRadius: 9, overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                <thead>
                  <tr style={{ background: 'var(--border)' }}>
                    {['Medicine', 'Dose', 'Frequency', 'Duration'].map((h) => (
                      <th
                        key={h}
                        style={{
                          padding: '8px 12px',
                          textAlign: 'left',
                          fontWeight: 700,
                          fontSize: 12,
                          color: 'var(--ink2)',
                        }}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {p.medicines.map((m, j) => (
                    <tr key={j} style={{ borderBottom: '1px solid var(--border)' }}>
                      {[m.name, m.dose, m.freq, m.duration].map((v, k) => (
                        <td key={k} style={{ padding: '8px 12px' }}>
                          {v}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {p.notes && (
              <div style={{ marginTop: 12, fontSize: 13, color: 'var(--muted)', fontStyle: 'italic' }}>
                📝 {p.notes}
              </div>
            )}
          </Card>
        ))
      )}

      {/* Edit Prescription Modal */}
      <Modal open={showEdit} onClose={() => { setShowEdit(false); setEditIndex(null); setErrors({}); }} title="Edit Prescription" width={600}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <Field label="Diagnosis" required>
            <input
              type="text"
              value={form.diagnosis}
              onChange={set('diagnosis')}
              placeholder="Enter diagnosis"
              style={{
                width: '100%', padding: '10px 12px', borderRadius: 8,
                border: errors.diagnosis ? '1.5px solid var(--rose)' : '1.5px solid var(--border)',
                fontSize: 14, outline: 'none',
              }}
            />
            {errors.diagnosis && <div style={{ color: 'var(--rose)', fontSize: 12, marginTop: 4 }}>{errors.diagnosis}</div>}
          </Field>

          <div>
            <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 8, color: 'var(--ink2)' }}>Medicines</div>
            {form.medicines.map((med, idx) => (
              <div key={idx} style={{ display: 'flex', gap: 8, marginBottom: 8, alignItems: 'center' }}>
                <input
                  type="text" value={med.name} onChange={(e) => updateMedicine(idx, 'name', e.target.value)}
                  placeholder="Name" style={{ flex: 2, padding: '8px 10px', borderRadius: 8, border: '1.5px solid var(--border)', fontSize: 13, outline: 'none' }}
                />
                <input
                  type="text" value={med.dose} onChange={(e) => updateMedicine(idx, 'dose', e.target.value)}
                  placeholder="Dose" style={{ flex: 1, padding: '8px 10px', borderRadius: 8, border: '1.5px solid var(--border)', fontSize: 13, outline: 'none' }}
                />
                <input
                  type="text" value={med.freq} onChange={(e) => updateMedicine(idx, 'freq', e.target.value)}
                  placeholder="Frequency" style={{ flex: 1, padding: '8px 10px', borderRadius: 8, border: '1.5px solid var(--border)', fontSize: 13, outline: 'none' }}
                />
                <input
                  type="text" value={med.duration} onChange={(e) => updateMedicine(idx, 'duration', e.target.value)}
                  placeholder="Duration" style={{ flex: 1, padding: '8px 10px', borderRadius: 8, border: '1.5px solid var(--border)', fontSize: 13, outline: 'none' }}
                />
                {form.medicines.length > 1 && (
                  <button
                    onClick={() => removeMedicineRow(idx)}
                    style={{
                      width: 32, height: 32, borderRadius: 8, border: '1.5px solid var(--rose-light)',
                      background: 'transparent', color: 'var(--rose)', cursor: 'pointer', display: 'flex',
                      alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                    }}
                    title="Remove medicine"
                  >
                    ×
                  </button>
                )}
              </div>
            ))}
            {errors.medicines && <div style={{ color: 'var(--rose)', fontSize: 12, marginTop: 4 }}>{errors.medicines}</div>}
            <button
              onClick={addMedicineRow}
              style={{
                padding: '6px 14px', borderRadius: 8, border: '1.5px solid var(--sage-light)',
                background: 'transparent', color: 'var(--sage)', fontSize: 13, fontWeight: 600,
                cursor: 'pointer', marginTop: 4,
              }}
            >
              + Add Medicine
            </button>
          </div>

          <Field label="Notes">
            <textarea
              value={form.notes}
              onChange={set('notes')}
              placeholder="Additional notes"
              rows={3}
              style={{
                width: '100%', padding: '10px 12px', borderRadius: 8,
                border: '1.5px solid var(--border)', fontSize: 14, outline: 'none',
                resize: 'vertical', fontFamily: 'inherit',
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
      <Modal open={deleteConfirm !== null} onClose={() => setDeleteConfirm(null)} title="Delete Prescription" width={420}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ fontSize: 14, color: 'var(--ink2)', lineHeight: 1.5 }}>
            Are you sure you want to delete this prescription from <strong>{prescriptions[deleteConfirm]?.doctorName}</strong>? This action cannot be undone.
          </div>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
            <Btn variant="ghost" onClick={() => setDeleteConfirm(null)} disabled={saving}>
              Cancel
            </Btn>
            <Btn variant="danger" onClick={handleDelete} disabled={saving}>
              {saving ? 'Deleting...' : <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}><BinIcon size={14} color="var(--rose)" /> Delete</span>}
            </Btn>
          </div>
        </div>
      </Modal>
    </div>
  );
}