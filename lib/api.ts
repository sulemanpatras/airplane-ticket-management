import axios from 'axios';

const BASE = process.env.NEXT_PUBLIC_API_URL;

const api = axios.create({ baseURL: BASE });

// Attach JWT automatically
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('skybook_token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ── Auth ─────────────────────────────────────────────────
export const authAPI = {
  login: (email: string, password: string) =>
    api.post('/auth/login', { email, password }),
  register: (fullName: string, email: string, password: string) =>
    api.post('/auth/register', { fullName, email, password }),
};

// ── Flights ──────────────────────────────────────────────
export const flightsAPI = {
  getAll: () => api.get('/flights'),
  search: (source?: string, destination?: string) =>
    api.get('/flights/search', { params: { source, destination } }),
  create: (data: any) => api.post('/flights', data),
  update: (id: string, data: any) => api.put(`/flights/${id}`, data),
  delete: (id: string) => api.delete(`/flights/${id}`),
};

// ── Tickets ──────────────────────────────────────────────
export const ticketsAPI = {
  book: (flightId: string, passengerName: string) =>
    api.post('/tickets/book', { flightId, passengerName }),
  myTickets: () => api.get('/tickets/my'),
  allTickets: () => api.get('/tickets/all'),
  cancel: (id: string) => api.put(`/tickets/${id}/cancel`),
  downloadPdf: async (id: string) => {
    const res = await api.get(`/tickets/${id}/pdf`, { responseType: 'blob' });
    const url = window.URL.createObjectURL(new Blob([res.data]));
    const a = document.createElement('a');
    a.href = url;
    a.download = `ticket-${id}.pdf`;
    a.click();
    window.URL.revokeObjectURL(url);
  },
};

export default api;
