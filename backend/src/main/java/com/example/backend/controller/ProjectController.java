package com.example.backend.controller;

import com.example.backend.dto.project.ProjectDTO;
import com.example.backend.dto.project.ProjectStatsDTO;
import com.example.backend.dto.project.request.CreateProjectRequest;
import com.example.backend.dto.project.request.UpdateProjectRequest;
import com.example.backend.dto.response.ApiResponse;
import com.example.backend.dto.response.PageResponse;
import com.example.backend.model.Project;
import com.example.backend.security.UserDetailsImpl;
import com.example.backend.service.IProjectService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/projects")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "*")
public class ProjectController {

    private final IProjectService IProjectService;

    /**
     * Tạo project mới
     * POST /api/projects
     */
    @PostMapping
    public ResponseEntity<ApiResponse<ProjectDTO>> createProject(
            @Valid @RequestBody CreateProjectRequest request,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {

        log.info("REST request to create project: {} by user: {}", request.getName(), userDetails.getId());

        ProjectDTO project = IProjectService.createProject(request, userDetails.getId());

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.success("Project created successfully", project));
    }

    /**
     * Lấy project theo ID
     * GET /api/projects/{id}
     */
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ProjectDTO>> getProjectById(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {

        log.info("REST request to get project: {} by user: {}", id, userDetails.getId());

        ProjectDTO project = IProjectService.getProjectById(id, userDetails.getId());

        return ResponseEntity.ok(ApiResponse.success(project));
    }

    /**
     * Lấy danh sách projects của team
     * GET /api/projects/team/{teamId}
     */
    @GetMapping("/team/{teamId}")
    public ResponseEntity<ApiResponse<PageResponse<ProjectDTO>>> getProjectsByTeam(
            @PathVariable Long teamId,
            @RequestParam(required = false) Project.ProjectStatus status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "DESC") String sortDir,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {

        log.info("REST request to get projects for team: {} by user: {}", teamId, userDetails.getId());

        Sort sort = sortDir.equalsIgnoreCase("ASC")
                ? Sort.by(sortBy).ascending()
                : Sort.by(sortBy).descending();

        Pageable pageable = PageRequest.of(page, size, sort);

        Page<ProjectDTO> projects = IProjectService.getProjectsByTeamId(
                teamId,
                userDetails.getId(),
                status,
                pageable
        );

        PageResponse<ProjectDTO> pageResponse = PageResponse.<ProjectDTO>builder()
                .content(projects.getContent())
                .page(projects.getNumber())
                .size(projects.getSize())
                .totalElements(projects.getTotalElements())
                .totalPages(projects.getTotalPages())
                .last(projects.isLast())
                .first(projects.isFirst())
                .build();

        return ResponseEntity.ok(ApiResponse.success(pageResponse));
    }

    /**
     * Lấy danh sách projects của user hiện tại
     * GET /api/projects/my-projects
     */
    @GetMapping("/my-projects")
    public ResponseEntity<ApiResponse<List<ProjectDTO>>> getMyProjects(
            @AuthenticationPrincipal UserDetailsImpl userDetails) {

        log.info("REST request to get my projects by user: {}", userDetails.getId());

        List<ProjectDTO> projects = IProjectService.getMyProjects(userDetails.getId());

        return ResponseEntity.ok(ApiResponse.success(projects));
    }

    /**
     * Cập nhật project
     * PUT /api/projects/{id}
     */
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<ProjectDTO>> updateProject(
            @PathVariable Long id,
            @Valid @RequestBody UpdateProjectRequest request,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {

        log.info("REST request to update project: {} by user: {}", id, userDetails.getId());

        ProjectDTO project = IProjectService.updateProject(id, request, userDetails.getId());

        return ResponseEntity.ok(ApiResponse.success("Project updated successfully", project));
    }

    /**
     * Xóa project (archive)
     * DELETE /api/projects/{id}
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteProject(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {

        log.info("REST request to delete project: {} by user: {}", id, userDetails.getId());

        IProjectService.deleteProject(id, userDetails.getId());

        return ResponseEntity.ok(ApiResponse.success("Project archived successfully", null));
    }

    /**
     * Archive project
     * POST /api/projects/{id}/archive
     */
    @PostMapping("/{id}/archive")
    public ResponseEntity<ApiResponse<ProjectDTO>> archiveProject(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {

        log.info("REST request to archive project: {} by user: {}", id, userDetails.getId());

        ProjectDTO project = IProjectService.archiveProject(id, userDetails.getId());

        return ResponseEntity.ok(ApiResponse.success("Project archived successfully", project));
    }

    /**
     * Unarchive project
     * POST /api/projects/{id}/unarchive
     */
    @PostMapping("/{id}/unarchive")
    public ResponseEntity<ApiResponse<ProjectDTO>> unarchiveProject(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {

        log.info("REST request to unarchive project: {} by user: {}", id, userDetails.getId());

        ProjectDTO project = IProjectService.unarchiveProject(id, userDetails.getId());

        return ResponseEntity.ok(ApiResponse.success("Project restored successfully", project));
    }

    /**
     * Tính lại progress của project
     * POST /api/projects/{id}/recalculate-progress
     */
    @PostMapping("/{id}/recalculate-progress")
    public ResponseEntity<ApiResponse<Void>> recalculateProgress(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {

        log.info("REST request to recalculate progress for project: {} by user: {}", id, userDetails.getId());

        IProjectService.recalculateProgress(id);

        return ResponseEntity.ok(ApiResponse.success("Progress recalculated successfully", null));
    }

    /**
     * Lấy thống kê projects của team
     * GET /api/projects/team/{teamId}/stats
     */
    @GetMapping("/team/{teamId}/stats")
    public ResponseEntity<ApiResponse<ProjectStatsDTO>> getProjectStats(
            @PathVariable Long teamId,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {

        log.info("REST request to get project stats for team: {} by user: {}", teamId, userDetails.getId());

        ProjectStatsDTO stats = IProjectService.getProjectStats(teamId, userDetails.getId());

        return ResponseEntity.ok(ApiResponse.success(stats));
    }
}