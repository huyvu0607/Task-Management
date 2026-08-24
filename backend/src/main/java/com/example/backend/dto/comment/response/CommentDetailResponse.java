package com.example.backend.dto.comment.response;

import com.example.backend.dto.dashboard.UserSimpleDTO;
import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Response DTO cho Comment Detail (dạng đầy đủ)
 * Dùng khi xem chi tiết một comment cụ thể
 * Bao gồm cả attachments đầy đủ
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CommentDetailResponse {

    /**
     * ID của comment
     */
    private Long id;

    /**
     * ID của task
     */
    private Long taskId;

    /**
     * Tên task (để hiển thị context)
     */
    private String taskTitle;

    /**
     * Nội dung comment
     */
    private String content;

    /**
     * User tạo comment
     */
    private UserSimpleDTO user;

    /**
     * Comment đã được edit chưa
     */
    private Boolean isEdited;

    /**
     * Thời gian edit
     */
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime editedAt;

    /**
     * Danh sách users được mention
     * FR-6.2: Mention user
     */
    private List<MentionResponse> mentions;

    /**
     * Danh sách attachments (đầy đủ thông tin)
     * FR-6.4: Attach files
     */
    private List<AttachmentResponse> attachments;

    /**
     * Thời gian tạo
     */
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime createdAt;

    /**
     * Thời gian cập nhật
     */
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime updatedAt;

    /**
     * Permissions
     */
    private Boolean canEdit;
    private Boolean canDelete;
}