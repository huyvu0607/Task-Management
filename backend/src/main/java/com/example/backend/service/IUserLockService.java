package com.example.backend.service;

public interface IUserLockService {
    void handleFailedLogin(Long userID);
    void resetFailedAttempts(Long userId);
}
