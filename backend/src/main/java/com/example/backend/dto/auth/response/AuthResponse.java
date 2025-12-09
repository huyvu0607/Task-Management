package com.example.backend.dto.auth.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AuthResponse {

    private String token;
    private String type = "Bearer";
    private Long userId;
    private String username;
    private String email;
    private String fullName;
    private String avatarUrl;

    public AuthResponse(String token, Long userId, String username, String email, String fullName, String avatarUrl) {
        this.token = token;
        this.userId = userId;
        this.username = username;
        this.email = email;
        this.fullName = fullName;
        this.avatarUrl = avatarUrl;
    }
}