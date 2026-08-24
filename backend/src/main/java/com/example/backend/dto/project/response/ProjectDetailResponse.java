package com.example.backend.dto.project.response;

import com.example.backend.dto.dashboard.UserSimpleDTO;
import com.example.backend.dto.project.ProjectDTO;
import com.example.backend.model.Project;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * Response DTO cho project detail
 * Bao gồm project info + tasks summary + members
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProjectDetailResponse {

    // Basic project info
    private ProjectDTO project;

    // Task statistics
    private ProjectStatsResponse stats;

    // Team members working on this project
    private List<UserSimpleDTO> members;

    // Recent activity count (optional)
    private Integer recentActivityCount;

    /**
     * Create from project entity (without stats and members)
     */
    public static ProjectDetailResponse fromEntity(Project project) {
        return ProjectDetailResponse.builder()
                .project(ProjectDTO.fromEntity(project))
                .build();
    }

    /**
     * Create complete response with all data
     */
    public static ProjectDetailResponse complete(
            Project project,
            ProjectStatsResponse stats,
            List<UserSimpleDTO> members
    ) {
        return ProjectDetailResponse.builder()
                .project(ProjectDTO.fromEntity(project))
                .stats(stats)
                .members(members)
                .build();
    }
}