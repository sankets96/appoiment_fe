/**
 * Medicare+ — Application Store
 * Zustand store for global client-side state management.
 *
 * Handles: auth state, mock data store, and cross-component state updates.
 */

import { create } from 'zustand';
import { initStore } from './store';

// Deep clone utility
const deepClone = (obj) => JSON.parse(JSON.stringify(obj));

export const useAppStore = create((set, get) => ({
  // ── Auth State ─────────────────────────────────────────
  user: null,
  isAuthenticated: false,

  // ── Mock Data Store ─────────────────────────────────────
  users: deepClone(initStore.users),
  appointments: deepClone(initStore.appointments),
  prescriptions: deepClone(initStore.prescriptions),
  labReports: deepClone(initStore.labReports),
  doctorRequests: deepClone(initStore.doctorRequests),

  // ── Auth Actions ───────────────────────────────────────
  login: (user) => set({ user, isAuthenticated: true }),

  logout: () =>
    set({
      user: null,
      isAuthenticated: false,
    }),

  updateUser: (updates) =>
    set((state) => ({
      user: { ...state.user, ...updates },
      users: state.users.map((u) => (u.id === state.user?.id ? { ...u, ...updates } : u)),
    })),

  // ── Doctor Actions ──────────────────────────────────────
  updateDoctorProfile: (doctorId, updates) =>
    set((state) => ({
      users: state.users.map((u) => (u.id === doctorId ? { ...u, ...updates } : u)),
    })),

  updateDoctorAvailability: (doctorId, available) =>
    set((state) => ({
      users: state.users.map((u) => (u.id === doctorId ? { ...u, available } : u)),
    })),

  toggleDoctorStatus: (doctorId) =>
    set((state) => ({
      users: state.users.map((u) => (u.id === doctorId ? { ...u, verified: !u.verified } : u)),
    })),

  // ── Appointment Actions ─────────────────────────────────
  bookAppointment: (appointment) =>
    set((state) => ({
      appointments: [...state.appointments, appointment],
    })),

  cancelAppointment: (appointmentId) =>
    set((state) => ({
      appointments: state.appointments.map((a) =>
        a.id === appointmentId ? { ...a, status: 'cancelled' } : a
      ),
    })),

  updateAppointmentStatus: (appointmentId, status) =>
    set((state) => ({
      appointments: state.appointments.map((a) =>
        a.id === appointmentId ? { ...a, status } : a
      ),
    })),

  completeAppointment: (appointmentId) =>
    set((state) => ({
      appointments: state.appointments.map((a) =>
        a.id === appointmentId ? { ...a, status: 'completed' } : a
      ),
    })),

  // ── Prescription Actions ───────────────────────────────
  addPrescription: (prescription) =>
    set((state) => ({
      prescriptions: [...state.prescriptions, prescription],
    })),

  // ── Lab Report Actions ─────────────────────────────────
  addLabReport: (labReport) =>
    set((state) => ({
      labReports: [...state.labReports, labReport],
    })),

  // ── Patient Relations ──────────────────────────────────
  addRelation: (patientId, relation) =>
    set((state) => ({
      users: state.users.map((u) =>
        u.id === patientId ? { ...u, relations: [...(u.relations || []), relation] } : u
      ),
    })),

  // ── Admin Actions ──────────────────────────────────────
  approveDoctorRequest: (requestId, doctorId) =>
    set((state) => ({
      doctorRequests: state.doctorRequests.map((r) =>
        r.id === requestId ? { ...r, status: 'approved' } : r
      ),
      users: state.users.map((u) => (u.id === doctorId ? { ...u, verified: true } : u)),
    })),

  rejectDoctorRequest: (requestId) =>
    set((state) => ({
      doctorRequests: state.doctorRequests.map((r) =>
        r.id === requestId ? { ...r, status: 'rejected' } : r
      ),
    })),

  // ── Selector Helpers ───────────────────────────────────
  getDoctors: () => get().users.filter((u) => u.role === 'doctor'),
  getVerifiedDoctors: () => get().users.filter((u) => u.role === 'doctor' && u.verified),
  getPatients: () => get().users.filter((u) => u.role === 'patient'),
  getUserById: (id) => get().users.find((u) => u.id === id),

  getPatientAppointments: (patientId) =>
    get().appointments.filter((a) => a.patientId === patientId),

  getDoctorAppointments: (doctorId) =>
    get().appointments.filter((a) => a.doctorId === doctorId),

  getPatientPrescriptions: (patientId) =>
    get().prescriptions.filter((p) => p.patientId === patientId),

  getPatientLabReports: (patientId) =>
    get().labReports.filter((l) => l.patientId === patientId),

  getPendingDoctorRequests: () =>
    get().doctorRequests.filter((r) => r.status === 'pending'),
}));
