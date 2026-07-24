import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach the JWT token (if we have one) to every outgoing request.
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// If the backend ever says our token is no longer valid, clear it and
// send the user back to the login page instead of showing a broken screen.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      if (!window.location.pathname.startsWith('/login')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// The backend's GlobalExceptionHandler always returns either:
//   { timestamp, status, message }                — for business/auth errors
//   { timestamp, status, errors: { field: msg } }  — for @Valid validation errors
// This helper turns either shape into one readable string for the UI.
export function extractErrorMessage(error) {
  const data = error?.response?.data;
  if (!data) return error?.message || 'Khalad aan la filayn ayaa dhacay. Isku day mar kale.';
  if (data.message) return data.message;
  if (data.errors) return Object.values(data.errors).join(' \u2022 ');
  return 'Khalad ayaa dhacay. Isku day mar kale.';
}

export default api;
