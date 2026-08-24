package com.example.backend.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import java.time.LocalDateTime;

@Entity
@Table(name = "task_assignees",
        uniqueConstraints = {
                @UniqueConstraint(name = "uk_task_user", columnNames = {"task_id", "user_id"})
        },
        indexes = {
                @Index(name = "idx_task_id", columnList = "task_id"),
                @Index(name = "idx_user_id", columnList = "user_id")
        })
@Data
@NoArgsConstructor
@AllArgsConstructor
public class TaskAssignee {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "task_id", nullable = false,
            foreignKey = @ForeignKey(name = "fk_task_assignees_task"))
    private Task task;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false,
            foreignKey = @ForeignKey(name = "fk_task_assignees_user"))
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "assigned_by", nullable = false,
            foreignKey = @ForeignKey(name = "fk_task_assignees_assigned_by"))
    private User assignedBy;

    @CreationTimestamp
    @Column(name = "assigned_at", nullable = false, updatable = false)
    private LocalDateTime assignedAt;
}