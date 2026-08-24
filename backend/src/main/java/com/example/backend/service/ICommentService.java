package com.example.backend.service;

import com.example.backend.dto.comment.request.CreateCommentRequest;
import com.example.backend.dto.comment.request.UpdateCommentRequest;
import com.example.backend.dto.comment.response.AttachmentResponse;
import com.example.backend.dto.comment.response.CommentDetailResponse;
import com.example.backend.dto.comment.response.CommentResponse;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

/**
 * Service interface cho Comment
 * Quản lý comments và attachments
 */
public interface ICommentService {

    // ========== COMMENT CRUD ==========

    /**
     * Tạo comment mới
     * FR-6.1: Thêm comment
     * FR-6.2: Mention user
     *
     * @param request CreateCommentRequest
     * @param userId ID của user tạo comment
     * @return CommentResponse
     */
    CommentResponse createComment(CreateCommentRequest request, Long userId);

    /**
     * Lấy comment by ID
     *
     * @param commentId ID của comment
     * @param userId ID của current user (để check permissions)
     * @return CommentDetailResponse
     */
    CommentDetailResponse getCommentById(Long commentId, Long userId);

    /**
     * Lấy tất cả comments của một task
     *
     * @param taskId ID của task
     * @param userId ID của current user
     * @return List comments
     */
    List<CommentResponse> getCommentsByTask(Long taskId, Long userId);

    /**
     * Cập nhật comment
     * FR-6.3: Edit comment
     *
     * @param commentId ID của comment
     * @param request UpdateCommentRequest
     * @param userId ID của user (để check ownership)
     * @return CommentResponse
     */
    CommentResponse updateComment(Long commentId, UpdateCommentRequest request, Long userId);

    /**
     * Xóa comment
     * FR-6.3: Delete comment
     *
     * @param commentId ID của comment
     * @param userId ID của user (để check permissions)
     */
    void deleteComment(Long commentId, Long userId);

    // ========== ATTACHMENT MANAGEMENT ==========

    /**
     * Upload attachment cho comment
     * FR-6.4: Attach files to comment
     *
     * @param commentId ID của comment (null nếu attach vào task)
     * @param taskId ID của task (null nếu attach vào comment)
     * @param file File upload
     * @param userId ID của user upload
     * @return AttachmentResponse
     */
    AttachmentResponse uploadAttachment(
            Long commentId,
            Long taskId,
            MultipartFile file,
            Long userId
    );

    /**
     * Upload nhiều files cùng lúc
     *
     * @param commentId ID của comment
     * @param taskId ID của task
     * @param files Danh sách files
     * @param userId ID của user
     * @return List AttachmentResponse
     */
    List<AttachmentResponse> uploadMultipleAttachments(
            Long commentId,
            Long taskId,
            List<MultipartFile> files,
            Long userId
    );

    /**
     * Lấy attachments của task
     *
     * @param taskId ID của task
     * @return List attachments
     */
    List<AttachmentResponse> getAttachmentsByTask(Long taskId);

    /**
     * Lấy attachments của comment
     *
     * @param commentId ID của comment
     * @return List attachments
     */
    List<AttachmentResponse> getAttachmentsByComment(Long commentId);

    /**
     * Download attachment
     *
     * @param attachmentId ID của attachment
     * @param userId ID của user (để check permissions)
     * @return byte[] file data
     */
    byte[] downloadAttachment(Long attachmentId, Long userId);

    /**
     * Xóa attachment
     * FR-6.4: User có quyền xóa attachment của mình
     *
     * @param attachmentId ID của attachment
     * @param userId ID của user
     */
    void deleteAttachment(Long attachmentId, Long userId);

    // ========== SEARCH & FILTER ==========

    /**
     * Tìm kiếm comments theo nội dung
     *
     * @param taskId ID của task
     * @param keyword Từ khóa tìm kiếm
     * @param userId ID của current user
     * @return List comments
     */
    List<CommentResponse> searchComments(Long taskId, String keyword, Long userId);

    /**
     * Lấy comments có attachments
     *
     * @param taskId ID của task
     * @param userId ID của current user
     * @return List comments có files
     */
    List<CommentResponse> getCommentsWithAttachments(Long taskId, Long userId);

    // ========== STATISTICS ==========

    /**
     * Đếm số comments của task
     *
     * @param taskId ID của task
     * @return Số lượng comments
     */
    Long countCommentsByTask(Long taskId);

    /**
     * Đếm số attachments của task
     *
     * @param taskId ID của task
     * @return Số lượng attachments
     */
    Long countAttachmentsByTask(Long taskId);
}