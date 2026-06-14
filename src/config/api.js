/**
 * Medicare+ — API Service
 * Centralized API service that reads base URL and endpoints from api-config.json.
 * All API calls in the application should use this service.
 */

import apiConfig from './api-config.json';

// ── Token helpers ──────────────────────────────────────────
export const getToken = () =>
  typeof window !== 'undefined' ? localStorage.getItem('medicare_token') : null;
export const setToken = (t) =>
  typeof window !== 'undefined' && localStorage.setItem('medicare_token', t);
export const clearToken = () =>
  typeof window !== 'undefined' && localStorage.removeItem('medicare_token');

// ── Base URL from config ───────────────────────────────────
export const BASE_URL = apiConfig.baseUrl;

// ═══════════════════════════════════════════════════════════
//  ENDPOINT HELPERS
//  Replaces path parameters like {id}, {role}, etc.
// ═══════════════════════════════════════════════════════════
const replaceParams = (url, params = {}) => {
  let result = url;
  Object.entries(params).forEach(([key, value]) => {
    result = result.replace(`{${key}}`, value);
  });
  return result;
};

// ── Auth Endpoints ─────────────────────────────────────────
export const authEndpoints = {
  login: () => `${BASE_URL}${apiConfig.endpoints.auth.login}`,
  register: () => `${BASE_URL}${apiConfig.endpoints.auth.register}`,
  registerOtp: () => `${BASE_URL}${apiConfig.endpoints.auth.registerOtp}`,
  logout: () => `${BASE_URL}${apiConfig.endpoints.auth.logout}`,
  me: () => `${BASE_URL}${apiConfig.endpoints.auth.me}`,
  refresh: () => `${BASE_URL}${apiConfig.endpoints.auth.refresh}`,
  forgotPassword: () => `${BASE_URL}${apiConfig.endpoints.auth.forgotPassword}`,
  forgotPasswordOtp: () => `${BASE_URL}${apiConfig.endpoints.auth.forgotPasswordOtp}`,
  verifyForgotPasswordOtp: () => `${BASE_URL}${apiConfig.endpoints.auth.verifyForgotPasswordOtp}`,
  resetPassword: () => `${BASE_URL}${apiConfig.endpoints.auth.resetPassword}`,
  sendOtp: () => `${BASE_URL}${apiConfig.endpoints.auth.sendOtp}`,
  verifyOtp: () => `${BASE_URL}${apiConfig.endpoints.auth.verifyOtp}`,
};

// ── User Endpoints ──────────────────────────────────────────
export const userEndpoints = {
  profile: (params) => `${BASE_URL}${replaceParams(apiConfig.endpoints.users.profile, params)}`,
  updateProfile: (params) =>
    `${BASE_URL}${replaceParams(apiConfig.endpoints.users.updateProfile, params)}`,
  uploadPhoto: (params) => `${BASE_URL}${replaceParams(apiConfig.endpoints.users.profile, params)}/photo`,
  deletePhoto: (params) => `${BASE_URL}${replaceParams(apiConfig.endpoints.users.profile, params)}/photo`,
  doctorRequests: () => `${BASE_URL}${apiConfig.endpoints.users.doctorRequests}`,
  approveDoctor: (params) =>
    `${BASE_URL}${replaceParams(apiConfig.endpoints.users.approveDoctor, params)}`,
  rejectDoctor: (params) =>
    `${BASE_URL}${replaceParams(apiConfig.endpoints.users.rejectDoctor, params)}`,
  getAllDoctors: () => `${BASE_URL}${apiConfig.endpoints.users.getAllDoctors}`,
  doctorAvailability: (params) =>
    `${BASE_URL}${replaceParams(apiConfig.endpoints.users.doctorAvailability, params)}`,
  bookAppointment: () => `${BASE_URL}${apiConfig.endpoints.users.bookAppointment}`,
};

