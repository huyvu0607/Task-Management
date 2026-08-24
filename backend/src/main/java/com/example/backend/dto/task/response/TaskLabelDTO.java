package com.example.backend.dto.task.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO cho label của task
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TaskLabelDTO {

    private Long id; // Label ID
    private String name;
    private String color; // Hex color code (#FF5733)
}