// frontend/src/api/teamApi.js
import apiClient from './authApi';

// ==================== TEAM ENDPOINTS ====================

/**
 * Tạo team mới
 * POST /api/teams
 */
export const createTeam = async (teamData) => {
  const response = await apiClient.post('/teams', teamData);
  return response.data;
};

/**
 * Lấy danh sách teams của user hiện tại
 * GET /api/teams/my-teams
 */
export const getMyTeams = async (params = {}) => {
  const response = await apiClient.get('/teams/my-teams', { params });
  return response.data;
};

/**
 * Lấy thông tin chi tiết team
 * GET /api/teams/{id}
 */
export const getTeamById = async (teamId) => {
  const response = await apiClient.get(`/teams/${teamId}`);
  return response.data;
};

/**
 * Cập nhật thông tin team
 * PUT /api/teams/{id}
 */
export const updateTeam = async (teamId, teamData) => {
  const response = await apiClient.put(`/teams/${teamId}`, teamData);
  return response.data;
};

/**
 * Xóa team
 * DELETE /api/teams/{id}
 */
export const deleteTeam = async (teamId) => {
  const response = await apiClient.delete(`/teams/${teamId}`);
  return response.data;
};

/**
 * Active/Deactive team
 * PATCH /api/teams/{id}/toggle-status
 */
export const toggleTeamStatus = async (teamId) => {
  const response = await apiClient.patch(`/teams/${teamId}/toggle-status`);
  return response.data;
};

/**
 * Tìm kiếm teams
 * GET /api/teams/search?keyword=marketing
 */
export const searchTeams = async (keyword, params = {}) => {
  const response = await apiClient.get('/teams/search', {
    params: { keyword, ...params }
  });
  return response.data;
};

/**
 * Lấy thống kê team
 * GET /api/teams/{id}/stats
 */
export const getTeamStats = async (teamId) => {
  const response = await apiClient.get(`/teams/${teamId}/stats`);
  return response.data;
};

/**
 * Kiểm tra user có phải admin của team không
 * GET /api/teams/{id}/is-admin
 */
export const isUserAdmin = async (teamId) => {
  const response = await apiClient.get(`/teams/${teamId}/is-admin`);
  return response.data;
};

/**
 * Kiểm tra user có phải member của team không
 * GET /api/teams/{id}/is-member
 */
export const isUserMember = async (teamId) => {
  const response = await apiClient.get(`/teams/${teamId}/is-member`);
  return response.data;
};

// ==================== TEAM MEMBER ENDPOINTS ====================

/**
 * Lấy danh sách members của team
 * GET /api/teams/{teamId}/members
 */
export const getTeamMembers = async (teamId, params = {}) => {
  const response = await apiClient.get(`/teams/${teamId}/members`, { params });
  return response.data;
};

/**
 * Lấy thông tin member cụ thể
 * GET /api/teams/{teamId}/members/{memberId}
 */
export const getMemberById = async (teamId, memberId) => {
  const response = await apiClient.get(`/teams/${teamId}/members/${memberId}`);
  return response.data;
};

/**
 * Cập nhật role của member
 * PATCH /api/teams/{teamId}/members/{memberId}/role
 */
export const updateMemberRole = async (teamId, memberId, roleData) => {
  const response = await apiClient.patch(`/teams/${teamId}/members/${memberId}/role`, roleData);
  return response.data;
};

/**
 * Xóa member khỏi team
 * DELETE /api/teams/{teamId}/members/{memberId}
 */
export const removeMember = async (teamId, memberId) => {
  const response = await apiClient.delete(`/teams/${teamId}/members/${memberId}`);
  return response.data;
};

/**
 * Rời khỏi team
 * POST /api/teams/{teamId}/members/leave
 */
export const leaveTeam = async (teamId) => {
  const response = await apiClient.post(`/teams/${teamId}/members/leave`);
  return response.data;
};

/**
 * Tìm kiếm members trong team
 * GET /api/teams/{teamId}/members/search?keyword=john
 */
