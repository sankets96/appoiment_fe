'use client';

import { Badge, Card, Avatar, EmptyState } from '@/components/ui';
import { useAppStore } from '@/lib/store-client';

export default function DoctorDashboard() {
  const { user, getDoctorAppointments } = useAppStore();
  const myAppts = getDoctorAppointments(user?.id);

  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div
        style={{
          background: 'linear-gradient(135deg, var(--sky) 0%, #1a4d6e 100%)',
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
          Welcome, {user?.name} 🩺
        </div>
        <div style={{ opacity: 0.8, fontSize: 14 }}>
          {user?.specialty} · {user?.experience} experience
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16 }}>
        {[
          { label: 'Total Patients', value: myAppts.length, icon: '👥', color: 'var(--sage)' },
          {
            label: 'Confirmed',
            value: myAppts.filter((a) => a.status === 'confirmed').length,
            icon: '✅',
            color: 'var(--sky)',
          },
          {
            label: 'Pending',
            value: myAppts.filter((a) => a.status === 'pending').length,
            icon: '⏳',
            color: 'var(--amber)',
          },
          {
            label: 'Completed',
            value: myAppts.filter((a) => a.status === 'completed').length,
            icon: '📋',
            color: 'var(--sage)',
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

      <Card>
        <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 16 }}>Recent Consultations</div>
        {myAppts.length === 0 ? (
          <EmptyState icon="👥" title="No patients yet" desc="Patient bookings will appear here" />
        ) : (
          myAppts.slice(0, 5).map((a) => (
            <div
              key={a.id}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '12px 0',
                borderBottom: '1.5px solid var(--border)',
              }}
            >
              <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                <Avatar name={a.patientName} size={36} color="sky" />
                <div>
                  <div style={{ fontWeight: 600, fontSize: 14 }}>{a.patientName}</div>
                  <div style={{ fontSize: 12, color: 'var(--muted)' }}>
                    {a.date} · {a.time} · {a.reason}
                  </div>
                </div>
              </div>
              <Badge text={a.status} />
            </div>
          ))
        )}
      </Card>
    </div>
  );
}
