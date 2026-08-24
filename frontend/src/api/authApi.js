import axios from 'axios';
import { tokenManager } from '../utils/tokenManager';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8081/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// ========== REQUEST INTERCEPTOR ==========
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

// ========== RESPONSE INTERCEPTOR ==========
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const url = error.config?.url || '';

    const publicEndpoints = [
      '/team-invitations/token',
      '/auth/login',
      '/auth/register',
      '/auth/verify-email',
    ];

    const isPublicEndpoint = publicEndpoints.some(ep => url.includes(ep));

    if (status === 401 && !isPublicEndpoint) {
      tokenManager.clearAll();
      window.location.href = '/login';
    }

    return Promise.reject(error);
  }
);


// ========== AUTH API ==========
export const authApi = {
  
  // ========== STANDARD AUTH ==========
  
  register: async (data) => {
    try {
      const response = await apiClient.post('/auth/register', data);
      return { success: true, data: response.data };
    } catch (error) {
      console.error('❌ Register error:', error.response?.data || error.message);
      return {
        success: false,
        message: error.response?.data?.message || 
                error.response?.data?.error || 
                'Đăng ký thất bại',
      };
    }
  },

  login: async (data) => {
    try {
      const response = await apiClient.post('/auth/login', data);
      return { success: true, data: response.data };
    } catch (error) {
      console.error('❌ Login error:', error.response?.data || error.message);
      return {
        success: false,
        message: error.response?.data?.message || 
                error.response?.data?.error || 
                'Đăng nhập thất bại',
      };
    }
  },

  socialLogin: async (provider, accessToken) => {
    try {
      const response = await apiClient.post('/auth/social-login', {
        provider,
        accessToken,
      });
      return { success: true, data: response.data };
    } catch (error) {
      console.error('❌ Social login error:', error.response?.data || error.message);
      return {
        success: false,
        message: error.response?.data?.message || 
                error.response?.data?.error || 
                'Đăng nhập thất bại',
      };
    }
  },

  getCurrentUser: async () => {
    try {
      const response = await apiClient.get('/auth/me');
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Không thể lấy thông tin user',
      };
    }
  },

  logout: async () => {
    try {
      await apiClient.post('/auth/logout');
      tokenManager.clearAll();
      return { success: true };
    } catch (error) {
      tokenManager.clearAll();
      return { success: true };
    }
  },

  validateToken: async () => {
    try {
      const response = await apiClient.get('/auth/validate');
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false };
    }
  },

  test: async () => {
    try {
      const response = await apiClient.get('/auth/test');
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        message: 'Không thể kết nối đến server',
      };
    }
  },

  // ========== EMAIL VERIFICATION ==========

  /**
   * Verify email bằng token từ URL
   * GET /api/auth/verify-email?token=xxx
   */
  verifyEmailToken: async (token) => {
    try {
      const response = await apiClient.get(`/auth/verify-email?token=${token}`);
      return { 
        success: true, 
        data: response.data,
        message: response.data.message 
      };
    } catch (error) {
      console.error('❌ Verify email error:', error.response?.data || error.message);
      return {
        success: false,
        message: error.response?.data?.message || 
                error.response?.data?.error || 
                'Xác thực email thất bại',
      };
    }
  },

  /**
   * Gửi lại email verification
   * POST /api/auth/resend-verification
   */
  resendVerificationEmail: async (email) => {
    try {
      const response = await apiClient.post('/auth/resend-verification', { email });
      return { 
        success: true, 
        data: response.data,
        message: response.data.message 
      };
    } catch (error) {
      console.error('❌ Resend verification error:', error.response?.data || error.message);
      return {
        success: false,
        message: error.response?.data?.message || 
                error.response?.data?.error || 
                'Không thể gửi lại email xác nhận',
      };
    }
  },

  /**
   * Kiểm tra email đã verify chưa
   * GET /api/auth/check-email-verified?email=xxx
   */
  checkEmailVerified: async (email) => {
    try {
      const response = await apiClient.get(`/auth/check-email-verified?email=${email}`);
      return { 
        success: true, 
        data: response.data 
      };
    } catch (error) {
      console.error('❌ Check email verified error:', error.response?.data || error.message);
      return {
        success: false,
        message: error.response?.data?.message || 'Không thể kiểm tra trạng thái email',
      };
    }
  },
  // ========== THÊM VÀO authApi.js (sau phần EMAIL VERIFICATION) ==========

  // ========== PASSWORD RESET ==========

  /**
   * Gửi email forgot password
   * POST /api/auth/forgot-password
   */
  forgotPassword: async (email) => {
    try {
      const response = await apiClient.post('/auth/forgot-password', { email });
      return { 
        success: true, 
        data: response.data,
        message: response.data.message 
      };
    } catch (error) {
      console.error('❌ Forgot password error:', error.response?.data || error.message);
      return {
        success: false,
        message: error.response?.data?.message || 
                error.response?.data?.error || 
                'Không thể gửi email đặt lại mật khẩu',
      };
    }
  },

  /**
   * Validate reset password token
   * GET /api/auth/validate-reset-token?token=xxx
   */
  validateResetToken: async (token) => {
    try {
      const response = await apiClient.get(`/auth/validate-reset-token?token=${token}`);
      return { 
        success: true, 
        data: response.data,
        message: response.data.message 
      };
    } catch (error) {
      console.error('❌ Validate reset token error:', error.response?.data || error.message);
      return {
        success: false,
        message: error.response?.data?.message || 
                error.response?.data?.error || 
                'Token không hợp lệ hoặc đã hết hạn',
      };
    }
  },

  /**
   * Reset password với token
   * POST /api/auth/reset-password
   */
  resetPassword: async (token, newPassword, confirmPassword) => {
    try {
      const response = await apiClient.post('/auth/reset-password', {
        token,
        newPassword,
        confirmPassword
      });
      return { 
        success: true, 
        data: response.data,
        message: response.data.message 
      };
    } catch (error) {
      console.error('❌ Reset password error:', error.response?.data || error.message);
      return {
        success: false,
        message: error.response?.data?.message || 
                error.response?.data?.error || 
                'Không thể đặt lại mật khẩu',
      };
    }
  },
  
  // ========== PROFILE MANAGEMENT (FR-1.3) ==========

  /**
   * Update user profile
   * PUT /api/auth/me
   */
  updateProfile: async (data) => {
    try {
      const response = await apiClient.put('/auth/me', data);
      return { 
        success: true, 
        data: response.data,
        message: 'Cập nhật profile thành công'
      };
    } catch (error) {
      console.error('❌ Update profile error:', error.response?.data || error.message);
      return {
        success: false,
        message: error.response?.data?.message || 
                error.response?.data?.error || 
                'Không thể cập nhật profile',
      };
    }
  },

  /**
   * Upload avatar
   * POST /api/auth/upload-avatar
   */
  uploadAvatar: async (file) => {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await apiClient.post('/auth/upload-avatar', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return { 
        success: true, 
        data: response.data,
        message: 'Upload avatar thành công'
      };
    } catch (error) {
      console.error('❌ Upload avatar error:', error.response?.data || error.message);
      return {
        success: false,
        message: error.response?.data?.message || 
                error.response?.data?.error || 
                'Không thể upload avatar',
      };
    }
  },

  // ========== CHANGE PASSWORD (FR-1.4) ==========

  /**
   * Change password
   * POST /api/auth/change-password
   */
  changePassword: async (oldPassword, newPassword, confirmPassword) => {
    try {
      const response = await apiClient.post('/auth/change-password', {
        oldPassword,
        newPassword,
        confirmPassword
      });
      return { 
        success: true, 
        data: response.data,
        message: response.data.message || 'Đổi mật khẩu thành công'
      };
    } catch (error) {
      console.error('❌ Change password error:', error.response?.data || error.message);
      return {
        success: false,
        message: error.response?.data?.message || 
                error.response?.data?.error || 
                'Không thể đổi mật khẩu',
      };
    }
  },
};

export default apiClient;