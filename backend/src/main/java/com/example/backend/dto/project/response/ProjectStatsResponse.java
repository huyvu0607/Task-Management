package com.example.backend.dto.project.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

/**
 * Response DTO cho project statistics
 * FR-3.5: Tính progress và các thống kê
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProjectStatsResponse {

    // Task counts
    private Long totalTasks;
    private Long todoTasks;
    private Long inProgressTasks;
    private Long doneTasks;

    // Progress
    private BigDecimal progress; // 0-100

    // Task priority breakdown
    private Long lowPriorityTasks;
    private Long mediumPriorityTasks;
    private Long highPriorityTasks;
    private Long urgentPriorityTasks;

    // Overdue tasks
    private Long overdueTasks;

    // Members count
    private Integer totalMembers;

    // Time tracking (optional)
    private BigDecimal totalEstimatedHours;
    private BigDecimal totalActualHours;

    /**
     * Calculate progress percentage
     * Formula: (Done tasks / Total tasks) × 100
     */
    public static BigDecimal calculateProgress(Long totalTasks, Long doneTasks) {
        if (totalTasks == null || totalTasks == 0) {
            return BigDecimal.ZERO;
        }
        if (doneTasks == null) {
            doneTasks = 0L;
        }

        return BigDecimal.valueOf(doneTasks)
                .multiply(BigDecimal.valueOf(100))
                .divide(BigDecimal.valueOf(totalTasks), 2, BigDecimal.ROUND_HALF_UP);
    }

    /**
     * Create empty stats
     */
    public static ProjectStatsResponse empty() {
        return ProjectStatsResponse.builder()
                .totalTasks(0L)
                .todoTasks(0L)
                .inProgressTasks(0L)
                .doneTasks(0L)
                .progress(BigDecimal.ZERO)
                .lowPriorityTasks(0L)
                .mediumPriorityTasks(0L)
                .highPriorityTasks(0L)
                .urgentPriorityTasks(0L)
                .overdueTasks(0L)
                .totalMembers(0)
                .totalEstimatedHours(BigDecimal.ZERO)
                .totalActualHours(BigDecimal.ZERO)
                .build();
    }
}