package com.example.backend.controller;

import com.example.backend.dto.response.ApiResponse;
import com.example.backend.dto.response.PageResponse;
import com.example.backend.dto.team.TeamDTO;
import com.example.backend.dto.team.request.CreateTeamRequest;
import com.example.backend.dto.team.request.UpdateTeamRequest;
import com.example.backend.dto.team.response.TeamListResponse;
import com.example.backend.dto.team.response.TeamResponse;
import com.example.backend.dto.team.response.TeamStatsResponse;
import com.example.backend.security.UserDetailsImpl;
import com.example.backend.service.TeamService;
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
@RequestMapping("/api/teams")
@RequiredArgsConstructor
@Slf4j
public class TeamController {

    private final TeamService teamService;

    @PostMapping
    public ResponseEntity<ApiResponse<TeamResponse>> createTeam(
            @Valid @RequestBody CreateTeamRequest request,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {

        log.info("Creating team: {} by user: {}", request.getName(), userDetails.getId());

        TeamResponse team = teamService.createTeam(request, userDetails.getId());

        // ✅ FIX: Đổi thứ tự tham số - message trước, data sau
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.success("Team được tạo thành công", team));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<TeamResponse>> getTeamById(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {

        log.info("Getting team: {} by user: {}", id, userDetails.getId());

        TeamResponse team = teamService.getTeamById(id, userDetails.getId());

        return ResponseEntity.ok(ApiResponse.success(team));
    }

    @GetMapping("/my-teams")
    public ResponseEntity<ApiResponse<?>> getMyTeams(
            @AuthenticationPrincipal UserDetailsImpl userDetails,
            @RequestParam(required = false) Integer page,
            @RequestParam(required = false) Integer size) {

        log.info("Getting teams for user: {}", userDetails.getId());

        if (page == null || size == null) {
            List<TeamListResponse> teams = teamService.getMyTeams(userDetails.getId());
            return ResponseEntity.ok(ApiResponse.success(teams));
        }

        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Page<TeamListResponse> teamsPage = teamService.getMyTeams(userDetails.getId(), pageable);

        // ✅ FIX: Dùng page/size thay vì pageNumber/pageSize
        PageResponse<TeamListResponse> pageResponse = PageResponse.<TeamListResponse>builder()
                .content(teamsPage.getContent())
                .page(teamsPage.getNumber())           // ← page
                .size(teamsPage.getSize())             // ← size
                .totalElements(teamsPage.getTotalElements())
                .totalPages(teamsPage.getTotalPages())
                .last(teamsPage.isLast())
                .first(teamsPage.isFirst())            // ← thêm first
                .build();

        return ResponseEntity.ok(ApiResponse.success(pageResponse));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<TeamResponse>> updateTeam(
            @PathVariable Long id,
            @Valid @RequestBody UpdateTeamRequest request,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {

        log.info("Updating team: {} by user: {}", id, userDetails.getId());

        TeamResponse team = teamService.updateTeam(id, request, userDetails.getId());

        // ✅ FIX: Đổi thứ tự tham số
        return ResponseEntity.ok(ApiResponse.success("Team được cập nhật thành công", team));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteTeam(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {

        log.info("Deleting team: {} by user: {}", id, userDetails.getId());

        teamService.deleteTeam(id, userDetails.getId());

        // ✅ FIX: Đổi thứ tự tham số
        return ResponseEntity.ok(ApiResponse.success("Team đã được xóa thành công", null));
    }

    @PatchMapping("/{id}/toggle-status")
    public ResponseEntity<ApiResponse<TeamResponse>> toggleTeamStatus(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {

        log.info("Toggling status of team: {} by user: {}", id, userDetails.getId());

        TeamResponse team = teamService.toggleTeamStatus(id, userDetails.getId());

        // ✅ FIX: Đổi thứ tự tham số
        return ResponseEntity.ok(ApiResponse.success("Trạng thái team đã được cập nhật", team));
    }

    @GetMapping("/search")
    public ResponseEntity<ApiResponse<?>> searchTeams(
            @RequestParam String keyword,
            @AuthenticationPrincipal UserDetailsImpl userDetails,
            @RequestParam(required = false) Integer page,
            @RequestParam(required = false) Integer size) {

        log.info("Searching teams with keyword: {} by user: {}", keyword, userDetails.getId());

        if (page == null || size == null) {
            List<TeamListResponse> teams = teamService.searchTeams(keyword, userDetails.getId());
            return ResponseEntity.ok(ApiResponse.success(teams));
        }

        Pageable pageable = PageRequest.of(page, size);
        Page<TeamListResponse> teamsPage = teamService.searchTeams(keyword, userDetails.getId(), pageable);

        // ✅ FIX: Dùng page/size thay vì pageNumber/pageSize
        PageResponse<TeamListResponse> pageResponse = PageResponse.<TeamListResponse>builder()
                .content(teamsPage.getContent())
                .page(teamsPage.getNumber())
                .size(teamsPage.getSize())
                .totalElements(teamsPage.getTotalElements())
                .totalPages(teamsPage.getTotalPages())
                .last(teamsPage.isLast())
                .first(teamsPage.isFirst())
                .build();

        return ResponseEntity.ok(ApiResponse.success(pageResponse));
    }

    @GetMapping("/{id}/stats")
    public ResponseEntity<ApiResponse<TeamStatsResponse>> getTeamStats(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {

        log.info("Getting stats for team: {} by user: {}", id, userDetails.getId());

        TeamStatsResponse stats = teamService.getTeamStats(id, userDetails.getId());

        return ResponseEntity.ok(ApiResponse.success(stats));
    }

    @GetMapping("/{id}/simple")
    public ResponseEntity<ApiResponse<TeamDTO>> getTeamDTO(
            @PathVariable Long id) {

        log.info("Getting simple team info: {}", id);

        TeamDTO team = teamService.getTeamDTO(id);

        return ResponseEntity.ok(ApiResponse.success(team));
    }

    @GetMapping("/{id}/is-admin")
    public ResponseEntity<ApiResponse<Boolean>> isUserAdmin(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {

        boolean isAdmin = teamService.isUserAdminOfTeam(id, userDetails.getId());

        return ResponseEntity.ok(ApiResponse.success(isAdmin));
    }

    @GetMapping("/{id}/is-member")
    public ResponseEntity<ApiResponse<Boolean>> isUserMember(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {

        boolean isMember = teamService.isUserMemberOfTeam(id, userDetails.getId());

        return ResponseEntity.ok(ApiResponse.success(isMember));
    }
}