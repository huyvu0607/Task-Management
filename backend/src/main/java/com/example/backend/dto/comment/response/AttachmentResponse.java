package com.example.backend.dto.comment.response;

import com.example.backend.dto.dashboard.UserSimpleDTO;
import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * Response DTO cho Attachment
 * FR-6.4: Attach files to task/comment
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AttachmentResponse {

    /**
     * ID của attachment
     */
    private Long id;

    /**
     * ID của task (nếu attach vào task)
     */
    private Long taskId;

    /**
     * ID của comment (nếu attach vào comment)
     */
    private Long commentId;

    /**
     * Tên file gốc
     */
    private String fileName;

    /**
     * URL để download file
     * Format: /api/attachments/{id}/download
     */
    private String downloadUrl;

    /**
     * URL xem trước (nếu là image)
     * Dùng filePath từ Cloudinary
     */
    private String previewUrl;

    /**
     * Kích thước file (bytes)
     */
    private Long fileSize;

    /**
     * Kích thước file (human readable)
     * Example: "1.5 MB", "256 KB"
     */
    private String fileSizeFormatted;

    /**
     * Loại file (extension)
     * Example: "pdf", "docx", "png"
     */
    private String fileType;

    /**
     * MIME type
     * Example: "application/pdf", "image/png"
     */
    private String mimeType;

    /**
     * File có phải là ảnh không (để hiển thị preview)
     */
    private Boolean isImage;

    /**
     * User upload file
     */
    private UserSimpleDTO uploadedBy;

    /**
     * Thời gian upload
     */
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime createdAt;

    /**
     * Flag để check quyền delete
     * true = current user có quyền delete attachment này
     */
    private Boolean canDelete;
}