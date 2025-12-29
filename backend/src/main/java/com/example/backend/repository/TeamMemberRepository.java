package com.example.backend.repository;

import com.example.backend.model.TeamMember;
import com.example.backend.model.TeamMember.TeamRole;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TeamMemberRepository extends JpaRepository<TeamMember, Long> {

    /**
     * Lấy danh sách teams mà user tham gia
     */
    @Query("SELECT tm FROM TeamMember tm " +
            "LEFT JOIN FETCH tm.team " +
            "WHERE tm.user.id = :userId")
    List<TeamMember> findByUserId(@Param("userId") Long userId);

    /**
     * Lấy danh sách members của một team
     */
    @Query("SELECT tm FROM TeamMember tm " +
            "LEFT JOIN FETCH tm.user " +
            "WHERE tm.team.id = :teamId")
    List<TeamMember> findByTeamId(@Param("teamId") Long teamId);

    /**
     * Lấy danh sách members của một team (có phân trang)
     */
    @Query("SELECT tm FROM TeamMember tm " +
            "LEFT JOIN FETCH tm.user " +
            "WHERE tm.team.id = :teamId")
    Page<TeamMember> findByTeamIdWithPagination(@Param("teamId") Long teamId, Pageable pageable);

    /**
     * Check xem user có trong team không
     */
    @Query("SELECT COUNT(tm) > 0 FROM TeamMember tm " +
            "WHERE tm.team.id = :teamId AND tm.user.id = :userId")
    boolean existsByTeamIdAndUserId(@Param("teamId") Long teamId,
                                    @Param("userId") Long userId);

    /**
     * Lấy team member record
     */
    @Query("SELECT tm FROM TeamMember tm " +
            "WHERE tm.team.id = :teamId AND tm.user.id = :userId")
    Optional<TeamMember> findByTeamIdAndUserId(@Param("teamId") Long teamId,
                                               @Param("userId") Long userId);

    // ========== BỔ SUNG CÁC METHODS CẦN THIẾT ==========

    /**
     * Đếm số members trong team
     */
    @Query("SELECT COUNT(tm) FROM TeamMember tm WHERE tm.team.id = :teamId")
    long countByTeamId(@Param("teamId") Long teamId);

    /**
     * Kiểm tra user có phải là admin của team không
     */
    @Query("SELECT COUNT(tm) > 0 FROM TeamMember tm " +
            "WHERE tm.team.id = :teamId " +
            "AND tm.user.id = :userId " +
            "AND tm.role = 'ADMIN'")
    boolean isUserAdminOfTeam(@Param("teamId") Long teamId, @Param("userId") Long userId);

    /**
     * Đếm số admin trong team (để check last admin)
     */
    @Query("SELECT COUNT(tm) FROM TeamMember tm " +
            "WHERE tm.team.id = :teamId AND tm.role = 'ADMIN'")
    long countAdminsByTeamId(@Param("teamId") Long teamId);

    /**
     * Lấy role của user trong team
     */
    @Query("SELECT tm.role FROM TeamMember tm " +
            "WHERE tm.team.id = :teamId AND tm.user.id = :userId")
    Optional<TeamRole> findRoleByTeamIdAndUserId(@Param("teamId") Long teamId,
                                                 @Param("userId") Long userId);

    /**
     * Lấy danh sách members theo role
     */
    @Query("SELECT tm FROM TeamMember tm " +
            "LEFT JOIN FETCH tm.user " +
            "WHERE tm.team.id = :teamId AND tm.role = :role")
    List<TeamMember> findByTeamIdAndRole(@Param("teamId") Long teamId,
                                         @Param("role") TeamRole role);

    /**
     * Đếm số members theo role trong team
     */
    @Query("SELECT COUNT(tm) FROM TeamMember tm " +
            "WHERE tm.team.id = :teamId AND tm.role = :role")
    long countByTeamIdAndRole(@Param("teamId") Long teamId, @Param("role") TeamRole role);

    /**
     * Tìm kiếm members trong team theo tên hoặc email
     */
    @Query("SELECT tm FROM TeamMember tm " +
            "LEFT JOIN FETCH tm.user u " +
            "WHERE tm.team.id = :teamId " +
            "AND (LOWER(u.fullName) LIKE LOWER(CONCAT('%', :keyword, '%')) " +
            "OR LOWER(u.email) LIKE LOWER(CONCAT('%', :keyword, '%')) " +
            "OR LOWER(u.username) LIKE LOWER(CONCAT('%', :keyword, '%')))")
    List<TeamMember> searchMembersInTeam(@Param("teamId") Long teamId,
                                         @Param("keyword") String keyword);

    /**
     * Tìm kiếm members trong team theo tên hoặc email (có phân trang)
     */
    @Query("SELECT tm FROM TeamMember tm " +
            "LEFT JOIN FETCH tm.user u " +
            "WHERE tm.team.id = :teamId " +
            "AND (LOWER(u.fullName) LIKE LOWER(CONCAT('%', :keyword, '%')) " +
            "OR LOWER(u.email) LIKE LOWER(CONCAT('%', :keyword, '%')) " +
            "OR LOWER(u.username) LIKE LOWER(CONCAT('%', :keyword, '%')))")
    Page<TeamMember> searchMembersInTeamWithPagination(@Param("teamId") Long teamId,
                                                       @Param("keyword") String keyword,
                                                       Pageable pageable);

    /**
     * Xóa member khỏi team
     */
    void deleteByTeamIdAndUserId(@Param("teamId") Long teamId, @Param("userId") Long userId);

    /**
     * Xóa tất cả members của team
     */
    void deleteByTeamId(@Param("teamId") Long teamId);

    /**
     * Lấy danh sách members được mời bởi user cụ thể
     */
    @Query("SELECT tm FROM TeamMember tm " +
            "LEFT JOIN FETCH tm.user " +
            "WHERE tm.team.id = :teamId AND tm.invitedBy.id = :invitedById")
    List<TeamMember> findByTeamIdAndInvitedById(@Param("teamId") Long teamId,
                                                @Param("invitedById") Long invitedById);
}