package com.example.backend.repository;

import com.example.backend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    // Tìm user theo username
    Optional<User> findByUsername(String username);

    // Tìm user theo email
    Optional<User> findByEmail(String email);

    // Kiểm tra username đã tồn tại chưa
    Boolean existsByUsername(String username);

    // Kiểm tra email đã tồn tại chưa
    Boolean existsByEmail(String email);

    // Tìm user theo username hoặc email
    Optional<User> findByUsernameOrEmail(String username, String email);

    // ========== SOCIAL LOGIN METHODS ==========

    // Tìm user theo Google ID
    Optional<User> findByGoogleId(String googleId);

    // Tìm user theo GitHub ID
    Optional<User> findByGithubId(String githubId);

    // Kiểm tra Google ID đã tồn tại chưa
    Boolean existsByGoogleId(String googleId);

    // Kiểm tra GitHub ID đã tồn tại chưa
    Boolean existsByGithubId(String githubId);
}