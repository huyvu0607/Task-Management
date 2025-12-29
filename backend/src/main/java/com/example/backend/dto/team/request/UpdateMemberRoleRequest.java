package com.example.backend.dto.team.request;

import com.example.backend.model.TeamMember.TeamRole;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UpdateMemberRoleRequest {

    @NotNull(message = "Role is required")
    private TeamRole role; // ADMIN, MEMBER, VIEWER
}