package com.example.backend.dto.auth.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class SocialLoginRequest {
    @NotBlank(message = "Provider không được để trống")
    private String provider; // "google" hoặc "github"

    @NotBlank(message = "Access token không được để trống")
    private String accessToken;
}