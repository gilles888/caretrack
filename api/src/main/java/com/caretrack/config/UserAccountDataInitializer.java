package com.caretrack.config;

import com.caretrack.domain.UserAccount;
import com.caretrack.domain.UserAccountRepository;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

/**
 * Initialise les comptes utilisateurs de démo au démarrage (Phase 2).
 *
 * <p>Crée les comptes suivants si absents :
 * <ul>
 *   <li>{@code admin@caretrack.be} / {@code Admin123!} — rôle ADMIN</li>
 *   <li>{@code medecin@caretrack.be} / {@code Medecin123!} — rôle MEDECIN</li>
 * </ul>
 *
 * <p>Les mots de passe sont hashés avec BCrypt au démarrage, jamais stockés en clair.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class UserAccountDataInitializer {

    private final UserAccountRepository userAccountRepository;
    private final PasswordEncoder passwordEncoder;

    @PostConstruct
    @Transactional
    public void init() {
        createIfAbsent("admin@caretrack.be",    "Admin123!",   "ADMIN");
        createIfAbsent("medecin@caretrack.be",  "Medecin123!", "MEDECIN");
    }

    private void createIfAbsent(String email, String plainPassword, String role) {
        if (userAccountRepository.existsByEmail(email)) {
            log.debug("Compte utilisateur déjà existant : {}", email);
            return;
        }
        UserAccount account = UserAccount.builder()
                .email(email)
                .passwordHash(passwordEncoder.encode(plainPassword))
                .roles(role)
                .actif(true)
                .build();
        userAccountRepository.save(account);
        log.info("Compte utilisateur créé : email={} rôle={}", email, role);
    }
}
