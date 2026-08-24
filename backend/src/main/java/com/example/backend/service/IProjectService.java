package com.example.backend.service;

import com.example.backend.dto.project.ProjectDTO;
import com.example.backend.dto.project.ProjectStatsDTO;
import com.example.backend.dto.project.request.CreateProjectRequest;
import com.example.backend.dto.project.request.UpdateProjectRequest;
import com.example.backend.model.Project;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface IProjectService {

    /**
     * Tạo project mới
     */
    ProjectDTO createProject(CreateProjectRequest request, Long userId);

    /**
     * Lấy project by ID
     */
    ProjectDTO getProjectById(Long projectId, Long userId);

    /**
     * Lấy danh sách projects trong team với filter và pagination
     */
    Page<ProjectDTO> getProjectsByTeamId(Long teamId, Long userId,
                                         Project.ProjectStatus status,
                                         Pageable pageable);

    /**
     * Lấy tất cả projects mà user tham gia
     */
    List<ProjectDTO> getMyProjects(Long userId);

    /**
     * Cập nhật project
     */
    ProjectDTO updateProject(Long projectId, UpdateProjectRequest request, Long userId);

    /**
     * Xóa project (soft delete - chuyển sang ARCHIVED)
     */
    void deleteProject(Long projectId, Long userId);

    /**
     * Archive project
     */
    ProjectDTO archiveProject(Long projectId, Long userId);

    /**
     * Unarchive project (đưa về ACTIVE)
     */
    ProjectDTO unarchiveProject(Long projectId, Long userId);

    /**
     * Tính lại progress của project dựa trên tasks
     */
    void recalculateProgress(Long projectId);

    /**
     * Lấy thống kê projects của team
     */
    ProjectStatsDTO getProjectStats(Long teamId, Long userId);
}