'use client';

import { useState } from 'react';
import { Card, Avatar, Field, Modal } from '@/components/ui';
import { useAppStore } from '@/lib/store-client';

export default function PatientFamilyPage() {
  const { user, getUserById, addRelation } = useAppStore();
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ name: '', relation: 'Wife', dob: '', blood: 'A+' });
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const cu = getUserById(user?.id);
  const relations = cu?.relations || [];

  const addRelationHandler = () => {
    if (!form.name) return;
    addRelation(user.id, { ...form });
    setShowAdd(false);
    setForm({ name: '', relation: 'Wife', dob: '', blood: 'A+' });
  };

  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontStyle: 'italic' }}>
          Family Members
        </div>
        <button
          onClick={() => setShowAdd(true)}
          style={{
            padding: '9px 18px',
            borderRadius: 8,
            border: 'none',
            background: 'var(--sage)',
            color: '#fff',
            fontWeight: 600,
            fontSize: 14,
            cursor: 'pointer',
          }}
        >
          + Add Member
        </button>
      </div>

      {relations.length === 0 ? (
        <Card>
          <div style={{ textAlign: 'center', padding: '48px 24px', color: 'var(--muted)' }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>👨‍👩‍👧</div>
            <div style={{ fontWeight: 700, fontSize: 16, color: 'var(--ink2)', marginBottom: 6 }}>
              No family members added
            </div>
            <div style={{ fontSize: 14 }}>Add family members to manage their health</div>
          </div>
        </Card>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(240px,1fr))', gap: 14 }}>
          {relations.map((r, i) => (
            <Card key={i}>
              <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 10 }}>
                <Avatar name={r.name} size={44} color="amber" />
                <div>
                  <div style={{ fontWeight: 700 }}>{r.name}</div>
                  <div style={{ fontSize: 12, color: 'var(--muted)' }}>{r.relation}</div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <span
                  style={{
                    background: 'var(--rose-light)',
                    color: 'var(--rose)',
                    padding: '3px 10px',
                    borderRadius: 20,
                    fontSize: 12,
                    fontWeight: 600,
                  }}
                >
                  {r.blood}
                </span>
                {r.dob && (
                  <span style={{ fontSize: 12, color: 'var(--muted)', padding: '3px 0' }}>DOB: {r.dob}</span>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}

      <Modal open={showAdd} onClose={() => setShowAdd(false)} title="Add Family Member">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <Field label="Name">
            <input value={form.name} onChange={set('name')} placeholder="Member's name" />
          </Field>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <Field label="Relation">
              <select value={form.relation} onChange={set('relation')}>
                {['Wife', 'Husband', 'Son', 'Daughter', 'Father', 'Mother', 'Other'].map((r) => (
                  <option key={r}>{r}</option>
                ))}
              </select>
            </Field>
            <Field label="Blood Group">
              <select value={form.blood} onChange={set('blood')}>
                {['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'].map((b) => (
                  <option key={b}>{b}</option>
                ))}
              </select>
            </Field>
          </div>
          <Field label="Date of Birth">
            <input type="date" value={form.dob} onChange={set('dob')} />
          </Field>
          <div style={{ display: 'flex', gap: 10 }}>
            <button
              onClick={addRelationHandler}
              style={{
                padding: '9px 18px',
                borderRadius: 8,
                border: 'none',
                background: 'var(--sage)',
                color: '#fff',
                fontWeight: 600,
                fontSize: 14,
                cursor: 'pointer',
              }}
            >
              Add Member
            </button>
            <button
              onClick={() => setShowAdd(false)}
              style={{
                padding: '9px 18px',
                borderRadius: 8,
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
      </Modal>
    </div>
  );
}
