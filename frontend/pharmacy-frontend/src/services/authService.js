import api from './api';

export const authService = {
  // Public register: ONLY succeeds for the very first user in the whole
  // system (the backend auto-promotes them to ROLE_ADMIN). Every register
  // attempt after that is rejected — new staff accounts must be created by
  // an admin via userService.createUser instead.
  register: (payload) => api.post('/auth/register', payload).then((res) => res.data),

  login: (payload) => api.post('/auth/login', payload).then((res) => res.data),
};
