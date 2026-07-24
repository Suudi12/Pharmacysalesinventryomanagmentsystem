import api from './api';

export const supplierService = {
  getAll: () => api.get('/suppliers').then((res) => res.data),
  getById: (id) => api.get(`/suppliers/${id}`).then((res) => res.data),
  create: (payload) => api.post('/suppliers', payload).then((res) => res.data),
  update: (id, payload) => api.put(`/suppliers/${id}`, payload).then((res) => res.data),
  remove: (id) => api.delete(`/suppliers/${id}`).then((res) => res.data),
};
