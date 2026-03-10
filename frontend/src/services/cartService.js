import api from './api'

const cartService = {
  get:    ()            => api.get('/cart'),
  add:    (data)        => api.post('/cart/add', data),
  update: (data)        => api.put('/cart/update', data),
  remove: (productId)   => api.delete(`/cart/remove/${productId}`),
  clear:  ()            => api.delete('/cart/clear'),
}

export default cartService
