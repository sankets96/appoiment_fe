'use client';

import { useState } from 'react';
import { Badge, Card, Modal, Field, Btn, useToast, IconButton, BinIcon } from '@/components/ui';
import { useAppStore } from '@/lib/store-client';

const emptyResult = () => ({ test: '', value: '', normal: '', status: 'normal' });
const STATUS_OPTIONS = ['normal', 'high', 'low'];

export default function PatientLabReportsPage() {
  const { user, getPatientLabReports, updateLabReport, deleteLabReport } = useAppStore();
  const labs = getPatientLabReports(user?.id);
  const toast = useToast();

  const [showEdit, setShowEdit] = useState(false);
  const [editIndex, setEditIndex] = useState(null);
  const [form, setForm] = useState({ title: '', results: [emptyResult()] });
  const [errors, setErrors] = useState({});
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [saving, setSaving] = useState(false);

  const openEdit = (index) => {
    const l = labs[index];
    setForm({
      title: l.title || '',
      results: l.results && l.results.length > 0 ? l.results.map((r) => ({ ...r })) : [emptyResult()],
    });
    setEditIndex(index);
    setErrors({});
    setShowEdit(true);
  };

  const set = (k) => (e) => {
    setForm((f) => ({ ...f, [k]: e.target.value }));
    setErrors((er) => { const n = { ...er }; delete n[k]; return n; });
  };

  const updateResult = (i, field, value) => {
    setForm((f) => {
      const results = f.results.map((r, idx) => (idx === i ? { ...r, [field]: value } : r));
      return { ...f, results };
    });
  };

  const addResultRow = () => {
    setForm((f) => ({ ...f, results: [...f.results, emptyResult()] }));
  };

  const removeResultRow = (i) => {
    setForm((f) => ({
      ...f,
      results: f.results.length > 1 ? f.results.filter((_, idx) => idx !== i) : f.results,
    }));
  };

  const validateEdit = () => {
    const e = {};
    if (!form.title.trim()) e.title = 'Title is required';
    if (form.results.length === 0 || !form.results.some((r) => r.test.trim())) {
      e.results = 'At least one test name is required';
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleEdit = () => {
    if (!validateEdit()) return;
    setSaving(true);
    const l = labs[editIndex];
    updateLabReport(l.id, { title: form.title, results: form.results });
    setSaving(false);
    setShowEdit(false);
    setEditIndex(null);
    toast?.showToast('Lab report updated', 'success', 'Updated');
  };

  const handleDelete = () => {
    setSaving(true);
    deleteLabReport(labs[deleteConfirm].id);
    setSaving(false);
    setDeleteConfirm(null);
    toast?.showToast('Lab report deleted', 'success', 'Deleted');
  };

  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontStyle: 'italic' }}>
        Lab Reports
      </div>
      {labs.length === 0 ? (
        <Card>
          <div style={{ textAlign: 'center', padding: '48px 24px', color: 'var(--muted)' }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>🧪</div>
            <div style={{ fontWeight: 700, fontSize: 16, color: 'var(--ink2)', marginBottom: 6 }}>
              No lab reports
            </div>
            <div style={{ fontSize: 14 }}>Your lab reports will appear here</div>
          </div>
        </Card>
      ) : (
        labs.map((l, i) => (
          <Card key={l.id}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 14 }}>
              <div>
                <div style={{ fontWeight: 700, fontSize: 16 }}>{l.title}</div>
                <div style={{ fontSize: 13, color: 'var(--muted)' }}>
                  By {l.doctorName} · {l.date}
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span
                  style={{
                    background: 'var(--amber-light)',
                    color: 'var(--amber)',
                    padding: '3px 10px',
                    borderRadius: 20,
                    fontSize: 12,
                    fontWeight: 700,
                  }}
                >
                  Lab
                </span>
                <IconButton variant="edit" onClick={() => openEdit(i)} title="Edit lab report" />
                <IconButton variant="delete" onClick={() => setDeleteConfirm(i)} title="Delete lab report" />
              </div>
            </div>
            <div style={{ background: 'var(--bg)', borderRadius: 9, overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                <thead>
                  <tr style={{ background: 'var(--border)' }}>
                    {['Test', 'Result', 'Normal Range', 'Status'].map((h) => (
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
                  {l.results.map((r, j) => (
                    <tr key={j} style={{ borderBottom: '1px solid var(--border)' }}>
                      <td style={{ padding: '8px 12px' }}>{r.test}</td>
                      <td style={{ padding: '8px 12px', fontWeight: 600 }}>{r.value}</td>
                      <td style={{ padding: '8px 12px', color: 'var(--muted)' }}>{r.normal}</td>
                      <td style={{ padding: '8px 12px' }}>
                        <Badge text={r.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        ))
      )}

      {/* Edit Lab Report Modal */}
      <Modal open={showEdit} onClose={() => { setShowEdit(false); setEditIndex(null); setErrors({}); }} title="Edit Lab Report" width={600}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <Field label="Report Title" required>
            <input
              type="text"
              value={form.title}
              onChange={set('title')}
              placeholder="e.g. CBC Report"
              style={{
                width: '100%', padding: '10px 12px', borderRadius: 8,
                border: errors.title ? '1.5px solid var(--rose)' : '1.5px solid var(--border)',
                fontSize: 14, outline: 'none',
              }}
            />
            {errors.title && <div style={{ color: 'var(--rose)', fontSize: 12, marginTop: 4 }}>{errors.title}</div>}
          </Field>

          <div>
            <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 8, color: 'var(--ink2)' }}>Test Results</div>
            {form.results.map((res, idx) => (
              <div key={idx} style={{ display: 'flex', gap: 8, marginBottom: 8, alignItems: 'center' }}>
                <input
                  type="text" value={res.test} onChange={(e) => updateResult(idx, 'test', e.target.value)}
                  placeholder="Test name" style={{ flex: 2, padding: '8px 10px', borderRadius: 8, border: '1.5px solid var(--border)', fontSize: 13, outline: 'none' }}
                />
                <input
                  type="text" value={res.value} onChange={(e) => updateResult(idx, 'value', e.target.value)}
                  placeholder="Result" style={{ flex: 1, padding: '8px 10px', borderRadius: 8, border: '1.5px solid var(--border)', fontSize: 13, outline: 'none' }}
                />
                <input
                  type="text" value={res.normal} onChange={(e) => updateResult(idx, 'normal', e.target.value)}
                  placeholder="Normal range" style={{ flex: 1, padding: '8px 10px', borderRadius: 8, border: '1.5px solid var(--border)', fontSize: 13, outline: 'none' }}
                />
                <select
                  value={res.status} onChange={(e) => updateResult(idx, 'status', e.target.value)}
                  style={{ padding: '8px 10px', borderRadius: 8, border: '1.5px solid var(--border)', fontSize: 13, outline: 'none' }}
                >
                  {STATUS_OPTIONS.map((s) => (
                    <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                  ))}
                </select>
                {form.results.length > 1 && (
                  <button
                    onClick={() => removeResultRow(idx)}
                    style={{
                      width: 32, height: 32, borderRadius: 8, border: '1.5px solid var(--rose-light)',
                      background: 'transparent', color: 'var(--rose)', cursor: 'pointer', display: 'flex',
                      alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                    }}
                    title="Remove test"
                  >
                    ×
                  </button>
                )}
              </div>
            ))}
            {errors.results && <div style={{ color: 'var(--rose)', fontSize: 12, marginTop: 4 }}>{errors.results}</div>}
            <button
              onClick={addResultRow}
              style={{
                padding: '6px 14px', borderRadius: 8, border: '1.5px solid var(--sage-light)',
                background: 'transparent', color: 'var(--sage)', fontSize: 13, fontWeight: 600,
                cursor: 'pointer', marginTop: 4,
              }}
            >
              + Add Test
            </button>
          </div>

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
      <Modal open={deleteConfirm !== null} onClose={() => setDeleteConfirm(null)} title="Delete Lab Report" width={420}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ fontSize: 14, color: 'var(--ink2)', lineHeight: 1.5 }}>
            Are you sure you want to delete the lab report <strong>{labs[deleteConfirm]?.title}</strong>? This action cannot be undone.
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