package com.caretrack.questionnaire.domain;

import com.caretrack.domain.Patient;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.UUID;

@Entity
@Table(
    name = "patient_questionnaire_plans",
    uniqueConstraints = @UniqueConstraint(
        name = "uq_patient_template",
        columnNames = {"patient_id", "template_id"}
    )
)
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class PatientQuestionnairePlan {

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
    private LocalDate dateDebut;

    private LocalDate dateFin;

    private LocalDate nextDueDate;

    private LocalDateTime lastCompletedAt;

    @Column(nullable = false)
    @Builder.Default
    private boolean isActive = true;

    @Builder.Default
    private boolean rappelActif = true;

    @Builder.Default
    private LocalTime heureRappel = LocalTime.of(9, 0);
}
