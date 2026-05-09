package com.caretrack.questionnaire.service;

import com.caretrack.domain.Patient;
import com.caretrack.questionnaire.alert.event.AlerteCritiqueEvent;
import com.caretrack.questionnaire.api.service.AlerteService;
import com.caretrack.questionnaire.domain.AlerteQuestionnaire;
import com.caretrack.questionnaire.domain.QuestionItem;
import com.caretrack.questionnaire.domain.QuestionnaireTemplate;
import com.caretrack.questionnaire.domain.ReponseQuestionnaire;
import com.caretrack.questionnaire.enums.AlerteNiveau;
import com.caretrack.questionnaire.enums.FrequenceType;
import com.caretrack.questionnaire.enums.QuestionType;
import com.caretrack.questionnaire.enums.ScopeType;
import com.caretrack.questionnaire.repository.AlerteQuestionnaireRepository;
import com.caretrack.questionnaire.repository.ReponseQuestionnaireRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

/**
 * Tests unitaires Mockito pour {@link AlerteService}.
 */
@ExtendWith(MockitoExtension.class)
@DisplayName("AlerteService")
class AlerteServiceTest {

    @Mock
    private AlerteQuestionnaireRepository alerteRepo;

    @Mock
    private ReponseQuestionnaireRepository reponseRepo;

    @Mock
    private ApplicationEventPublisher publisher;

    @InjectMocks
    private AlerteService alerteService;

    // ── Helpers ──────────────────────────────────────────────────────────────

    private Patient buildPatient() {
        Patient patient = new Patient();
        patient.setId(UUID.randomUUID());
        patient.setNom("Dupont");
        patient.setPrenom("Marie");
        patient.setActif(true);
        return patient;
    }

    private ReponseQuestionnaire buildReponse(Patient patient) {
        ReponseQuestionnaire reponse = ReponseQuestionnaire.builder()
                .patient(patient)
                .completedAt(LocalDateTime.now())
                .build();
        // Simuler un ID persisté
        try {
            java.lang.reflect.Field field = ReponseQuestionnaire.class.getDeclaredField("id");
            field.setAccessible(true);
            field.set(reponse, UUID.randomUUID());
        } catch (Exception e) {
            throw new RuntimeException("Impossible d'injecter l'ID de ReponseQuestionnaire", e);
        }
        return reponse;
    }

    private QuestionnaireTemplate buildTemplate(String code) {
        return QuestionnaireTemplate.builder()
                .code(code)
                .nom("Template " + code)
                .scope(ScopeType.CORE)
                .frequence(FrequenceType.HEBDO)
                .build();
    }

    private QuestionItem buildItem(int ordre, QuestionType type, String domaineCode,
                                   Double seuilMin, AlerteNiveau niveau) {
        return QuestionItem.builder()
                .texte("Item " + ordre)
                .type(type)
                .ordre(ordre)
                .domaineCode(domaineCode)
                .seuilAlerteMin(seuilMin)
                .alerteNiveau(niveau)
                .build();
    }

    /**
     * Stub générique : alerteRepo.save(alerte) retourne l'alerte telle quelle
     * après avoir injecté un ID et un createdAt (simule @PrePersist).
     */
    private void stubAlerteSave() {
        when(alerteRepo.save(any(AlerteQuestionnaire.class))).thenAnswer(inv -> {
            AlerteQuestionnaire a = inv.getArgument(0);
            // Simuler le @PrePersist
            try {
                java.lang.reflect.Field idField = AlerteQuestionnaire.class.getDeclaredField("id");
                idField.setAccessible(true);
                if (idField.get(a) == null) {
                    idField.set(a, UUID.randomUUID());
                }
                java.lang.reflect.Field createdField = AlerteQuestionnaire.class.getDeclaredField("createdAt");
                createdField.setAccessible(true);
                if (createdField.get(a) == null) {
                    createdField.set(a, LocalDateTime.now());
                }
            } catch (Exception e) {
                throw new RuntimeException(e);
            }
            return a;
        });
    }

    // ── Tests évaluation par item ─────────────────────────────────────────────

    @Nested
    @DisplayName("Règle PHQ-9 item 9 — idéations suicidaires")
    class Phq9Item9 {

