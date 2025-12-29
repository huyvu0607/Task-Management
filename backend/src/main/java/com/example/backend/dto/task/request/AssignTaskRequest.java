package com.example.backend.dto.task.request;

import jakarta.validation.constraints.NotEmpty;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * DTO cho request assign/reassign task (FR-4.5)
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class AssignTaskRequest {

    @NotEmpty(message = "Danh sách assignee không được để trống")
    private List<Long> assigneeIds; // Danh sách user IDs cần assign

    // Optional: có thể thêm message khi assign
    private String message;
}