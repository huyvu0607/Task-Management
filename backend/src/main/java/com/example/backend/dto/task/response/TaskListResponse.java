package com.example.backend.dto.task.response;

import com.example.backend.dto.dashboard.UserSimpleDTO;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

/**
 * DTO cho task trong list (lightweight version)
 * Dùng cho filter, search, pagination
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TaskListResponse {

    private Long id;
    private String title;
    private String status;
    private String priority;

    // Project info
    private Long projectId;
    private String projectName;
    private String projectColor;

    // Assignees (simplified)
    private List<UserSimpleDTO> assignees;

    // Labels (simplified)
    private List<TaskLabelDTO> labels;

    // Dates
    private LocalDate dueDate;
    private LocalDateTime createdAt;

    // Creator
    private UserSimpleDTO createdBy;

    // Counts
    private Integer commentCount;
    private Integer attachmentCount;

    // Status flags
    private Boolean isOverdue;
}