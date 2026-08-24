package com.example.backend.dto.notification.response;

import com.example.backend.dto.dashboard.UserSimpleDTO;
import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * Response DTO cho Notification
 * Dùng cho mention notifications và các loại notification khác
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class NotificationResponse {

    /**
     * ID của notification
     */
    private Long id;

    /**
     * Loại notification
     * Examples: "MENTION", "COMMENT", "TASK_ASSIGNED", "TASK_COMPLETED"
     */
    private String type;

    /**
     * Tiêu đề notification
     */
    private String title;

    /**
     * Nội dung chi tiết
     */
    private String message;

    /**
     * ID của task liên quan (nếu có)
     */
    private Long relatedTaskId;

    /**
     * Tên task liên quan (để hiển thị)
     */
    private String relatedTaskTitle;

    /**
     * ID của project liên quan (nếu có)
     */
    private Long relatedProjectId;

    /**
     * Tên project liên quan
     */
    private String relatedProjectName;

    /**
     * User liên quan (người tạo action)
     * Example: User mention bạn, user assign task cho bạn
     */
    private UserSimpleDTO relatedUser;

    /**
     * URL để redirect khi click vào notification
     * Example: "/tasks/123", "/projects/456"
     */
    private String linkUrl;

    /**
     * Đã đọc chưa
     */
    private Boolean isRead;

    /**
     * Thời gian đọc
     */
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime readAt;

    /**
     * Thời gian tạo
     */
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime createdAt;

    /**
     * Thời gian hết hạn (nếu có)
     */
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime expiresAt;

    /**
     * Thời gian tương đối (để hiển thị UX)
     * Example: "2 hours ago", "just now", "yesterday"
     * Sẽ được tính ở frontend hoặc service layer
     */
    private String timeAgo;
}