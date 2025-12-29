package com.example.backend.exception;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * DTO cho error response trả về Frontend
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ErrorResponse {

    private Boolean success;

    private String message;

    private String errorCode;

    private LocalDateTime timestamp;

    private String path;

    // Constructor đơn giản
    public ErrorResponse(Boolean success, String message, String errorCode, LocalDateTime timestamp) {
        this.success = success;
        this.message = message;
        this.errorCode = errorCode;
        this.timestamp = timestamp;
    }
}