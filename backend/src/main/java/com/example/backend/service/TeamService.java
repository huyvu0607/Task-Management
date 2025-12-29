package com.example.backend.service;

import com.example.backend.dto.team.TeamDTO;
import com.example.backend.dto.team.request.CreateTeamRequest;
import com.example.backend.dto.team.request.UpdateTeamRequest;
import com.example.backend.dto.team.response.TeamListResponse;
import com.example.backend.dto.team.response.TeamResponse;
import com.example.backend.dto.team.response.TeamStatsResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface TeamService {

    /**
     * Tạo team mới
     * Business Rules:
     * - Team name phải unique
     * - User chỉ được tạo tối đa 5 teams (free plan)
     * - User tạo team sẽ tự động trở thành admin
     */
    TeamResponse createTeam(CreateTeamRequest request, Long userId);

    /**
     * Lấy thông tin chi tiết team
     * Authorization: User phải là member của team
     */
    TeamResponse getTeamById(Long teamId, Long userId);

    /**
     * Lấy danh sách tất cả teams mà user là member
     */
    List<TeamListResponse> getMyTeams(Long userId);

    /**
     * Lấy danh sách tất cả teams mà user là member (có phân trang)
     */
    Page<TeamListResponse> getMyTeams(Long userId, Pageable pageable);

    /**
     * Cập nhật thông tin team
     * Authorization: Chỉ admin mới được update
     * Business Rules:
     * - Team name phải unique (trừ chính nó)
     */
    TeamResponse updateTeam(Long teamId, UpdateTeamRequest request, Long userId);

    /**
     * Xóa team
     * Authorization: Chỉ admin mới được xóa
     * Business Rules:
     * - Xóa tất cả members, projects, tasks liên quan
     */
    void deleteTeam(Long teamId, Long userId);

    /**
     * Active/Deactive team
     * Authorization: Chỉ admin mới được thực hiện
     */
    TeamResponse toggleTeamStatus(Long teamId, Long userId);

    /**
     * Tìm kiếm teams theo tên
     */
    List<TeamListResponse> searchTeams(String keyword, Long userId);

    /**
     * Tìm kiếm teams theo tên (có phân trang)
     */
    Page<TeamListResponse> searchTeams(String keyword, Long userId, Pageable pageable);

    /**
     * Lấy thống kê của team
     * Authorization: User phải là member của team
     */
    TeamStatsResponse getTeamStats(Long teamId, Long userId);

    /**
     * Lấy thông tin team ngắn gọn (dùng cho embed vào các response khác)
     */
    TeamDTO getTeamDTO(Long teamId);

    /**
     * Kiểm tra user có phải là admin của team không
     */
    boolean isUserAdminOfTeam(Long teamId, Long userId);

    /**
     * Kiểm tra user có phải là member của team không
     */
    boolean isUserMemberOfTeam(Long teamId, Long userId);
}