// ── Doctor Endpoints ────────────────────────────────────────
export const doctorEndpoints = {
  list: () => `${BASE_URL}${apiConfig.endpoints.doctors.list}`,
  byId: (params) => `${BASE_URL}${replaceParams(apiConfig.endpoints.doctors.byId, params)}`,
  bySpecialty: (params) =>
    `${BASE_URL}${replaceParams(apiConfig.endpoints.doctors.bySpecialty, params)}`,
  search: (params) => `${BASE_URL}${replaceParams(apiConfig.endpoints.doctors.search, params)}`,
  availability: (params) =>
    `${BASE_URL}${replaceParams(apiConfig.endpoints.doctors.availability, params)}`,
  updateAvailability: (params) =>
    `${BASE_URL}${replaceParams(apiConfig.endpoints.doctors.updateAvailability, params)}`,
  updateProfile: (params) =>
    `${BASE_URL}${replaceParams(apiConfig.endpoints.doctors.updateProfile, params)}`,
  updateStatus: (params) =>
    `${BASE_URL}${replaceParams(apiConfig.endpoints.doctors.updateStatus, params)}`,
  patients: (params) => `${BASE_URL}${replaceParams(apiConfig.endpoints.doctors.patients, params)}`,
};

// ── Patient Endpoints ───────────────────────────────────────
export const patientEndpoints = {
  profile: (params) => `${BASE_URL}${replaceParams(apiConfig.endpoints.patients.profile, params)}`,
  update: (params) => `${BASE_URL}${replaceParams(apiConfig.endpoints.patients.update, params)}`,
  relations: (params) =>
    `${BASE_URL}${replaceParams(apiConfig.endpoints.patients.relations, params)}`,
  deleteRelation: (params) =>
    `${BASE_URL}${replaceParams(apiConfig.endpoints.patients.deleteRelation, params)}`,
};

// ── Appointment Endpoints ───────────────────────────────────
export const appointmentEndpoints = {
  list: () => `${BASE_URL}${apiConfig.endpoints.appointments.list}`,
  myAppointments: () => `${BASE_URL}${apiConfig.endpoints.appointments.myAppointments}`,
  book: () => `${BASE_URL}${apiConfig.endpoints.appointments.book}`,
  byId: (params) => `${BASE_URL}${replaceParams(apiConfig.endpoints.appointments.byId, params)}`,
  cancel: (params) =>
    `${BASE_URL}${replaceParams(apiConfig.endpoints.appointments.cancel, params)}`,
  confirm: (params) =>
    `${BASE_URL}${replaceParams(apiConfig.endpoints.appointments.confirm, params)}`,
  complete: (params) =>
    `${BASE_URL}${replaceParams(apiConfig.endpoints.appointments.complete, params)}`,
};

// ── Prescription Endpoints ──────────────────────────────────
export const prescriptionEndpoints = {
  list: () => `${BASE_URL}${apiConfig.endpoints.prescriptions.list}`,
  create: () => `${BASE_URL}${apiConfig.endpoints.prescriptions.create}`,
  byId: (params) =>
    `${BASE_URL}${replaceParams(apiConfig.endpoints.prescriptions.byId, params)}`,
  byAppointment: (params) =>
    `${BASE_URL}${replaceParams(apiConfig.endpoints.prescriptions.byAppointment, params)}`,
  update: (params) =>
    `${BASE_URL}${replaceParams(apiConfig.endpoints.prescriptions.update, params)}`,
};

// ── Lab Endpoints ───────────────────────────────────────────
export const labEndpoints = {
  list: () => `${BASE_URL}${apiConfig.endpoints.labs.list}`,
  create: () => `${BASE_URL}${apiConfig.endpoints.labs.create}`,
  byId: (params) => `${BASE_URL}${replaceParams(apiConfig.endpoints.labs.byId, params)}`,
  byPatient: (params) =>
    `${BASE_URL}${replaceParams(apiConfig.endpoints.labs.byPatient, params)}`,
  update: (params) => `${BASE_URL}${replaceParams(apiConfig.endpoints.labs.update, params)}`,
};

