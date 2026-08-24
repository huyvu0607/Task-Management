package com.example.backend.dto.dashboard;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * DTO cho My Tasks section
 * Chứa danh sách tasks và summary counts
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MyTasksDTO {
    private Integer pendingCount;
    private Integer completedCount;
    private List<TaskSummaryDTO> tasks;
}