import apiClient from './authApi';

/**
 * Comment API
 * Base URL: /api
 */
export const commentApi = {
  // ========== COMMENT CRUD ==========

  /**
   * Tạo comment mới
   * POST /api/comments
   */
  create: async (data) => {
    try {
      const response = await apiClient.post('/comments', data);
      return { success: true, data: response.data };
    } catch (error) {
      console.error('❌ Create comment error:', error.response?.data || error.message);
      return {
        success: false,
        message: error.response?.data?.message || 
                error.response?.data?.error || 
                'Không thể tạo comment',
      };
    }
  },

  /**
   * Lấy comment detail
   * GET /api/comments/{id}
   */
  getById: async (id) => {
    try {
      const response = await apiClient.get(`/comments/${id}`);
      return { success: true, data: response.data };
    } catch (error) {
      console.error('❌ Get comment error:', error.response?.data || error.message);
      return {
        success: false,
        message: error.response?.data?.message || 'Không thể lấy comment',
      };
    }
  },

  /**
   * Lấy tất cả comments của task
   * GET /api/tasks/{taskId}/comments
   */
  getByTask: async (taskId) => {
    try {
      const response = await apiClient.get(`/tasks/${taskId}/comments`);
      return { success: true, data: response.data };
    } catch (error) {
      console.error('❌ Get comments error:', error.response?.data || error.message);
      return {
        success: false,
        message: error.response?.data?.message || 'Không thể lấy danh sách comments',
      };
    }
  },

  /**
   * Cập nhật comment
   * PUT /api/comments/{id}
   */
  update: async (id, data) => {
    try {
      const response = await apiClient.put(`/comments/${id}`, data);
      return { success: true, data: response.data };
    } catch (error) {
      console.error('❌ Update comment error:', error.response?.data || error.message);
      return {
        success: false,
        message: error.response?.data?.message || 
                error.response?.data?.error || 
                'Không thể cập nhật comment',
      };
    }
  },

  /**
   * Xóa comment
   * DELETE /api/comments/{id}
   */
  delete: async (id) => {
    try {
      const response = await apiClient.delete(`/comments/${id}`);
      return { success: true, data: response.data };
    } catch (error) {
      console.error('❌ Delete comment error:', error.response?.data || error.message);
      return {
        success: false,
        message: error.response?.data?.message || 
                error.response?.data?.error || 
                'Không thể xóa comment',
      };
    }
  },

  // ========== ATTACHMENT MANAGEMENT ==========

  /**
   * Upload single attachment
   * POST /api/comments/attachments
   */
  uploadAttachment: async (file, commentId = null, taskId = null) => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      if (commentId) formData.append('commentId', commentId);
      if (taskId) formData.append('taskId', taskId);

      const response = await apiClient.post('/comments/attachments', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return { success: true, data: response.data };
    } catch (error) {
      console.error('❌ Upload attachment error:', error.response?.data || error.message);
      return {
        success: false,
        message: error.response?.data?.message || 
                error.response?.data?.error || 
                'Không thể upload file',
      };
    }
  },

  /**
   * Upload multiple attachments
   * POST /api/comments/attachments/bulk
   */
  uploadMultiple: async (files, commentId = null, taskId = null) => {
    try {
      const formData = new FormData();
      files.forEach((file) => {
        formData.append('files', file);
      });
      if (commentId) formData.append('commentId', commentId);
      if (taskId) formData.append('taskId', taskId);

      const response = await apiClient.post('/comments/attachments/bulk', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return { success: true, data: response.data };
    } catch (error) {
      console.error('❌ Upload multiple attachments error:', error.response?.data || error.message);
      return {
        success: false,
        message: error.response?.data?.message || 
                error.response?.data?.error || 
                'Không thể upload files',
      };
    }
  },

  /**
   * Lấy attachments của task
   * GET /api/tasks/{taskId}/attachments
   */
  getAttachmentsByTask: async (taskId) => {
    try {
      const response = await apiClient.get(`/tasks/${taskId}/attachments`);
      return { success: true, data: response.data };
    } catch (error) {
      console.error('❌ Get attachments error:', error.response?.data || error.message);
      return {
        success: false,
        message: error.response?.data?.message || 'Không thể lấy attachments',
      };
    }
  },

  /**
   * Lấy attachments của comment
   * GET /api/comments/{commentId}/attachments
   */
  getAttachmentsByComment: async (commentId) => {
    try {
      const response = await apiClient.get(`/comments/${commentId}/attachments`);
      return { success: true, data: response.data };
    } catch (error) {
      console.error('❌ Get attachments error:', error.response?.data || error.message);
      return {
        success: false,
        message: error.response?.data?.message || 'Không thể lấy attachments',
      };
    }
  },

  /**
   * Xóa attachment
   * DELETE /api/attachments/{id}
   */
  deleteAttachment: async (id) => {
    try {
      const response = await apiClient.delete(`/attachments/${id}`);
      return { success: true, data: response.data };
    } catch (error) {
      console.error('❌ Delete attachment error:', error.response?.data || error.message);
      return {
        success: false,
        message: error.response?.data?.message || 
                error.response?.data?.error || 
                'Không thể xóa file',
      };
    }
  },

  // ========== SEARCH & FILTER ==========

  /**
   * Tìm kiếm comments theo keyword
   * GET /api/tasks/{taskId}/comments/search?keyword={keyword}
   */
  searchComments: async (taskId, keyword) => {
    try {
      const response = await apiClient.get(`/tasks/${taskId}/comments/search`, {
        params: { keyword },
      });
      return { success: true, data: response.data };
    } catch (error) {
      console.error('❌ Search comments error:', error.response?.data || error.message);
      return {
        success: false,
        message: error.response?.data?.message || 'Không thể tìm kiếm comments',
      };
    }
  },

  /**
   * Lấy comments có attachments
   * GET /api/tasks/{taskId}/comments/with-attachments
   */
  getCommentsWithAttachments: async (taskId) => {
    try {
      const response = await apiClient.get(`/tasks/${taskId}/comments/with-attachments`);
      return { success: true, data: response.data };
    } catch (error) {
      console.error('❌ Get comments with attachments error:', error.response?.data || error.message);
      return {
        success: false,
        message: error.response?.data?.message || 'Không thể lấy comments',
      };
    }
  },

  // ========== STATISTICS ==========

  /**
   * Đếm số comments của task
   * GET /api/tasks/{taskId}/comments/count
   */
  countByTask: async (taskId) => {
    try {
      const response = await apiClient.get(`/tasks/${taskId}/comments/count`);
      return { success: true, data: response.data };
    } catch (error) {
      console.error('❌ Count comments error:', error.response?.data || error.message);
      return {
        success: false,
        message: error.response?.data?.message || 'Không thể đếm comments',
      };
    }
  },

  /**
   * Đếm số attachments của task
   * GET /api/tasks/{taskId}/attachments/count
   */
  countAttachmentsByTask: async (taskId) => {
    try {
      const response = await apiClient.get(`/tasks/${taskId}/attachments/count`);
      return { success: true, data: response.data };
    } catch (error) {
      console.error('❌ Count attachments error:', error.response?.data || error.message);
      return {
        success: false,
        message: error.response?.data?.message || 'Không thể đếm attachments',
      };
    }
  },
};