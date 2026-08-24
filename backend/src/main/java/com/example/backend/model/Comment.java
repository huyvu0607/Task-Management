package com.example.backend.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.Fetch;
import org.hibernate.annotations.FetchMode;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "comments", indexes = {
        @Index(name = "idx_task_id", columnList = "task_id"),
        @Index(name = "idx_user_id", columnList = "user_id"),
        @Index(name = "idx_created_at", columnList = "created_at")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Comment {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "task_id", nullable = false,
            foreignKey = @ForeignKey(name = "fk_comments_task"))
    private Task task;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false,
            foreignKey = @ForeignKey(name = "fk_comments_user"))
    private User user;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String content;

    @Column(name = "is_edited", nullable = false)
    private Boolean isEdited = false;

    @Column(name = "edited_at")
    private LocalDateTime editedAt;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    // ========== RELATIONSHIPS MỚI ==========

    /**
     * Danh sách attachments trong comment này
     * FR-6.4: Attach files to comment
     * ✅ FIX: Thêm @Fetch(FetchMode.SUBSELECT) để tránh MultipleBagFetchException
     */
    @OneToMany(mappedBy = "comment", fetch = FetchType.LAZY, cascade = CascadeType.ALL)
    @Fetch(FetchMode.SUBSELECT)  // ← THÊM DÒNG NÀY
    private List<Attachment> attachments = new ArrayList<>();

    /**
     * Danh sách mentions trong comment này
     * FR-6.2: Mention user trong comment
     * ✅ FIX: Thêm @Fetch(FetchMode.SUBSELECT) để tránh MultipleBagFetchException
     */
    @OneToMany(mappedBy = "comment", fetch = FetchType.LAZY,
            cascade = CascadeType.ALL, orphanRemoval = true)
    @Fetch(FetchMode.SUBSELECT)  // ← THÊM DÒNG NÀY
    private List<CommentMention> mentions = new ArrayList<>();

    // ========== HELPER METHODS ==========

    /**
     * Thêm attachment vào comment
     */
    public void addAttachment(Attachment attachment) {
        attachments.add(attachment);
        attachment.setComment(this);
    }

    /**
     * Xóa attachment khỏi comment
     */
    public void removeAttachment(Attachment attachment) {
        attachments.remove(attachment);
        attachment.setComment(null);
    }

    /**
     * Thêm mention vào comment
     */
    public void addMention(CommentMention mention) {
        mentions.add(mention);
        mention.setComment(this);
    }

    /**
     * Xóa mention khỏi comment
     */
    public void removeMention(CommentMention mention) {
        mentions.remove(mention);
        mention.setComment(null);
    }

    /**
     * Đếm số attachment (transient - không lưu DB)
     */
    @Transient
    public int getAttachmentCount() {
        return attachments != null ? attachments.size() : 0;
    }

    /**
     * Đếm số mention (transient - không lưu DB)
     */
    @Transient
    public int getMentionCount() {
        return mentions != null ? mentions.size() : 0;
    }
}