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
 * Response DTO cho Comment (dạng simple/list)
 * Dùng khi hiển thị danh sách comments
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CommentResponse {

    /**
     * ID của comment
     */
    private Long id;

    /**
     * ID của task
     */
    private Long taskId;

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
     * FR-6.3: Show "edited" label
     */
    private Boolean isEdited;

    /**
     * Thời gian edit (nếu đã edit)
     */
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime editedAt;

    /**
     * Danh sách users được mention trong comment
     * FR-6.2: Mention user
     */
    private List<MentionResponse> mentions;

/**
* Lấy ảnh từ cloudiary
* */
    private List<AttachmentResponse> attachments;
    /**
     * Số lượng attachments
     * FR-6.4: Attach files
     */
    private Integer attachmentCount;

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
     * Flag để check quyền edit/delete
     * true = current user có quyền edit/delete comment này
     */
    private Boolean canEdit;

    /**
     * Flag để check quyền delete (admin có thể delete bất kỳ comment nào)
     */
    private Boolean canDelete;
}