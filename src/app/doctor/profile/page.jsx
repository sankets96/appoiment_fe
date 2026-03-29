'use client';

import { useState } from 'react';
import { Badge, Card, Avatar, Field } from '@/components/ui';
import { useAppStore } from '@/lib/store-client';

export default function DoctorProfilePage() {
  const { user, getUserById, updateDoctorProfile } = useAppStore();
  const cu = getUserById(user?.id);

  const [form, setForm] = useState({
    name: cu?.name || '',
    phone: cu?.phone || '',
    bio: cu?.bio || '',
    fee: cu?.fee || 500,
  });
  const [saved, setSaved] = useState(false);
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const save = () => {
    updateDoctorProfile(user.id, form);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="fade-in" style={{ maxWidth: 560 }}>
      <div style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontStyle: 'italic', marginBottom: 20 }}>
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
            marginBottom: 16,
          }}
        >
          ✓ Profile saved!
        </div>
      )}
      <Card>
        <div style={{ display: 'flex', gap: 14, alignItems: 'center', marginBottom: 24 }}>
          <Avatar name={user?.name} size={60} color="sky" />
          <div>
            <div style={{ fontSize: 20, fontWeight: 700 }}>{user?.name}</div>
            <div style={{ color: 'var(--muted)' }}>
              {cu?.specialty} · {cu?.license}
            </div>
            <Badge text="verified" />
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
            <Field label="Consultation Fee (₹)">
              <input type="number" value={form.fee} onChange={set('fee')} />
            </Field>
          </div>
          <Field label="Bio">
            <textarea
              rows={3}
              value={form.bio}
              onChange={set('bio')}
              placeholder="About yourself..."
            />
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
