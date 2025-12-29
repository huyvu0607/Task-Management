package com.example.backend.repository;

import com.example.backend.model.Comment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CommentRepository extends JpaRepository<Comment, Long> {

    /**
     * Đếm số lượng comments của một task
     */
    @Query("SELECT COUNT(c) FROM Comment c WHERE c.task.id = :taskId")
    Long countByTaskId(@Param("taskId") Long taskId);

    /**
     * Đếm số lượng comments của nhiều tasks (batch query)
     * Return: Map<taskId, count>
     */
    @Query("SELECT c.task.id, COUNT(c) FROM Comment c " +
            "WHERE c.task.id IN :taskIds " +
            "GROUP BY c.task.id")
    List<Object[]> countByTaskIdIn(@Param("taskIds") List<Long> taskIds);

    /**
     * Lấy comments của một task
     */
    @Query("SELECT c FROM Comment c " +
            "LEFT JOIN FETCH c.user u " +
            "WHERE c.task.id = :taskId " +
            "ORDER BY c.createdAt DESC")
    List<Comment> findByTaskId(@Param("taskId") Long taskId);
}