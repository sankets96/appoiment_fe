'use client';

export function Badge({ text, color = 'sage' }) {
  const colors = {
    sage: 'background:var(--sage-light);color:var(--sage)',
    amber: 'background:var(--amber-light);color:var(--amber)',
    rose: 'background:var(--rose-light);color:var(--rose)',
    sky: 'background:var(--sky-light);color:var(--sky)',
    neutral: 'background:#f0ede8;color:var(--ink2)',
    white: 'background:rgba(255,255,255,0.9);color:#333',
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
  // Lock body scroll when modal is open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  if (!open) return null;
  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        right: 0,
        bottom: 0,
        left: 0,
        background: 'rgba(0,0,0,.55)',
        backdropFilter: 'blur(4px)',
        WebkitBackdropFilter: 'blur(4px)',
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="fade-in"
        style={{
          background: '#fff',
          borderRadius: 16,
          width: 'calc(100% - 40px)',
          maxWidth: width,
          maxHeight: '85vh',
          overflowY: 'auto',
          boxShadow: '0 25px 60px rgba(0,0,0,.25), 0 0 0 1px rgba(0,0,0,.05)',
        }}
      >
        <div
          style={{
            padding: '20px 24px',
            borderBottom: '1.5px solid var(--border)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            position: 'sticky',
            top: 0,
            background: '#fff',
            borderRadius: '16px 16px 0 0',
            zIndex: 1,
          }}
        >
          <div style={{ fontSize: 17, fontWeight: 700, color: 'var(--ink)' }}>{title}</div>
          <button
            onClick={onClose}
            style={{
              width: 32,
              height: 32,
              borderRadius: 8,
              background: 'var(--card)',
              border: '1.5px solid var(--border)',
              color: 'var(--muted)',
              fontSize: 18,
              lineHeight: 1,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all .18s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'var(--rose-light)';
              e.currentTarget.style.borderColor = 'var(--rose)';
              e.currentTarget.style.color = 'var(--rose)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'var(--card)';
              e.currentTarget.style.borderColor = 'var(--border)';
              e.currentTarget.style.color = 'var(--muted)';
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

// Toast component - matches the clean, attractive design from reference
export function Toast({ title, message, type = 'success', onClose }) {
  const styles = {
    success: {
      border: '#10b981',
      bg: '#ffffff',
      iconBg: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
      icon: '✓',
      text: '#065f46',
    },
    error: {
      border: '#ef4444',
      bg: '#ffffff',
      iconBg: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
      icon: '✕',
      text: '#991b1b',
    },
    warning: {
      border: '#f59e0b',
      bg: '#ffffff',
      iconBg: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
      icon: '!',
      text: '#92400e',
    },
    info: {
      border: '#3b82f6',
      bg: '#ffffff',
      iconBg: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
      icon: 'i',
      text: '#1e40af',
    },
  };
  const s = styles[type] || styles.success;

  return (
    <div
      className="fade-in toast-container"
      style={{
        position: 'fixed',
        top: 24,
        right: 24,
        minWidth: 280,
        maxWidth: 360,
        padding: 0,
        borderRadius: 14,
        background: s.bg,
        borderLeft: `4px solid ${s.border}`,
        boxShadow: '0 10px 40px rgba(0,0,0,0.12), 0 0 0 1px rgba(0,0,0,0.04)',
        zIndex: 9999,
        overflow: 'hidden',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '16px 18px 16px 16px' }}>
        {/* Icon circle */}
        <div
          className="toast-icon"
          style={{
            width: 36,
            height: 36,
            borderRadius: '50%',
            background: s.iconBg,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            fontSize: 18,
            fontWeight: 700,
            flexShrink: 0,
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          }}
        >
          {s.icon}
        </div>
        {/* Content */}
        <div style={{ flex: 1, minWidth: 0 }}>
          {title && (
            <div className="toast-title" style={{ fontSize: 15, fontWeight: 700, color: s.text, marginBottom: 2 }}>
              {title}
            </div>
          )}
          <div className="toast-message" style={{ fontSize: 14, color: s.text, opacity: 0.85, lineHeight: 1.4 }}>
            {message}
          </div>
        </div>
        {/* Close button - always visible */}
        {onClose && (
          <button
            className="toast-close"
            onClick={onClose}
            style={{
              background: 'rgba(0,0,0,0.04)',
              border: 'none',
              width: 32,
              height: 32,
              borderRadius: '8px',
              fontSize: 20,
              color: s.text,
              cursor: 'pointer',
              padding: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              transition: 'all 0.15s',
            }}
            onMouseEnter={(e) => { e.target.style.background = 'rgba(0,0,0,0.08)'; e.target.style.transform = 'scale(1.05)'; }}
            onMouseLeave={(e) => { e.target.style.background = 'rgba(0,0,0,0.04)'; e.target.style.transform = 'scale(1)'; }}
          >
            ×
          </button>
        )}
      </div>
    </div>
  );
}

// Simple toast state hook
import { useState, createContext, useContext, useEffect, useRef } from 'react';

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toast, setToast] = useState(null);
  const progressRef = useRef(null);

  const showToast = (message, type = 'success', title) => {
    setToast({ message, type, title });
    // Auto-dismiss after 4 seconds
    setTimeout(() => setToast(null), 4000);
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {toast && (
        <div style={{ position: 'relative' }}>
          <Toast
            title={toast.title}
            message={toast.message}
            type={toast.type}
            onClose={() => setToast(null)}
          />
          {/* Progress bar for auto-dismiss */}
          <div
            ref={progressRef}
            key={`progress-${toast.type}-${Date.now()}`}
            style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              height: 3,
              background: toast.type === 'success' ? '#10b981' :
                          toast.type === 'error' ? '#ef4444' :
                          toast.type === 'warning' ? '#f59e0b' : '#3b82f6',
              borderRadius: '0 0 14px 14px',
              animation: 'shrink 4s linear forwards',
            }}
          />
        </div>
      )}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  return context;
}

// ── Icon Components ──────────────────────────────────────────
export function EditIcon({ size = 16, color = 'currentColor' }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width={size} height={size} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
  );
}

