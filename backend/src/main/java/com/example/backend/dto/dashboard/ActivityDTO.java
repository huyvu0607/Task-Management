package com.example.backend.dto.dashboard;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * DTO cho Recent Activity feed
 * VD: "Sarah Chen completed Set up CI/CD pipeline - 2 hours ago"
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ActivityDTO {
    private Long id;

    // User info
    private UserSimpleDTO user;

    // Action info
    private String actionType; // "completed", "created", "commented", "updated"
    private String entityType; // "task", "project"

    // Target info
    private Long targetId;
    private String targetTitle;

    // Display
    private String description; // "completed Set up CI/CD pipeline"
    private LocalDateTime createdAt;
    private String timeAgo; // "2 hours ago", "1 day ago"
}