package com.example.backend.dto.task.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

/**
 * DTO cho request tạo task mới (FR-4.1)
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreateTaskRequest {

    @NotNull(message = "Project ID không được để trống")
    private Long projectId;

    @NotBlank(message = "Title không được để trống")
    private String title;

    private String description;

    private String priority = "MEDIUM"; // LOW, MEDIUM, HIGH, URGENT

    private LocalDate dueDate;

    private List<Long> assigneeIds; // Danh sách user IDs được assign

    private List<Long> labelIds; // Danh sách label IDs

    private BigDecimal estimatedHours; // Ước tính số giờ làm
}