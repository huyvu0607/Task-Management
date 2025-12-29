package com.example.backend.repository;

import com.example.backend.model.EmailVerificationToken;
import com.example.backend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.Optional;

@Repository
public interface EmailVerificationTokenRepository extends JpaRepository<EmailVerificationToken, Long> {

    /**
     * Tìm token theo string token
     */
    Optional<EmailVerificationToken> findByToken(String token);

    /**
     * Tìm token chưa sử dụng của user
     */
    Optional<EmailVerificationToken> findByUserAndUsedFalse(User user);

    /**
     * Xóa tất cả token đã hết hạn (chạy định kỳ để cleanup)
     */
    @Modifying
    @Query("DELETE FROM EmailVerificationToken t WHERE t.expiresAt < :now")
    void deleteExpiredTokens(LocalDateTime now);

    /**
     * Xóa tất cả token cũ của user (khi tạo token mới)
     */
    @Modifying
    @Query("DELETE FROM EmailVerificationToken t WHERE t.user = :user")
    void deleteByUser(User user);

    /**
     * Check xem user có token chưa sử dụng không
     */
    boolean existsByUserAndUsedFalse(User user);
}