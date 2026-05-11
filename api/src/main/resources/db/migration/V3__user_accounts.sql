-- V3 : table user_accounts — Phase 2 JWT + RBAC
-- Les mots de passe initiaux sont injectés par DataInitializer au démarrage (BCrypt)

CREATE TABLE IF NOT EXISTS user_accounts (
    id            UUID         NOT NULL DEFAULT gen_random_uuid(),
    email         VARCHAR(255) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    roles         TEXT         NOT NULL DEFAULT 'PATIENT',
    patient_id    UUID         REFERENCES patients(id),
    medecin_id    UUID,
    actif         BOOLEAN      NOT NULL DEFAULT TRUE,
    created_at    TIMESTAMP    NOT NULL DEFAULT now(),
    CONSTRAINT user_accounts_pkey    PRIMARY KEY (id),
    CONSTRAINT user_accounts_email_uk UNIQUE (email)
);

-- Index sur email pour les lookups d'authentification
CREATE INDEX IF NOT EXISTS idx_user_accounts_email ON user_accounts (email);
