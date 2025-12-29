package com.example.backend.dto.project.response;

import com.example.backend.dto.project.ProjectDTO;
import com.example.backend.model.Project;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.domain.Page;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Response DTO cho danh sách projects với pagination
 * FR-3.2: Xem danh sách projects
 *
 * Sử dụng PageResponse<ProjectDTO> generic có sẵn
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProjectListResponse {

    private List<ProjectDTO> content;

    private Integer page;
    private Integer size;
    private Long totalElements;
    private Integer totalPages;
    private Boolean last;
    private Boolean first;

    // Summary statistics (optional)
    private Long totalActive;
    private Long totalCompleted;
    private Long totalArchived;

    /**
     * Create from Page<Project>
     */
    public static ProjectListResponse fromPage(Page<Project> projectPage) {
        List<ProjectDTO> projects = projectPage.getContent().stream()
                .map(ProjectDTO::fromEntity)
                .collect(Collectors.toList());

        return ProjectListResponse.builder()
                .content(projects)
                .page(projectPage.getNumber())
                .size(projectPage.getSize())
                .totalElements(projectPage.getTotalElements())
                .totalPages(projectPage.getTotalPages())
                .first(projectPage.isFirst())
                .last(projectPage.isLast())
                .build();
    }

    /**
     * Create from List<ProjectDTO> without pagination
     */
    public static ProjectListResponse fromList(List<ProjectDTO> projects) {
        return ProjectListResponse.builder()
                .content(projects)
                .page(0)
                .size(projects.size())
                .totalElements((long) projects.size())
                .totalPages(1)
                .first(true)
                .last(true)
                .build();
    }

    /**
     * Add summary statistics
     */
    public ProjectListResponse withSummary(Long totalActive, Long totalCompleted, Long totalArchived) {
        this.totalActive = totalActive;
        this.totalCompleted = totalCompleted;
        this.totalArchived = totalArchived;
        return this;
    }
}