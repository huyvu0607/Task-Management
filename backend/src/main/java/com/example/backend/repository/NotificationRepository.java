package com.example.backend.repository;

import com.example.backend.model.Notification;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Repository cho Notification
 * Quản lý thông báo cho users
 */
@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {

    /**
     * Lấy tất cả notifications của một user (có phân trang)
     * Use case: Notification page
     */
    @Query("SELECT n FROM Notification n " +
            "WHERE n.user.id = :userId " +
            "ORDER BY n.createdAt DESC")
    Page<Notification> findByUserId(@Param("userId") Long userId, Pageable pageable);

    /**
     * Lấy notifications chưa đọc của user
     * Use case: Unread notifications badge
     */
    @Query("SELECT n FROM Notification n " +
            "WHERE n.user.id = :userId " +
            "AND n.isRead = false " +
            "ORDER BY n.createdAt DESC")
    List<Notification> findUnreadByUserId(@Param("userId") Long userId);

    /**
     * Đếm số notifications chưa đọc
     * Use case: Badge count (số đỏ trên icon notification)
     */
    @Query("SELECT COUNT(n) FROM Notification n " +
            "WHERE n.user.id = :userId " +
            "AND n.isRead = false")
    Long countUnreadByUserId(@Param("userId") Long userId);

    /**
     * Lấy notifications theo type
     * Use case: Filter notifications by type (MENTION, COMMENT, TASK_ASSIGNED, etc.)
     */
    @Query("SELECT n FROM Notification n " +
            "WHERE n.user.id = :userId " +
            "AND n.type = :type " +
            "ORDER BY n.createdAt DESC")
    List<Notification> findByUserIdAndType(
            @Param("userId") Long userId,
            @Param("type") String type
    );

    /**
     * Đánh dấu một notification đã đọc
     * Use case: User click vào notification
     */
    @Modifying
    @Query("UPDATE Notification n " +
            "SET n.isRead = true, n.readAt = :readAt " +
            "WHERE n.id = :notificationId " +
            "AND n.user.id = :userId")
    int markAsRead(
            @Param("notificationId") Long notificationId,
            @Param("userId") Long userId,
            @Param("readAt") LocalDateTime readAt
    );

    /**
     * Đánh dấu tất cả notifications đã đọc
     * Use case: "Mark all as read" button
     */
    @Modifying
    @Query("UPDATE Notification n " +
            "SET n.isRead = true, n.readAt = :readAt " +
            "WHERE n.user.id = :userId " +
            "AND n.isRead = false")
    int markAllAsRead(
            @Param("userId") Long userId,
            @Param("readAt") LocalDateTime readAt
    );

    /**
     * Xóa notifications đã đọc và quá cũ
     * Use case: Cleanup job (chạy định kỳ để dọn dẹp notifications cũ)
     */
    @Modifying
    @Query("DELETE FROM Notification n " +
            "WHERE n.isRead = true " +
            "AND n.createdAt < :beforeDate")
    int deleteOldReadNotifications(@Param("beforeDate") LocalDateTime beforeDate);

    /**
     * Xóa notifications đã hết hạn
     * Use case: Cleanup expired notifications
     */
    @Modifying
    @Query("DELETE FROM Notification n " +
            "WHERE n.expiresAt IS NOT NULL " +
            "AND n.expiresAt < :now")
    int deleteExpiredNotifications(@Param("now") LocalDateTime now);

    /**
     * Lấy notifications liên quan đến một task
     * Use case: Hiển thị notifications history của task
     */
    @Query("SELECT n FROM Notification n " +
            "WHERE n.relatedTask.id = :taskId " +
            "ORDER BY n.createdAt DESC")
    List<Notification> findByRelatedTaskId(@Param("taskId") Long taskId);

    /**
     * Kiểm tra đã có notification tương tự chưa (để tránh spam)
     * Use case: Tránh tạo duplicate notifications
     */
    @Query("SELECT CASE WHEN COUNT(n) > 0 THEN true ELSE false END " +
            "FROM Notification n " +
            "WHERE n.user.id = :userId " +
            "AND n.type = :type " +
            "AND n.relatedTask.id = :taskId " +
            "AND n.relatedUser.id = :relatedUserId " +
            "AND n.createdAt > :since")
    boolean existsSimilarNotification(
            @Param("userId") Long userId,
            @Param("type") String type,
            @Param("taskId") Long taskId,
            @Param("relatedUserId") Long relatedUserId,
            @Param("since") LocalDateTime since
    );

    /**
     * Lấy notifications gần đây (giới hạn)
     * Use case: Notification dropdown/popup
     */
    @Query("SELECT n FROM Notification n " +
            "WHERE n.user.id = :userId " +
            "ORDER BY n.createdAt DESC")
    Page<Notification> findRecentByUserId(
            @Param("userId") Long userId,
            Pageable pageable
    );
}