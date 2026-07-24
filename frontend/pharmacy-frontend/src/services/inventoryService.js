import api from './api';

export const inventoryService = {
  getAll: () => api.get('/inventory').then((res) => res.data),
  getByMedicine: (medicineId) => api.get(`/inventory/medicine/${medicineId}`).then((res) => res.data),
  // payload: { medicineId, quantity, reason }
  stockIn: (payload) => api.post('/inventory/stock-in', payload).then((res) => res.data),
  stockOut: (payload) => api.post('/inventory/stock-out', payload).then((res) => res.data),
};
