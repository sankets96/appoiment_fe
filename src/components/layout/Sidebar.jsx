'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Avatar } from '@/components/ui';

const navConfig = {
  patient: [
    { id: 'dashboard', icon: '🏠', label: 'Dashboard', href: '/patient' },
    { id: 'book', icon: '📅', label: 'Book Appointment', href: '/patient/book' },
    { id: 'appointments', icon: '🗓', label: 'My Appointments', href: '/patient/appointments' },
    { id: 'prescriptions', icon: '💊', label: 'Prescriptions', href: '/patient/prescriptions' },
    { id: 'lab', icon: '🧪', label: 'Lab Reports', href: '/patient/lab-reports' },
    { id: 'relations', icon: '👨‍👩‍👧', label: 'Family Members', href: '/patient/family' },
    { id: 'profile', icon: '👤', label: 'My Profile', href: '/patient/profile' },
  ],
  doctor: [
    { id: 'dashboard', icon: '🏠', label: 'Dashboard', href: '/doctor' },
    { id: 'patients', icon: '👥', label: 'Consultations', href: '/doctor/patients' },
    { id: 'availability', icon: '📆', label: 'Availability', href: '/doctor/availability' },
    { id: 'profile', icon: '🩺', label: 'My Profile', href: '/doctor/profile' },
  ],
  admin: [
    { id: 'dashboard', icon: '🏠', label: 'Dashboard', href: '/admin' },
    { id: 'verify', icon: '✅', label: 'Verify Doctors', href: '/admin/verify-doctors' },
    { id: 'doctors', icon: '🩺', label: 'Manage Doctors', href: '/admin/manage-doctors' },
    { id: 'patients', icon: '👥', label: 'Manage Patients', href: '/admin/manage-patients' },
    { id: 'appointments', icon: '📅', label: 'All Appointments', href: '/admin/appointments' },
  ],
};

export function Sidebar({ user, currentPage }) {
  const pathname = usePathname();
  const navItems = navConfig[user?.role] || [];

  return (
    <aside
      style={{
        width: 230,
        background: 'var(--surface)',
        borderRight: '1.5px solid var(--border)',
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        position: 'sticky',
        top: 0,
        flexShrink: 0,
      }}
    >
      <div
        style={{
          padding: '22px 18px 14px',
          borderBottom: '1.5px solid var(--border)',
        }}
      >
        <div
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 22,
            color: 'var(--sage)',
            fontStyle: 'italic',
          }}
        >
          Medicare+
        </div>
        <div
          style={{
            fontSize: 11,
            color: 'var(--muted)',
            marginTop: 2,
            fontWeight: 600,
            letterSpacing: 0.8,
            textTransform: 'uppercase',
          }}
        >
          {user?.role} Portal
        </div>
      </div>

      <nav
        style={{
          flex: 1,
          padding: '10px 8px',
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
          overflowY: 'auto',
        }}
      >
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.id}
              href={item.href}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '10px 12px',
                borderRadius: 9,
                border: 'none',
                background: isActive ? 'var(--sage-light)' : 'transparent',
                color: isActive ? 'var(--sage)' : 'var(--ink2)',
                fontWeight: isActive ? 700 : 500,
                fontSize: 14,
                textDecoration: 'none',
                transition: 'all .15s',
              }}
            >
              <span style={{ fontSize: 16 }}>{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div
        style={{
          padding: '12px 14px',
          borderTop: '1.5px solid var(--border)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
          <Avatar name={user?.name} size={32} color="sage" />
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, lineHeight: 1.2 }}>{user?.name}</div>
            <div style={{ fontSize: 11, color: 'var(--muted)' }}>{user?.email}</div>
          </div>
        </div>
        <Link
          href="/auth/login"
          style={{
            display: 'block',
            textAlign: 'center',
            padding: '6px 12px',
            borderRadius: 8,
            border: '1.5px solid var(--border)',
            background: 'transparent',
            color: 'var(--ink2)',
            fontSize: 13,
            fontWeight: 600,
            textDecoration: 'none',
          }}
        >
          ← Sign out
        </Link>
      </div>
    </aside>
  );
}
