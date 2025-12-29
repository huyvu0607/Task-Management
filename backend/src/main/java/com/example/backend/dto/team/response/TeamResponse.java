package com.example.backend.dto.team.response;

import com.example.backend.dto.dashboard.UserSimpleDTO;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TeamResponse {

    private Long id;

    private String name;

    private String description;

    private String color;

    private Boolean isActive;

    private Integer maxMembers;

    private Integer currentMemberCount;

    private UserSimpleDTO createdBy;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    // Thống kê cơ bản
    private Integer totalProjects;

    private Integer totalTasks;

    private Integer activeMembersCount;
}