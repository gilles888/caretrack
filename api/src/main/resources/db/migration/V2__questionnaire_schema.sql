-- V2 : schéma questionnaires — template, questions, plans, réponses, alertes
-- Généré à partir de l'introspection PostgreSQL du 2026-05-10

CREATE TABLE IF NOT EXISTS questionnaire_templates (
    id                     UUID         NOT NULL,
    code                   VARCHAR(50)  NOT NULL,
    nom                    VARCHAR(255) NOT NULL,
    description            TEXT,
    frequence              VARCHAR(255) NOT NULL,
    scope                  VARCHAR(255) NOT NULL,
    is_active              BOOLEAN      NOT NULL,
    duree_estimee_minutes  INTEGER,
    version                VARCHAR(255),
    licence_info           VARCHAR(255),
    CONSTRAINT questionnaire_templates_pkey PRIMARY KEY (id),
    CONSTRAINT uk4j68gj9wgmoxwihhuaser3cbk UNIQUE (code)
);

CREATE TABLE IF NOT EXISTS template_diseases (
    template_id UUID NOT NULL,
    disease_id  UUID NOT NULL,
    CONSTRAINT template_diseases_pkey PRIMARY KEY (template_id, disease_id),
    CONSTRAINT fkc6edfiksoec2m4qmfg2k0mv6o FOREIGN KEY (template_id) REFERENCES questionnaire_templates (id),
    CONSTRAINT fkst0dqfodih1wwc4ufpgemlg6v FOREIGN KEY (disease_id)  REFERENCES diseases (id)
);

CREATE TABLE IF NOT EXISTS question_items (
    id                UUID         NOT NULL,
    template_id       UUID         NOT NULL,
    texte             TEXT         NOT NULL,
    texte_court       VARCHAR(255),
    type              VARCHAR(255) NOT NULL,
    ordre             INTEGER      NOT NULL,
    domaine_code      VARCHAR(50),
    is_inverse        BOOLEAN      NOT NULL,
    label_min         VARCHAR(255),
    label_max         VARCHAR(255),
    seuil_alerte_min  DOUBLE PRECISION,
    seuil_alerte_max  DOUBLE PRECISION,
    alerte_niveau     VARCHAR(255),
    CONSTRAINT question_items_pkey PRIMARY KEY (id),
    CONSTRAINT fkt4n2rgdk5129cmh276pewl5b9 FOREIGN KEY (template_id) REFERENCES questionnaire_templates (id)
);

CREATE TABLE IF NOT EXISTS question_item_attributes (
    item_id   UUID         NOT NULL,
    attribute VARCHAR(255),
    CONSTRAINT fkqylbjh69wnggxfp11x25gr3i3 FOREIGN KEY (item_id) REFERENCES question_items (id)
);

CREATE TABLE IF NOT EXISTS patient_questionnaire_plans (
    id                UUID    NOT NULL,
    patient_id        UUID    NOT NULL,
    template_id       UUID    NOT NULL,
    date_debut        DATE    NOT NULL,
    date_fin          DATE,
    is_active         BOOLEAN NOT NULL,
    rappel_actif      BOOLEAN NOT NULL,
    heure_rappel      TIME,
    next_due_date     DATE,
    last_completed_at TIMESTAMP,
    CONSTRAINT patient_questionnaire_plans_pkey PRIMARY KEY (id),
    CONSTRAINT uq_patient_template            UNIQUE (patient_id, template_id),
    CONSTRAINT fkni40svqywpx8g8p1to0vef0iv FOREIGN KEY (patient_id)  REFERENCES patients (id),
    CONSTRAINT fkgdaa2ga16dw7mxujt3a5ycqyk FOREIGN KEY (template_id) REFERENCES questionnaire_templates (id)
);

CREATE TABLE IF NOT EXISTS reponses_questionnaires (
    id             UUID         NOT NULL,
    patient_id     UUID         NOT NULL,
    template_id    UUID         NOT NULL,
    completed_at   TIMESTAMP    NOT NULL,
    answers        TEXT,
    scores         TEXT,
    score_global   DOUBLE PRECISION,
    duree_secondes INTEGER,
    source         VARCHAR(255),
    reviewed_by    UUID,
    reviewed_at    TIMESTAMP,
    notes_medecin  TEXT,
    CONSTRAINT reponses_questionnaires_pkey PRIMARY KEY (id),
    CONSTRAINT fks8s6u9q8vuivw1p4mxwfu4b1j FOREIGN KEY (patient_id)  REFERENCES patients (id),
    CONSTRAINT fkjbnps6mxg3bb8wro6w4t90mpy FOREIGN KEY (template_id) REFERENCES questionnaire_templates (id)
);

CREATE TABLE IF NOT EXISTS alertes_questionnaires (
    id                UUID         NOT NULL,
    patient_id        UUID         NOT NULL,
    reponse_id        UUID         NOT NULL,
    niveau            VARCHAR(255) NOT NULL,
    message           TEXT,
    item_code         VARCHAR(100),
    valeur_observee   DOUBLE PRECISION,
    seuil_declenche   DOUBLE PRECISION,
    is_acknowledged   BOOLEAN      NOT NULL,
    acknowledged_by   UUID,
    acknowledged_at   TIMESTAMP,
    created_at        TIMESTAMP    NOT NULL,
    CONSTRAINT alertes_questionnaires_pkey PRIMARY KEY (id),
    CONSTRAINT fkgju6r8cbmj135amsxo8931b8w FOREIGN KEY (patient_id)  REFERENCES patients (id),
    CONSTRAINT fk3j8213c1peuotakhldrc4d5yl FOREIGN KEY (reponse_id)  REFERENCES reponses_questionnaires (id)
);
