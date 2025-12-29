package com.example.backend.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.annotation.EnableScheduling;

/**
 * Configuration để enable Async processing và Scheduled tasks
 *
 * @EnableAsync - Cho phép sử dụng @Async annotation để chạy method trong thread riêng
 * @EnableScheduling - Cho phép sử dụng @Scheduled annotation để chạy task định kỳ
 */
@Configuration
@EnableAsync
@EnableScheduling
public class AsyncConfig {
    // Spring Boot tự động config ThreadPoolTaskExecutor
    // Nếu cần custom, có thể thêm @Bean AsyncTaskExecutor
}