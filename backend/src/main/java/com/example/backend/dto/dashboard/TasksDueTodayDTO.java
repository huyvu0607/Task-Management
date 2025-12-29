package com.example.backend.dto.dashboard;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * DTO cho Tasks Due Today widget
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TasksDueTodayDTO {
    private Integer count;
    private List<TaskSummaryDTO> tasks;
}