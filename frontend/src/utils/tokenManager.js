// Token Management Utility
const TOKEN_KEY = 'taskflow_token';
const USER_KEY = 'taskflow_user';

export const tokenManager = {
  // Lưu token vào localStorage
  setToken: (token) => {
    localStorage.setItem(TOKEN_KEY, token);
  },

  // Lấy token từ localStorage
  getToken: () => {
    return localStorage.getItem(TOKEN_KEY);
  },

  // Xóa token
  removeToken: () => {
    localStorage.removeItem(TOKEN_KEY);
  },

  // Lưu thông tin user
  setUser: (user) => {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  },

  // Lấy thông tin user
  getUser: () => {
    const user = localStorage.getItem(USER_KEY);
    return user ? JSON.parse(user) : null;
  },

  // Xóa thông tin user
  removeUser: () => {
    localStorage.removeItem(USER_KEY);
  },

  // Xóa tất cả
  clearAll: () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  },

  // Kiểm tra có token không
  hasToken: () => {
    return !!localStorage.getItem(TOKEN_KEY);
  }
};