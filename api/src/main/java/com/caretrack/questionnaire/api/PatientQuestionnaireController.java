package com.caretrack.questionnaire.api;

import com.caretrack.domain.Patient;
import com.caretrack.domain.PatientRepository;
import com.caretrack.questionnaire.api.dto.PlanDto;
import com.caretrack.questionnaire.api.dto.ReponseDetailDto;
import com.caretrack.questionnaire.api.mapper.QuestionnaireMapper;
import com.caretrack.questionnaire.config.QuestionnairePlanService;
import com.caretrack.questionnaire.domain.PatientQuestionnairePlan;
import com.caretrack.questionnaire.domain.QuestionnaireTemplate;
import com.caretrack.questionnaire.repository.PatientQuestionnairePlanRepository;
import com.caretrack.questionnaire.repository.QuestionnaireTemplateRepository;
import com.caretrack.questionnaire.repository.ReponseQuestionnaireRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

/**
 * API REST pour la gestion des plans et de l'historique de questionnaires d'un patient.
 */
@Slf4j
@RestController
@RequestMapping("/api/v1/patients/{patientId}/questionnaires")
@RequiredArgsConstructor
@Tag(name = "Plans questionnaires patient",
     description = "Gestion des plans de questionnaires assignés et de l'historique des réponses d'un patient.")
public class PatientQuestionnaireController {

    private final PatientRepository patientRepo;
    private final PatientQuestionnairePlanRepository planRepo;
    private final QuestionnaireTemplateRepository templateRepo;
    private final ReponseQuestionnaireRepository reponseRepo;
    private final QuestionnairePlanService planService;
    private final QuestionnaireMapper mapper;

    // ─────────────────────────────────────────────────────────────────────────
    // Plans
    // ─────────────────────────────────────────────────────────────────────────

    @GetMapping("/plan")
    @Transactional(readOnly = true)
    @Operation(summary = "Plans actifs du patient",
               description = "Retourne tous les plans de questionnaires actifs assignés au patient.")
    @ApiResponse(responseCode = "200", description = "Liste retournée avec succès")
    @ApiResponse(responseCode = "404", description = "Patient introuvable")
    public List<PlanDto> getPlansActifs(@PathVariable UUID patientId) {
        verifierPatientExiste(patientId);
        return planRepo.findByPatientIdAndIsActiveTrue(patientId)
                .stream()
                .map(mapper::toDto)
                .toList();
    }

    @GetMapping("/due")
    @Transactional(readOnly = true)
    @Operation(summary = "Plans en attente (à remplir aujourd'hui)",
               description = "Retourne les plans actifs dont la date d'échéance est aujourd'hui ou dépassée.")
    @ApiResponse(responseCode = "200", description = "Liste retournée avec succès")
    @ApiResponse(responseCode = "404", description = "Patient introuvable")
    public List<PlanDto> getPlansDus(@PathVariable UUID patientId) {
        verifierPatientExiste(patientId);
        return planRepo.findByPatientIdAndNextDueDateLessThanEqualAndIsActiveTrue(
                        patientId, LocalDate.now())
                .stream()
                .map(mapper::toDto)
                .toList();
    }

