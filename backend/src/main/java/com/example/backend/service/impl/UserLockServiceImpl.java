package com.example.backend.service.impl;

import com.example.backend.model.User;
import com.example.backend.repository.UserRepository;
import com.example.backend.service.IUserLockService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
@Slf4j
public class UserLockServiceImpl implements IUserLockService {
    private final UserRepository userRepository;

    /**
     * Xử lý đăng nhập sai - tăng failed attempts và lock nếu đủ 5 lần
     * Dùng REQUIRES_NEW để đảm bảo data được lưu ngay cả khi transaction cha rollback
     */
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    @Override
    public void handleFailedLogin(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        int attempts = user.getFailedLoginAttempts() + 1;
        user.setFailedLoginAttempts(attempts);

        if (attempts >= 5) {
            user.setLockedUntil(LocalDateTime.now().plusMinutes(15));
            log.warn("🔒 Tài khoản {} bị khóa 15 phút do đăng nhập sai 5 lần", user.getUsername());
        }

        userRepository.save(user);
        log.info("📝 Failed login attempts: {}/5 - User: {}", attempts, user.getUsername());
    }

    /**
     * Reset failed attempts khi đăng nhập thành công
     * Đồng thời cập nhật lastLogin để tránh conflict transaction
     * Dùng REQUIRES_NEW để đảm bảo data được commit ngay lập tức
     */
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    @Override
    public void resetFailedAttempts(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // ✅ Reset attempts và lock
        user.setFailedLoginAttempts(0);
        user.setLockedUntil(null);

        // ✅ Cập nhật lastLogin luôn để tránh conflict
        user.setLastLogin(LocalDateTime.now());

        userRepository.save(user);

        log.info("✅ Reset failed attempts và cập nhật lastLogin - User: {}", user.getUsername());
    }
}