package com.example.backend.dto.dashboard;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * DTO cho Overdue Tasks widget
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OverdueTasksDTO {
    private Integer count;
    private List<TaskSummaryDTO> tasks;
}