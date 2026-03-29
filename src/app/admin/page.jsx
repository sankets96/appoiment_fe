'use client';

import { Badge, Card, Avatar, EmptyState } from '@/components/ui';
import { useAppStore } from '@/lib/store-client';

export default function AdminDashboard() {
  const { getDoctors, getPatients, appointments, getPendingDoctorRequests } = useAppStore();
  const doctors = getDoctors();
  const patients = getPatients();
  const pending = getPendingDoctorRequests();

  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div
        style={{
          background: 'linear-gradient(135deg, #1a1714 0%, #2d2822 100%)',
          borderRadius: 16,
          padding: '28px 32px',
          color: '#fff',
        }}
      >
        <div
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 26,
            fontStyle: 'italic',
            marginBottom: 4,
          }}
        >
          Admin Dashboard ⚙️
        </div>
        <div style={{ opacity: 0.6, fontSize: 14 }}>Manage the entire Medicare+ platform</div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16 }}>
        {[
          { label: 'Total Doctors', value: doctors.length, icon: '🩺', color: 'var(--sky)' },
          { label: 'Total Patients', value: patients.length, icon: '👥', color: 'var(--sage)' },
          { label: 'Appointments', value: appointments.length, icon: '📅', color: 'var(--amber)' },
          {
            label: 'Pending Verifications',
            value: pending.length,
            icon: '⏳',
            color: 'var(--rose)',
          },
        ].map((s) => (
          <Card key={s.label} style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: 10,
                background: s.color + '18',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 18,
              }}
            >
              {s.icon}
            </div>
            <div>
              <div style={{ fontSize: 22, fontWeight: 800, color: s.color }}>{s.value}</div>
              <div style={{ fontSize: 11, color: 'var(--muted)' }}>{s.label}</div>
            </div>
          </Card>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        <Card>
          <div style={{ fontWeight: 700, marginBottom: 14 }}>Recent Appointments</div>
          {appointments.slice(0, 4).map((a) => (
            <div
              key={a.id}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                padding: '10px 0',
                borderBottom: '1.5px solid var(--border)',
              }}
            >
              <div>
                <div style={{ fontWeight: 600, fontSize: 13 }}>{a.patientName}</div>
                <div style={{ fontSize: 12, color: 'var(--muted)' }}>→ {a.doctorName}</div>
              </div>
              <Badge text={a.status} />
            </div>
          ))}
        </Card>
        <Card>
          <div style={{ fontWeight: 700, marginBottom: 14 }}>Pending Verifications</div>
          {pending.length === 0 ? (
            <EmptyState icon="✅" title="All caught up" desc="No pending verifications" />
          ) : (
            pending.map((r) => (
              <div
                key={r.id}
                style={{
                  padding: '10px 0',
                  borderBottom: '1.5px solid var(--border)',
                }}
              >
                <div style={{ fontWeight: 600, fontSize: 13 }}>{r.doctorName}</div>
                <div style={{ fontSize: 12, color: 'var(--muted)' }}>
                  {r.specialty} · {r.date}
                </div>
              </div>
            ))
          )}
        </Card>
      </div>
    </div>
  );
}
