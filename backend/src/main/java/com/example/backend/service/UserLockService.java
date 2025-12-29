package com.example.backend.service;

public interface UserLockService {
    void handleFailedLogin(Long userID);
    void resetFailedAttempts(Long userId);
}
