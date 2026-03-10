import api from './api'

const orderService = {
  create:         (data)     => api.post('/orders', data),
  getMyOrders:    (params)   => api.get('/orders/myorders', { params }),
  getById:        (id)       => api.get(`/orders/${id}`),
  processPayment: (data)     => api.post('/payment/process', data),
  verifyPayment:  (data)     => api.post('/payment/verify', data),

  // Admin
  adminGetAll:    (params)   => api.get('/admin/orders', { params }),
  adminUpdate:    (id, data) => api.put(`/admin/orders/${id}`, data),

  // Users admin
  adminGetUsers:  (params)   => api.get('/admin/users', { params }),
  adminUpdateUser:(id, data) => api.put(`/admin/users/${id}`, data),
  adminDeleteUser:(id)       => api.delete(`/admin/users/${id}`),

  // Stats
  getStats:       ()         => api.get('/admin/stats'),
}

export default orderService
