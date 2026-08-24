import apiClient from './authApi';

const DASHBOARD_BASE = '/dashboard';

export const dashboardApi = {
  // Lấy toàn bộ dashboard data (1 API call duy nhất - RECOMMENDED)
  getPersonalDashboard: async () => {
    const response = await apiClient.get(`${DASHBOARD_BASE}/personal`);
    return response.data;
  },

  // Lấy stats tổng quan
  getStats: async () => {
    const response = await apiClient.get(`${DASHBOARD_BASE}/stats`);
    return response.data;
  },

  // Task được assign cho tôi
  getMyTasks: async (limit = 10) => {
    const response = await apiClient.get(
      `${DASHBOARD_BASE}/my-tasks`,
      { params: { limit } }
    );
    return response.data;
  },

  // Task do tôi tạo
  getTasksCreatedByMe: async (limit = 5) => {
    const response = await apiClient.get(
      `${DASHBOARD_BASE}/created-by-me`,
      { params: { limit } }
    );
    return response.data;
  },

  // Task quá hạn
  getOverdueTasks: async (limit = 5) => {
    const response = await apiClient.get(
      `${DASHBOARD_BASE}/overdue`,
      { params: { limit } }
    );
    return response.data;
  },

  // Task đến hạn hôm nay
  getTasksDueToday: async (limit = 5) => {
    const response = await apiClient.get(
      `${DASHBOARD_BASE}/due-today`,
      { params: { limit } }
    );
    return response.data;
  },

  // Hoạt động gần đây
  getRecentActivities: async (limit = 10) => {
    const response = await apiClient.get(
      `${DASHBOARD_BASE}/activities`,
      { params: { limit } }
    );
    return response.data;
  }
};

export default dashboardApi;
