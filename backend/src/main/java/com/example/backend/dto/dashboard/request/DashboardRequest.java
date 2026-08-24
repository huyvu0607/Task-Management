package com.example.backend.dto.dashboard.request;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

/**
 * Request DTO cho Dashboard API
 * Có thể dùng để filter theo date range, limit, v.v...
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DashboardRequest {

    // Date range filter (optional)
    private LocalDate startDate;
    private LocalDate endDate;

    // Limit số lượng items (optional)
    private Integer taskLimit = 10; // default 10 tasks
    private Integer activityLimit = 10; // default 10 activities

    // Filter by project (optional)
    private Long projectId;

    // Filter by team (optional)
    private Long teamId;
}