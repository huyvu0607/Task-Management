package com.example.backend.dto.team.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UpdateTeamRequest {

    @NotBlank(message = "Team name is required")
    @Size(min = 3, max = 100, message = "Team name must be between 3 and 100 characters")
    private String name;

    @Size(max = 1000, message = "Description must not exceed 1000 characters")
    private String description;

    @Size(max = 7, message = "Color must be in hex format (#RRGGBB)")
    private String color;

    @NotNull(message = "Active status is required")
    private Boolean isActive;

    private Integer maxMembers; // Admin có thể tăng giới hạn members
}