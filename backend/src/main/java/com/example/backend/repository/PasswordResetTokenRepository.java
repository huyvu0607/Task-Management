package com.example.backend.repository;

import com.example.backend.model.PasswordResetToken;
import com.example.backend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface PasswordResetTokenRepository extends JpaRepository<PasswordResetToken, Long> {

    /**
     * Tìm token chưa dùng và chưa hết hạn
     */
    Optional<PasswordResetToken> findByTokenAndIsUsedFalseAndExpiryDateAfter(
            String token, LocalDateTime currentTime);

    /**
     * Tìm token theo string
     */
    Optional<PasswordResetToken> findByToken(String token);

    /**
     * Tìm tất cả token của user
     */
    List<PasswordResetToken> findByUser(User user);

    /**
     * Tìm token hợp lệ của user
     */
    Optional<PasswordResetToken> findByUserAndIsUsedFalseAndExpiryDateAfter(
            User user, LocalDateTime currentTime);

    /**
     * Đánh dấu tất cả token của user là đã dùng
     */
    @Modifying
    @Query("UPDATE PasswordResetToken t SET t.isUsed = true WHERE t.user = :user AND t.isUsed = false")
    void markAllUserTokensAsUsed(User user);

    /**
     * Xóa token đã hết hạn (cleanup job)
     */
    @Modifying
    @Query("DELETE FROM PasswordResetToken t WHERE t.expiryDate < :date")
    void deleteExpiredTokens(LocalDateTime date);

    /**
     * Đếm số token hợp lệ của user
     */
    long countByUserAndIsUsedFalseAndExpiryDateAfter(User user, LocalDateTime currentTime);
}