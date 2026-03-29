'use client';

import { Badge, Card } from '@/components/ui';
import { useAppStore } from '@/lib/store-client';

export default function PatientLabReportsPage() {
  const { user, getPatientLabReports } = useAppStore();
  const labs = getPatientLabReports(user?.id);

  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontStyle: 'italic' }}>
        Lab Reports
      </div>
      {labs.length === 0 ? (
        <Card>
          <div style={{ textAlign: 'center', padding: '48px 24px', color: 'var(--muted)' }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>🧪</div>
            <div style={{ fontWeight: 700, fontSize: 16, color: 'var(--ink2)', marginBottom: 6 }}>
              No lab reports
            </div>
            <div style={{ fontSize: 14 }}>Your lab reports will appear here</div>
          </div>
        </Card>
      ) : (
        labs.map((l) => (
          <Card key={l.id}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 14 }}>
              <div>
                <div style={{ fontWeight: 700, fontSize: 16 }}>{l.title}</div>
                <div style={{ fontSize: 13, color: 'var(--muted)' }}>
                  By {l.doctorName} · {l.date}
                </div>
              </div>
              <span
                style={{
                  background: 'var(--amber-light)',
                  color: 'var(--amber)',
                  padding: '3px 10px',
                  borderRadius: 20,
                  fontSize: 12,
                  fontWeight: 700,
                }}
              >
                Lab
              </span>
            </div>
            <div style={{ background: 'var(--bg)', borderRadius: 9, overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                <thead>
                  <tr style={{ background: 'var(--border)' }}>
                    {['Test', 'Result', 'Normal Range', 'Status'].map((h) => (
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
                  {l.results.map((r, i) => (
                    <tr key={i} style={{ borderBottom: '1px solid var(--border)' }}>
                      <td style={{ padding: '8px 12px' }}>{r.test}</td>
                      <td style={{ padding: '8px 12px', fontWeight: 600 }}>{r.value}</td>
                      <td style={{ padding: '8px 12px', color: 'var(--muted)' }}>{r.normal}</td>
                      <td style={{ padding: '8px 12px' }}>
                        <Badge text={r.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        ))
      )}
    </div>
  );
}
