package com.caretrack.questionnaire.api;

import com.caretrack.domain.Patient;
import com.caretrack.domain.PatientRepository;
import com.caretrack.questionnaire.api.dto.AlerteDto;
import com.caretrack.questionnaire.api.dto.ReponseDetailDto;
import com.caretrack.questionnaire.api.dto.ReponseSoumissionRequest;
import com.caretrack.questionnaire.api.dto.ReponseSoumissionResponse;
import com.caretrack.questionnaire.api.dto.ReviewRequest;
import com.caretrack.questionnaire.api.mapper.QuestionnaireMapper;
import com.caretrack.questionnaire.api.service.AlerteService;
import com.caretrack.questionnaire.api.service.ScoreCalculatorService;
import com.caretrack.questionnaire.config.QuestionnairePlanService;
import com.caretrack.questionnaire.domain.AlerteQuestionnaire;
import com.caretrack.questionnaire.domain.PatientQuestionnairePlan;
import com.caretrack.questionnaire.domain.QuestionnaireTemplate;
import com.caretrack.questionnaire.domain.ReponseQuestionnaire;
import com.caretrack.questionnaire.enums.SourceQuestionnaire;
import com.caretrack.questionnaire.repository.PatientQuestionnairePlanRepository;
import com.caretrack.questionnaire.repository.QuestionnaireTemplateRepository;
import com.caretrack.questionnaire.repository.ReponseQuestionnaireRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;

/**
 * API REST pour la soumission et la consultation des réponses de questionnaires.
 */
@Slf4j
@RestController
@RequestMapping("/api/v1/patients/{patientId}/reponses")
@RequiredArgsConstructor
@Tag(name = "Réponses questionnaires",
     description = "Soumission, consultation et annotation des réponses de questionnaires patients.")
public class ReponseController {

    private final PatientRepository patientRepo;
    private final QuestionnaireTemplateRepository templateRepo;
    private final ReponseQuestionnaireRepository reponseRepo;
    private final PatientQuestionnairePlanRepository planRepo;
    private final ScoreCalculatorService scoreCalculator;
    private final AlerteService alerteService;
    private final QuestionnairePlanService planService;
    private final QuestionnaireMapper mapper;

