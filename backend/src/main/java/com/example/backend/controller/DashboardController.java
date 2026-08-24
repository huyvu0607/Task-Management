package com.example.backend.controller;

import com.example.backend.dto.dashboard.*;
import com.example.backend.dto.response.ApiResponse;
import com.example.backend.security.UserDetailsImpl;
import com.example.backend.service.IDashboardService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/*GET /api/dashboard/personal          - Lấy toàn bộ dashboard
GET /api/dashboard/stats             - Chỉ lấy statistics
GET /api/dashboard/my-tasks          - My Tasks (assigned to me)
GET /api/dashboard/created-by-me     - Tasks created by me
GET /api/dashboard/overdue           - Overdue tasks
GET /api/dashboard/due-today         - Tasks due today
GET /api/dashboard/activities        - Recent activities
*/

/**
 * REST Controller cho Dashboard APIs
 */
@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "*", maxAge = 3600)
public class DashboardController {

    private final IDashboardService IDashboardService;

    /**
     * GET /api/dashboard/personal
     * Lấy toàn bộ data cho Personal Dashboard
     */
    @GetMapping("/personal")
    public ResponseEntity<ApiResponse<DashboardResponseDTO>> getPersonalDashboard(
            Authentication authentication) {

        log.info("GET /api/dashboard/personal - User: {}", authentication.getName());

        Long userId = getUserIdFromAuth(authentication);
        DashboardResponseDTO dashboard = IDashboardService.getPersonalDashboard(userId);

        return ResponseEntity.ok(
                ApiResponse.success("Dashboard loaded successfully", dashboard)
        );
    }

    /**
     * GET /api/dashboard/stats
     * Lấy chỉ dashboard statistics
     */
    @GetMapping("/stats")
    public ResponseEntity<ApiResponse<DashboardStatsDTO>> getDashboardStats(
            Authentication authentication) {

        log.info("GET /api/dashboard/stats - User: {}", authentication.getName());

        Long userId = getUserIdFromAuth(authentication);
        DashboardStatsDTO stats = IDashboardService.getDashboardStats(userId);

        return ResponseEntity.ok(
                ApiResponse.success(stats)
        );
    }

    /**
     * GET /api/dashboard/my-tasks
     * Lấy My Tasks (assigned to me)
     */
    @GetMapping("/my-tasks")
    public ResponseEntity<ApiResponse<MyTasksDTO>> getMyTasks(
            Authentication authentication,
            @RequestParam(defaultValue = "10") Integer limit) {

        log.info("GET /api/dashboard/my-tasks - User: {}, Limit: {}",
                authentication.getName(), limit);

        Long userId = getUserIdFromAuth(authentication);
        MyTasksDTO myTasks = IDashboardService.getMyTasks(userId, limit);

        return ResponseEntity.ok(
                ApiResponse.success(myTasks)
        );
    }

    /**
     * GET /api/dashboard/created-by-me
     * Lấy Tasks Created By Me
     */
    @GetMapping("/created-by-me")
    public ResponseEntity<ApiResponse<TasksCreatedByMeDTO>> getTasksCreatedByMe(
            Authentication authentication,
            @RequestParam(defaultValue = "5") Integer limit) {

        log.info("GET /api/dashboard/created-by-me - User: {}, Limit: {}",
                authentication.getName(), limit);

        Long userId = getUserIdFromAuth(authentication);
        TasksCreatedByMeDTO tasks = IDashboardService.getTasksCreatedByMe(userId, limit);

        return ResponseEntity.ok(
                ApiResponse.success(tasks)
        );
    }

    /**
     * GET /api/dashboard/overdue
     * Lấy Overdue Tasks
     */
    @GetMapping("/overdue")
    public ResponseEntity<ApiResponse<OverdueTasksDTO>> getOverdueTasks(
            Authentication authentication,
            @RequestParam(defaultValue = "5") Integer limit) {

        log.info("GET /api/dashboard/overdue - User: {}, Limit: {}",
                authentication.getName(), limit);

        Long userId = getUserIdFromAuth(authentication);
        OverdueTasksDTO tasks = IDashboardService.getOverdueTasks(userId, limit);

        return ResponseEntity.ok(
                ApiResponse.success(tasks)
        );
    }

    /**
     * GET /api/dashboard/due-today
     * Lấy Tasks Due Today
     */
    @GetMapping("/due-today")
    public ResponseEntity<ApiResponse<TasksDueTodayDTO>> getTasksDueToday(
            Authentication authentication,
            @RequestParam(defaultValue = "5") Integer limit) {

        log.info("GET /api/dashboard/due-today - User: {}, Limit: {}",
                authentication.getName(), limit);

        Long userId = getUserIdFromAuth(authentication);
        TasksDueTodayDTO tasks = IDashboardService.getTasksDueToday(userId, limit);

        return ResponseEntity.ok(
                ApiResponse.success(tasks)
        );
    }

    /**
     * GET /api/dashboard/activities
     * Lấy Recent Activities
     */
    @GetMapping("/activities")
    public ResponseEntity<ApiResponse<List<ActivityDTO>>> getRecentActivities(
            Authentication authentication,
            @RequestParam(defaultValue = "10") Integer limit) {

        log.info("GET /api/dashboard/activities - User: {}, Limit: {}",
                authentication.getName(), limit);

        Long userId = getUserIdFromAuth(authentication);
        List<ActivityDTO> activities = IDashboardService.getRecentActivities(userId, limit);

        return ResponseEntity.ok(
                ApiResponse.success(activities)
        );
    }

    // ========== HELPER METHOD ==========

    /**
     * Extract userId từ Authentication object
     * ✅ Sử dụng UserDetailsImpl để lấy userId
     */
    private Long getUserIdFromAuth(Authentication authentication) {
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        return userDetails.getId();
    }
}