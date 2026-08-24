import { createContext, useState, useContext, useEffect } from 'react';
import { authApi } from '../api/authApi';
import { tokenManager } from '../utils/tokenManager';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // ✅ FIXED: Kiểm tra authentication với AbortController và retry logic
  useEffect(() => {
    const controller = new AbortController();
    
    const checkAuth = async () => {
      try {
        const token = tokenManager.getToken();
        if (!token) {
          setLoading(false);
          return;
        }

        // ✅ Retry mechanism để tránh lỗi khi F5 liên tục
        let retries = 2;
        let result;
        
        while (retries > 0) {
          result = await authApi.getCurrentUser(controller.signal);
          
          // ✅ Nếu thành công, set user và thoát
          if (result.success) {
            setUser(result.data);
            setIsAuthenticated(true);
            setLoading(false);
            return;
          }
          
          // ✅ Nếu request bị cancel, dừng ngay
          if (result.message === 'Request cancelled') {
            setLoading(false);
            return;
          }
          
          // ✅ Nếu lỗi và còn retry, đợi rồi thử lại
          if (retries > 1) {
            await new Promise(resolve => setTimeout(resolve, 500)); // Đợi 500ms
            retries--;
          } else {
            break;
          }
        }
        
        // ✅ Sau khi hết retry mà vẫn lỗi, mới clear token
        console.warn('⚠️ Token invalid after retries, clearing...');
        tokenManager.clearAll();
        setIsAuthenticated(false);
        
      } catch (error) {
        console.error('❌ CheckAuth error:', error);
        if (error.name !== 'AbortError') {
          tokenManager.clearAll();
          setIsAuthenticated(false);
        }
      } finally {
        setLoading(false);
      }
    };

    checkAuth();

    // ✅ Cleanup: Cancel request khi component unmount
    return () => {
      controller.abort();
    };
  }, []);

  const login = async (credentials) => {
    try {
      const result = await authApi.login(credentials);
      if (result.success) {
        const { token, ...userData } = result.data;
        tokenManager.setToken(token);
        tokenManager.setUser(userData);
        setUser(userData);
        setIsAuthenticated(true);
        return { success: true };
      }
      return { success: false, message: result.message };
    } catch (error) {
      return { success: false, message: 'Đăng nhập thất bại' };
    }
  };

  // ✅ FIXED: Không tự động lưu token khi đăng ký
  const register = async (data) => {
    try {
      const result = await authApi.register(data);
      if (result.success) {
        // ✅ CHỈ TRẢ VỀ KẾT QUẢ, để Register.jsx tự xử lý redirect
        return { 
          success: true,
          message: 'Đăng ký thành công! Vui lòng kiểm tra email để xác thực tài khoản.',
          data: result.data
        };
      }
      return { success: false, message: result.message };
    } catch (error) {
      return { success: false, message: 'Đăng ký thất bại' };
    }
  };

  // Social Login (Google/GitHub) - Giữ nguyên vì social login thường tự động verify
  const socialLogin = async (provider, accessToken) => {
    try {
      const result = await authApi.socialLogin(provider, accessToken);
      if (result.success) {
        const { token, ...userData } = result.data;
        tokenManager.setToken(token);
        tokenManager.setUser(userData);
        setUser(userData);
        setIsAuthenticated(true);
        return { success: true };
      }
      return { success: false, message: result.message };
    } catch (error) {
      return { success: false, message: 'Đăng nhập thất bại' };
    }
  };

  const logout = async () => {
    await authApi.logout();
    setUser(null);
    setIsAuthenticated(false);
    tokenManager.clearAll();
  };

  // ✅ Hàm để verify email và login sau khi verify thành công
  const verifyEmailAndLogin = async (token) => {
    try {
      const result = await authApi.verifyEmailToken(token);
      if (result.success && result.data.token) {
        const { token: authToken, ...userData } = result.data;
        tokenManager.setToken(authToken);
        tokenManager.setUser(userData);
        setUser(userData);
        setIsAuthenticated(true);
        return { success: true, message: 'Xác thực thành công!' };
      }
      return { success: false, message: result.message || 'Xác thực thất bại' };
    } catch (error) {
      return { success: false, message: 'Xác thực thất bại' };
    }
  };

  // ✅ Thêm hàm refreshUser để update user info khi cần
  const refreshUser = async () => {
    try {
      const result = await authApi.getCurrentUser();
      if (result.success) {
        setUser(result.data);
        tokenManager.setUser(result.data);
        return { success: true };
      }
      return { success: false };
    } catch (error) {
      return { success: false };
    }
  };

  const value = {
    user,
    loading,
    isAuthenticated,
    login,
    register,
    socialLogin,
    logout,
    verifyEmailAndLogin,
    refreshUser, // ✅ Thêm vào value
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};