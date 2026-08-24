import apiClient from './authApi';

/**
 * API cho Tasks Module
 * Tương ứng với TaskController trong backend
 */
export const taskApi = {
  
  // ========== CREATE TASK (FR-4.1) ==========
  /**
   * Tạo task mới
   * POST /api/v1/tasks
   */
  createTask: async (data) => {
    try {
      const response = await apiClient.post('/v1/tasks', data);
      return { 
        success: true, 
        data: response.data.data,
        message: response.data.message 
      };
    } catch (error) {
      console.error('❌ Create task error:', error.response?.data || error.message);
      return {
        success: false,
        message: error.response?.data?.message || 
                error.response?.data?.error || 
                'Không thể tạo task',
      };
    }
  },

  // ========== GET TASK DETAIL (FR-4.2) ==========
  /**
   * Lấy chi tiết task
   * GET /api/v1/tasks/{taskId}
   */
  getTaskDetail: async (taskId) => {
    try {
      const response = await apiClient.get(`/v1/tasks/${taskId}`);
      return { 
        success: true, 
        data: response.data.data 
      };
    } catch (error) {
      console.error('❌ Get task detail error:', error.response?.data || error.message);
      return {
        success: false,
        message: error.response?.data?.message || 'Không thể lấy thông tin task',
      };
    }
  },

  // ========== UPDATE TASK (FR-4.3) ==========
  /**
   * Cập nhật task
   * PUT /api/v1/tasks/{taskId}
   */
  updateTask: async (taskId, data) => {
    try {
      const response = await apiClient.put(`/v1/tasks/${taskId}`, data);
      return { 
        success: true, 
        data: response.data.data,
        message: response.data.message 
      };
    } catch (error) {
      console.error('❌ Update task error:', error.response?.data || error.message);
      return {
        success: false,
        message: error.response?.data?.message || 
                error.response?.data?.error || 
                'Không thể cập nhật task',
      };
    }
  },

  // ========== DELETE TASK (FR-4.4) ==========
  /**
   * Xóa task
   * DELETE /api/v1/tasks/{taskId}
   */
  deleteTask: async (taskId) => {
    try {
      const response = await apiClient.delete(`/v1/tasks/${taskId}`);
      return { 
        success: true,
        message: response.data.message 
      };
    } catch (error) {
      console.error('❌ Delete task error:', error.response?.data || error.message);
      return {
        success: false,
        message: error.response?.data?.message || 'Không thể xóa task',
      };
    }
  },

  // ========== ASSIGN TASK (FR-4.5) ==========
  /**
   * Assign task cho users
   * POST /api/v1/tasks/{taskId}/assign
   */
  assignTask: async (taskId, data) => {
    try {
      const response = await apiClient.post(`/v1/tasks/${taskId}/assign`, data);
      return { 
        success: true,
        data: response.data.data,
        message: response.data.message 
      };
    } catch (error) {
      console.error('❌ Assign task error:', error.response?.data || error.message);
      return {
        success: false,
        message: error.response?.data?.message || 'Không thể assign task',
      };
    }
  },

  // ========== FILTER TASKS (FR-4.6 & FR-4.7) ==========
  /**
   * Filter và search tasks
   * POST /api/v1/tasks/project/{projectId}/filter
   */
  filterTasks: async (projectId, filters) => {
    try {
      const response = await apiClient.post(`/v1/tasks/project/${projectId}/filter`, filters);
      return { 
        success: true, 
        data: response.data.data 
      };
    } catch (error) {
      console.error('❌ Filter tasks error:', error.response?.data || error.message);
      return {
        success: false,
        message: error.response?.data?.message || 'Không thể lọc tasks',
      };
    }
  },

  // ========== GET TASKS BY PROJECT ==========
  /**
   * Lấy tất cả tasks của project
   * GET /api/v1/tasks/project/{projectId}?page=0&size=20
   */
  getTasksByProject: async (projectId, page = 0, size = 20) => {
    try {
      const response = await apiClient.get(`/v1/tasks/project/${projectId}?page=${page}&size=${size}`);
      return { 
        success: true, 
        data: response.data.data 
      };
    } catch (error) {
      console.error('❌ Get tasks error:', error.response?.data || error.message);
      return {
        success: false,
        message: error.response?.data?.message || 'Không thể lấy danh sách tasks',
      };
    }
  },

  // ========== UPDATE TASK STATUS ==========
  /**
   * Cập nhật status của task
   * PATCH /api/v1/tasks/{taskId}/status?status=IN_PROGRESS
   */
  updateTaskStatus: async (taskId, status) => {
    try {
      const response = await apiClient.patch(`/v1/tasks/${taskId}/status?status=${status}`);
      return { 
        success: true,
        data: response.data.data,
        message: response.data.message 
      };
    } catch (error) {
      console.error('❌ Update status error:', error.response?.data || error.message);
      return {
        success: false,
        message: error.response?.data?.message || 'Không thể cập nhật status',
      };
    }
  },

  // ========== UPDATE TASK PRIORITY ==========
  /**
   * Cập nhật priority của task
   * PATCH /api/v1/tasks/{taskId}/priority?priority=HIGH
   */
  updateTaskPriority: async (taskId, priority) => {
    try {
      const response = await apiClient.patch(`/v1/tasks/${taskId}/priority?priority=${priority}`);
      return { 
        success: true,
        data: response.data.data,
        message: response.data.message 
      };
    } catch (error) {
      console.error('❌ Update priority error:', error.response?.data || error.message);
      return {
        success: false,
        message: error.response?.data?.message || 'Không thể cập nhật priority',
      };
    }
  },
  /**
 * Lấy danh sách tasks của user hiện tại
 * GET /api/v1/tasks/my-tasks
 */
getMyTasks: async ({ status = null, priority = null, page = 0, size = 20 } = {}) => {
  try {
    let url = `/v1/tasks/my-tasks?page=${page}&size=${size}`;
    
    if (status && status !== 'ALL') {
      url += `&status=${status}`;
    }
    
    if (priority && priority !== 'ALL') {
      url += `&priority=${priority}`;
    }
    
    const response = await apiClient.get(url);
    return { 
      success: true, 
      data: response.data.data 
    };
  } catch (error) {
    console.error('❌ Get my tasks error:', error.response?.data || error.message);
    return {
      success: false,
      message: error.response?.data?.message || 'Không thể lấy danh sách tasks',
    };
  }
},
};