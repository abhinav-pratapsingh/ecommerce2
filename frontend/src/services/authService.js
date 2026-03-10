import api from './api'

const authService = {
  register: (data) => api.post('/auth/register', data),
  login:    (data) => api.post('/auth/login', data),
  logout:   ()     => api.post('/auth/logout'),
  profile:  ()     => api.get('/auth/profile'),
}

export default authService
