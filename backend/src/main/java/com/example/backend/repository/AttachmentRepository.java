package com.example.backend.repository;

import com.example.backend.model.Attachment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AttachmentRepository extends JpaRepository<Attachment, Long> {

    // ========== EXISTING METHODS (GIỮ NGUYÊN) ==========

    /**
     * Đếm số lượng attachments của một task
     */
    @Query("SELECT COUNT(a) FROM Attachment a WHERE a.task.id = :taskId")
    Long countByTaskId(@Param("taskId") Long taskId);

    /**
     * Đếm số lượng attachments của nhiều tasks (batch query)
     * Return: List<Object[]> where Object[0] = taskId, Object[1] = count
     */
    @Query("SELECT a.task.id, COUNT(a) FROM Attachment a " +
            "WHERE a.task.id IN :taskIds " +
            "GROUP BY a.task.id")
    List<Object[]> countByTaskIdIn(@Param("taskIds") List<Long> taskIds);

    /**
     * Lấy attachments của một task
     */
    @Query("SELECT a FROM Attachment a " +
            "LEFT JOIN FETCH a.uploadedBy " +
            "WHERE a.task.id = :taskId " +
            "ORDER BY a.createdAt DESC")
    List<Attachment> findByTaskId(@Param("taskId") Long taskId);

    // ========== NEW METHODS (THÊM MỚI) ==========

    /**
     * Lấy attachments của một comment
     * Use case: FR-6.4 - Attach files to comment
     */
    @Query("SELECT a FROM Attachment a " +
            "LEFT JOIN FETCH a.uploadedBy " +
            "WHERE a.comment.id = :commentId " +
            "ORDER BY a.createdAt DESC")
    List<Attachment> findByCommentId(@Param("commentId") Long commentId);

    /**
     * Lấy attachment by ID với user info
     * Use case: Download attachment, check permissions
     */
    @Query("SELECT a FROM Attachment a " +
            "LEFT JOIN FETCH a.uploadedBy " +
            "WHERE a.id = :attachmentId")
    Optional<Attachment> findByIdWithUser(@Param("attachmentId") Long attachmentId);

    /**
     * Đếm số attachments của comment
     * Use case: Validation (max 5 files per task)
     */
    @Query("SELECT COUNT(a) FROM Attachment a WHERE a.comment.id = :commentId")
    Long countByCommentId(@Param("commentId") Long commentId);

    /**
     * Lấy tất cả attachments của user (người upload)
     * Use case: User profile - "My uploads"
     */
    @Query("SELECT a FROM Attachment a " +
            "WHERE a.uploadedBy.id = :userId " +
            "ORDER BY a.createdAt DESC")
    List<Attachment> findByUploadedById(@Param("userId") Long userId);

    /**
     * Tính tổng dung lượng files của task
     * Use case: Storage quota check
     */
    @Query("SELECT COALESCE(SUM(a.fileSize), 0) FROM Attachment a " +
            "WHERE a.task.id = :taskId")
    Long sumFileSizeByTaskId(@Param("taskId") Long taskId);

    /**
     * Tính tổng dung lượng files của comment
     * Use case: Storage quota check
     */
    @Query("SELECT COALESCE(SUM(a.fileSize), 0) FROM Attachment a " +
            "WHERE a.comment.id = :commentId")
    Long sumFileSizeByCommentId(@Param("commentId") Long commentId);

    /**
     * Lấy attachments theo file type
     * Use case: Filter by file type (images, documents, etc.)
     */
    @Query("SELECT a FROM Attachment a " +
            "LEFT JOIN FETCH a.uploadedBy " +
            "WHERE a.task.id = :taskId " +
            "AND a.fileType IN :fileTypes " +
            "ORDER BY a.createdAt DESC")
    List<Attachment> findByTaskIdAndFileTypes(
            @Param("taskId") Long taskId,
            @Param("fileTypes") List<String> fileTypes
    );

    /**
     * Tìm kiếm attachments theo tên file
     * Use case: Search files in task
     */
    @Query("SELECT a FROM Attachment a " +
            "LEFT JOIN FETCH a.uploadedBy " +
            "WHERE a.task.id = :taskId " +
            "AND LOWER(a.fileName) LIKE LOWER(CONCAT('%', :keyword, '%')) " +
            "ORDER BY a.createdAt DESC")
    List<Attachment> searchByTaskIdAndFileName(
            @Param("taskId") Long taskId,
            @Param("keyword") String keyword
    );

    /**
     * Kiểm tra user có quyền delete attachment không
     * Use case: Authorization - chỉ uploader hoặc admin có quyền xóa
     */
    @Query("SELECT CASE WHEN COUNT(a) > 0 THEN true ELSE false END " +
            "FROM Attachment a " +
            "WHERE a.id = :attachmentId " +
            "AND a.uploadedBy.id = :userId")
    boolean isAttachmentOwner(
            @Param("attachmentId") Long attachmentId,
            @Param("userId") Long userId
    );

    /**
     * Lấy attachments của task trong comment
     * Use case: Show all attachments in task (from task + from comments)
     */
    @Query("SELECT a FROM Attachment a " +
            "LEFT JOIN FETCH a.uploadedBy " +
            "WHERE (a.task.id = :taskId OR a.comment.task.id = :taskId) " +
            "ORDER BY a.createdAt DESC")
    List<Attachment> findAllByTaskId(@Param("taskId") Long taskId);

    /**
     * Đếm tổng số attachments trong task (bao gồm cả trong comments)
     * Use case: Validation - max 5 files per task
     */
    @Query("SELECT COUNT(a) FROM Attachment a " +
            "WHERE a.task.id = :taskId OR a.comment.task.id = :taskId")
    Long countAllByTaskId(@Param("taskId") Long taskId);

    /**
     * Lấy attachments images (để hiển thị preview)
     * Use case: Show image gallery
     */
    @Query("SELECT a FROM Attachment a " +
            "LEFT JOIN FETCH a.uploadedBy " +
            "WHERE a.task.id = :taskId " +
            "AND a.mimeType LIKE 'image/%' " +
            "ORDER BY a.createdAt DESC")
    List<Attachment> findImagesByTaskId(@Param("taskId") Long taskId);
}