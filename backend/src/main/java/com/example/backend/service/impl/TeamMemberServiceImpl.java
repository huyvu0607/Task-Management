package com.example.backend.service.impl;

import com.example.backend.dto.team.request.InviteMemberRequest;
import com.example.backend.dto.team.request.UpdateMemberRoleRequest;
import com.example.backend.dto.team.response.TeamMemberResponse;
import com.example.backend.model.Team;
import com.example.backend.model.TeamMember;
import com.example.backend.model.TeamMember.TeamRole;
import com.example.backend.model.User;
import com.example.backend.repository.TeamMemberRepository;
import com.example.backend.repository.TeamRepository;
import com.example.backend.repository.UserRepository;
import com.example.backend.service.EmailService;
import com.example.backend.service.TeamMemberService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class TeamMemberServiceImpl implements TeamMemberService {

    private final TeamRepository teamRepository;
    private final TeamMemberRepository teamMemberRepository;
    private final UserRepository userRepository;
    private final EmailService emailService;

    @Override
    public TeamMemberResponse inviteMember(Long teamId, InviteMemberRequest request, Long inviterId) {
        log.info("Inviting member {} to team {} by user {}", request.getEmail(), teamId, inviterId);

        Team team = getTeamOrThrow(teamId);

        if (!teamMemberRepository.isUserAdminOfTeam(teamId, inviterId)) {
            throw new RuntimeException("Bạn không có quyền mời thành viên vào team này");
        }

        User inviter = userRepository.findById(inviterId)
                .orElseThrow(() -> new RuntimeException("User không tồn tại"));

        User invitedUser = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("Email '" + request.getEmail() + "' không tồn tại trong hệ thống"));

        if (teamMemberRepository.existsByTeamIdAndUserId(teamId, invitedUser.getId())) {
            throw new RuntimeException("User đã là thành viên của team này");
        }

        long currentMemberCount = teamMemberRepository.countByTeamId(teamId);
        if (currentMemberCount >= team.getMaxMembers()) {
            throw new RuntimeException("Team đã đạt giới hạn tối đa " + team.getMaxMembers() + " thành viên");
        }

        TeamMember teamMember = new TeamMember();
        teamMember.setTeam(team);
        teamMember.setUser(invitedUser);
        teamMember.setRole(request.getRole());
        teamMember.setInvitedBy(inviter);

        TeamMember savedMember = teamMemberRepository.save(teamMember);
        log.info("Member {} added to team {} successfully", invitedUser.getId(), teamId);

        try {
            String emailContent = String.format(
                    "Xin chào %s,\n\n" +
                            "Bạn đã được mời vào team '%s' với vai trò %s bởi %s.\n\n" +
                            "Đăng nhập vào hệ thống để bắt đầu làm việc với team.\n\n" +
                            "Trân trọng,\n" +
                            "TeamFlow",
                    invitedUser.getFullName(),
                    team.getName(),
                    request.getRole(),
                    inviter.getFullName()
            );

            if (request.getMessage() != null && !request.getMessage().isEmpty()) {
                emailContent = String.format(
                        "Xin chào %s,\n\n" +
                                "Bạn đã được mời vào team '%s' với vai trò %s bởi %s.\n\n" +
                                "Lời nhắn từ %s:\n\"%s\"\n\n" +
                                "Đăng nhập vào hệ thống để bắt đầu làm việc với team.\n\n" +
                                "Trân trọng,\n" +
                                "TeamFlow",
                        invitedUser.getFullName(),
                        team.getName(),
                        request.getRole(),
                        inviter.getFullName(),
                        inviter.getFullName(),
                        request.getMessage()
                );
            }

            emailService.sendTextEmail(
                    invitedUser.getEmail(),
                    "Mời tham gia team - " + team.getName(),
                    emailContent
            );

            log.info("Invitation email sent to {}", invitedUser.getEmail());
        } catch (Exception e) {
            log.error("Failed to send invitation email", e);
        }

        return mapToTeamMemberResponse(savedMember);
    }

    @Override
    @Transactional(readOnly = true)
    public List<TeamMemberResponse> getTeamMembers(Long teamId, Long userId) {
        log.info("Getting members of team {} for user {}", teamId, userId);

        if (!teamMemberRepository.existsByTeamIdAndUserId(teamId, userId)) {
            throw new RuntimeException("Bạn không có quyền xem danh sách thành viên của team này");
        }

        List<TeamMember> members = teamMemberRepository.findByTeamId(teamId);

        return members.stream()
                .map(this::mapToTeamMemberResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public Page<TeamMemberResponse> getTeamMembers(Long teamId, Long userId, Pageable pageable) {
        log.info("Getting members of team {} for user {} with pagination", teamId, userId);

        if (!teamMemberRepository.existsByTeamIdAndUserId(teamId, userId)) {
            throw new RuntimeException("Bạn không có quyền xem danh sách thành viên của team này");
        }

        Page<TeamMember> members = teamMemberRepository.findByTeamIdWithPagination(teamId, pageable);

        return members.map(this::mapToTeamMemberResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public TeamMemberResponse getMemberById(Long teamId, Long memberId, Long userId) {
        log.info("Getting member {} of team {} for user {}", memberId, teamId, userId);

        if (!teamMemberRepository.existsByTeamIdAndUserId(teamId, userId)) {
            throw new RuntimeException("Bạn không có quyền xem thông tin thành viên của team này");
        }

        TeamMember member = teamMemberRepository.findById(memberId)
                .orElseThrow(() -> new RuntimeException("Thành viên không tồn tại"));

        if (!member.getTeam().getId().equals(teamId)) {
            throw new RuntimeException("Thành viên không thuộc team này");
        }

        return mapToTeamMemberResponse(member);
    }

    @Override
    public TeamMemberResponse updateMemberRole(Long teamId, Long memberId, UpdateMemberRoleRequest request, Long userId) {
        log.info("Updating role of member {} in team {} to {} by user {}", memberId, teamId, request.getRole(), userId);

        if (!teamMemberRepository.isUserAdminOfTeam(teamId, userId)) {
            throw new RuntimeException("Bạn không có quyền thay đổi vai trò thành viên trong team này");
        }

        TeamMember member = teamMemberRepository.findById(memberId)
                .orElseThrow(() -> new RuntimeException("Thành viên không tồn tại"));

        if (!member.getTeam().getId().equals(teamId)) {
            throw new RuntimeException("Thành viên không thuộc team này");
        }

        if (member.getUser().getId().equals(userId)) {
            throw new RuntimeException("Bạn không thể thay đổi vai trò của chính mình");
        }

        TeamRole oldRole = member.getRole();

        if (oldRole == TeamRole.ADMIN && request.getRole() != TeamRole.ADMIN) {
            // ✅ SỬ DỤNG countByTeamIdAndRole với tham số Enum
            long adminCount = teamMemberRepository.countByTeamIdAndRole(teamId, TeamRole.ADMIN);

            log.info("Current admin count in team {}: {}", teamId, adminCount);

            if (adminCount <= 1) {
                throw new RuntimeException("Team phải có ít nhất 1 admin");
            }
        }

        member.setRole(request.getRole());
        TeamMember updatedMember = teamMemberRepository.save(member);

        log.info("Member {} role updated from {} to {} in team {}", memberId, oldRole, request.getRole(), teamId);

        return mapToTeamMemberResponse(updatedMember);
    }

    @Override
    public void removeMember(Long teamId, Long memberId, Long userId) {
        log.info("Removing member {} from team {} by user {}", memberId, teamId, userId);

        TeamMember member = teamMemberRepository.findById(memberId)
                .orElseThrow(() -> new RuntimeException("Thành viên không tồn tại"));

        if (!member.getTeam().getId().equals(teamId)) {
            throw new RuntimeException("Thành viên không thuộc team này");
        }

        boolean isSelf = member.getUser().getId().equals(userId);

        // ✅ Nếu KHÔNG phải tự xóa chính mình, kiểm tra quyền Admin
        if (!isSelf && !teamMemberRepository.isUserAdminOfTeam(teamId, userId)) {
            throw new RuntimeException("Chỉ Admin mới có thể xóa thành viên khác khỏi team");
        }

        // ✅ Nếu tự rời team hoặc bị xóa và là Admin
        if (member.getRole() == TeamRole.ADMIN) {
            // ✅ SỬ DỤNG countByTeamIdAndRole với tham số Enum
            long adminCount = teamMemberRepository.countByTeamIdAndRole(teamId, TeamRole.ADMIN);

            log.info("Current admin count in team {}: {}", teamId, adminCount);

            if (adminCount <= 1) {
                throw new RuntimeException("Team phải có ít nhất 1 admin. Hãy chỉ định admin khác trước khi rời.");
            }
        }

        teamMemberRepository.delete(member);

        // TODO: Implement logic để set tasks assigned cho member thành unassigned

        log.info("Member {} removed from team {} successfully", memberId, teamId);
    }

    @Override
    public void leaveTeam(Long teamId, Long userId) {
        log.info("User {} leaving team {}", userId, teamId);

        TeamMember member = teamMemberRepository.findByTeamIdAndUserId(teamId, userId)
                .orElseThrow(() -> new RuntimeException("Bạn không phải là thành viên của team này"));

        if (member.getRole() == TeamRole.ADMIN) {
            // ✅ SỬ DỤNG countByTeamIdAndRole với tham số Enum
            long adminCount = teamMemberRepository.countByTeamIdAndRole(teamId, TeamRole.ADMIN);

            log.info("Current admin count in team {}: {}", teamId, adminCount);

            if (adminCount <= 1) {
                throw new RuntimeException("Team phải có ít nhất 1 admin. Hãy chỉ định admin khác trước khi rời.");
            }
        }

        teamMemberRepository.delete(member);

        // TODO: Implement logic để set tasks assigned cho user thành unassigned

        log.info("User {} left team {} successfully", userId, teamId);
    }

    @Override
    @Transactional(readOnly = true)
    public List<TeamMemberResponse> searchMembers(Long teamId, String keyword, Long userId) {
        log.info("Searching members with keyword '{}' in team {} for user {}", keyword, teamId, userId);

        if (!teamMemberRepository.existsByTeamIdAndUserId(teamId, userId)) {
            throw new RuntimeException("Bạn không có quyền tìm kiếm thành viên của team này");
        }

        List<TeamMember> members = teamMemberRepository.searchMembersInTeam(teamId, keyword);

        return members.stream()
                .map(this::mapToTeamMemberResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public Page<TeamMemberResponse> searchMembers(Long teamId, String keyword, Long userId, Pageable pageable) {
        log.info("Searching members with keyword '{}' in team {} for user {} with pagination", keyword, teamId, userId);

        if (!teamMemberRepository.existsByTeamIdAndUserId(teamId, userId)) {
            throw new RuntimeException("Bạn không có quyền tìm kiếm thành viên của team này");
        }

        Page<TeamMember> members = teamMemberRepository.searchMembersInTeamWithPagination(teamId, keyword, pageable);

        return members.map(this::mapToTeamMemberResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public List<TeamMemberResponse> getMembersByRole(Long teamId, TeamRole role, Long userId) {
        log.info("Getting members with role {} of team {} for user {}", role, teamId, userId);

        if (!teamMemberRepository.existsByTeamIdAndUserId(teamId, userId)) {
            throw new RuntimeException("Bạn không có quyền xem danh sách thành viên của team này");
        }

        List<TeamMember> members = teamMemberRepository.findByTeamIdAndRole(teamId, role);

        return members.stream()
                .map(this::mapToTeamMemberResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public TeamRole getUserRoleInTeam(Long teamId, Long userId) {
        return teamMemberRepository.findRoleByTeamIdAndUserId(teamId, userId)
                .orElseThrow(() -> new RuntimeException("User không phải là thành viên của team này"));
    }

    // ========== HELPER METHODS ==========

    private Team getTeamOrThrow(Long teamId) {
        return teamRepository.findById(teamId)
                .orElseThrow(() -> new RuntimeException("Team không tồn tại"));
    }

    private TeamMemberResponse mapToTeamMemberResponse(TeamMember member) {
        User user = member.getUser();

        // TODO: Implement đếm assignedTasksCount, completedTasksCount, lastActive

        return TeamMemberResponse.builder()
                .id(member.getId())
                .userId(user.getId())
                .username(user.getUsername())
                .fullName(user.getFullName())
                .email(user.getEmail())
                .avatarUrl(user.getAvatarUrl())
                .role(member.getRole())
                .phoneNumber(user.getPhoneNumber())
                .department(user.getDepartment())
                .jobTitle(user.getJobTitle())
                .invitedByName(member.getInvitedBy() != null ? member.getInvitedBy().getFullName() : null)
                .joinedAt(member.getJoinedAt())
                .assignedTasksCount(0) // TODO: Implement
                .completedTasksCount(0) // TODO: Implement
                .lastActive(null) // TODO: Implement
                .build();
    }
}