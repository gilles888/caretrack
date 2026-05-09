package com.caretrack.questionnaire.domain;

import com.caretrack.domain.Patient;
import com.caretrack.questionnaire.enums.AlerteNiveau;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "alertes_questionnaires")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class AlerteQuestionnaire {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "reponse_id", nullable = false)
    private ReponseQuestionnaire reponse;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "patient_id", nullable = false)
    private Patient patient;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private AlerteNiveau niveau;

    @Column(length = 100)
    private String itemCode;

    private Double valeurObservee;

    private Double seuilDeclenche;

    @Column(columnDefinition = "TEXT")
    private String message;

    @Column(nullable = false)
    @Builder.Default
    private boolean isAcknowledged = false;

    private UUID acknowledgedBy;

    private LocalDateTime acknowledgedAt;

    @Column(nullable = false)
    private LocalDateTime createdAt;

    @PrePersist
    void prePersist() {
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
    }
}
