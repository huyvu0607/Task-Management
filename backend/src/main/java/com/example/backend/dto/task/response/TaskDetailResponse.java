package com.example.backend.dto.task.response;

import com.example.backend.dto.dashboard.UserSimpleDTO;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

/**
 * DTO cho task detail response (FR-4.2)
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TaskDetailResponse {

    // ========== BASIC INFO ==========
    private Long id;
    private String title;
    private String description;
    private String status; // TODO, IN_PROGRESS, DONE
    private String priority; // LOW, MEDIUM, HIGH, URGENT

    // ========== PROJECT INFO ==========
    private Long projectId;
    private String projectName;
    private String projectColor;

    // ========== ASSIGNEES ==========
    private List<TaskAssigneeDTO> assignees;

    // ========== DATES ==========
    private LocalDate dueDate;
    private LocalDateTime completedAt;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    // ========== LABELS ==========
    private List<TaskLabelDTO> labels;

    // ========== CREATOR ==========
    private UserSimpleDTO createdBy;

    // ========== TIME TRACKING ==========
    private BigDecimal estimatedHours;
    private BigDecimal actualHours;

    // ========== COUNTS (cho UI) ==========
    private Integer commentCount;
    private Integer attachmentCount;

    // ========== STATUS FLAGS ==========
    private Boolean isOverdue; // Due date < today && status != DONE
    private Boolean canEdit; // User có quyền edit không
    private Boolean canDelete; // User có quyền delete không
}