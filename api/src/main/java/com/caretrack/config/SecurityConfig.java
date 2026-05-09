package com.caretrack.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;

/**
 * Configuration Spring Security.
 *
 * <p>Phase 1 (H2, pas de JWT) : tout le trafic API est autorisé sans authentification.
 * {@code @EnableMethodSecurity} est activé pour préparer la Phase 2 (RBAC via JWT).
 *
 * <p>Phase 2 : décommenter le filtre JWT et restreindre {@code /api/v1/**} aux rôles appropriés.
 */
@Configuration
@EnableWebSecurity
@EnableMethodSecurity  // Prépare Phase 2 : @PreAuthorize sur les méthodes de service/controller
public class SecurityConfig {

    @Value("${spring.h2.console.enabled:false}")
    private boolean h2ConsoleEnabled;

    @Value("${spring.h2.console.path:/h2-console}")
    private String h2ConsolePath;

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .authorizeHttpRequests(auth -> {
                if (h2ConsoleEnabled) {
                    auth.requestMatchers(h2ConsolePath + "/**").permitAll();
                }
                auth
                    .requestMatchers("/api/v1/**").permitAll()
                    .requestMatchers("/swagger-ui/**", "/v3/api-docs/**").permitAll()
                    .anyRequest().authenticated();
            })
            .csrf(csrf -> csrf.disable())
            .headers(headers -> headers
                .frameOptions(frame -> frame.sameOrigin())
            )
            .sessionManagement(session ->
                session.sessionCreationPolicy(SessionCreationPolicy.STATELESS)
            );
        // TODO Phase 2 : ajouter .addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class)
        // TODO Phase 2 : restreindre /api/v1/** avec hasRole("MEDECIN") / hasRole("PATIENT") etc.
        return http.build();
    }
}
