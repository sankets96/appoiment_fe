'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Eye, EyeOff, Heart, Shield, Calendar, Mail, Lock, User, Phone, FileText, Check, X } from 'lucide-react';
import { Field } from '@/components/ui';
import { authEndpoints, apiPost } from '@/config/api';

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
            Join thousands of users managing their healthcare appointments seamlessly
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
          <div style={{ marginBottom: 28 }}>
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

// Password strength indicator
function PasswordStrength({ password }) {
  const checks = [
    { label: 'At least 6 characters', valid: password.length >= 6 },
    { label: 'One uppercase letter', valid: /[A-Z]/.test(password) },
    { label: 'One lowercase letter', valid: /[a-z]/.test(password) },
    { label: 'One number', valid: /[0-9]/.test(password) },
    { label: 'One symbol (!@#$%^&*)', valid: /[!@#$%^&*]/.test(password) },
  ];

  const validCount = checks.filter(c => c.valid).length;
  const colors = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#15803d'];
  const strengthColor = validCount === 0 ? '#e5e5e3' : colors[validCount - 1];

  return (
    <div style={{ marginTop: 8 }}>
      <div style={{
        height: 4,
        background: '#e5e5e3',
        borderRadius: 2,
        overflow: 'hidden',
        marginBottom: 8
      }}>
        <div style={{
          height: '100%',
          width: `${(validCount / 5) * 100}%`,
          background: strengthColor,
          transition: 'all 0.3s ease',
          borderRadius: 2,
        }} />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4, fontSize: 11 }}>
        {checks.map((check, i) => (
          <div key={i} style={{
            display: 'flex',
            alignItems: 'center',
            gap: 4,
            color: check.valid ? '#22c55e' : '#9ca3af'
          }}>
            {check.valid ? <Check size={12} /> : <X size={12} />}
            {check.label}
          </div>
        ))}
      </div>
    </div>
  );
}

