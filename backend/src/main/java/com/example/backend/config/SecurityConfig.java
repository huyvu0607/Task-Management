package com.example.backend.config;

import com.example.backend.security.CustomUserDetailsService;
import com.example.backend.security.JwtAuthenticationEntryPoint;
import com.example.backend.security.JwtAuthenticationFilter;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfigurationSource;

/**
 * Configuration cho Spring Security
 */
@Configuration
@EnableWebSecurity
@EnableMethodSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthFilter;
    private final JwtAuthenticationEntryPoint jwtAuthenticationEntryPoint;
    private final CustomUserDetailsService customUserDetailsService;
    private final CorsConfigurationSource corsConfigurationSource; // Inject từ CorsConfig

    /**
     * Cấu hình Security Filter Chain
     */
    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                // Disable CSRF vì dùng JWT (stateless)
                .csrf(AbstractHttpConfigurer::disable)

                // Enable CORS - dùng bean từ CorsConfig
                .cors(cors -> cors.configurationSource(corsConfigurationSource))

                // Cấu hình authorization
                .authorizeHttpRequests(auth -> auth
                        // Cho phép truy cập các endpoint public (không cần token)
                        .requestMatchers(
                                "/api/auth/test",
                                "/api/auth/register",
                                "/api/auth/login",
                                "/api/auth/social-login",
                                "/api/auth/google/**",
                                "/api/auth/github/**"
                        ).permitAll()

                        // Cho phép Swagger/OpenAPI docs (nếu có)
                        .requestMatchers(
                                "/v3/api-docs/**",
                                "/swagger-ui/**",
                                "/swagger-ui.html"
                        ).permitAll()

                        // Tất cả các request khác đều cần authentication
                        .anyRequest().authenticated()
                )

                // Cấu hình exception handling
                .exceptionHandling(exception -> exception
                        .authenticationEntryPoint(jwtAuthenticationEntryPoint)
                )

                // Stateless session (không lưu session)
                .sessionManagement(session -> session
                        .sessionCreationPolicy(SessionCreationPolicy.STATELESS)
                )

                // Cấu hình Authentication Provider
                .authenticationProvider(authenticationProvider())

                // Thêm JWT filter trước UsernamePasswordAuthenticationFilter
                .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    /**
     * Password Encoder - BCrypt
     */
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    /**
     * Authentication Provider
     */
    @Bean
    public DaoAuthenticationProvider authenticationProvider() {
        DaoAuthenticationProvider authProvider = new DaoAuthenticationProvider(customUserDetailsService);
        authProvider.setPasswordEncoder(passwordEncoder());
        return authProvider;
    }

    /**
     * Authentication Manager
     */
    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }
}