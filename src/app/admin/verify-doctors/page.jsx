'use client';

import { Badge, Card, Avatar } from '@/components/ui';
import { useAppStore } from '@/lib/store-client';

export default function AdminVerifyDoctorsPage() {
  const { doctorRequests, approveDoctorRequest, rejectDoctorRequest } = useAppStore();

  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontStyle: 'italic' }}>
        Doctor Verification Requests
      </div>

      {doctorRequests.length === 0 ? (
        <Card>
          <div style={{ textAlign: 'center', padding: '48px 24px', color: 'var(--muted)' }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>✅</div>
            <div style={{ fontWeight: 700, fontSize: 16, color: 'var(--ink2)', marginBottom: 6 }}>
              No requests
            </div>
            <div style={{ fontSize: 14 }}>New doctor registrations will appear here</div>
          </div>
        </Card>
      ) : (
        doctorRequests.map((r) => (
          <Card key={r.id}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
                <Avatar name={r.doctorName} size={44} color="sky" />
                <div>
                  <div style={{ fontWeight: 700, fontSize: 15 }}>{r.doctorName}</div>
                  <div style={{ fontSize: 13, color: 'var(--muted)' }}>{r.specialty}</div>
                  <div
                    style={{
                      fontSize: 12,
                      color: 'var(--muted)',
                      marginTop: 2,
                      fontFamily: 'var(--font-mono)',
                    }}
                  >
                    License: {r.license}
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--muted)' }}>Applied: {r.date}</div>
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8 }}>
                <Badge text={r.status} />
                {r.status === 'pending' && (
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button
                      onClick={() => approveDoctorRequest(r.id, r.doctorId)}
                      style={{
                        padding: '6px 12px',
                        borderRadius: 8,
                        border: 'none',
                        background: 'var(--sage)',
                        color: '#fff',
                        fontSize: 13,
                        fontWeight: 600,
                        cursor: 'pointer',
                      }}
                    >
                      ✓ Approve
                    </button>
                    <button
                      onClick={() => rejectDoctorRequest(r.id)}
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
                      ✕ Reject
                    </button>
                  </div>
                )}
              </div>
            </div>
          </Card>
        ))
      )}
    </div>
  );
}
