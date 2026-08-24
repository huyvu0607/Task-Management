package com.example.backend.dto.project;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProjectStatsDTO {
    private Long totalProjects;
    private Long activeProjects;
    private Long completedProjects;
    private Long archivedProjects;
    private Long onHoldProjects;
    private Long projectsEndingSoon; // Trong 7 ngày tới
}