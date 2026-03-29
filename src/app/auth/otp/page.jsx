'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
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

function OtpBoxes({ value, onChange, disabled }) {
  const refs = [useRef(), useRef(), useRef(), useRef(), useRef(), useRef()];
  const digits = value.padEnd(6, ' ').split('').slice(0, 6);

  const handleKey = (i, e) => {
    if (e.key === 'Backspace') {
      const cleaned = value.slice(0, i - (value[i] === undefined || value[i] === ' ' ? 1 : 0));
      onChange(cleaned);
      if (i > 0) refs[i - 1].current?.focus();
    } else if (/^[0-9]$/.test(e.key)) {
      const arr = value.split('');
      arr[i] = e.key;
      const next = arr.join('').slice(0, 6);
      onChange(next);
      if (i < 5) refs[i + 1].current?.focus();
    } else if (e.key === 'ArrowLeft' && i > 0) refs[i - 1].current?.focus();
    else if (e.key === 'ArrowRight' && i < 5) refs[i + 1].current?.focus();
  };

  const handlePaste = (e) => {
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pasted) {
      onChange(pasted);
      refs[Math.min(pasted.length, 5)].current?.focus();
    }
    e.preventDefault();
  };

  return (
    <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
      {refs.map((ref, i) => {
        const filled = digits[i] && digits[i].trim();
        return (
          <input
            key={i}
            ref={ref}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={filled ? digits[i] : ''}
            onKeyDown={(e) => handleKey(i, e)}
            onPaste={handlePaste}
            onChange={() => {}}
            onClick={() => ref.current?.select()}
            disabled={disabled}
            style={{
              width: 52,
              height: 60,
              textAlign: 'center',
              fontSize: 24,
              fontWeight: 800,
              borderRadius: 10,
              border: `2px solid ${filled ? 'var(--sage)' : 'var(--border)'}`,
              background: filled ? 'var(--sage-light)' : 'var(--surface)',
              color: 'var(--ink)',
              outline: 'none',
              padding: 0,
              transition: 'all .2s',
              cursor: disabled ? 'not-allowed' : 'text',
              boxShadow: filled ? '0 0 0 3px rgba(74,124,89,.12)' : 'none',
            }}
          />
        );
      })}
    </div>
  );
}

