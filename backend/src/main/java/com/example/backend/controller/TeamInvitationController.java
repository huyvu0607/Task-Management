package com.example.backend.controller;

import com.example.backend.dto.response.ApiResponse;
import com.example.backend.dto.team.request.InviteMemberRequest;
import com.example.backend.dto.team.response.TeamInvitationResponse;
import com.example.backend.security.UserDetailsImpl;
import com.example.backend.service.ITeamInvitationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/team-invitations")
@RequiredArgsConstructor
@Slf4j
public class TeamInvitationController {

    private final ITeamInvitationService ITeamInvitationService;

    /**
     * Mời thành viên vào team
     * POST /api/team-invitations?teamId={teamId}
     */
    @PostMapping
    public ResponseEntity<ApiResponse<TeamInvitationResponse>> inviteMember(
            @RequestParam Long teamId,
            @Valid @RequestBody InviteMemberRequest request,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {

        log.info("Admin {} inviting {} to team {}",
                userDetails.getId(), request.getEmail(), teamId);

        TeamInvitationResponse invitation = ITeamInvitationService.inviteMember(
                teamId, request, userDetails.getId());

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.success("Lời mời đã được gửi thành công", invitation));
    }

    /**
     * Accept lời mời bằng token
     * POST /api/team-invitations/accept?token={token}
     */
    @PostMapping("/accept")
    public ResponseEntity<ApiResponse<TeamInvitationResponse>> acceptInvitation(
            @RequestParam String token,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {

        log.info("User {} accepting invitation with token {}",
                userDetails.getId(), token);

        TeamInvitationResponse invitation = ITeamInvitationService.acceptInvitation(
                token, userDetails.getId());

        return ResponseEntity.ok(
                ApiResponse.success("Bạn đã tham gia team thành công", invitation));
    }

    /**
     * Reject lời mời bằng token
     * POST /api/team-invitations/reject?token={token}
     */
    @PostMapping("/reject")
    public ResponseEntity<ApiResponse<TeamInvitationResponse>> rejectInvitation(
            @RequestParam String token,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {

        log.info("User {} rejecting invitation with token {}",
                userDetails.getId(), token);

        TeamInvitationResponse invitation = ITeamInvitationService.rejectInvitation(
                token, userDetails.getId());

        return ResponseEntity.ok(
                ApiResponse.success("Bạn đã từ chối lời mời", invitation));
    }

    /**
     * Admin hủy lời mời
     * DELETE /api/team-invitations/{invitationId}
     */
    @DeleteMapping("/{invitationId}")
    public ResponseEntity<ApiResponse<Void>> cancelInvitation(
            @PathVariable Long invitationId,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {

        log.info("Admin {} cancelling invitation {}",
                userDetails.getId(), invitationId);

        ITeamInvitationService.cancelInvitation(invitationId, userDetails.getId());

        return ResponseEntity.ok(
                ApiResponse.success("Lời mời đã được hủy", null));
    }

    /**
     * Lấy danh sách pending invitations của một team
     * GET /api/team-invitations/team/{teamId}
     */
    @GetMapping("/team/{teamId}")
    public ResponseEntity<ApiResponse<List<TeamInvitationResponse>>> getTeamInvitations(
            @PathVariable Long teamId,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {

        log.info("Getting pending invitations for team {} by user {}",
                teamId, userDetails.getId());

        List<TeamInvitationResponse> invitations =
                ITeamInvitationService.getTeamPendingInvitations(teamId, userDetails.getId());

        return ResponseEntity.ok(ApiResponse.success(invitations));
    }

    /**
     * Lấy danh sách lời mời của user hiện tại
     * GET /api/team-invitations/my
     */
    @GetMapping("/my")
    public ResponseEntity<ApiResponse<List<TeamInvitationResponse>>> getMyInvitations(
            @AuthenticationPrincipal UserDetailsImpl userDetails) {

        log.info("Getting pending invitations for user {}", userDetails.getId());

        List<TeamInvitationResponse> invitations =
                ITeamInvitationService.getMyPendingInvitations(userDetails.getId());

        return ResponseEntity.ok(ApiResponse.success(invitations));
    }

    /**
     * Gửi lại email invitation
     * POST /api/team-invitations/{invitationId}/resend
     */
    @PostMapping("/{invitationId}/resend")
    public ResponseEntity<ApiResponse<TeamInvitationResponse>> resendInvitation(
            @PathVariable Long invitationId,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {

        log.info("Admin {} resending invitation {}",
                userDetails.getId(), invitationId);

        TeamInvitationResponse invitation = ITeamInvitationService.resendInvitation(
                invitationId, userDetails.getId());

        return ResponseEntity.ok(
                ApiResponse.success("Email lời mời đã được gửi lại", invitation));
    }

    /**
     * Lấy thông tin invitation bằng token (để hiển thị trước khi accept/reject)
     * GET /api/team-invitations/token/{token}
     */
    @GetMapping("/token/{token}")
    public ResponseEntity<ApiResponse<TeamInvitationResponse>> getInvitationByToken(
            @PathVariable String token) {

        log.info("Getting invitation info for token {}", token);

        TeamInvitationResponse invitation =
                ITeamInvitationService.getInvitationByToken(token);

        return ResponseEntity.ok(ApiResponse.success(invitation));
    }
}