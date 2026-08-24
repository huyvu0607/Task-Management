package com.example.backend.dto.team.response;

import com.example.backend.model.TeamInvitation;
import com.example.backend.model.TeamMember.TeamRole;
import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TeamInvitationResponse {

    private Long id;
    private Long teamId;
    private String teamName;
    private String invitedEmail;
    private String invitedUserName; // Nullable nếu user chưa tồn tại
    private Long invitedUserId;
    private TeamRole role;
    private String inviterName;
    private Long inviterId;
    private String message;
    private TeamInvitation.InvitationStatus status;

    private String token;
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime expiresAt;

    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime createdAt;

    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime acceptedAt;
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime lastResentAt;
    private Boolean isExpired;
    private Boolean isValid;
}