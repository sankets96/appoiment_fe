'use client';

import { Card, Avatar } from '@/components/ui';
import { useAppStore } from '@/lib/store-client';

export default function AdminManagePatientsPage() {
  const { getPatients, appointments } = useAppStore();
  const patients = getPatients();

  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontStyle: 'italic' }}>
        Manage Patients
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {patients.map((p) => (
          <Card key={p.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
              <Avatar name={p.name} size={40} color="sage" />
              <div>
                <div style={{ fontWeight: 600 }}>{p.name}</div>
                <div style={{ fontSize: 12, color: 'var(--muted)' }}>
                  {p.email} · {p.phone}
                </div>
                {p.blood && (
                  <span
                    style={{
                      background: 'var(--rose-light)',
                      color: 'var(--rose)',
                      padding: '2px 8px',
                      borderRadius: 20,
                      fontSize: 11,
                      fontWeight: 600,
                    }}
                  >
                    {p.blood}
                  </span>
                )}
              </div>
            </div>
            <div style={{ fontSize: 13, color: 'var(--muted)' }}>
              {appointments.filter((a) => a.patientId === p.id).length} appointments
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
