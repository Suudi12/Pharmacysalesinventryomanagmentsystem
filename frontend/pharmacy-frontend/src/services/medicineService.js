import api from './api';

export const medicineService = {
  getAll: () => api.get('/medicines').then((res) => res.data),
  search: (name) => api.get('/medicines/search', { params: { name } }).then((res) => res.data),
  getById: (id) => api.get(`/medicines/${id}`).then((res) => res.data),
  create: (payload) => api.post('/medicines', payload).then((res) => res.data),
  update: (id, payload) => api.put(`/medicines/${id}`, payload).then((res) => res.data),
  remove: (id) => api.delete(`/medicines/${id}`).then((res) => res.data),
};
