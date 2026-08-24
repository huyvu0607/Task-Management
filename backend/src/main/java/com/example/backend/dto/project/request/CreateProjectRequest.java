package com.example.backend.dto.project.request;

import com.example.backend.model.Project;
import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

/**
 * Request DTO để tạo project mới
 * FR-3.1: Tạo project
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateProjectRequest {

    @NotBlank(message = "Project name is required")
    @Size(min = 3, max = 150, message = "Project name must be between 3 and 150 characters")
    private String name;

    @Size(max = 5000, message = "Description must not exceed 5000 characters")
    private String description;

    @NotNull(message = "Team ID is required")
    private Long teamId;

    private LocalDate startDate;

    @NotNull(message = "End date is required")
    private LocalDate endDate;

    @Pattern(regexp = "^#([A-Fa-f0-9]{6})$", message = "Color must be a valid hex color (e.g., #FF5733)")
    private String color;

    private Project.ProjectStatus status;

    /**
     * Custom validation: End date phải sau start date
     */
    public boolean isValidDateRange() {
        if (startDate == null || endDate == null) {
            return false;
        }
        return endDate.isAfter(startDate);
    }
}