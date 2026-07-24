import api from './api';

export const userService = {
  getAll: () => api.get('/admin/users').then((res) => res.data),
  getById: (id) => api.get(`/admin/users/${id}`).then((res) => res.data),
  // payload: { fullName, username, email, password, role }
  create: (payload) => api.post('/admin/users', payload).then((res) => res.data),
  updateRole: (id, role) => api.put(`/admin/users/${id}/role`, { role }).then((res) => res.data),
  activate: (id) => api.put(`/admin/users/${id}/activate`).then((res) => res.data),
  deactivate: (id) => api.put(`/admin/users/${id}/deactivate`).then((res) => res.data),
  remove: (id) => api.delete(`/admin/users/${id}`).then((res) => res.data),
};
