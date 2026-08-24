package com.example.backend.service.impl;

import com.example.backend.service.IEmailService;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ClassPathResource;
import org.springframework.core.io.Resource;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.thymeleaf.context.Context;
import org.thymeleaf.spring6.SpringTemplateEngine;

import java.util.HashMap;
import java.util.Map;

/**
 * Email Service Implementation
 * Sử dụng JavaMailSender và Thymeleaf templates
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class EmailServiceImpl implements IEmailService {

    private final JavaMailSender mailSender;
    private final SpringTemplateEngine templateEngine;

    @Value("${app.mail.from}")
    private String fromEmail;

    @Value("${app.mail.base-url}")
    private String baseUrl;

    @Override
    @Async
    public void sendVerificationEmail(String to, String username, String token) {
        try {
            log.info("🔍 Bắt đầu gửi verification email đến: {}", to);

            // Debug: Kiểm tra template có tồn tại không
            try {
                Resource resource = new ClassPathResource("templates/email/verification.html");
                log.info("🔍 Template exists: {}", resource.exists());
                if (resource.exists()) {
                    log.info("🔍 Template URI: {}", resource.getURI());
                }
            } catch (Exception e) {
                log.error("❌ Không tìm thấy template: {}", e.getMessage());
            }

            Map<String, Object> variables = new HashMap<>();
            variables.put("username", username);
            variables.put("fullName", username); // Thêm fullName cho template
            variables.put("verificationLink", baseUrl + "/verify-email?token=" + token);
            variables.put("verificationUrl", baseUrl + "/api/auth/verify-email?token=" + token);
            variables.put("expiryHours", 24);
            variables.put("year", java.time.Year.now().getValue());

            String subject = "Xác nhận email - TeamFlow";
            String template = "email/verification";

            sendHtmlEmail(to, subject, template, variables);
            log.info("✅ Đã gửi verification email đến: {}", to);
        } catch (Exception e) {
            log.error("❌ Lỗi gửi verification email đến {}: {}", to, e.getMessage(), e);
            throw new RuntimeException("Không thể gửi email xác nhận", e);
        }
    }

    @Override
    @Async
    public void resendVerificationEmail(String to, String username, String token) {
        log.info("🔄 Gửi lại verification email đến: {}", to);
        sendVerificationEmail(to, username, token);
    }

    @Override
    @Async
    public void sendWelcomeEmail(String to, String username) {
        try {
            Map<String, Object> variables = new HashMap<>();
            variables.put("username", username);
            variables.put("dashboardLink", baseUrl + "/dashboard");
            variables.put("year", java.time.Year.now().getValue());

            String subject = "Chào mừng đến với TeamFlow! 🎉";
            String template = "email/welcome";

            sendHtmlEmail(to, subject, template, variables);
            log.info("✅ Đã gửi welcome email đến: {}", to);
        } catch (Exception e) {
            log.error("❌ Lỗi gửi welcome email đến {}: {}", to, e.getMessage());
        }
    }

    @Override
    @Async
    public void sendPasswordResetEmail(String to, String username, String resetToken) {
        try {
            Map<String, Object> variables = new HashMap<>();
            variables.put("username", username);
            variables.put("resetLink", baseUrl + "/reset-password?token=" + resetToken);
            variables.put("expiryHours", 1);
            variables.put("year", java.time.Year.now().getValue());

            String subject = "Đặt lại mật khẩu - TeamFlow";
            String template = "email/password-reset";

            sendHtmlEmail(to, subject, template, variables);
            log.info("✅ Đã gửi password reset email đến: {}", to);
        } catch (Exception e) {
            log.error("❌ Lỗi gửi password reset email đến {}: {}", to, e.getMessage());
        }
    }

    @Override
    @Async
    public void sendHtmlEmail(String to, String subject, String templateName, Map<String, Object> variables) {
        try {
            log.info("🔍 Processing template: {}", templateName);

            // Tạo context cho Thymeleaf
            Context context = new Context();
            context.setVariables(variables);

            // Process template thành HTML
            String htmlContent = templateEngine.process(templateName, context);
            log.info("✅ Template processed successfully, length: {}", htmlContent.length());

            // Tạo MimeMessage
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom(fromEmail);
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(htmlContent, true); // true = HTML format

            // Gửi email
            mailSender.send(message);
            log.info("📧 Email đã gửi thành công: {} -> {}", subject, to);

        } catch (MessagingException e) {
            log.error("❌ Lỗi gửi HTML email: {}", e.getMessage(), e);
            throw new RuntimeException("Không thể gửi email", e);
        }
    }

    @Override
    @Async
    public void sendTextEmail(String to, String subject, String content) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(to);
            message.setSubject(subject);
            message.setText(content);

            mailSender.send(message);
            log.debug("📧 Plain text email đã gửi: {} -> {}", subject, to);

        } catch (Exception e) {
            log.error("❌ Lỗi gửi plain text email: {}", e.getMessage());
            throw new RuntimeException("Không thể gửi email", e);
        }
    }

    @Override
    @Async
    public void sendTeamInvitationEmail(
            String to,
            String invitedUserName,
            String teamName,
            String inviterName,
            String role,
            String message,
            String token
    ) {
        try {
            log.info("📨 Gửi team invitation email đến: {}", to);

            Map<String, Object> variables = new HashMap<>();
            variables.put("invitedUserName", invitedUserName);
            variables.put("teamName", teamName);
            variables.put("inviterName", inviterName);
            variables.put("role", role);
            variables.put("message", message);
            variables.put("hasMessage", message != null && !message.trim().isEmpty());
            variables.put(
                    "acceptLink",
                    baseUrl + "/accept-invitation?token=" + token
            );

            variables.put(
                    "rejectLink",
                    baseUrl + "/accept-invitation?token=" + token + "&action=reject"
            );
            variables.put("expiryDays", 7);
            variables.put("year", java.time.Year.now().getValue());

            String subject = "Lời mời tham gia team \"" + teamName + "\" - TeamFlow";
            String template = "email/team-invitation";

            sendHtmlEmail(to, subject, template, variables);
            log.info("✅ Đã gửi team invitation email đến: {}", to);
        } catch (Exception e) {
            log.error("❌ Lỗi gửi team invitation email đến {}: {}", to, e.getMessage(), e);
            throw new RuntimeException("Không thể gửi email mời vào team", e);
        }
    }
}