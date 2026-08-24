package com.example.backend.security;

import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.AuthenticationEntryPoint;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.util.HashMap;
import java.util.Map;

/**
 * Entry point xử lý các request không có quyền truy cập (401 Unauthorized)
 * Được gọi khi user cố gắng truy cập protected endpoint mà không có token hợp lệ
 */
@Component
@Slf4j
public class JwtAuthenticationEntryPoint implements AuthenticationEntryPoint {

    @Override
    public void commence(HttpServletRequest request,
                         HttpServletResponse response,
                         AuthenticationException authException) throws IOException {

        log.error("Unauthorized error: {} - Path: {}", authException.getMessage(), request.getServletPath());

        // Set response content type
        response.setContentType("application/json;charset=UTF-8");
        response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);

        // Tạo response body
        Map<String, Object> data = new HashMap<>();
        data.put("success", false);
        data.put("message", "Unauthorized - Bạn cần đăng nhập để truy cập tài nguyên này");
        data.put("path", request.getServletPath());
        data.put("error", authException.getMessage());

        // Write response
        ObjectMapper mapper = new ObjectMapper();
        response.getOutputStream().println(mapper.writeValueAsString(data));
    }
}