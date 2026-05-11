package com.caretrack.config.security;

import com.caretrack.domain.UserAccount;
import com.caretrack.domain.UserAccountRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

/**
 * Contrôleur d'authentification — Phase 2 JWT.
 *
 * <p>Expose {@code POST /api/v1/auth/login} qui retourne un token JWT signé
 * à partir d'un couple email/mot de passe valide.
 */
@Slf4j
@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
@Tag(name = "Authentification", description = "Endpoints de connexion et gestion des tokens JWT.")
public class AuthController {

    private final UserAccountRepository userAccountRepository;
    private final JwtService jwtService;
    private final PasswordEncoder passwordEncoder;

    /**
     * Authentifie un utilisateur et retourne un token JWT.
     *
     * @param request corps de la requête avec email et mot de passe
     * @return réponse contenant le token, userId, rôles et email
     */
    @PostMapping("/login")
    @Operation(summary = "Connexion utilisateur",
               description = "Authentifie un utilisateur CareTrack et retourne un token JWT.")
    @ApiResponse(responseCode = "200", description = "Authentification réussie")
    @ApiResponse(responseCode = "401", description = "Identifiants invalides")
    public AuthResponse login(@Valid @RequestBody LoginRequest request) {
        UserAccount user = userAccountRepository.findByEmail(request.email())
                .orElseThrow(() -> {
                    log.warn("Tentative de connexion échouée — email inconnu : {}", request.email());
                    return new ResponseStatusException(HttpStatus.UNAUTHORIZED,
                            "Identifiants invalides");
                });

        if (!user.isActif()) {
            log.warn("Tentative de connexion sur compte inactif : {}", request.email());
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Compte désactivé");
        }

        if (!passwordEncoder.matches(request.password(), user.getPasswordHash())) {
            log.warn("Mot de passe incorrect pour l'utilisateur : {}", request.email());
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Identifiants invalides");
        }

        String token = jwtService.generateToken(user);
        List<String> roles = user.getRolesAsSet().stream().sorted().toList();

        log.info("Connexion réussie — userId={} email={} roles={}", user.getId(), user.getEmail(), roles);

        return new AuthResponse(token, user.getId(), roles, user.getEmail());
    }
}
