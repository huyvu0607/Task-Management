package com.example.backend.service.impl;

import com.example.backend.dto.auth.SocialUserInfo;
import com.example.backend.dto.auth.request.*;
import com.example.backend.dto.auth.response.AuthResponse;
import com.example.backend.model.User;
import com.example.backend.repository.UserRepository;
import com.example.backend.service.IAuthService;
import com.example.backend.service.IEmailVerificationService;
import com.example.backend.service.ISocialAuthService;
import com.example.backend.service.IUserLockService;
import com.example.backend.util.JwtUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthServiceImpl implements IAuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final AuthenticationManager authenticationManager;
    private final ISocialAuthService ISocialAuthService;
    private final IEmailVerificationService IEmailVerificationService; // ✅ Thêm EmailVerificationService
    private final IUserLockService IUserLockService;

    @Override
    @Transactional
    public AuthResponse register(RegisterRequest request) {
        log.info("📝 Đăng ký tài khoản mới: {}", request.getUsername());

        // ========== VALIDATION ==========

        // Kiểm tra username format (chỉ chữ, số, _, -)
        if (!request.getUsername().matches("^[a-zA-Z0-9_-]+$")) {
            throw new RuntimeException("Username chỉ được chứa chữ, số, dấu gạch dưới (_) và dấu gạch ngang (-)");
        }

        // Kiểm tra username đã tồn tại
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new RuntimeException("Username đã tồn tại");
        }

        // Kiểm tra email đã tồn tại
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email đã được sử dụng");
        }

        // Kiểm tra password strength (đã có validation ở RegisterRequest, nhưng check thêm)
        if (!isPasswordStrong(request.getPassword())) {
            throw new RuntimeException("Mật khẩu phải có ít nhất 8 ký tự, bao gồm chữ hoa, chữ thường và số");
        }

        // ========== TẠO USER MỚI ==========

        User user = new User();
        user.setUsername(request.getUsername());
        user.setEmail(request.getEmail());
        user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        user.setFullName(request.getFullName());
        user.setTimezone(request.getTimezone());
        user.setProvider("local"); // ✅ Set provider = local
        user.setIsActive(true);
        user.setEmailVerified(false); // ✅ Chưa verify email
        user.setFailedLoginAttempts(0);

        // Lưu vào database
        User savedUser = userRepository.save(user);
        log.info("✅ Tạo user thành công: {}", savedUser.getUsername());

        // ========== GỬI EMAIL VERIFICATION ==========

        try {
            IEmailVerificationService.createVerificationToken(savedUser);
            log.info("📧 Đã gửi email verification đến: {}", savedUser.getEmail());
        } catch (Exception e) {
            log.error("❌ Lỗi gửi email verification: {}", e.getMessage());
            // Không throw exception - user vẫn được tạo, có thể resend email sau
        }

        // ========== TẠO JWT TOKEN ==========

        UserDetails userDetails = org.springframework.security.core.userdetails.User
                .withUsername(savedUser.getUsername())
                .password(savedUser.getPasswordHash())
                .authorities("ROLE_USER")
                .build();

        String token = jwtUtil.generateToken(userDetails);

        // ========== TRẢ VỀ RESPONSE ==========

        return AuthResponse.builder()
                .token(token)
                .type("Bearer")
                .userId(savedUser.getId())
                .username(savedUser.getUsername())
                .email(savedUser.getEmail())
                .fullName(savedUser.getFullName())
                .avatarUrl(savedUser.getAvatarUrl())
                .build();
    }

    @Override
    @Transactional
    public AuthResponse login(LoginRequest request) {
        log.info("🔐 Đăng nhập: {}", request.getUsername());

        // Tìm user
        User user = userRepository.findByUsername(request.getUsername())
                .orElseThrow(() -> new UsernameNotFoundException("Tài khoản không tồn tại"));

        // Kiểm tra tài khoản có bị khóa không
        if (!user.getIsActive()) {
            throw new RuntimeException("Tài khoản đã bị khóa");
        }

        // Kiểm tra email đã verify chưa (chỉ cho local accounts)
        if ("local".equals(user.getProvider()) && !user.getEmailVerified()) {
            throw new RuntimeException("Vui lòng xác nhận email trước khi đăng nhập. Kiểm tra hộp thư của bạn.");
        }

        // Kiểm tra lockout (sau 5 lần đăng nhập sai)
        if (user.getLockedUntil() != null && user.getLockedUntil().isAfter(LocalDateTime.now())) {
            DateTimeFormatter formatter = DateTimeFormatter.ofPattern("HH:mm:ss");
            String formatted = user.getLockedUntil().format(formatter);
            throw new RuntimeException("Tài khoản đang bị khóa đến: " + formatted);
        }

        try {
            // Authenticate
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            request.getUsername(),
                            request.getPassword()
                    )
            );

            // ✅ Reset failed login attempts VÀ cập nhật lastLogin
            // Service này dùng REQUIRES_NEW nên sẽ commit ngay lập tức
            IUserLockService.resetFailedAttempts(user.getId());

            // 🔄 QUAN TRỌNG: Refresh user từ DB để lấy dữ liệu mới nhất
            // Sau khi resetFailedAttempts() đã commit xong
            user = userRepository.findById(user.getId())
                    .orElseThrow(() -> new RuntimeException("User not found"));

            // Tạo JWT token
            UserDetails userDetails = (UserDetails) authentication.getPrincipal();
            String token = jwtUtil.generateToken(userDetails);

            log.info("✅ Đăng nhập thành công: {}", user.getUsername());

            return AuthResponse.builder()
                    .token(token)
                    .type("Bearer")
                    .userId(user.getId())
                    .username(user.getUsername())
                    .email(user.getEmail())
                    .fullName(user.getFullName())
                    .avatarUrl(user.getAvatarUrl())
                    .build();

        } catch (BadCredentialsException e) {
            // ❌ Xử lý login failed
            // Service này dùng REQUIRES_NEW nên sẽ commit ngay cả khi method này throw exception
            IUserLockService.handleFailedLogin(user.getId());

            // 🔄 Refresh user để lấy số attempts mới nhất từ DB
            int attempts = userRepository.findById(user.getId())
                    .map(User::getFailedLoginAttempts)
                    .orElse(5);

            int remaining = Math.max(0, 5 - attempts);

            throw new RuntimeException(
                    "Username hoặc password không đúng, còn " + remaining + " lần thử"
            );
        }
    }

    @Override
    @Transactional
    public AuthResponse socialLogin(SocialLoginRequest request) {
        log.info("🔐 Social login với provider: {}", request.getProvider());

        // Verify token và lấy thông tin user
        SocialUserInfo socialUser;
        if ("google".equalsIgnoreCase(request.getProvider())) {
            socialUser = ISocialAuthService.verifyGoogleToken(request.getAccessToken());
        } else if ("github".equalsIgnoreCase(request.getProvider())) {
            socialUser = ISocialAuthService.verifyGithubToken(request.getAccessToken());
        } else {
            throw new RuntimeException("Provider không được hỗ trợ: " + request.getProvider());
        }

        // Tìm hoặc tạo user
        User user = findOrCreateSocialUser(socialUser);

        // Cập nhật last login
        user.setLastLogin(LocalDateTime.now());
        userRepository.save(user);

        // Tạo JWT token
        UserDetails userDetails = org.springframework.security.core.userdetails.User
                .withUsername(user.getUsername())
                .password(user.getPasswordHash())
                .authorities("ROLE_USER")
                .build();

        String token = jwtUtil.generateToken(userDetails);

        log.info("✅ Social login thành công: {}", user.getUsername());

        return AuthResponse.builder()
                .token(token)
                .type("Bearer")
                .userId(user.getId())
                .username(user.getUsername())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .avatarUrl(user.getAvatarUrl())
                .build();
    }

    @Override
    public User getCurrentUser(String username) {
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("User không tồn tại"));
    }

    @Override
    @Transactional
    public User updateProfile(String username, UpdateProfileRequest request) {
        log.info("📝 Cập nhật profile cho user: {}", username);

        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("User không tồn tại"));

        // Cập nhật thông tin
        if (request.getFullName() != null && !request.getFullName().trim().isEmpty()) {
            user.setFullName(request.getFullName().trim());
        }

        if (request.getBio() != null) {
            user.setBio(request.getBio().trim());
        }

        if (request.getTimezone() != null && !request.getTimezone().trim().isEmpty()) {
            user.setTimezone(request.getTimezone());
        }

        if (request.getAvatarUrl() != null && !request.getAvatarUrl().trim().isEmpty()) {
            user.setAvatarUrl(request.getAvatarUrl());
        }

        // ========== NEW FIELDS ==========

        if (request.getPhoneNumber() != null) {
            user.setPhoneNumber(request.getPhoneNumber().trim());
        }

        if (request.getDepartment() != null) {
            user.setDepartment(request.getDepartment().trim());
        }

        if (request.getJobTitle() != null) {
            user.setJobTitle(request.getJobTitle().trim());
        }

        User updatedUser = userRepository.save(user);
        log.info("✅ Cập nhật profile thành công: {}", username);

        return updatedUser;
    }

    @Override
    @Transactional
    public void changePassword(String username, ChangePasswordRequest request) {
        log.info("🔑 Đổi mật khẩu cho user: {}", username);

        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("User không tồn tại"));

        // ========== VALIDATION ==========

        // 1. Check confirm password khớp với new password
        if (!request.getNewPassword().equals(request.getConfirmPassword())) {
            throw new RuntimeException("Mật khẩu xác nhận không khớp");
        }

        // 2. Verify old password đúng
        if (!passwordEncoder.matches(request.getOldPassword(), user.getPasswordHash())) {
            throw new RuntimeException("Mật khẩu cũ không đúng");
        }

        // 3. Check new password khác old password (FR-1.4)
        if (request.getOldPassword().equals(request.getNewPassword())) {
            throw new RuntimeException("Mật khẩu mới phải khác mật khẩu cũ");
        }

        // 4. Check password strength
        if (!isPasswordStrong(request.getNewPassword())) {
            throw new RuntimeException("Mật khẩu mới phải có ít nhất 8 ký tự, bao gồm chữ hoa, chữ thường và số");
        }

        // ========== UPDATE PASSWORD ==========

        user.setPasswordHash(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);

        log.info("✅ Đổi mật khẩu thành công: {}", username);
    }

    // ========== PRIVATE HELPER METHODS ==========

    /**
     * Xử lý khi đăng nhập thất bại
     * Tăng số lần thử và khóa tài khoản nếu quá 5 lần
     */
    private void handleFailedLogin(User user) {
        int attempts = user.getFailedLoginAttempts() + 1;
        user.setFailedLoginAttempts(attempts);

        // ✅ Khóa tài khoản sau 5 lần sai (FR-1.2.3)
        if (attempts >= 5) {
            user.setLockedUntil(LocalDateTime.now().plusMinutes(15));
            log.warn("🔒 Tài khoản {} bị khóa 15 phút do đăng nhập sai quá nhiều lần", user.getUsername());
        }

        userRepository.save(user);
    }

    /**
     * Tìm hoặc tạo user từ social login
     */
    private User findOrCreateSocialUser(SocialUserInfo socialUser) {
        User user = null;

        // Tìm user theo social ID
        if ("google".equals(socialUser.getProvider())) {
            user = userRepository.findByGoogleId(socialUser.getId()).orElse(null);
        } else if ("github".equals(socialUser.getProvider())) {
            user = userRepository.findByGithubId(socialUser.getId()).orElse(null);
        }

        // Nếu không tìm thấy, tìm theo email
        if (user == null && socialUser.getEmail() != null) {
            user = userRepository.findByEmail(socialUser.getEmail()).orElse(null);

            // Nếu tìm thấy user có email trùng, link social ID vào
            if (user != null) {
                if ("google".equals(socialUser.getProvider())) {
                    user.setGoogleId(socialUser.getId());
                } else if ("github".equals(socialUser.getProvider())) {
                    user.setGithubId(socialUser.getId());
                }
                log.info("🔗 Link social ID {} vào user hiện có: {}",
                        socialUser.getProvider(), user.getUsername());
            }
        }

        // Nếu vẫn không có, tạo user mới
        if (user == null) {
            user = new User();
            user.setEmail(socialUser.getEmail());
            user.setFullName(socialUser.getName() != null ? socialUser.getName() : "User");
            user.setAvatarUrl(socialUser.getAvatarUrl());
            user.setProvider(socialUser.getProvider());
            user.setIsActive(true);
            user.setEmailVerified(true); // ✅ Social login đã verify email
            user.setFailedLoginAttempts(0);
            user.setTimezone("Asia/Ho_Chi_Minh");

            // Set social ID và username
            if ("google".equals(socialUser.getProvider())) {
                user.setGoogleId(socialUser.getId());
                user.setUsername(generateUniqueUsername("google_" + socialUser.getId()));
            } else if ("github".equals(socialUser.getProvider())) {
                user.setGithubId(socialUser.getId());
                user.setUsername(generateUniqueUsername("github_" + socialUser.getId()));
            }

            // Password hash (random UUID - không dùng nhưng cần cho Spring Security)
            user.setPasswordHash(passwordEncoder.encode(UUID.randomUUID().toString()));

            log.info("✅ Tạo user mới từ {}: {}", socialUser.getProvider(), user.getUsername());
        }

        return user;
    }

    /**
     * Generate unique username (tránh trùng)
     */
    private String generateUniqueUsername(String baseUsername) {
        String username = baseUsername;
        int counter = 1;

        while (userRepository.existsByUsername(username)) {
            username = baseUsername + "_" + counter;
            counter++;
        }

        return username;
    }

    /**
     * Check password strength (FR-1.1.3)
     * - Ít nhất 8 ký tự
     * - Có chữ hoa
     * - Có chữ thường
     * - Có số
     */
    private boolean isPasswordStrong(String password) {
        if (password == null || password.length() < 8) {
            return false;
        }

        boolean hasUppercase = password.chars().anyMatch(Character::isUpperCase);
        boolean hasLowercase = password.chars().anyMatch(Character::isLowerCase);
        boolean hasDigit = password.chars().anyMatch(Character::isDigit);

        return hasUppercase && hasLowercase && hasDigit;
    }
}