package com.example.backend.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

/**
 * Entity cho việc mention user trong comment
 * Lưu lại ai được mention bởi ai trong comment nào
 */
@Entity
@Table(name = "comment_mentions", indexes = {
        @Index(name = "idx_comment_id", columnList = "comment_id"),
        @Index(name = "idx_mentioned_user_id", columnList = "mentioned_user_id"),
        @Index(name = "idx_created_at", columnList = "created_at")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
public class CommentMention {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * Comment chứa mention này
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "comment_id", nullable = false,
            foreignKey = @ForeignKey(name = "fk_comment_mentions_comment"))
    private Comment comment;

    /**
     * User được mention (người được tag)
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "mentioned_user_id", nullable = false,
            foreignKey = @ForeignKey(name = "fk_comment_mentions_mentioned_user"))
    private User mentionedUser;

    /**
     * User tạo mention (người tag) - lấy từ comment.user
     * Không cần lưu riêng vì có thể query từ comment
     */

    /**
     * Thời gian tạo mention
     */
    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    /**
     * Constructor tiện lợi
     */
    public CommentMention(Comment comment, User mentionedUser) {
        this.comment = comment;
        this.mentionedUser = mentionedUser;
    }
}