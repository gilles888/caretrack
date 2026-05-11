package com.caretrack.config;

import com.caretrack.config.security.JwtAuthenticationFilter;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

/**
 * Configuration Spring Security — Phase 2 JWT + RBAC.
 *
 * <p>Routes protégées :
 * <ul>
 *   <li>{@code POST /api/v1/auth/login} — public</li>
 *   <li>{@code /swagger-ui/**}, {@code /v3/api-docs/**} — public</li>
 *   <li>{@code /api/v1/patients/**} — MEDECIN, INFIRMIER, ADMIN</li>
 *   <li>{@code /api/v1/alertes/**} — MEDECIN, INFIRMIER, ADMIN</li>
 *   <li>{@code /api/v1/analytics/**} — MEDECIN, INFIRMIER, ADMIN</li>
 *   <li>{@code /api/v1/pro/**} — MEDECIN, INFIRMIER, ADMIN, ADMIN_SUPPORT</li>
 *   <li>{@code /api/v1/questionnaires/**} — MEDECIN, INFIRMIER, ADMIN, PATIENT</li>
 * </ul>
 *
 * <p>Note : {@code /api/v1/patients/{id}/reponses} (soumission patient) est couvert par
 * {@code /api/v1/patients/**} qui inclut PATIENT. La vérification que le patientId
 * correspond bien au token JWT est effectuée dans {@code ReponseController}.
 */
@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {

    @Value("${spring.h2.console.enabled:false}")
    private boolean h2ConsoleEnabled;

    @Value("${spring.h2.console.path:/h2-console}")
    private String h2ConsolePath;

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http,
                                           JwtAuthenticationFilter jwtFilter) throws Exception {
        http
            .authorizeHttpRequests(auth -> {
                // H2 console (développement uniquement)
                if (h2ConsoleEnabled) {
                    auth.requestMatchers(h2ConsolePath + "/**").permitAll();
                }
                auth
                    // Endpoints publics
                    .requestMatchers("/api/v1/auth/**").permitAll()
                    .requestMatchers("/swagger-ui/**", "/v3/api-docs/**", "/swagger-ui.html").permitAll()

                    // Dashboard pro — MEDECIN, INFIRMIER, ADMIN, ADMIN_SUPPORT
                    .requestMatchers("/api/v1/pro/**")
                        .hasAnyRole("MEDECIN", "INFIRMIER", "ADMIN", "ADMIN_SUPPORT")

                    // Analytics — MEDECIN, INFIRMIER, ADMIN
                    .requestMatchers("/api/v1/analytics/**")
                        .hasAnyRole("MEDECIN", "INFIRMIER", "ADMIN")

                    // Alertes — MEDECIN, INFIRMIER, ADMIN
                    .requestMatchers("/api/v1/alertes/**")
                        .hasAnyRole("MEDECIN", "INFIRMIER", "ADMIN")

                    // Patients — MEDECIN, INFIRMIER, ADMIN (et PATIENT pour ses propres réponses)
                    .requestMatchers("/api/v1/patients/**")
                        .hasAnyRole("MEDECIN", "INFIRMIER", "ADMIN", "PATIENT")

                    // Templates questionnaires — tous les rôles authentifiés
                    .requestMatchers("/api/v1/questionnaires/**")
                        .hasAnyRole("MEDECIN", "INFIRMIER", "ADMIN", "ADMIN_SUPPORT", "PATIENT")

                    // Toute autre requête non authentifiée refusée
                    .anyRequest().authenticated();
            })
            .csrf(csrf -> csrf.disable())
            .headers(headers -> headers
                .frameOptions(frame -> frame.sameOrigin())
            )
            .sessionManagement(session ->
                session.sessionCreationPolicy(SessionCreationPolicy.STATELESS)
            )
            .addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}