    // ─────────────────────────────────────────────────────────────────────────
    // Soumission
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * Soumet un questionnaire complété.
     * <ol>
     *   <li>Vérifie que le patient existe.</li>
     *   <li>Retrouve le template par code.</li>
     *   <li>Calcule les scores par domaine et le score global.</li>
     *   <li>Persiste la réponse.</li>
     *   <li>Évalue et persiste les alertes cliniques.</li>
     *   <li>Marque le plan comme complété si un plan actif existe.</li>
     * </ol>
     */
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @Transactional
    @Operation(summary = "Soumettre un questionnaire",
               description = "Enregistre les réponses, calcule les scores et évalue les alertes cliniques.")
    @ApiResponse(responseCode = "201", description = "Réponse enregistrée avec succès")
    @ApiResponse(responseCode = "400", description = "Données invalides")
    @ApiResponse(responseCode = "404", description = "Patient ou template introuvable")
    public ReponseSoumissionResponse soumettre(
            @PathVariable UUID patientId,
            @Valid @RequestBody ReponseSoumissionRequest request) {

        // 1. Vérifier patient
        Patient patient = patientRepo.findById(patientId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Patient introuvable : " + patientId));

        // 2. Retrouver template
        QuestionnaireTemplate template = templateRepo.findByCode(request.templateCode())
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Template introuvable : " + request.templateCode()));

        if (!template.isActive()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Le template '" + request.templateCode() + "' n'est plus actif");
        }

        // 3. Calculer les scores
        Map<String, Double> scores = scoreCalculator.calculateScores(template, request.answers());
        Double scoreGlobal = scoreCalculator.calculateGlobalScore(template, scores);

        // 4. Persister la réponse
        ReponseQuestionnaire reponse = ReponseQuestionnaire.builder()
                .patient(patient)
                .template(template)
                .completedAt(LocalDateTime.now())
                .answers(request.answers())
                .scores(scores)
                .scoreGlobal(scoreGlobal)
                .dureeSecondes(request.dureeSecondes())
                .source(SourceQuestionnaire.WEB)
                .build();

        ReponseQuestionnaire saved = reponseRepo.save(reponse);
        log.info("Réponse enregistrée : patient={} template={} scoreGlobal={}",
                patientId, request.templateCode(), scoreGlobal);

        // 5. Évaluer les alertes cliniques
        List<AlerteQuestionnaire> alertes = alerteService.evaluate(saved, template, request.answers());

        // 6. Marquer le plan comme complété si un plan actif existe
        planRepo.findByPatientIdAndTemplateCode(patientId, request.templateCode())
                .filter(PatientQuestionnairePlan::isActive)
                .ifPresent(planService::markCompleted);

        // 7. Construire la réponse
        List<AlerteDto> alerteDtos = alertes.stream().map(mapper::toDto).toList();
        String message = buildMessage(alertes);

        return new ReponseSoumissionResponse(saved.getId(), scores, scoreGlobal, alerteDtos, message);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Consultation
    // ─────────────────────────────────────────────────────────────────────────

    @GetMapping("/{reponseId}")
    @Transactional(readOnly = true)
    @Operation(summary = "Détail d'une réponse",
               description = "Retourne le détail complet d'une réponse de questionnaire.")
    @ApiResponse(responseCode = "200", description = "Réponse trouvée")
    @ApiResponse(responseCode = "404", description = "Réponse introuvable ou n'appartient pas au patient")
    public ReponseDetailDto getById(@PathVariable UUID patientId,
                                    @PathVariable UUID reponseId) {
        ReponseQuestionnaire reponse = reponseRepo.findById(reponseId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Réponse introuvable : " + reponseId));

        // Vérifier que la réponse appartient bien au patient demandé
        if (!reponse.getPatient().getId().equals(patientId)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND,
                    "Réponse introuvable pour ce patient");
        }

        return new ReponseDetailDto(
                reponse.getId(),
                reponse.getPatient().getId(),
                reponse.getTemplate().getCode(),
                reponse.getCompletedAt(),
                reponse.getAnswers(),
                reponse.getScores(),
                reponse.getScoreGlobal(),
                reponse.getDureeSecondes(),
                reponse.getReviewedBy(),
                reponse.getReviewedAt(),
                reponse.getNotesMedecin()
        );
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Annotation médicale
    // ─────────────────────────────────────────────────────────────────────────

    @PutMapping("/{reponseId}/review")
    @Transactional
    @Operation(summary = "Annoter une réponse (revue médicale)",
               description = "Enregistre les notes du médecin, la date et l'auteur de la revue.")
    @ApiResponse(responseCode = "200", description = "Annotation enregistrée")
    @ApiResponse(responseCode = "400", description = "Notes invalides (vides)")
    @ApiResponse(responseCode = "404", description = "Réponse introuvable ou n'appartient pas au patient")
    public ReponseDetailDto review(@PathVariable UUID patientId,
                                   @PathVariable UUID reponseId,
                                   @Valid @RequestBody ReviewRequest reviewRequest) {
        ReponseQuestionnaire reponse = reponseRepo.findById(reponseId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Réponse introuvable : " + reponseId));

        if (!reponse.getPatient().getId().equals(patientId)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND,
                    "Réponse introuvable pour ce patient");
        }

        // Phase 1 : UUID aléatoire pour reviewedBy (Phase 2 : extraire du token JWT)
        reponse.setNotesMedecin(reviewRequest.notesMedecin());
        reponse.setReviewedAt(LocalDateTime.now());
        reponse.setReviewedBy(UUID.randomUUID());

        ReponseQuestionnaire saved = reponseRepo.save(reponse);
        log.info("Revue médicale enregistrée : reponseId={}", reponseId);

        return new ReponseDetailDto(
                saved.getId(),
                saved.getPatient().getId(),
                saved.getTemplate().getCode(),
                saved.getCompletedAt(),
                saved.getAnswers(),
                saved.getScores(),
                saved.getScoreGlobal(),
                saved.getDureeSecondes(),
                saved.getReviewedBy(),
                saved.getReviewedAt(),
                saved.getNotesMedecin()
        );
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Utilitaire
    // ─────────────────────────────────────────────────────────────────────────

    private String buildMessage(List<AlerteQuestionnaire> alertes) {
        if (alertes.isEmpty()) {
            return "Questionnaire enregistré avec succès. Aucune alerte détectée.";
        }
        long critiques = alertes.stream()
                .filter(a -> a.getNiveau() == com.caretrack.questionnaire.enums.AlerteNiveau.CRITICAL)
                .count();
        if (critiques > 0) {
            return String.format(
                    "Questionnaire enregistré. %d alerte(s) critique(s) déclenchée(s) — votre équipe soignante a été notifiée.",
                    critiques);
        }
        return String.format(
                "Questionnaire enregistré. %d alerte(s) détectée(s).", alertes.size());
    }
}
