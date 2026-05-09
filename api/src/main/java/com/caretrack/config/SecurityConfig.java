package com.caretrack.config;

import org.springframework.boot.autoconfigure.security.servlet.PathRequest;
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

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .authorizeHttpRequests(auth -> auth
                .requestMatchers(PathRequest.toH2Console()).permitAll()
                .requestMatchers("/api/v1/**").permitAll()           // Phase 1 : tout ouvert
                .requestMatchers("/swagger-ui/**", "/v3/api-docs/**").permitAll()
                .anyRequest().authenticated()
            )
            .csrf(csrf -> csrf
                .disable()  // Désactivé pour les appels REST stateless
            )
            .headers(headers -> headers
                .frameOptions(frame -> frame.sameOrigin())          // H2 Console iframe
            )
            .sessionManagement(session ->
                session.sessionCreationPolicy(SessionCreationPolicy.STATELESS)
            );
        // TODO Phase 2 : ajouter .addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class)
        // TODO Phase 2 : restreindre /api/v1/** avec hasRole("MEDECIN") / hasRole("PATIENT") etc.
        return http.build();
    }
}
