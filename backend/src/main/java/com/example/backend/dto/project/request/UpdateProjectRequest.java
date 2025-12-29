package com.example.backend.dto.project.request;

import com.example.backend.model.Project;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

/**
 * Request DTO để cập nhật project
 * FR-3.3: Cập nhật project
 *
 * Tất cả fields đều optional - chỉ update fields được gửi lên
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UpdateProjectRequest {

    @Size(min = 3, max = 150, message = "Project name must be between 3 and 150 characters")
    private String name;

    @Size(max = 5000, message = "Description must not exceed 5000 characters")
    private String description;

    private LocalDate startDate;

    private LocalDate endDate;

    private Project.ProjectStatus status;

    @Pattern(regexp = "^#([A-Fa-f0-9]{6})$", message = "Color must be a valid hex color (e.g., #FF5733)")
    private String color;

    /**
     * Check if có field nào được update không
     */
    public boolean hasUpdates() {
        return name != null
                || description != null
                || startDate != null
                || endDate != null
                || status != null
                || color != null;
    }

    /**
     * Custom validation: Nếu có cả startDate và endDate, endDate phải sau startDate
     */
    public boolean isValidDateRange() {
        if (startDate != null && endDate != null) {
            return endDate.isAfter(startDate);
        }
        return true; // Nếu chỉ update 1 field thì không cần validate
    }
}