package com.caretrack.questionnaire.integration;

import com.caretrack.domain.Patient;
import com.caretrack.domain.PatientRepository;
import com.caretrack.questionnaire.repository.QuestionnaireTemplateRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.MethodOrderer;
import org.junit.jupiter.api.Order;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.TestMethodOrder;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.annotation.DirtiesContext;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Map;
import java.util.UUID;

import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * Tests d'intégration H2 pour les controllers questionnaire.
 * Le {@link com.caretrack.questionnaire.config.QuestionnaireDataInitializer} crée les templates au démarrage.
 */
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.MOCK)
@AutoConfigureMockMvc
@ActiveProfiles("test")
@TestMethodOrder(MethodOrderer.OrderAnnotation.class)
@DirtiesContext(classMode = DirtiesContext.ClassMode.AFTER_CLASS)
@DisplayName("Questionnaire Controller — Tests d'intégration H2")
class QuestionnaireControllerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private PatientRepository patientRepository;

    @Autowired
    private QuestionnaireTemplateRepository templateRepository;

    // ── Templates ────────────────────────────────────────────────────────────

    @Test
    @Order(1)
    @DisplayName("GET /api/v1/questionnaires → 200 avec liste non vide (templates initialisés)")
    void testGetTemplates_returnsNonEmptyList() throws Exception {
        mockMvc.perform(get("/api/v1/questionnaires")
                        .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$", hasSize(greaterThan(0))));
    }

    @Test
    @Order(2)
    @DisplayName("GET /api/v1/questionnaires/{id} avec UUID valide existant → 200")
    void testGetTemplateById_returnsTemplate() throws Exception {
        // Récupérer le premier template inséré par le DataInitializer
        UUID templateId = templateRepository.findByIsActiveTrue()
                .stream()
                .findFirst()
                .orElseThrow(() -> new IllegalStateException("Aucun template actif trouvé"))
                .getId();

        mockMvc.perform(get("/api/v1/questionnaires/{id}", templateId)
                        .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(templateId.toString()))
                .andExpect(jsonPath("$.code").isString());
    }

    @Test
    @Order(3)
    @DisplayName("GET /api/v1/questionnaires avec code PHQ9 via findByCode → template PHQ9 présent dans la liste")
    void testGetTemplates_containsPhq9() throws Exception {
        mockMvc.perform(get("/api/v1/questionnaires")
                        .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[?(@.code == 'PHQ9')]").exists());
    }

    @Test
    @Order(4)
    @DisplayName("GET /api/v1/questionnaires/{randomUUID} → 404")
    void testGetTemplateById_notFound() throws Exception {
        UUID randomId = UUID.randomUUID();

        mockMvc.perform(get("/api/v1/questionnaires/{id}", randomId)
                        .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isNotFound());
    }

    // ── Soumission de réponse ─────────────────────────────────────────────────

    @Test
    @Order(5)
    @DisplayName("POST /api/v1/patients/{patientId}/reponses → 201 avec body PHQ9 valide")
    void testSubmitReponse_returns201() throws Exception {
        // Créer un patient en base via le repository
        Patient patient = Patient.builder()
                .nom("Test")
                .prenom("Integration")
                .email("test.integration." + UUID.randomUUID() + "@caretrack.fr")
                .actif(true)
                .build();
        Patient savedPatient = patientRepository.save(patient);

        Map<String, Object> body = Map.of(
                "templateCode", "PHQ9",
                "answers", Map.of(
                        "1", 2,
                        "2", 1,
                        "3", 0,
                        "4", 1,
                        "5", 0,
                        "6", 1,
                        "7", 0,
                        "8", 1,
                        "9", 0
                ),
                "dureeSecondes", 120
        );

        mockMvc.perform(post("/api/v1/patients/{patientId}/reponses", savedPatient.getId())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(body)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.reponseId").isString())
                .andExpect(jsonPath("$.scores").exists())
                .andExpect(jsonPath("$.scoreGlobal").isNumber());
    }

    @Test
    @Order(6)
    @DisplayName("POST /api/v1/patients/{randomUUID}/reponses → 404 patient introuvable")
    void testSubmitReponse_patientNotFound() throws Exception {
        UUID unknownPatientId = UUID.randomUUID();

        Map<String, Object> body = Map.of(
                "templateCode", "PHQ9",
                "answers", Map.of("1", 1),
                "dureeSecondes", 60
        );

        mockMvc.perform(post("/api/v1/patients/{patientId}/reponses", unknownPatientId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(body)))
                .andExpect(status().isNotFound());
    }

    // ── Analytics ─────────────────────────────────────────────────────────────

    @Test
    @Order(7)
    @DisplayName("GET /api/v1/analytics/completion-rate?from=...&to=... → 200 avec array")
    void testGetAnalyticsCompletionRate_returns200() throws Exception {
        mockMvc.perform(get("/api/v1/analytics/completion-rate")
                        .param("from", "2025-01-01")
                        .param("to", "2025-12-31")
                        .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray());
    }

    @Test
    @Order(8)
    @DisplayName("GET /api/v1/analytics/alertes-trend?from=...&to=... → 200 avec array")
    void testAlertesTrend_returns200() throws Exception {
        mockMvc.perform(get("/api/v1/analytics/alertes-trend")
                        .param("from", "2025-01-01")
                        .param("to", "2025-12-31")
                        .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray());
    }
}