export default function RegisterPage() {
  const router = useRouter();
  const [role, setRole] = useState('patient');
  const [showPassword, setShowPassword] = useState(false);
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
  const [showPasswordHint, setShowPasswordHint] = useState(false);
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  // Validation functions
  const validatePhone = (phone) => {
    if (!phone) return true; // optional
    return /^\d{10}$/.test(phone);
  };

  const validatePassword = (password) => {
    if (!password) return false;
    return (
      password.length >= 6 &&
      /[A-Z]/.test(password) &&
      /[a-z]/.test(password) &&
      /[0-9]/.test(password) &&
      /[!@#$%^&*]/.test(password)
    );
  };

  const validateDOB = (dob) => {
    if (!dob) return true;
    const selected = new Date(dob);
    const today = new Date();
    today.setHours(23, 59, 59, 999);
    return selected <= today;
  };

  // Get max date for DOB (today)
  const getMaxDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  const submit = async () => {
    setErr('');

    // Validate required fields
    if (!form.name || !form.email || !form.password) {
      setErr('Please fill all required fields.');
      return;
    }

    // Validate phone
    if (form.phone && !validatePhone(form.phone)) {
      setErr('Please enter a valid 10-digit phone number.');
      return;
    }

    // Validate password
    if (!validatePassword(form.password)) {
      setErr('Password must meet all requirements.');
      return;
    }

    // Validate DOB
    if (form.dob && !validateDOB(form.dob)) {
      setErr('Date of birth cannot be in the future.');
      return;
    }

    // Validate email format
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      setErr('Please enter a valid email address.');
      return;
    }

    setLoading(true);
    try {
      // Convert role to capitalized format
      const capitalizedRole = role.charAt(0).toUpperCase() + role.slice(1);

      const payload = {
        name: form.name,
        email: form.email,
        password: form.password,
        phone: form.phone,
        role: capitalizedRole,
      };

      if (role === 'patient') {
        payload.dateOfBirth = form.dob;
        payload.bloodGroup = form.blood;
        payload.gender = form.gender;
      }

      if (role === 'doctor') {
        payload.licenseNumber = form.license;
        payload.experience = form.experience;
      }

      await apiPost(authEndpoints.registerOtp(), payload);
      router.push(`/auth/otp?email=${encodeURIComponent(form.email)}&role=${capitalizedRole}`);
    } catch (e) {
      setErr(e.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    width: '100%',
    padding: '13px 14px',
    fontSize: 14,
    border: '1.5px solid #e5e5e3',
    borderRadius: 10,
    background: '#fff',
    outline: 'none',
    transition: 'all 0.2s',
    boxSizing: 'border-box',
  };

  return (
    <AuthLayout title="Create account" subtitle="Join Medicare+ today">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
        {/* Role toggle */}
        <div
          style={{
            display: 'flex',
            gap: 6,
            background: '#f0f0ed',
            padding: 4,
            borderRadius: 12,
            border: '1.5px solid #e5e5e3',
          }}
        >
          {[
            { key: 'patient', label: 'Patient', icon: '👤' },
            { key: 'doctor', label: 'Doctor', icon: '🩺' },
            { key: 'admin', label: 'Admin', icon: '⚙️' }
          ].map((r) => (
            <button
              key={r.key}
              onClick={() => setRole(r.key)}
              style={{
                flex: 1,
                padding: '10px 8px',
                borderRadius: 9,
                border: 'none',
                background: role === r.key ? '#fff' : 'transparent',
                color: role === r.key ? 'var(--sage)' : '#666',
                fontWeight: role === r.key ? 700 : 500,
                fontSize: 13,
                cursor: 'pointer',
                boxShadow: role === r.key ? '0 2px 8px rgba(0,0,0,0.08)' : 'none',
                transition: 'all 0.2s',
              }}
            >
              <span style={{ marginRight: 4 }}>{r.icon}</span>
              {r.label}
            </button>
          ))}
        </div>

        {/* Full Name */}
        <Field label="Full Name" required>
          <div style={{ position: 'relative' }}>
            <div style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#999' }}>
              <User size={16} />
            </div>
            <input
              placeholder="Enter your full name"
              value={form.name}
              onChange={set('name')}
              style={{ ...inputStyle, paddingLeft: 38 }}
            />
          </div>
        </Field>

        {/* Email */}
        <Field label="Email Address" required>
          <div style={{ position: 'relative' }}>
            <div style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#999' }}>
              <Mail size={16} />
            </div>
            <input
              type="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={set('email')}
              style={{ ...inputStyle, paddingLeft: 38 }}
            />
          </div>
        </Field>

        {/* Password */}
        <Field label="Password" required>
          <div style={{ position: 'relative' }}>
            <div style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#999' }}>
              <Lock size={16} />
            </div>
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="Create a strong password"
              value={form.password}
              onChange={set('password')}
              onFocus={() => setShowPasswordHint(true)}
              onBlur={() => setShowPasswordHint(false)}
              style={{ ...inputStyle, paddingLeft: 38, paddingRight: 38 }}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              style={{
                position: 'absolute',
                right: 10,
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: '#999',
                padding: 4,
              }}
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          {showPasswordHint && form.password && (
            <PasswordStrength password={form.password} />
          )}
        </Field>

        {/* Phone */}
        <Field label="Mobile Number">
          <div style={{ position: 'relative' }}>
            <div style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#999' }}>
              <Phone size={16} />
            </div>
            <input
              type="tel"
              placeholder="10-digit mobile number"
              value={form.phone}
              onChange={(e) => {
                const val = e.target.value.replace(/\D/g, '').slice(0, 10);
                setForm({ ...form, phone: val });
              }}
              maxLength={10}
              style={{ ...inputStyle, paddingLeft: 38 }}
            />
            {form.phone.length > 0 && (
              <div style={{
                position: 'absolute',
                right: 12,
                top: '50%',
                transform: 'translateY(-50%)',
                color: form.phone.length === 10 ? '#22c55e' : '#ef4444',
              }}>
                {form.phone.length}/10
              </div>
            )}
          </div>
        </Field>

        {/* Patient fields */}
        {role === 'patient' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
            <Field label="Date of Birth">
              <input
                type="date"
                value={form.dob}
                onChange={set('dob')}
                max={getMaxDate()}
                style={inputStyle}
              />
            </Field>
            <Field label="Blood Group">
              <select value={form.blood} onChange={set('blood')} style={inputStyle}>
                {['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'].map((b) => (
                  <option key={b}>{b}</option>
                ))}
              </select>
            </Field>
            <Field label="Gender">
              <select value={form.gender} onChange={set('gender')} style={inputStyle}>
                <option>Male</option>
                <option>Female</option>
                <option>Other</option>
              </select>
            </Field>
          </div>
        )}

        {/* Doctor fields */}
        {role === 'doctor' && (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <Field label="Medical License No." required>
                <div style={{ position: 'relative' }}>
                  <div style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#999' }}>
                    <FileText size={16} />
                  </div>
                  <input
                    placeholder="MH-XXXX-XXXXX"
                    value={form.license}
                    onChange={set('license')}
                    style={{ ...inputStyle, paddingLeft: 38 }}
                  />
                </div>
              </Field>
              <Field label="Experience">
                <select value={form.experience} onChange={set('experience')} style={inputStyle}>
                  <option>1–3 years</option>
                  <option>4–7 years</option>
                  <option>8–15 years</option>
                  <option>15+ years</option>
                </select>
              </Field>
            </div>
            <div style={{
              background: '#fffbeb',
              border: '1.5px solid #fcd34d',
              borderRadius: 10,
              padding: '12px 16px',
              fontSize: 13,
              color: '#b45309',
              fontWeight: 500,
            }}>
              ⚠️ Your account will require admin verification before you can login.
            </div>
          </>
        )}

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
          onClick={submit}
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
          {loading ? 'Creating account...' : 'Create Account & Send OTP'}
        </button>

        <div style={{ textAlign: 'center', fontSize: 15, color: '#666' }}>
          Already have an account?{' '}
          <Link href="/auth/login" style={{ color: 'var(--sage)', fontWeight: 700, textDecoration: 'none' }}>
            Sign in
          </Link>
        </div>
      </div>
    </AuthLayout>
  );
}