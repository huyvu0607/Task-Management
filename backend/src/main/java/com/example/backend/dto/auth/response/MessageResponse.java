package com.example.backend.dto.auth.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Response DTO cho các thông báo đơn giản
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MessageResponse {

    private String message;
    private Boolean success;

    /**
     * Constructor chỉ với message (mặc định success = true)
     */
    public MessageResponse(String message) {
        this.message = message;
        this.success = true;
    }

    /**
     * Tạo response thành công
     */
    public static MessageResponse success(String message) {
        return MessageResponse.builder()
                .message(message)
                .success(true)
                .build();
    }

    /**
     * Tạo response lỗi
     */
    public static MessageResponse error(String message) {
        return MessageResponse.builder()
                .message(message)
                .success(false)
                .build();
    }
}