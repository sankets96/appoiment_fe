'use client';

export function Badge({ text, color = 'sage' }) {
  const colors = {
    sage: 'background:var(--sage-light);color:var(--sage)',
    amber: 'background:var(--amber-light);color:var(--amber)',
    rose: 'background:var(--rose-light);color:var(--rose)',
    sky: 'background:var(--sky-light);color:var(--sky)',
    neutral: 'background:#f0ede8;color:var(--ink2)',
  };
  const map = {
    confirmed: 'sage',
    pending: 'amber',
    completed: 'sky',
    cancelled: 'rose',
    verified: 'sage',
    unverified: 'amber',
    normal: 'sage',
    high: 'rose',
    low: 'amber',
  };
  const c = colors[map[text?.toLowerCase()] || color];
  const styleObj = Object.fromEntries(
    c.split(';').filter(Boolean).map((s) => {
      const [k, ...v] = s.split(':');
      return [k.trim(), v.join(':').trim()];
    })
  );
  return (
    <span
      style={{
        ...styleObj,
        padding: '3px 10px',
        borderRadius: 20,
        fontSize: 12,
        fontWeight: 700,
        letterSpacing: 0.3,
      }}
    >
      {text}
    </span>
  );
}

export function Card({ children, style = {} }) {
  return (
    <div
      style={{
        background: 'var(--surface)',
        border: '1.5px solid var(--border)',
        borderRadius: 'var(--radius)',
        padding: 20,
        boxShadow: 'var(--shadow)',
        ...style,
      }}
    >
      {children}
    </div>
  );
}

export function Btn({
  children,
  onClick,
  variant = 'primary',
  size = 'md',
  style = {},
  disabled = false,
  type = 'button',
}) {
  const variants = {
    primary: { background: 'var(--sage)', color: '#fff', border: 'none' },
    outline: { background: 'transparent', color: 'var(--sage)', border: '1.5px solid var(--sage)' },
    ghost: { background: 'transparent', color: 'var(--ink2)', border: '1.5px solid var(--border)' },
    danger: { background: 'transparent', color: 'var(--rose)', border: '1.5px solid var(--rose)' },
    amber: { background: 'var(--amber)', color: '#fff', border: 'none' },
    sky: { background: 'var(--sky)', color: '#fff', border: 'none' },
  };
  const sizes = { sm: '6px 12px', md: '9px 18px', lg: '12px 28px' };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      style={{
        ...variants[variant],
        padding: sizes[size],
        borderRadius: 8,
        fontSize: size === 'sm' ? 13 : 14,
        fontWeight: 600,
        transition: 'all .18s',
        opacity: disabled ? 0.5 : 1,
        cursor: disabled ? 'not-allowed' : 'pointer',
        ...style,
      }}
      onMouseEnter={(e) => {
        if (!disabled) e.currentTarget.style.filter = 'brightness(1.1)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.filter = '';
      }}
    >
      {children}
    </button>
  );
}

export function Field({ label, children, required }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
      <label
        style={{
          fontSize: 12,
          fontWeight: 700,
          color: 'var(--ink2)',
          letterSpacing: 0.5,
          textTransform: 'uppercase',
        }}
      >
        {label}
        {required && <span style={{ color: 'var(--rose)' }}>*</span>}
      </label>
      {children}
    </div>
  );
}

export function Avatar({ name, size = 36, color = 'sage' }) {
  const colors = {
    sage: 'var(--sage)',
    amber: 'var(--amber)',
    rose: 'var(--rose)',
    sky: 'var(--sky)',
    neutral: 'var(--muted)',
  };
  const initials = name
    ?.split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('');

  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        background: colors[color] + '20',
        border: `2px solid ${colors[color]}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: colors[color],
        fontWeight: 800,
        fontSize: size * 0.38,
        flexShrink: 0,
      }}
    >
      {initials}
    </div>
  );
}

export function Modal({ open, onClose, title, children, width = 520 }) {
  if (!open) return null;
  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,.35)',
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
      }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="fade-in"
        style={{
          background: 'var(--surface)',
          borderRadius: 16,
          width: '100%',
          maxWidth: width,
          maxHeight: '90vh',
          overflowY: 'auto',
          boxShadow: '0 24px 64px rgba(0,0,0,.15)',
        }}
      >
        <div
          style={{
            padding: '20px 24px',
            borderBottom: '1.5px solid var(--border)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <div style={{ fontSize: 17, fontWeight: 700 }}>{title}</div>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: 22,
              color: 'var(--muted)',
              lineHeight: 1,
              cursor: 'pointer',
            }}
          >
            ×
          </button>
        </div>
        <div style={{ padding: 24 }}>{children}</div>
      </div>
    </div>
  );
}

export function EmptyState({ icon, title, desc }) {
  return (
    <div style={{ textAlign: 'center', padding: '48px 24px', color: 'var(--muted)' }}>
      <div style={{ fontSize: 40, marginBottom: 12 }}>{icon}</div>
      <div style={{ fontWeight: 700, fontSize: 16, color: 'var(--ink2)', marginBottom: 6 }}>{title}</div>
      <div style={{ fontSize: 14 }}>{desc}</div>
    </div>
  );
}
