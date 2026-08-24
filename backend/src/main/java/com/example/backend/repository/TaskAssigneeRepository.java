package com.example.backend.repository;

import com.example.backend.model.TaskAssignee;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TaskAssigneeRepository extends JpaRepository<TaskAssignee, Long> {

    /**
     * Lấy danh sách assignees của một task
     */
    @Query("SELECT ta FROM TaskAssignee ta " +
            "LEFT JOIN FETCH ta.user u " +
            "WHERE ta.task.id = :taskId")
    List<TaskAssignee> findByTaskId(@Param("taskId") Long taskId);

    /**
     * Lấy danh sách assignees của nhiều tasks (batch query)
     */
    @Query("SELECT ta FROM TaskAssignee ta " +
            "LEFT JOIN FETCH ta.user u " +
            "WHERE ta.task.id IN :taskIds")
    List<TaskAssignee> findByTaskIdIn(@Param("taskIds") List<Long> taskIds);

    /**
     * Check xem user có được assign vào task không
     */
    @Query("SELECT COUNT(ta) > 0 FROM TaskAssignee ta " +
            "WHERE ta.task.id = :taskId AND ta.user.id = :userId")
    boolean existsByTaskIdAndUserId(@Param("taskId") Long taskId,
                                    @Param("userId") Long userId);

    /**
     * Đếm số lượng assignees của một task
     */
    @Query("SELECT COUNT(ta) FROM TaskAssignee ta WHERE ta.task.id = :taskId")
    Long countByTaskId(@Param("taskId") Long taskId);
    /**
     * Xóa tất cả assignees của task
     */
    @Modifying
    @Query("DELETE FROM TaskAssignee ta WHERE ta.task.id = :taskId")
    void deleteByTaskId(@Param("taskId") Long taskId);

    /**
     * Xóa assignee cụ thể khỏi task
     */
    @Modifying
    @Query("DELETE FROM TaskAssignee ta " +
            "WHERE ta.task.id = :taskId AND ta.user.id = :userId")
    void deleteByTaskIdAndUserId(@Param("taskId") Long taskId,
                                 @Param("userId") Long userId);

    /**
     * Lấy danh sách user IDs của assignees trong task
     */
    @Query("SELECT ta.user.id FROM TaskAssignee ta WHERE ta.task.id = :taskId")
    List<Long> findUserIdsByTaskId(@Param("taskId") Long taskId);

    /**
     * Check xem có assignee nào trong list users không
     */
    @Query("SELECT COUNT(ta) > 0 FROM TaskAssignee ta " +
            "WHERE ta.task.id = :taskId " +
            "AND ta.user.id IN :userIds")
    boolean hasAnyAssignee(@Param("taskId") Long taskId,
                           @Param("userIds") List<Long> userIds);

    @Query("SELECT ta FROM TaskAssignee ta " +
            "JOIN FETCH ta.task t " +
            "JOIN FETCH t.project p " +
            "JOIN FETCH p.team " +
            "LEFT JOIN FETCH t.createdBy " +
            "WHERE ta.user.id = :userId " +
            "ORDER BY t.dueDate ASC NULLS LAST, t.priority DESC")
    List<TaskAssignee> findByUserId(@Param("userId") Long userId);
}