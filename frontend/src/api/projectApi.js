import apiClient from './authApi';

/**
 * API cho Projects Module
 * Tương ứng với ProjectController trong backend
 */
export const projectApi = {
  
  // ========== CREATE PROJECT ==========
  /**
   * Tạo project mới
   * POST /api/projects
   */
  createProject: async (data) => {
    try {
      const response = await apiClient.post('/projects', data);
      return { 
        success: true, 
        data: response.data.data,
        message: response.data.message 
      };
    } catch (error) {
      console.error('❌ Create project error:', error.response?.data || error.message);
      return {
        success: false,
        message: error.response?.data?.message || 
                error.response?.data?.error || 
                'Không thể tạo project',
      };
    }
  },

  // ========== GET PROJECT BY ID ==========
  /**
   * Lấy chi tiết project
   * GET /api/projects/{id}
   */
  getProjectById: async (id) => {
    try {
      const response = await apiClient.get(`/projects/${id}`);
      return { 
        success: true, 
        data: response.data.data 
      };
    } catch (error) {
      console.error('❌ Get project error:', error.response?.data || error.message);
      return {
        success: false,
        message: error.response?.data?.message || 'Không thể lấy thông tin project',
      };
    }
  },

  // ========== GET PROJECTS BY TEAM ==========
  /**
   * Lấy danh sách projects của team
   * GET /api/projects/team/{teamId}?page=0&size=10&status=ACTIVE
   */
  getProjectsByTeam: async (teamId, params = {}) => {
    try {
      const { page = 0, size = 10, status, sortBy = 'createdAt', sortDir = 'DESC' } = params;
      
      let url = `/projects/team/${teamId}?page=${page}&size=${size}&sortBy=${sortBy}&sortDir=${sortDir}`;
      
      if (status) {
        url += `&status=${status}`;
      }
      
      const response = await apiClient.get(url);
      return { 
        success: true, 
        data: response.data.data 
      };
    } catch (error) {
      console.error('❌ Get projects error:', error.response?.data || error.message);
      return {
        success: false,
        message: error.response?.data?.message || 'Không thể lấy danh sách projects',
      };
    }
  },

  // ========== GET MY PROJECTS ==========
  /**
   * Lấy danh sách projects của user hiện tại
   * GET /api/projects/my-projects
   */
  getMyProjects: async () => {
    try {
      const response = await apiClient.get('/projects/my-projects');
      return { 
        success: true, 
        data: response.data.data 
      };
    } catch (error) {
      console.error('❌ Get my projects error:', error.response?.data || error.message);
      return {
        success: false,
        message: error.response?.data?.message || 'Không thể lấy danh sách projects',
      };
    }
  },

  // ========== UPDATE PROJECT ==========
  /**
   * Cập nhật project
   * PUT /api/projects/{id}
   */
  updateProject: async (id, data) => {
    try {
      const response = await apiClient.put(`/projects/${id}`, data);
      return { 
        success: true, 
        data: response.data.data,
        message: response.data.message 
      };
    } catch (error) {
      console.error('❌ Update project error:', error.response?.data || error.message);
      return {
        success: false,
        message: error.response?.data?.message || 
                error.response?.data?.error || 
                'Không thể cập nhật project',
      };
    }
  },

  // ========== DELETE PROJECT ==========
  /**
   * Xóa project (archive)
   * DELETE /api/projects/{id}
   */
  deleteProject: async (id) => {
    try {
      const response = await apiClient.delete(`/projects/${id}`);
      return { 
        success: true,
        message: response.data.message 
      };
    } catch (error) {
      console.error('❌ Delete project error:', error.response?.data || error.message);
      return {
        success: false,
        message: error.response?.data?.message || 'Không thể xóa project',
      };
    }
  },

  // ========== ARCHIVE PROJECT ==========
  /**
   * Archive project
   * POST /api/projects/{id}/archive
   */
  archiveProject: async (id) => {
    try {
      const response = await apiClient.post(`/projects/${id}/archive`);
      return { 
        success: true,
        data: response.data.data,
        message: response.data.message 
      };
    } catch (error) {
      console.error('❌ Archive project error:', error.response?.data || error.message);
      return {
        success: false,
        message: error.response?.data?.message || 'Không thể archive project',
      };
    }
  },

  // ========== UNARCHIVE PROJECT ==========
  /**
   * Unarchive project
   * POST /api/projects/{id}/unarchive
   */
  unarchiveProject: async (id) => {
    try {
      const response = await apiClient.post(`/projects/${id}/unarchive`);
      return { 
        success: true,
        data: response.data.data,
        message: response.data.message 
      };
    } catch (error) {
      console.error('❌ Unarchive project error:', error.response?.data || error.message);
      return {
        success: false,
        message: error.response?.data?.message || 'Không thể unarchive project',
      };
    }
  },

  // ========== RECALCULATE PROGRESS ==========
  /**
   * Tính lại progress của project
   * POST /api/projects/{id}/recalculate-progress
   */
  recalculateProgress: async (id) => {
    try {
      const response = await apiClient.post(`/projects/${id}/recalculate-progress`);
      return { 
        success: true,
        message: response.data.message 
      };
    } catch (error) {
      console.error('❌ Recalculate progress error:', error.response?.data || error.message);
      return {
        success: false,
        message: error.response?.data?.message || 'Không thể tính lại progress',
      };
    }
  },

  // ========== GET PROJECT STATS ==========
  /**
   * Lấy thống kê projects của team
   * GET /api/projects/team/{teamId}/stats
   */
  getProjectStats: async (teamId) => {
    try {
      const response = await apiClient.get(`/projects/team/${teamId}/stats`);
      return { 
        success: true, 
        data: response.data.data 
      };
    } catch (error) {
      console.error('❌ Get project stats error:', error.response?.data || error.message);
      return {
        success: false,
        message: error.response?.data?.message || 'Không thể lấy thống kê projects',
      };
    }
  },
};