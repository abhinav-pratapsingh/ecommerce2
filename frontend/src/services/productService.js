import api from './api'

const productService = {
  getAll:      (params) => api.get('/products', { params }),
  search:      (params) => api.get('/products/search', { params }),
  getById:     (id)     => api.get(`/products/${id}`),
  getCategories: ()     => api.get('/categories'),

  // Admin
  adminGetAll: (params) => api.get('/admin/products', { params }),
  create:      (data)   => api.post('/admin/products', data),
  update:      (id, data) => api.put(`/admin/products/${id}`, data),
  delete:      (id)     => api.delete(`/admin/products/${id}`),
  uploadImages:(id, formData) => api.post(`/admin/products/${id}/images`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  createCategory: (formData) => api.post('/admin/categories', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  updateCategory: (id, formData) => api.put(`/admin/categories/${id}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  deleteCategory: (id) => api.delete(`/admin/categories/${id}`),
}

export default productService
