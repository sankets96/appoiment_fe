'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Badge, Card, Avatar, EmptyState } from '@/components/ui';
import { useAppStore } from '@/lib/store-client';

export default function PatientDashboard() {
  const router = useRouter();
  const { user, getPatientAppointments, getPatientPrescriptions, getPatientLabReports, getVerifiedDoctors } =
    useAppStore();

  const myAppts = getPatientAppointments(user?.id);
  const upcoming = myAppts.filter((a) => a.status === 'confirmed' || a.status === 'pending');
  const doctors = getVerifiedDoctors();

  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Welcome banner */}
      <div
        style={{
          background: 'var(--sage)',
          borderRadius: 16,
          padding: '28px 32px',
          color: '#fff',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            position: 'absolute',
            right: -20,
            top: -20,
            width: 160,
            height: 160,
            borderRadius: '50%',
            background: 'rgba(255,255,255,.07)',
          }}
        />
        <div
          style={{
            position: 'absolute',
            right: 60,
            bottom: -30,
            width: 100,
            height: 100,
            borderRadius: '50%',
            background: 'rgba(255,255,255,.04)',
          }}
        />
        <div style={{ position: 'relative' }}>
          <div
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 26,
              fontStyle: 'italic',
              marginBottom: 4,
            }}
          >
            Hello, {user?.name?.split(' ')[0]} 👋
          </div>
          <div style={{ opacity: 0.8, fontSize: 14 }}>
            You have <strong>{upcoming.length}</strong> upcoming appointment{upcoming.length !== 1 ? 's' : ''}
          </div>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16 }}>
        {[
          {
            label: 'Total Appointments',
            value: myAppts.length,
            icon: '📅',
            color: 'var(--sage)',
          },
          {
            label: 'Prescriptions',
            value: getPatientPrescriptions(user?.id).length,
            icon: '💊',
            color: 'var(--amber)',
          },
          {
            label: 'Lab Reports',
            value: getPatientLabReports(user?.id).length,
            icon: '🧪',
            color: 'var(--sky)',
          },
        ].map((s) => (
          <Card key={s.label} style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: 12,
                background: s.color + '18',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 20,
              }}
            >
              {s.icon}
            </div>
            <div>
              <div style={{ fontSize: 28, fontWeight: 800, color: s.color, lineHeight: 1 }}>{s.value}</div>
              <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 2 }}>{s.label}</div>
            </div>
          </Card>
        ))}
      </div>

      {/* Recent appointments */}
      <Card>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div style={{ fontWeight: 700, fontSize: 16 }}>Recent Appointments</div>
          <Link
            href="/patient/appointments"
            style={{
              padding: '6px 12px',
              borderRadius: 8,
              border: '1.5px solid var(--sage)',
              background: 'transparent',
              color: 'var(--sage)',
              fontSize: 13,
              fontWeight: 600,
              textDecoration: 'none',
            }}
          >
            View all
          </Link>
        </div>
        {myAppts.length === 0 ? (
          <EmptyState icon="📅" title="No appointments yet" desc="Book your first appointment below" />
        ) : (
          myAppts.slice(0, 3).map((a) => (
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
                <Avatar name={a.doctorName} size={36} color="sage" />
                <div>
                  <div style={{ fontWeight: 600, fontSize: 14 }}>{a.doctorName}</div>
                  <div style={{ fontSize: 12, color: 'var(--muted)' }}>
                    {a.specialty} · {a.date} {a.time}
                  </div>
                </div>
              </div>
              <Badge text={a.status} />
            </div>
          ))
        )}
      </Card>

      {/* Quick doctor list */}
      <Card>
        <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 16 }}>Available Doctors</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          {doctors.slice(0, 4).map((d) => (
            <div
              key={d.id}
              style={{
                border: '1.5px solid var(--border)',
                borderRadius: 10,
                padding: '12px 14px',
                display: 'flex',
                gap: 10,
                alignItems: 'center',
              }}
            >
              <Avatar name={d.name} size={38} color="sage" />
              <div>
                <div style={{ fontWeight: 600, fontSize: 13 }}>{d.name}</div>
                <div style={{ fontSize: 11, color: 'var(--muted)' }}>{d.specialty}</div>
                <div style={{ fontSize: 11, color: 'var(--sage)', fontWeight: 600 }}>₹{d.fee}</div>
              </div>
            </div>
          ))}
        </div>
        <Link
          href="/patient/book"
          style={{
            display: 'block',
            marginTop: 14,
            width: '100%',
            padding: '6px 12px',
            borderRadius: 8,
            border: '1.5px solid var(--sage)',
            background: 'transparent',
            color: 'var(--sage)',
            fontSize: 13,
            fontWeight: 600,
            textDecoration: 'none',
            textAlign: 'center',
          }}
        >
          Book Appointment →
        </Link>
      </Card>
    </div>
  );
}
