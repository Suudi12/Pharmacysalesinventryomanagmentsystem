import api from './api';

export const customerService = {
  getAll: () => api.get('/customers').then((res) => res.data),
  getById: (id) => api.get(`/customers/${id}`).then((res) => res.data),
  create: (payload) => api.post('/customers', payload).then((res) => res.data),
  update: (id, payload) => api.put(`/customers/${id}`, payload).then((res) => res.data),
  remove: (id) => api.delete(`/customers/${id}`).then((res) => res.data),
};
