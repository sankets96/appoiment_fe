'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Avatar, Badge, Card, EmptyState, useToast } from '@/components/ui';
import { useAppStore } from '@/lib/store-client';
import { userEndpoints, apiGet, apiPost } from '@/config/api';

const SPECIALTIES = [
  'All',
  'General Physician',
  'Cardiologist',
  'Dermatologist',
  'Neurologist',
  'Orthopedic Surgeon',
  'Gynecologist',
  'Pediatrician',
  'ENT Specialist',
  'Ophthalmologist',
  'Dentist',
  'Psychiatrist',
  'Endocrinologist',
  'Gastroenterologist',
  'Pulmonologist',
  'Nephrologist',
  'Oncologist',
  'Urologist',
  'Other',
];

const FEE_RANGES = [
  { id: 'all', label: 'Any fee' },
  { id: '<500', label: '< ₹500' },
  { id: '500-1000', label: '₹500 – ₹1000' },
  { id: '>1000', label: '> ₹1000' },
];

const DAY_ORDER = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const dayIndex = (dateStr) => {
  // 'Mon'..'Sun' in JS Date.getDay() order: 0=Sun..6=Sat
  if (!dateStr) return -1;
  const map = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  return map[new Date(dateStr).getDay()];
};

const buildQuery = ({ specialty, q, feeRange }) => {
  const params = new URLSearchParams({ status: 'approved' });
  if (specialty && specialty !== 'All') params.set('specialty', specialty);
  if (q && q.trim()) params.set('q', q.trim());
  if (feeRange && feeRange !== 'all') {
    if (feeRange === '<500') params.set('maxFee', '499');
    else if (feeRange === '500-1000') {
      params.set('minFee', '500');
      params.set('maxFee', '1000');
    } else if (feeRange === '>1000') params.set('minFee', '1001');
  }
  return params.toString();
};

