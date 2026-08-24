package com.example.backend.repository;

import com.example.backend.model.CommentMention;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Repository cho CommentMention
 * Quản lý việc mention user trong comments
 */
@Repository
public interface CommentMentionRepository extends JpaRepository<CommentMention, Long> {

    /**
     * Lấy tất cả mentions trong một comment
     * Use case: Hiển thị danh sách người được mention trong comment
     */
    @Query("SELECT cm FROM CommentMention cm " +
            "LEFT JOIN FETCH cm.mentionedUser " +
            "WHERE cm.comment.id = :commentId")
    List<CommentMention> findByCommentId(@Param("commentId") Long commentId);

    /**
     * Lấy tất cả mentions của một user (user được mention)
     * Use case: Hiển thị "All mentions of me"
     */
    @Query("SELECT cm FROM CommentMention cm " +
            "LEFT JOIN FETCH cm.comment c " +
            "LEFT JOIN FETCH c.task t " +
            "WHERE cm.mentionedUser.id = :userId " +
            "ORDER BY cm.createdAt DESC")
    List<CommentMention> findByMentionedUserId(@Param("userId") Long userId);

    /**
     * Lấy mentions gần đây của một user (giới hạn số lượng)
     * Use case: Notification dropdown
     */
    @Query(value = "SELECT cm FROM CommentMention cm " +
            "LEFT JOIN FETCH cm.comment c " +
            "LEFT JOIN FETCH c.task t " +
            "WHERE cm.mentionedUser.id = :userId " +
            "ORDER BY cm.createdAt DESC",
            nativeQuery = false)
    List<CommentMention> findRecentByMentionedUserId(@Param("userId") Long userId);

    /**
     * Đếm số mentions của một user
     * Use case: Badge notification count
     */
    @Query("SELECT COUNT(cm) FROM CommentMention cm " +
            "WHERE cm.mentionedUser.id = :userId")
    Long countByMentionedUserId(@Param("userId") Long userId);

    /**
     * Kiểm tra user đã được mention trong comment chưa
     * Use case: Tránh duplicate mention
     */
    @Query("SELECT CASE WHEN COUNT(cm) > 0 THEN true ELSE false END " +
            "FROM CommentMention cm " +
            "WHERE cm.comment.id = :commentId " +
            "AND cm.mentionedUser.id = :userId")
    boolean existsByCommentIdAndMentionedUserId(
            @Param("commentId") Long commentId,
            @Param("userId") Long userId
    );

    /**
     * Xóa tất cả mentions của một comment
     * Use case: Khi update comment, xóa mentions cũ trước khi thêm mới
     */
    @Query("DELETE FROM CommentMention cm WHERE cm.comment.id = :commentId")
    void deleteByCommentId(@Param("commentId") Long commentId);

    /**
     * Lấy mentions trong nhiều comments (batch query)
     * Use case: Load mentions cho list comments
     */
    @Query("SELECT cm FROM CommentMention cm " +
            "LEFT JOIN FETCH cm.mentionedUser " +
            "WHERE cm.comment.id IN :commentIds")
    List<CommentMention> findByCommentIdIn(@Param("commentIds") List<Long> commentIds);

    /**
     * Đếm số lần user được mention trong một task
     * Use case: Analytics/Statistics
     */
    @Query("SELECT COUNT(cm) FROM CommentMention cm " +
            "WHERE cm.comment.task.id = :taskId " +
            "AND cm.mentionedUser.id = :userId")
    Long countByTaskIdAndMentionedUserId(
            @Param("taskId") Long taskId,
            @Param("userId") Long userId
    );
}