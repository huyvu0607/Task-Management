package com.example.backend.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "tasks", indexes = {
        @Index(name = "idx_project_id", columnList = "project_id"),
        @Index(name = "idx_status", columnList = "status"),
        @Index(name = "idx_priority", columnList = "priority"),
        @Index(name = "idx_due_date", columnList = "due_date"),
        @Index(name = "idx_created_by", columnList = "created_by"),
        @Index(name = "idx_project_status", columnList = "project_id, status"),
        @Index(name = "idx_status_priority", columnList = "status, priority")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Task {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "project_id", nullable = false,
            foreignKey = @ForeignKey(name = "fk_tasks_project"))
    private Project project;

    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private TaskStatus status = TaskStatus.TODO;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 10)
    private TaskPriority priority = TaskPriority.MEDIUM;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by", nullable = false,
            foreignKey = @ForeignKey(name = "fk_tasks_created_by"))
    private User createdBy;

    @Column(name = "due_date")
    private LocalDate dueDate;

    @Column(name = "completed_at")
    private LocalDateTime completedAt;

    @Column(nullable = false)
    private Integer position = 0;

    @Column(name = "estimated_hours", precision = 6, scale = 2)
    private BigDecimal estimatedHours;

    @Column(name = "actual_hours", precision = 6, scale = 2)
    private BigDecimal actualHours;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    // ========== RELATIONSHIPS MỚI ==========

    /**
     * Danh sách comments trên task này
     * FR-6.1: Thêm comment
     */
    @OneToMany(mappedBy = "task", fetch = FetchType.LAZY, cascade = CascadeType.ALL)
    private List<Comment> comments = new ArrayList<>();

    /**
     * Danh sách attachments trên task này
     * FR-6.4: Attach files to task
     */
    @OneToMany(mappedBy = "task", fetch = FetchType.LAZY, cascade = CascadeType.ALL)
    private List<Attachment> attachments = new ArrayList<>();

    // ========== HELPER METHODS ==========

    /**
     * Thêm comment vào task
     */
    public void addComment(Comment comment) {
        comments.add(comment);
        comment.setTask(this);
    }

    /**
     * Xóa comment khỏi task
     */
    public void removeComment(Comment comment) {
        comments.remove(comment);
        comment.setTask(null);
    }

    /**
     * Thêm attachment vào task
     */
    public void addAttachment(Attachment attachment) {
        attachments.add(attachment);
        attachment.setTask(this);
    }

    /**
     * Xóa attachment khỏi task
     */
    public void removeAttachment(Attachment attachment) {
        attachments.remove(attachment);
        attachment.setTask(null);
    }

    /**
     * Đếm số comments (transient - không lưu DB)
     */
    @Transient
    public int getCommentCount() {
        return comments != null ? comments.size() : 0;
    }

    /**
     * Đếm số attachments (transient - không lưu DB)
     */
    @Transient
    public int getAttachmentCount() {
        return attachments != null ? attachments.size() : 0;
    }

    // ========== ENUMS ==========

    public enum TaskStatus {
        TODO, IN_PROGRESS, DONE
    }

    public enum TaskPriority {
        LOW, MEDIUM, HIGH, URGENT
    }
}