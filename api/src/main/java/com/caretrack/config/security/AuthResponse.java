package com.caretrack.config.security;

import java.util.List;
import java.util.UUID;

/**
 * Réponse de l'endpoint {@code POST /api/v1/auth/login}.
 *
 * @param token  le token JWT signé (durée de vie : {@code app.security.jwt.expiration} secondes)
 * @param userId UUID de l'utilisateur authentifié
 * @param roles  liste des rôles de l'utilisateur (ex. ["MEDECIN", "ADMIN"])
 * @param email  adresse email de l'utilisateur
 */
public record AuthResponse(
        String token,
        UUID userId,
        List<String> roles,
        String email
) {}
