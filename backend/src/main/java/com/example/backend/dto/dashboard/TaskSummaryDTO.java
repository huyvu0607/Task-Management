package com.example.backend.dto.dashboard;

import com.example.backend.model.Task;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

/**
 * DTO cho task summary trong My Tasks section
 * Hiển thị thông tin cơ bản của task + counts
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TaskSummaryDTO {
    private Long id;
    private String title;
    private String description;
    private Task.TaskStatus status;
    private Task.TaskPriority priority;
    private LocalDate dueDate;
    private LocalDateTime createdAt;

    // Counts để hiển thị icon số lượng
    private Integer commentCount;
    private Integer attachmentCount;

    // Assignees
    private List<UserSimpleDTO> assignees;

    // Project info
    private Long projectId;
    private String projectName;
}