export const searchMembers = async (teamId, keyword, params = {}) => {
  const response = await apiClient.get(`/teams/${teamId}/members/search`, {
    params: { keyword, ...params }
  });
  return response.data;
};

/**
 * Lấy danh sách members theo role
 * GET /api/teams/{teamId}/members/by-role?role=ADMIN
 */
export const getMembersByRole = async (teamId, role) => {
  const response = await apiClient.get(`/teams/${teamId}/members/by-role`, {
    params: { role }
  });
  return response.data;
};

/**
 * Lấy role của user hiện tại trong team
 * GET /api/teams/{teamId}/members/my-role
 */
export const getMyRole = async (teamId) => {
  const response = await apiClient.get(`/teams/${teamId}/members/my-role`);
  return response.data;
};

// ==================== TEAM INVITATION ENDPOINTS ====================

/**
 * Mời member vào team (tạo invitation và gửi email)
 * POST /api/team-invitations?teamId={teamId}
 */
export const sendTeamInvitation = async (teamId, inviteData) => {
  const response = await apiClient.post('/team-invitations', inviteData, {
    params: { teamId }
  });
  return response.data;
};

/**
 * Lấy thông tin invitation bằng token (để hiển thị trước khi accept/reject)
 * GET /api/team-invitations/token/{token}
 */
export const getInvitationByToken = async (token) => {
  const response = await apiClient.get(`/team-invitations/token/${token}`);
  return response.data;
};

/**
 * Accept lời mời
 * POST /api/team-invitations/accept?token={token}
 */
export const acceptInvitation = async (token) => {
  const response = await apiClient.post('/team-invitations/accept', null, {
    params: { token }
  });
  return response.data;
};

/**
 * Reject lời mời
 * POST /api/team-invitations/reject?token={token}
 */
export const rejectInvitation = async (token) => {
  const response = await apiClient.post('/team-invitations/reject', null, {
    params: { token }
  });
  return response.data;
};

/**
 * Admin hủy lời mời
 * DELETE /api/team-invitations/{invitationId}
 */
export const cancelInvitation = async (invitationId) => {
  const response = await apiClient.delete(`/team-invitations/${invitationId}`);
  return response.data;
};

/**
 * Lấy danh sách pending invitations của team (Admin view)
 * GET /api/team-invitations/team/{teamId}
 */
export const getTeamPendingInvitations = async (teamId) => {
  const response = await apiClient.get(`/team-invitations/team/${teamId}`);
  return response.data;
};

/**
 * Lấy danh sách lời mời của user hiện tại
 * GET /api/team-invitations/my
 */
export const getMyInvitations = async () => {
  const response = await apiClient.get('/team-invitations/my');
  return response.data;
};

/**
 * Gửi lại email invitation
 * POST /api/team-invitations/{invitationId}/resend
 */
export const resendInvitation = async (invitationId) => {
  const response = await apiClient.post(`/team-invitations/${invitationId}/resend`);
  return response.data;
};

// ==================== EXPORT TEAMAPI OBJECT ====================

/**
 * teamApi object - Tổng hợp tất cả API functions
 * Dùng để import dạng: import { teamApi } from '../api/teamApi'
 */
export const teamApi = {
  // Team operations
  createTeam,
  getMyTeams,
  getTeamById,
  updateTeam,
  deleteTeam,
  toggleTeamStatus,
  searchTeams,
  getTeamStats,
  isUserAdmin,
  isUserMember,
  
  // Team member operations
  getTeamMembers,
  getMemberById,
  updateMemberRole,
  removeMember,
  leaveTeam,
  searchMembers,
  getMembersByRole,
  getMyRole,
  
  // Invitation operations
  sendTeamInvitation,
  getInvitationByToken,
  acceptInvitation,
  rejectInvitation,
  cancelInvitation,
  getTeamPendingInvitations,
  getMyInvitations,
  resendInvitation
};

export default apiClient;