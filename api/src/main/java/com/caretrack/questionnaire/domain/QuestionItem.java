package com.caretrack.questionnaire.domain;

import com.caretrack.questionnaire.enums.AlerteNiveau;
import com.caretrack.questionnaire.enums.ItemAttributeType;
import com.caretrack.questionnaire.enums.QuestionType;
import jakarta.persistence.*;
import lombok.*;

import java.util.HashSet;
import java.util.Set;
import java.util.UUID;

@Entity
@Table(name = "question_items")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class QuestionItem {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "template_id", nullable = false)
    private QuestionnaireTemplate template;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String texte;

    private String texteCourt;     // affichage compact

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private QuestionType type;

    @Column(nullable = false)
    private Integer ordre;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(
        name = "question_item_attributes",
        joinColumns = @JoinColumn(name = "item_id")
    )
    @Enumerated(EnumType.STRING)
    @Column(name = "attribute")
    @Builder.Default
    private Set<ItemAttributeType> attributes = new HashSet<>();

    private Double seuilAlerteMin;

    private Double seuilAlerteMax;

    @Enumerated(EnumType.STRING)
    private AlerteNiveau alerteNiveau;

    @Column(length = 50)
    private String domaineCode;    // ex: PHYSIQUE, EMOTIONNEL, DOULEUR

    @Builder.Default
    private boolean isInverse = false;   // score inversé (ex: bien-être)

    private String labelMin;       // ex: "Aucune"
    private String labelMax;       // ex: "Le pire possible"
}
