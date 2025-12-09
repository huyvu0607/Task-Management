package com.example.backend.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import java.time.LocalDateTime;

@Entity
@Table(name = "attachments", indexes = {
        @Index(name = "idx_task_id", columnList = "task_id"),
        @Index(name = "idx_comment_id", columnList = "comment_id"),
        @Index(name = "idx_uploaded_by", columnList = "uploaded_by")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Attachment {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "task_id",
            foreignKey = @ForeignKey(name = "fk_attachments_task"))
    private Task task;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "comment_id",
            foreignKey = @ForeignKey(name = "fk_attachments_comment"))
    private Comment comment;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "uploaded_by", nullable = false,
            foreignKey = @ForeignKey(name = "fk_attachments_uploaded_by"))
    private User uploadedBy;

    @Column(name = "file_name", nullable = false)
    private String fileName;

    @Column(name = "file_path", nullable = false, length = 500)
    private String filePath;

    @Column(name = "file_size", nullable = false)
    private Long fileSize;

    @Column(name = "file_type", length = 50)
    private String fileType;

    @Column(name = "mime_type", length = 100)
    private String mimeType;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
}