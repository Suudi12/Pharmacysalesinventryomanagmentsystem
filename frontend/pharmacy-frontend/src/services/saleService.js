import api from './api';

export const saleService = {
  getAll: () => api.get('/sales').then((res) => res.data),
  getById: (id) => api.get(`/sales/${id}`).then((res) => res.data),
  // payload: { customerId, items: [{ medicineId, quantity }] }
  create: (payload) => api.post('/sales', payload).then((res) => res.data),
};
