package com.example.backend.controller;

import com.example.backend.dto.comment.request.CreateCommentRequest;
import com.example.backend.dto.comment.request.UpdateCommentRequest;
import com.example.backend.dto.comment.response.AttachmentResponse;
import com.example.backend.dto.comment.response.CommentDetailResponse;
import com.example.backend.dto.comment.response.CommentResponse;
import com.example.backend.dto.response.ApiResponse;
import com.example.backend.security.UserDetailsImpl;
import com.example.backend.service.ICommentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

/**
 * REST Controller cho Comment Management
 *
 * Endpoints:
 * - POST   /api/comments                    - Tạo comment
 * - GET    /api/comments/{id}               - Lấy comment detail
 * - PUT    /api/comments/{id}               - Cập nhật comment
 * - DELETE /api/comments/{id}               - Xóa comment
 * - GET    /api/tasks/{taskId}/comments     - Lấy comments của task
 * - POST   /api/comments/attachments        - Upload attachment
 * - DELETE /api/attachments/{id}            - Xóa attachment
 */
@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
@Slf4j
public class CommentController {

    private final ICommentService CommentService;

    // ========== COMMENT CRUD ==========

    /**
     * Tạo comment mới
     * FR-6.1: Thêm comment
     * FR-6.2: Mention user trong comment
     *
     * POST /api/comments
     * Body: CreateCommentRequest
     */
    @PostMapping("/comments")
    public ResponseEntity<ApiResponse<CommentResponse>> createComment(
            @Valid @RequestBody CreateCommentRequest request,
            @AuthenticationPrincipal UserDetailsImpl userDetails
    ) {
        log.info("📝 [POST /api/comments] User {} tạo comment cho task {}",
                userDetails.getUsername(), request.getTaskId());

        CommentResponse response = CommentService.createComment(request, userDetails.getId());

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.success("Đã tạo comment thành công", response));
    }

    /**
     * Lấy comment detail
     * GET /api/comments/{id}
     */
    @GetMapping("/comments/{id}")
    public ResponseEntity<ApiResponse<CommentDetailResponse>> getCommentById(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetailsImpl userDetails
    ) {
        log.info("📋 [GET /api/comments/{}] User {} xem comment",
                id, userDetails.getUsername());

        CommentDetailResponse response = CommentService.getCommentById(id, userDetails.getId());

        return ResponseEntity.ok(ApiResponse.success(response));
    }

    /**
     * Lấy tất cả comments của task
     * GET /api/tasks/{taskId}/comments
     */
    @GetMapping("/tasks/{taskId}/comments")
    public ResponseEntity<ApiResponse<List<CommentResponse>>> getCommentsByTask(
            @PathVariable Long taskId,
            @AuthenticationPrincipal UserDetailsImpl userDetails
    ) {
        log.info("📋 [GET /api/tasks/{}/comments] User {} xem comments",
                taskId, userDetails.getUsername());

        List<CommentResponse> comments = CommentService.getCommentsByTask(taskId, userDetails.getId());

        return ResponseEntity.ok(ApiResponse.success("Lấy danh sách comments thành công", comments));
    }

    /**
     * Cập nhật comment
     * FR-6.3: Edit comment (chỉ author có quyền)
     *
     * PUT /api/comments/{id}
     * Body: UpdateCommentRequest
     */
    @PutMapping("/comments/{id}")
    public ResponseEntity<ApiResponse<CommentResponse>> updateComment(
            @PathVariable Long id,
            @Valid @RequestBody UpdateCommentRequest request,
            @AuthenticationPrincipal UserDetailsImpl userDetails
    ) {
        log.info("✏️ [PUT /api/comments/{}] User {} cập nhật comment",
                id, userDetails.getUsername());

        CommentResponse response = CommentService.updateComment(id, request, userDetails.getId());

        return ResponseEntity.ok(ApiResponse.success("Đã cập nhật comment thành công", response));
    }

    /**
     * Xóa comment
     * FR-6.3: Delete comment (author hoặc admin)
     *
     * DELETE /api/comments/{id}
     */
    @DeleteMapping("/comments/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteComment(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetailsImpl userDetails
    ) {
        log.info("🗑️ [DELETE /api/comments/{}] User {} xóa comment",
                id, userDetails.getUsername());

        CommentService.deleteComment(id, userDetails.getId());

        return ResponseEntity.ok(ApiResponse.success("Đã xóa comment thành công", null));
    }

    // ========== ATTACHMENT MANAGEMENT ==========

    /**
     * Upload attachment
     * FR-6.4: Attach files to task/comment
     *
     * POST /api/comments/attachments
     * Form Data:
     * - file: MultipartFile (required)
     * - commentId: Long (optional, nếu attach vào comment)
     * - taskId: Long (optional, nếu attach vào task)
     */
    @PostMapping(value = "/comments/attachments", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<AttachmentResponse>> uploadAttachment(
            @RequestParam(required = false) Long commentId,
            @RequestParam(required = false) Long taskId,
            @RequestParam("file") MultipartFile file,
            @AuthenticationPrincipal UserDetailsImpl userDetails
    ) {
        log.info("📤 [POST /api/comments/attachments] User {} upload file: {}",
                userDetails.getUsername(), file.getOriginalFilename());

        AttachmentResponse response = CommentService.uploadAttachment(
                commentId,
                taskId,
                file,
                userDetails.getId()
        );

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.success("Upload file thành công", response));
    }

    /**
     * Upload nhiều files cùng lúc
     *
     * POST /api/comments/attachments/bulk
     * Form Data:
     * - files: MultipartFile[] (required)
     * - commentId: Long (optional)
     * - taskId: Long (optional)
     */
    @PostMapping(value = "/comments/attachments/bulk", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<List<AttachmentResponse>>> uploadMultipleAttachments(
            @RequestParam(required = false) Long commentId,
            @RequestParam(required = false) Long taskId,
            @RequestParam("files") List<MultipartFile> files,
            @AuthenticationPrincipal UserDetailsImpl userDetails
    ) {
        log.info("📤 [POST /api/comments/attachments/bulk] User {} upload {} files",
                userDetails.getUsername(), files.size());

        List<AttachmentResponse> responses = CommentService.uploadMultipleAttachments(
                commentId,
                taskId,
                files,
                userDetails.getId()
        );

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.success("Upload " + responses.size() + " files thành công", responses));
    }

    /**
     * Lấy attachments của task
     * GET /api/tasks/{taskId}/attachments
     */
    @GetMapping("/tasks/{taskId}/attachments")
    public ResponseEntity<ApiResponse<List<AttachmentResponse>>> getAttachmentsByTask(
            @PathVariable Long taskId
    ) {
        log.info("📋 [GET /api/tasks/{}/attachments] Lấy attachments", taskId);

        List<AttachmentResponse> attachments = CommentService.getAttachmentsByTask(taskId);

        return ResponseEntity.ok(ApiResponse.success(attachments));
    }

    /**
     * Lấy attachments của comment
     * GET /api/comments/{commentId}/attachments
     */
    @GetMapping("/comments/{commentId}/attachments")
    public ResponseEntity<ApiResponse<List<AttachmentResponse>>> getAttachmentsByComment(
            @PathVariable Long commentId
    ) {
        log.info("📋 [GET /api/comments/{}/attachments] Lấy attachments", commentId);

        List<AttachmentResponse> attachments = CommentService.getAttachmentsByComment(commentId);

        return ResponseEntity.ok(ApiResponse.success(attachments));
    }

    /**
     * Xóa attachment
     * FR-6.4: Chỉ uploader hoặc admin có quyền xóa
     *
     * DELETE /api/attachments/{id}
     */
    @DeleteMapping("/attachments/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteAttachment(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetailsImpl userDetails
    ) {
        log.info("🗑️ [DELETE /api/attachments/{}] User {} xóa attachment",
                id, userDetails.getUsername());

        CommentService.deleteAttachment(id, userDetails.getId());

        return ResponseEntity.ok(ApiResponse.success("Đã xóa file thành công", null));
    }

    // ========== SEARCH & FILTER ==========

    /**
     * Tìm kiếm comments theo nội dung
     * GET /api/tasks/{taskId}/comments/search?keyword={keyword}
     */
    @GetMapping("/tasks/{taskId}/comments/search")
    public ResponseEntity<ApiResponse<List<CommentResponse>>> searchComments(
            @PathVariable Long taskId,
            @RequestParam String keyword,
            @AuthenticationPrincipal UserDetailsImpl userDetails
    ) {
        log.info("🔍 [GET /api/tasks/{}/comments/search] Keyword: {}", taskId, keyword);

        List<CommentResponse> comments = CommentService.searchComments(
                taskId,
                keyword,
                userDetails.getId()
        );

        return ResponseEntity.ok(ApiResponse.success(comments));
    }

    /**
     * Lấy comments có attachments
     * GET /api/tasks/{taskId}/comments/with-attachments
     */
    @GetMapping("/tasks/{taskId}/comments/with-attachments")
    public ResponseEntity<ApiResponse<List<CommentResponse>>> getCommentsWithAttachments(
            @PathVariable Long taskId,
            @AuthenticationPrincipal UserDetailsImpl userDetails
    ) {
        log.info("📋 [GET /api/tasks/{}/comments/with-attachments]", taskId);

        List<CommentResponse> comments = CommentService.getCommentsWithAttachments(
                taskId,
                userDetails.getId()
        );

        return ResponseEntity.ok(ApiResponse.success(comments));
    }

    // ========== STATISTICS ==========

    /**
     * Đếm số comments của task
     * GET /api/tasks/{taskId}/comments/count
     */
    @GetMapping("/tasks/{taskId}/comments/count")
    public ResponseEntity<ApiResponse<Long>> countCommentsByTask(
            @PathVariable Long taskId
    ) {
        Long count = CommentService.countCommentsByTask(taskId);
        return ResponseEntity.ok(ApiResponse.success(count));
    }

    /**
     * Đếm số attachments của task
     * GET /api/tasks/{taskId}/attachments/count
     */
    @GetMapping("/tasks/{taskId}/attachments/count")
    public ResponseEntity<ApiResponse<Long>> countAttachmentsByTask(
            @PathVariable Long taskId
    ) {
        Long count = CommentService.countAttachmentsByTask(taskId);
        return ResponseEntity.ok(ApiResponse.success(count));
    }
}