package com.example.backend.dto.dashboard;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO cho statistics tổng quan trên dashboard
 * Hiển thị: Total Tasks, In Progress, Overdue, Completed
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DashboardStatsDTO {
    // Main stats
    private Long totalTasks;
    private Long inProgress;
    private Long overdue;
    private Long completed;

    // Changes/trends
    private Integer changeFromLastMonth; // % change (+12%)
    private Integer overdueChangeFromLastWeek; // -2 from last week
    private Integer completedThisWeek; // +8 this week

    // Calculated metrics
    private Double completionRate; // completed/total * 100

    // Tasks due today
    private Long dueToday;
}