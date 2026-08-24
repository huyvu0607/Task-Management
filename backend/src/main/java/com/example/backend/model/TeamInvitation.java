package com.example.backend.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import java.time.LocalDateTime;

@Entity
@Table(name = "team_invitations",
        uniqueConstraints = {
                @UniqueConstraint(name = "uk_team_email_pending",
                        columnNames = {"team_id", "invited_email", "status"})
        },
        indexes = {
                @Index(name = "idx_token", columnList = "token"),
                @Index(name = "idx_invited_email", columnList = "invited_email"),
                @Index(name = "idx_status", columnList = "status"),
                @Index(name = "idx_expires_at", columnList = "expires_at"),
                @Index(name = "idx_team_id", columnList = "team_id")
        })
@Data
@NoArgsConstructor
@AllArgsConstructor
public class TeamInvitation {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "team_id", nullable = false,
            foreignKey = @ForeignKey(name = "fk_team_invitations_team"))
    private Team team;

    @Column(name = "invited_email", nullable = false, length = 100)
    private String invitedEmail;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "invited_user_id",
            foreignKey = @ForeignKey(name = "fk_team_invitations_user"))
    private User invitedUser; // Nullable nếu user chưa tồn tại

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private TeamMember.TeamRole role = TeamMember.TeamRole.MEMBER;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "invited_by", nullable = false,
            foreignKey = @ForeignKey(name = "fk_team_invitations_invited_by"))
    private User invitedBy;

    @Column(nullable = false, unique = true, length = 100)
    private String token; // UUID để verify

    @Column(columnDefinition = "TEXT")
    private String message; // Lời nhắn từ inviter

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private InvitationStatus status = InvitationStatus.PENDING;

    @Column(name = "expires_at", nullable = false)
    private LocalDateTime expiresAt;

    @Column(name = "accepted_at")
    private LocalDateTime acceptedAt;

    @Column(name = "rejected_at")
    private LocalDateTime rejectedAt;

    @Column(name = "last_resent_at")
    private LocalDateTime lastResentAt;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    public enum InvitationStatus {
        PENDING,   // Chờ xác nhận
        ACCEPTED,  // Đã chấp nhận
        REJECTED,  // Đã từ chối
        EXPIRED,   // Hết hạn
        CANCELLED  // Bị hủy bởi admin
    }

    // Helper method để check expired
    public boolean isExpired() {
        return LocalDateTime.now().isAfter(expiresAt);
    }

    // Helper method để check còn valid không
    public boolean isValid() {
        return status == InvitationStatus.PENDING && !isExpired();
    }
}