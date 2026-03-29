'use client';

import { useState } from 'react';
import { Badge, Card, Avatar, Field, Modal } from '@/components/ui';
import { useAppStore } from '@/lib/store-client';

export default function DoctorPatientsPage() {
  const { user, getDoctorAppointments, addPrescription, addLabReport, completeAppointment } =
    useAppStore();
  const [selected, setSelected] = useState(null);
  const [prescModal, setPrescModal] = useState(false);
  const [labModal, setLabModal] = useState(false);
  const [presc, setPresc] = useState({
    diagnosis: '',
    notes: '',
    medicines: [{ name: '', dose: '', freq: '', duration: '' }],
  });
  const [lab, setLab] = useState({ title: '', results: [{ test: '', value: '', normal: '', status: 'normal' }] });

  const appts = getDoctorAppointments(user?.id);

  const savePresc = () => {
    addPrescription({
      id: 'p' + Date.now(),
      appointmentId: selected.id,
      patientId: selected.patientId,
      doctorId: user.id,
      doctorName: user.name,
      date: new Date().toISOString().slice(0, 10),
      ...presc,
    });
    completeAppointment(selected.id);
    setPrescModal(false);
    setPresc({ diagnosis: '', notes: '', medicines: [{ name: '', dose: '', freq: '', duration: '' }] });
  };

  const saveLab = () => {
    addLabReport({
      id: 'l' + Date.now(),
      patientId: selected.patientId,
      doctorId: user.id,
      doctorName: user.name,
      date: new Date().toISOString().slice(0, 10),
      ...lab,
    });
    setLabModal(false);
    setLab({ title: '', results: [{ test: '', value: '', normal: '', status: 'normal' }] });
  };

  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontStyle: 'italic' }}>
        Patient Consultations
      </div>

      {appts.length === 0 ? (
        <Card>
          <div style={{ textAlign: 'center', padding: '48px 24px', color: 'var(--muted)' }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>👥</div>
            <div style={{ fontWeight: 700, fontSize: 16, color: 'var(--ink2)', marginBottom: 6 }}>
              No consultations
            </div>
            <div style={{ fontSize: 14 }}>Patient bookings will appear here</div>
          </div>
        </Card>
      ) : (
        appts.map((a) => (
          <Card key={a.id}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
                <Avatar name={a.patientName} size={44} color="sky" />
                <div>
                  <div style={{ fontWeight: 700, fontSize: 15 }}>{a.patientName}</div>
                  <div style={{ fontSize: 13, color: 'var(--muted)' }}>
                    📅 {a.date} · ⏰ {a.time}
                  </div>
                  {a.reason && (
                    <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 2 }}>
                      Reason: {a.reason}
                    </div>
                  )}
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8 }}>
                <Badge text={a.status} />
                {(a.status === 'confirmed' || a.status === 'pending') && (
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button
                      onClick={() => {
                        setSelected(a);
                        setPrescModal(true);
                      }}
                      style={{
                        padding: '6px 12px',
                        borderRadius: 8,
                        border: '1.5px solid var(--sage)',
                        background: 'transparent',
                        color: 'var(--sage)',
                        fontSize: 13,
                        fontWeight: 600,
                        cursor: 'pointer',
                      }}
                    >
                      + Prescription
                    </button>
                    <button
                      onClick={() => {
                        setSelected(a);
                        setLabModal(true);
                      }}
                      style={{
                        padding: '6px 12px',
                        borderRadius: 8,
                        border: '1.5px solid var(--border)',
                        background: 'transparent',
                        color: 'var(--ink2)',
                        fontSize: 13,
                        fontWeight: 600,
                        cursor: 'pointer',
                      }}
                    >
                      + Lab Report
                    </button>
                  </div>
                )}
              </div>
            </div>
          </Card>
        ))
      )}

      {/* Prescription modal */}
      <Modal open={prescModal} onClose={() => setPrescModal(false)} title="Write Prescription" width={600}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <Field label="Diagnosis">
            <input
              value={presc.diagnosis}
              onChange={(e) => setPresc({ ...presc, diagnosis: e.target.value })}
              placeholder="Primary diagnosis"
            />
          </Field>
          <div style={{ fontWeight: 600, fontSize: 13 }}>Medicines</div>
          {presc.medicines.map((m, i) => (
            <div
              key={i}
              style={{
                display: 'grid',
                gridTemplateColumns: '2fr 1fr 1fr 1fr',
                gap: 8,
                background: 'var(--bg)',
                padding: 10,
                borderRadius: 8,
              }}
            >
              <input
                placeholder="Medicine name"
                value={m.name}
                onChange={(e) => {
                  const ms = [...presc.medicines];
                  ms[i].name = e.target.value;
                  setPresc({ ...presc, medicines: ms });
                }}
              />
              <input
                placeholder="Dose"
                value={m.dose}
                onChange={(e) => {
                  const ms = [...presc.medicines];
                  ms[i].dose = e.target.value;
                  setPresc({ ...presc, medicines: ms });
                }}
              />
              <input
                placeholder="Frequency"
                value={m.freq}
                onChange={(e) => {
                  const ms = [...presc.medicines];
                  ms[i].freq = e.target.value;
                  setPresc({ ...presc, medicines: ms });
                }}
              />
              <input
                placeholder="Duration"
                value={m.duration}
                onChange={(e) => {
                  const ms = [...presc.medicines];
                  ms[i].duration = e.target.value;
                  setPresc({ ...presc, medicines: ms });
                }}
              />
            </div>
          ))}
          <button
            onClick={() =>
              setPresc({ ...presc, medicines: [...presc.medicines, { name: '', dose: '', freq: '', duration: '' }] })
            }
            style={{
              width: 'fit-content',
              padding: '6px 12px',
              borderRadius: 8,
              border: '1.5px solid var(--border)',
              background: 'transparent',
              color: 'var(--ink2)',
              fontSize: 13,
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            + Add Medicine
          </button>
          <Field label="Notes">
            <textarea
              rows={3}
              value={presc.notes}
              onChange={(e) => setPresc({ ...presc, notes: e.target.value })}
              placeholder="Additional notes..."
            />
          </Field>
          <div style={{ display: 'flex', gap: 10 }}>
            <button
              onClick={savePresc}
              style={{
                padding: '9px 18px',
                borderRadius: 8,
                border: 'none',
                background: 'var(--sage)',
                color: '#fff',
                fontWeight: 600,
                fontSize: 14,
                cursor: 'pointer',
              }}
            >
              Save Prescription
            </button>
            <button
              onClick={() => setPrescModal(false)}
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
        </div>
      </Modal>

      {/* Lab report modal */}
      <Modal open={labModal} onClose={() => setLabModal(false)} title="Add Lab Report" width={600}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <Field label="Report Title">
            <input
              value={lab.title}
              onChange={(e) => setLab({ ...lab, title: e.target.value })}
              placeholder="e.g. CBC Report, Lipid Panel"
            />
          </Field>
          <div style={{ fontWeight: 600, fontSize: 13 }}>Test Results</div>
          {lab.results.map((r, i) => (
            <div
              key={i}
              style={{
                display: 'grid',
                gridTemplateColumns: '2fr 1fr 1fr 1fr',
                gap: 8,
                background: 'var(--bg)',
                padding: 10,
                borderRadius: 8,
              }}
            >
              <input
                placeholder="Test name"
                value={r.test}
                onChange={(e) => {
                  const rs = [...lab.results];
                  rs[i].test = e.target.value;
                  setLab({ ...lab, results: rs });
                }}
              />
              <input
                placeholder="Value"
                value={r.value}
                onChange={(e) => {
                  const rs = [...lab.results];
                  rs[i].value = e.target.value;
                  setLab({ ...lab, results: rs });
                }}
              />
              <input
                placeholder="Normal range"
                value={r.normal}
                onChange={(e) => {
                  const rs = [...lab.results];
                  rs[i].normal = e.target.value;
                  setLab({ ...lab, results: rs });
                }}
              />
              <select
                value={r.status}
                onChange={(e) => {
                  const rs = [...lab.results];
                  rs[i].status = e.target.value;
                  setLab({ ...lab, results: rs });
                }}
              >
                <option value="normal">Normal</option>
                <option value="high">High</option>
                <option value="low">Low</option>
              </select>
            </div>
          ))}
          <button
            onClick={() => setLab({ ...lab, results: [...lab.results, { test: '', value: '', normal: '', status: 'normal' }] })}
            style={{
              width: 'fit-content',
              padding: '6px 12px',
              borderRadius: 8,
              border: '1.5px solid var(--border)',
              background: 'transparent',
              color: 'var(--ink2)',
              fontSize: 13,
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            + Add Test
          </button>
          <div style={{ display: 'flex', gap: 10 }}>
            <button
              onClick={saveLab}
              style={{
                padding: '9px 18px',
                borderRadius: 8,
                border: 'none',
                background: 'var(--sage)',
                color: '#fff',
                fontWeight: 600,
                fontSize: 14,
                cursor: 'pointer',
              }}
            >
              Save Lab Report
            </button>
            <button
              onClick={() => setLabModal(false)}
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
        </div>
      </Modal>
    </div>
  );
}
