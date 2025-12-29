package com.example.backend.security;

import com.example.backend.model.User;
import com.example.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

/**
 * Custom UserDetailsService
 * Return UserDetailsImpl thay vì Spring's User
 */
@Service
@RequiredArgsConstructor
public class CustomUserDetailsService implements UserDetailsService {

    private final UserRepository userRepository;

    @Override
    @Transactional
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("User không tồn tại: " + username));

        // Kiểm tra tài khoản có active không
        if (!user.getIsActive()) {
            throw new UsernameNotFoundException("Tài khoản đã bị khóa");
        }

        // Kiểm tra tài khoản có bị lock không
        if (user.getLockedUntil() != null && user.getLockedUntil().isAfter(LocalDateTime.now())) {
            throw new UsernameNotFoundException("Tài khoản đang bị khóa đến: " + user.getLockedUntil());
        }

        // ⭐ Return UserDetailsImpl thay vì Spring's User
        return UserDetailsImpl.build(user);
    }

    @Transactional
    public UserDetails loadUserById(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new UsernameNotFoundException("User không tồn tại với id: " + id));

        // Kiểm tra tài khoản có active không
        if (!user.getIsActive()) {
            throw new UsernameNotFoundException("Tài khoản đã bị khóa");
        }

        // Kiểm tra tài khoản có bị lock không
        if (user.getLockedUntil() != null && user.getLockedUntil().isAfter(LocalDateTime.now())) {
            throw new UsernameNotFoundException("Tài khoản đang bị khóa đến: " + user.getLockedUntil());
        }

        // ⭐ Return UserDetailsImpl
        return UserDetailsImpl.build(user);
    }
}