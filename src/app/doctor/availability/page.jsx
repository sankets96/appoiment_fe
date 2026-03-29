'use client';

import { useState } from 'react';
import { Card } from '@/components/ui';
import { useAppStore } from '@/lib/store-client';

export default function DoctorAvailabilityPage() {
  const { user, getUserById, updateDoctorAvailability } = useAppStore();
  const cu = getUserById(user?.id);
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const allSlots = [
    '8:00', '9:00', '10:00', '11:00', '12:00',
    '13:00', '14:00', '15:00', '16:00', '17:00', '18:00',
  ];

  const [localAvailable, setLocalAvailable] = useState(cu?.available || {});

  const toggle = (day, slot) => {
    const updated = { ...localAvailable };
    if (!updated[day]) updated[day] = [];
    const arr = updated[day];
    const idx = arr.indexOf(slot);
    if (idx > -1) arr.splice(idx, 1);
    else arr.push(slot);
    setLocalAvailable(updated);
    updateDoctorAvailability(user.id, updated);
  };

  const isSel = (day, slot) => (localAvailable?.[day] || []).includes(slot);

  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontStyle: 'italic' }}>
        Set Availability
      </div>
      <Card>
        <div style={{ color: 'var(--muted)', fontSize: 13, marginBottom: 20 }}>
          Click slots to toggle. Green = available for patient booking.
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {days.map((day) => (
            <div key={day} style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
              <div
                style={{
                  width: 36,
                  fontWeight: 700,
                  fontSize: 13,
                  color: 'var(--ink2)',
                  flexShrink: 0,
                }}
              >
                {day}
              </div>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {allSlots.map((slot) => (
                  <button
                    key={slot}
                    onClick={() => toggle(day, slot)}
                    style={{
                      padding: '5px 12px',
                      borderRadius: 8,
                      border: '1.5px solid',
                      fontSize: 12,
                      fontWeight: 600,
                      cursor: 'pointer',
                      borderColor: isSel(day, slot) ? 'var(--sage)' : 'var(--border)',
                      background: isSel(day, slot) ? 'var(--sage-light)' : 'var(--bg)',
                      color: isSel(day, slot) ? 'var(--sage)' : 'var(--muted)',
                      transition: 'all .15s',
                    }}
                  >
                    {slot}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
        <div
          style={{
            marginTop: 20,
            padding: '10px 14px',
            background: 'var(--sage-light)',
            borderRadius: 8,
            fontSize: 13,
            color: 'var(--sage)',
            fontWeight: 600,
          }}
        >
          ✓ Availability updates in real-time for patients
        </div>
      </Card>
    </div>
  );
}
