package com.example.backend.dto.task;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * DTO chung cho Task (có thể dùng cho nhiều mục đích)
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TaskDTO {

    private Long id;
    private Long projectId;
    private String title;
    private String description;
    private String status;
    private String priority;
    private LocalDate dueDate;
    private LocalDateTime completedAt;
    private BigDecimal estimatedHours;
    private BigDecimal actualHours;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    // Creator info
    private Long createdById;
    private String createdByUsername;
    private String createdByFullName;

    // Project info
    private String projectName;
}