'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Eye, EyeOff, Heart, Shield, Calendar, Mail, Lock } from 'lucide-react';
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

export default function LoginPage() {
  const router = useRouter();
  const { login, users } = useAppStore();
  const toast = useToast();
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const handleLogin = async () => {
    if (!form.email || !form.password) {
      setErr('Please enter both email and password');
      return;
    }

    setErr('');
    setLoading(true);
    try {
      // Call the real API
      const res = await apiPost(authEndpoints.login(), {
        email: form.email,
        password: form.password
      });

      // Store token and login user (pass token for session persistence)
      setToken(res.token);
      login(res.user, res.token);
      toast?.showToast(`Welcome back, ${res.user.name}!`, 'success', 'Login Successful');
      router.push(`/${res.user.role}`);
    } catch (e) {
      // Show error as toast
      toast?.showToast(e.message || 'Login failed. Please try again.', 'error', 'Login Failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout title="Welcome back" subtitle="Sign in to continue to your dashboard">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
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
              value={form.email}
              onChange={set('email')}
              onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
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

        {/* Password Field */}
        <Field label="Password">
          <div style={{ position: 'relative' }}>
            <div style={{
              position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)',
              color: '#999', display: 'flex'
            }}>
              <Lock size={18} />
            </div>
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="Enter your password"
              value={form.password}
              onChange={set('password')}
              onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
              style={{
                width: '100%',
                padding: '14px 44px 14px 44px',
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
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              style={{
                position: 'absolute',
                right: 14,
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: '#999',
                padding: 4,
                display: 'flex',
              }}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </Field>

        {/* Forgot Password */}
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <Link href="/auth/forgot" style={{ color: 'var(--sage)', fontSize: 14, fontWeight: 600, textDecoration: 'none' }}>
            Forgot password?
          </Link>
        </div>

        {err && (
          <div style={{
            color: '#c53030',
            fontSize: 14,
            background: '#fff5f5',
            padding: '12px 16px',
            borderRadius: 10,
            border: '1px solid #feb2b2',
            fontWeight: 500,
          }}>
            ⚠️ {err}
          </div>
        )}

        <button
          onClick={handleLogin}
          disabled={loading}
          style={{
            width: '100%',
            padding: '15px',
            fontSize: 16,
            background: 'linear-gradient(135deg, #4a7c59 0%, #3d6b4a 100%)',
            color: '#fff',
            border: 'none',
            borderRadius: 12,
            fontWeight: 700,
            cursor: loading ? 'not-allowed' : 'pointer',
            opacity: loading ? 0.7 : 1,
            transition: 'all 0.2s',
            boxShadow: '0 4px 14px rgba(74,124,89,0.3)',
          }}
          onMouseEnter={(e) => !loading && (e.target.style.transform = 'translateY(-2px)')}
          onMouseLeave={(e) => e.target.style.transform = 'translateY(0)'}
        >
          {loading ? 'Signing in...' : 'Sign In'}
        </button>

        <div style={{ textAlign: 'center', fontSize: 15, color: '#666' }}>
          Don't have an account?{' '}
          <Link href="/auth/register" style={{ color: 'var(--sage)', fontWeight: 700, textDecoration: 'none' }}>
            Create account
          </Link>
        </div>
      </div>
    </AuthLayout>
  );
}