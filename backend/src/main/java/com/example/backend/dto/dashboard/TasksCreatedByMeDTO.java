package com.example.backend.dto.dashboard;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * DTO cho Tasks Created By Me widget
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TasksCreatedByMeDTO {
    private Integer totalCount;
    private List<TaskSummaryDTO> tasks;
}