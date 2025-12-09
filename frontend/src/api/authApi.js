import axios from 'axios';
import { tokenManager } from '../utils/tokenManager';

// Base URL của Backend API
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8081/api/auth';

// Tạo axios instance
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor: Tự động thêm token vào header
apiClient.interceptors.request.use(
  (config) => {
    const token = tokenManager.getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor: Xử lý response lỗi
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      tokenManager.clearAll();
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authApi = {
  // Đăng ký
  register: async (data) => {
    try {
      const response = await apiClient.post('/api/auth/register', data);  // ✅ Thêm /api/auth
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Đăng ký thất bại',
      };
    }
  },

  // Đăng nhập
  login: async (data) => {
    try {
      const response = await apiClient.post('/api/auth/login', data);  // ✅ Thêm /api/auth
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Đăng nhập thất bại',
      };
    }
  },

  // Đăng nhập bằng Google/GitHub
  socialLogin: async (provider, accessToken) => {
    try {
      const response = await apiClient.post('/api/auth/social-login', {  // ✅ Thêm /api/auth
        provider,
        accessToken,
      });
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Đăng nhập thất bại',
      };
    }
  },

  // Lấy thông tin user hiện tại
  getCurrentUser: async () => {
    try {
      const response = await apiClient.get('/api/auth/me');  // ✅ Thêm /api/auth
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Không thể lấy thông tin user',
      };
    }
  },

  // Đăng xuất
  logout: async () => {
    try {
      await apiClient.post('/api/auth/logout');  // ✅ Thêm /api/auth
      tokenManager.clearAll();
      return { success: true };
    } catch (error) {
      tokenManager.clearAll();
      return { success: true };
    }
  },

  // Validate token
  validateToken: async () => {
    try {
      const response = await apiClient.get('/api/auth/validate');  // ✅ Thêm /api/auth
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false };
    }
  },

  // Test connection
  test: async () => {
    try {
      const response = await apiClient.get('/api/auth/test');  // ✅ Thêm /api/auth
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        message: 'Không thể kết nối đến server',
      };
    }
  },
};

export default apiClient;