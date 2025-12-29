package com.example.backend.exception;

import lombok.Getter;
import org.springframework.http.HttpStatus;

/**
 * Base exception cho tất cả business logic errors
 * Thay vì tạo nhiều exception class, ta dùng errorCode để phân biệt
 */
@Getter
public class BusinessException extends RuntimeException {

    private final String errorCode;
    private final HttpStatus status;

    public BusinessException(String message, String errorCode, HttpStatus status) {
        super(message);
        this.errorCode = errorCode;
        this.status = status;
    }

    public BusinessException(String message, String errorCode) {
        this(message, errorCode, HttpStatus.BAD_REQUEST);
    }

    // ========== STATIC FACTORY METHODS ==========

    // 404 - Not Found
    public static BusinessException notFound(String entity, Long id) {
        return new BusinessException(
                entity + " với ID " + id + " không tồn tại",
                entity.toUpperCase() + "_NOT_FOUND",
                HttpStatus.NOT_FOUND
        );
    }

    public static BusinessException notFound(String message, String errorCode) {
        return new BusinessException(message, errorCode, HttpStatus.NOT_FOUND);
    }

    // 400 - Bad Request
    public static BusinessException badRequest(String message, String errorCode) {
        return new BusinessException(message, errorCode, HttpStatus.BAD_REQUEST);
    }

    // 403 - Forbidden
    public static BusinessException forbidden(String message) {
        return new BusinessException(
                message,
                "FORBIDDEN",
                HttpStatus.FORBIDDEN
        );
    }

    // 409 - Conflict
    public static BusinessException conflict(String message, String errorCode) {
        return new BusinessException(
                message,
                errorCode,
                HttpStatus.CONFLICT
        );
    }

    // 422 - Unprocessable Entity
    public static BusinessException unprocessable(String message, String errorCode) {
        return new BusinessException(
                message,
                errorCode,
                HttpStatus.UNPROCESSABLE_ENTITY
        );
    }
}