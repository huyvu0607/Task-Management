package com.example.backend.service;

import com.example.backend.dto.auth.request.SocialLoginRequest;
import com.example.backend.dto.auth.response.AuthResponse;
import com.example.backend.dto.auth.request.LoginRequest;
import com.example.backend.dto.auth.request.RegisterRequest;
import com.example.backend.model.User;

/**
 * Service interface cho xác thực và quản lý người dùng
 */
public interface AuthService {

    /**
     * Đăng ký tài khoản mới
     *
     * @param request thông tin đăng ký
     * @return thông tin xác thực sau khi đăng ký thành công
     * @throws RuntimeException nếu username hoặc email đã tồn tại
     */
    AuthResponse register(RegisterRequest request);

    /**
     * Đăng nhập vào hệ thống
     *
     * @param request thông tin đăng nhập
     * @return thông tin xác thực sau khi đăng nhập thành công
     * @throws RuntimeException nếu thông tin đăng nhập không hợp lệ hoặc tài khoản bị khóa
     */
    AuthResponse login(LoginRequest request);

    /**
     * Lấy thông tin user hiện tại
     *
     * @param username tên đăng nhập
     * @return thông tin user
     * @throws org.springframework.security.core.userdetails.UsernameNotFoundException nếu user không tồn tại
     */
    User getCurrentUser(String username);

    /**
     * Đăng nhập vào hệ thống
     *
     * @param request thông tin đăng nhập
     * @return thông tin xác thực sau khi đăng nhập thành công
     * @throws RuntimeException nếu thông tin đăng nhập không hợp lệ hoặc tài khoản bị khóa
     */
    AuthResponse socialLogin(SocialLoginRequest request);
}