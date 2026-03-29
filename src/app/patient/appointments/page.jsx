'use client';

import { Badge, Card, Avatar } from '@/components/ui';
import { useAppStore } from '@/lib/store-client';

export default function PatientAppointmentsPage() {
  const { user, getPatientAppointments, cancelAppointment } = useAppStore();
  const appts = getPatientAppointments(user?.id);

  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontStyle: 'italic' }}>
        My Appointments
      </div>
      {appts.length === 0 ? (
        <Card>
          <div style={{ textAlign: 'center', padding: '48px 24px', color: 'var(--muted)' }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>📅</div>
            <div style={{ fontWeight: 700, fontSize: 16, color: 'var(--ink2)', marginBottom: 6 }}>
              No appointments
            </div>
            <div style={{ fontSize: 14 }}>Book your first appointment</div>
          </div>
        </Card>
      ) : (
        appts.map((a) => (
          <Card key={a.id}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
                <Avatar name={a.doctorName} size={44} color="sage" />
                <div>
                  <div style={{ fontWeight: 700, fontSize: 15 }}>{a.doctorName}</div>
                  <div style={{ fontSize: 13, color: 'var(--muted)' }}>{a.specialty}</div>
                  <div style={{ fontSize: 13, fontWeight: 600, marginTop: 4 }}>
                    📅 {a.date} · ⏰ {a.time}
                  </div>
                  {a.reason && (
                    <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 2 }}>
                      Reason: {a.reason}
                    </div>
                  )}
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8 }}>
                <Badge text={a.status} />
                {(a.status === 'confirmed' || a.status === 'pending') && (
                  <button
                    onClick={() => cancelAppointment(a.id)}
                    style={{
                      padding: '6px 12px',
                      borderRadius: 8,
                      border: '1.5px solid var(--rose)',
                      background: 'transparent',
                      color: 'var(--rose)',
                      fontSize: 13,
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    Cancel
                  </button>
                )}
              </div>
            </div>
          </Card>
        ))
      )}
    </div>
  );
}
