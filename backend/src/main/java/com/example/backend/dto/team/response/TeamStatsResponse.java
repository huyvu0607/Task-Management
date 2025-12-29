package com.example.backend.dto.team.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TeamStatsResponse {

    // Thống kê members
    private Integer totalMembers;

    private Integer adminCount;

    private Integer memberCount;

    private Integer viewerCount;

    // Thống kê projects
    private Integer totalProjects;

    private Integer activeProjects;

    private Integer completedProjects;

    private Integer archivedProjects;

    // Thống kê tasks
    private Integer totalTasks;

    private Integer todoTasks;

    private Integer inProgressTasks;

    private Integer doneTasks;

    private Integer overdueTasks;

    // Thống kê hoạt động
    private Integer totalComments;

    private Integer totalAttachments;

    private Integer activitiesLast7Days; // Số hoạt động trong 7 ngày qua

    private Integer activitiesLast30Days; // Số hoạt động trong 30 ngày qua
}