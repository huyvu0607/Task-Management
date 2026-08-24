import apiClient from './authApi';

/**
 * Notification API
 * Base URL: /api/notifications
 */
export const notificationApi = {
  // ========== GET NOTIFICATIONS ==========

  /**
   * Lấy danh sách notifications (có phân trang)
   * GET /api/notifications?page=0&size=20
   */
  getAll: async (page = 0, size = 20) => {
    try {
      const response = await apiClient.get('/notifications', {
        params: { page, size },
      });
      return { success: true, data: response.data };
    } catch (error) {
      console.error('❌ Get notifications error:', error.response?.data || error.message);
      return {
        success: false,
        message: error.response?.data?.message || 'Không thể lấy notifications',
      };
    }
  },

  /**
   * Lấy notifications chưa đọc
   * GET /api/notifications/unread
   */
  getUnread: async () => {
    try {
      const response = await apiClient.get('/notifications/unread');
      return { success: true, data: response.data };
    } catch (error) {
      console.error('❌ Get unread notifications error:', error.response?.data || error.message);
      return {
        success: false,
        message: error.response?.data?.message || 'Không thể lấy notifications chưa đọc',
      };
    }
  },

  /**
   * Đếm số notifications chưa đọc
   * GET /api/notifications/unread/count
   */
  countUnread: async () => {
    try {
      const response = await apiClient.get('/notifications/unread/count');
      return { success: true, data: response.data };
    } catch (error) {
      console.error('❌ Count unread notifications error:', error.response?.data || error.message);
      return {
        success: false,
        message: error.response?.data?.message || 'Không thể đếm notifications',
      };
    }
  },

  /**
   * Lấy notification detail
   * GET /api/notifications/{id}
   */
  getById: async (id) => {
    try {
      const response = await apiClient.get(`/notifications/${id}`);
      return { success: true, data: response.data };
    } catch (error) {
      console.error('❌ Get notification error:', error.response?.data || error.message);
      return {
        success: false,
        message: error.response?.data?.message || 'Không thể lấy notification',
      };
    }
  },

  // ========== MARK AS READ ==========

  /**
   * Đánh dấu notification đã đọc
   * PUT /api/notifications/{id}/read
   */
  markAsRead: async (id) => {
    try {
      const response = await apiClient.put(`/notifications/${id}/read`);
      return { success: true, data: response.data };
    } catch (error) {
      console.error('❌ Mark as read error:', error.response?.data || error.message);
      return {
        success: false,
        message: error.response?.data?.message || 
                error.response?.data?.error || 
                'Không thể đánh dấu đã đọc',
      };
    }
  },

  /**
   * Đánh dấu tất cả notifications đã đọc
   * PUT /api/notifications/read-all
   */
  markAllAsRead: async () => {
    try {
      const response = await apiClient.put('/notifications/read-all');
      return { success: true, data: response.data };
    } catch (error) {
      console.error('❌ Mark all as read error:', error.response?.data || error.message);
      return {
        success: false,
        message: error.response?.data?.message || 
                error.response?.data?.error || 
                'Không thể đánh dấu tất cả đã đọc',
      };
    }
  },

  // ========== DELETE ==========

  /**
   * Xóa notification
   * DELETE /api/notifications/{id}
   */
  delete: async (id) => {
    try {
      const response = await apiClient.delete(`/notifications/${id}`);
      return { success: true, data: response.data };
    } catch (error) {
      console.error('❌ Delete notification error:', error.response?.data || error.message);
      return {
        success: false,
        message: error.response?.data?.message || 
                error.response?.data?.error || 
                'Không thể xóa notification',
      };
    }
  },

  /**
   * Xóa tất cả notifications đã đọc
   * DELETE /api/notifications/read
   */
  deleteAllRead: async () => {
    try {
      const response = await apiClient.delete('/notifications/read');
      return { success: true, data: response.data };
    } catch (error) {
      console.error('❌ Delete all read error:', error.response?.data || error.message);
      return {
        success: false,
        message: error.response?.data?.message || 
                error.response?.data?.error || 
                'Không thể xóa notifications đã đọc',
      };
    }
  },
};