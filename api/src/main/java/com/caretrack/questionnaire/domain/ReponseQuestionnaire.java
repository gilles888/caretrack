package com.caretrack.questionnaire.domain;

import com.caretrack.config.JsonDoubleMapConverter;
import com.caretrack.config.JsonMapConverter;
import com.caretrack.domain.Patient;
import com.caretrack.questionnaire.enums.SourceQuestionnaire;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@Entity
@Table(name = "reponses_questionnaires")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class ReponseQuestionnaire {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "patient_id", nullable = false)
    private Patient patient;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "template_id", nullable = false)
    private QuestionnaireTemplate template;

    @Column(nullable = false)
    private LocalDateTime completedAt;

    // Phase 1 H2 : TEXT sérialisé JSON
    // Phase 2 PostgreSQL : changer columnDefinition en "jsonb"
    @Column(columnDefinition = "TEXT")
    @Convert(converter = JsonMapConverter.class)
    @Builder.Default
    private Map<String, Object> answers = new HashMap<>();   // {itemId: value}

    @Column(columnDefinition = "TEXT")
    @Convert(converter = JsonDoubleMapConverter.class)
    @Builder.Default
    private Map<String, Double> scores = new HashMap<>();    // {domaine: score}

    private Double scoreGlobal;

    private Integer dureeSecondes;

    @Enumerated(EnumType.STRING)
    private SourceQuestionnaire source;

    private UUID reviewedBy;       // id médecin (nullable)

    private LocalDateTime reviewedAt;

    @Column(columnDefinition = "TEXT")
    private String notesMedecin;
}
