package com.example.backend.service.impl;

import com.example.backend.dto.response.PageResponse;
import com.example.backend.dto.task.request.AssignTaskRequest;
import com.example.backend.dto.task.request.CreateTaskRequest;
import com.example.backend.dto.task.request.TaskFilterRequest;
import com.example.backend.dto.task.request.UpdateTaskRequest;
import com.example.backend.dto.task.response.TaskAssigneeDTO;
import com.example.backend.dto.task.response.TaskDetailResponse;
import com.example.backend.dto.task.response.TaskLabelDTO;
import com.example.backend.dto.task.response.TaskListResponse;
import com.example.backend.dto.dashboard.UserSimpleDTO;
import com.example.backend.model.*;
import com.example.backend.repository.*;
import com.example.backend.service.ITaskService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class TaskServiceImpl implements ITaskService {

    private final TaskRepository taskRepository;
    private final TaskAssigneeRepository taskAssigneeRepository;
    private final TaskLabelRepository taskLabelRepository;
    private final ProjectRepository projectRepository;
    private final UserRepository userRepository;
    private final LabelRepository labelRepository;
    private final TeamMemberRepository teamMemberRepository;
    private final ActivityLogRepository activityLogRepository;
    private final CommentRepository commentRepository;
    private final AttachmentRepository attachmentRepository;

    // ========== FR-4.1: TẠO TASK MỚI ==========

    @Override
    @Transactional
    public TaskDetailResponse createTask(String username, CreateTaskRequest request) {
        log.info("🆕 Tạo task mới: {}", request.getTitle());

        // 1. Lấy user hiện tại
        User currentUser = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User không tồn tại"));

        // 2. Validate project
        Project project = projectRepository.findByIdWithTeam(request.getProjectId())
                .orElseThrow(() -> new RuntimeException("Project không tồn tại"));

        // 3. Check user có phải member của team không
        boolean isMember = teamMemberRepository.existsByTeamIdAndUserId(
                project.getTeam().getId(),
                currentUser.getId()
        );
        if (!isMember) {
            throw new RuntimeException("Bạn không phải member của team này");
        }

        // 4. Validate priority
        Task.TaskPriority priority;
        try {
            priority = Task.TaskPriority.valueOf(request.getPriority().toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new RuntimeException("Priority không hợp lệ: " + request.getPriority());
        }

        // 5. Tạo task mới
        Task task = new Task();
        task.setProject(project);
        task.setTitle(request.getTitle().trim());
        task.setDescription(request.getDescription() != null ? request.getDescription().trim() : null);
        task.setPriority(priority);
        task.setStatus(Task.TaskStatus.TODO);
        task.setCreatedBy(currentUser);
        task.setDueDate(request.getDueDate());
        task.setEstimatedHours(request.getEstimatedHours());
        task.setPosition(0); // Default position

        Task savedTask = taskRepository.save(task);
        log.info("✅ Task được tạo với ID: {}", savedTask.getId());

        // 6. Assign users (nếu có)
        if (request.getAssigneeIds() != null && !request.getAssigneeIds().isEmpty()) {
            assignUsersToTask(savedTask, request.getAssigneeIds(), currentUser, project.getTeam().getId());
        }

        // 7. Add labels (nếu có)
        if (request.getLabelIds() != null && !request.getLabelIds().isEmpty()) {
            addLabelsToTask(savedTask, request.getLabelIds(), project.getTeam().getId());
        }

        // 8. Log activity
        logActivity(currentUser, savedTask, project, "CREATED", "Task", null, savedTask.getTitle());

        // 9. Return response
        return buildTaskDetailResponse(savedTask, currentUser.getId());
    }

    // ========== HELPER: Assign users to task ==========

    private void assignUsersToTask(Task task, List<Long> assigneeIds, User assignedBy, Long teamId) {
        for (Long userId : assigneeIds) {
            // Validate user exists
            User user = userRepository.findById(userId)
                    .orElseThrow(() -> new RuntimeException("User ID " + userId + " không tồn tại"));

            // Validate user là member của team
            boolean isMember = teamMemberRepository.existsByTeamIdAndUserId(teamId, userId);
            if (!isMember) {
                throw new RuntimeException("User " + user.getUsername() + " không phải member của team");
            }

            // Check đã assign chưa
            boolean alreadyAssigned = taskAssigneeRepository.existsByTaskIdAndUserId(task.getId(), userId);
            if (!alreadyAssigned) {
                TaskAssignee assignee = new TaskAssignee();
                assignee.setTask(task);
                assignee.setUser(user);
                assignee.setAssignedBy(assignedBy);
                taskAssigneeRepository.save(assignee);

                log.info("👤 Assigned user {} to task {}", user.getUsername(), task.getId());
            }
        }
    }

    // ========== HELPER: Add labels to task ==========

    private void addLabelsToTask(Task task, List<Long> labelIds, Long teamId) {
        // Validate labels thuộc team
        List<Long> validLabelIds = labelRepository.findValidLabelIds(labelIds, teamId);

        if (validLabelIds.size() != labelIds.size()) {
            throw new RuntimeException("Một số label không thuộc team này");
        }

        for (Long labelId : validLabelIds) {
            Label label = labelRepository.findById(labelId)
                    .orElseThrow(() -> new RuntimeException("Label không tồn tại"));

            boolean alreadyAdded = taskLabelRepository.existsByTaskIdAndLabelId(task.getId(), labelId);
            if (!alreadyAdded) {
                TaskLabel taskLabel = new TaskLabel();
                taskLabel.setTask(task);
                taskLabel.setLabel(label);
                taskLabelRepository.save(taskLabel);

                log.info("🏷️ Added label {} to task {}", label.getName(), task.getId());
            }
        }
    }

    // ========== HELPER: Log activity ==========

    private void logActivity(User user, Task task, Project project,
                             String actionType, String entityType,
                             String oldValue, String newValue) {
        ActivityLog log = new ActivityLog();
        log.setUser(user);
        log.setTask(task);
        log.setProject(project);
        log.setActionType(actionType);
        log.setEntityType(entityType);
        log.setOldValue(oldValue);
        log.setNewValue(newValue);
        activityLogRepository.save(log);
    }

    // ========== FR-4.2: XEM CHI TIẾT TASK ==========

    @Override
    @Transactional(readOnly = true)
    public TaskDetailResponse getTaskDetail(String username, Long taskId) {
        log.info("📄 Xem chi tiết task: {}", taskId);

        // 1. Lấy user hiện tại
        User currentUser = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User không tồn tại"));

        // 2. Lấy task với details
        Task task = taskRepository.findByIdWithDetails(taskId)
                .orElseThrow(() -> new RuntimeException("Task không tồn tại"));

        // 3. Check user có quyền xem task không (phải là member của team)
        boolean isMember = teamMemberRepository.existsByTeamIdAndUserId(
                task.getProject().getTeam().getId(),
                currentUser.getId()
        );
        if (!isMember) {
            throw new RuntimeException("Bạn không có quyền xem task này");
        }

        // 4. Build response
        return buildTaskDetailResponse(task, currentUser.getId());
    }


    // ========== FR-4.3: CẬP NHẬT TASK ==========

    @Override
    @Transactional
    public TaskDetailResponse updateTask(String username, Long taskId, UpdateTaskRequest request) {
        log.info("✏️ Cập nhật task: {}", taskId);

        // 1. Lấy user hiện tại
        User currentUser = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User không tồn tại"));

        // 2. Lấy task
        Task task = taskRepository.findByIdWithDetails(taskId)
                .orElseThrow(() -> new RuntimeException("Task không tồn tại"));

        // 3. ✅ FIX: Check quyền update (ADMIN/MANAGER hoặc creator/assignee)
        Long teamId = task.getProject().getTeam().getId();

        // Get team member info
        TeamMember teamMember = teamMemberRepository.findByTeamIdAndUserId(teamId, currentUser.getId())
                .orElseThrow(() -> new RuntimeException("Bạn không phải member của team này"));

        TeamMember.TeamRole role = teamMember.getRole();

        // Check permission based on role
        boolean canUpdate = false;

        if (role == TeamMember.TeamRole.VIEWER) {
            // VIEWER không update được gì
            throw new RuntimeException("VIEWER không có quyền cập nhật task");
        } else if (role == TeamMember.TeamRole.ADMIN || role == TeamMember.TeamRole.MANAGER) {
            // ADMIN & MANAGER có thể update bất kỳ task nào
            canUpdate = true;
            log.info("✅ User {} is {} - can update any task", username, role);
        } else {
            // DEVELOPER, DESIGNER, QA, MEMBER: Check if creator hoặc assignee
            canUpdate = taskRepository.isCreatorOrAssignee(taskId, currentUser.getId());
            log.info("✅ User {} is {} - checking creator/assignee: {}", username, role, canUpdate);
        }

        if (!canUpdate) {
            throw new RuntimeException("Bạn không có quyền cập nhật task này");
        }

        // 4. Update các fields (giữ nguyên logic cũ)
        boolean hasChanges = false;

        // Update title
        if (request.getTitle() != null && !request.getTitle().trim().isEmpty()) {
            if (!request.getTitle().equals(task.getTitle())) {
                logActivity(currentUser, task, task.getProject(), "UPDATED", "Task.Title",
                        task.getTitle(), request.getTitle());
                task.setTitle(request.getTitle().trim());
                hasChanges = true;
            }
        }

        // Update description
        if (request.getDescription() != null) {
            if (!request.getDescription().equals(task.getDescription())) {
                logActivity(currentUser, task, task.getProject(), "UPDATED", "Task.Description",
                        task.getDescription(), request.getDescription());
                task.setDescription(request.getDescription().trim());
                hasChanges = true;
            }
        }

        // Update status
        if (request.getStatus() != null) {
            Task.TaskStatus newStatus = Task.TaskStatus.valueOf(request.getStatus().toUpperCase());
            if (newStatus != task.getStatus()) {
                logActivity(currentUser, task, task.getProject(), "UPDATED", "Task.Status",
                        task.getStatus().name(), newStatus.name());
                task.setStatus(newStatus);

                // Nếu chuyển sang DONE, set completedAt
                if (newStatus == Task.TaskStatus.DONE && task.getCompletedAt() == null) {
                    task.setCompletedAt(LocalDateTime.now());
                } else if (newStatus != Task.TaskStatus.DONE) {
                    task.setCompletedAt(null);
                }
                hasChanges = true;
            }
        }

        // Update priority
        if (request.getPriority() != null) {
            Task.TaskPriority newPriority = Task.TaskPriority.valueOf(request.getPriority().toUpperCase());
            if (newPriority != task.getPriority()) {
                logActivity(currentUser, task, task.getProject(), "UPDATED", "Task.Priority",
                        task.getPriority().name(), newPriority.name());
                task.setPriority(newPriority);
                hasChanges = true;
            }
        }

        // Update due date
        if (request.getDueDate() != null) {
            if (!request.getDueDate().equals(task.getDueDate())) {
                logActivity(currentUser, task, task.getProject(), "UPDATED", "Task.DueDate",
                        task.getDueDate() != null ? task.getDueDate().toString() : "null",
                        request.getDueDate().toString());
                task.setDueDate(request.getDueDate());
                hasChanges = true;
            }
        }

        // Update estimated hours
        if (request.getEstimatedHours() != null) {
            task.setEstimatedHours(request.getEstimatedHours());
            hasChanges = true;
        }

        // Update actual hours
        if (request.getActualHours() != null) {
            task.setActualHours(request.getActualHours());
            hasChanges = true;
        }

        // 5. Update assignees (nếu có)
        if (request.getAssigneeIds() != null) {
            updateTaskAssignees(task, request.getAssigneeIds(), currentUser);
            hasChanges = true;
        }

        // 6. Update labels (nếu có)
        if (request.getLabelIds() != null) {
            updateTaskLabels(task, request.getLabelIds());
            hasChanges = true;
        }

        // 7. Save task
        if (hasChanges) {
            taskRepository.save(task);
            log.info("✅ Task {} đã được cập nhật", taskId);
        }

        // 8. Return response
        return buildTaskDetailResponse(task, currentUser.getId());
    }

    // ========== HELPER: Update assignees ==========

    private void updateTaskAssignees(Task task, List<Long> newAssigneeIds, User assignedBy) {
        // Xóa tất cả assignees cũ
        taskAssigneeRepository.deleteByTaskId(task.getId());

        // Add assignees mới
        assignUsersToTask(task, newAssigneeIds, assignedBy, task.getProject().getTeam().getId());

        logActivity(assignedBy, task, task.getProject(), "UPDATED", "Task.Assignees",
                null, "Assignees updated");
    }

    // ========== HELPER: Update labels ==========

    private void updateTaskLabels(Task task, List<Long> newLabelIds) {
        // Xóa tất cả labels cũ
        taskLabelRepository.deleteByTaskId(task.getId());

        // Add labels mới
        if (!newLabelIds.isEmpty()) {
            addLabelsToTask(task, newLabelIds, task.getProject().getTeam().getId());
        }
    }

    // ========== FR-4.4: XÓA TASK ==========

    @Override
    @Transactional
    public void deleteTask(String username, Long taskId) {
        log.info("🗑️ Xóa task: {}", taskId);

        User currentUser = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User không tồn tại"));

        Task task = taskRepository.findByIdWithDetails(taskId)
                .orElseThrow(() -> new RuntimeException("Task không tồn tại"));

        boolean canDelete = taskRepository.canDeleteTask(taskId, currentUser.getId());
        if (!canDelete) {
            throw new RuntimeException("Bạn không có quyền xóa task này");
        }

        // ✅ 1. XÓA ACTIVITY LOG TRƯỚC
        activityLogRepository.deleteByTaskId(taskId);

        // ✅ 2. LOG DELETE (KHÔNG GẮN TASK)
        logActivity(
                currentUser,
                null, 
                task.getProject(),
                "DELETED",
                "TASK",
                task.getTitle(),
                null
        );

        // ✅ 3. XÓA RELATED DATA
        taskAssigneeRepository.deleteByTaskId(taskId);
        taskLabelRepository.deleteByTaskId(taskId);

        // ✅ 4. XÓA TASK
        taskRepository.delete(task);

        log.info("✅ Task {} đã bị xóa", taskId);
    }

// ========== UPDATE TASK STATUS ==========
    /**
     * Cập nhật status của task
     * PATCH /api/v1/tasks/{taskId}/status?status=IN_PROGRESS
     */
    @Transactional
    public TaskDetailResponse updateTaskStatus(String username, Long taskId, String status) {
        log.info("🔄 Cập nhật status task {} thành {}", taskId, status);

        // 1. Lấy user hiện tại
        User currentUser = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User không tồn tại"));

        // 2. Lấy task
        Task task = taskRepository.findByIdWithDetails(taskId)
                .orElseThrow(() -> new RuntimeException("Task không tồn tại"));

        // 3. ✅ Check quyền update (ADMIN/MANAGER hoặc creator/assignee)
        Long teamId = task.getProject().getTeam().getId();

        TeamMember teamMember = teamMemberRepository.findByTeamIdAndUserId(teamId, currentUser.getId())
                .orElseThrow(() -> new RuntimeException("Bạn không phải member của team này"));

        TeamMember.TeamRole role = teamMember.getRole();

        boolean canUpdate = false;

        if (role == TeamMember.TeamRole.VIEWER) {
            throw new RuntimeException("VIEWER không có quyền cập nhật status");
        } else if (role == TeamMember.TeamRole.ADMIN || role == TeamMember.TeamRole.MANAGER) {
            canUpdate = true;
        } else {
            canUpdate = taskRepository.isCreatorOrAssignee(taskId, currentUser.getId());
        }

        if (!canUpdate) {
            throw new RuntimeException("Bạn không có quyền cập nhật task này");
        }

        // 4. Validate và update status
        Task.TaskStatus newStatus;
        try {
            newStatus = Task.TaskStatus.valueOf(status.toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new RuntimeException("Status không hợp lệ: " + status);
        }

        if (newStatus != task.getStatus()) {
            logActivity(currentUser, task, task.getProject(), "UPDATED", "Task.Status",
                    task.getStatus().name(), newStatus.name());

            task.setStatus(newStatus);

            // Nếu chuyển sang DONE, set completedAt
            if (newStatus == Task.TaskStatus.DONE && task.getCompletedAt() == null) {
                task.setCompletedAt(LocalDateTime.now());
            } else if (newStatus != Task.TaskStatus.DONE) {
                task.setCompletedAt(null);
            }

            taskRepository.save(task);
            log.info("✅ Task {} status updated to {}", taskId, newStatus);
        }

        return buildTaskDetailResponse(task, currentUser.getId());
    }

// ========== UPDATE TASK PRIORITY ==========
    /**
     * Cập nhật priority của task
     * PATCH /api/v1/tasks/{taskId}/priority?priority=HIGH
     */
    @Transactional
    public TaskDetailResponse updateTaskPriority(String username, Long taskId, String priority) {
        log.info("⚡ Cập nhật priority task {} thành {}", taskId, priority);

        // 1. Lấy user hiện tại
        User currentUser = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User không tồn tại"));

        // 2. Lấy task
        Task task = taskRepository.findByIdWithDetails(taskId)
                .orElseThrow(() -> new RuntimeException("Task không tồn tại"));

        // 3. ✅ Check quyền update (ADMIN/MANAGER hoặc creator/assignee)
        Long teamId = task.getProject().getTeam().getId();

        TeamMember teamMember = teamMemberRepository.findByTeamIdAndUserId(teamId, currentUser.getId())
                .orElseThrow(() -> new RuntimeException("Bạn không phải member của team này"));

        TeamMember.TeamRole role = teamMember.getRole();

        boolean canUpdate = false;

        if (role == TeamMember.TeamRole.VIEWER) {
            throw new RuntimeException("VIEWER không có quyền cập nhật priority");
        } else if (role == TeamMember.TeamRole.ADMIN || role == TeamMember.TeamRole.MANAGER) {
            canUpdate = true;
        } else {
            canUpdate = taskRepository.isCreatorOrAssignee(taskId, currentUser.getId());
        }

        if (!canUpdate) {
            throw new RuntimeException("Bạn không có quyền cập nhật task này");
        }

        // 4. Validate và update priority
        Task.TaskPriority newPriority;
        try {
            newPriority = Task.TaskPriority.valueOf(priority.toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new RuntimeException("Priority không hợp lệ: " + priority);
        }

        if (newPriority != task.getPriority()) {
            logActivity(currentUser, task, task.getProject(), "UPDATED", "Task.Priority",
                    task.getPriority().name(), newPriority.name());

            task.setPriority(newPriority);
            taskRepository.save(task);

            log.info("✅ Task {} priority updated to {}", taskId, newPriority);
        }

        return buildTaskDetailResponse(task, currentUser.getId());
    }
    // ========== FR-4.5: ASSIGN TASK ==========

    @Override
    @Transactional
    public TaskDetailResponse assignTask(String username, Long taskId, AssignTaskRequest request) {
        log.info("👥 Assign task {} cho users", taskId);

        // 1. Lấy user hiện tại
        User currentUser = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User không tồn tại"));

        // 2. Lấy task
        Task task = taskRepository.findByIdWithDetails(taskId)
                .orElseThrow(() -> new RuntimeException("Task không tồn tại"));

        // 3. Check quyền assign (phải là member của team)
        boolean isMember = teamMemberRepository.existsByTeamIdAndUserId(
                task.getProject().getTeam().getId(),
                currentUser.getId()
        );
        if (!isMember) {
            throw new RuntimeException("Bạn không có quyền assign task này");
        }

        // 4. Validate assignees
        if (request.getAssigneeIds() == null || request.getAssigneeIds().isEmpty()) {
            throw new RuntimeException("Danh sách assignee không được rỗng");
        }

        // 5. Update assignees
        updateTaskAssignees(task, request.getAssigneeIds(), currentUser);

        // 6. Log activity
        String assigneeNames = request.getAssigneeIds().stream()
                .map(id -> userRepository.findById(id).map(User::getUsername).orElse("Unknown"))
                .collect(Collectors.joining(", "));

        logActivity(currentUser, task, task.getProject(), "ASSIGNED", "Task",
                null, "Assigned to: " + assigneeNames);

        log.info("✅ Task {} đã được assign cho {} users", taskId, request.getAssigneeIds().size());

        // 7. Return response
        return buildTaskDetailResponse(task, currentUser.getId());
    }

    // ========== FR-4.6 & FR-4.7: FILTER VÀ SEARCH TASKS ==========

    @Override
    @Transactional(readOnly = true)
    public PageResponse<TaskListResponse> filterTasks(String username, Long projectId, TaskFilterRequest request) {
        log.info("🔍 Filter tasks trong project: {}", projectId);

        // 1. Lấy user hiện tại
        User currentUser = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User không tồn tại"));

        // 2. Validate project
        Project project = projectRepository.findByIdWithTeam(projectId)
                .orElseThrow(() -> new RuntimeException("Project không tồn tại"));

        // 3. Check quyền xem
        boolean isMember = teamMemberRepository.existsByTeamIdAndUserId(
                project.getTeam().getId(),
                currentUser.getId()
        );
        if (!isMember) {
            throw new RuntimeException("Bạn không có quyền xem tasks của project này");
        }

        // 4. Build filter criteria
        List<Task> tasks = filterTasksWithCriteria(projectId, request);

        // 5. Apply sorting
        tasks = sortTasks(tasks, request.getSortBy(), request.getSortDirection());

        // 6. Apply pagination
        int page = request.getPage() != null ? request.getPage() : 0;
        int size = request.getSize() != null ? request.getSize() : 20;

        int start = page * size;
        int end = Math.min(start + size, tasks.size());

        List<Task> paginatedTasks = tasks.subList(start, end);

        // 7. Build response
        List<TaskListResponse> taskResponses = paginatedTasks.stream()
                .map(this::buildTaskListResponse)
                .collect(Collectors.toList());

        return PageResponse.<TaskListResponse>builder()
                .content(taskResponses)
                .page(page)
                .size(size)
                .totalElements((long) tasks.size())
                .totalPages((int) Math.ceil((double) tasks.size() / size))
                .last(end >= tasks.size())
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<TaskListResponse> getTasksByProject(String username, Long projectId, int page, int size) {
        log.info("📋 Lấy tất cả tasks của project: {}", projectId);

        // Gọi filterTasks với empty request
        TaskFilterRequest request = new TaskFilterRequest();
        request.setPage(page);
        request.setSize(size);

        return filterTasks(username, projectId, request);
    }

    // ========== HELPER: Filter tasks với criteria ==========

    private List<Task> filterTasksWithCriteria(Long projectId, TaskFilterRequest request) {
        LocalDate today = LocalDate.now();

        // 1. Start với all tasks của project
        List<Task> tasks = taskRepository.findAllByProjectId(projectId);

        // 2. Apply search
        if (request.getSearch() != null && !request.getSearch().trim().isEmpty()) {
            String searchLower = request.getSearch().toLowerCase();
            tasks = tasks.stream()
                    .filter(t -> t.getTitle().toLowerCase().contains(searchLower) ||
                            (t.getDescription() != null && t.getDescription().toLowerCase().contains(searchLower)))
                    .collect(Collectors.toList());
        }

        // 3. Filter by status
        if (request.getStatus() != null && !request.getStatus().isEmpty()) {
            List<Task.TaskStatus> statusList = request.getStatus().stream()
                    .map(s -> Task.TaskStatus.valueOf(s.toUpperCase()))
                    .collect(Collectors.toList());
            tasks = tasks.stream()
                    .filter(t -> statusList.contains(t.getStatus()))
                    .collect(Collectors.toList());
        }

        // 4. Filter by priority
        if (request.getPriority() != null && !request.getPriority().isEmpty()) {
            List<Task.TaskPriority> priorityList = request.getPriority().stream()
                    .map(p -> Task.TaskPriority.valueOf(p.toUpperCase()))
                    .collect(Collectors.toList());
            tasks = tasks.stream()
                    .filter(t -> priorityList.contains(t.getPriority()))
                    .collect(Collectors.toList());
        }

        // 5. Filter by assignee
        if (request.getAssigneeIds() != null && !request.getAssigneeIds().isEmpty()) {
            List<Long> taskIdsWithAssignees = new ArrayList<>();
            for (Long assigneeId : request.getAssigneeIds()) {
                List<TaskAssignee> assignees = taskAssigneeRepository.findByTaskIdIn(
                        tasks.stream().map(Task::getId).collect(Collectors.toList())
                );
                taskIdsWithAssignees.addAll(
                        assignees.stream()
                                .filter(a -> request.getAssigneeIds().contains(a.getUser().getId()))
                                .map(a -> a.getTask().getId())
                                .collect(Collectors.toList())
                );
            }
            tasks = tasks.stream()
                    .filter(t -> taskIdsWithAssignees.contains(t.getId()))
                    .collect(Collectors.toList());
        }

        // 6. Filter by label
        if (request.getLabelIds() != null && !request.getLabelIds().isEmpty()) {
            List<Long> taskIdsWithLabels = new ArrayList<>();
            List<TaskLabel> taskLabels = taskLabelRepository.findByTaskIdIn(
                    tasks.stream().map(Task::getId).collect(Collectors.toList())
            );
            taskIdsWithLabels.addAll(
                    taskLabels.stream()
                            .filter(tl -> request.getLabelIds().contains(tl.getLabel().getId()))
                            .map(tl -> tl.getTask().getId())
                            .collect(Collectors.toList())
            );
            tasks = tasks.stream()
                    .filter(t -> taskIdsWithLabels.contains(t.getId()))
                    .collect(Collectors.toList());
        }

        // 7. Filter by due date
        if (request.getDueDateFilter() != null) {
            switch (request.getDueDateFilter().toUpperCase()) {
                case "OVERDUE":
                    tasks = tasks.stream()
                            .filter(t -> t.getDueDate() != null &&
                                    t.getDueDate().isBefore(today) &&
                                    t.getStatus() != Task.TaskStatus.DONE)
                            .collect(Collectors.toList());
                    break;
                case "TODAY":
                    tasks = tasks.stream()
                            .filter(t -> t.getDueDate() != null &&
                                    t.getDueDate().equals(today))
                            .collect(Collectors.toList());
                    break;
                case "THIS_WEEK":
                    LocalDate endOfWeek = today.plusDays(7);
                    tasks = tasks.stream()
                            .filter(t -> t.getDueDate() != null &&
                                    !t.getDueDate().isBefore(today) &&
                                    !t.getDueDate().isAfter(endOfWeek))
                            .collect(Collectors.toList());
                    break;
                case "THIS_MONTH":
                    LocalDate endOfMonth = today.withDayOfMonth(today.lengthOfMonth());
                    tasks = tasks.stream()
                            .filter(t -> t.getDueDate() != null &&
                                    !t.getDueDate().isBefore(today) &&
                                    !t.getDueDate().isAfter(endOfMonth))
                            .collect(Collectors.toList());
                    break;
            }
        }

        // 8. Filter by custom date range
        if (request.getDueDateFrom() != null && request.getDueDateTo() != null) {
            tasks = tasks.stream()
                    .filter(t -> t.getDueDate() != null &&
                            !t.getDueDate().isBefore(request.getDueDateFrom()) &&
                            !t.getDueDate().isAfter(request.getDueDateTo()))
                    .collect(Collectors.toList());
        }

        return tasks;
    }

    // ========== HELPER: Sort tasks ==========

    private List<Task> sortTasks(List<Task> tasks, String sortBy, String sortDirection) {
        if (sortBy == null) {
            sortBy = "createdAt";
        }
        if (sortDirection == null) {
            sortDirection = "DESC";
        }

        boolean ascending = "ASC".equalsIgnoreCase(sortDirection);

        switch (sortBy.toLowerCase()) {
            case "priority":
                tasks.sort((t1, t2) -> {
                    int compare = t1.getPriority().compareTo(t2.getPriority());
                    return ascending ? compare : -compare;
                });
                break;
            case "duedate":
                tasks.sort((t1, t2) -> {
                    if (t1.getDueDate() == null && t2.getDueDate() == null) return 0;
                    if (t1.getDueDate() == null) return ascending ? 1 : -1;
                    if (t2.getDueDate() == null) return ascending ? -1 : 1;
                    int compare = t1.getDueDate().compareTo(t2.getDueDate());
                    return ascending ? compare : -compare;
                });
                break;
            case "title":
                tasks.sort((t1, t2) -> {
                    int compare = t1.getTitle().compareToIgnoreCase(t2.getTitle());
                    return ascending ? compare : -compare;
                });
                break;
            case "createdat":
            default:
                tasks.sort((t1, t2) -> {
                    int compare = t1.getCreatedAt().compareTo(t2.getCreatedAt());
                    return ascending ? compare : -compare;
                });
                break;
        }

        return tasks;
    }

    // ========== RESPONSE BUILDERS ==========

    private TaskDetailResponse buildTaskDetailResponse(Task task, Long currentUserId) {
        // Get assignees
        List<TaskAssignee> assignees = taskAssigneeRepository.findByTaskId(task.getId());
        List<TaskAssigneeDTO> assigneeDTOs = assignees.stream()
                .map(this::convertToAssigneeDTO)
                .collect(Collectors.toList());

        // Get labels
        List<TaskLabel> taskLabels = taskLabelRepository.findByTaskId(task.getId());
        List<TaskLabelDTO> labelDTOs = taskLabels.stream()
                .map(this::convertToLabelDTO)
                .collect(Collectors.toList());

        // Get counts
        Long commentCount = commentRepository.countByTaskId(task.getId());
        Long attachmentCount = attachmentRepository.countByTaskId(task.getId());

        // Check permissions
        boolean canEdit = taskRepository.isCreatorOrAssignee(task.getId(), currentUserId);
        boolean canDelete = taskRepository.canDeleteTask(task.getId(), currentUserId);

        // Check if overdue
        boolean isOverdue = task.getDueDate() != null &&
                task.getDueDate().isBefore(LocalDate.now()) &&
                task.getStatus() != Task.TaskStatus.DONE;

        return TaskDetailResponse.builder()
                .id(task.getId())
                .title(task.getTitle())
                .description(task.getDescription())
                .status(task.getStatus().name())
                .priority(task.getPriority().name())
                .projectId(task.getProject().getId())
                .projectName(task.getProject().getName())
                .projectColor(task.getProject().getColor())
                .assignees(assigneeDTOs)
                .dueDate(task.getDueDate())
                .completedAt(task.getCompletedAt())
                .createdAt(task.getCreatedAt())
                .updatedAt(task.getUpdatedAt())
                .labels(labelDTOs)
                .createdBy(convertToUserSimpleDTO(task.getCreatedBy()))
                .estimatedHours(task.getEstimatedHours())
                .actualHours(task.getActualHours())
                .commentCount(commentCount.intValue())
                .attachmentCount(attachmentCount.intValue())
                .isOverdue(isOverdue)
                .canEdit(canEdit)
                .canDelete(canDelete)
                .build();
    }


    private TaskListResponse buildTaskListResponse(Task task) {
        // Get assignees (simplified)
        List<TaskAssignee> assignees = taskAssigneeRepository.findByTaskId(task.getId());
        List<UserSimpleDTO> assigneeUsers = assignees.stream()
                .map(a -> convertToUserSimpleDTO(a.getUser()))
                .collect(Collectors.toList());

        // Get labels
        List<TaskLabel> taskLabels = taskLabelRepository.findByTaskId(task.getId());
        List<TaskLabelDTO> labelDTOs = taskLabels.stream()
                .map(this::convertToLabelDTO)
                .collect(Collectors.toList());

        // Get counts
        Long commentCount = commentRepository.countByTaskId(task.getId());
        Long attachmentCount = attachmentRepository.countByTaskId(task.getId());

        // Check if overdue
        boolean isOverdue = task.getDueDate() != null &&
                task.getDueDate().isBefore(LocalDate.now()) &&
                task.getStatus() != Task.TaskStatus.DONE;

        return TaskListResponse.builder()
                .id(task.getId())
                .title(task.getTitle())
                .status(task.getStatus().name())
                .priority(task.getPriority().name())
                .projectId(task.getProject().getId())
                .projectName(task.getProject().getName())
                .projectColor(task.getProject().getColor())
                .assignees(assigneeUsers)
                .labels(labelDTOs)
                .dueDate(task.getDueDate())
                .createdAt(task.getCreatedAt())
                .createdBy(convertToUserSimpleDTO(task.getCreatedBy()))
                .commentCount(commentCount.intValue())
                .attachmentCount(attachmentCount.intValue())
                .isOverdue(isOverdue)
                .build();
    }

    private TaskAssigneeDTO convertToAssigneeDTO(TaskAssignee assignee) {
        return TaskAssigneeDTO.builder()
                .id(assignee.getId())
                .userId(assignee.getUser().getId())
                .username(assignee.getUser().getUsername())
                .fullName(assignee.getUser().getFullName())
                .avatarUrl(assignee.getUser().getAvatarUrl())
                .email(assignee.getUser().getEmail())
                .assignedAt(assignee.getAssignedAt())
                .assignedByUsername(assignee.getAssignedBy().getUsername())
                .assignedByFullName(assignee.getAssignedBy().getFullName())
                .build();
    }

    private TaskLabelDTO convertToLabelDTO(TaskLabel taskLabel) {
        return TaskLabelDTO.builder()
                .id(taskLabel.getLabel().getId())
                .name(taskLabel.getLabel().getName())
                .color(taskLabel.getLabel().getColor())
                .build();
    }

    private UserSimpleDTO convertToUserSimpleDTO(User user) {
        return UserSimpleDTO.builder()
                .id(user.getId())
                .username(user.getUsername())
                .fullName(user.getFullName())
                .avatarUrl(user.getAvatarUrl())
                .email(user.getEmail())
                .build();
    }
    @Override
    @Transactional(readOnly = true)
    public PageResponse<TaskListResponse> getMyTasks(String username, String status, String priority, int page, int size) {
        log.info("📋 Lấy My Tasks | User: {} | Status: {} | Priority: {}", username, status, priority);

        // 1. Lấy user hiện tại
        User currentUser = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User không tồn tại"));

        // 2. Lấy tất cả tasks được assign cho user
        List<TaskAssignee> taskAssignees = taskAssigneeRepository.findByUserId(currentUser.getId());

        // 3. Extract tasks từ assignees
        List<Task> tasks = taskAssignees.stream()
                .map(TaskAssignee::getTask)
                .distinct()
                .collect(Collectors.toList());

        // 4. Apply filters
        if (status != null && !status.equals("ALL")) {
            Task.TaskStatus taskStatus = Task.TaskStatus.valueOf(status.toUpperCase());
            tasks = tasks.stream()
                    .filter(t -> t.getStatus() == taskStatus)
                    .collect(Collectors.toList());
        }

        if (priority != null && !priority.equals("ALL")) {
            Task.TaskPriority taskPriority = Task.TaskPriority.valueOf(priority.toUpperCase());
            tasks = tasks.stream()
                    .filter(t -> t.getPriority() == taskPriority)
                    .collect(Collectors.toList());
        }

        // 5. Sort: Priority DESC, DueDate ASC
        tasks.sort((t1, t2) -> {
            // Sort by due date first (nulls last)
            if (t1.getDueDate() == null && t2.getDueDate() == null) {
                return t2.getPriority().compareTo(t1.getPriority());
            }
            if (t1.getDueDate() == null) return 1;
            if (t2.getDueDate() == null) return -1;

            int dateCompare = t1.getDueDate().compareTo(t2.getDueDate());
            if (dateCompare != 0) return dateCompare;

            // If same date, sort by priority
            return t2.getPriority().compareTo(t1.getPriority());
        });

        // 6. Apply pagination
        int start = page * size;
        int end = Math.min(start + size, tasks.size());

        if (start >= tasks.size()) {
            return PageResponse.<TaskListResponse>builder()
                    .content(List.of())
                    .page(page)
                    .size(size)
                    .totalElements((long) tasks.size())
                    .totalPages((int) Math.ceil((double) tasks.size() / size))
                    .last(true)
                    .build();
        }

        List<Task> paginatedTasks = tasks.subList(start, end);

        // 7. Build response
        List<TaskListResponse> taskResponses = paginatedTasks.stream()
                .map(this::buildTaskListResponse)
                .collect(Collectors.toList());

        log.info("✅ Found {} tasks for user {}", tasks.size(), username);

        return PageResponse.<TaskListResponse>builder()
                .content(taskResponses)
                .page(page)
                .size(size)
                .totalElements((long) tasks.size())
                .totalPages((int) Math.ceil((double) tasks.size() / size))
                .last(end >= tasks.size())
                .build();
    }
}
