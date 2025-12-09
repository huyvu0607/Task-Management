package com.example.backend.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import java.time.LocalDateTime;

@Entity
@Table(name = "task_labels",
        uniqueConstraints = {
                @UniqueConstraint(name = "uk_task_label", columnNames = {"task_id", "label_id"})
        },
        indexes = {
                @Index(name = "idx_task_id", columnList = "task_id"),
                @Index(name = "idx_label_id", columnList = "label_id")
        })
@Data
@NoArgsConstructor
@AllArgsConstructor
public class TaskLabel {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "task_id", nullable = false,
            foreignKey = @ForeignKey(name = "fk_task_labels_task"))
    private Task task;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "label_id", nullable = false,
            foreignKey = @ForeignKey(name = "fk_task_labels_label"))
    private Label label;

    @CreationTimestamp
    @Column(name = "added_at", nullable = false, updatable = false)
    private LocalDateTime addedAt;
}