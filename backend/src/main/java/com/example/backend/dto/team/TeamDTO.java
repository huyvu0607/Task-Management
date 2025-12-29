package com.example.backend.dto.team;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO ngắn gọn cho Team - dùng khi cần embed thông tin team vào các response khác
 * Ví dụ: trong ProjectResponse, TaskResponse, etc.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TeamDTO {

    private Long id;

    private String name;

    private String color;

    private Boolean isActive;
}