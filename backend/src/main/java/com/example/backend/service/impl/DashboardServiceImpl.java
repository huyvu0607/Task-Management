package com.example.backend.service.impl;

import com.example.backend.dto.dashboard.*;
import com.example.backend.model.*;
import com.example.backend.repository.*;
import com.example.backend.service.IDashboardService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class DashboardServiceImpl implements IDashboardService {

    private final TaskRepository taskRepository;
    private final ActivityLogRepository activityLogRepository;
    private final TaskAssigneeRepository taskAssigneeRepository;
    private final CommentRepository commentRepository;
    private final AttachmentRepository attachmentRepository;
    private final ProjectRepository projectRepository; // ⭐ Thêm

    @Override
    public DashboardResponseDTO getPersonalDashboard(Long userId) {
        log.info("Getting personal dashboard for user: {}", userId);

        // Lấy tất cả data song song (có thể optimize bằng CompletableFuture sau)
        DashboardStatsDTO stats = getDashboardStats(userId);
        MyTasksDTO myTasks = getMyTasks(userId, 10);
        TasksCreatedByMeDTO tasksCreatedByMe = getTasksCreatedByMe(userId, 5);
        OverdueTasksDTO overdueTasks = getOverdueTasks(userId, 5);
        TasksDueTodayDTO tasksDueToday = getTasksDueToday(userId, 5);
        List<ActivityDTO> recentActivities = getRecentActivities(userId, 10);
        NavBadgeDTO navBadges = getNavBadges(userId); // ⭐ Thêm

        return DashboardResponseDTO.builder()
                .stats(stats)
                .myTasks(myTasks)
                .tasksCreatedByMe(tasksCreatedByMe)
                .overdueTasks(overdueTasks)
                .tasksDueToday(tasksDueToday)
                .recentActivities(recentActivities)
                .navBadges(navBadges) // ⭐ Thêm
                .build();
    }

    @Override
    public DashboardStatsDTO getDashboardStats(Long userId) {
        LocalDate today = LocalDate.now();
        LocalDateTime weekStart = LocalDateTime.now().minusWeeks(1);
        LocalDateTime lastMonthEnd = LocalDateTime.now().minusMonths(1);
        LocalDate lastWeekStart = today.minusWeeks(1);
        LocalDate lastWeekEnd = today.minusDays(1);

        // Count các loại tasks
        Long totalTasks = taskRepository.countTotalTasksByUser(userId);
        Long inProgress = taskRepository.countInProgressTasksByUser(userId);
        Long overdue = taskRepository.countOverdueTasksByUser(userId, today);
        Long completed = taskRepository.countCompletedTasksByUser(userId);
        Long completedThisWeek = taskRepository.countCompletedThisWeek(userId, weekStart);
        Long dueToday = taskRepository.countTasksDueToday(userId, today);

        // Tính % change từ tháng trước
        Long totalLastMonth = taskRepository.countTasksLastMonth(userId, lastMonthEnd);
        Integer changeFromLastMonth = calculatePercentageChange(totalLastMonth, totalTasks);

        // Tính change overdue từ tuần trước
        Long overdueLastWeek = taskRepository.countOverdueTasksLastWeek(userId, lastWeekStart, lastWeekEnd);
        Integer overdueChange = (int) (overdue - overdueLastWeek);

        // Completion rate
        Double completionRate = totalTasks > 0
                ? (completed.doubleValue() / totalTasks.doubleValue()) * 100
                : 0.0;

        return DashboardStatsDTO.builder()
                .totalTasks(totalTasks)
                .inProgress(inProgress)
                .overdue(overdue)
                .completed(completed)
                .changeFromLastMonth(changeFromLastMonth)
                .overdueChangeFromLastWeek(overdueChange)
                .completedThisWeek(completedThisWeek.intValue())
                .completionRate(Math.round(completionRate * 100.0) / 100.0)
                .dueToday(dueToday)
                .build();
    }

    @Override
    public MyTasksDTO getMyTasks(Long userId, Integer limit) {
        Pageable pageable = PageRequest.of(0, limit != null ? limit : 10);

        // Lấy pending và completed tasks
        List<Task> pendingTasks = taskRepository.findMyTasksPending(userId, pageable);
        List<Task> completedTasks = taskRepository.findMyTasksCompleted(userId, PageRequest.of(0, 1));

        // Convert sang DTOs
        List<TaskSummaryDTO> taskDTOs = convertToTaskSummaryDTOs(pendingTasks);

        return MyTasksDTO.builder()
                .pendingCount(pendingTasks.size())
                .completedCount(completedTasks.size())
                .tasks(taskDTOs)
                .build();
    }

    @Override
    public TasksCreatedByMeDTO getTasksCreatedByMe(Long userId, Integer limit) {
        Pageable pageable = PageRequest.of(0, limit != null ? limit : 5);

        List<Task> tasks = taskRepository.findTasksCreatedByMe(userId, pageable);
        Long totalCount = taskRepository.countTasksCreatedByMe(userId);

        List<TaskSummaryDTO> taskDTOs = convertToTaskSummaryDTOs(tasks);

        return TasksCreatedByMeDTO.builder()
                .totalCount(totalCount.intValue())
                .tasks(taskDTOs)
                .build();
    }

    @Override
    public OverdueTasksDTO getOverdueTasks(Long userId, Integer limit) {
        LocalDate today = LocalDate.now();
        Pageable pageable = PageRequest.of(0, limit != null ? limit : 5);

        List<Task> tasks = taskRepository.findOverdueTasks(userId, today, pageable);
        List<TaskSummaryDTO> taskDTOs = convertToTaskSummaryDTOs(tasks);

        return OverdueTasksDTO.builder()
                .count(tasks.size())
                .tasks(taskDTOs)
                .build();
    }

    @Override
    public TasksDueTodayDTO getTasksDueToday(Long userId, Integer limit) {
        LocalDate today = LocalDate.now();
        Pageable pageable = PageRequest.of(0, limit != null ? limit : 5);

        List<Task> tasks = taskRepository.findTasksDueToday(userId, today, pageable);
        List<TaskSummaryDTO> taskDTOs = convertToTaskSummaryDTOs(tasks);

        return TasksDueTodayDTO.builder()
                .count(tasks.size())
                .tasks(taskDTOs)
                .build();
    }

    @Override
    public List<ActivityDTO> getRecentActivities(Long userId, Integer limit) {
        Pageable pageable = PageRequest.of(0, limit != null ? limit : 10);

        List<ActivityLog> activities = activityLogRepository.findRecentActivities(userId, pageable);

        return activities.stream()
                .map(this::convertToActivityDTO)
                .collect(Collectors.toList());
    }

    @Override
    public NavBadgeDTO getNavBadges(Long userId) {
        log.debug("Getting navigation badges for user: {}", userId);

        // 1. My Tasks Count - số pending tasks assigned to user
        LocalDate today = LocalDate.now();
        Long myTasksCount = taskRepository.countInProgressTasksByUser(userId);

        // 2. Active Projects Count - số projects mà user tham gia
        List<Project> userProjects = projectRepository.findProjectsByUserId(userId);
        Long activeProjectsCount = userProjects.stream()
                .filter(p -> p.getStatus() == Project.ProjectStatus.ACTIVE)
                .count();

        // 3. Unread Notifications (optional - nếu có bảng notifications)
        // Long unreadNotifications = notificationRepository.countUnreadByUserId(userId);

        return NavBadgeDTO.builder()
                .myTasksCount(myTasksCount.intValue())
                .activeProjectsCount(activeProjectsCount.intValue())
                .unreadNotificationsCount(0) // TODO: implement khi có notification feature
                .teamsCount(0) // TODO: implement khi cần
                .build();
    }

    // ========== PRIVATE HELPER METHODS ==========

    /**
     * Convert Task entities sang TaskSummaryDTO
     */
    private List<TaskSummaryDTO> convertToTaskSummaryDTOs(List<Task> tasks) {
        if (tasks.isEmpty()) {
            return Collections.emptyList();
        }

        // Lấy task IDs
        List<Long> taskIds = tasks.stream()
                .map(Task::getId)
                .collect(Collectors.toList());

        // Batch load assignees, comments, attachments
        Map<Long, List<TaskAssignee>> assigneesMap = getAssigneesMap(taskIds);
        Map<Long, Long> commentsCountMap = getCommentsCountMap(taskIds);
        Map<Long, Long> attachmentsCountMap = getAttachmentsCountMap(taskIds);

        return tasks.stream()
                .map(task -> convertToTaskSummaryDTO(
                        task,
                        assigneesMap.getOrDefault(task.getId(), Collections.emptyList()),
                        commentsCountMap.getOrDefault(task.getId(), 0L).intValue(),
                        attachmentsCountMap.getOrDefault(task.getId(), 0L).intValue()
                ))
                .collect(Collectors.toList());
    }

    /**
     * Convert một Task sang TaskSummaryDTO
     */
    private TaskSummaryDTO convertToTaskSummaryDTO(Task task,
                                                   List<TaskAssignee> assignees,
                                                   Integer commentCount,
                                                   Integer attachmentCount) {
        // Convert assignees sang UserSimpleDTOs
        List<UserSimpleDTO> assigneeDTOs = assignees.stream()
                .map(ta -> convertToUserSimpleDTO(ta.getUser()))
                .collect(Collectors.toList());

        return TaskSummaryDTO.builder()
                .id(task.getId())
                .title(task.getTitle())
                .description(task.getDescription())
                .status(task.getStatus())
                .priority(task.getPriority())
                .dueDate(task.getDueDate())
                .createdAt(task.getCreatedAt())
                .commentCount(commentCount)
                .attachmentCount(attachmentCount)
                .assignees(assigneeDTOs)
                .projectId(task.getProject().getId())
                .projectName(task.getProject().getName())
                .build();
    }

    /**
     * Convert User sang UserSimpleDTO
     */
    private UserSimpleDTO convertToUserSimpleDTO(User user) {
        return UserSimpleDTO.builder()
                .id(user.getId())
                .username(user.getUsername())
                .fullName(user.getFullName())
                .avatarUrl(user.getAvatarUrl())
                .build();
    }

    /**
     * Convert ActivityLog sang ActivityDTO
     */
    private ActivityDTO convertToActivityDTO(ActivityLog activity) {
        String targetTitle = "";
        Long targetId = null;

        if (activity.getTask() != null) {
            targetTitle = activity.getTask().getTitle();
            targetId = activity.getTask().getId();
        } else if (activity.getProject() != null) {
            targetTitle = activity.getProject().getName();
            targetId = activity.getProject().getId();
        }

        return ActivityDTO.builder()
                .id(activity.getId())
                .user(convertToUserSimpleDTO(activity.getUser()))
                .actionType(activity.getActionType())
                .entityType(activity.getEntityType())
                .targetId(targetId)
                .targetTitle(targetTitle)
                .description(activity.getDescription())
                .createdAt(activity.getCreatedAt())
                .timeAgo(calculateTimeAgo(activity.getCreatedAt()))
                .build();
    }

    /**
     * Batch load assignees cho nhiều tasks
     */
    private Map<Long, List<TaskAssignee>> getAssigneesMap(List<Long> taskIds) {
        List<TaskAssignee> assignees = taskAssigneeRepository.findByTaskIdIn(taskIds);

        return assignees.stream()
                .collect(Collectors.groupingBy(ta -> ta.getTask().getId()));
    }

    /**
     * Batch count comments cho nhiều tasks
     */
    private Map<Long, Long> getCommentsCountMap(List<Long> taskIds) {
        List<Object[]> results = commentRepository.countByTaskIdIn(taskIds);

        Map<Long, Long> map = new HashMap<>();
        for (Object[] result : results) {
            Long taskId = (Long) result[0];
            Long count = (Long) result[1];
            map.put(taskId, count);
        }
        return map;
    }

    /**
     * Batch count attachments cho nhiều tasks
     */
    private Map<Long, Long> getAttachmentsCountMap(List<Long> taskIds) {
        List<Object[]> results = attachmentRepository.countByTaskIdIn(taskIds);

        Map<Long, Long> map = new HashMap<>();
        for (Object[] result : results) {
            Long taskId = (Long) result[0];
            Long count = (Long) result[1];
            map.put(taskId, count);
        }
        return map;
    }

    /**
     * Tính % thay đổi
     */
    private Integer calculatePercentageChange(Long oldValue, Long newValue) {
        if (oldValue == 0) {
            return newValue > 0 ? 100 : 0;
        }
        return (int) (((newValue - oldValue) * 100.0) / oldValue);
    }

    /**
     * Tính thời gian "ago" (2 hours ago, 1 day ago, etc.)
     */
    private String calculateTimeAgo(LocalDateTime dateTime) {
        LocalDateTime now = LocalDateTime.now();

        long minutes = ChronoUnit.MINUTES.between(dateTime, now);
        if (minutes < 60) {
            return minutes + " minutes ago";
        }

        long hours = ChronoUnit.HOURS.between(dateTime, now);
        if (hours < 24) {
            return hours + " hours ago";
        }

        long days = ChronoUnit.DAYS.between(dateTime, now);
        if (days < 30) {
            return days + " days ago";
        }

        long months = ChronoUnit.MONTHS.between(dateTime, now);
        return months + " months ago";
    }
}