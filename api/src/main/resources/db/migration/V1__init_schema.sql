-- V1 : schéma initial — tables patient, disease, protocole_traitement
-- Généré à partir de l'introspection PostgreSQL du 2026-05-10

CREATE TABLE IF NOT EXISTS diseases (
    id          UUID         NOT NULL,
    code        VARCHAR(50)  NOT NULL,
    nom         VARCHAR(255) NOT NULL,
    description VARCHAR(255),
    CONSTRAINT diseases_pkey PRIMARY KEY (id),
    CONSTRAINT uk1go03fs7gxneljj3m2whj7mqv UNIQUE (code)
);

CREATE TABLE IF NOT EXISTS patients (
    id              UUID         NOT NULL,
    nom             VARCHAR(255) NOT NULL,
    prenom          VARCHAR(255) NOT NULL,
    date_naissance  DATE,
    email           VARCHAR(255),
    actif           BOOLEAN      NOT NULL,
    disease_id      UUID,
    CONSTRAINT patients_pkey PRIMARY KEY (id),
    CONSTRAINT uka370hmxgv0l5c9panryr1ji7d UNIQUE (email),
    CONSTRAINT fkfsg1gs2dr37bfnbcaxdf8isc8 FOREIGN KEY (disease_id) REFERENCES diseases (id)
);

CREATE TABLE IF NOT EXISTS protocoles_traitement (
    id          UUID         NOT NULL,
    nom         VARCHAR(255) NOT NULL,
    description VARCHAR(255),
    actif       BOOLEAN      NOT NULL,
    date_debut  DATE,
    date_fin    DATE,
    patient_id  UUID         NOT NULL,
    CONSTRAINT protocoles_traitement_pkey PRIMARY KEY (id),
    CONSTRAINT fko2gkhyqegjdqxri3hc418s488 FOREIGN KEY (patient_id) REFERENCES patients (id)
);
