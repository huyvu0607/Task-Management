package com.example.backend.dto.task.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * DTO cho assignee của task
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TaskAssigneeDTO {

    private Long id; // TaskAssignee ID

    // User info
    private Long userId;
    private String username;
    private String fullName;
    private String avatarUrl;
    private String email;

    // Assignment info
    private LocalDateTime assignedAt;
    private String assignedByUsername; // Người assign
    private String assignedByFullName;
}