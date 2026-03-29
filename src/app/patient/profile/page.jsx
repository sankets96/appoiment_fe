'use client';

import { useState } from 'react';
import { Card, Avatar, Field } from '@/components/ui';
import { useAppStore } from '@/lib/store-client';

export default function PatientProfilePage() {
  const { user, getUserById, updateUser } = useAppStore();
  const cu = getUserById(user?.id);

  const [form, setForm] = useState({
    name: cu?.name || '',
    phone: cu?.phone || '',
    dob: cu?.dob || '',
    blood: cu?.blood || 'A+',
    gender: cu?.gender || 'Male',
    address: cu?.address || '',
  });
  const [saved, setSaved] = useState(false);
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const save = () => {
    updateUser(form);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 20, maxWidth: 560 }}>
      <div style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontStyle: 'italic' }}>
        My Profile
      </div>
      {saved && (
        <div
          style={{
            background: 'var(--sage-light)',
            border: '1.5px solid var(--sage)',
            color: 'var(--sage)',
            padding: '10px 14px',
            borderRadius: 8,
            fontWeight: 600,
          }}
        >
          ✓ Profile saved!
        </div>
      )}
      <Card>
        <div style={{ display: 'flex', gap: 14, alignItems: 'center', marginBottom: 24 }}>
          <Avatar name={user?.name} size={60} color="sage" />
          <div>
            <div style={{ fontSize: 20, fontWeight: 700 }}>{user?.name}</div>
            <div style={{ color: 'var(--muted)' }}>{user?.email}</div>
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <Field label="Full Name">
            <input value={form.name} onChange={set('name')} />
          </Field>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <Field label="Phone">
              <input value={form.phone} onChange={set('phone')} />
            </Field>
            <Field label="Date of Birth">
              <input type="date" value={form.dob} onChange={set('dob')} />
            </Field>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <Field label="Blood Group">
              <select value={form.blood} onChange={set('blood')}>
                {['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'].map((b) => (
                  <option key={b}>{b}</option>
                ))}
              </select>
            </Field>
            <Field label="Gender">
              <select value={form.gender} onChange={set('gender')}>
                <option>Male</option>
                <option>Female</option>
                <option>Other</option>
              </select>
            </Field>
          </div>
          <Field label="Address">
            <input value={form.address} onChange={set('address')} placeholder="City, State" />
          </Field>
          <button
            onClick={save}
            style={{
              width: 'fit-content',
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
            Save Changes
          </button>
        </div>
      </Card>
    </div>
  );
}
