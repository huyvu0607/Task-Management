package com.example.backend.dto.task.request;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

/**
 * DTO cho request cập nhật task (FR-4.3)
 * Tất cả fields đều optional - chỉ update field nào có value
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class UpdateTaskRequest {

    private String title;

    private String description;

    private String status; // TODO, IN_PROGRESS, DONE

    private String priority; // LOW, MEDIUM, HIGH, URGENT

    private LocalDate dueDate;

    private List<Long> assigneeIds; // Cập nhật danh sách assignees

    private List<Long> labelIds; // Cập nhật danh sách labels

    private BigDecimal estimatedHours;

    private BigDecimal actualHours; // Số giờ thực tế đã làm
}