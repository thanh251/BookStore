import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' }
})

// Tự động gắn token vào mọi request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// Tự động logout khi token hết hạn
api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

// Auth
export const authAPI = {
  login: (username: string, password: string) =>
    api.post('/auth/login', { username, password }),
  register: (data: any) => api.post('/auth/register', data),
  getMe: () => api.get('/auth/me')
}

// Products
export const productAPI = {
  getAll: (params?: any) => api.get('/products', { params }),
  getById: (id: number) => api.get(`/products/${id}`),
  getBestsellers: (limit = 8) => api.get('/products/bestsellers', { params: { limit } }),
  getNew: (limit = 8) => api.get('/products/new', { params: { limit } }),
  getPromotions: (limit = 8) => api.get('/products/promotions', { params: { limit } }),
  create: (data: any) => api.post('/products', data),
  update: (id: number, data: any) => api.put(`/products/${id}`, data),
  delete: (id: number) => api.delete(`/products/${id}`)
}

// Categories
export const categoryAPI = {
  getAll: () => api.get('/categories'),
  create: (data: any) => api.post('/categories', data),
  update: (id: number, data: any) => api.put(`/categories/${id}`, data),
  delete: (id: number) => api.delete(`/categories/${id}`)
}

// Cart
export const cartAPI = {
  get: () => api.get('/cart'),
  addItem: (productId: number, quantity: number) =>
    api.post('/cart/items', { productId, quantity }),
  updateItem: (itemId: number, quantity: number) =>
    api.put(`/cart/items/${itemId}`, { quantity }),
  removeItem: (itemId: number) => api.delete(`/cart/items/${itemId}`),
  clear: () => api.delete('/cart')
}

// Orders
export const orderAPI = {
  getMy: () => api.get('/orders/my'),
  getMyById: (id: number) => api.get(`/orders/my/${id}`),
  create: (deliveryMethod: 1 | 2) => api.post('/orders', { deliveryMethod }),
  getAll: (params?: any) => api.get('/orders', { params }),
  updateStatus: (id: number, status: number) =>
    api.put(`/orders/${id}/status`, { status })
}

// Wishlist
export const wishlistAPI = {
  get: () => api.get('/wishlist'),
  add: (productId: number) => api.post('/wishlist', { productId }),
  remove: (productId: number) => api.delete(`/wishlist/${productId}`),
  check: (productId: number) => api.get(`/wishlist/check/${productId}`)
}

// Reviews
export const reviewAPI = {
  getByProduct: (productId: number) => api.get(`/reviews/product/${productId}`),
  create: (data: any) => api.post('/reviews', data),
  update: (id: number, data: any) => api.put(`/reviews/${id}`, data),
  delete: (id: number) => api.delete(`/reviews/${id}`)
}
// Upload
export const uploadAPI = {
  image: (file: File) => {
    const formData = new FormData()
    formData.append('image', file)
    return api.post('/upload/image', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
  }
}

// Helper lấy URL ảnh
export const getImageUrl = (imageName: string | null) => {
  if (!imageName) return null
  if (imageName.startsWith('http')) return imageName
  return `http://localhost:3000/uploads/${imageName}`
}
export default api