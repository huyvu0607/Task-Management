package com.example.backend.repository;

import com.example.backend.model.Label;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface LabelRepository extends JpaRepository<Label, Long> {

    /**
     * Lấy tất cả labels của team
     */
    @Query("SELECT l FROM Label l WHERE l.team.id = :teamId ORDER BY l.name")
    List<Label> findByTeamId(@Param("teamId") Long teamId);

    /**
     * Tìm label theo name trong team
     */
    @Query("SELECT l FROM Label l " +
            "WHERE l.team.id = :teamId " +
            "AND LOWER(l.name) = LOWER(:name)")
    Optional<Label> findByTeamIdAndName(@Param("teamId") Long teamId,
                                        @Param("name") String name);

    /**
     * Check label có tồn tại trong team không
     */
    @Query("SELECT COUNT(l) > 0 FROM Label l " +
            "WHERE l.id = :labelId AND l.team.id = :teamId")
    boolean existsByIdAndTeamId(@Param("labelId") Long labelId,
                                @Param("teamId") Long teamId);

    /**
     * Check danh sách labels có thuộc team không
     */
    @Query("SELECT l.id FROM Label l " +
            "WHERE l.id IN :labelIds AND l.team.id = :teamId")
    List<Long> findValidLabelIds(@Param("labelIds") List<Long> labelIds,
                                 @Param("teamId") Long teamId);

    /**
     * Đếm số lượng labels của team
     */
    @Query("SELECT COUNT(l) FROM Label l WHERE l.team.id = :teamId")
    Long countByTeamId(@Param("teamId") Long teamId);
}