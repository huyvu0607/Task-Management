package com.example.backend.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import java.time.LocalDateTime;

@Entity
@Table(name = "team_members",
        uniqueConstraints = {
                @UniqueConstraint(name = "uk_team_user", columnNames = {"team_id", "user_id"})
        },
        indexes = {
                @Index(name = "idx_team_id", columnList = "team_id"),
                @Index(name = "idx_user_id", columnList = "user_id"),
                @Index(name = "idx_role", columnList = "role")
        })
@Data
@NoArgsConstructor
@AllArgsConstructor
public class TeamMember {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "team_id", nullable = false,
            foreignKey = @ForeignKey(name = "fk_team_members_team"))
    private Team team;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false,
            foreignKey = @ForeignKey(name = "fk_team_members_user"))
    private User user;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 10)
    private TeamRole role = TeamRole.MEMBER;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "invited_by",
            foreignKey = @ForeignKey(name = "fk_team_members_invited_by"))
    private User invitedBy;

    @CreationTimestamp
    @Column(name = "joined_at", nullable = false, updatable = false)
    private LocalDateTime joinedAt;

    public enum TeamRole {
        ADMIN, MEMBER, VIEWER
    }
}