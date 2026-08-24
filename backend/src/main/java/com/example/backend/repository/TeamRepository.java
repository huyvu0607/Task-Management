package com.example.backend.repository;

import com.example.backend.model.Team;
import com.example.backend.model.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TeamRepository extends JpaRepository<Team, Long> {

    // Kiểm tra tên team đã tồn tại chưa
    boolean existsByName(String name);

    // Kiểm tra tên team đã tồn tại chưa (trừ team hiện tại khi update)
    boolean existsByNameAndIdNot(String name, Long id);

    // Tìm team theo tên
    Optional<Team> findByName(String name);

    // Đếm số team mà user đã tạo
    long countByCreatedBy(User createdBy);

    // Lấy danh sách teams mà user đã tạo
    List<Team> findByCreatedBy(User createdBy);

    // Lấy danh sách teams mà user đã tạo (có phân trang)
    Page<Team> findByCreatedBy(User createdBy, Pageable pageable);

    // Lấy danh sách teams đang active
    List<Team> findByIsActive(Boolean isActive);

    // Lấy danh sách teams đang active (có phân trang)
    Page<Team> findByIsActive(Boolean isActive, Pageable pageable);

    // Lấy tất cả teams mà user là member (thông qua TeamMember)
    @Query("SELECT DISTINCT t FROM Team t " +
            "JOIN TeamMember tm ON tm.team.id = t.id " +
            "WHERE tm.user.id = :userId " +
            "ORDER BY tm.joinedAt DESC")
    List<Team> findTeamsByUserId(@Param("userId") Long userId);

    // Lấy tất cả teams mà user là member (có phân trang)
    @Query("SELECT DISTINCT t FROM Team t " +
            "JOIN TeamMember tm ON tm.team.id = t.id " +
            "WHERE tm.user.id = :userId " +
            "ORDER BY tm.joinedAt DESC")
    Page<Team> findTeamsByUserId(@Param("userId") Long userId, Pageable pageable);

    // Lấy teams mà user là member và team đang active
    @Query("SELECT DISTINCT t FROM Team t " +
            "JOIN TeamMember tm ON tm.team.id = t.id " +
            "WHERE tm.user.id = :userId AND t.isActive = true " +
            "ORDER BY tm.joinedAt DESC")
    List<Team> findActiveTeamsByUserId(@Param("userId") Long userId);

    // Tìm kiếm team theo tên (LIKE) mà user là member
    @Query("SELECT DISTINCT t FROM Team t " +
            "JOIN TeamMember tm ON tm.team.id = t.id " +
            "WHERE tm.user.id = :userId " +
            "AND LOWER(t.name) LIKE LOWER(CONCAT('%', :keyword, '%')) " +
            "ORDER BY t.name ASC")
    List<Team> searchTeamsByUserIdAndName(@Param("userId") Long userId,
                                          @Param("keyword") String keyword);

    // Tìm kiếm team theo tên (LIKE) mà user là member (có phân trang)
    @Query("SELECT DISTINCT t FROM Team t " +
            "JOIN TeamMember tm ON tm.team.id = t.id " +
            "WHERE tm.user.id = :userId " +
            "AND LOWER(t.name) LIKE LOWER(CONCAT('%', :keyword, '%'))")
    Page<Team> searchTeamsByUserIdAndName(@Param("userId") Long userId,
                                          @Param("keyword") String keyword,
                                          Pageable pageable);

    // Đếm số team mà user là member
    @Query("SELECT COUNT(DISTINCT t) FROM Team t " +
            "JOIN TeamMember tm ON tm.team.id = t.id " +
            "WHERE tm.user.id = :userId")
    long countTeamsByUserId(@Param("userId") Long userId);

    // Kiểm tra tên team đã tồn tại cho user cụ thể chưa
    boolean existsByNameAndCreatedBy(String name, User createdBy);

    // Kiểm tra tên team đã tồn tại cho user cụ thể (trừ team hiện tại khi update)
    boolean existsByNameAndCreatedByAndIdNot(String name, User createdBy, Long id);

}