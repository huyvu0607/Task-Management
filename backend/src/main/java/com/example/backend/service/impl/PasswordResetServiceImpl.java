package com.example.backend.service.impl;

import com.example.backend.model.PasswordResetToken;
import com.example.backend.model.User;
import com.example.backend.repository.PasswordResetTokenRepository;
import com.example.backend.repository.UserRepository;
import com.example.backend.service.EmailService;
import com.example.backend.service.PasswordResetService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class PasswordResetServiceImpl implements PasswordResetService {

    private final UserRepository userRepository;
    private final PasswordResetTokenRepository tokenRepository;
    private final EmailService emailService;
    private final PasswordEncoder passwordEncoder;

    // Token hết hạn sau 1 giờ
    private static final int EXPIRATION_HOURS = 1;

    @Override
    @Transactional
    public boolean sendPasswordResetEmail(String email) {
        try {
            log.info("🔑 Xử lý yêu cầu reset password cho email: {}", email);

            // Tìm user theo email
            User user = userRepository.findByEmail(email)
                    .orElseThrow(() -> new RuntimeException("Email không tồn tại trong hệ thống"));

            // Kiểm tra tài khoản có active không
            if (!user.getIsActive()) {
                throw new RuntimeException("Tài khoản đã bị khóa");
            }

            // Kiểm tra có phải social login không
            if (!"local".equals(user.getProvider())) {
                throw new RuntimeException("Tài khoản " + user.getProvider() +
                        " không hỗ trợ đặt lại mật khẩu. Vui lòng đăng nhập bằng " + user.getProvider());
            }

            // Kiểm tra rate limit (tối đa 3 token active cùng lúc)
            long activeTokenCount = tokenRepository.countByUserAndIsUsedFalseAndExpiryDateAfter(
                    user, LocalDateTime.now());

            if (activeTokenCount >= 3) {
                throw new RuntimeException("Bạn đã yêu cầu quá nhiều lần. Vui lòng kiểm tra email hoặc thử lại sau.");
            }

            // Vô hiệu hóa tất cả token cũ của user
            tokenRepository.markAllUserTokensAsUsed(user);

            // Tạo token mới
            String token = UUID.randomUUID().toString();
            LocalDateTime expiryDate = LocalDateTime.now().plusHours(EXPIRATION_HOURS);

            PasswordResetToken resetToken = PasswordResetToken.builder()
                    .token(token)
                    .user(user)
                    .expiryDate(expiryDate)
                    .isUsed(false)
                    .build();

            tokenRepository.save(resetToken);
            log.info("✅ Đã tạo reset token cho user: {}", user.getUsername());

            // Gửi email
            emailService.sendPasswordResetEmail(user.getEmail(), user.getUsername(), token);
            log.info("📧 Đã gửi email reset password đến: {}", user.getEmail());

            return true;

        } catch (RuntimeException e) {
            log.error("❌ Lỗi gửi email reset password: {}", e.getMessage());
            throw e;
        } catch (Exception e) {
            log.error("❌ Lỗi không xác định: {}", e.getMessage(), e);
            throw new RuntimeException("Không thể xử lý yêu cầu reset password", e);
        }
    }

    @Override
    @Transactional(readOnly = true)
    public boolean validateResetToken(String token) {
        try {
            PasswordResetToken resetToken = tokenRepository
                    .findByTokenAndIsUsedFalseAndExpiryDateAfter(token, LocalDateTime.now())
                    .orElse(null);

            if (resetToken == null) {
                log.warn("⚠️ Token không hợp lệ hoặc đã hết hạn");
                return false;
            }

            log.info("✅ Token hợp lệ cho user: {}", resetToken.getUser().getUsername());
            return true;

        } catch (Exception e) {
            log.error("❌ Lỗi validate token: {}", e.getMessage());
            return false;
        }
    }

    @Override
    @Transactional
    public boolean resetPassword(String token, String newPassword) {
        try {
            log.info("🔑 Xử lý reset password với token");

            // Validate password strength
            if (!isPasswordStrong(newPassword)) {
                throw new RuntimeException("Mật khẩu phải có ít nhất 8 ký tự, bao gồm chữ hoa, chữ thường và số");
            }

            // Tìm token hợp lệ
            PasswordResetToken resetToken = tokenRepository
                    .findByTokenAndIsUsedFalseAndExpiryDateAfter(token, LocalDateTime.now())
                    .orElseThrow(() -> new RuntimeException("Token không hợp lệ hoặc đã hết hạn"));

            User user = resetToken.getUser();

            // Cập nhật password
            user.setPasswordHash(passwordEncoder.encode(newPassword));

            // Reset failed login attempts
            user.setFailedLoginAttempts(0);
            user.setLockedUntil(null);

            userRepository.save(user);

            // Đánh dấu token đã dùng
            resetToken.setIsUsed(true);
            resetToken.setUsedAt(LocalDateTime.now());
            tokenRepository.save(resetToken);

            // Vô hiệu hóa tất cả token khác của user
            tokenRepository.markAllUserTokensAsUsed(user);

            log.info("✅ Đã reset password thành công cho user: {}", user.getUsername());
            return true;

        } catch (RuntimeException e) {
            log.error("❌ Lỗi reset password: {}", e.getMessage());
            throw e;
        } catch (Exception e) {
            log.error("❌ Lỗi không xác định: {}", e.getMessage(), e);
            throw new RuntimeException("Không thể reset password", e);
        }
    }

    @Override
    @Transactional(readOnly = true)
    public boolean isTokenExpired(String token) {
        try {
            PasswordResetToken resetToken = tokenRepository.findByToken(token)
                    .orElse(null);

            if (resetToken == null) {
                return true;
            }

            return resetToken.isExpired();

        } catch (Exception e) {
            log.error("❌ Lỗi kiểm tra token expiry: {}", e.getMessage());
            return true;
        }
    }

    /**
     * Validate password strength
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