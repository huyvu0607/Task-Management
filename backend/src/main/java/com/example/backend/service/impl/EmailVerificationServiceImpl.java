package com.example.backend.service.impl;

import com.example.backend.model.EmailVerificationToken;
import com.example.backend.model.User;
import com.example.backend.repository.EmailVerificationTokenRepository;
import com.example.backend.repository.UserRepository;
import com.example.backend.service.IEmailService;
import com.example.backend.service.IEmailVerificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Email Verification Service Implementation
 * Xử lý việc tạo, verify và quản lý verification tokens
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class EmailVerificationServiceImpl implements IEmailVerificationService {

    private final EmailVerificationTokenRepository tokenRepository;
    private final UserRepository userRepository;
    private final IEmailService IEmailService;

    private static final int TOKEN_EXPIRY_HOURS = 24;

    @Override
    @Transactional
    public String createVerificationToken(User user) {
        // Xóa token cũ của user (nếu có)
        tokenRepository.deleteByUser(user);

        // Tạo token mới
        String tokenString = UUID.randomUUID().toString();

        EmailVerificationToken token = new EmailVerificationToken();
        token.setToken(tokenString);
        token.setUser(user);
        token.setExpiresAt(LocalDateTime.now().plusHours(TOKEN_EXPIRY_HOURS));
        token.setUsed(false);

        tokenRepository.save(token);

        // Gửi email verification
        IEmailService.sendVerificationEmail(user.getEmail(), user.getUsername(), tokenString);

        log.info("✅ Đã tạo verification token cho user: {}", user.getUsername());
        return tokenString;
    }

    @Override
    @Transactional
    public boolean verifyEmail(String tokenString) {
        // Tìm token
        EmailVerificationToken token = tokenRepository.findByToken(tokenString)
                .orElseThrow(() -> new RuntimeException("Token không hợp lệ"));

        // ✅ Nếu token đã được sử dụng VÀ user đã verify rồi → cho phép (idempotent)
        if (token.getUsed()) {
            User user = token.getUser();
            if (user.getEmailVerified()) {
                log.info("✅ Token đã được sử dụng trước đó, user đã verify");
                return true; // ✅ Trả về success thay vì throw error
            }
            throw new RuntimeException("Token đã được sử dụng");
        }

        // Kiểm tra token đã hết hạn chưa
        if (token.isExpired()) {
            throw new RuntimeException("Token đã hết hạn. Vui lòng yêu cầu gửi lại email xác nhận");
        }

        // Verify email
        User user = token.getUser();
        user.setEmailVerified(true);
        userRepository.save(user);

        // Đánh dấu token đã sử dụng
        token.setUsed(true);
        token.setVerifiedAt(LocalDateTime.now());
        tokenRepository.save(token);

        // Gửi welcome email
        IEmailService.sendWelcomeEmail(user.getEmail(), user.getUsername());

        log.info("✅ Email đã được verify cho user: {}", user.getUsername());
        return true;
    }

    @Override
    @Transactional
    public boolean resendVerificationEmail(String email) {
        // Tìm user
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Email không tồn tại"));

        // Kiểm tra đã verify chưa
        if (user.getEmailVerified()) {
            throw new RuntimeException("Email đã được xác nhận");
        }

        // Tạo token mới và gửi email
        String token = createVerificationToken(user);

        log.info("🔄 Đã gửi lại verification email cho: {}", email);
        return true;
    }

    @Override
    public boolean isEmailVerified(String email) {
        return userRepository.findByEmail(email)
                .map(User::getEmailVerified)
                .orElse(false);
    }

    @Override
    @Transactional
    @Scheduled(cron = "0 0 2 * * ?") // Chạy lúc 2h sáng mỗi ngày
    public void cleanupExpiredTokens() {
        log.info("🧹 Bắt đầu cleanup expired verification tokens...");
        tokenRepository.deleteExpiredTokens(LocalDateTime.now());
        log.info("✅ Đã cleanup expired tokens");
    }
}