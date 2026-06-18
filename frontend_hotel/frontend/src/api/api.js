import axios from "axios";

const BASE_URL = "http://localhost:5000";

const api = axios.create({
  baseURL: BASE_URL,
});

// Otomatis sisipkan token ke setiap request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// =============================================
// AUTH
// =============================================
export const register = (data) => api.post("/api/auth/register", data);
export const login    = (data) => api.post("/api/auth/login", data);

// =============================================
// ROOMS
// =============================================
export const getRooms       = ()        => api.get("/api/rooms");
export const getRoomById    = (id)      => api.get(`/api/rooms/${id}`);
export const createRoom     = (data)    => api.post("/api/rooms", data);
export const updateRoom     = (id, data)=> api.put(`/api/rooms/${id}`, data);
export const deleteRoom     = (id)      => api.delete(`/api/rooms/${id}`);
export const uploadRoomImage= (id, form)=> api.post(`/api/rooms/${id}/images`, form, { headers: { "Content-Type": "multipart/form-data" }});
export const deleteRoomImage= (id, imgId)=> api.delete(`/api/rooms/${id}/images/${imgId}`);
export const setRoomFacilities = (id, facility_ids) => api.put(`/api/rooms/${id}/facilities`, { facility_ids });

// =============================================
// FACILITIES
// =============================================
export const getFacilities    = ()      => api.get("/api/rooms/facilities/all");
export const createFacility   = (data)  => api.post("/api/rooms/facilities/add", data);
export const deleteFacility   = (id)    => api.delete(`/api/rooms/facilities/${id}`);

// =============================================
// CUSTOMERS
// =============================================
export const getCustomers   = ()        => api.get("/api/customers");
export const getCustomerById= (id)      => api.get(`/api/customers/${id}`);
export const updateCustomer = (id, data)=> api.put(`/api/customers/${id}`, data);
export const deleteCustomer = (id)      => api.delete(`/api/customers/${id}`);

// =============================================
// PROFILE
// =============================================
export const getProfile     = ()        => api.get("/api/customers/me/profile");
export const updateProfile  = (data)    => api.put("/api/customers/me/profile", data);

// =============================================
// BOOKINGS
// =============================================
export const createBooking  = (data)    => api.post("/api/bookings", data);
export const getBookings    = ()        => api.get("/api/bookings");
export const getMyBookings  = ()        => api.get("/api/bookings/my");
export const getBookingById = (id)      => api.get(`/api/bookings/${id}`);
export const updateBookingStatus = (id, status) => api.put(`/api/bookings/${id}/status`, { status });

// =============================================
// PAYMENTS
// =============================================
export const getPaymentMethods = ()          => api.get("/api/payments/methods");
export const getPayments       = ()          => api.get("/api/payments");
export const uploadPaymentProof= (bookingId, form) =>
  api.post(`/api/payments/${bookingId}/upload`, form, { headers: { "Content-Type": "multipart/form-data" }});
export const verifyPayment     = (bookingId) => api.put(`/api/payments/${bookingId}/verify`);

// =============================================
// DASHBOARD
// =============================================
export const getDashboardStats    = ()  => api.get("/api/dashboard/stats");
export const getTransactions      = ()  => api.get("/api/dashboard/transactions");
export const getRoomsStatus       = ()  => api.get("/api/dashboard/rooms-status");

export const API_BASE = BASE_URL;
export default api;