    @PostMapping("/plan/{templateCode}")
    @ResponseStatus(HttpStatus.CREATED)
    @Transactional
    @Operation(summary = "Assigner un questionnaire au patient",
               description = "Crée un plan actif pour le template donné. Erreur 409 si déjà actif.")
    @ApiResponse(responseCode = "201", description = "Plan créé avec succès")
    @ApiResponse(responseCode = "404", description = "Patient ou template introuvable")
    @ApiResponse(responseCode = "409", description = "Plan déjà actif pour ce template")
    public PlanDto ajouterPlan(@PathVariable UUID patientId,
                               @PathVariable String templateCode) {
        Patient patient = patientRepo.findById(patientId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Patient introuvable : " + patientId));

        QuestionnaireTemplate template = templateRepo.findByCode(templateCode)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Template introuvable : " + templateCode));

        // Vérifier si un plan actif existe déjà
        planRepo.findByPatientIdAndTemplateCode(patientId, templateCode)
                .filter(PatientQuestionnairePlan::isActive)
                .ifPresent(p -> {
                    throw new ResponseStatusException(HttpStatus.CONFLICT,
                            "Un plan actif existe déjà pour le template '" + templateCode + "'");
                });

        LocalDate today = LocalDate.now();
        LocalDate nextDue = planService.calculateNextDueDate(template, today);

        PatientQuestionnairePlan plan = PatientQuestionnairePlan.builder()
                .patient(patient)
                .template(template)
                .dateDebut(today)
                .nextDueDate(nextDue)
                .isActive(true)
                .rappelActif(true)
                .build();

        PatientQuestionnairePlan saved = planRepo.save(plan);
        log.info("Plan créé : patient={} template={}", patientId, templateCode);
        return mapper.toDto(saved);
    }

    @DeleteMapping("/plan/{templateCode}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @Transactional
    @Operation(summary = "Désactiver un plan (soft delete)",
               description = "Passe isActive=false sur le plan du patient pour ce template.")
    @ApiResponse(responseCode = "204", description = "Plan désactivé")
    @ApiResponse(responseCode = "404", description = "Plan introuvable pour ce patient/template")
    public void supprimerPlan(@PathVariable UUID patientId,
                              @PathVariable String templateCode) {
        PatientQuestionnairePlan plan = planRepo.findByPatientIdAndTemplateCode(patientId, templateCode)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "Aucun plan trouvé pour patient=" + patientId
                                + " template=" + templateCode));
        plan.setActive(false);
        planRepo.save(plan);
        log.info("Plan désactivé : patient={} template={}", patientId, templateCode);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Historique
    // ─────────────────────────────────────────────────────────────────────────

    @GetMapping("/history")
    @Transactional(readOnly = true)
    @Operation(summary = "Historique paginé des réponses",
               description = "Retourne toutes les réponses du patient, triées par date décroissante.")
    @ApiResponse(responseCode = "200", description = "Page retournée avec succès")
    @ApiResponse(responseCode = "404", description = "Patient introuvable")
    public Page<ReponseDetailDto> getHistorique(@PathVariable UUID patientId,
                                                @PageableDefault(size = 20) Pageable pageable) {
        verifierPatientExiste(patientId);
        return reponseRepo.findByPatientIdOrderByCompletedAtDesc(patientId, pageable)
                .map(r -> new ReponseDetailDto(
                        r.getId(),
                        r.getPatient().getId(),
                        r.getTemplate().getCode(),
                        r.getCompletedAt(),
                        r.getAnswers(),
                        r.getScores(),
                        r.getScoreGlobal(),
                        r.getDureeSecondes(),
                        r.getReviewedBy(),
                        r.getReviewedAt(),
                        r.getNotesMedecin()
                ));
    }

    @GetMapping("/history/{templateCode}")
    @Transactional(readOnly = true)
    @Operation(summary = "Historique des réponses pour un template",
               description = "Retourne toutes les réponses du patient pour le template spécifié.")
    @ApiResponse(responseCode = "200", description = "Liste retournée avec succès")
    @ApiResponse(responseCode = "404", description = "Patient introuvable")
    public List<ReponseDetailDto> getHistoriqueParTemplate(@PathVariable UUID patientId,
                                                            @PathVariable String templateCode) {
        verifierPatientExiste(patientId);
        return reponseRepo.findByPatientIdAndTemplateCodeOrderByCompletedAtDesc(patientId, templateCode)
                .stream()
                .map(r -> new ReponseDetailDto(
                        r.getId(),
                        r.getPatient().getId(),
                        r.getTemplate().getCode(),
                        r.getCompletedAt(),
                        r.getAnswers(),
                        r.getScores(),
                        r.getScoreGlobal(),
                        r.getDureeSecondes(),
                        r.getReviewedBy(),
                        r.getReviewedAt(),
                        r.getNotesMedecin()
                ))
                .toList();
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Utilitaire
    // ─────────────────────────────────────────────────────────────────────────

    private void verifierPatientExiste(UUID patientId) {
        if (!patientRepo.existsById(patientId)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND,
                    "Patient introuvable : " + patientId);
        }
    }
}
