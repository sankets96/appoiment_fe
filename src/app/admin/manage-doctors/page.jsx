'use client';

import { Badge, Card, Avatar } from '@/components/ui';
import { useAppStore } from '@/lib/store-client';

export default function AdminManageDoctorsPage() {
  const { getDoctors, toggleDoctorStatus } = useAppStore();
  const doctors = getDoctors();

  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontStyle: 'italic' }}>
        Manage Doctors
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))',
          gap: 14,
        }}
      >
        {doctors.map((d) => (
          <Card key={d.id}>
            <div style={{ display: 'flex', gap: 12, marginBottom: 12 }}>
              <Avatar name={d.name} size={44} color={d.verified ? 'sky' : 'neutral'} />
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700 }}>{d.name}</div>
                <div style={{ fontSize: 12, color: 'var(--muted)' }}>
                  {d.specialty} · {d.experience || ''}
                </div>
              </div>
              <Badge text={d.verified ? 'verified' : 'unverified'} />
            </div>
            <div
              style={{
                fontSize: 12,
                color: 'var(--muted)',
                fontFamily: 'var(--font-mono)',
                marginBottom: 12,
              }}
            >
              {d.license}
            </div>
            <button
              onClick={() => toggleDoctorStatus(d.id)}
              style={{
                padding: '6px 12px',
                borderRadius: 8,
                border: d.verified ? '1.5px solid var(--rose)' : '1.5px solid var(--sage)',
                background: 'transparent',
                color: d.verified ? 'var(--rose)' : 'var(--sage)',
                fontSize: 13,
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              {d.verified ? 'Suspend' : 'Activate'}
            </button>
          </Card>
        ))}
      </div>
    </div>
  );
}
