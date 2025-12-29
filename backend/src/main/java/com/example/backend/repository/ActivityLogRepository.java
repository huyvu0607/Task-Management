package com.example.backend.repository;

import com.example.backend.model.ActivityLog;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Repository
public interface ActivityLogRepository extends JpaRepository<ActivityLog, Long> {

    // ================= DELETE =================

    @Modifying
    @Query("DELETE FROM ActivityLog a WHERE a.task.id = :taskId")
    void deleteByTaskId(@Param("taskId") Long taskId);
    /**
     * Lấy recent activities của user và team members
     * Hiển thị activities từ:
     * - Chính user đó
     * - Team members trong cùng team
     */
    @Query("SELECT a FROM ActivityLog a " +
            "LEFT JOIN FETCH a.user u " +
            "LEFT JOIN FETCH a.task t " +
            "LEFT JOIN FETCH a.project p " +
            "WHERE a.user.id IN (" +
            "    SELECT tm.user.id FROM TeamMember tm " +
            "    WHERE tm.team.id IN (" +
            "        SELECT tm2.team.id FROM TeamMember tm2 " +
            "        WHERE tm2.user.id = :userId" +
            "    )" +
            ") " +
            "OR a.user.id = :userId " +
            "ORDER BY a.createdAt DESC")
    List<ActivityLog> findRecentActivities(@Param("userId") Long userId, Pageable pageable);

    /**
     * Lấy activities của một user cụ thể
     */
    @Query("SELECT a FROM ActivityLog a " +
            "LEFT JOIN FETCH a.user " +
            "LEFT JOIN FETCH a.task " +
            "LEFT JOIN FETCH a.project " +
            "WHERE a.user.id = :userId " +
            "ORDER BY a.createdAt DESC")
    List<ActivityLog> findByUserId(@Param("userId") Long userId, Pageable pageable);

    /**
     * Lấy activities của một task
     */
    @Query("SELECT a FROM ActivityLog a " +
            "LEFT JOIN FETCH a.user " +
            "WHERE a.task.id = :taskId " +
            "ORDER BY a.createdAt DESC")
    List<ActivityLog> findByTaskId(@Param("taskId") Long taskId, Pageable pageable);

    /**
     * Lấy activities của một project
     */
    @Query("SELECT a FROM ActivityLog a " +
            "LEFT JOIN FETCH a.user " +
            "WHERE a.project.id = :projectId " +
            "ORDER BY a.createdAt DESC")
    List<ActivityLog> findByProjectId(@Param("projectId") Long projectId, Pageable pageable);
}