export default function BookAppointmentPage() {
  const router = useRouter();
  const toast = useToast();
  const { user, bookAppointment, getVerifiedDoctors } = useAppStore();

  // Filter state
  const [search, setSearch] = useState('');
  const [specialty, setSpecialty] = useState('All');
  const [feeRange, setFeeRange] = useState('all');

  // Data
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);

  // Card expansion
  const [expandedId, setExpandedId] = useState(null);
  const [availability, setAvailability] = useState({}); // { [doctorId]: { Mon: [...] } }
  const [availLoading, setAvailLoading] = useState({}); // { [doctorId]: true }
  const [activeDay, setActiveDay] = useState({});      // { [doctorId]: 'Mon' }

  // Booking form
  const [selectedSlot, setSelectedSlot] = useState(null); // { doctorId, day, time }
  const [bookingForm, setBookingForm] = useState({ date: '', reason: '' });
  const [submitting, setSubmitting] = useState(false);
  const [confirmed, setConfirmed] = useState(null);

  // ── Fetch doctor list when filters change (debounced) ─────────
  useEffect(() => {
    let cancelled = false;
    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const qs = buildQuery({ specialty, q: search, feeRange });
        const res = await apiGet(`${userEndpoints.getAllDoctors()}?${qs}`);
        if (cancelled) return;
        if (res?.success && Array.isArray(res.doctors)) {
          setDoctors(
            res.doctors.map((d) => ({
              id: d._id || d.id,
              name: d.name,
              specialty: d.specialty,
              experience: d.experience,
              fee: d.fee,
              bio: d.bio,
              verified: d.verified,
              profilePhoto: d.profilePhoto,
            }))
          );
        } else {
          setDoctors([]);
        }
      } catch (err) {
        if (cancelled) return;
        // Fallback to mock store so the UI never goes empty
        const mock = getVerifiedDoctors();
        const filtered = mock.filter((d) => {
          if (specialty !== 'All' && d.specialty !== specialty) return false;
          if (search && !d.name.toLowerCase().includes(search.toLowerCase())) return false;
          if (feeRange !== 'all') {
            const fee = d.fee || 0;
            if (feeRange === '<500' && fee >= 500) return false;
            if (feeRange === '500-1000' && (fee < 500 || fee > 1000)) return false;
            if (feeRange === '>1000' && fee <= 1000) return false;
          }
          return true;
        });
        setDoctors(filtered);
        console.warn('Using mock fallback for doctors:', err.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }, 250);

    return () => { cancelled = true; clearTimeout(timer); };
  }, [search, specialty, feeRange, getVerifiedDoctors]);

  // ── Lazy-load availability when a card expands ────────────────
  useEffect(() => {
    if (!expandedId) return;
    if (availability[expandedId]) return; // already cached
    let cancelled = false;
    (async () => {
      setAvailLoading((s) => ({ ...s, [expandedId]: true }));
      try {
        const res = await apiGet(userEndpoints.doctorAvailability({ id: expandedId }));
        if (cancelled) return;
        if (res?.success) {
          setAvailability((s) => ({ ...s, [expandedId]: res.availability || {} }));
        }
      } catch (err) {
        if (cancelled) return;
        toast?.showToast(
          err.message || 'Could not load availability',
          'error',
          'Load failed'
        );
      } finally {
        if (!cancelled) {
          setAvailLoading((s) => ({ ...s, [expandedId]: false }));
        }
      }
    })();
    return () => { cancelled = true; };
  }, [expandedId, availability, toast]);

  const toggleCard = (id) => {
    if (expandedId === id) {
      setExpandedId(null);
      setSelectedSlot(null);
    } else {
      setExpandedId(id);
      setSelectedSlot(null);
    }
  };

  const clearFilters = () => {
    setSearch('');
    setSpecialty('All');
    setFeeRange('all');
  };

  // ── Confirm booking ───────────────────────────────────────────
  const doBook = async () => {
    if (!selectedSlot || !bookingForm.date || submitting) return;
    if (dayIndex(bookingForm.date) !== selectedSlot.day) {
      toast?.showToast(
        `Please pick a ${selectedSlot.day} for the ${selectedSlot.time} slot.`,
        'error',
        'Day mismatch'
      );
      return;
    }

    setSubmitting(true);
    try {
      const res = await apiPost(userEndpoints.bookAppointment(), {
        doctorId: selectedSlot.doctorId,
        day: selectedSlot.day,
        time: selectedSlot.time,
        date: bookingForm.date,
        reason: bookingForm.reason || ''
      });

      // Also push to local store so the dashboard updates
      bookAppointment({
        id: res.appointment?.id || 'a' + Date.now(),
        patientId: user?.id,
        patientName: user?.name,
        doctorId: selectedSlot.doctorId,
        doctorName: doctors.find((d) => d.id === selectedSlot.doctorId)?.name,
        specialty: doctors.find((d) => d.id === selectedSlot.doctorId)?.specialty,
        day: selectedSlot.day,
        time: selectedSlot.time,
        date: bookingForm.date,
        reason: bookingForm.reason || '',
        status: 'confirmed',
      });

      // Locally drop the booked slot from the cache
      setAvailability((s) => {
        const cur = s[selectedSlot.doctorId] || {};
        const next = { ...cur };
        next[selectedSlot.day] = (next[selectedSlot.day] || []).filter(
          (t) => t !== selectedSlot.time
        );
        return { ...s, [selectedSlot.doctorId]: next };
      });

      setConfirmed(res.appointment || true);
      toast?.showToast('Appointment booked!', 'success', 'Confirmed');

      setTimeout(() => {
        setExpandedId(null);
        setSelectedSlot(null);
        setBookingForm({ date: '', reason: '' });
        setConfirmed(null);
      }, 2200);
    } catch (err) {
      toast?.showToast(err.message || 'Booking failed', 'error', 'Could not book');
    } finally {
      setSubmitting(false);
    }
  };

  const hasActiveFilters = search || specialty !== 'All' || feeRange !== 'all';

  return (
    <div className="fade-in bk-page" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Header */}
      <div>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: 26, fontStyle: 'italic' }}>
          Book an Appointment
        </div>
        <div style={{ color: 'var(--muted)', fontSize: 14, marginTop: 2 }}>
          Find the right specialist, pick a slot, and you're set.
        </div>
      </div>

      {/* Filter bar */}
      <Card className="bk-filter-card" style={{ padding: 16 }}>
        <div className="bk-filter-row">
          {/* Search */}
          <div className="bk-search-wrap">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="bk-search-icon" aria-hidden>
              <circle cx="11" cy="11" r="7" />
              <line x1="20" y1="20" x2="16.5" y2="16.5" />
            </svg>
            <input
              className="bk-search"
              placeholder="Search by name or email…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {/* Specialty pills */}
          <div className="bk-pills">
            {SPECIALTIES.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setSpecialty(s)}
                className={`bk-pill${specialty === s ? ' bk-pill--active' : ''}`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Fee range */}
        <div className="bk-fee-row">
          <span className="bk-fee-label">Consultation fee</span>
          <div className="bk-fee-chips">
            {FEE_RANGES.map((r) => (
              <button
                key={r.id}
                type="button"
                onClick={() => setFeeRange(r.id)}
                className={`bk-fee-chip${feeRange === r.id ? ' bk-fee-chip--active' : ''}`}
              >
                {r.label}
              </button>
            ))}
          </div>
          {hasActiveFilters && (
            <button type="button" onClick={clearFilters} className="bk-clear-btn">
              ✕ Clear filters
            </button>
          )}
        </div>
      </Card>

      {/* Doctor grid */}
      {loading ? (
        <div className="bk-loading">
          <div className="bk-spinner" />
          <span>Finding the best doctors for you…</span>
        </div>
      ) : doctors.length === 0 ? (
        <EmptyState
          icon="🩺"
          title="No doctors match your filters"
          desc="Try a different specialty, fee range, or clear all filters."
        />
      ) : (
        <div className="bk-grid">
          {doctors.map((d) => {
            const isExpanded = expandedId === d.id;
            const avail = availability[d.id] || {};
            const isLoadingAvail = !!availLoading[d.id];
            const day = activeDay[d.id] || 'Mon';
            const daySlots = (avail[day] || []).filter(Boolean);

            return (
              <div
                key={d.id}
                className={`bk-card${isExpanded ? ' bk-card--expanded' : ''}`}
              >
                <button
                  type="button"
                  onClick={() => toggleCard(d.id)}
                  className="bk-card-top"
                  aria-expanded={isExpanded}
                >
                  <div className="bk-card-head">
                    <Avatar name={d.name} size={48} color="sage" />
                    <div className="bk-card-id">
                      <div className="bk-card-name">
                        {d.name}
                        {d.verified && <Badge text="Verified" color="sage" />}
                      </div>
                      <div className="bk-card-meta">
                        {d.specialty || 'General'}
                        {d.experience ? ` · ${d.experience}` : ''}
                      </div>
                    </div>
                    <div className="bk-card-fee">
                      <div className="bk-card-fee-amt">₹{d.fee || 500}</div>
                      <div className="bk-card-fee-sub">per visit</div>
                    </div>
                  </div>

                  {d.bio && (
                    <div className="bk-card-bio">{d.bio}</div>
                  )}

                  <div className="bk-card-cta">
                    <span className={`bk-card-chev${isExpanded ? ' bk-card-chev--open' : ''}`}>▾</span>
                    {isExpanded ? 'Hide availability' : 'View availability'}
                  </div>
                </button>

                {/* Expandable availability */}
                <div className={`bk-avail${isExpanded ? ' bk-avail--open' : ''}`}>
                  <div className="bk-avail-inner">
                    {isLoadingAvail ? (
                      <div className="bk-loading bk-loading--small">
                        <div className="bk-spinner bk-spinner--small" />
                        <span>Loading slots…</span>
                      </div>
                    ) : Object.keys(avail).length === 0 ? (
                      <div className="bk-empty-msg">No schedule set yet. Check back later.</div>
                    ) : (
                      <>
                        {/* Day tabs */}
                        <div className="bk-days">
                          {DAY_ORDER.map((dy) => {
                            const has = (avail[dy] || []).length > 0;
                            return (
                              <button
                                key={dy}
                                type="button"
                                onClick={() => setActiveDay((s) => ({ ...s, [d.id]: dy }))}
                                className={`bk-day-tab${day === dy ? ' bk-day-tab--active' : ''}${!has ? ' bk-day-tab--empty' : ''}`}
                                disabled={!has}
                                title={has ? `${(avail[dy] || []).length} slots` : 'No slots'}
                              >
                                {dy}
                              </button>
                            );
                          })}
                        </div>

                        {/* Slots */}
                        <div className="bk-slots">
                          {daySlots.length === 0 ? (
                            <div className="bk-empty-msg">No slots on {day}.</div>
                          ) : (
                            daySlots.map((t) => {
                              const isSelected =
                                selectedSlot?.doctorId === d.id &&
                                selectedSlot?.day === day &&
                                selectedSlot?.time === t;
                              return (
                                <button
                                  key={t}
                                  type="button"
                                  onClick={() =>
                                    setSelectedSlot({ doctorId: d.id, day, time: t })
                                  }
                                  className={`bk-slot${isSelected ? ' bk-slot--active' : ''}`}
                                >
                                  {t}
                                </button>
                              );
                            })
                          )}
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Booking form — appears when a slot is selected */}
      {selectedSlot && (
        <Card className="bk-form">
          <div className="bk-form-head">
            <div>
              <div className="bk-form-title">Confirm your appointment</div>
              <div className="bk-form-sub">
                {doctors.find((d) => d.id === selectedSlot.doctorId)?.name} ·{' '}
                {selectedSlot.day} at {selectedSlot.time}
              </div>
            </div>
            <button
              type="button"
              onClick={() => setSelectedSlot(null)}
              className="bk-form-close"
              aria-label="Close booking form"
            >
              ×
            </button>
          </div>

          {confirmed ? (
            <div className="bk-form-success">
              <div className="bk-form-success-icon">✓</div>
              <div>
                <div className="bk-form-success-title">Appointment booked</div>
                <div className="bk-form-success-sub">
                  {selectedSlot.day}, {bookingForm.date} at {selectedSlot.time}
                </div>
              </div>
            </div>
          ) : (
            <div className="bk-form-grid">
              <div className="bk-field">
                <label className="bk-field-label">Date</label>
                <input
                  type="date"
                  value={bookingForm.date}
                  min={new Date().toISOString().split('T')[0]}
                  onChange={(e) => setBookingForm({ ...bookingForm, date: e.target.value })}
                />
                {bookingForm.date && dayIndex(bookingForm.date) !== selectedSlot.day && (
                  <div className="bk-field-hint bk-field-hint--warn">
                    Picked date is a {dayIndex(bookingForm.date)}, not {selectedSlot.day}.
                  </div>
                )}
              </div>
              <div className="bk-field bk-field--full">
                <label className="bk-field-label">Reason for visit (optional)</label>
                <textarea
                  rows={2}
                  placeholder="Briefly describe your symptoms…"
                  value={bookingForm.reason}
                  onChange={(e) => setBookingForm({ ...bookingForm, reason: e.target.value })}
                />
              </div>
              <div className="bk-form-actions">
                <button
                  type="button"
                  onClick={doBook}
                  disabled={!bookingForm.date || submitting}
                  className="bk-book-cta"
                >
                  {submitting ? (
                    <>
                      <span className="bk-spinner bk-spinner--small bk-spinner--white" />
                      Booking…
                    </>
                  ) : (
                    'Confirm booking'
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedSlot(null);
                    setBookingForm({ date: '', reason: '' });
                  }}
                  className="bk-cancel-cta"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </Card>
      )}

      {/* Footer nav */}
      <div style={{ textAlign: 'center', marginTop: 8 }}>
        <Link
          href="/patient/appointments"
          style={{ color: 'var(--muted)', fontSize: 13, textDecoration: 'none' }}
        >
          See your existing appointments →
        </Link>
      </div>
    </div>
  );
}
