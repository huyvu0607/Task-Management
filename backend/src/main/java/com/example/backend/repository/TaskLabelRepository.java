package com.example.backend.repository;

import com.example.backend.model.TaskLabel;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TaskLabelRepository extends JpaRepository<TaskLabel, Long> {

    /**
     * Lấy danh sách labels của một task
     */
    @Query("SELECT tl FROM TaskLabel tl " +
            "LEFT JOIN FETCH tl.label l " +
            "WHERE tl.task.id = :taskId")
    List<TaskLabel> findByTaskId(@Param("taskId") Long taskId);

    /**
     * Lấy danh sách labels của nhiều tasks (batch query)
     */
    @Query("SELECT tl FROM TaskLabel tl " +
            "LEFT JOIN FETCH tl.label l " +
            "WHERE tl.task.id IN :taskIds")
    List<TaskLabel> findByTaskIdIn(@Param("taskIds") List<Long> taskIds);

    /**
     * Check xem task có label này không
     */
    @Query("SELECT COUNT(tl) > 0 FROM TaskLabel tl " +
            "WHERE tl.task.id = :taskId AND tl.label.id = :labelId")
    boolean existsByTaskIdAndLabelId(@Param("taskId") Long taskId,
                                     @Param("labelId") Long labelId);

    /**
     * Xóa tất cả labels của task
     */
    @Modifying
    @Query("DELETE FROM TaskLabel tl WHERE tl.task.id = :taskId")
    void deleteByTaskId(@Param("taskId") Long taskId);

    /**
     * Xóa label cụ thể khỏi task
     */
    @Modifying
    @Query("DELETE FROM TaskLabel tl " +
            "WHERE tl.task.id = :taskId AND tl.label.id = :labelId")
    void deleteByTaskIdAndLabelId(@Param("taskId") Long taskId,
                                  @Param("labelId") Long labelId);

    /**
     * Lấy label IDs của task
     */
    @Query("SELECT tl.label.id FROM TaskLabel tl WHERE tl.task.id = :taskId")
    List<Long> findLabelIdsByTaskId(@Param("taskId") Long taskId);

    /**
     * Đếm số lượng labels của task
     */
    @Query("SELECT COUNT(tl) FROM TaskLabel tl WHERE tl.task.id = :taskId")
    Long countByTaskId(@Param("taskId") Long taskId);
}