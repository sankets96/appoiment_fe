'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Heart, Shield, Calendar, Mail, ArrowRight } from 'lucide-react';
import { Field, useToast } from '@/components/ui';
import { useAppStore } from '@/lib/store-client';
import { authEndpoints, apiPost, setToken } from '@/config/api';

function AuthLayout({ children, title, subtitle }) {
  return (
    <div style={{ minHeight: '100vh', display: 'grid', gridTemplateColumns: '1fr 1fr' }} className="auth-layout">
      {/* Left Side - Branding */}
      <div
        style={{
          background: 'linear-gradient(135deg, #2d5a3d 0%, #1a3d28 100%)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: '60px 48px',
          position: 'relative',
          overflow: 'hidden',
        }}
        className="auth-branding-panel"
      >
        {/* Decorative circles */}
        <div style={{ position: 'absolute', top: -100, right: -100, width: 300, height: 300, borderRadius: '50%', background: 'rgba(255,255,255,0.05)' }} />
        <div style={{ position: 'absolute', bottom: -50, left: -50, width: 200, height: 200, borderRadius: '50%', background: 'rgba(255,255,255,0.03)' }} />

        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
            <div style={{
              width: 56, height: 56, borderRadius: 14, background: 'rgba(255,255,255,0.15)',
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <Heart size={28} fill="white" color="white" />
            </div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 42, color: '#fff', fontStyle: 'italic', lineHeight: 1 }}>
              Medicare+
            </div>
          </div>
          <div style={{ color: 'rgba(255,255,255,0.75)', fontSize: 18, lineHeight: 1.6, maxWidth: 380, marginBottom: 48 }}>
            Your trusted platform for seamless healthcare appointments & management
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {[
              { icon: Calendar, text: 'Book appointments instantly' },
              { icon: Shield, text: 'Access prescriptions & lab reports' },
              { icon: Heart, text: "Manage your family's health" },
            ].map(({ icon: Icon, text }) => (
              <div key={text} style={{ display: 'flex', alignItems: 'center', gap: 14, color: 'rgba(255,255,255,0.9)', fontSize: 15 }}>
                <div style={{
                  width: 40, height: 40, borderRadius: 10, background: 'rgba(255,255,255,0.1)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                  <Icon size={18} />
                </div>
                {text}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Side - Form */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: '40px 48px',
          overflowY: 'auto',
          background: '#fafaf8',
        }}
        className="auth-form-panel"
      >
        <div style={{ maxWidth: 420, width: '100%', margin: '0 auto' }}>
          <div style={{ marginBottom: 32 }}>
            <div style={{
              fontFamily: 'var(--font-display)', fontSize: 32, fontWeight: 800, color: '#1a1a1a',
              marginBottom: 8, letterSpacing: -0.5
            }}>
              {title}
            </div>
            <div style={{ color: '#666', fontSize: 15 }}>{subtitle}</div>
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
              width: 48,
              height: 56,
              textAlign: 'center',
              fontSize: 22,
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

export default function ForgotPasswordPage() {
  const router = useRouter();
  const { users } = useAppStore();
  const toast = useToast();
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);
  const [countdown, setCountdown] = useState(60);

  useEffect(() => {
    if (countdown <= 0) return;
    const t = setInterval(() => setCountdown((c) => c - 1), 1000);
    return () => clearInterval(t);
  }, [countdown]);

  const generateOtp = async () => {
    if (!email) {
      toast?.showToast('Please enter your email address', 'error', 'Email Required');
      return;
    }
    setErr('');
    setOtpLoading(true);
    try {
      // Call API to generate OTP
      await apiPost(authEndpoints.forgotPasswordOtp(), { email });
      toast?.showToast('OTP sent to your email', 'success', 'OTP Sent');
      setOtpSent(true);
      setCountdown(60);
    } catch (e) {
      // Show error from API response
      toast?.showToast(e.message || 'Failed to send OTP. Please try again.', 'error', 'Failed to Send OTP');
      setOtpSent(false);
    } finally {
      setOtpLoading(false);
    }
  };

  const verifyOtp = async () => {
    if (otp.replace(/\s/g, '').length !== 6) {
      toast?.showToast('Please enter all 6 digits', 'error', 'Incomplete OTP');
      return;
    }
    setErr('');
    setLoading(true);
    try {
      // Call API to verify OTP and reset password
      const res = await apiPost(authEndpoints.verifyForgotPasswordOtp(), {
        email,
        code: otp.trim(),
      });
      toast?.showToast('OTP verified successfully', 'success', 'OTP Verified');
      // Navigate to reset password page
      router.push(`/auth/reset-password?email=${encodeURIComponent(email)}&token=${res.token}`);
    } catch (e) {
      // Show error from API - do not route to reset password
      toast?.showToast(e.message || 'Invalid OTP. Please try again.', 'error', 'Invalid OTP');
    } finally {
      setLoading(false);
    }
  };

  const resendOtp = async () => {
    setOtpLoading(true);
    setErr('');
    try {
      await apiPost(authEndpoints.forgotPasswordOtp(), { email });
      setCountdown(60);
    } catch (e) {
      await new Promise((r) => setTimeout(r, 500));
      setCountdown(60);
    } finally {
      setOtpLoading(false);
    }
  };

  const maskedEmail = email.replace(/(.{2}).+(@.+)/, '$1****$2');

  return (
    <AuthLayout title="Reset password" subtitle="Enter your email to reset your password">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        {!otpSent ? (
          <>
            {/* Email Field */}
            <Field label="Email Address">
              <div style={{ position: 'relative' }}>
                <div style={{
                  position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)',
                  color: '#999', display: 'flex'
                }}>
                  <Mail size={18} />
                </div>
                <input
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && generateOtp()}
                  style={{
                    width: '100%',
                    padding: '14px 14px 14px 44px',
                    fontSize: 15,
                    border: '1.5px solid #e5e5e3',
                    borderRadius: 10,
                    background: '#fff',
                    outline: 'none',
                    transition: 'all 0.2s',
                    boxSizing: 'border-box',
                  }}
                  onFocus={(e) => e.target.style.borderColor = 'var(--sage)'}
                  onBlur={(e) => e.target.style.borderColor = '#e5e5e3'}
                />
              </div>
            </Field>

            {/* Generate OTP Button */}
            <button
              onClick={generateOtp}
              disabled={otpLoading}
              style={{
                width: '100%',
                padding: '15px',
                fontSize: 16,
                background: 'linear-gradient(135deg, #4a7c59 0%, #3d6b4a 100%)',
                color: '#fff',
                border: 'none',
                borderRadius: 12,
                fontWeight: 700,
                cursor: otpLoading ? 'not-allowed' : 'pointer',
                opacity: otpLoading ? 0.7 : 1,
                transition: 'all 0.2s',
                boxShadow: '0 4px 14px rgba(74,124,89,0.3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
              }}
            >
              {otpLoading ? 'Sending OTP...' : 'Generate OTP'}
              {!otpLoading && <ArrowRight size={18} />}
            </button>
          </>
        ) : (
          <>
            {/* OTP Sent Info */}
            <div style={{ textAlign: 'center', paddingTop: 8 }}>
              <div style={{
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
              }}>
                📧
              </div>
              <div style={{ fontSize: 13, color: 'var(--ink2)', marginBottom: 4 }}>
                OTP sent to your email
              </div>
              <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--sage)' }}>
                {maskedEmail}
              </div>
            </div>

            {/* OTP Input */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div style={{
                fontSize: 12,
                fontWeight: 700,
                color: 'var(--ink2)',
                letterSpacing: 0.5,
                textAlign: 'center',
                textTransform: 'uppercase',
              }}>
                Enter 6-Digit OTP
              </div>
              <OtpBoxes value={otp} onChange={setOtp} disabled={loading} />
            </div>

            {/* Resend OTP */}
            <div style={{ textAlign: 'center', fontSize: 13, color: 'var(--muted)' }}>
              Didn't receive the code?{' '}
              {countdown > 0 ? (
                <span style={{ color: 'var(--muted)' }}>
                  Resend in <strong style={{ color: 'var(--ink2)' }}>{countdown}s</strong>
                </span>
              ) : (
                <button
                  onClick={resendOtp}
                  disabled={otpLoading}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--sage)',
                    fontWeight: 700,
                    cursor: 'pointer',
                    fontSize: 13,
                  }}
                >
                  {otpLoading ? 'Sending...' : 'Resend OTP'}
                </button>
              )}
            </div>
          </>
        )}


        {otpSent && (
          <button
            onClick={verifyOtp}
            disabled={otp.replace(/\s/g, '').length !== 6 || loading}
            style={{
              width: '100%',
              padding: '15px',
              fontSize: 16,
              background: 'linear-gradient(135deg, #4a7c59 0%, #3d6b4a 100%)',
              color: '#fff',
              border: 'none',
              borderRadius: 12,
              fontWeight: 700,
              cursor: otp.replace(/\s/g, '').length !== 6 || loading ? 'not-allowed' : 'pointer',
              opacity: otp.replace(/\s/g, '').length !== 6 || loading ? 0.7 : 1,
              transition: 'all 0.2s',
              boxShadow: '0 4px 14px rgba(74,124,89,0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
            }}
          >
            {loading ? 'Verifying...' : 'Submit'}
            {!loading && <ArrowRight size={18} />}
          </button>
        )}

        <div style={{ textAlign: 'center', fontSize: 15, color: '#666' }}>
          Remember your password?{' '}
          <Link href="/auth/login" style={{ color: 'var(--sage)', fontWeight: 700, textDecoration: 'none' }}>
            Sign in
          </Link>
        </div>
      </div>
    </AuthLayout>
  );
}