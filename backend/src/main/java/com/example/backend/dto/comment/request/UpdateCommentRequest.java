package com.example.backend.dto.comment.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * Request DTO để cập nhật comment
 * FR-6.3: Edit comment
 * FR-6.2: Update mentions
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class UpdateCommentRequest {

    /**
     * Nội dung mới của comment
     * FR-6.1: Comment không được rỗng, max 1000 characters
     */
    @NotBlank(message = "Nội dung comment không được để trống")
    @Size(max = 1000, message = "Nội dung comment không được vượt quá 1000 ký tự")
    private String content;

    /**
     * Danh sách username được mention trong comment (sau khi edit)
     * FR-6.2: Update mentions khi edit comment
     * Optional
     *
     * Note: Nếu null, giữ nguyên mentions cũ
     *       Nếu empty list, xóa tất cả mentions
     *       Nếu có data, thay thế mentions cũ bằng mentions mới
     */
    private List<String> mentionedUsernames;
}