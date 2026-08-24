package com.example.backend.service.impl;

import com.example.backend.dto.dashboard.UserSimpleDTO;
import com.example.backend.dto.notification.response.NotificationResponse;
import com.example.backend.dto.response.PageResponse;
import com.example.backend.exception.BusinessException;
import com.example.backend.model.*;
import com.example.backend.repository.NotificationRepository;
import com.example.backend.repository.TaskAssigneeRepository;
import com.example.backend.service.IEmailService;
import com.example.backend.service.INotificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

/**
 * Implementation của NotificationService
 */
@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class NotificationServiceImpl implements INotificationService {

    private final NotificationRepository notificationRepository;
    private final TaskAssigneeRepository taskAssigneeRepository;
    private final IEmailService IEmailService;

    // ========== MENTION NOTIFICATIONS ==========

    @Override
    @Async
    public void createMentionNotification(User mentionedUser, Comment comment, User mentionedBy) {
        log.info("📨 Tạo mention notification cho user: {}", mentionedUser.getUsername());

        // Không tạo notification nếu user mention chính mình
        if (mentionedUser.getId().equals(mentionedBy.getId())) {
            log.debug("User mention chính mình, skip notification");
            return;
        }

        // Check duplicate notification (tránh spam)
        boolean exists = notificationRepository.existsSimilarNotification(
                mentionedUser.getId(),
                "MENTION",
                comment.getTask().getId(),
                mentionedBy.getId(),
                LocalDateTime.now().minusMinutes(5) // Trong 5 phút gần đây
        );

        if (exists) {
            log.debug("Notification tương tự đã tồn tại, skip");
            return;
        }

        // Tạo notification
        Notification notification = new Notification();
        notification.setUser(mentionedUser);
        notification.setType("MENTION");
        notification.setTitle("Bạn được mention trong comment");
        notification.setMessage(String.format(
                "%s đã mention bạn trong comment: \"%s\"",
                mentionedBy.getFullName(),
                truncateText(comment.getContent(), 100)
        ));
        notification.setRelatedTask(comment.getTask());
        notification.setRelatedUser(mentionedBy);
        notification.setIsRead(false);
        notification.setLinkUrl("/tasks/" + comment.getTask().getId());
        notification.setExpiresAt(LocalDateTime.now().plusDays(30)); // Hết hạn sau 30 ngày

        notificationRepository.save(notification);
        log.info("✅ Đã tạo mention notification ID: {}", notification.getId());

        // Gửi email notification (async)
        sendMentionEmail(mentionedUser, comment, mentionedBy);
    }

    @Override
    @Async
    public void createMentionNotifications(List<User> mentionedUsers, Comment comment, User mentionedBy) {
        log.info("📨 Tạo mention notifications cho {} users", mentionedUsers.size());

        for (User user : mentionedUsers) {
            try {
                createMentionNotification(user, comment, mentionedBy);
            } catch (Exception e) {
                log.error("❌ Lỗi tạo notification cho user {}: {}", user.getUsername(), e.getMessage());
            }
        }
    }

    // ========== COMMENT NOTIFICATIONS ==========

    @Override
    @Async
    public void createNewCommentNotification(Comment comment, Task task) {
        log.info("📨 Tạo new comment notification cho task: {}", task.getId());

        // Lấy danh sách assignees của task
        List<TaskAssignee> taskAssignees = taskAssigneeRepository.findByTaskId(task.getId());
        List<User> assignees = taskAssignees.stream()
                .map(TaskAssignee::getUser)
                .collect(Collectors.toList());

        if (assignees.isEmpty()) {
            log.debug("Task không có assignees, skip notification");
            return;
        }

        User commenter = comment.getUser();

        for (User assignee : assignees) {
            // Không tạo notification cho chính người comment
            if (assignee.getId().equals(commenter.getId())) {
                continue;
            }

            // Check duplicate
            boolean exists = notificationRepository.existsSimilarNotification(
                    assignee.getId(),
                    "NEW_COMMENT",
                    task.getId(),
                    commenter.getId(),
                    LocalDateTime.now().minusMinutes(5)
            );

            if (exists) {
                continue;
            }

            // Tạo notification
            Notification notification = new Notification();
            notification.setUser(assignee);
            notification.setType("NEW_COMMENT");
            notification.setTitle("Comment mới trên task của bạn");
            notification.setMessage(String.format(
                    "%s đã comment trên task \"%s\": %s",
                    commenter.getFullName(),
                    task.getTitle(),
                    truncateText(comment.getContent(), 100)
            ));
            notification.setRelatedTask(task);
            notification.setRelatedUser(commenter);
            notification.setIsRead(false);
            notification.setLinkUrl("/tasks/" + task.getId());
            notification.setExpiresAt(LocalDateTime.now().plusDays(30));

            notificationRepository.save(notification);
            log.debug("✅ Tạo notification cho assignee: {}", assignee.getUsername());
        }
    }

    @Override
    @Async
    public void createCommentEditedNotification(Comment comment) {
        // Optional: Implement nếu cần thông báo khi edit
        log.debug("Comment edited notification (not implemented)");
    }

    // ========== CRUD OPERATIONS ==========

    @Override
    @Transactional(readOnly = true)
    public PageResponse<NotificationResponse> getUserNotifications(Long userId, Pageable pageable) {
        log.info("📋 Lấy notifications cho user: {}", userId);

        // Lấy Page từ repository
        Page<Notification> notificationPage = notificationRepository.findByUserId(userId, pageable);

        // Convert entities sang DTOs
        Page<NotificationResponse> responsePage = notificationPage.map(this::mapToResponse);

        // Convert Spring's Page sang PageResponse
        return PageResponse.from(responsePage);
    }

    @Override
    @Transactional(readOnly = true)
    public List<NotificationResponse> getUnreadNotifications(Long userId) {
        log.info("📋 Lấy unread notifications cho user: {}", userId);

        List<Notification> notifications = notificationRepository.findUnreadByUserId(userId);

        return notifications.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public Long countUnreadNotifications(Long userId) {
        return notificationRepository.countUnreadByUserId(userId);
    }

    @Override
    @Transactional(readOnly = true)
    public NotificationResponse getNotificationById(Long notificationId, Long userId) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new BusinessException("Notification không tồn tại"));

        // Check ownership
        if (!notification.getUser().getId().equals(userId)) {
            throw new BusinessException("Bạn không có quyền xem notification này");
        }

        return mapToResponse(notification);
    }

    @Override
    public void markAsRead(Long notificationId, Long userId) {
        log.info("✅ Đánh dấu notification {} đã đọc", notificationId);

        int updated = notificationRepository.markAsRead(
                notificationId,
                userId,
                LocalDateTime.now()
        );

        if (updated == 0) {
            throw new BusinessException("Không thể đánh dấu notification");
        }
    }

    @Override
    public void markAllAsRead(Long userId) {
        log.info("✅ Đánh dấu tất cả notifications đã đọc cho user: {}", userId);

        int updated = notificationRepository.markAllAsRead(userId, LocalDateTime.now());
        log.info("✅ Đã đánh dấu {} notifications", updated);
    }

    @Override
    public void deleteNotification(Long notificationId, Long userId) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new BusinessException("Notification không tồn tại"));

        // Check ownership
        if (!notification.getUser().getId().equals(userId)) {
            throw new BusinessException("Bạn không có quyền xóa notification này");
        }

        notificationRepository.delete(notification);
        log.info("🗑️ Đã xóa notification ID: {}", notificationId);
    }

    @Override
    public void deleteAllReadNotifications(Long userId) {
        List<Notification> readNotifications = notificationRepository.findByUserId(userId, Pageable.unpaged())
                .getContent()
                .stream()
                .filter(Notification::getIsRead)
                .collect(Collectors.toList());

        notificationRepository.deleteAll(readNotifications);
        log.info("🗑️ Đã xóa {} notifications đã đọc", readNotifications.size());
    }

    // ========== CLEANUP ==========

    @Override
    public void cleanupOldNotifications() {
        log.info("🧹 Cleanup old notifications...");

        LocalDateTime cutoffDate = LocalDateTime.now().minusDays(30);
        int deleted = notificationRepository.deleteOldReadNotifications(cutoffDate);

        log.info("✅ Đã xóa {} notifications cũ", deleted);
    }

    @Override
    public void deleteExpiredNotifications() {
        log.info("🧹 Xóa expired notifications...");

        int deleted = notificationRepository.deleteExpiredNotifications(LocalDateTime.now());
        log.info("✅ Đã xóa {} notifications hết hạn", deleted);
    }

    // ========== HELPER METHODS ==========

    /**
     * Map Notification entity sang NotificationResponse DTO
     */
    private NotificationResponse mapToResponse(Notification notification) {
        NotificationResponse response = NotificationResponse.builder()
                .id(notification.getId())
                .type(notification.getType())
                .title(notification.getTitle())
                .message(notification.getMessage())
                .isRead(notification.getIsRead())
                .readAt(notification.getReadAt())
                .linkUrl(notification.getLinkUrl())
                .createdAt(notification.getCreatedAt())
                .expiresAt(notification.getExpiresAt())
                .build();

        // Related Task
        if (notification.getRelatedTask() != null) {
            response.setRelatedTaskId(notification.getRelatedTask().getId());
            response.setRelatedTaskTitle(notification.getRelatedTask().getTitle());

            // Related Project
            if (notification.getRelatedTask().getProject() != null) {
                response.setRelatedProjectId(notification.getRelatedTask().getProject().getId());
                response.setRelatedProjectName(notification.getRelatedTask().getProject().getName());
            }
        }

        // Related User
        if (notification.getRelatedUser() != null) {
            User relatedUser = notification.getRelatedUser();
            response.setRelatedUser(UserSimpleDTO.builder()
                    .id(relatedUser.getId())
                    .username(relatedUser.getUsername())
                    .fullName(relatedUser.getFullName())
                    .avatarUrl(relatedUser.getAvatarUrl())
                    .build());
        }

        return response;
    }

    /**
     * Cắt text về độ dài tối đa
     */
    private String truncateText(String text, int maxLength) {
        if (text == null) return "";
        if (text.length() <= maxLength) return text;
        return text.substring(0, maxLength) + "...";
    }

    /**
     * Gửi email mention notification
     */
    @Async
    private void sendMentionEmail(User mentionedUser, Comment comment, User mentionedBy) {
        try {
            // TODO: Tạo email template cho mention notification
            // Tạm thời dùng plain text
            String subject = "Bạn được mention trong comment - TeamFlow";
            String content = String.format(
                    "Xin chào %s,\n\n" +
                            "%s đã mention bạn trong comment:\n\n" +
                            "\"%s\"\n\n" +
                            "Task: %s\n" +
                            "Xem chi tiết tại: %s\n\n" +
                            "Trân trọng,\n" +
                            "TeamFlow",
                    mentionedUser.getFullName(),
                    mentionedBy.getFullName(),
                    truncateText(comment.getContent(), 200),
                    comment.getTask().getTitle(),
                    "http://localhost:5173/tasks/" + comment.getTask().getId()
            );

            IEmailService.sendTextEmail(mentionedUser.getEmail(), subject, content);
            log.info("📧 Đã gửi mention email đến: {}", mentionedUser.getEmail());

        } catch (Exception e) {
            log.error("❌ Lỗi gửi mention email: {}", e.getMessage());
        }
    }
}