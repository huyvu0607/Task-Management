package com.example.backend.repository;

import com.example.backend.model.Attachment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AttachmentRepository extends JpaRepository<Attachment, Long> {

    /**
     * Đếm số lượng attachments của một task
     */
    @Query("SELECT COUNT(a) FROM Attachment a WHERE a.task.id = :taskId")
    Long countByTaskId(@Param("taskId") Long taskId);

    /**
     * Đếm số lượng attachments của nhiều tasks (batch query)
     * Return: List<Object[]> where Object[0] = taskId, Object[1] = count
     */
    @Query("SELECT a.task.id, COUNT(a) FROM Attachment a " +
            "WHERE a.task.id IN :taskIds " +
            "GROUP BY a.task.id")
    List<Object[]> countByTaskIdIn(@Param("taskIds") List<Long> taskIds);

    /**
     * Lấy attachments của một task
     */
    @Query("SELECT a FROM Attachment a " +
            "LEFT JOIN FETCH a.uploadedBy " +
            "WHERE a.task.id = :taskId " +
            "ORDER BY a.createdAt DESC")
    List<Attachment> findByTaskId(@Param("taskId") Long taskId);
}