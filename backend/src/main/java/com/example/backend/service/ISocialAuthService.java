package com.example.backend.service;

import com.example.backend.dto.auth.SocialUserInfo;

public interface ISocialAuthService {
    SocialUserInfo verifyGoogleToken(String accessToken);
    SocialUserInfo verifyGithubToken(String accessToken);
}
