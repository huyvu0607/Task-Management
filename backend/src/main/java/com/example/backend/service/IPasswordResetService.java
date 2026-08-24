package com.example.backend.service;

public interface IPasswordResetService {

    /**
     * Tạo token reset password và gửi email
     * @param email Email của user
     * @return true nếu thành công
     */
    boolean sendPasswordResetEmail(String email);

    /**
     * Xác thực token reset password
     * @param token Token reset
     * @return true nếu token hợp lệ
     */
    boolean validateResetToken(String token);

    /**
     * Đặt lại mật khẩu mới
     * @param token Token reset
     * @param newPassword Mật khẩu mới
     * @return true nếu thành công
     */
    boolean resetPassword(String token, String newPassword);

    /**
     * Kiểm tra token có hết hạn chưa
     * @param token Token reset
     * @return true nếu còn hiệu lực
     */
    boolean isTokenExpired(String token);
}