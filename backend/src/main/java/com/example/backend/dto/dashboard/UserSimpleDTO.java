package com.example.backend.dto.dashboard;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO đơn giản cho User info
 * Dùng để hiển thị assignee trong task list
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserSimpleDTO {
    private Long id;
    private String username;
    private String fullName;
    private String email;
    private String avatarUrl;
}