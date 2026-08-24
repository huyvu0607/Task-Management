package com.example.backend.repository;

import com.example.backend.model.Project;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface ProjectRepository extends JpaRepository<Project, Long> {

    /**
     * Lấy project by ID với team info
     */
    @Query("SELECT p FROM Project p " +
            "LEFT JOIN FETCH p.team " +
            "LEFT JOIN FETCH p.owner " +
            "WHERE p.id = :id")
    Optional<Project> findByIdWithTeam(@Param("id") Long id);

    /**
     * Lấy active projects của team
     */
    @Query("SELECT p FROM Project p " +
            "WHERE p.team.id = :teamId " +
            "AND p.status = 'ACTIVE' " +
            "ORDER BY p.createdAt DESC")
    List<Project> findActiveProjectsByTeamId(@Param("teamId") Long teamId);

    /**
     * Lấy projects mà user tham gia (qua team)
     */
    @Query("SELECT DISTINCT p FROM Project p " +
            "JOIN TeamMember tm ON tm.team.id = p.team.id " +
            "WHERE tm.user.id = :userId " +
            "ORDER BY p.createdAt DESC")
    List<Project> findProjectsByUserId(@Param("userId") Long userId);

    /**
     * Lấy tất cả projects của team với filter status và pagination
     */
    @Query("SELECT p FROM Project p " +
            "LEFT JOIN FETCH p.team " +
            "LEFT JOIN FETCH p.owner " +
            "WHERE p.team.id = :teamId " +
            "AND (:status IS NULL OR p.status = :status) " +
            "ORDER BY p.createdAt DESC")
    Page<Project> findByTeamIdAndStatus(@Param("teamId") Long teamId,
                                        @Param("status") Project.ProjectStatus status,
                                        Pageable pageable);

    /**
     * Kiểm tra project name đã tồn tại trong team chưa (trừ project hiện tại)
     */
    @Query("SELECT COUNT(p) > 0 FROM Project p " +
            "WHERE p.team.id = :teamId " +
            "AND LOWER(p.name) = LOWER(:name) " +
            "AND (:excludeId IS NULL OR p.id != :excludeId) " +
            "AND p.status != 'ARCHIVED'")
    boolean existsByNameInTeam(@Param("teamId") Long teamId,
                               @Param("name") String name,
                               @Param("excludeId") Long excludeId);

    /**
     * Đếm projects theo status trong team
     */
    @Query("SELECT COUNT(p) FROM Project p " +
            "WHERE p.team.id = :teamId " +
            "AND p.status = :status")
    Long countByTeamIdAndStatus(@Param("teamId") Long teamId,
                                @Param("status") Project.ProjectStatus status);

    /**
     * Lấy projects với progress >= threshold
     */
    @Query("SELECT p FROM Project p " +
            "WHERE p.team.id = :teamId " +
            "AND p.progress >= :threshold " +
            "AND p.status = 'ACTIVE' " +
            "ORDER BY p.progress DESC")
    List<Project> findByTeamIdWithProgressAbove(@Param("teamId") Long teamId,
                                                @Param("threshold") BigDecimal threshold);

    /**
     * Lấy projects sắp hết hạn (end date trong X ngày tới)
     */
    @Query("SELECT p FROM Project p " +
            "WHERE p.team.id = :teamId " +
            "AND p.endDate BETWEEN :startDate AND :endDate " +
            "AND p.status = 'ACTIVE' " +
            "ORDER BY p.endDate ASC")
    List<Project> findProjectsEndingSoon(@Param("teamId") Long teamId,
                                         @Param("startDate") LocalDate startDate,
                                         @Param("endDate") LocalDate endDate);

    /**
     * Lấy projects của team với sorting
     */
    @Query("SELECT p FROM Project p " +
            "LEFT JOIN FETCH p.team " +
            "LEFT JOIN FETCH p.owner " +
            "WHERE p.team.id = :teamId " +
            "AND p.status != 'ARCHIVED'")
    List<Project> findByTeamId(@Param("teamId") Long teamId);

    /**
     * Tìm project theo name trong team (cho validation)
     */
    @Query("SELECT p FROM Project p " +
            "WHERE p.team.id = :teamId " +
            "AND LOWER(p.name) = LOWER(:name) " +
            "AND p.status != 'ARCHIVED'")
    Optional<Project> findByTeamIdAndName(@Param("teamId") Long teamId,
                                          @Param("name") String name);

    Long countByTeamId(Long teamId);
}