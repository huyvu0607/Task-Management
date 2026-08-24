package com.example.backend.service;

import com.example.backend.model.User;

/**
 * Email Verification Service Interface
 * Quản lý việc tạo, verify và resend verification tokens
 */
public interface IEmailVerificationService {

    /**
     * Tạo và gửi verification token cho user mới đăng ký
     * @param user User cần verify
     * @return Verification token đã tạo
     */
    String createVerificationToken(User user);

    /**
     * Verify email bằng token
     * @param token Verification token
     * @return true nếu verify thành công, false nếu thất bại
     * @throws RuntimeException nếu token không hợp lệ hoặc đã hết hạn
     */
    boolean verifyEmail(String token);

    /**
     * Gửi lại verification email
     * @param email Email của user
     * @return true nếu gửi thành công
     * @throws RuntimeException nếu email không tồn tại hoặc đã verify
     */
    boolean resendVerificationEmail(String email);

    /**
     * Check xem email đã được verify chưa
     * @param email Email cần check
     * @return true nếu đã verify
     */
    boolean isEmailVerified(String email);

    /**
     * Xóa các token đã hết hạn (cleanup task - chạy định kỳ)
     */
    void cleanupExpiredTokens();
}