package com.example.backend.service.impl;

import com.example.backend.dto.dashboard.UserSimpleDTO;
import com.example.backend.dto.project.ProjectDTO;
import com.example.backend.dto.project.ProjectStatsDTO;
import com.example.backend.dto.project.request.CreateProjectRequest;
import com.example.backend.dto.project.request.UpdateProjectRequest;
import com.example.backend.exception.BusinessException;
import com.example.backend.model.Project;
import com.example.backend.model.Team;
import com.example.backend.model.TeamMember;
import com.example.backend.model.User;
import com.example.backend.repository.ProjectRepository;
import com.example.backend.repository.TaskRepository;
import com.example.backend.repository.TeamMemberRepository;
import com.example.backend.repository.TeamRepository;
import com.example.backend.repository.UserRepository;
import com.example.backend.service.IProjectService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class ProjectServiceImpl implements IProjectService {

    private final ProjectRepository projectRepository;
    private final TeamRepository teamRepository;
    private final UserRepository userRepository;
    private final TeamMemberRepository teamMemberRepository;
    private final TaskRepository taskRepository;

    @Override
    @Transactional
    public ProjectDTO createProject(CreateProjectRequest request, Long userId) {
        log.info("Creating project: {} for user: {}", request.getName(), userId);

        // Validate dates
        if (request.getEndDate() != null && request.getStartDate() != null) {
            if (request.getEndDate().isBefore(request.getStartDate())) {
                throw BusinessException.badRequest("Ngày kết thúc phải sau ngày bắt đầu", "INVALID_DATE_RANGE");
            }
        }

        // Check user exists
        User owner = userRepository.findById(userId)
                .orElseThrow(() -> BusinessException.notFound("User", userId));

        // Check team exists
        Team team = teamRepository.findById(request.getTeamId())
                .orElseThrow(() -> BusinessException.notFound("Team", request.getTeamId()));

        // Check user is member of team
        TeamMember membership = teamMemberRepository.findByTeamIdAndUserId(request.getTeamId(), userId)
                .orElseThrow(() -> BusinessException.forbidden("Bạn không phải thành viên của team này"));

        // Check permission (ADMIN and MANAGER can create project)
        if (!canManageProjects(membership.getRole())) {
            throw BusinessException.forbidden("Bạn không có quyền tạo project trong team này");
        }

        // Check duplicate name in team
        if (projectRepository.existsByNameInTeam(team.getId(), request.getName(), null)) {
            throw BusinessException.conflict("Tên project đã tồn tại trong team này", "PROJECT_NAME_EXISTS");
        }

        // Create project
        Project project = new Project();
        project.setName(request.getName());
        project.setDescription(request.getDescription());
        project.setTeam(team);
        project.setOwner(owner);
        project.setStartDate(request.getStartDate());
        project.setEndDate(request.getEndDate());
        project.setStatus(request.getStatus() != null ? request.getStatus() : Project.ProjectStatus.ACTIVE);
        project.setColor(request.getColor());
        project.setProgress(BigDecimal.ZERO);

        project = projectRepository.save(project);
        log.info("Project created successfully with ID: {}", project.getId());

        return convertToDTO(project);
    }

    @Override
    @Transactional(readOnly = true)
    public ProjectDTO getProjectById(Long projectId, Long userId) {
        log.info("Getting project: {} for user: {}", projectId, userId);

        Project project = projectRepository.findByIdWithTeam(projectId)
                .orElseThrow(() -> BusinessException.notFound("Project", projectId));

        // Check user is member of team
        teamMemberRepository.findByTeamIdAndUserId(project.getTeam().getId(), userId)
                .orElseThrow(() -> BusinessException.forbidden("Bạn không có quyền xem project này"));

        return convertToDTO(project);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<ProjectDTO> getProjectsByTeamId(Long teamId, Long userId,
                                                Project.ProjectStatus status,
                                                Pageable pageable) {
        log.info("Getting projects for team: {} by user: {}", teamId, userId);

        // Check user is member of team
        teamMemberRepository.findByTeamIdAndUserId(teamId, userId)
                .orElseThrow(() -> BusinessException.forbidden("Bạn không phải thành viên của team này"));

        // Get projects with filter
        Page<Project> projects = projectRepository.findByTeamIdAndStatus(teamId, status, pageable);

        return projects.map(this::convertToDTO);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ProjectDTO> getMyProjects(Long userId) {
        log.info("Getting projects for user: {}", userId);

        List<Project> projects = projectRepository.findProjectsByUserId(userId);
        return projects.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public ProjectDTO updateProject(Long projectId, UpdateProjectRequest request, Long userId) {
        log.info("Updating project: {} by user: {}", projectId, userId);

        Project project = projectRepository.findByIdWithTeam(projectId)
                .orElseThrow(() -> BusinessException.notFound("Project", projectId));

        // Check permission
        TeamMember membership = teamMemberRepository.findByTeamIdAndUserId(project.getTeam().getId(), userId)
                .orElseThrow(() -> BusinessException.forbidden("Bạn không có quyền cập nhật project này"));

        // ADMIN, MANAGER hoặc project owner có thể update
        if (!canManageProjects(membership.getRole()) && !project.getOwner().getId().equals(userId)) {
            throw BusinessException.forbidden("Bạn không có quyền cập nhật project này");
        }

        // Validate dates if both provided
        if (request.getStartDate() != null && request.getEndDate() != null) {
            if (request.getEndDate().isBefore(request.getStartDate())) {
                throw BusinessException.badRequest("Ngày kết thúc phải sau ngày bắt đầu", "INVALID_DATE_RANGE");
            }
        }

        // Check duplicate name if name is changed
        if (request.getName() != null && !request.getName().equals(project.getName())) {
            if (projectRepository.existsByNameInTeam(project.getTeam().getId(), request.getName(), projectId)) {
                throw BusinessException.conflict("Tên project đã tồn tại trong team này", "PROJECT_NAME_EXISTS");
            }
        }

        // Update fields
        if (request.getName() != null) {
            project.setName(request.getName());
        }
        if (request.getDescription() != null) {
            project.setDescription(request.getDescription());
        }
        if (request.getStartDate() != null) {
            project.setStartDate(request.getStartDate());
        }
        if (request.getEndDate() != null) {
            project.setEndDate(request.getEndDate());
        }
        if (request.getStatus() != null) {
            project.setStatus(request.getStatus());
        }
        if (request.getColor() != null) {
            project.setColor(request.getColor());
        }

        project = projectRepository.save(project);
        log.info("Project updated successfully: {}", projectId);

        return convertToDTO(project);
    }

    @Override
    @Transactional
    public void deleteProject(Long projectId, Long userId) {
        log.info("Deleting project: {} by user: {}", projectId, userId);

        Project project = projectRepository.findByIdWithTeam(projectId)
                .orElseThrow(() -> BusinessException.notFound("Project", projectId));

        // Check permission
        TeamMember membership = teamMemberRepository.findByTeamIdAndUserId(project.getTeam().getId(), userId)
                .orElseThrow(() -> BusinessException.forbidden("Bạn không có quyền xóa project này"));

        // Chỉ ADMIN hoặc project owner có thể xóa
        if (membership.getRole() != TeamMember.TeamRole.ADMIN &&
                !project.getOwner().getId().equals(userId)) {
            throw BusinessException.forbidden("Bạn không có quyền xóa project này");
        }

        // Archive instead of delete
        project.setStatus(Project.ProjectStatus.ARCHIVED);
        projectRepository.save(project);

        log.info("Project archived successfully: {}", projectId);
    }

    @Override
    @Transactional
    public ProjectDTO archiveProject(Long projectId, Long userId) {
        log.info("Archiving project: {} by user: {}", projectId, userId);

        Project project = projectRepository.findByIdWithTeam(projectId)
                .orElseThrow(() -> BusinessException.notFound("Project", projectId));

        // Check permission
        TeamMember membership = teamMemberRepository.findByTeamIdAndUserId(project.getTeam().getId(), userId)
                .orElseThrow(() -> BusinessException.forbidden("Bạn không có quyền archive project này"));

        // ADMIN, MANAGER hoặc project owner có thể archive
        if (!canManageProjects(membership.getRole()) && !project.getOwner().getId().equals(userId)) {
            throw BusinessException.forbidden("Bạn không có quyền archive project này");
        }

        project.setStatus(Project.ProjectStatus.ARCHIVED);
        project = projectRepository.save(project);

        return convertToDTO(project);
    }

    @Override
    @Transactional
    public ProjectDTO unarchiveProject(Long projectId, Long userId) {
        log.info("Unarchiving project: {} by user: {}", projectId, userId);

        Project project = projectRepository.findByIdWithTeam(projectId)
                .orElseThrow(() -> BusinessException.notFound("Project", projectId));

        // Check permission
        TeamMember membership = teamMemberRepository.findByTeamIdAndUserId(project.getTeam().getId(), userId)
                .orElseThrow(() -> BusinessException.forbidden("Bạn không có quyền unarchive project này"));

        // ADMIN, MANAGER hoặc project owner có thể unarchive
        if (!canManageProjects(membership.getRole()) && !project.getOwner().getId().equals(userId)) {
            throw BusinessException.forbidden("Bạn không có quyền unarchive project này");
        }

        project.setStatus(Project.ProjectStatus.ACTIVE);
        project = projectRepository.save(project);

        return convertToDTO(project);
    }

    @Override
    @Transactional
    public void recalculateProgress(Long projectId) {
        log.info("Recalculating progress for project: {}", projectId);

        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> BusinessException.notFound("Project", projectId));

        // Count tasks
        Long totalTasks = taskRepository.countByProjectId(projectId);
        Long completedTasks = taskRepository.countCompletedByProjectId(projectId);

        // Calculate progress
        BigDecimal progress = BigDecimal.ZERO;
        if (totalTasks > 0) {
            progress = BigDecimal.valueOf(completedTasks)
                    .multiply(BigDecimal.valueOf(100))
                    .divide(BigDecimal.valueOf(totalTasks), 2, RoundingMode.HALF_UP);
        }

        project.setProgress(progress);
        projectRepository.save(project);

        log.info("Progress recalculated: {}% for project: {}", progress, projectId);
    }

    @Override
    @Transactional(readOnly = true)
    public ProjectStatsDTO getProjectStats(Long teamId, Long userId) {
        log.info("Getting project stats for team: {} by user: {}", teamId, userId);

        // Check user is member of team
        teamMemberRepository.findByTeamIdAndUserId(teamId, userId)
                .orElseThrow(() -> BusinessException.forbidden("Bạn không phải thành viên của team này"));

        Long totalProjects = projectRepository.countByTeamId(teamId);
        Long activeProjects = projectRepository.countByTeamIdAndStatus(teamId, Project.ProjectStatus.ACTIVE);
        Long completedProjects = projectRepository.countByTeamIdAndStatus(teamId, Project.ProjectStatus.COMPLETED);
        Long archivedProjects = projectRepository.countByTeamIdAndStatus(teamId, Project.ProjectStatus.ARCHIVED);
        Long onHoldProjects = projectRepository.countByTeamIdAndStatus(teamId, Project.ProjectStatus.ON_HOLD);

        // Projects ending in next 7 days
        LocalDate today = LocalDate.now();
        LocalDate weekLater = today.plusDays(7);
        List<Project> endingSoon = projectRepository.findProjectsEndingSoon(teamId, today, weekLater);

        return ProjectStatsDTO.builder()
                .totalProjects(totalProjects)
                .activeProjects(activeProjects)
                .completedProjects(completedProjects)
                .archivedProjects(archivedProjects)
                .onHoldProjects(onHoldProjects)
                .projectsEndingSoon((long) endingSoon.size())
                .build();
    }

    /**
     * Helper method: Kiểm tra role có quyền quản lý projects không
     */
    private boolean canManageProjects(TeamMember.TeamRole role) {
        return role == TeamMember.TeamRole.ADMIN || role == TeamMember.TeamRole.MANAGER;
    }

    /**
     *
     *  Helper method: Convert Project entity sang ProjectDTO (simple version)
     */
    private ProjectDTO convertToDTO(Project project) {
        // ✅ Lấy danh sách members của team
        List<UserSimpleDTO> teamMembers = teamMemberRepository.findByTeamId(project.getTeam().getId())
                .stream()
                .map(teamMember -> UserSimpleDTO.builder()
                        .id(teamMember.getUser().getId())
                        .username(teamMember.getUser().getUsername())
                        .fullName(teamMember.getUser().getFullName())
                        .email(teamMember.getUser().getEmail())
                        .avatarUrl(teamMember.getUser().getAvatarUrl())
                        .build())
                .collect(Collectors.toList());

        // ✅ Đếm tasks (optional)
        Long totalTasks = taskRepository.countByProjectId(project.getId());
        Long completedTasks = taskRepository.countCompletedByProjectId(project.getId());

        return ProjectDTO.builder()
                .id(project.getId())
                .name(project.getName())
                .description(project.getDescription())
                .startDate(project.getStartDate())
                .endDate(project.getEndDate())
                .status(project.getStatus())
                .progress(project.getProgress())
                .color(project.getColor())
                .teamId(project.getTeam().getId())
                .teamName(project.getTeam().getName())
                .ownerId(project.getOwner().getId())
                .ownerName(project.getOwner().getFullName())
                .ownerEmail(project.getOwner().getEmail())
                .ownerAvatar(project.getOwner().getAvatarUrl())
                .teamMembers(teamMembers)  // ✅ THÊM teamMembers
                .totalTasks(totalTasks)     // ✅ THÊM task count
                .completedTasks(completedTasks)
                .createdAt(project.getCreatedAt())
                .updatedAt(project.getUpdatedAt())
                .build();
    }
}