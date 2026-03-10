import axios from 'axios'
import toast from 'react-hot-toast'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  withCredentials: true,           // Send cookies with every request
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
})

//  Request Interceptor 
// Attach JWT from localStorage as Bearer token (fallback to cookie auth)
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('sv_token')
    if (token) config.headers.Authorization = `Bearer ${token}`
    return config
  },
  (error) => Promise.reject(error)
)

//  Response Interceptor 
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error.response?.data?.message || 'Something went wrong'
    const status  = error.response?.status

    if (status === 401) {
      localStorage.removeItem('sv_token')
      localStorage.removeItem('sv_user')
      // Soft redirect; let AuthContext handle it
      window.dispatchEvent(new Event('auth:logout'))
    } else if (status !== 404) {
      // Don't toast 404s  let components handle them
      toast.error(message)
    }

    return Promise.reject(error)
  }
)

export default api

