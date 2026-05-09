package com.caretrack.questionnaire.domain;

import com.caretrack.domain.Disease;
import com.caretrack.questionnaire.enums.FrequenceType;
import com.caretrack.questionnaire.enums.ScopeType;
import jakarta.persistence.*;
import lombok.*;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.UUID;

@Entity
@Table(name = "questionnaire_templates")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class QuestionnaireTemplate {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(unique = true, nullable = false, length = 50)
    private String code;           // ex: ESAS_R, PHQ9, EORTC_C30

    @Column(nullable = false)
    private String nom;

    @Column(columnDefinition = "TEXT")
    private String description;

    private String version;        // ex: "2.0"

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ScopeType scope;

    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
        name = "template_diseases",
        joinColumns = @JoinColumn(name = "template_id"),
        inverseJoinColumns = @JoinColumn(name = "disease_id")
    )
    @Builder.Default
    private Set<Disease> diseases = new HashSet<>();   // vide = universel (CORE)

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private FrequenceType frequence;

    @Column(nullable = false)
    @Builder.Default
    private boolean isActive = true;

    @OneToMany(
        mappedBy = "template",
        cascade = CascadeType.ALL,
        orphanRemoval = true,
        fetch = FetchType.LAZY
    )
    @OrderBy("ordre ASC")
    @Builder.Default
    private List<QuestionItem> items = new ArrayList<>();

    private Integer dureeEstimeeMinutes;

    private String licenceInfo;    // ex: "Gratuit" / "Autorisation EORTC requise"
}