export function BinIcon({ size = 18, color = 'currentColor' }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width={size} height={size} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 6h18" />
      <path d="M8 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2" />
      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
      <line x1="10" y1="11" x2="10" y2="17" />
      <line x1="14" y1="11" x2="14" y2="17" />
    </svg>
  );
}

export function CrossIcon({ size = 16, color = 'currentColor' }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width={size} height={size} fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

export function IconButton({ onClick, title, variant = 'edit', dark = false, disabled = false, children }) {
  const isEdit = variant === 'edit';
  const isDelete = variant === 'delete';
  const isClose = variant === 'close';
  // Determine accent colour: edit → sage, delete/close → rose
  const accent = isEdit ? 'sage' : 'rose';

  const baseBorder = dark
    ? '1.5px solid rgba(255,255,255,0.4)'
    : `1.5px solid var(--${accent}-light)`;
  const hoverBorder = dark
    ? '1.5px solid #fff'
    : `1.5px solid var(--${accent})`;
  const hoverBg = dark
    ? 'rgba(255,255,255,0.2)'
    : `var(--${accent}-light)`;
  const iconColor = dark ? '#fff' : `var(--${accent})`;

  const IconComponent = isEdit ? EditIcon : isDelete ? BinIcon : CrossIcon;
  const iconSize = isDelete ? 18 : 16;

  return (
    <button
      onClick={onClick}
      title={title}
      disabled={disabled}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: 36,
        height: 36,
        borderRadius: 8,
        border: baseBorder,
        background: 'transparent',
        color: iconColor,
        cursor: disabled ? 'not-allowed' : 'pointer',
        transition: 'all .18s',
        opacity: disabled ? 0.5 : 1,
      }}
      onMouseEnter={(e) => {
        if (!disabled) {
          e.currentTarget.style.background = hoverBg;
          e.currentTarget.style.borderColor = hoverBorder;
        }
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = 'transparent';
        e.currentTarget.style.borderColor = baseBorder;
      }}
    >
      {children || <IconComponent size={iconSize} color={iconColor} />}
    </button>
  );
}

export { default as ProfilePhotoEditor } from './ProfilePhotoEditor';
