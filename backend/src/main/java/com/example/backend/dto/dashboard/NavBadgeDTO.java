package com.example.backend.dto.dashboard;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO cho navigation badge counts
 * Hiển thị số lượng items ở sidebar navigation
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NavBadgeDTO {

    // My Tasks badge - số tasks pending assigned to user
    private Integer myTasksCount;

    // Projects badge - số active projects user tham gia
    private Integer activeProjectsCount;

    // Notifications badge (optional - nếu cần)
    private Integer unreadNotificationsCount;

    // Team badge (optional - số teams user tham gia)
    private Integer teamsCount;
}