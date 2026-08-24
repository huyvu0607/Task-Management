package com.example.backend.dto.comment.response;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * Response DTO cho Mention
 * FR-6.2: Mention user trong comment
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MentionResponse {

    /**
     * ID của mention
     */
    private Long id;

    /**
     * ID của user được mention
     */
    private Long userId;

    /**
     * Username của user được mention
     */
    private String username;

    /**
     * Full name của user được mention
     */
    private String fullName;

    /**
     * Avatar của user được mention
     */
    private String avatarUrl;

    /**
     * Thời gian mention
     */
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime createdAt;
}