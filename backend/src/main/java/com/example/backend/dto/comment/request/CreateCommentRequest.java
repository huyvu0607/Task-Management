package com.example.backend.dto.comment.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * Request DTO để tạo comment mới
 * FR-6.1: Thêm comment
 * FR-6.2: Mention user trong comment
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreateCommentRequest {

    /**
     * ID của task mà comment thuộc về
     * Required
     */
    @NotNull(message = "Task ID không được để trống")
    private Long taskId;

    /**
     * Nội dung comment
     * FR-6.1: Comment không được rỗng, max 1000 characters
     */
    @NotBlank(message = "Nội dung comment không được để trống")
    @Size(max = 1000, message = "Nội dung comment không được vượt quá 1000 ký tự")
    private String content;

    /**
     * Danh sách username được mention trong comment
     * FR-6.2: Mention user bằng @username
     * Optional - có thể null hoặc empty list
     *
     * Example: ["john_doe", "jane_smith"]
     */
    private List<String> mentionedUsernames;

    /**
     * Danh sách attachment IDs (nếu có attachments đã upload trước)
     * FR-6.4: Attach files
     * Optional
     *
     * Note: Attachments có thể được upload riêng trước,
     * sau đó gửi IDs khi tạo comment
     */
    private List<Long> attachmentIds;
}