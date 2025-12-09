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

    public enum TaskStatus {
        TODO, IN_PROGRESS, DONE
    }

    public enum TaskPriority {
        LOW, MEDIUM, HIGH, URGENT
    }
}