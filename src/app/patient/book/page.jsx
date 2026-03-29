'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Badge, Card, Avatar, Field } from '@/components/ui';
import { useAppStore } from '@/lib/store-client';

export default function BookAppointmentPage() {
  const router = useRouter();
  const { user, getVerifiedDoctors, bookAppointment, updateDoctorAvailability } = useAppStore();

  const [filter, setFilter] = useState('All');
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState({ date: '', day: '', slot: '', reason: '' });
  const [booked, setBooked] = useState(false);

  const specialties = [
    'All',
    'General Physician',
    'Cardiology',
    'Dermatology',
    'Neurology',
    'Orthopedics',
    'Gynecology',
    'Pediatrics',
  ];

  const doctors = getVerifiedDoctors().filter(
    (d) => (filter === 'All' || d.specialty === filter) && d.name.toLowerCase().includes(search.toLowerCase())
  );

  const availableDays = selected ? Object.keys(selected.available || {}) : [];

  const doBook = () => {
    const appointment = {
      id: 'a' + Date.now(),
      patientId: user.id,
      doctorId: selected.id,
      patientName: user.name,
      doctorName: selected.name,
      specialty: selected.specialty,
      date: form.date,
      time: form.slot,
      status: 'confirmed',
      reason: form.reason,
    };

    bookAppointment(appointment);

    // Remove slot from doctor's availability
    if (selected.available?.[form.day]) {
      const updated = { ...selected.available };
      updated[form.day] = updated[form.day].filter((s) => s !== form.slot);
      updateDoctorAvailability(selected.id, updated);
    }

    setBooked(true);
    setTimeout(() => {
      setBooked(false);
      setSelected(null);
      setForm({ date: '', day: '', slot: '', reason: '' });
    }, 2500);
  };

  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontStyle: 'italic' }}>
        Book an Appointment
      </div>

      {booked && (
        <div
          style={{
            background: 'var(--sage-light)',
            border: '1.5px solid var(--sage)',
            color: 'var(--sage)',
            padding: '12px 16px',
            borderRadius: 9,
            fontWeight: 600,
          }}
        >
          ✓ Appointment booked successfully!
        </div>
      )}

      {/* Filters */}
      <Card style={{ padding: '14px 16px' }}>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
          <input
            placeholder="Search doctors..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ width: 200 }}
          />
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {specialties.map((s) => (
              <button
                key={s}
                onClick={() => setFilter(s)}
                style={{
                  padding: '5px 12px',
                  borderRadius: 20,
                  border: '1.5px solid',
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: 'pointer',
                  borderColor: filter === s ? 'var(--sage)' : 'var(--border)',
                  background: filter === s ? 'var(--sage-light)' : 'transparent',
                  color: filter === s ? 'var(--sage)' : 'var(--muted)',
                }}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      </Card>

      {/* Doctor cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(260px,1fr))', gap: 14 }}>
        {doctors.map((d) => (
          <Card
            key={d.id}
            style={{
              cursor: 'pointer',
              border: selected?.id === d.id ? '2px solid var(--sage)' : '1.5px solid var(--border)',
              transition: 'all .18s',
            }}
          >
            <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start', marginBottom: 12 }}>
              <Avatar name={d.name} size={44} color="sage" />
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: 15 }}>{d.name}</div>
                <div style={{ fontSize: 12, color: 'var(--muted)' }}>
                  {d.specialty} · {d.experience}
                </div>
              </div>
              <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--sage)' }}>₹{d.fee}</div>
            </div>
            <div style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 12, lineHeight: 1.5 }}>
              {d.bio}
            </div>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 12 }}>
              {Object.keys(d.available || {}).map((day) => (
                <span
                  key={day}
                  style={{
                    background: 'var(--sage-light)',
                    color: 'var(--sage)',
                    padding: '2px 8px',
                    borderRadius: 20,
                    fontSize: 11,
                    fontWeight: 600,
                  }}
                >
                  {day}
                </span>
              ))}
            </div>
            <button
              onClick={() => setSelected(d)}
              style={{
                width: '100%',
                padding: '6px 12px',
                borderRadius: 8,
                border: selected?.id === d.id ? 'none' : '1.5px solid var(--sage)',
                background: selected?.id === d.id ? 'var(--sage)' : 'transparent',
                color: selected?.id === d.id ? '#fff' : 'var(--sage)',
                fontWeight: 600,
                fontSize: 13,
                cursor: 'pointer',
              }}
            >
              {selected?.id === d.id ? 'Selected ✓' : 'Select Doctor'}
            </button>
          </Card>
        ))}
      </div>

      {/* Booking form */}
      {selected && (
        <Card style={{ border: '2px solid var(--sage)' }}>
          <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 16 }}>Book with {selected.name}</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
            <Field label="Select Day">
              <select
                value={form.day}
                onChange={(e) => setForm({ ...form, day: e.target.value, slot: '' })}
              >
                <option value="">— Choose day —</option>
                {availableDays.map((d) => (
                  <option key={d}>{d}</option>
                ))}
              </select>
            </Field>
            <Field label="Date">
              <input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
            </Field>
          </div>
          {form.day && (
            <Field label="Available Slots">
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 4 }}>
                {(selected.available?.[form.day] || []).map((s) => (
                  <button
                    key={s}
                    onClick={() => setForm({ ...form, slot: s })}
                    style={{
                      padding: '7px 16px',
                      borderRadius: 8,
                      border: '1.5px solid',
                      cursor: 'pointer',
                      borderColor: form.slot === s ? 'var(--sage)' : 'var(--border)',
                      background: form.slot === s ? 'var(--sage-light)' : 'transparent',
                      color: form.slot === s ? 'var(--sage)' : 'var(--ink)',
                      fontWeight: 600,
                      fontSize: 13,
                    }}
                  >
                    {s}
                  </button>
                ))}
                {(selected.available?.[form.day] || []).length === 0 && (
                  <div style={{ color: 'var(--muted)', fontSize: 13 }}>No slots for this day.</div>
                )}
              </div>
            </Field>
          )}
          <div style={{ marginTop: 14 }}>
            <Field label="Reason for Visit">
              <textarea
                placeholder="Describe your symptoms or reason..."
                rows={3}
                value={form.reason}
                onChange={(e) => setForm({ ...form, reason: e.target.value })}
              />
            </Field>
          </div>
          <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
            <button
              onClick={doBook}
              disabled={!form.day || !form.date || !form.slot}
              style={{
                padding: '9px 18px',
                borderRadius: 8,
                border: 'none',
                background: 'var(--sage)',
                color: '#fff',
                fontWeight: 600,
                fontSize: 14,
                cursor: !form.day || !form.date || !form.slot ? 'not-allowed' : 'pointer',
                opacity: !form.day || !form.date || !form.slot ? 0.5 : 1,
              }}
            >
              Confirm Booking
            </button>
            <button
              onClick={() => setSelected(null)}
              style={{
                padding: '9px 18px',
                borderRadius: 8,
                border: '1.5px solid var(--border)',
                background: 'transparent',
                color: 'var(--ink2)',
                fontWeight: 600,
                fontSize: 14,
                cursor: 'pointer',
              }}
            >
              Cancel
            </button>
          </div>
        </Card>
      )}
    </div>
  );
}
