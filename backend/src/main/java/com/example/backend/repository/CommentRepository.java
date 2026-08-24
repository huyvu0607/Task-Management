package com.example.backend.repository;

import com.example.backend.model.Comment;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface CommentRepository extends JpaRepository<Comment, Long> {

    // ========== EXISTING METHODS (GIỮ NGUYÊN) ==========

    /**
     * Đếm số lượng comments của một task
     */
    @Query("SELECT COUNT(c) FROM Comment c WHERE c.task.id = :taskId")
    Long countByTaskId(@Param("taskId") Long taskId);

    /**
     * Đếm số lượng comments của nhiều tasks (batch query)
     * Return: Map<taskId, count>
     */
    @Query("SELECT c.task.id, COUNT(c) FROM Comment c " +
            "WHERE c.task.id IN :taskIds " +
            "GROUP BY c.task.id")
    List<Object[]> countByTaskIdIn(@Param("taskIds") List<Long> taskIds);

    /**
     * Lấy comments của một task
     */
    @Query("SELECT c FROM Comment c " +
            "LEFT JOIN FETCH c.user u " +
            "WHERE c.task.id = :taskId " +
            "ORDER BY c.createdAt DESC")
    List<Comment> findByTaskId(@Param("taskId") Long taskId);

    // ========== NEW METHODS (THÊM MỚI) ==========

    /**
     * Lấy comment by ID với eager loading user và task
     * Use case: Get comment detail để hiển thị hoặc edit
     */
    @Query("SELECT c FROM Comment c " +
            "LEFT JOIN FETCH c.user " +
            "LEFT JOIN FETCH c.task " +
            "WHERE c.id = :commentId")
    Optional<Comment> findByIdWithUser(@Param("commentId") Long commentId);

    /**
     * Lấy comments của task với mentions và attachments
     * Use case: Hiển thị full comment với mentions và attachments
     */
    // ✅ SỬA THÀNH NÀY (CHỈ FETCH USER)
    @Query("SELECT c FROM Comment c " +
            "LEFT JOIN FETCH c.user " +
            "WHERE c.task.id = :taskId " +
            "ORDER BY c.createdAt DESC")
    List<Comment> findByTaskIdWithMentions(@Param("taskId") Long taskId);
    /**
     * Lấy comments của user (comments mà user đã tạo)
     * Use case: User profile - "My comments"
     */
    @Query("SELECT c FROM Comment c " +
            "LEFT JOIN FETCH c.task t " +
            "WHERE c.user.id = :userId " +
            "ORDER BY c.createdAt DESC")
    List<Comment> findByUserId(@Param("userId") Long userId);

    /**
     * Lấy comments của user với phân trang
     */
    @Query("SELECT c FROM Comment c " +
            "LEFT JOIN FETCH c.task t " +
            "WHERE c.user.id = :userId " +
            "ORDER BY c.createdAt DESC")
    Page<Comment> findByUserId(@Param("userId") Long userId, Pageable pageable);

    /**
     * Lấy comments đã được edit
     * Use case: Audit log, moderation
     */
    @Query("SELECT c FROM Comment c " +
            "LEFT JOIN FETCH c.user " +
            "WHERE c.isEdited = true " +
            "AND c.task.id = :taskId " +
            "ORDER BY c.editedAt DESC")
    List<Comment> findEditedCommentsByTaskId(@Param("taskId") Long taskId);

    /**
     * Lấy comments gần đây của một task (giới hạn số lượng)
     * Use case: Preview comments trên task card
     */
    @Query(value = "SELECT c FROM Comment c " +
            "LEFT JOIN FETCH c.user " +
            "WHERE c.task.id = :taskId " +
            "ORDER BY c.createdAt DESC")
    List<Comment> findRecentByTaskId(
            @Param("taskId") Long taskId,
            Pageable pageable
    );

    /**
     * Tìm kiếm comments theo nội dung
     * Use case: Search comments trong task
     */
    @Query("SELECT c FROM Comment c " +
            "LEFT JOIN FETCH c.user " +
            "WHERE c.task.id = :taskId " +
            "AND LOWER(c.content) LIKE LOWER(CONCAT('%', :keyword, '%')) " +
            "ORDER BY c.createdAt DESC")
    List<Comment> searchByTaskIdAndContent(
            @Param("taskId") Long taskId,
            @Param("keyword") String keyword
    );

    /**
     * Lấy comments có chứa attachments
     * Use case: Filter comments with files
     */
    @Query("SELECT DISTINCT c FROM Comment c " +
            "LEFT JOIN FETCH c.attachments a " +
            "WHERE c.task.id = :taskId " +
            "AND SIZE(c.attachments) > 0 " +
            "ORDER BY c.createdAt DESC")
    List<Comment> findByTaskIdWithAttachments(@Param("taskId") Long taskId);

    /**
     * Lấy comments trong khoảng thời gian
     * Use case: Activity report, analytics
     */
    @Query("SELECT c FROM Comment c " +
            "LEFT JOIN FETCH c.user " +
            "WHERE c.task.id = :taskId " +
            "AND c.createdAt BETWEEN :startDate AND :endDate " +
            "ORDER BY c.createdAt DESC")
    List<Comment> findByTaskIdAndDateRange(
            @Param("taskId") Long taskId,
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate
    );

    /**
     * Đếm số comments của user trong một task
     * Use case: User statistics
     */
    @Query("SELECT COUNT(c) FROM Comment c " +
            "WHERE c.task.id = :taskId " +
            "AND c.user.id = :userId")
    Long countByTaskIdAndUserId(
            @Param("taskId") Long taskId,
            @Param("userId") Long userId
    );

    /**
     * Kiểm tra user có quyền edit/delete comment không
     * Use case: Authorization check
     */
    @Query("SELECT CASE WHEN COUNT(c) > 0 THEN true ELSE false END " +
            "FROM Comment c " +
            "WHERE c.id = :commentId " +
            "AND c.user.id = :userId")
    boolean isCommentOwner(
            @Param("commentId") Long commentId,
            @Param("userId") Long userId
    );
}