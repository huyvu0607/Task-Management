package com.example.backend.dto.task.request;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.List;

/**
 * DTO cho filter và search tasks (FR-4.6, FR-4.7)
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class TaskFilterRequest {

    // ========== SEARCH ==========
    private String search; // Tìm theo title và description

    // ========== FILTERS ==========
    private List<String> status; // TODO, IN_PROGRESS, DONE

    private List<String> priority; // LOW, MEDIUM, HIGH, URGENT

    private List<Long> assigneeIds; // Filter theo assignee

    private List<Long> labelIds; // Filter theo label

    private String dueDateFilter; // OVERDUE, TODAY, THIS_WEEK, THIS_MONTH

    private LocalDate dueDateFrom; // Custom date range
    private LocalDate dueDateTo;

    // ========== SORTING ==========
    private String sortBy; // priority, dueDate, createdAt, title
    private String sortDirection = "ASC"; // ASC, DESC

    // ========== PAGINATION ==========
    private Integer page = 0;
    private Integer size = 20;
}