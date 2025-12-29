package com.example.backend.dto.auth.response;

import com.example.backend.model.User;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * Response DTO cho thông tin profile user
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserProfileResponse {

    private Long id;
    private String username;
    private String email;
    private String fullName;
    private String avatarUrl;
    private String bio;
    private String timezone;
    private Boolean emailVerified;
    private LocalDateTime createdAt;
    private LocalDateTime lastLogin;
    private String phoneNumber;
    private String department;
    private String jobTitle;

    /**
     * Chuyển đổi từ User entity sang UserProfileResponse
     *
     * @param user User entity
     * @return UserProfileResponse
     */
    public static UserProfileResponse fromUser(User user) {
        return UserProfileResponse.builder()
                .id(user.getId())
                .username(user.getUsername())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .avatarUrl(user.getAvatarUrl())
                .bio(user.getBio())
                .timezone(user.getTimezone())
                .emailVerified(user.getEmailVerified())
                .createdAt(user.getCreatedAt())
                .lastLogin(user.getLastLogin())
                .phoneNumber(user.getPhoneNumber())
                .department(user.getDepartment())
                .jobTitle(user.getJobTitle())
                .build();
    }
}