package com.example.backend.controller;

import com.example.backend.dto.auth.request.*;
import com.example.backend.dto.auth.response.AuthResponse;
import com.example.backend.dto.auth.response.MessageResponse;
import com.example.backend.dto.auth.response.UserProfileResponse;
import com.example.backend.model.User;
import com.example.backend.service.AuthService;
import com.example.backend.service.EmailVerificationService;
import com.example.backend.service.FileUploadService;
import com.example.backend.service.PasswordResetService;
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
import org.springframework.web.multipart.MultipartFile;

import java.util.Collections;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "*", maxAge = 3600)
public class AuthController {

    private final AuthService authService;
    private final EmailVerificationService emailVerificationService;
    private final PasswordResetService passwordResetService;
    private final FileUploadService fileUploadService;


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
            log.info("📝 Request đăng ký: {}", request.getUsername());
            AuthResponse response = authService.register(request);
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (RuntimeException e) {
            log.error("❌ Lỗi đăng ký: {}", e.getMessage());
            return ResponseEntity.badRequest()
                    .body(MessageResponse.error(e.getMessage()));
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequest request) {
        try {
            log.info("🔐 Request đăng nhập: {}", request.getUsername());
            AuthResponse response = authService.login(request);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            log.error("❌ Lỗi đăng nhập: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(MessageResponse.error(e.getMessage()));
        }
    }

    @PostMapping("/social-login")
    public ResponseEntity<?> socialLogin(@Valid @RequestBody SocialLoginRequest request) {
        try {
            log.info("🔐 Request social login: {}", request.getProvider());
            AuthResponse response = authService.socialLogin(request);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            log.error("❌ Lỗi social login: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(MessageResponse.error(e.getMessage()));
        }
    }

    /**
     * Gửi email reset password
     * POST /api/auth/forgot-password
     * Body: { "email": "user@example.com" }
     */
    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(@Valid @RequestBody ForgotPasswordRequest request) {
        try {
            log.info("🔑 Request forgot password cho email: {}", request.getEmail());

            boolean success = passwordResetService.sendPasswordResetEmail(request.getEmail());

            if (success) {
                return ResponseEntity.ok(MessageResponse.success(
                        "Email hướng dẫn đặt lại mật khẩu đã được gửi. Vui lòng kiểm tra hộp thư của bạn."
                ));
            } else {
                return ResponseEntity.badRequest()
                        .body(MessageResponse.error("Không thể gửi email reset password"));
            }

        } catch (RuntimeException e) {
            log.error("❌ Lỗi forgot password: {}", e.getMessage());
            return ResponseEntity.badRequest()
                    .body(MessageResponse.error(e.getMessage()));
        }
    }

    /**
     * Validate reset token
     * GET /api/auth/validate-reset-token?token=xxx
     */
    @GetMapping("/validate-reset-token")
    public ResponseEntity<?> validateResetToken(@RequestParam String token) {
        try {
            log.info("🔍 Validate reset token");

            boolean valid = passwordResetService.validateResetToken(token);

            if (valid) {
                return ResponseEntity.ok(MessageResponse.success("Token hợp lệ"));
            } else {
                return ResponseEntity.badRequest()
                        .body(MessageResponse.error("Token không hợp lệ hoặc đã hết hạn"));
            }

        } catch (Exception e) {
            log.error("❌ Lỗi validate token: {}", e.getMessage());
            return ResponseEntity.badRequest()
                    .body(MessageResponse.error("Token không hợp lệ"));
        }
    }

    /**
     * Reset password với token
     * POST /api/auth/reset-password
     * Body: {
     *   "token": "xxx",
     *   "newPassword": "NewPass123",
     *   "confirmPassword": "NewPass123"
     * }
     */
    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@Valid @RequestBody ResetPasswordRequest request) {
        try {
            log.info("🔑 Request reset password");

            // Kiểm tra password và confirmPassword có khớp không
            if (!request.getNewPassword().equals(request.getConfirmPassword())) {
                return ResponseEntity.badRequest()
                        .body(MessageResponse.error("Mật khẩu xác nhận không khớp"));
            }

            boolean success = passwordResetService.resetPassword(
                    request.getToken(),
                    request.getNewPassword()
            );

            if (success) {
                return ResponseEntity.ok(MessageResponse.success(
                        "Đặt lại mật khẩu thành công! Bạn có thể đăng nhập với mật khẩu mới."
                ));
            } else {
                return ResponseEntity.badRequest()
                        .body(MessageResponse.error("Không thể đặt lại mật khẩu"));
            }

        } catch (RuntimeException e) {
            log.error("❌ Lỗi reset password: {}", e.getMessage());
            return ResponseEntity.badRequest()
                    .body(MessageResponse.error(e.getMessage()));
        }
    }
    // ========== EMAIL VERIFICATION ENDPOINTS ==========

    /**
     * Verify email bằng token
     * GET /api/auth/verify-email?token=xxx
     */
    @GetMapping("/verify-email")
    public ResponseEntity<?> verifyEmail(@RequestParam String token) {
        try {
            log.info("✅ Request verify email với token");
            boolean success = emailVerificationService.verifyEmail(token);

            if (success) {
                return ResponseEntity.ok(MessageResponse.success(
                        "Email đã được xác nhận thành công! Bạn có thể đăng nhập ngay bây giờ."
                ));
            } else {
                return ResponseEntity.badRequest()
                        .body(MessageResponse.error("Xác nhận email thất bại"));
            }
        } catch (RuntimeException e) {
            log.error("❌ Lỗi verify email: {}", e.getMessage());
            return ResponseEntity.badRequest()
                    .body(MessageResponse.error(e.getMessage()));
        }
    }

    /**
     * Gửi lại email verification
     * POST /api/auth/resend-verification
     * Body: { "email": "user@example.com" }
     */
    @PostMapping("/resend-verification")
    public ResponseEntity<?> resendVerificationEmail(@RequestBody Map<String, String> request) {
        try {
            String email = request.get("email");

            if (email == null || email.trim().isEmpty()) {
                return ResponseEntity.badRequest()
                        .body(MessageResponse.error("Email không được để trống"));
            }

            log.info("🔄 Request gửi lại verification email: {}", email);
            boolean success = emailVerificationService.resendVerificationEmail(email);

            if (success) {
                return ResponseEntity.ok(MessageResponse.success(
                        "Email xác nhận đã được gửi lại. Vui lòng kiểm tra hộp thư của bạn."
                ));
            } else {
                return ResponseEntity.badRequest()
                        .body(MessageResponse.error("Không thể gửi lại email xác nhận"));
            }
        } catch (RuntimeException e) {
            log.error("❌ Lỗi resend verification: {}", e.getMessage());
            return ResponseEntity.badRequest()
                    .body(MessageResponse.error(e.getMessage()));
        }
    }

    /**
     * Check email verification status
     * GET /api/auth/check-email-verified?email=xxx
     */
    @GetMapping("/check-email-verified")
    public ResponseEntity<?> checkEmailVerified(@RequestParam String email) {
        try {
            boolean verified = emailVerificationService.isEmailVerified(email);
            return ResponseEntity.ok(Map.of(
                    "email", email,
                    "verified", verified
            ));
        } catch (Exception e) {
            log.error("❌ Lỗi check email verified: {}", e.getMessage());
            return ResponseEntity.badRequest()
                    .body(MessageResponse.error("Không thể kiểm tra trạng thái email"));
        }
    }
    /**
     * FR-1.3: Cập nhật profile
     * PUT /api/auth/me
     * Body: {
     *   "fullName": "Nguyen Van A",
     *   "bio": "Software Developer",
     *   "timezone": "Asia/Ho_Chi_Minh",
     *   "avatarUrl": "https://..."
     * }
     */
    @PutMapping("/me")
    public ResponseEntity<?> updateProfile(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody UpdateProfileRequest request) {
        try {
            if (userDetails == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(MessageResponse.error("Unauthorized"));
            }

            String username = userDetails.getUsername();
            log.info("📝 Cập nhật profile: {}", username);

            User updatedUser = authService.updateProfile(username, request);
            UserProfileResponse response = UserProfileResponse.fromUser(updatedUser);

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("❌ Lỗi cập nhật profile: {}", e.getMessage());
            return ResponseEntity.badRequest()
                    .body(MessageResponse.error(e.getMessage()));
        }
    }

    /**
     * FR-1.4: Đổi mật khẩu
     * POST /api/auth/change-password
     * Body: {
     *   "oldPassword": "OldPass123",
     *   "newPassword": "NewPass123",
     *   "confirmPassword": "NewPass123"
     * }
     */
    @PostMapping("/change-password")
    public ResponseEntity<?> changePassword(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody ChangePasswordRequest request) {
        try {
            if (userDetails == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(MessageResponse.error("Unauthorized"));
            }

            String username = userDetails.getUsername();
            log.info("🔑 Request đổi mật khẩu: {}", username);

            authService.changePassword(username, request);

            return ResponseEntity.ok(MessageResponse.success(
                    "Đổi mật khẩu thành công! Vui lòng đăng nhập lại với mật khẩu mới."
            ));
        } catch (RuntimeException e) {
            log.error("❌ Lỗi đổi mật khẩu: {}", e.getMessage());
            return ResponseEntity.badRequest()
                    .body(MessageResponse.error(e.getMessage()));
        }
    }

    // ========== Google OAuth2 Token Exchange ==========

    @PostMapping("/google/exchange-token")
    public ResponseEntity<?> exchangeGoogleToken(@RequestBody Map<String, String> request) {
        try {
            String code = request.get("code");
            log.info("🔄 Exchanging Google authorization code");

            RestTemplate restTemplate = new RestTemplate();
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);

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
                log.info("✅ Google access token retrieved successfully");
                return ResponseEntity.ok(responseBody);
            } else {
                log.error("❌ Google token exchange failed: {}", responseBody);
                return ResponseEntity.badRequest()
                        .body(MessageResponse.error("Google không trả về access token"));
            }

        } catch (Exception e) {
            log.error("❌ Lỗi exchange Google token: {}", e.getMessage());
            return ResponseEntity.badRequest()
                    .body(MessageResponse.error("Không thể exchange Google token: " + e.getMessage()));
        }
    }

    // ========== GitHub OAuth2 Token Exchange ==========

    @PostMapping("/github/exchange-token")
    public ResponseEntity<?> exchangeGitHubToken(@RequestBody Map<String, String> request) {
        try {
            String code = request.get("code");
            log.info("🔄 Exchanging GitHub authorization code");

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
                log.info("✅ GitHub access token retrieved successfully");
                return ResponseEntity.ok(responseBody);
            } else {
                log.error("❌ GitHub token exchange failed: {}", responseBody);
                return ResponseEntity.badRequest()
                        .body(MessageResponse.error("GitHub không trả về access token"));
            }

        } catch (Exception e) {
            log.error("❌ Lỗi exchange GitHub token: {}", e.getMessage());
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
            log.debug("📋 Lấy thông tin user: {}", username);

            User user = authService.getCurrentUser(username);
            UserProfileResponse response = UserProfileResponse.fromUser(user);

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("❌ Lỗi lấy thông tin user: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(MessageResponse.error("Unauthorized"));
        }
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logout() {
        log.info("👋 User đăng xuất");
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
        log.debug("🧪 Test API auth");
        return ResponseEntity.ok(MessageResponse.success("Auth API đang hoạt động!"));
    }
    /**
     * Upload avatar
     * POST /api/auth/upload-avatar
     * Content-Type: multipart/form-data
     * Body: file (MultipartFile)
     */
    @PostMapping("/upload-avatar")
    public ResponseEntity<?> uploadAvatar(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestParam("file") MultipartFile file) {
        try {
            if (userDetails == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(MessageResponse.error("Unauthorized"));
            }

            String username = userDetails.getUsername();
            log.info("📤 Upload avatar: {}", username);

            // Lấy user hiện tại
            User user = authService.getCurrentUser(username);

            // Upload file lên Cloudinary
            String avatarUrl = fileUploadService.uploadAvatar(file, user.getId());

            // Cập nhật avatar URL vào database
            UpdateProfileRequest request = new UpdateProfileRequest();
            request.setAvatarUrl(avatarUrl);
            User updatedUser = authService.updateProfile(username, request);

            // Trả về response
            UserProfileResponse response = UserProfileResponse.fromUser(updatedUser);

            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            log.error("❌ Lỗi upload avatar: {}", e.getMessage());
            return ResponseEntity.badRequest()
                    .body(MessageResponse.error(e.getMessage()));
        }
    }
}