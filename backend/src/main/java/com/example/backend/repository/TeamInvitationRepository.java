package com.example.backend.repository;

import com.example.backend.model.TeamInvitation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface TeamInvitationRepository extends JpaRepository<TeamInvitation, Long> {

    Optional<TeamInvitation> findByToken(String token);

    boolean existsByTeamIdAndInvitedEmailAndStatus(
            Long teamId,
            String invitedEmail,
            TeamInvitation.InvitationStatus status
    );

    List<TeamInvitation> findByInvitedEmailAndStatus(
            String invitedEmail,
            TeamInvitation.InvitationStatus status
    );

    List<TeamInvitation> findByTeamIdAndStatus(
            Long teamId,
            TeamInvitation.InvitationStatus status
    );

    @Query("SELECT ti FROM TeamInvitation ti WHERE ti.status = :status AND ti.expiresAt < :now")
    List<TeamInvitation> findExpiredInvitations(
            @Param("status") TeamInvitation.InvitationStatus status,
            @Param("now") LocalDateTime now
    );

    // Count pending invitations for a team
    long countByTeamIdAndStatus(Long teamId, TeamInvitation.InvitationStatus status);

    // Get all invitations sent by a user
    List<TeamInvitation> findByInvitedById(Long inviterId);

    // Get all invitations for a specific user (by email or user_id)
    @Query("SELECT ti FROM TeamInvitation ti WHERE " +
            "(ti.invitedEmail = :email OR ti.invitedUser.id = :userId) " +
            "AND ti.status = :status")
    List<TeamInvitation> findUserInvitations(
            @Param("email") String email,
            @Param("userId") Long userId,
            @Param("status") TeamInvitation.InvitationStatus status
    );
}