package com.example.backend.repository;

import com.example.backend.model.Task;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface TaskRepository extends JpaRepository<Task, Long> {

    // ========== DASHBOARD QUERIES ==========

    /**
     * Đếm tổng số tasks của user (assigned hoặc created)
     */
    @Query("SELECT COUNT(DISTINCT t) FROM Task t " +
            "LEFT JOIN TaskAssignee ta ON ta.task = t " +
            "WHERE ta.user.id = :userId OR t.createdBy.id = :userId")
    Long countTotalTasksByUser(@Param("userId") Long userId);

    /**
     * Đếm tasks IN_PROGRESS của user
     */
    @Query("SELECT COUNT(DISTINCT t) FROM Task t " +
            "LEFT JOIN TaskAssignee ta ON ta.task = t " +
            "WHERE (ta.user.id = :userId OR t.createdBy.id = :userId) " +
            "AND t.status = 'IN_PROGRESS'")
    Long countInProgressTasksByUser(@Param("userId") Long userId);

    /**
     * Đếm tasks OVERDUE của user
     */
    @Query("SELECT COUNT(DISTINCT t) FROM Task t " +
            "LEFT JOIN TaskAssignee ta ON ta.task = t " +
            "WHERE (ta.user.id = :userId OR t.createdBy.id = :userId) " +
            "AND t.dueDate < :today " +
            "AND t.status != 'DONE'")
    Long countOverdueTasksByUser(@Param("userId") Long userId,
                                 @Param("today") LocalDate today);

    /**
     * Đếm tasks COMPLETED của user
     */
    @Query("SELECT COUNT(DISTINCT t) FROM Task t " +
            "LEFT JOIN TaskAssignee ta ON ta.task = t " +
            "WHERE (ta.user.id = :userId OR t.createdBy.id = :userId) " +
            "AND t.status = 'DONE'")
    Long countCompletedTasksByUser(@Param("userId") Long userId);

    /**
     * Đếm tasks completed this week
     */
    @Query("SELECT COUNT(DISTINCT t) FROM Task t " +
            "LEFT JOIN TaskAssignee ta ON ta.task = t " +
            "WHERE (ta.user.id = :userId OR t.createdBy.id = :userId) " +
            "AND t.status = 'DONE' " +
            "AND t.completedAt >= :weekStart")
    Long countCompletedThisWeek(@Param("userId") Long userId,
                                @Param("weekStart") LocalDateTime weekStart);

    /**
     * Đếm tasks due today
     */
    @Query("SELECT COUNT(DISTINCT t) FROM Task t " +
            "LEFT JOIN TaskAssignee ta ON ta.task = t " +
            "WHERE (ta.user.id = :userId OR t.createdBy.id = :userId) " +
            "AND t.dueDate = :today " +
            "AND t.status != 'DONE'")
    Long countTasksDueToday(@Param("userId") Long userId,
                            @Param("today") LocalDate today);

    /**
     * Lấy My Tasks (assigned to me) - chưa hoàn thành
     */
    @Query("SELECT DISTINCT t FROM Task t " +
            "JOIN TaskAssignee ta ON ta.task = t " +
            "LEFT JOIN FETCH t.project p " +
            "LEFT JOIN FETCH t.createdBy " +
            "WHERE ta.user.id = :userId " +
            "AND t.status != 'DONE' " +
            "ORDER BY t.dueDate ASC, t.priority DESC")
    List<Task> findMyTasksPending(@Param("userId") Long userId, Pageable pageable);

    /**
     * Lấy My Tasks - đã hoàn thành
     */
    @Query("SELECT DISTINCT t FROM Task t " +
            "JOIN TaskAssignee ta ON ta.task = t " +
            "LEFT JOIN FETCH t.project p " +
            "LEFT JOIN FETCH t.createdBy " +
            "WHERE ta.user.id = :userId " +
            "AND t.status = 'DONE' " +
            "ORDER BY t.completedAt DESC")
    List<Task> findMyTasksCompleted(@Param("userId") Long userId, Pageable pageable);

    /**
     * Lấy Tasks Created By Me
     */
    @Query("SELECT t FROM Task t " +
            "LEFT JOIN FETCH t.project p " +
            "WHERE t.createdBy.id = :userId " +
            "ORDER BY t.createdAt DESC")
    List<Task> findTasksCreatedByMe(@Param("userId") Long userId, Pageable pageable);

    /**
     * Đếm Tasks Created By Me
     */
    @Query("SELECT COUNT(t) FROM Task t WHERE t.createdBy.id = :userId")
    Long countTasksCreatedByMe(@Param("userId") Long userId);

    /**
     * Lấy Overdue Tasks
     */
    @Query("SELECT DISTINCT t FROM Task t " +
            "LEFT JOIN TaskAssignee ta ON ta.task = t " +
            "LEFT JOIN FETCH t.project p " +
            "LEFT JOIN FETCH t.createdBy " +
            "WHERE (ta.user.id = :userId OR t.createdBy.id = :userId) " +
            "AND t.dueDate < :today " +
            "AND t.status != 'DONE' " +
            "ORDER BY t.dueDate ASC")
    List<Task> findOverdueTasks(@Param("userId") Long userId,
                                @Param("today") LocalDate today,
                                Pageable pageable);

    /**
     * Lấy Tasks Due Today
     */
    @Query("SELECT DISTINCT t FROM Task t " +
            "LEFT JOIN TaskAssignee ta ON ta.task = t " +
            "LEFT JOIN FETCH t.project p " +
            "LEFT JOIN FETCH t.createdBy " +
            "WHERE (ta.user.id = :userId OR t.createdBy.id = :userId) " +
            "AND t.dueDate = :today " +
            "AND t.status != 'DONE' " +
            "ORDER BY t.priority DESC")
    List<Task> findTasksDueToday(@Param("userId") Long userId,
                                 @Param("today") LocalDate today,
                                 Pageable pageable);

    /**
     * Đếm tasks từ tháng trước (để tính % change)
     */
    @Query("SELECT COUNT(DISTINCT t) FROM Task t " +
            "LEFT JOIN TaskAssignee ta ON ta.task = t " +
            "WHERE (ta.user.id = :userId OR t.createdBy.id = :userId) " +
            "AND t.createdAt < :lastMonthEnd")
    Long countTasksLastMonth(@Param("userId") Long userId,
                             @Param("lastMonthEnd") LocalDateTime lastMonthEnd);

    /**
     * Đếm overdue tasks từ tuần trước
     */
    @Query("SELECT COUNT(DISTINCT t) FROM Task t " +
            "LEFT JOIN TaskAssignee ta ON ta.task = t " +
            "WHERE (ta.user.id = :userId OR t.createdBy.id = :userId) " +
            "AND t.dueDate < :lastWeekEnd " +
            "AND t.dueDate >= :lastWeekStart " +
            "AND t.status != 'DONE'")
    Long countOverdueTasksLastWeek(@Param("userId") Long userId,
                                   @Param("lastWeekStart") LocalDate lastWeekStart,
                                   @Param("lastWeekEnd") LocalDate lastWeekEnd);

    // ========== PROJECT QUERIES ==========

    /**
     * Đếm tổng số tasks trong project
     */
    @Query("SELECT COUNT(t) FROM Task t WHERE t.project.id = :projectId")
    Long countByProjectId(@Param("projectId") Long projectId);

    /**
     * Đếm tasks đã hoàn thành trong project
     */
    @Query("SELECT COUNT(t) FROM Task t " +
            "WHERE t.project.id = :projectId " +
            "AND t.status = 'DONE'")
    Long countCompletedByProjectId(@Param("projectId") Long projectId);

    /**
     * Đếm tasks đang active trong project
     */
    @Query("SELECT COUNT(t) FROM Task t " +
            "WHERE t.project.id = :projectId " +
            "AND t.status != 'DONE'")
    Long countActiveByProjectId(@Param("projectId") Long projectId);

    /**
     * Lấy tasks của project với pagination
     */
    @Query("SELECT t FROM Task t " +
            "LEFT JOIN FETCH t.createdBy " +
            "WHERE t.project.id = :projectId " +
            "ORDER BY t.createdAt DESC")
    Page<Task> findByProjectId(@Param("projectId") Long projectId, Pageable pageable);

    /**
     * Lấy tasks của project (list)
     */
    @Query("SELECT t FROM Task t " +
            "LEFT JOIN FETCH t.createdBy " +
            "WHERE t.project.id = :projectId " +
            "ORDER BY t.dueDate ASC, t.priority DESC")
    List<Task> findAllByProjectId(@Param("projectId") Long projectId);

    /**
     * Xóa tất cả tasks của project (khi xóa project)
     */
    @Modifying
    @Query("DELETE FROM Task t WHERE t.project.id = :projectId")
    void deleteByProjectId(@Param("projectId") Long projectId);

    /**
     * Đếm tasks overdue trong project
     */
    @Query("SELECT COUNT(t) FROM Task t " +
            "WHERE t.project.id = :projectId " +
            "AND t.dueDate < :today " +
            "AND t.status != 'DONE'")
    Long countOverdueByProjectId(@Param("projectId") Long projectId,
                                 @Param("today") LocalDate today);

    /**
     * Lấy tasks theo status trong project
     */
    @Query("SELECT t FROM Task t " +
            "WHERE t.project.id = :projectId " +
            "AND t.status = :status " +
            "ORDER BY t.createdAt DESC")
    List<Task> findByProjectIdAndStatus(@Param("projectId") Long projectId,
                                        @Param("status") Task.TaskStatus status);

    /**
     * Tìm task by ID với đầy đủ thông tin (fetch joins)
     */
    @Query("SELECT t FROM Task t " +
            "LEFT JOIN FETCH t.project p " +
            "LEFT JOIN FETCH t.createdBy " +
            "WHERE t.id = :taskId")
    Optional<Task> findByIdWithDetails(@Param("taskId") Long taskId);

    /**
     * Kiểm tra user có phải creator hoặc assignee của task không
     */
    @Query("SELECT CASE WHEN COUNT(t) > 0 THEN true ELSE false END " +
            "FROM Task t " +
            "LEFT JOIN TaskAssignee ta ON ta.task.id = t.id " +
            "WHERE t.id = :taskId " +
            "AND (t.createdBy.id = :userId OR ta.user.id = :userId)")
    boolean isCreatorOrAssignee(@Param("taskId") Long taskId,
                                @Param("userId") Long userId);

    /**
     * Kiểm tra user có quyền delete task không (creator hoặc project owner)
     */
    @Query("SELECT CASE WHEN COUNT(t) > 0 THEN true ELSE false END " +
            "FROM Task t " +
            "WHERE t.id = :taskId " +
            "AND (t.createdBy.id = :userId OR t.project.owner.id = :userId)")
    boolean canDeleteTask(@Param("taskId") Long taskId,
                          @Param("userId") Long userId);

    /**
     * Search tasks trong project (by title hoặc description)
     */
    @Query("SELECT DISTINCT t FROM Task t " +
            "LEFT JOIN FETCH t.createdBy " +
            "WHERE t.project.id = :projectId " +
            "AND (LOWER(t.title) LIKE LOWER(CONCAT('%', :search, '%')) " +
            "OR LOWER(t.description) LIKE LOWER(CONCAT('%', :search, '%')))")
    List<Task> searchTasksInProject(@Param("projectId") Long projectId,
                                    @Param("search") String search,
                                    Pageable pageable);

    /**
     * Lấy tasks của project với filters
     * Dùng cho advanced filtering (FR-4.6)
     */
    @Query("SELECT DISTINCT t FROM Task t " +
            "LEFT JOIN FETCH t.createdBy " +
            "LEFT JOIN TaskAssignee ta ON ta.task.id = t.id " +
            "LEFT JOIN TaskLabel tl ON tl.task.id = t.id " +
            "WHERE t.project.id = :projectId " +
            "AND (:status IS NULL OR t.status IN :status) " +
            "AND (:priority IS NULL OR t.priority IN :priority) " +
            "AND (:assigneeId IS NULL OR ta.user.id = :assigneeId) " +
            "AND (:labelId IS NULL OR tl.label.id = :labelId)")
    List<Task> findTasksWithFilters(
            @Param("projectId") Long projectId,
            @Param("status") List<Task.TaskStatus> status,
            @Param("priority") List<Task.TaskPriority> priority,
            @Param("assigneeId") Long assigneeId,
            @Param("labelId") Long labelId,
            Pageable pageable
    );

    /**
     * Lấy tasks overdue trong project
     */
    @Query("SELECT t FROM Task t " +
            "LEFT JOIN FETCH t.createdBy " +
            "WHERE t.project.id = :projectId " +
            "AND t.dueDate < :today " +
            "AND t.status != 'DONE' " +
            "ORDER BY t.dueDate ASC")
    List<Task> findOverdueTasksInProject(@Param("projectId") Long projectId,
                                         @Param("today") LocalDate today);

    /**
     * Lấy tasks due today trong project
     */
    @Query("SELECT t FROM Task t " +
            "LEFT JOIN FETCH t.createdBy " +
            "WHERE t.project.id = :projectId " +
            "AND t.dueDate = :today " +
            "AND t.status != 'DONE' " +
            "ORDER BY t.priority DESC")
    List<Task> findTasksDueTodayInProject(@Param("projectId") Long projectId,
                                          @Param("today") LocalDate today);

    /**
     * Lấy tasks due this week trong project
     */
    @Query("SELECT t FROM Task t " +
            "LEFT JOIN FETCH t.createdBy " +
            "WHERE t.project.id = :projectId " +
            "AND t.dueDate BETWEEN :startOfWeek AND :endOfWeek " +
            "AND t.status != 'DONE' " +
            "ORDER BY t.dueDate ASC")
    List<Task> findTasksDueThisWeekInProject(
            @Param("projectId") Long projectId,
            @Param("startOfWeek") LocalDate startOfWeek,
            @Param("endOfWeek") LocalDate endOfWeek
    );

    /**
     * Lấy tasks due this month trong project
     */
    @Query("SELECT t FROM Task t " +
            "LEFT JOIN FETCH t.createdBy " +
            "WHERE t.project.id = :projectId " +
            "AND t.dueDate BETWEEN :startOfMonth AND :endOfMonth " +
            "AND t.status != 'DONE' " +
            "ORDER BY t.dueDate ASC")
    List<Task> findTasksDueThisMonthInProject(
            @Param("projectId") Long projectId,
            @Param("startOfMonth") LocalDate startOfMonth,
            @Param("endOfMonth") LocalDate endOfMonth
    );

    /**
     * Đếm tasks theo từng status trong project
     */
    @Query("SELECT t.status, COUNT(t) FROM Task t " +
            "WHERE t.project.id = :projectId " +
            "GROUP BY t.status")
    List<Object[]> countTasksByStatusInProject(@Param("projectId") Long projectId);

    /**
     * Đếm tasks theo từng priority trong project
     */
    @Query("SELECT t.priority, COUNT(t) FROM Task t " +
            "WHERE t.project.id = :projectId " +
            "GROUP BY t.priority")
    List<Object[]> countTasksByPriorityInProject(@Param("projectId") Long projectId);
}