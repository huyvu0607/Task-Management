package com.example.backend.dto.team.response;

import com.example.backend.model.TeamMember.TeamRole;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TeamMemberResponse {

    private Long id; // TeamMember id

    private Long userId;

    private String username;

    private String fullName;

    private String email;

    private String avatarUrl;

    private TeamRole role;

    private String invitedByName; // Tên người đã mời

    private LocalDateTime joinedAt;

    // ========== NEW FIELDS ==========

    private String phoneNumber;

    private String department;

    private String jobTitle;

    // ================================

    // Thống kê hoạt động của member trong team
    private Integer assignedTasksCount;

    private Integer completedTasksCount;

    private LocalDateTime lastActive; // Lần cuối hoạt động trong team
}