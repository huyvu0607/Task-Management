package com.example.backend.service.impl;

import com.example.backend.dto.dashboard.UserSimpleDTO;
import com.example.backend.dto.team.TeamDTO;
import com.example.backend.dto.team.request.CreateTeamRequest;
import com.example.backend.dto.team.request.UpdateTeamRequest;
import com.example.backend.dto.team.response.TeamListResponse;
import com.example.backend.dto.team.response.TeamResponse;
import com.example.backend.dto.team.response.TeamStatsResponse;
import com.example.backend.model.Project;
import com.example.backend.model.Team;
import com.example.backend.model.TeamMember;
import com.example.backend.model.TeamMember.TeamRole;
import com.example.backend.model.User;
import com.example.backend.repository.ProjectRepository;
import com.example.backend.repository.TaskRepository;
import com.example.backend.repository.TeamMemberRepository;
import com.example.backend.repository.TeamRepository;
import com.example.backend.repository.UserRepository;
import com.example.backend.service.TeamService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class TeamServiceImpl implements TeamService {

    private final TeamRepository teamRepository;
    private final TeamMemberRepository teamMemberRepository;
    private final UserRepository userRepository;
    private final ProjectRepository projectRepository;
    private final TaskRepository taskRepository;

    private static final int MAX_TEAMS_PER_USER = 5;

    @Override
    public TeamResponse createTeam(CreateTeamRequest request, Long userId) {
        log.info("Creating team with name: {} by user: {}", request.getName(), userId);

        User creator = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User không tồn tại"));

        // ✅ FIX: Chỉ check trùng tên trong team của chính user này
        if (teamRepository.existsByNameAndCreatedBy(request.getName(), creator)) {
            throw new RuntimeException("Bạn đã có team với tên '" + request.getName() + "' rồi");
        }

        long teamsCreatedCount = teamRepository.countByCreatedBy(creator);
        if (teamsCreatedCount >= MAX_TEAMS_PER_USER) {
            throw new RuntimeException("Bạn đã đạt giới hạn tối đa " + MAX_TEAMS_PER_USER + " teams");
        }

        Team team = new Team();
        team.setName(request.getName());
        team.setDescription(request.getDescription());
        team.setColor(request.getColor());
        team.setCreatedBy(creator);
        team.setIsActive(true);
        team.setMaxMembers(50);

        Team savedTeam = teamRepository.save(team);
        log.info("Team created successfully with id: {}", savedTeam.getId());

        TeamMember adminMember = new TeamMember();
        adminMember.setTeam(savedTeam);
        adminMember.setUser(creator);
        adminMember.setRole(TeamRole.ADMIN);
        adminMember.setInvitedBy(creator);
        teamMemberRepository.save(adminMember);

        log.info("User {} added as admin of team {}", userId, savedTeam.getId());

        return mapToTeamResponse(savedTeam, userId);
    }

    @Override
    @Transactional(readOnly = true)
    public TeamResponse getTeamById(Long teamId, Long userId) {
        log.info("Getting team {} for user {}", teamId, userId);

        if (!isUserMemberOfTeam(teamId, userId)) {
            throw new RuntimeException("Bạn không có quyền xem team này");
        }

        Team team = getTeamOrThrow(teamId);
        return mapToTeamResponse(team, userId);
    }

    @Override
    @Transactional(readOnly = true)
    public List<TeamListResponse> getMyTeams(Long userId) {
        log.info("Getting all teams for user {}", userId);

        List<TeamMember> teamMembers = teamMemberRepository.findByUserId(userId);

        return teamMembers.stream()
                .map(this::mapToTeamListResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public Page<TeamListResponse> getMyTeams(Long userId, Pageable pageable) {
        log.info("Getting teams for user {} with pagination", userId);

        Page<Team> teams = teamRepository.findTeamsByUserId(userId, pageable);

        return teams.map(team -> {
            TeamMember teamMember = teamMemberRepository
                    .findByTeamIdAndUserId(team.getId(), userId)
                    .orElse(null);
            return mapToTeamListResponse(team, teamMember);
        });
    }

    @Override
    public TeamResponse updateTeam(Long teamId, UpdateTeamRequest request, Long userId) {
        log.info("Updating team {} by user {}", teamId, userId);

        Team team = getTeamOrThrow(teamId);

        if (!isUserAdminOfTeam(teamId, userId)) {
            throw new RuntimeException("Bạn không có quyền cập nhật team này");
        }

        // ✅ FIX: Lấy thông tin user hiện tại
        User currentUser = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User không tồn tại"));

        // ✅ FIX: Chỉ check trùng tên trong team của chính user này (trừ team hiện tại)
        if (teamRepository.existsByNameAndCreatedByAndIdNot(request.getName(), currentUser, teamId)) {
            throw new RuntimeException("Bạn đã có team khác với tên '" + request.getName() + "' rồi");
        }

        team.setName(request.getName());
        team.setDescription(request.getDescription());
        team.setColor(request.getColor());
        team.setIsActive(request.getIsActive());

        if (request.getMaxMembers() != null) {
            team.setMaxMembers(request.getMaxMembers());
        }

        Team updatedTeam = teamRepository.save(team);
        log.info("Team {} updated successfully", teamId);

        return mapToTeamResponse(updatedTeam, userId);
    }

    @Override
    public void deleteTeam(Long teamId, Long userId) {
        log.info("Deleting team {} by user {}", teamId, userId);

        if (!isUserAdminOfTeam(teamId, userId)) {
            throw new RuntimeException("Bạn không có quyền xóa team này");
        }

        Team team = getTeamOrThrow(teamId);

        teamMemberRepository.deleteByTeamId(teamId);

        // TODO: Xóa projects và tasks liên quan

        teamRepository.delete(team);

        log.info("Team {} deleted successfully", teamId);
    }

    @Override
    public TeamResponse toggleTeamStatus(Long teamId, Long userId) {
        log.info("Toggling status of team {} by user {}", teamId, userId);

        if (!isUserAdminOfTeam(teamId, userId)) {
            throw new RuntimeException("Bạn không có quyền thay đổi trạng thái team này");
        }

        Team team = getTeamOrThrow(teamId);
        team.setIsActive(!team.getIsActive());

        Team updatedTeam = teamRepository.save(team);
        log.info("Team {} status toggled to {}", teamId, updatedTeam.getIsActive());

        return mapToTeamResponse(updatedTeam, userId);
    }

    @Override
    @Transactional(readOnly = true)
    public List<TeamListResponse> searchTeams(String keyword, Long userId) {
        log.info("Searching teams with keyword '{}' for user {}", keyword, userId);

        List<Team> teams = teamRepository.searchTeamsByUserIdAndName(userId, keyword);

        return teams.stream()
                .map(team -> {
                    TeamMember teamMember = teamMemberRepository
                            .findByTeamIdAndUserId(team.getId(), userId)
                            .orElse(null);
                    return mapToTeamListResponse(team, teamMember);
                })
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public Page<TeamListResponse> searchTeams(String keyword, Long userId, Pageable pageable) {
        log.info("Searching teams with keyword '{}' for user {} with pagination", keyword, userId);

        Page<Team> teams = teamRepository.searchTeamsByUserIdAndName(userId, keyword, pageable);

        return teams.map(team -> {
            TeamMember teamMember = teamMemberRepository
                    .findByTeamIdAndUserId(team.getId(), userId)
                    .orElse(null);
            return mapToTeamListResponse(team, teamMember);
        });
    }

    @Override
    @Transactional(readOnly = true)
    public TeamStatsResponse getTeamStats(Long teamId, Long userId) {
        log.info("Getting stats for team {} by user {}", teamId, userId);

        if (!isUserMemberOfTeam(teamId, userId)) {
            throw new RuntimeException("Bạn không có quyền xem thống kê team này");
        }

        // Đếm members theo role
        long adminCount = teamMemberRepository.countByTeamIdAndRole(teamId, TeamRole.ADMIN);
        long memberCount = teamMemberRepository.countByTeamIdAndRole(teamId, TeamRole.MEMBER);
        long viewerCount = teamMemberRepository.countByTeamIdAndRole(teamId, TeamRole.VIEWER);
        long totalMembers = teamMemberRepository.countByTeamId(teamId);

        // Đếm projects theo status
        List<Project> allProjects = projectRepository.findActiveProjectsByTeamId(teamId);
        long activeProjects = allProjects.stream()
                .filter(p -> p.getStatus() == Project.ProjectStatus.ACTIVE)
                .count();
        long completedProjects = allProjects.stream()
                .filter(p -> p.getStatus() == Project.ProjectStatus.COMPLETED)
                .count();
        long archivedProjects = allProjects.stream()
                .filter(p -> p.getStatus() == Project.ProjectStatus.ARCHIVED)
                .count();

        // TODO: Implement đếm tasks, comments, attachments, activities
        // Hiện tại return 0 cho các giá trị này vì cần query phức tạp hơn

        return TeamStatsResponse.builder()
                .totalMembers((int) totalMembers)
                .adminCount((int) adminCount)
                .memberCount((int) memberCount)
                .viewerCount((int) viewerCount)
                .totalProjects(allProjects.size())
                .activeProjects((int) activeProjects)
                .completedProjects((int) completedProjects)
                .archivedProjects((int) archivedProjects)
                .totalTasks(0) // TODO: Implement
                .todoTasks(0) // TODO: Implement
                .inProgressTasks(0) // TODO: Implement
                .doneTasks(0) // TODO: Implement
                .overdueTasks(0) // TODO: Implement
                .totalComments(0) // TODO: Implement
                .totalAttachments(0) // TODO: Implement
                .activitiesLast7Days(0) // TODO: Implement
                .activitiesLast30Days(0) // TODO: Implement
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public TeamDTO getTeamDTO(Long teamId) {
        Team team = getTeamOrThrow(teamId);

        return TeamDTO.builder()
                .id(team.getId())
                .name(team.getName())
                .color(team.getColor())
                .isActive(team.getIsActive())
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public boolean isUserAdminOfTeam(Long teamId, Long userId) {
        return teamMemberRepository.isUserAdminOfTeam(teamId, userId);
    }

    @Override
    @Transactional(readOnly = true)
    public boolean isUserMemberOfTeam(Long teamId, Long userId) {
        return teamMemberRepository.existsByTeamIdAndUserId(teamId, userId);
    }

    // ========== HELPER METHODS ==========

    private Team getTeamOrThrow(Long teamId) {
        return teamRepository.findById(teamId)
                .orElseThrow(() -> new RuntimeException("Team không tồn tại"));
    }

    private TeamResponse mapToTeamResponse(Team team, Long userId) {
        long memberCount = teamMemberRepository.countByTeamId(team.getId());

        List<Project> projects = projectRepository.findActiveProjectsByTeamId(team.getId());
        int totalProjects = projects.size();

        // TODO: Đếm tasks từ tất cả projects của team
        int totalTasks = 0;

        UserSimpleDTO createdByDTO = UserSimpleDTO.builder()
                .id(team.getCreatedBy().getId())
                .username(team.getCreatedBy().getUsername())
                .fullName(team.getCreatedBy().getFullName())
                .avatarUrl(team.getCreatedBy().getAvatarUrl())
                .build();

        return TeamResponse.builder()
                .id(team.getId())
                .name(team.getName())
                .description(team.getDescription())
                .color(team.getColor())
                .isActive(team.getIsActive())
                .maxMembers(team.getMaxMembers())
                .currentMemberCount((int) memberCount)
                .createdBy(createdByDTO)
                .createdAt(team.getCreatedAt())
                .updatedAt(team.getUpdatedAt())
                .totalProjects(totalProjects)
                .totalTasks(totalTasks)
                .activeMembersCount((int) memberCount)
                .build();
    }

    private TeamListResponse mapToTeamListResponse(TeamMember teamMember) {
        Team team = teamMember.getTeam();
        long memberCount = teamMemberRepository.countByTeamId(team.getId());

        List<Project> projects = projectRepository.findActiveProjectsByTeamId(team.getId());

        return TeamListResponse.builder()
                .id(team.getId())
                .name(team.getName())
                .description(team.getDescription())
                .color(team.getColor())
                .isActive(team.getIsActive())
                .memberCount((int) memberCount)
                .projectCount(projects.size())
                .myRole(teamMember.getRole())
                .createdAt(team.getCreatedAt())
                .joinedAt(teamMember.getJoinedAt())
                .build();
    }

    private TeamListResponse mapToTeamListResponse(Team team, TeamMember teamMember) {
        long memberCount = teamMemberRepository.countByTeamId(team.getId());

        List<Project> projects = projectRepository.findActiveProjectsByTeamId(team.getId());

        return TeamListResponse.builder()
                .id(team.getId())
                .name(team.getName())
                .description(team.getDescription())
                .color(team.getColor())
                .isActive(team.getIsActive())
                .memberCount((int) memberCount)
                .projectCount(projects.size())
                .myRole(teamMember != null ? teamMember.getRole() : null)
                .createdAt(team.getCreatedAt())
                .joinedAt(teamMember != null ? teamMember.getJoinedAt() : null)
                .build();
    }
}