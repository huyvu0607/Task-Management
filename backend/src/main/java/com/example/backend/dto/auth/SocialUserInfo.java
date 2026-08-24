package com.example.backend.dto.auth;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class SocialUserInfo {
    private String id;
    private String email;
    private String name;
    private String avatarUrl;
    private String provider;
}