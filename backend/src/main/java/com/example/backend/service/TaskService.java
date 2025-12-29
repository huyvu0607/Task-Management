package com.example.backend.service;

import com.example.backend.dto.response.PageResponse;
import com.example.backend.dto.task.request.AssignTaskRequest;
import com.example.backend.dto.task.request.CreateTaskRequest;
import com.example.backend.dto.task.request.TaskFilterRequest;
import com.example.backend.dto.task.request.UpdateTaskRequest;
import com.example.backend.dto.task.response.TaskDetailResponse;
import com.example.backend.dto.task.response.TaskListResponse;

/**
 * Service interface cho Task Management
 */
public interface TaskService {

    /**
     * FR-4.1: Tạo task mới
     */
    TaskDetailResponse createTask(String username, CreateTaskRequest request);

    /**
     * FR-4.2: Xem chi tiết task
     */
    TaskDetailResponse getTaskDetail(String username, Long taskId);

    /**
     * FR-4.3: Cập nhật task
     */
    TaskDetailResponse updateTask(String username, Long taskId, UpdateTaskRequest request);

    /**
     * FR-4.4: Xóa task
     */
    void deleteTask(String username, Long taskId);

    /**
     * FR-4.5: Assign task cho users
     */
    TaskDetailResponse assignTask(String username, Long taskId, AssignTaskRequest request);

    /**
     * FR-4.6 & FR-4.7: Filter và search tasks trong project
     */
    PageResponse<TaskListResponse> filterTasks(String username, Long projectId, TaskFilterRequest request);

    /**
     * Lấy tất cả tasks của project (không filter)
     */
    PageResponse<TaskListResponse> getTasksByProject(String username, Long projectId, int page, int size);
}