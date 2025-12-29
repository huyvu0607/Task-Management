package com.example.backend.dto.project.request;

import com.example.backend.model.Project;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Request DTO để filter và sort projects
 * FR-3.2: Xem danh sách projects với filters
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProjectFilterRequest {

    // Filter by status
    private Project.ProjectStatus status;

    // Search by name
    private String search;

    // Filter by owner
    private Long ownerId;

    // Filter by progress range
    private Integer minProgress; // 0-100
    private Integer maxProgress; // 0-100

    // Sort options
    private String sortBy; // "name", "createdAt", "progress", "endDate"
    private String sortDirection; // "asc", "desc"

    // Pagination
    private Integer page = 0;
    private Integer size = 20;

    /**
     * Get sort field với default value
     */
    public String getSortBy() {
        if (sortBy == null || sortBy.trim().isEmpty()) {
            return "createdAt"; // Default sort by creation date
        }
        return sortBy;
    }

    /**
     * Get sort direction với default value
     */
    public String getSortDirection() {
        if (sortDirection == null || sortDirection.trim().isEmpty()) {
            return "desc"; // Default descending
        }
        return sortDirection.toLowerCase();
    }

    /**
     * Validate pagination parameters
     */
    public void validatePagination() {
        if (page == null || page < 0) {
            page = 0;
        }
        if (size == null || size < 1) {
            size = 20;
        }
        if (size > 100) {
            size = 100; // Max 100 items per page
        }
    }

    /**
     * Validate progress range
     */
    public void validateProgressRange() {
        if (minProgress != null && minProgress < 0) {
            minProgress = 0;
        }
        if (maxProgress != null && maxProgress > 100) {
            maxProgress = 100;
        }
        if (minProgress != null && maxProgress != null && minProgress > maxProgress) {
            // Swap nếu min > max
            Integer temp = minProgress;
            minProgress = maxProgress;
            maxProgress = temp;
        }
    }
}