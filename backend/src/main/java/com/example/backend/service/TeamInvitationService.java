package com.example.backend.service;

import com.example.backend.dto.team.request.InviteMemberRequest;
import com.example.backend.dto.team.response.TeamInvitationResponse;
import com.example.backend.model.TeamInvitation;

import java.util.List;

public interface TeamInvitationService {

    /**
     * Mời member vào team (tạo invitation và gửi email)
     */
    TeamInvitationResponse inviteMember(Long teamId, InviteMemberRequest request, Long inviterId);

    /**
     * Accept invitation và tạo TeamMember
     */
    TeamInvitationResponse acceptInvitation(String token, Long userId);

    /**
     * Reject invitation
     */
    TeamInvitationResponse rejectInvitation(String token, Long userId);

    /**
     * Admin hủy invitation
     */
    void cancelInvitation(Long invitationId, Long adminId);

    /**
     * Lấy danh sách pending invitations của team
     */
    List<TeamInvitationResponse> getTeamPendingInvitations(Long teamId, Long userId);

    /**
     * Lấy danh sách invitations của user (pending)
     */
    List<TeamInvitationResponse> getMyPendingInvitations(Long userId);

    /**
     * Resend invitation email
     */
    TeamInvitationResponse resendInvitation(Long invitationId, Long adminId);

    /**
     * Scheduled task: Cleanup expired invitations
     */
    void cleanupExpiredInvitations();

    /**
     * Get invitation by token (for display info)
     */
    TeamInvitationResponse getInvitationByToken(String token);
}