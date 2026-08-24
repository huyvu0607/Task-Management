package com.example.backend.dto.dashboard;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * DTO tổng hợp cho toàn bộ Personal Dashboard
 * Trả về cho API GET /api/dashboard/personal
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DashboardResponseDTO {
    // Stats cards ở trên
    private DashboardStatsDTO stats;

    // My Tasks section
    private MyTasksDTO myTasks;

    // Tasks created by me
    private TasksCreatedByMeDTO tasksCreatedByMe;

    // Overdue tasks
    private OverdueTasksDTO overdueTasks;

    // Tasks due today
    private TasksDueTodayDTO tasksDueToday;

    // Recent activities
    private List<ActivityDTO> recentActivities;

    // ⭐ Navigation badge counts
    private NavBadgeDTO navBadges;
}