export default function OtpPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login, users } = useAppStore();

  const email = searchParams.get('email') || '';
  const role = searchParams.get('role') || 'patient';
  const userId = searchParams.get('userId') || '';

  const [otp, setOtp] = useState('');
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [countdown, setCountdown] = useState(60);

  useEffect(() => {
    if (countdown <= 0) return;
    const t = setInterval(() => setCountdown((c) => c - 1), 1000);
    return () => clearInterval(t);
  }, [countdown]);

  const verify = async () => {
    if (otp.replace(/\s/g, '').length !== 6) {
      setErr('Please enter all 6 digits.');
      return;
    }
    setErr('');
    setLoading(true);
    try {
      // ── REAL API ──────────────────────────────────────────
      // const res = await apiPost(authEndpoints.verifyOtp(), {
      //   email,
      //   code: otp.trim(),
      // });
      // setToken(res.token);
      // login(res.user);
      // router.push(`/${res.user.role}`);
      // ─────────────────────────────────────────────────────

      // Mock verification (accept any 6-digit code for demo)
      await new Promise((r) => setTimeout(r, 800));
      const u = users.find((u) => u.id === userId);
      if (!u) throw new Error('User not found.');

      if (role === 'doctor') {
        router.push(`/auth/success?role=doctor`);
      } else {
        login(u);
        router.push(`/patient`);
      }
    } catch (e) {
      setErr(e.message);
    } finally {
      setLoading(false);
    }
  };

  const resend = async () => {
    setResendLoading(true);
    setErr('');
    setOtp('');
    try {
      await new Promise((r) => setTimeout(r, 700));
      setCountdown(60);
    } finally {
      setResendLoading(false);
    }
  };

  const maskedEmail = email.replace(/(.{2}).+(@.+)/, '$1****$2');

  return (
    <AuthLayout title="Verify your email" subtitle={`A 6-digit code was sent to ${maskedEmail}`}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        {/* Email icon */}
        <div style={{ textAlign: 'center', paddingTop: 8 }}>
          <div
            style={{
              width: 72,
              height: 72,
              borderRadius: '50%',
              background: 'var(--sage-light)',
              border: '2px solid var(--sage-mid)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 32,
              margin: '0 auto 14px',
            }}
          >
            📧
          </div>
          <div style={{ fontSize: 13, color: 'var(--ink2)' }}>Check your inbox at</div>
          <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--sage)' }}>{email}</div>
        </div>

        {/* OTP boxes */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div
            style={{
              fontSize: 12,
              fontWeight: 700,
              color: 'var(--ink2)',
              letterSpacing: 0.5,
              textAlign: 'center',
              textTransform: 'uppercase',
            }}
          >
            Enter 6-Digit OTP
          </div>
          <OtpBoxes value={otp} onChange={setOtp} disabled={loading} />
        </div>

        {/* API payload preview */}
        <div
          style={{
            background: '#1e1e2e',
            borderRadius: 10,
            padding: '14px 16px',
            border: '1px solid #313149',
          }}
        >
          <div
            style={{
              fontSize: 10,
              fontWeight: 700,
              letterSpacing: 1,
              color: '#6c6c8a',
              marginBottom: 8,
              textTransform: 'uppercase',
            }}
          >
            API Payload → POST /api/auth/verify-otp
          </div>
          <pre
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 13,
              color: '#a6e3a1',
              margin: 0,
              lineHeight: 1.7,
            }}
          >
            {JSON.stringify({ email, code: otp.padEnd(6, '_').slice(0, 6) }, null, 2)}
          </pre>
        </div>

        {err && (
          <div
            style={{
              color: 'var(--rose)',
              fontSize: 13,
              background: 'var(--rose-light)',
              padding: '10px 12px',
              borderRadius: 8,
              textAlign: 'center',
              fontWeight: 600,
            }}
          >
            ⚠️ {err}
          </div>
        )}

        <button
          onClick={verify}
          disabled={otp.replace(/\s/g, '').length !== 6 || loading}
          style={{
            width: '100%',
            padding: '13px',
            fontSize: 15,
            background: 'var(--sage)',
            color: '#fff',
            border: 'none',
            borderRadius: 9,
            fontWeight: 700,
            cursor: otp.replace(/\s/g, '').length !== 6 || loading ? 'not-allowed' : 'pointer',
            opacity: otp.replace(/\s/g, '').length !== 6 || loading ? 0.7 : 1,
          }}
        >
          {loading ? 'Verifying…' : '✓ Verify OTP & Continue'}
        </button>

        {/* Resend */}
        <div style={{ textAlign: 'center', fontSize: 13, color: 'var(--muted)' }}>
          Didn't receive the code?{' '}
          {countdown > 0 ? (
            <span style={{ color: 'var(--muted)' }}>
              Resend in <strong style={{ color: 'var(--ink2)' }}>{countdown}s</strong>
            </span>
          ) : (
            <button
              onClick={resend}
              disabled={resendLoading}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--sage)',
                fontWeight: 700,
                cursor: 'pointer',
                fontSize: 13,
              }}
            >
              {resendLoading ? 'Sending…' : 'Resend OTP'}
            </button>
          )}
        </div>

        <div style={{ textAlign: 'center' }}>
          <Link
            href="/auth/login"
            style={{ background: 'none', border: 'none', color: 'var(--muted)', fontSize: 13, textDecoration: 'none' }}
          >
            ← Use a different email
          </Link>
        </div>
      </div>
    </AuthLayout>
  );
}