        @Test
        @DisplayName("PHQ9 item 9 avec valeur=1 → alerte CRITICAL systématique")
        void testPhq9Item9AlwaysCritical() {
            stubAlerteSave();
            // checkKccq12Delta et checkMsis29Baseline ne s'appliquent pas à PHQ9 — pas de stub nécessaire

            Patient patient = buildPatient();
            ReponseQuestionnaire reponse = buildReponse(patient);

            QuestionnaireTemplate template = buildTemplate("PHQ9");
            // Item 9 sans seuil configuré — la règle spéciale s'applique sur ordre==9
            QuestionItem item9 = QuestionItem.builder()
                    .texte("Pensées que vous seriez mieux mort(e) ?")
                    .type(QuestionType.LIKERT_4)
                    .ordre(9)
                    .domaineCode("PHQ9")
                    .build();
            template.getItems().add(item9);

            Map<String, Object> answers = Map.of("9", 1);

            List<AlerteQuestionnaire> alertes = alerteService.evaluate(reponse, template, answers);

            assertThat(alertes).hasSize(1);
            assertThat(alertes.get(0).getNiveau()).isEqualTo(AlerteNiveau.CRITICAL);
        }

        @Test
        @DisplayName("PHQ9 item 9 avec valeur=0 → aucune alerte")
        void testPhq9Item9ValueZeroNoAlerte() {
            // checkKccq12Delta et checkMsis29Baseline ne s'appliquent pas à PHQ9

            Patient patient = buildPatient();
            ReponseQuestionnaire reponse = buildReponse(patient);

            QuestionnaireTemplate template = buildTemplate("PHQ9");
            QuestionItem item9 = QuestionItem.builder()
                    .texte("Item 9")
                    .type(QuestionType.LIKERT_4)
                    .ordre(9)
                    .domaineCode("PHQ9")
                    .build();
            template.getItems().add(item9);

            Map<String, Object> answers = Map.of("9", 0);

            List<AlerteQuestionnaire> alertes = alerteService.evaluate(reponse, template, answers);

            assertThat(alertes).isEmpty();
            verify(alerteRepo, never()).save(any());
        }
    }

    @Nested
    @DisplayName("Seuils d'alerte standard")
    class SeuilsAlerte {

        @Test
        @DisplayName("item seuilAlerteMin=7, alerteNiveau=WARNING, valeur=7 → alerte WARNING")
        void testSeuilAlerteWarning() {
            stubAlerteSave();

            Patient patient = buildPatient();
            ReponseQuestionnaire reponse = buildReponse(patient);

            QuestionnaireTemplate template = buildTemplate("GAD7");
            QuestionItem item = buildItem(1, QuestionType.LIKERT_4, "GAD7", 7.0, AlerteNiveau.WARNING);
            template.getItems().add(item);

            Map<String, Object> answers = Map.of("1", 7);

            List<AlerteQuestionnaire> alertes = alerteService.evaluate(reponse, template, answers);

            assertThat(alertes).hasSize(1);
            assertThat(alertes.get(0).getNiveau()).isEqualTo(AlerteNiveau.WARNING);
            assertThat(alertes.get(0).getValeurObservee()).isEqualTo(7.0);
        }

        @Test
        @DisplayName("item seuilAlerteMin=7, alerteNiveau=CRITICAL, valeur=8 → alerte CRITICAL")
        void testSeuilAlerteCritical() {
            stubAlerteSave();

            Patient patient = buildPatient();
            ReponseQuestionnaire reponse = buildReponse(patient);

            QuestionnaireTemplate template = buildTemplate("HBI");
            QuestionItem item = buildItem(1, QuestionType.LIKERT_4, "HBI", 7.0, AlerteNiveau.CRITICAL);
            template.getItems().add(item);

            Map<String, Object> answers = Map.of("1", 8);

            List<AlerteQuestionnaire> alertes = alerteService.evaluate(reponse, template, answers);

            assertThat(alertes).hasSize(1);
            assertThat(alertes.get(0).getNiveau()).isEqualTo(AlerteNiveau.CRITICAL);
        }

        @Test
        @DisplayName("item seuilAlerteMin=7, valeur=5 → aucune alerte")
        void testNoAlerte_WhenValueBelowThreshold() {
            Patient patient = buildPatient();
            ReponseQuestionnaire reponse = buildReponse(patient);

            QuestionnaireTemplate template = buildTemplate("GAD7");
            QuestionItem item = buildItem(1, QuestionType.LIKERT_4, "GAD7", 7.0, AlerteNiveau.WARNING);
            template.getItems().add(item);

            Map<String, Object> answers = Map.of("1", 5);

            List<AlerteQuestionnaire> alertes = alerteService.evaluate(reponse, template, answers);

            assertThat(alertes).isEmpty();
            verify(alerteRepo, never()).save(any());
        }

