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
public class TeamListResponse {

    private Long id;

    private String name;

    private String description;

    private String color;

    private Boolean isActive;

    private Integer memberCount;

    private Integer projectCount;

    private TeamRole myRole; // Role của user hiện tại trong team này

    private LocalDateTime createdAt;

    private LocalDateTime joinedAt; // Thời gian user tham gia team
}