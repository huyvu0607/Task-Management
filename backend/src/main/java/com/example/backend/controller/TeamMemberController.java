package com.example.backend.controller;

import com.example.backend.dto.response.ApiResponse;
import com.example.backend.dto.response.PageResponse;
import com.example.backend.dto.team.request.InviteMemberRequest;
import com.example.backend.dto.team.request.UpdateMemberRoleRequest;
import com.example.backend.dto.team.response.TeamMemberResponse;
import com.example.backend.model.TeamMember.TeamRole;
import com.example.backend.security.UserDetailsImpl;
import com.example.backend.service.TeamMemberService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/teams/{teamId}/members")
@RequiredArgsConstructor
@Slf4j
public class TeamMemberController {

    private final TeamMemberService teamMemberService;

    @GetMapping
    public ResponseEntity<ApiResponse<?>> getTeamMembers(
            @PathVariable Long teamId,
            @AuthenticationPrincipal UserDetailsImpl userDetails,
            @RequestParam(required = false) Integer page,
            @RequestParam(required = false) Integer size) {

        log.info("Getting members of team {} by user {}", teamId, userDetails.getId());

        if (page == null || size == null) {
            List<TeamMemberResponse> members = teamMemberService.getTeamMembers(
                    teamId, userDetails.getId());
            return ResponseEntity.ok(ApiResponse.success(members));
        }

        Pageable pageable = PageRequest.of(page, size, Sort.by("joinedAt").descending());
        Page<TeamMemberResponse> membersPage = teamMemberService.getTeamMembers(
                teamId, userDetails.getId(), pageable);

        // ✅ FIX: Dùng page/size thay vì pageNumber/pageSize
        PageResponse<TeamMemberResponse> pageResponse = PageResponse.<TeamMemberResponse>builder()
                .content(membersPage.getContent())
                .page(membersPage.getNumber())           // ← page
                .size(membersPage.getSize())             // ← size
                .totalElements(membersPage.getTotalElements())
                .totalPages(membersPage.getTotalPages())
                .last(membersPage.isLast())
                .first(membersPage.isFirst())            // ← thêm first
                .build();

        return ResponseEntity.ok(ApiResponse.success(pageResponse));
    }

    @GetMapping("/{memberId}")
    public ResponseEntity<ApiResponse<TeamMemberResponse>> getMemberById(
            @PathVariable Long teamId,
            @PathVariable Long memberId,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {

        log.info("Getting member {} of team {} by user {}",
                memberId, teamId, userDetails.getId());

        TeamMemberResponse member = teamMemberService.getMemberById(
                teamId, memberId, userDetails.getId());

        return ResponseEntity.ok(ApiResponse.success(member));
    }

    @PatchMapping("/{memberId}/role")
    public ResponseEntity<ApiResponse<TeamMemberResponse>> updateMemberRole(
            @PathVariable Long teamId,
            @PathVariable Long memberId,
            @Valid @RequestBody UpdateMemberRoleRequest request,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {

        log.info("Updating role of member {} in team {} to {} by user {}",
                memberId, teamId, request.getRole(), userDetails.getId());

        TeamMemberResponse member = teamMemberService.updateMemberRole(
                teamId, memberId, request, userDetails.getId());

        // ✅ FIX: Đổi thứ tự tham số
        return ResponseEntity.ok(ApiResponse.success("Vai trò thành viên đã được cập nhật", member));
    }

    @DeleteMapping("/{memberId}")
    public ResponseEntity<ApiResponse<Void>> removeMember(
            @PathVariable Long teamId,
            @PathVariable Long memberId,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {

        log.info("Removing member {} from team {} by user {}",
                memberId, teamId, userDetails.getId());

        teamMemberService.removeMember(teamId, memberId, userDetails.getId());

        // ✅ FIX: Đổi thứ tự tham số
        return ResponseEntity.ok(ApiResponse.success("Thành viên đã được xóa khỏi team", null));
    }

    @PostMapping("/leave")
    public ResponseEntity<ApiResponse<Void>> leaveTeam(
            @PathVariable Long teamId,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {

        log.info("User {} leaving team {}", userDetails.getId(), teamId);

        teamMemberService.leaveTeam(teamId, userDetails.getId());

        // ✅ FIX: Đổi thứ tự tham số
        return ResponseEntity.ok(ApiResponse.success("Bạn đã rời khỏi team thành công", null));
    }

    @GetMapping("/search")
    public ResponseEntity<ApiResponse<?>> searchMembers(
            @PathVariable Long teamId,
            @RequestParam String keyword,
            @AuthenticationPrincipal UserDetailsImpl userDetails,
            @RequestParam(required = false) Integer page,
            @RequestParam(required = false) Integer size) {

        log.info("Searching members with keyword '{}' in team {} by user {}",
                keyword, teamId, userDetails.getId());

        if (page == null || size == null) {
            List<TeamMemberResponse> members = teamMemberService.searchMembers(
                    teamId, keyword, userDetails.getId());
            return ResponseEntity.ok(ApiResponse.success(members));
        }

        Pageable pageable = PageRequest.of(page, size);
        Page<TeamMemberResponse> membersPage = teamMemberService.searchMembers(
                teamId, keyword, userDetails.getId(), pageable);

        // ✅ FIX: Dùng page/size thay vì pageNumber/pageSize
        PageResponse<TeamMemberResponse> pageResponse = PageResponse.<TeamMemberResponse>builder()
                .content(membersPage.getContent())
                .page(membersPage.getNumber())
                .size(membersPage.getSize())
                .totalElements(membersPage.getTotalElements())
                .totalPages(membersPage.getTotalPages())
                .last(membersPage.isLast())
                .first(membersPage.isFirst())
                .build();

        return ResponseEntity.ok(ApiResponse.success(pageResponse));
    }

    @GetMapping("/by-role")
    public ResponseEntity<ApiResponse<List<TeamMemberResponse>>> getMembersByRole(
            @PathVariable Long teamId,
            @RequestParam TeamRole role,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {

        log.info("Getting members with role {} of team {} by user {}",
                role, teamId, userDetails.getId());

        List<TeamMemberResponse> members = teamMemberService.getMembersByRole(
                teamId, role, userDetails.getId());

        return ResponseEntity.ok(ApiResponse.success(members));
    }

    @GetMapping("/my-role")
    public ResponseEntity<ApiResponse<TeamRole>> getMyRole(
            @PathVariable Long teamId,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {

        log.info("Getting role of user {} in team {}", userDetails.getId(), teamId);

        TeamRole role = teamMemberService.getUserRoleInTeam(teamId, userDetails.getId());

        return ResponseEntity.ok(ApiResponse.success(role));
    }
}