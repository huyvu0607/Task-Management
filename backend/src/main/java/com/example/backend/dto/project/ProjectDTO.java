package com.example.backend.dto.project;

import com.example.backend.dto.dashboard.UserSimpleDTO;
import com.example.backend.model.Project;
import com.fasterxml.jackson.annotation.JsonIgnore;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

/**
 * Base Project DTO - Dùng chung cho các response
 * Chứa thông tin cơ bản của project
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProjectDTO {

    private Long id;

    private String name;

    private String description;

    private LocalDate startDate;

    private LocalDate endDate;

    private Project.ProjectStatus status;

    private BigDecimal progress;

    private String color;

    private List<UserSimpleDTO> teamMembers;

//    Tính toán derived fields
    private Long totalTasks;
    private Long completedTasks;

    public Long getTodoTasks() {
        if (totalTasks == null || completedTasks == null) return 0L;
        return totalTasks - completedTasks;
    }

    public Double getCompletionRate() {
        if (totalTasks == null || totalTasks == 0) return 0.0;
        return (completedTasks * 100.0) / totalTasks;
    }
    // Owner information
    private Long ownerId;
    private String ownerName;
    private String ownerEmail;
    private String ownerAvatar;

    // Team information
    private Long teamId;
    private String teamName;

    // Timestamps
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    /**
     * Convert từ Project entity sang ProjectDTO
     */
    public static ProjectDTO fromEntity(Project project) {
        if (project == null) {
            return null;
        }

        return ProjectDTO.builder()
                .id(project.getId())
                .name(project.getName())
                .description(project.getDescription())
                .startDate(project.getStartDate())
                .endDate(project.getEndDate())
                .status(project.getStatus())
                .progress(project.getProgress())
                .color(project.getColor())
                .ownerId(project.getOwner().getId())
                .ownerName(project.getOwner().getFullName())
                .ownerEmail(project.getOwner().getEmail())
                .ownerAvatar(project.getOwner().getAvatarUrl())
                .teamId(project.getTeam().getId())
                .teamName(project.getTeam().getName())
                .createdAt(project.getCreatedAt())
                .updatedAt(project.getUpdatedAt())
                .build();
    }
}