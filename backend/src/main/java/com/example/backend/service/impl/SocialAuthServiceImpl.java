package com.example.backend.service.impl;

import com.example.backend.dto.auth.SocialUserInfo;
import com.example.backend.service.ISocialAuthService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.client.HttpClientErrorException;

import java.util.Map;
import java.util.List;

@Service
@Slf4j
public class SocialAuthServiceImpl implements ISocialAuthService {

    private final RestTemplate restTemplate = new RestTemplate();

    @Override
    public SocialUserInfo verifyGoogleToken(String accessToken) {
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setBearerAuth(accessToken);
            HttpEntity<String> entity = new HttpEntity<>(headers);

            ResponseEntity<Map> response = restTemplate.exchange(
                    "https://www.googleapis.com/oauth2/v2/userinfo",
                    HttpMethod.GET,
                    entity,
                    Map.class
            );

            Map<String, Object> body = response.getBody();
            if (body == null) {
                throw new RuntimeException("Không thể xác thực Google token");
            }

            log.info("Google user info: {}", body);

            return SocialUserInfo.builder()
                    .id((String) body.get("id"))
                    .email((String) body.get("email"))
                    .name((String) body.get("name"))
                    .avatarUrl((String) body.get("picture"))
                    .provider("google")
                    .build();

        } catch (HttpClientErrorException e) {
            log.error("Lỗi verify Google token: {}", e.getMessage());
            throw new RuntimeException("Google token không hợp lệ");
        } catch (Exception e) {
            log.error("Lỗi không xác định khi verify Google token: {}", e.getMessage());
            throw new RuntimeException("Không thể xác thực với Google");
        }
    }

    @Override
    public SocialUserInfo verifyGithubToken(String accessToken) {
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setBearerAuth(accessToken);
            headers.set("Accept", "application/vnd.github.v3+json");
            HttpEntity<String> entity = new HttpEntity<>(headers);

            // Get user info
            ResponseEntity<Map> userResponse = restTemplate.exchange(
                    "https://api.github.com/user",
                    HttpMethod.GET,
                    entity,
                    Map.class
            );

            Map<String, Object> userData = userResponse.getBody();
            if (userData == null) {
                throw new RuntimeException("Không thể xác thực GitHub token");
            }

            log.info("GitHub user info: {}", userData);

            // Get email
            String email = (String) userData.get("email");
            if (email == null || email.isEmpty()) {
                try {
                    ResponseEntity<List> emailResponse = restTemplate.exchange(
                            "https://api.github.com/user/emails",
                            HttpMethod.GET,
                            entity,
                            List.class
                    );

                    List<Map<String, Object>> emails = emailResponse.getBody();
                    if (emails != null && !emails.isEmpty()) {
                        // Tìm primary email
                        for (Map<String, Object> emailData : emails) {
                            if (Boolean.TRUE.equals(emailData.get("primary"))) {
                                email = (String) emailData.get("email");
                                break;
                            }
                        }
                        // Nếu không có primary, lấy email đầu tiên
                        if (email == null && !emails.isEmpty()) {
                            email = (String) emails.get(0).get("email");
                        }
                    }
                } catch (Exception e) {
                    log.warn("Không thể lấy email từ GitHub: {}", e.getMessage());
                }
            }

            return SocialUserInfo.builder()
                    .id(String.valueOf(userData.get("id")))
                    .email(email)
                    .name((String) userData.get("name"))
                    .avatarUrl((String) userData.get("avatar_url"))
                    .provider("github")
                    .build();

        } catch (HttpClientErrorException e) {
            log.error("Lỗi verify GitHub token: {}", e.getMessage());
            throw new RuntimeException("GitHub token không hợp lệ");
        } catch (Exception e) {
            log.error("Lỗi không xác định khi verify GitHub token: {}", e.getMessage());
            throw new RuntimeException("Không thể xác thực với GitHub");
        }
    }
}