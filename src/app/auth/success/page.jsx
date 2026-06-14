'use client';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

export default function SuccessPage() {
  const searchParams = useSearchParams();
  const role = searchParams.get('role') || 'patient';
  const message = searchParams.get('message') || '';

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--bg)',
      }}
    >
      <div
        className="fade-in"
        style={{ textAlign: 'center', maxWidth: 400, padding: 40 }}
      >
        <div style={{ fontSize: 72, marginBottom: 20 }}>
          {role === 'doctor' ? '⏳' : '🎉'}
        </div>
        <div
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 28,
            fontStyle: 'italic',
            marginBottom: 10,
          }}
        >
          {role === 'doctor' ? 'Request submitted!' : 'Account verified!'}
        </div>
        <div
          style={{
            color: 'var(--muted)',
            fontSize: 15,
            lineHeight: 1.7,
            marginBottom: 32,
          }}
        >
          {message || (role === 'doctor'
            ? 'Your registration is under review. Admin will verify your credentials before you can log in.'
            : 'Your email has been verified. You can now sign in.')}
        </div>
        <Link
          href="/auth/login"
          style={{
            background: 'var(--sage)',
            color: '#fff',
            border: 'none',
            padding: '12px 32px',
            borderRadius: 9,
            fontWeight: 700,
            fontSize: 15,
            cursor: 'pointer',
            textDecoration: 'none',
            display: 'inline-block',
          }}
        >
          Go to Login →
        </Link>
      </div>
    </div>
  );
}