// ── Admin Endpoints ─────────────────────────────────────────
export const adminEndpoints = {
  dashboard: () => `${BASE_URL}${apiConfig.endpoints.admin.dashboard}`,
  allDoctors: () => `${BASE_URL}${apiConfig.endpoints.admin.allDoctors}`,
  allPatients: () => `${BASE_URL}${apiConfig.endpoints.admin.allPatients}`,
  allAppointments: () => `${BASE_URL}${apiConfig.endpoints.admin.allAppointments}`,
  verifyRequests: () => `${BASE_URL}${apiConfig.endpoints.admin.verifyRequests}`,
  approveDoctor: (params) =>
    `${BASE_URL}${replaceParams(apiConfig.endpoints.admin.approveDoctor, params)}`,
  rejectDoctor: (params) =>
    `${BASE_URL}${replaceParams(apiConfig.endpoints.admin.rejectDoctor, params)}`,
  suspendDoctor: (params) =>
    `${BASE_URL}${replaceParams(apiConfig.endpoints.admin.suspendDoctor, params)}`,
  activateDoctor: (params) =>
    `${BASE_URL}${replaceParams(apiConfig.endpoints.admin.activateDoctor, params)}`,
  deleteUser: (params) =>
    `${BASE_URL}${replaceParams(apiConfig.endpoints.admin.deleteUser, params)}`,
};

// ── Family Member Endpoints ──────────────────────────────────
export const familyMemberEndpoints = {
  list: () => `${BASE_URL}${apiConfig.endpoints.familyMembers.list}`,
  add: () => `${BASE_URL}${apiConfig.endpoints.familyMembers.add}`,
  byId: (params) => `${BASE_URL}${replaceParams(apiConfig.endpoints.familyMembers.byId, params)}`,
  update: (params) => `${BASE_URL}${replaceParams(apiConfig.endpoints.familyMembers.update, params)}`,
  delete: () => `${BASE_URL}${apiConfig.endpoints.familyMembers.delete}`,
};

// ── Notification Endpoints ──────────────────────────────────
export const notificationEndpoints = {
  list: () => `${BASE_URL}${apiConfig.endpoints.notifications.list}`,
  markRead: (params) =>
    `${BASE_URL}${replaceParams(apiConfig.endpoints.notifications.markRead, params)}`,
  markAllRead: () => `${BASE_URL}${apiConfig.endpoints.notifications.markAllRead}`,
};

// ═══════════════════════════════════════════════════════════
//  FETCH WRAPPER
// ═══════════════════════════════════════════════════════════
export const authHeaders = () => ({
  'Content-Type': 'application/json',
  Authorization: `Bearer ${getToken()}`,
});

export const apiFetch = async (url, options = {}) => {
  const res = await fetch(url, { headers: authHeaders(), ...options });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: 'Request failed' }));
    throw new Error(err.message || `HTTP ${res.status}`);
  }
  return res.json();
};

// ── HTTP Method Wrappers ────────────────────────────────────
export const apiGet = (url) => apiFetch(url, { method: 'GET' });
export const apiPost = (url, body) =>
  apiFetch(url, { method: 'POST', body: JSON.stringify(body) });
export const apiPut = (url, body) =>
  apiFetch(url, { method: 'PUT', body: JSON.stringify(body) });
export const apiPatch = (url, body = {}) =>
  apiFetch(url, { method: 'PATCH', body: JSON.stringify(body) });
export const apiDel = (url) => apiFetch(url, { method: 'DELETE' });

// File upload with FormData (no JSON.stringify)
export const apiPostFormData = async (url, formData) => {
  const headers = {
    Authorization: `Bearer ${getToken()}`,
    // Don't set Content-Type - browser will set it with boundary automatically
  };
  const res = await fetch(url, {
    method: 'POST',
    headers,
    body: formData,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: 'Request failed' }));
    throw new Error(err.message || `HTTP ${res.status}`);
  }
  return res.json();
};
