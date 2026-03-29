'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Field } from '@/components/ui';
import { useAppStore } from '@/lib/store-client';
import { authEndpoints, apiPost, setToken } from '@/config/api';

function AuthLayout({ children, title, subtitle }) {
  return (
    <div style={{ minHeight: '100vh', display: 'grid', gridTemplateColumns: '1fr 1fr' }}>
      <div
        style={{
          background: 'var(--sage)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: '60px 48px',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage:
              'radial-gradient(circle at 80% 20%, rgba(255,255,255,.08) 0%, transparent 60%), radial-gradient(circle at 20% 80%, rgba(0,0,0,.1) 0%, transparent 50%)',
          }}
        />
        <div style={{ position: 'relative' }}>
          <div
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 48,
              color: '#fff',
              fontStyle: 'italic',
              lineHeight: 1,
              marginBottom: 12,
            }}
          >
            Medicare+
          </div>
          <div
            style={{
              color: 'rgba(255,255,255,.7)',
              fontSize: 18,
              lineHeight: 1.6,
              maxWidth: 340,
              marginBottom: 48,
            }}
          >
            Your trusted platform for seamless healthcare appointments & management
          </div>
          {[
            'Book appointments instantly',
            'Access prescriptions & lab reports',
            "Manage your family's health",
          ].map((t) => (
            <div
              key={t}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                color: 'rgba(255,255,255,.85)',
                fontSize: 14,
                marginBottom: 16,
              }}
            >
              <span
                style={{
                  width: 22,
                  height: 22,
                  borderRadius: '50%',
                  background: 'rgba(255,255,255,.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 11,
                  flexShrink: 0,
                }}
              >
                ✓
              </span>
              {t}
            </div>
          ))}
        </div>
      </div>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: '60px 48px',
          overflowY: 'auto',
        }}
      >
        <div style={{ maxWidth: 400, width: '100%', margin: '0 auto' }}>
          <div style={{ marginBottom: 28 }}>
            <div
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: 28,
                fontStyle: 'italic',
                marginBottom: 4,
              }}
            >
              {title}
            </div>
            <div style={{ color: 'var(--muted)', fontSize: 14 }}>{subtitle}</div>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  const router = useRouter();
  const { login, users } = useAppStore();
  const [form, setForm] = useState({ email: '', password: '' });
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const handleLogin = async () => {
    setErr('');
    setLoading(true);
    try {
      // ── REAL API ──────────────────────────────────────────
      // const res = await apiPost(authEndpoints.login(), {
      //   email: form.email,
      //   password: form.password,
      // });
      // setToken(res.token);
      // login(res.user);
      // router.push(`/${res.user.role}`);
      // ─────────────────────────────────────────────────────

      // Mock fallback
      await new Promise((r) => setTimeout(r, 500));
      const u = users.find((u) => u.email === form.email && u.password === form.password);
      if (!u) throw new Error('Invalid email or password.');
      if (u.role === 'doctor' && !u.verified)
        throw new Error('Your account is pending admin verification.');
      login(u);
      router.push(`/${u.role}`);
    } catch (e) {
      setErr(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout title="Welcome back" subtitle="Sign in to your Medicare+ account">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <Field label="Email">
          <input
            placeholder="you@example.com"
            value={form.email}
            onChange={set('email')}
            onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
          />
        </Field>
        <Field label="Password">
          <input
            type="password"
            placeholder="••••••"
            value={form.password}
            onChange={set('password')}
            onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
          />
        </Field>
        {err && (
          <div
            style={{
              color: 'var(--rose)',
              fontSize: 13,
              background: 'var(--rose-light)',
              padding: '8px 12px',
              borderRadius: 7,
            }}
          >
            {err}
          </div>
        )}
        <button
          onClick={handleLogin}
          disabled={loading}
          style={{
            width: '100%',
            padding: '11px',
            fontSize: 15,
            background: 'var(--sage)',
            color: '#fff',
            border: 'none',
            borderRadius: 9,
            fontWeight: 700,
            cursor: loading ? 'not-allowed' : 'pointer',
            opacity: loading ? 0.7 : 1,
          }}
        >
          {loading ? 'Signing in…' : 'Sign In →'}
        </button>
        <div style={{ textAlign: 'center', fontSize: 13, color: 'var(--muted)' }}>
          New here?{' '}
          <Link
            href="/auth/register"
            style={{ background: 'none', border: 'none', color: 'var(--sage)', fontWeight: 700, textDecoration: 'none' }}
          >
            Create account
          </Link>
        </div>
        <div
          style={{
            background: 'var(--bg)',
            borderRadius: 8,
            padding: '12px 14px',
            fontSize: 12,
            color: 'var(--muted)',
            border: '1.5px dashed var(--border2)',
          }}
        >
          <div style={{ fontWeight: 700, color: 'var(--ink2)', marginBottom: 4 }}>Demo Logins:</div>
          <div>👤 patient@demo.com / 1234</div>
          <div>🩺 doctor@demo.com / 1234</div>
          <div>⚙️ admin@demo.com / 1234</div>
        </div>
      </div>
    </AuthLayout>
  );
}
