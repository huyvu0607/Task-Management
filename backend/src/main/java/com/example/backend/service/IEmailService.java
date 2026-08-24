package com.example.backend.service;

import java.util.Map;

/**
 * Email Service Interface
 * Xử lý gửi email verification, welcome, và các loại email khác
 */
public interface IEmailService {

    /**
     * Gửi email verification khi user đăng ký
     * @param to Email người nhận
     * @param username Username của user
     * @param token Verification token
     */
    void sendVerificationEmail(String to, String username, String token);

    /**
     * Gửi lại email verification
     * @param to Email người nhận
     * @param username Username của user
     * @param token Verification token mới
     */
    void resendVerificationEmail(String to, String username, String token);

    /**
     * Gửi email chào mừng sau khi verify thành công
     * @param to Email người nhận
     * @param username Username của user
     */
    void sendWelcomeEmail(String to, String username);

    /**
     * Gửi email reset password (cho tương lai)
     * @param to Email người nhận
     * @param username Username của user
     * @param resetToken Reset password token
     */
    void sendPasswordResetEmail(String to, String username, String resetToken);

    /**
     * Gửi HTML email với template Thymeleaf
     * @param to Email người nhận
     * @param subject Subject email
     * @param templateName Tên template Thymeleaf
     * @param variables Variables truyền vào template
     */
    void sendHtmlEmail(String to, String subject, String templateName, Map<String, Object> variables);

    /**
     * Gửi plain text email
     * @param to Email người nhận
     * @param subject Subject email
     * @param content Nội dung email
     */
    void sendTextEmail(String to, String subject, String content);
    /**
     * Gửi mail để mời thành viên mới
     * @param to Email người nhận
     * @param teamName Subject email
     * @param message Nội dung email
     */
    void sendTeamInvitationEmail(
            String to,
            String invitedUserName,
            String teamName,
            String inviterName,
            String role,
            String message,
            String token
    );
}