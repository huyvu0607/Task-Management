package com.example.backend.service;

import com.example.backend.dto.team.request.InviteMemberRequest;
import com.example.backend.dto.team.request.UpdateMemberRoleRequest;
import com.example.backend.dto.team.response.TeamMemberResponse;
import com.example.backend.model.TeamMember.TeamRole;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface ITeamMemberService {

    /**
     * Mời member vào team
     * Authorization: Chỉ admin mới được mời
     * Business Rules:
     * - Email phải tồn tại trong hệ thống
     * - User chưa là member của team
     * - Team chưa đạt giới hạn 50 members
     * - Gửi email invitation
     */
    TeamMemberResponse inviteMember(Long teamId, InviteMemberRequest request, Long inviterId);

    /**
     * Lấy danh sách members của team
     * Authorization: User phải là member của team
     */
    List<TeamMemberResponse> getTeamMembers(Long teamId, Long userId);

    /**
     * Lấy danh sách members của team (có phân trang)
     * Authorization: User phải là member của team
     */
    Page<TeamMemberResponse> getTeamMembers(Long teamId, Long userId, Pageable pageable);

    /**
     * Lấy thông tin chi tiết member
     * Authorization: User phải là member của team
     */
    TeamMemberResponse getMemberById(Long teamId, Long memberId, Long userId);

    /**
     * Cập nhật role của member
     * Authorization: Chỉ admin mới được update
     * Business Rules:
     * - Không thể tự đổi role của chính mình
     * - Phải có ít nhất 1 admin (không thể demote admin cuối cùng)
     */
    TeamMemberResponse updateMemberRole(Long teamId, Long memberId,
                                        UpdateMemberRoleRequest request, Long userId);

    /**
     * Remove member khỏi team
     * Authorization: Chỉ admin mới được remove
     * Business Rules:
     * - Không thể remove chính mình nếu là admin duy nhất
     * - Tasks assigned cho member sẽ trở thành unassigned
     */
    void removeMember(Long teamId, Long memberId, Long userId);

    /**
     * User tự rời khỏi team
     * Business Rules:
     * - Admin không thể rời nếu là admin duy nhất
     * - Tasks assigned cho user sẽ trở thành unassigned
     */
    void leaveTeam(Long teamId, Long userId);

    /**
     * Tìm kiếm members trong team
     * Authorization: User phải là member của team
     */
    List<TeamMemberResponse> searchMembers(Long teamId, String keyword, Long userId);

    /**
     * Tìm kiếm members trong team (có phân trang)
     * Authorization: User phải là member của team
     */
    Page<TeamMemberResponse> searchMembers(Long teamId, String keyword,
                                           Long userId, Pageable pageable);

    /**
     * Lấy danh sách members theo role
     * Authorization: User phải là member của team
     */
    List<TeamMemberResponse> getMembersByRole(Long teamId, TeamRole role, Long userId);

    /**
     * Lấy role của user trong team
     */
    TeamRole getUserRoleInTeam(Long teamId, Long userId);
}