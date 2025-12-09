package com.example.backend.controller;

import com.example.backend.dto.auth.request.LoginRequest;
import com.example.backend.dto.auth.request.RegisterRequest;
import com.example.backend.dto.auth.request.SocialLoginRequest;
import com.example.backend.dto.auth.response.AuthResponse;
import com.example.backend.dto.auth.response.MessageResponse;
import com.example.backend.dto.auth.response.UserProfileResponse;
import com.example.backend.model.User;
import com.example.backend.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;
import java.util.Collections;

import java.util.Collections;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "*", maxAge = 3600)
public class AuthController {

    private final AuthService authService;

    // ========== OAuth2 Configuration ==========
    @Value("${oauth2.google.client-id}")
    private String googleClientId;

    @Value("${oauth2.google.client-secret}")
    private String googleClientSecret;

    @Value("${oauth2.github.client-id}")
    private String githubClientId;

    @Value("${oauth2.github.client-secret}")
    private String githubClientSecret;

    // ========== Standard Auth Endpoints ==========

    @PostMapping("/register")
    public ResponseEntity<?> register(@Valid @RequestBody RegisterRequest request) {
        try {
            log.info("Request đăng ký: {}", request.getUsername());
            AuthResponse response = authService.register(request);
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (RuntimeException e) {
            log.error("Lỗi đăng ký: {}", e.getMessage());
            return ResponseEntity.badRequest()
                    .body(MessageResponse.error(e.getMessage()));
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequest request) {
        try {
            log.info("Request đăng nhập: {}", request.getUsername());
            AuthResponse response = authService.login(request);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            log.error("Lỗi đăng nhập: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(MessageResponse.error(e.getMessage()));
        }
    }

    @PostMapping("/social-login")
    public ResponseEntity<?> socialLogin(@Valid @RequestBody SocialLoginRequest request) {
        try {
            log.info("Request social login: {}", request.getProvider());
            AuthResponse response = authService.socialLogin(request);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            log.error("Lỗi social login: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(MessageResponse.error(e.getMessage()));
        }
    }

    // ========== Google OAuth2 Token Exchange ==========

    @PostMapping("/google/exchange-token")
    public ResponseEntity<?> exchangeGoogleToken(@RequestBody Map<String, String> request) {
        try {
            String code = request.get("code");
            log.info("Exchanging Google authorization code");

            RestTemplate restTemplate = new RestTemplate();
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);

            // Google yêu cầu form-encoded
            String body = String.format(
                    "code=%s&client_id=%s&client_secret=%s&redirect_uri=%s&grant_type=authorization_code",
                    code,
                    googleClientId,
                    googleClientSecret,
                    "http://localhost:5173/auth/google/callback"
            );

            HttpEntity<String> entity = new HttpEntity<>(body, headers);

            ResponseEntity<Map> response = restTemplate.postForEntity(
                    "https://oauth2.googleapis.com/token",
                    entity,
                    Map.class
            );

            Map<String, Object> responseBody = response.getBody();

            if (responseBody != null && responseBody.containsKey("access_token")) {
                log.info("Google access token retrieved successfully");
                return ResponseEntity.ok(responseBody);
            } else {
                log.error("Google token exchange failed: {}", responseBody);
                return ResponseEntity.badRequest()
                        .body(MessageResponse.error("Google không trả về access token"));
            }

        } catch (Exception e) {
            log.error("Lỗi exchange Google token: {}", e.getMessage());
            return ResponseEntity.badRequest()
                    .body(MessageResponse.error("Không thể exchange Google token: " + e.getMessage()));
        }
    }

    // ========== GitHub OAuth2 Token Exchange ==========

    @PostMapping("/github/exchange-token")
    public ResponseEntity<?> exchangeGitHubToken(@RequestBody Map<String, String> request) {
        try {
            String code = request.get("code");
            log.info("Exchanging GitHub authorization code");

            RestTemplate restTemplate = new RestTemplate();
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.setAccept(Collections.singletonList(MediaType.APPLICATION_JSON));

            Map<String, String> body = Map.of(
                    "client_id", githubClientId,
                    "client_secret", githubClientSecret,
                    "code", code
            );

            HttpEntity<Map<String, String>> entity = new HttpEntity<>(body, headers);

            ResponseEntity<Map> response = restTemplate.postForEntity(
                    "https://github.com/login/oauth/access_token",
                    entity,
                    Map.class
            );

            Map<String, Object> responseBody = response.getBody();

            if (responseBody != null && responseBody.containsKey("access_token")) {
                log.info("GitHub access token retrieved successfully");
                return ResponseEntity.ok(responseBody);
            } else {
                log.error("GitHub token exchange failed: {}", responseBody);
                return ResponseEntity.badRequest()
                        .body(MessageResponse.error("GitHub không trả về access token"));
            }

        } catch (Exception e) {
            log.error("Lỗi exchange GitHub token: {}", e.getMessage());
            return ResponseEntity.badRequest()
                    .body(MessageResponse.error("Không thể exchange GitHub token: " + e.getMessage()));
        }
    }

    // ========== User Profile & Auth Management ==========

    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUser(@AuthenticationPrincipal UserDetails userDetails) {
        try {
            if (userDetails == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(MessageResponse.error("Unauthorized"));
            }

            String username = userDetails.getUsername();
            log.debug("Lấy thông tin user: {}", username);

            User user = authService.getCurrentUser(username);
            UserProfileResponse response = UserProfileResponse.fromUser(user);

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Lỗi lấy thông tin user: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(MessageResponse.error("Unauthorized"));
        }
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logout() {
        log.info("User đăng xuất");
        return ResponseEntity.ok(MessageResponse.success("Đăng xuất thành công"));
    }

    @GetMapping("/validate")
    public ResponseEntity<?> validateToken(@AuthenticationPrincipal UserDetails userDetails) {
        if (userDetails == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(MessageResponse.error("Token không hợp lệ"));
        }
        return ResponseEntity.ok(MessageResponse.success("Token hợp lệ"));
    }

    @GetMapping("/test")
    public ResponseEntity<?> test() {
        log.debug("Test API auth");
        return ResponseEntity.ok(MessageResponse.success("Auth API đang hoạt động!"));
    }
}