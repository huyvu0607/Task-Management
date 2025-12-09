package com.example.backend.service.impl;

import com.example.backend.dto.auth.SocialUserInfo;
import com.example.backend.dto.auth.request.SocialLoginRequest;
import com.example.backend.dto.auth.response.AuthResponse;
import com.example.backend.dto.auth.request.LoginRequest;
import com.example.backend.dto.auth.request.RegisterRequest;
import com.example.backend.model.User;
import com.example.backend.repository.UserRepository;
import com.example.backend.service.AuthService;
import com.example.backend.service.SocialAuthService;
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
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final AuthenticationManager authenticationManager;
    private final SocialAuthService socialAuthService;

    @Override
    @Transactional
    public AuthResponse register(RegisterRequest request) {
        log.info("Đăng ký tài khoản mới: {}", request.getUsername());

        // Kiểm tra username đã tồn tại
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new RuntimeException("Username đã tồn tại");
        }

        // Kiểm tra email đã tồn tại
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email đã được sử dụng");
        }

        // Tạo user mới
        User user = new User();
        user.setUsername(request.getUsername());
        user.setEmail(request.getEmail());
        user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        user.setFullName(request.getFullName());
        user.setTimezone(request.getTimezone());
        user.setIsActive(true);
        user.setEmailVerified(false);
        user.setFailedLoginAttempts(0);

        // Lưu vào database
        User savedUser = userRepository.save(user);
        log.info("Đăng ký thành công user: {}", savedUser.getUsername());

        // Tạo JWT token
        UserDetails userDetails = org.springframework.security.core.userdetails.User
                .withUsername(savedUser.getUsername())
                .password(savedUser.getPasswordHash())
                .authorities("ROLE_USER")
                .build();

        String token = jwtUtil.generateToken(userDetails);

        // Trả về response
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
        log.info("Đăng nhập: {}", request.getUsername());

        // Tìm user
        User user = userRepository.findByUsername(request.getUsername())
                .orElseThrow(() -> new UsernameNotFoundException("Tài khoản không tồn tại"));

        // Kiểm tra tài khoản có bị khóa không
        if (!user.getIsActive()) {
            throw new RuntimeException("Tài khoản đã bị khóa");
        }

        if (user.getLockedUntil() != null && user.getLockedUntil().isAfter(LocalDateTime.now())) {
            throw new RuntimeException("Tài khoản đang bị khóa đến: " + user.getLockedUntil());
        }

        try {
            // Authenticate
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            request.getUsername(),
                            request.getPassword()
                    )
            );

            // Reset failed login attempts
            if (user.getFailedLoginAttempts() > 0) {
                user.setFailedLoginAttempts(0);
                user.setLockedUntil(null);
            }

            // Cập nhật last login
            user.setLastLogin(LocalDateTime.now());
            userRepository.save(user);

            // Tạo JWT token
            UserDetails userDetails = (UserDetails) authentication.getPrincipal();
            String token = jwtUtil.generateToken(userDetails);

            log.info("Đăng nhập thành công: {}", user.getUsername());

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
            // Tăng số lần đăng nhập sai
            handleFailedLogin(user);
            throw new RuntimeException("Username hoặc password không đúng");
        }
    }

    @Override
    @Transactional
    public AuthResponse socialLogin(SocialLoginRequest request) {
        log.info("Social login với provider: {}", request.getProvider());

        // Verify token và lấy thông tin user
        SocialUserInfo socialUser;
        if ("google".equalsIgnoreCase(request.getProvider())) {
            socialUser = socialAuthService.verifyGoogleToken(request.getAccessToken());
        } else if ("github".equalsIgnoreCase(request.getProvider())) {
            socialUser = socialAuthService.verifyGithubToken(request.getAccessToken());
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

        log.info("Social login thành công: {}", user.getUsername());

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

    /**
     * Xử lý khi đăng nhập thất bại
     * Tăng số lần thử và khóa tài khoản nếu quá 5 lần
     */

    private void handleFailedLogin(User user) {
        int attempts = user.getFailedLoginAttempts() + 1;
        user.setFailedLoginAttempts(attempts);

        // Khóa tài khoản sau 5 lần sai
        if (attempts >= 5) {
            user.setLockedUntil(LocalDateTime.now().plusMinutes(15));
            log.warn("Tài khoản {} bị khóa do đăng nhập sai quá nhiều lần", user.getUsername());
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
                log.info("Link social ID {} vào user hiện có: {}",
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
            user.setEmailVerified(true); // Social login đã verify email
            user.setFailedLoginAttempts(0);
            user.setTimezone("UTC");

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

            log.info("Tạo user mới từ {}: {}", socialUser.getProvider(), user.getUsername());
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

}