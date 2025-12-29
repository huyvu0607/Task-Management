package com.example.backend.service.impl;

import com.example.backend.dto.team.request.InviteMemberRequest;
import com.example.backend.dto.team.response.TeamInvitationResponse;
import com.example.backend.model.Team;
import com.example.backend.model.TeamInvitation;
import com.example.backend.model.TeamMember;
import com.example.backend.model.User;
import com.example.backend.repository.TeamInvitationRepository;
import com.example.backend.repository.TeamMemberRepository;
import com.example.backend.repository.TeamRepository;
import com.example.backend.repository.UserRepository;
import com.example.backend.service.EmailService;
import com.example.backend.service.TeamInvitationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class TeamInvitationServiceImpl implements TeamInvitationService {

    private final TeamInvitationRepository invitationRepository;
    private final TeamRepository teamRepository;
    private final UserRepository userRepository;
    private final TeamMemberRepository teamMemberRepository;
    private final EmailService emailService;
    private static final long RESEND_COOLDOWN_SECONDS = 60;


    @Override
    @Transactional
    public TeamInvitationResponse inviteMember(Long teamId, InviteMemberRequest request, Long inviterId) {
        log.info("Creating invitation for {} to team {} by user {}", request.getEmail(), teamId, inviterId);

        // 1. Validate team exists
        Team team = teamRepository.findById(teamId)
                .orElseThrow(() -> new RuntimeException("Team không tồn tại"));

        // 2. Validate inviter has permission
        if (!teamMemberRepository.isUserAdminOfTeam(teamId, inviterId)) {
            throw new RuntimeException("Bạn không có quyền mời thành viên vào team này");
        }

        User inviter = userRepository.findById(inviterId)
                .orElseThrow(() -> new RuntimeException("User không tồn tại"));

        // 3. Check if user exists
        User invitedUser = userRepository.findByEmail(request.getEmail()).orElse(null);

        if (invitedUser == null) {
            throw new RuntimeException("Email '" + request.getEmail() + "' không tồn tại trong hệ thống");
        }

        // 4. Check if user is already a member
        if (teamMemberRepository.existsByTeamIdAndUserId(teamId, invitedUser.getId())) {
            throw new RuntimeException("User đã là thành viên của team này");
        }

        // 5. Check if there's already a pending invitation
        if (invitationRepository.existsByTeamIdAndInvitedEmailAndStatus(
                teamId, request.getEmail(), TeamInvitation.InvitationStatus.PENDING)) {
            throw new RuntimeException("Đã có lời mời đang chờ xác nhận cho email này");
        }

        // 6. Check team member limit
        long currentMemberCount = teamMemberRepository.countByTeamId(teamId);
        long pendingInvitationsCount = invitationRepository.countByTeamIdAndStatus(
                teamId, TeamInvitation.InvitationStatus.PENDING);

        if (currentMemberCount + pendingInvitationsCount >= team.getMaxMembers()) {
            throw new RuntimeException("Team đã đạt giới hạn tối đa " + team.getMaxMembers() + " thành viên");
        }

        // 7. Create invitation
        TeamInvitation invitation = new TeamInvitation();
        invitation.setTeam(team);
        invitation.setInvitedEmail(request.getEmail());
        invitation.setInvitedUser(invitedUser);
        invitation.setRole(request.getRole());
        invitation.setInvitedBy(inviter);
        invitation.setToken(UUID.randomUUID().toString());
        invitation.setMessage(request.getMessage());
        invitation.setStatus(TeamInvitation.InvitationStatus.PENDING);
        invitation.setExpiresAt(LocalDateTime.now().plusDays(7)); // 7 days expiry

        TeamInvitation savedInvitation = invitationRepository.save(invitation);
        log.info("Invitation created with ID: {}", savedInvitation.getId());

        // 8. Send email
        try {
            String invitedUserName = invitedUser != null ? invitedUser.getFullName() : request.getEmail();
            emailService.sendTeamInvitationEmail(
                    request.getEmail(),
                    invitedUserName,
                    team.getName(),
                    inviter.getFullName(),
                    request.getRole().toString(),
                    request.getMessage(),
                    savedInvitation.getToken()
            );
            log.info("Invitation email sent to {}", request.getEmail());
        } catch (Exception e) {
            log.error("Failed to send invitation email", e);
            // Don't throw exception, invitation is already saved
        }

        return mapToResponse(savedInvitation);
    }

    @Override
    @Transactional
    public TeamInvitationResponse acceptInvitation(String token, Long userId) {
        log.info("User {} accepting invitation with token {}", userId, token);

        // 1. Find invitation
        TeamInvitation invitation = invitationRepository.findByToken(token)
                .orElseThrow(() -> new RuntimeException("Lời mời không tồn tại hoặc đã hết hạn"));

        // 2. Validate invitation
        if (invitation.getStatus() != TeamInvitation.InvitationStatus.PENDING) {
            throw new RuntimeException("Lời mời này đã được xử lý");
        }

        if (invitation.isExpired()) {
            invitation.setStatus(TeamInvitation.InvitationStatus.EXPIRED);
            invitationRepository.save(invitation);
            throw new RuntimeException("Lời mời đã hết hạn");
        }

        // 3. Validate user matches invitation
        if (invitation.getInvitedUser() != null && !invitation.getInvitedUser().getId().equals(userId)) {
            throw new RuntimeException("Bạn không có quyền chấp nhận lời mời này");
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User không tồn tại"));

        // 4. Check if already a member
        if (teamMemberRepository.existsByTeamIdAndUserId(invitation.getTeam().getId(), userId)) {
            throw new RuntimeException("Bạn đã là thành viên của team này");
        }

        // 5. Check team member limit
        long currentMemberCount = teamMemberRepository.countByTeamId(invitation.getTeam().getId());
        if (currentMemberCount >= invitation.getTeam().getMaxMembers()) {
            throw new RuntimeException("Team đã đạt giới hạn tối đa thành viên");
        }

        // 6. Create TeamMember
        TeamMember teamMember = new TeamMember();
        teamMember.setTeam(invitation.getTeam());
        teamMember.setUser(user);
        teamMember.setRole(invitation.getRole());
        teamMember.setInvitedBy(invitation.getInvitedBy());

        teamMemberRepository.save(teamMember);
        log.info("TeamMember created for user {} in team {}", userId, invitation.getTeam().getId());

        // 7. Update invitation status
        invitation.setStatus(TeamInvitation.InvitationStatus.ACCEPTED);
        invitation.setAcceptedAt(LocalDateTime.now());
        TeamInvitation updatedInvitation = invitationRepository.save(invitation);

        return mapToResponse(updatedInvitation);
    }

    @Override
    @Transactional
    public TeamInvitationResponse rejectInvitation(String token, Long userId) {
        log.info("User {} rejecting invitation with token {}", userId, token);

        // 1. Find invitation
        TeamInvitation invitation = invitationRepository.findByToken(token)
                .orElseThrow(() -> new RuntimeException("Lời mời không tồn tại"));

        // 2. Validate invitation
        if (invitation.getStatus() != TeamInvitation.InvitationStatus.PENDING) {
            throw new RuntimeException("Lời mời này đã được xử lý");
        }

        // 3. Validate user matches invitation
        if (invitation.getInvitedUser() != null && !invitation.getInvitedUser().getId().equals(userId)) {
            throw new RuntimeException("Bạn không có quyền từ chối lời mời này");
        }

        // 4. Update status
        invitation.setStatus(TeamInvitation.InvitationStatus.REJECTED);
        invitation.setRejectedAt(LocalDateTime.now());
        TeamInvitation updatedInvitation = invitationRepository.save(invitation);

        return mapToResponse(updatedInvitation);
    }

    @Override
    @Transactional
    public void cancelInvitation(Long invitationId, Long adminId) {
        log.info("Admin {} cancelling invitation {}", adminId, invitationId);

        TeamInvitation invitation = invitationRepository.findById(invitationId)
                .orElseThrow(() -> new RuntimeException("Lời mời không tồn tại"));

        // Check admin permission
        if (!teamMemberRepository.isUserAdminOfTeam(invitation.getTeam().getId(), adminId)) {
            throw new RuntimeException("Bạn không có quyền hủy lời mời này");
        }

        if (invitation.getStatus() != TeamInvitation.InvitationStatus.PENDING) {
            throw new RuntimeException("Chỉ có thể hủy lời mời đang chờ xác nhận");
        }

        invitation.setStatus(TeamInvitation.InvitationStatus.CANCELLED);
        invitationRepository.save(invitation);
    }

    @Override
    public List<TeamInvitationResponse> getTeamPendingInvitations(Long teamId, Long userId) {
        log.info("Getting pending invitations for team {}", teamId);

        // Check permission
        if (!teamMemberRepository.existsByTeamIdAndUserId(teamId, userId)) {
            throw new RuntimeException("Bạn không phải thành viên của team này");
        }

        List<TeamInvitation> invitations = invitationRepository.findByTeamIdAndStatus(
                teamId, TeamInvitation.InvitationStatus.PENDING);

        return invitations.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<TeamInvitationResponse> getMyPendingInvitations(Long userId) {
        log.info("Getting pending invitations for user {}", userId);

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User không tồn tại"));

        List<TeamInvitation> invitations = invitationRepository.findUserInvitations(
                user.getEmail(), userId, TeamInvitation.InvitationStatus.PENDING);

        return invitations.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public TeamInvitationResponse resendInvitation(Long invitationId, Long adminId) {
        log.info("Resending invitation {} by admin {}", invitationId, adminId);

        TeamInvitation invitation = invitationRepository.findById(invitationId)
                .orElseThrow(() -> new RuntimeException("Lời mời không tồn tại"));

        // Check admin permission
        if (!teamMemberRepository.isUserAdminOfTeam(invitation.getTeam().getId(), adminId)) {
            throw new RuntimeException("Bạn không có quyền gửi lại lời mời này");
        }

        if (invitation.getStatus() != TeamInvitation.InvitationStatus.PENDING) {
            throw new RuntimeException("Chỉ có thể gửi lại lời mời đang chờ xác nhận");
        }
        LocalDateTime now = LocalDateTime.now();

        // ✅ CHECK COOLDOWN
        if (invitation.getLastResentAt() != null) {
            long passed = java.time.Duration.between(
                    invitation.getLastResentAt(), now
            ).getSeconds();

            if (passed < RESEND_COOLDOWN_SECONDS) {
                long remain = RESEND_COOLDOWN_SECONDS - passed;
                throw new RuntimeException("Vui lòng chờ " + remain + " giây");
            }
        }
//        // Extend expiry
//        invitation.setExpiresAt(LocalDateTime.now().plusDays(7));
//        invitationRepository.save(invitation);

        // Resend email
        try {
            String invitedUserName = invitation.getInvitedUser() != null
                    ? invitation.getInvitedUser().getFullName()
                    : invitation.getInvitedEmail();

            emailService.sendTeamInvitationEmail(
                    invitation.getInvitedEmail(),
                    invitedUserName,
                    invitation.getTeam().getName(),
                    invitation.getInvitedBy().getFullName(),
                    invitation.getRole().toString(),
                    invitation.getMessage(),
                    invitation.getToken()
            );

            log.info("Invitation email resent to {}", invitation.getInvitedEmail());
        } catch (Exception e) {
            log.error("Failed to resend invitation email", e);
            throw new RuntimeException("Không thể gửi lại email");
        }
        invitation.setLastResentAt(now);
        invitation.setExpiresAt(now.plusDays(7));

        invitationRepository.save(invitation);
        return mapToResponse(invitation);
    }

    @Override
    @Transactional
    @Scheduled(cron = "0 0 2 * * ?") // Run at 2 AM every day
    public void cleanupExpiredInvitations() {
        log.info("Running scheduled task: cleanup expired invitations");

        List<TeamInvitation> expiredInvitations = invitationRepository.findExpiredInvitations(
                TeamInvitation.InvitationStatus.PENDING,
                LocalDateTime.now()
        );

        for (TeamInvitation invitation : expiredInvitations) {
            invitation.setStatus(TeamInvitation.InvitationStatus.EXPIRED);
        }

        if (!expiredInvitations.isEmpty()) {
            invitationRepository.saveAll(expiredInvitations);
            log.info("Marked {} invitations as expired", expiredInvitations.size());
        }
    }

    @Override
    public TeamInvitationResponse getInvitationByToken(String token) {
        TeamInvitation invitation = invitationRepository.findByToken(token)
                .orElseThrow(() -> new RuntimeException("Lời mời không tồn tại"));

        return mapToResponse(invitation);
    }

    // ==================== MAPPER ====================

    private TeamInvitationResponse mapToResponse(TeamInvitation invitation) {
        return TeamInvitationResponse.builder()
                .id(invitation.getId())
                .teamId(invitation.getTeam().getId())
                .teamName(invitation.getTeam().getName())
                .token(invitation.getToken())
                .invitedEmail(invitation.getInvitedEmail())
                .invitedUserName(invitation.getInvitedUser() != null
                        ? invitation.getInvitedUser().getFullName()
                        : null)
                .invitedUserId(invitation.getInvitedUser() != null
                        ? invitation.getInvitedUser().getId()
                        : null)
                .role(invitation.getRole())
                .inviterName(invitation.getInvitedBy().getFullName())
                .inviterId(invitation.getInvitedBy().getId())
                .message(invitation.getMessage())
                .status(invitation.getStatus())
                .expiresAt(invitation.getExpiresAt())
                .createdAt(invitation.getCreatedAt())
                .acceptedAt(invitation.getAcceptedAt())
                .lastResentAt(invitation.getLastResentAt())
                .isExpired(invitation.isExpired())
                .isValid(invitation.isValid())
                .build();
    }
}