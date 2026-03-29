'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Field } from '@/components/ui';
import { useAppStore } from '@/lib/store-client';
import { authEndpoints, apiPost } from '@/config/api';

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

export default function RegisterPage() {
  const router = useRouter();
  const { login, users, addRelation, addDoctorRequest } = useAppStore();
  const [role, setRole] = useState('patient');
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    dob: '',
    blood: 'A+',
    gender: 'Male',
    specialty: '',
    license: '',
    experience: '1–3 years',
  });
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = async () => {
    if (!form.name || !form.email || !form.password) {
      setErr('Please fill all required fields.');
      return;
    }
    setErr('');
    setLoading(true);
    try {
      // ── REAL API ──────────────────────────────────────────
      // await apiPost(authEndpoints.register(), { ...form, role });
      // await apiPost(authEndpoints.sendOtp(), { email: form.email });
      // router.push(`/auth/otp?email=${form.email}&role=${role}`);
      // ─────────────────────────────────────────────────────

      // Mock: save user to store
      await new Promise((r) => setTimeout(r, 700));
      const newUser = {
        id: 'u' + Date.now(),
        email: form.email,
        password: form.password,
        role,
        name: form.name,
        phone: form.phone,
      };
      if (role === 'patient') {
        newUser.dob = form.dob;
        newUser.blood = form.blood;
        newUser.gender = form.gender;
        newUser.relations = [];
      }
      if (role === 'doctor') {
        newUser.specialty = form.specialty;
        newUser.license = form.license;
        newUser.experience = form.experience;
        newUser.verified = false;
        newUser.fee = 500;
        newUser.available = {};
        newUser.bio = '';
      }
      // Navigate to OTP page with state
      router.push(`/auth/otp?email=${form.email}&role=${role}&userId=${newUser.id}`);
    } catch (e) {
      setErr(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout title="Create account" subtitle="Join Medicare+ today">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {/* Role toggle */}
        <div
          style={{
            display: 'flex',
            gap: 6,
            background: 'var(--bg)',
            padding: 4,
            borderRadius: 10,
            border: '1.5px solid var(--border)',
          }}
        >
          {['patient', 'doctor'].map((r) => (
            <button
              key={r}
              onClick={() => setRole(r)}
              style={{
                flex: 1,
                padding: '8px',
                borderRadius: 7,
                border: 'none',
                background: role === r ? 'var(--surface)' : 'transparent',
                color: role === r ? 'var(--sage)' : 'var(--muted)',
                fontWeight: role === r ? 700 : 500,
                fontSize: 13,
                cursor: 'pointer',
                boxShadow: role === r ? 'var(--shadow)' : 'none',
                textTransform: 'capitalize',
              }}
            >
              {r === 'patient' ? '👤 Patient' : '🩺 Doctor'}
            </button>
          ))}
        </div>

        <Field label="Full Name" required>
          <input placeholder="Your full name" value={form.name} onChange={set('name')} />
        </Field>
        <Field label="Email" required>
          <input type="email" placeholder="you@example.com" value={form.email} onChange={set('email')} />
        </Field>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <Field label="Password" required>
            <input type="password" placeholder="••••••" value={form.password} onChange={set('password')} />
          </Field>
          <Field label="Phone">
            <input placeholder="9876543210" value={form.phone} onChange={set('phone')} />
          </Field>
        </div>

        {role === 'patient' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
            <Field label="Date of Birth">
              <input type="date" value={form.dob} onChange={set('dob')} />
            </Field>
            <Field label="Blood Group">
              <select value={form.blood} onChange={set('blood')}>
                {['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'].map((b) => (
                  <option key={b}>{b}</option>
                ))}
              </select>
            </Field>
            <Field label="Gender">
              <select value={form.gender} onChange={set('gender')}>
                <option>Male</option>
                <option>Female</option>
                <option>Other</option>
              </select>
            </Field>
          </div>
        )}

        {role === 'doctor' && (
          <>
            <Field label="Specialty" required>
              <select value={form.specialty} onChange={set('specialty')}>
                <option value="">— Select —</option>
                {[
                  'General Physician',
                  'Cardiology',
                  'Dermatology',
                  'Neurology',
                  'Orthopedics',
                  'Gynecology',
                  'Pediatrics',
                  'Psychiatry',
                  'ENT',
                  'Ophthalmology',
                ].map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
            </Field>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <Field label="Medical License No." required>
                <input placeholder="MH-XXXX-XXXXX" value={form.license} onChange={set('license')} />
              </Field>
              <Field label="Experience">
                <select value={form.experience} onChange={set('experience')}>
                  <option>1–3 years</option>
                  <option>4–7 years</option>
                  <option>8–15 years</option>
                  <option>15+ years</option>
                </select>
              </Field>
            </div>
            <div
              style={{
                background: 'var(--amber-light)',
                border: '1.5px solid var(--amber)',
                borderRadius: 8,
                padding: '10px 14px',
                fontSize: 13,
                color: 'var(--amber)',
              }}
            >
              ⚠️ Your account will require admin verification before you can login.
            </div>
          </>
        )}

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
          onClick={submit}
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
          {loading ? 'Creating account…' : 'Create Account & Send OTP →'}
        </button>
        <div style={{ textAlign: 'center', fontSize: 13, color: 'var(--muted)' }}>
          Already have an account?{' '}
          <Link
            href="/auth/login"
            style={{ background: 'none', border: 'none', color: 'var(--sage)', fontWeight: 700, textDecoration: 'none' }}
          >
            Sign in
          </Link>
        </div>
      </div>
    </AuthLayout>
  );
}
