'use client';

import { Badge, Card } from '@/components/ui';
import { useAppStore } from '@/lib/store-client';

export default function PatientPrescriptionsPage() {
  const { user, getPatientPrescriptions } = useAppStore();
  const prescriptions = getPatientPrescriptions(user?.id);

  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontStyle: 'italic' }}>
        Prescriptions
      </div>
      {prescriptions.length === 0 ? (
        <Card>
          <div style={{ textAlign: 'center', padding: '48px 24px', color: 'var(--muted)' }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>💊</div>
            <div style={{ fontWeight: 700, fontSize: 16, color: 'var(--ink2)', marginBottom: 6 }}>
              No prescriptions
            </div>
            <div style={{ fontSize: 14 }}>Your prescriptions will appear here</div>
          </div>
        </Card>
      ) : (
        prescriptions.map((p) => (
          <Card key={p.id}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 14 }}>
              <div>
                <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 2 }}>{p.doctorName}</div>
                <div style={{ fontSize: 13, color: 'var(--muted)' }}>{p.date}</div>
                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--rose)', marginTop: 4 }}>
                  Diagnosis: {p.diagnosis}
                </div>
              </div>
              <span
                style={{
                  background: 'var(--sky-light)',
                  color: 'var(--sky)',
                  padding: '3px 10px',
                  borderRadius: 20,
                  fontSize: 12,
                  fontWeight: 700,
                }}
              >
                Rx
              </span>
            </div>
            <div style={{ background: 'var(--bg)', borderRadius: 9, overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                <thead>
                  <tr style={{ background: 'var(--border)' }}>
                    {['Medicine', 'Dose', 'Frequency', 'Duration'].map((h) => (
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
                  {p.medicines.map((m, i) => (
                    <tr key={i} style={{ borderBottom: '1px solid var(--border)' }}>
                      {[m.name, m.dose, m.freq, m.duration].map((v, j) => (
                        <td key={j} style={{ padding: '8px 12px' }}>
                          {v}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {p.notes && (
              <div style={{ marginTop: 12, fontSize: 13, color: 'var(--muted)', fontStyle: 'italic' }}>
                📝 {p.notes}
              </div>
            )}
          </Card>
        ))
      )}
    </div>
  );
}