        @Test
        @DisplayName("answers vide → aucune alerte générée")
        void testNoAlerte_WhenAnswerMissing() {
            Patient patient = buildPatient();
            ReponseQuestionnaire reponse = buildReponse(patient);

            QuestionnaireTemplate template = buildTemplate("GAD7");
            QuestionItem item = buildItem(1, QuestionType.LIKERT_4, "GAD7", 7.0, AlerteNiveau.WARNING);
            template.getItems().add(item);

            List<AlerteQuestionnaire> alertes = alerteService.evaluate(reponse, template, Map.of());

            assertThat(alertes).isEmpty();
            verify(alerteRepo, never()).save(any());
        }
    }

    @Nested
    @DisplayName("Publication d'événements")
    class Events {

        @Test
        @DisplayName("alerte CRITICAL → publisher.publishEvent(AlerteCritiqueEvent) appelé")
        void testPublishesAlerteCritiqueEvent() {
            stubAlerteSave();

            Patient patient = buildPatient();
            ReponseQuestionnaire reponse = buildReponse(patient);

            QuestionnaireTemplate template = buildTemplate("PHQ9");
            QuestionItem item9 = QuestionItem.builder()
                    .texte("Item 9 suicidal")
                    .type(QuestionType.LIKERT_4)
                    .ordre(9)
                    .domaineCode("PHQ9")
                    .build();
            template.getItems().add(item9);

            // PHQ9 ne passe pas par checkKccq12Delta ni checkMsis29Baseline

            Map<String, Object> answers = Map.of("9", 2);

            alerteService.evaluate(reponse, template, answers);

            // Vérifier qu'au moins un événement AlerteCritiqueEvent a été publié
            verify(publisher).publishEvent(any(AlerteCritiqueEvent.class));
        }

        @Test
        @DisplayName("aucune alerte → publisher.publishEvent() non appelé")
        void testNoEventWhenNoAlerte() {
            Patient patient = buildPatient();
            ReponseQuestionnaire reponse = buildReponse(patient);

            QuestionnaireTemplate template = buildTemplate("GAD7");
            QuestionItem item = buildItem(1, QuestionType.LIKERT_4, "GAD7", 10.0, AlerteNiveau.WARNING);
            template.getItems().add(item);

            Map<String, Object> answers = Map.of("1", 3);

            alerteService.evaluate(reponse, template, answers);

            verify(publisher, never()).publishEvent(any());
        }
    }

    @Nested
    @DisplayName("acknowledgeAlerte")
    class AcknowledgeAlerte {

        @Test
        @DisplayName("alerte trouvée → acknowledged=true, acknowledgedBy et acknowledgedAt mis à jour")
        void testAcknowledgeAlerte() {
            UUID alerteId = UUID.randomUUID();
            UUID medecinId = UUID.randomUUID();

            AlerteQuestionnaire alerte = AlerteQuestionnaire.builder()
                    .niveau(AlerteNiveau.WARNING)
                    .itemCode("TEST_ITEM")
                    .valeurObservee(8.0)
                    .seuilDeclenche(7.0)
                    .message("Test alerte")
                    .isAcknowledged(false)
                    .build();

            when(alerteRepo.findById(alerteId)).thenReturn(Optional.of(alerte));
            when(alerteRepo.save(any(AlerteQuestionnaire.class))).thenAnswer(inv -> inv.getArgument(0));

            AlerteQuestionnaire result = alerteService.acknowledgeAlerte(alerteId, medecinId);

            assertThat(result.isAcknowledged()).isTrue();
            assertThat(result.getAcknowledgedBy()).isEqualTo(medecinId);
            assertThat(result.getAcknowledgedAt()).isNotNull();
            verify(alerteRepo).save(alerte);
        }

        @Test
        @DisplayName("alerte introuvable → ResponseStatusException 404")
        void testAcknowledgeAlerte_NotFound() {
            UUID alerteId = UUID.randomUUID();
            UUID medecinId = UUID.randomUUID();

            when(alerteRepo.findById(alerteId)).thenReturn(Optional.empty());

            assertThatThrownBy(() -> alerteService.acknowledgeAlerte(alerteId, medecinId))
                    .isInstanceOf(ResponseStatusException.class)
                    .satisfies(ex -> {
                        ResponseStatusException rse = (ResponseStatusException) ex;
                        assertThat(rse.getStatusCode()).isEqualTo(HttpStatus.NOT_FOUND);
                    });
        }
    }
}
