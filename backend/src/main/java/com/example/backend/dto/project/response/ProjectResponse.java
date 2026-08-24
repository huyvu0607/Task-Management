package com.example.backend.dto.project.response;

import com.example.backend.dto.project.ProjectDTO;
import com.example.backend.model.Project;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Response DTO cho single project
 * Sử dụng ProjectDTO làm base
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProjectResponse {

    private ProjectDTO project;

    private String message;

    /**
     * Create success response from Project entity
     */
    public static ProjectResponse success(Project project, String message) {
        return ProjectResponse.builder()
                .project(ProjectDTO.fromEntity(project))
                .message(message)
                .build();
    }

    /**
     * Create success response without message
     */
    public static ProjectResponse success(Project project) {
        return ProjectResponse.builder()
                .project(ProjectDTO.fromEntity(project))
                .build();
    }
}