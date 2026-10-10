// API service layer for StyleLease MERN Stack using Axios
import axios from 'axios';

// Create configured Axios client instance
const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to automatically attach JWT bearer token
api.interceptors.request.use(
  (config) => {
    const token =
      sessionStorage.getItem('token') || localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to format responses and normalize error messages
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const message =
      error.response?.data?.message ||
      error.response?.data?.error ||
      error.message ||
      'An unexpected error occurred while communicating with the server';
    return Promise.reject(new Error(message));
  }
);

// Authentication & User Profile Services
export const authAPI = {
  login: async (email, password) => {
    return api.post('/auth/login', { email, password });
  },

  register: async (name, email, password) => {
    return api.post('/auth/register', { name, email, password });
  },

  getProfile: async () => {
    return api.get('/auth/profile');
  },

  updateProfile: async (profileData) => {
    return api.put('/auth/profile', profileData);
  },

  addAddress: async (addressData) => {
    return api.post('/auth/address', addressData);
  },

  deleteAddress: async (addressId) => {
    return api.delete(`/auth/address/${addressId}`);
  },

  setDefaultAddress: async (addressId) => {
    return api.put(`/auth/address/${addressId}/default`);
  },

  sendOtp: async (recipient, purpose = 'verification') => {
    return api.post('/auth/send-otp', { recipient, purpose });
  },

  verifyOtp: async (recipient, otp) => {
    return api.post('/auth/verify-otp', { recipient, otp });
  },

  googleLogin: async (googlePayload) => {
    return api.post('/auth/google', googlePayload);
  },

  getAdminWhitelist: async () => {
    const data = await api.get('/auth/admin-whitelist');
    return data.adminEmails || [];
  },

  addAdminEmail: async (email) => {
    const data = await api.post('/auth/admin-whitelist', { email });
    return data.adminEmails || [];
  },

  removeAdminEmail: async (email) => {
    const data = await api.delete(`/auth/admin-whitelist/${encodeURIComponent(email)}`);
    return data.adminEmails || [];
  },
};

// Product Catalog Services
export const productAPI = {
  getAll: async (params = {}) => {
    const data = await api.get('/products', { params });
    return data.products || [];
  },

  getById: async (id) => {
    const data = await api.get(`/products/${id}`);
    return data.product;
  },

  create: async (productData) => {
    const data = await api.post('/products', productData);
    return data.product;
  },

  update: async (id, productData) => {
    const data = await api.put(`/products/${id}`, productData);
    return data.product;
  },

  delete: async (id) => {
    const data = await api.delete(`/products/${id}`);
    return data;
  },
};

// Order & Rental Management Services
export const orderAPI = {
  create: async (orderData) => {
    return api.post('/orders', orderData);
  },

  getMyOrders: async (email) => {
    const data = await api.get('/orders/myorders', {
      params: email ? { email } : {},
    });
    return data.orders || [];
  },

  getById: async (id) => {
    const data = await api.get(`/orders/${id}`);
    return data.order;
  },

  getAll: async () => {
    const data = await api.get('/orders');
    return data.orders || [];
  },

  updateStatus: async (id, status) => {
    return api.put(`/orders/${id}/status`, { status });
  },

  processReturn: async (id, returnData) => {
    return api.put(`/orders/${id}/return`, returnData);
  },

  getMisReport: async () => {
    return api.get('/orders/mis-report');
  },
};

export default api;
