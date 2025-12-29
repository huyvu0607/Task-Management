package com.example.backend.controller;

import com.example.backend.dto.response.ApiResponse;
import com.example.backend.dto.response.PageResponse;
import com.example.backend.dto.task.request.AssignTaskRequest;
import com.example.backend.dto.task.request.CreateTaskRequest;
import com.example.backend.dto.task.request.TaskFilterRequest;
import com.example.backend.dto.task.request.UpdateTaskRequest;
import com.example.backend.dto.task.response.TaskDetailResponse;
import com.example.backend.dto.task.response.TaskListResponse;
import com.example.backend.security.UserDetailsImpl;
import com.example.backend.service.TaskService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

/**
 * REST Controller for Task Management
 * Handles all task-related operations including CRUD, assignment, filtering, and status updates
 */
@RestController
@RequestMapping("/api/v1/tasks")
@RequiredArgsConstructor
@Slf4j
public class TaskController {

    private final TaskService taskService;

    /**
     * FR-4.1: Create new task
     * Creates a new task in a project. User must be a member of the team.
     *
     * @param userDetails authenticated user details
     * @param request task creation request
     * @return created task details
     */
    @PostMapping
    public ResponseEntity<ApiResponse<TaskDetailResponse>> createTask(
            @AuthenticationPrincipal UserDetailsImpl userDetails,
            @Valid @RequestBody CreateTaskRequest request
    ) {
        log.info("[TaskController] Creating task | User: {} | Title: {} | Project: {}",
                userDetails.getUsername(), request.getTitle(), request.getProjectId());

        try {
            TaskDetailResponse response = taskService.createTask(userDetails.getUsername(), request);
            log.info("[TaskController] Task created successfully | TaskId: {} | User: {}",
                    response.getId(), userDetails.getUsername());
            return ResponseEntity
                    .status(HttpStatus.CREATED)
                    .body(ApiResponse.success("Task được tạo thành công", response));

        } catch (Exception e) {
            log.error("[TaskController] Failed to create task | User: {} | Error: {}",
                    userDetails.getUsername(), e.getMessage());
            return ResponseEntity
                    .status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error(e.getMessage()));
        }
    }

    /**
     * FR-4.2: Get task details
     * Retrieves detailed information of a task including assignees, labels, comments, and attachments
     *
     * @param userDetails authenticated user details
     * @param taskId ID of the task
     * @return task details
     */
    @GetMapping("/{taskId}")
    public ResponseEntity<ApiResponse<TaskDetailResponse>> getTaskDetail(
            @AuthenticationPrincipal UserDetailsImpl userDetails,
            @PathVariable Long taskId
    ) {
        log.info("[TaskController] Getting task detail | User: {} | TaskId: {}",
                userDetails.getUsername(), taskId);

        try {
            TaskDetailResponse response = taskService.getTaskDetail(userDetails.getUsername(), taskId);
            return ResponseEntity.ok(ApiResponse.success("Lấy thông tin task thành công", response));

        } catch (Exception e) {
            log.error("[TaskController] Failed to get task detail | User: {} | TaskId: {} | Error: {}",
                    userDetails.getUsername(), taskId, e.getMessage());
            return ResponseEntity
                    .status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.error(e.getMessage()));
        }
    }

    /**
     * FR-4.3: Update task
     * Updates task information. Only creator and assignees have permission to update.
     *
     * @param userDetails authenticated user details
     * @param taskId ID of the task
     * @param request task update request
     * @return updated task details
     */
    @PutMapping("/{taskId}")
    public ResponseEntity<ApiResponse<TaskDetailResponse>> updateTask(
            @AuthenticationPrincipal UserDetailsImpl userDetails,
            @PathVariable Long taskId,
            @Valid @RequestBody UpdateTaskRequest request
    ) {
        log.info("[TaskController] Updating task | User: {} | TaskId: {}",
                userDetails.getUsername(), taskId);

        try {
            TaskDetailResponse response = taskService.updateTask(userDetails.getUsername(), taskId, request);
            log.info("[TaskController] Task updated successfully | TaskId: {} | User: {}",
                    taskId, userDetails.getUsername());
            return ResponseEntity.ok(ApiResponse.success("Cập nhật task thành công", response));

        } catch (Exception e) {
            log.error("[TaskController] Failed to update task | User: {} | TaskId: {} | Error: {}",
                    userDetails.getUsername(), taskId, e.getMessage());
            return ResponseEntity
                    .status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error(e.getMessage()));
        }
    }

    /**
     * FR-4.4: Delete task
     * Deletes a task from the project. Only creator, assignees, and admin have permission to delete.
     *
     * @param userDetails authenticated user details
     * @param taskId ID of the task
     * @return success response
     */
    @DeleteMapping("/{taskId}")
    public ResponseEntity<ApiResponse<Void>> deleteTask(
            @AuthenticationPrincipal UserDetailsImpl userDetails,
            @PathVariable Long taskId
    ) {
        log.info("[TaskController] Deleting task | User: {} | TaskId: {}",
                userDetails.getUsername(), taskId);

        try {
            taskService.deleteTask(userDetails.getUsername(), taskId);
            log.info("[TaskController] Task deleted successfully | TaskId: {} | User: {}",
                    taskId, userDetails.getUsername());
            return ResponseEntity.ok(ApiResponse.<Void>success("Xóa task thành công", null));

        } catch (Exception e) {
            log.error("[TaskController] Failed to delete task | User: {} | TaskId: {} | Error: {}",
                    userDetails.getUsername(), taskId, e.getMessage());
            return ResponseEntity
                    .status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error(e.getMessage()));
        }
    }

    /**
     * FR-4.5: Assign task to users
     * Assigns a task to one or more users in the team
     *
     * @param userDetails authenticated user details
     * @param taskId ID of the task
     * @param request assignment request containing assignee IDs
     * @return updated task details with assignees
     */
    @PostMapping("/{taskId}/assign")
    public ResponseEntity<ApiResponse<TaskDetailResponse>> assignTask(
            @AuthenticationPrincipal UserDetailsImpl userDetails,
            @PathVariable Long taskId,
            @Valid @RequestBody AssignTaskRequest request
    ) {
        log.info("[TaskController] Assigning task | User: {} | TaskId: {} | Assignees: {}",
                userDetails.getUsername(), taskId, request.getAssigneeIds());

        try {
            TaskDetailResponse response = taskService.assignTask(userDetails.getUsername(), taskId, request);
            log.info("[TaskController] Task assigned successfully | TaskId: {} | AssigneeCount: {}",
                    taskId, request.getAssigneeIds().size());
            return ResponseEntity.ok(ApiResponse.success("Assign task thành công", response));

        } catch (Exception e) {
            log.error("[TaskController] Failed to assign task | User: {} | TaskId: {} | Error: {}",
                    userDetails.getUsername(), taskId, e.getMessage());
            return ResponseEntity
                    .status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error(e.getMessage()));
        }
    }

    /**
     * FR-4.6 & FR-4.7: Filter and search tasks
     * Filters and searches tasks by multiple criteria: status, priority, assignee, label, due date
     *
     * @param userDetails authenticated user details
     * @param projectId ID of the project
     * @param request filter criteria
     * @return paginated list of filtered tasks
     */
    @PostMapping("/project/{projectId}/filter")
    public ResponseEntity<ApiResponse<PageResponse<TaskListResponse>>> filterTasks(
            @AuthenticationPrincipal UserDetailsImpl userDetails,
            @PathVariable Long projectId,
            @Valid @RequestBody TaskFilterRequest request
    ) {
        log.info("[TaskController] Filtering tasks | User: {} | ProjectId: {} | Filters: {}",
                userDetails.getUsername(), projectId, request);

        try {
            PageResponse<TaskListResponse> response = taskService.filterTasks(
                    userDetails.getUsername(), projectId, request);
            log.info("[TaskController] Tasks filtered successfully | ProjectId: {} | ResultCount: {}",
                    projectId, response.getTotalElements());
            return ResponseEntity.ok(ApiResponse.success("Lấy danh sách tasks thành công", response));

        } catch (Exception e) {
            log.error("[TaskController] Failed to filter tasks | User: {} | ProjectId: {} | Error: {}",
                    userDetails.getUsername(), projectId, e.getMessage());
            return ResponseEntity
                    .status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error(e.getMessage()));
        }
    }

    /**
     * Get all tasks of a project
     * Retrieves a paginated list of all tasks in a project
     *
     * @param userDetails authenticated user details
     * @param projectId ID of the project
     * @param page page number (starts from 0)
     * @param size number of items per page
     * @return paginated list of tasks
     */
    @GetMapping("/project/{projectId}")
    public ResponseEntity<ApiResponse<PageResponse<TaskListResponse>>> getTasksByProject(
            @AuthenticationPrincipal UserDetailsImpl userDetails,
            @PathVariable Long projectId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        log.info("[TaskController] Getting tasks by project | User: {} | ProjectId: {} | Page: {} | Size: {}",
                userDetails.getUsername(), projectId, page, size);

        try {
            PageResponse<TaskListResponse> response = taskService.getTasksByProject(
                    userDetails.getUsername(), projectId, page, size);
            return ResponseEntity.ok(ApiResponse.success("Lấy danh sách tasks thành công", response));

        } catch (Exception e) {
            log.error("[TaskController] Failed to get tasks | User: {} | ProjectId: {} | Error: {}",
                    userDetails.getUsername(), projectId, e.getMessage());
            return ResponseEntity
                    .status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error(e.getMessage()));
        }
    }

    /**
     * Quick update task status
     * Fast endpoint to change task status (TODO/IN_PROGRESS/DONE)
     *
     * @param userDetails authenticated user details
     * @param taskId ID of the task
     * @param status new status value
     * @return updated task details
     */
    @PatchMapping("/{taskId}/status")
    public ResponseEntity<ApiResponse<TaskDetailResponse>> updateTaskStatus(
            @AuthenticationPrincipal UserDetailsImpl userDetails,
            @PathVariable Long taskId,
            @RequestParam String status
    ) {
        log.info("[TaskController] Updating task status | User: {} | TaskId: {} | Status: {}",
                userDetails.getUsername(), taskId, status);

        try {
            UpdateTaskRequest request = new UpdateTaskRequest();
            request.setStatus(status);

            TaskDetailResponse response = taskService.updateTask(userDetails.getUsername(), taskId, request);
            log.info("[TaskController] Task status updated successfully | TaskId: {} | Status: {}",
                    taskId, status);
            return ResponseEntity.ok(ApiResponse.success("Cập nhật status thành công", response));

        } catch (Exception e) {
            log.error("[TaskController] Failed to update status | User: {} | TaskId: {} | Error: {}",
                    userDetails.getUsername(), taskId, e.getMessage());
            return ResponseEntity
                    .status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error(e.getMessage()));
        }
    }

    /**
     * Quick update task priority
     * Fast endpoint to change task priority (LOW/MEDIUM/HIGH/URGENT)
     *
     * @param userDetails authenticated user details
     * @param taskId ID of the task
     * @param priority new priority value
     * @return updated task details
     */
    @PatchMapping("/{taskId}/priority")
    public ResponseEntity<ApiResponse<TaskDetailResponse>> updateTaskPriority(
            @AuthenticationPrincipal UserDetailsImpl userDetails,
            @PathVariable Long taskId,
            @RequestParam String priority
    ) {
        log.info("[TaskController] Updating task priority | User: {} | TaskId: {} | Priority: {}",
                userDetails.getUsername(), taskId, priority);

        try {
            UpdateTaskRequest request = new UpdateTaskRequest();
            request.setPriority(priority);

            TaskDetailResponse response = taskService.updateTask(userDetails.getUsername(), taskId, request);
            log.info("[TaskController] Task priority updated successfully | TaskId: {} | Priority: {}",
                    taskId, priority);
            return ResponseEntity.ok(ApiResponse.success("Cập nhật priority thành công", response));

        } catch (Exception e) {
            log.error("[TaskController] Failed to update priority | User: {} | TaskId: {} | Error: {}",
                    userDetails.getUsername(), taskId, e.getMessage());
            return ResponseEntity
                    .status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error(e.getMessage()));
        }
    }
}