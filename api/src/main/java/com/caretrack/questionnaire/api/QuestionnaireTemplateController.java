package com.caretrack.questionnaire.api;

import com.caretrack.questionnaire.api.dto.TemplateDetailDto;
import com.caretrack.questionnaire.api.dto.TemplateDto;
import com.caretrack.questionnaire.api.mapper.QuestionnaireMapper;
import com.caretrack.questionnaire.domain.QuestionnaireTemplate;
import com.caretrack.questionnaire.repository.QuestionnaireTemplateRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.UUID;

/**
 * API REST pour la gestion des templates de questionnaires cliniques.
 */
@Slf4j
@RestController
@RequestMapping("/api/v1/questionnaires")
@RequiredArgsConstructor
@Tag(name = "Questionnaire Templates",
     description = "CRUD des templates de questionnaires cliniques (ESAS-R, PHQ-9, KCCQ-12, etc.)")
public class QuestionnaireTemplateController {

    private final QuestionnaireTemplateRepository templateRepo;
    private final QuestionnaireMapper mapper;

    // ─────────────────────────────────────────────────────────────────────────
    // Lecture
    // ─────────────────────────────────────────────────────────────────────────

    @GetMapping
    @Transactional(readOnly = true)
    @Operation(summary = "Lister les templates actifs",
               description = "Retourne tous les templates de questionnaires dont isActive=true.")
    @ApiResponse(responseCode = "200", description = "Liste retournée avec succès")
    public List<TemplateDto> listActifs() {
        return templateRepo.findByIsActiveTrue()
                .stream()
                .map(mapper::toDto)
                .toList();
    }

    @GetMapping("/{id}")
    @Transactional(readOnly = true)
    @Operation(summary = "Détail d'un template",
               description = "Retourne le template avec sa liste complète d'items, trié par ordre.")
    @ApiResponse(responseCode = "200", description = "Template trouvé")
    @ApiResponse(responseCode = "404", description = "Template introuvable")
    public TemplateDetailDto getById(@PathVariable UUID id) {
        QuestionnaireTemplate template = templateRepo.findById(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Template introuvable : " + id));
        return mapper.toDetailDto(template);
    }

    @GetMapping("/disease/{diseaseCode}")
    @Transactional(readOnly = true)
    @Operation(summary = "Templates par maladie",
               description = "Retourne les templates actifs associés au code maladie donné.")
    @ApiResponse(responseCode = "200", description = "Liste retournée avec succès")
    public List<TemplateDto> getByDisease(@PathVariable String diseaseCode) {
        return templateRepo.findByDiseaseCodeAndIsActiveTrue(diseaseCode)
                .stream()
                .map(mapper::toDto)
                .toList();
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Écriture
    // ─────────────────────────────────────────────────────────────────────────

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @Transactional
    @Operation(summary = "Créer un template",
               description = "Crée un nouveau template de questionnaire. Le code doit être unique.")
    @ApiResponse(responseCode = "201", description = "Template créé avec succès")
    @ApiResponse(responseCode = "409", description = "Un template avec ce code existe déjà")
    public TemplateDetailDto create(@Valid @RequestBody QuestionnaireTemplate template) {
        if (templateRepo.existsByCode(template.getCode())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "Un template avec le code '" + template.getCode() + "' existe déjà");
        }
        QuestionnaireTemplate saved = templateRepo.save(template);
        log.info("Template créé : code={} id={}", saved.getCode(), saved.getId());
        return mapper.toDetailDto(saved);
    }

    @PutMapping("/{id}")
    @Transactional
    @Operation(summary = "Modifier un template",
               description = "Met à jour les métadonnées d'un template existant.")
    @ApiResponse(responseCode = "200", description = "Template mis à jour")
    @ApiResponse(responseCode = "404", description = "Template introuvable")
    public TemplateDetailDto update(@PathVariable UUID id,
                                    @Valid @RequestBody QuestionnaireTemplate incoming) {
        QuestionnaireTemplate existing = templateRepo.findById(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Template introuvable : " + id));

        existing.setNom(incoming.getNom());
        existing.setDescription(incoming.getDescription());
        existing.setVersion(incoming.getVersion());
        existing.setScope(incoming.getScope());
        existing.setFrequence(incoming.getFrequence());
        existing.setDureeEstimeeMinutes(incoming.getDureeEstimeeMinutes());
        existing.setLicenceInfo(incoming.getLicenceInfo());
        existing.setActive(incoming.isActive());

        QuestionnaireTemplate saved = templateRepo.save(existing);
        log.info("Template mis à jour : code={} id={}", saved.getCode(), saved.getId());
        return mapper.toDetailDto(saved);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @Transactional
    @Operation(summary = "Désactiver un template (soft delete)",
               description = "Passe isActive=false. Le template reste en base pour l'historique.")
    @ApiResponse(responseCode = "204", description = "Template désactivé")
    @ApiResponse(responseCode = "404", description = "Template introuvable")
    public void softDelete(@PathVariable UUID id) {
        QuestionnaireTemplate template = templateRepo.findById(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Template introuvable : " + id));
        template.setActive(false);
        templateRepo.save(template);
        log.info("Template désactivé (soft delete) : id={}", id);
    }
}
