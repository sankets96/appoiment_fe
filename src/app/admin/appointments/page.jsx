'use client';

import { Badge, Card } from '@/components/ui';
import { useAppStore } from '@/lib/store-client';

export default function AdminAllAppointmentsPage() {
  const { appointments, updateAppointmentStatus } = useAppStore();

  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontStyle: 'italic' }}>
        All Appointments
      </div>

      {appointments.map((a) => (
        <Card key={a.id}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16, flex: 1 }}>
              <div>
                <div
                  style={{
                    fontSize: 11,
                    color: 'var(--muted)',
                    fontWeight: 700,
                    letterSpacing: 0.5,
                  }}
                >
                  PATIENT
                </div>
                <div style={{ fontWeight: 600 }}>{a.patientName}</div>
              </div>
              <div>
                <div
                  style={{
                    fontSize: 11,
                    color: 'var(--muted)',
                    fontWeight: 700,
                    letterSpacing: 0.5,
                  }}
                >
                  DOCTOR
                </div>
                <div style={{ fontWeight: 600 }}>{a.doctorName}</div>
              </div>
              <div>
                <div
                  style={{
                    fontSize: 11,
                    color: 'var(--muted)',
                    fontWeight: 700,
                    letterSpacing: 0.5,
                  }}
                >
                  DATE & TIME
                </div>
                <div style={{ fontWeight: 600 }}>
                  {a.date} · {a.time}
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginLeft: 16 }}>
              <Badge text={a.status} />
              <button
                onClick={() => updateAppointmentStatus(a.id, 'confirmed')}
                style={{
                  padding: '6px 10px',
                  borderRadius: 8,
                  border: '1.5px solid var(--sage)',
                  background: 'transparent',
                  color: 'var(--sage)',
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                ✓
              </button>
              <button
                onClick={() => updateAppointmentStatus(a.id, 'cancelled')}
                style={{
                  padding: '6px 10px',
                  borderRadius: 8,
                  border: '1.5px solid var(--rose)',
                  background: 'transparent',
                  color: 'var(--rose)',
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                ✕
              </button>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
