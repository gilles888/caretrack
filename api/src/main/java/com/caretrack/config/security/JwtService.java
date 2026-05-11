package com.caretrack.config.security;

import com.caretrack.domain.UserAccount;
import com.caretrack.domain.UserAccountRepository;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;
import java.util.List;
import java.util.UUID;

/**
 * Service JWT — génération, validation et extraction des claims.
 *
 * <p>Implémente aussi {@link UserDetailsService} pour l'intégration Spring Security.
 *
 * <p>Claims du token :
 * <ul>
 *   <li>{@code sub} — userId (UUID en String)</li>
 *   <li>{@code email} — adresse email</li>
 *   <li>{@code roles} — liste de String (ex. ["MEDECIN", "ADMIN"])</li>
 * </ul>
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class JwtService implements UserDetailsService {

    private final UserAccountRepository userAccountRepository;

    @Value("${app.security.jwt.secret}")
    private String jwtSecret;

    @Value("${app.security.jwt.expiration:86400}")
    private long jwtExpirationSeconds;

    // ─── Génération ───────────────────────────────────────────────────────────

    /**
     * Génère un token JWT signé pour l'utilisateur donné.
     *
     * @param user le compte utilisateur authentifié
     * @return le token JWT signé
     */
    public String generateToken(UserAccount user) {
        Date now = new Date();
        Date expiry = new Date(now.getTime() + jwtExpirationSeconds * 1000L);

        return Jwts.builder()
                .subject(user.getId().toString())
                .claim("email", user.getEmail())
                .claim("roles", user.getRolesAsSet().stream().sorted().toList())
                .issuedAt(now)
                .expiration(expiry)
                .signWith(getSigningKey())
                .compact();
    }

    // ─── Validation ───────────────────────────────────────────────────────────

    /**
     * Valide le token JWT.
     *
     * @param token le token à valider
     * @return {@code true} si le token est valide et non expiré
     */
    public boolean validateToken(String token) {
        try {
            parseClaims(token);
            return true;
        } catch (JwtException | IllegalArgumentException e) {
            log.debug("Token JWT invalide : {}", e.getMessage());
            return false;
        }
    }

    // ─── Extraction des claims ────────────────────────────────────────────────

    /**
     * Extrait l'UUID utilisateur du claim {@code sub}.
     *
     * @param token le token JWT
     * @return l'UUID de l'utilisateur
     */
    public UUID extractUserId(String token) {
        return UUID.fromString(parseClaims(token).getSubject());
    }

    /**
     * Extrait la liste des rôles du claim {@code roles}.
     *
     * @param token le token JWT
     * @return la liste des rôles (ex. ["MEDECIN", "ADMIN"])
     */
    @SuppressWarnings("unchecked")
    public List<String> extractRoles(String token) {
        Object rolesObj = parseClaims(token).get("roles");
        if (rolesObj instanceof List<?> list) {
            return list.stream().map(Object::toString).toList();
        }
        return List.of();
    }

    /**
     * Extrait l'email du claim {@code email}.
     *
     * @param token le token JWT
     * @return l'adresse email
     */
    public String extractEmail(String token) {
        return (String) parseClaims(token).get("email");
    }

    // ─── UserDetailsService ───────────────────────────────────────────────────

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        return userAccountRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException(
                        "Utilisateur introuvable : " + email));
    }

    // ─── Interne ──────────────────────────────────────────────────────────────

    private Claims parseClaims(String token) {
        return Jwts.parser()
                .verifyWith(getSigningKey())
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    private SecretKey getSigningKey() {
        byte[] keyBytes = jwtSecret.getBytes(StandardCharsets.UTF_8);
        return Keys.hmacShaKeyFor(keyBytes);
    }
}
