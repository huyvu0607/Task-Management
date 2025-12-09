import { createContext, useState, useContext, useEffect } from 'react';
import { authApi } from '../api/authApi';
import { tokenManager } from '../utils/tokenManager';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Kiểm tra authentication khi app load
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const token = tokenManager.getToken();
      if (!token) {
        setLoading(false);
        return;
      }

      const result = await authApi.getCurrentUser();
      if (result.success) {
        setUser(result.data);
        setIsAuthenticated(true);
      } else {
        tokenManager.clearAll();
      }
    } catch (error) {
      tokenManager.clearAll();
    } finally {
      setLoading(false);
    }
  };

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

  const register = async (data) => {
    try {
      const result = await authApi.register(data);
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
      return { success: false, message: 'Đăng ký thất bại' };
    }
  };

  // Social Login (Google/GitHub)
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

  const value = {
    user,
    loading,
    isAuthenticated,
    login,
    register,
    socialLogin,
    logout,
    checkAuth,
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