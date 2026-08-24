package com.example.backend.service;

import com.example.backend.dto.notification.response.NotificationResponse;
import com.example.backend.dto.response.PageResponse;
import com.example.backend.model.Comment;
import com.example.backend.model.Task;
import com.example.backend.model.User;
import org.springframework.data.domain.Pageable;

import java.util.List;

/**
 * Service interface cho Notification
 * Quản lý thông báo cho users
 */
public interface INotificationService {

    // ========== MENTION NOTIFICATIONS ==========

    /**
     * Tạo notification khi user được mention trong comment
     * FR-6.2: User được mention nhận notification
     *
     * @param mentionedUser User được mention
     * @param comment Comment chứa mention
     * @param mentionedBy User tạo mention (người tag)
     */
    void createMentionNotification(User mentionedUser, Comment comment, User mentionedBy);

    /**
     * Tạo notification cho nhiều users được mention
     *
     * @param mentionedUsers Danh sách users được mention
     * @param comment Comment chứa mentions
     * @param mentionedBy User tạo mentions
     */
    void createMentionNotifications(List<User> mentionedUsers, Comment comment, User mentionedBy);

    // ========== COMMENT NOTIFICATIONS ==========

    /**
     * Tạo notification khi có comment mới trên task
     * FR-6.1: Assignees nhận notification khi có comment mới
     *
     * @param comment Comment mới
     * @param task Task chứa comment
     */
    void createNewCommentNotification(Comment comment, Task task);

    /**
     * Tạo notification khi comment được edit
     * (Optional - nếu cần thông báo khi edit)
     *
     * @param comment Comment đã edit
     */
    void createCommentEditedNotification(Comment comment);

    // ========== CRUD OPERATIONS ==========

    /**
     * Lấy tất cả notifications của user (có phân trang)
     * ✅ RETURN: PageResponse thay vì Page
     *
     * @param userId ID của user
     * @param pageable Pagination
     * @return PageResponse notifications
     */
    PageResponse<NotificationResponse> getUserNotifications(Long userId, Pageable pageable);

    /**
     * Lấy notifications chưa đọc của user
     *
     * @param userId ID của user
     * @return List unread notifications
     */
    List<NotificationResponse> getUnreadNotifications(Long userId);

    /**
     * Đếm số notifications chưa đọc
     *
     * @param userId ID của user
     * @return Số lượng unread notifications
     */
    Long countUnreadNotifications(Long userId);

    /**
     * Lấy notification by ID
     *
     * @param notificationId ID của notification
     * @param userId ID của user (để check ownership)
     * @return NotificationResponse
     */
    NotificationResponse getNotificationById(Long notificationId, Long userId);

    /**
     * Đánh dấu notification đã đọc
     *
     * @param notificationId ID của notification
     * @param userId ID của user
     */
    void markAsRead(Long notificationId, Long userId);

    /**
     * Đánh dấu tất cả notifications đã đọc
     *
     * @param userId ID của user
     */
    void markAllAsRead(Long userId);

    /**
     * Xóa notification
     *
     * @param notificationId ID của notification
     * @param userId ID của user (để check ownership)
     */
    void deleteNotification(Long notificationId, Long userId);

    /**
     * Xóa tất cả notifications đã đọc
     *
     * @param userId ID của user
     */
    void deleteAllReadNotifications(Long userId);

    // ========== CLEANUP ==========

    /**
     * Cleanup notifications cũ (chạy định kỳ)
     * Xóa notifications đã đọc và quá 30 ngày
     */
    void cleanupOldNotifications();

    /**
     * Xóa notifications đã hết hạn
     */
    void deleteExpiredNotifications();
}