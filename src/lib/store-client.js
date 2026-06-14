/**
 * Medicare+ — Application Store
 * Zustand store for global client-side state management.
 *
 * Handles: auth state, mock data store, and cross-component state updates.
 * Includes session persistence using localStorage.
 */

import { create } from 'zustand';
import { initStore } from './store';

// Deep clone utility
const deepClone = (obj) => JSON.parse(JSON.stringify(obj));

// Session storage keys
const SESSION_KEY = 'medicare_session';

// Load session from localStorage
const loadSession = () => {
  if (typeof window === 'undefined') return null;
  try {
    const stored = localStorage.getItem(SESSION_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (e) {
    console.error('Error loading session:', e);
  }
  return null;
};

// Save session to localStorage
const saveSession = (user, token) => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(SESSION_KEY, JSON.stringify({ user, token }));
  } catch (e) {
    console.error('Error saving session:', e);
  }
};

// Clear session from localStorage
const clearSession = () => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(SESSION_KEY);
  } catch (e) {
    console.error('Error clearing session:', e);
  }
};

// Get initial auth state from localStorage
const initialSession = loadSession();

export const useAppStore = create((set, get) => ({
  // ── Auth State ─────────────────────────────────────────
  user: initialSession?.user || null,
  isAuthenticated: !!initialSession?.user,
  isLoading: true, // Track initial loading state

  // ── Mock Data Store ─────────────────────────────────────
  users: deepClone(initStore.users),
  appointments: deepClone(initStore.appointments),
  prescriptions: deepClone(initStore.prescriptions),
  labReports: deepClone(initStore.labReports),
  doctorRequests: deepClone(initStore.doctorRequests),

  // ── Auth Actions ───────────────────────────────────────
  login: (user, token) => {
    // Save to localStorage for persistence
    saveSession(user, token);
    set({ user, isAuthenticated: true, isLoading: false });
  },

  logout: () => {
    // Clear localStorage
    clearSession();
    set({ user: null, isAuthenticated: false, isLoading: false });
  },

  // Initialize: called after component mounts to set loading to false
  initSession: () => set({ isLoading: false }),

  updateUser: (updates) =>
    set((state) => {
      const updatedUser = { ...state.user, ...updates };
      // Update session storage with new user data
      const token = localStorage.getItem('medicare_token');
      if (token && updatedUser) {
        saveSession(updatedUser, token);
      }
      return {
        user: updatedUser,
        users: state.users.map((u) => (u.id === state.user?.id ? { ...u, ...updates } : u)),
      };
    }),

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

  removeRelation: (patientId, relationIndex) =>
    set((state) => ({
      users: state.users.map((u) =>
        u.id === patientId
          ? { ...u, relations: (u.relations || []).filter((_, i) => i !== relationIndex) }
          : u
      ),
    })),

  updateRelation: (patientId, relationIndex, updates) =>
    set((state) => ({
      users: state.users.map((u) =>
        u.id === patientId
          ? {
              ...u,
              relations: (u.relations || []).map((r, i) =>
                i === relationIndex ? { ...r, ...updates } : r
              ),
            }
          : u
      ),
    })),

  // ── Appointment Edit Actions ────────────────────────────
  updateAppointment: (appointmentId, updates) =>
    set((state) => ({
      appointments: state.appointments.map((a) =>
        a.id === appointmentId ? { ...a, ...updates } : a
      ),
    })),

  // ── Prescription Actions ───────────────────────────────
  updatePrescription: (prescriptionId, updates) =>
    set((state) => ({
      prescriptions: state.prescriptions.map((p) =>
        p.id === prescriptionId ? { ...p, ...updates } : p
      ),
    })),

  deletePrescription: (prescriptionId) =>
    set((state) => ({
      prescriptions: state.prescriptions.filter((p) => p.id !== prescriptionId),
    })),

  // ── Lab Report Actions ─────────────────────────────────
  updateLabReport: (labReportId, updates) =>
    set((state) => ({
      labReports: state.labReports.map((l) =>
        l.id === labReportId ? { ...l, ...updates } : l
      ),
    })),

  deleteLabReport: (labReportId) =>
    set((state) => ({
      labReports: state.labReports.filter((l) => l.id !== labReportId),
    })),

  // ── User Edit/Delete Actions ────────────────────────────
  updateUser: (userId, updates) =>
    set((state) => ({
      users: state.users.map((u) =>
        u.id === userId ? { ...u, ...updates } : u
      ),
    })),

  deleteUser: (userId) =>
    set((state) => ({
      users: state.users.filter((u) => u.id !== userId),
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