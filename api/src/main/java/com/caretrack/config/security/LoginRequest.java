package com.caretrack.config.security;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

/**
 * Corps de la requête de login : {@code POST /api/v1/auth/login}.
 *
 * @param email    adresse email de l'utilisateur
 * @param password mot de passe en clair
 */
public record LoginRequest(
        @NotBlank(message = "L'email est obligatoire")
        @Email(message = "Format email invalide")
        String email,

        @NotBlank(message = "Le mot de passe est obligatoire")
        String password
) {}
