package com.example.backend.service;

import com.example.backend.dto.dashboard.*;

/**
 * Service interface cho Dashboard functionality
 */
public interface IDashboardService {

    /**
     * Lấy toàn bộ data cho Personal Dashboard
     * @param userId ID của user đang login
     * @return DashboardResponseDTO chứa tất cả data
     */
    DashboardResponseDTO getPersonalDashboard(Long userId);

    /**
     * Lấy dashboard stats (Total Tasks, In Progress, Overdue, Completed)
     * @param userId ID của user
     * @return DashboardStatsDTO
     */
    DashboardStatsDTO getDashboardStats(Long userId);

    /**
     * Lấy My Tasks (assigned to me)
     * @param userId ID của user
     * @param limit Số lượng tasks tối đa
     * @return MyTasksDTO
     */
    MyTasksDTO getMyTasks(Long userId, Integer limit);

    /**
     * Lấy Tasks Created By Me
     * @param userId ID của user
     * @param limit Số lượng tasks tối đa
     * @return TasksCreatedByMeDTO
     */
    TasksCreatedByMeDTO getTasksCreatedByMe(Long userId, Integer limit);

    /**
     * Lấy Overdue Tasks
     * @param userId ID của user
     * @param limit Số lượng tasks tối đa
     * @return OverdueTasksDTO
     */
    OverdueTasksDTO getOverdueTasks(Long userId, Integer limit);

    /**
     * Lấy Tasks Due Today
     * @param userId ID của user
     * @param limit Số lượng tasks tối đa
     * @return TasksDueTodayDTO
     */
    TasksDueTodayDTO getTasksDueToday(Long userId, Integer limit);

    /**
     * Lấy Recent Activities
     * @param userId ID của user
     * @param limit Số lượng activities tối đa
     * @return List<ActivityDTO>
     */
    java.util.List<ActivityDTO> getRecentActivities(Long userId, Integer limit);

    /**
     * Lấy Navigation Badge Counts
     * Để hiển thị badge numbers ở sidebar navigation
     * @param userId ID của user
     * @return NavBadgeDTO
     */
    NavBadgeDTO getNavBadges(Long userId);
}