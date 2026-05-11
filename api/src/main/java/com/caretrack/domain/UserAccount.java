package com.caretrack.domain;

import jakarta.persistence.*;
import lombok.*;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Arrays;
import java.util.Collection;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * Compte utilisateur CareTrack — Phase 2 JWT + RBAC.
 *
 * <p>Les rôles sont stockés en base sous forme d'une chaîne séparée par des virgules
 * (ex: {@code "MEDECIN,ADMIN"}) et convertis à la volée en {@link GrantedAuthority}.
 *
 * <p>Rôles possibles : {@code PATIENT}, {@code MEDECIN}, {@code INFIRMIER},
 * {@code ADMIN}, {@code ADMIN_SUPPORT}.
 */
@Entity
@Table(name = "user_accounts")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class UserAccount implements UserDetails {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(name = "password_hash", nullable = false)
    private String passwordHash;

    /**
     * Rôles stockés sous forme de chaîne CSV : ex. {@code "MEDECIN,ADMIN"}.
     * Spring Security lira les autorités via {@link #getAuthorities()}.
     */
    @Column(nullable = false)
    @Builder.Default
    private String roles = "PATIENT";

    /** UUID du patient associé (null si l'utilisateur n'est pas un patient). */
    @Column(name = "patient_id")
    private UUID patientId;

    /** UUID du médecin associé (null si l'utilisateur n'est pas un médecin). */
    @Column(name = "medecin_id")
    private UUID medecinId;

    @Column(nullable = false)
    @Builder.Default
    private boolean actif = true;

    // ─── UserDetails ──────────────────────────────────────────────────────────

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return Arrays.stream(roles.split(","))
                .map(String::trim)
                .filter(r -> !r.isBlank())
                .map(r -> new SimpleGrantedAuthority("ROLE_" + r))
                .collect(Collectors.toSet());
    }

    /** Retourne les rôles sous forme d'un {@link Set} de chaînes. */
    public Set<String> getRolesAsSet() {
        return Arrays.stream(roles.split(","))
                .map(String::trim)
                .filter(r -> !r.isBlank())
                .collect(Collectors.toSet());
    }

    @Override
    public String getPassword() {
        return passwordHash;
    }

    @Override
    public String getUsername() {
        return email;
    }

    @Override
    public boolean isAccountNonExpired() {
        return actif;
    }

    @Override
    public boolean isAccountNonLocked() {
        return actif;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return actif;
    }
}
