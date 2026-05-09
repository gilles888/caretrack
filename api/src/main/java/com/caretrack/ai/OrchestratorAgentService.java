package com.caretrack.ai;

import com.anthropic.client.AnthropicClient;
import com.anthropic.core.JsonValue;
import com.anthropic.models.messages.*;
import com.caretrack.ai.dto.OrchestratorRequest;
import com.caretrack.ai.dto.OrchestratorResponse;
import com.caretrack.domain.PatientRepository;
import com.caretrack.questionnaire.repository.AlerteQuestionnaireRepository;
import com.caretrack.questionnaire.repository.ReponseQuestionnaireRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.UUID;

/**
 * Agent orchestrateur IA utilisant le SDK Anthropic Java avec tool use.
 *
 * <p>Le service exécute une boucle agentique (max 5 tours) dans laquelle le modèle
 * peut appeler des outils pour récupérer les données du patient depuis les repositories
 * JPA existants, puis retourne une analyse clinique structurée.</p>
 */
@Service
public class OrchestratorAgentService {

    private static final Logger log = LoggerFactory.getLogger(OrchestratorAgentService.class);

    private static final String MODEL = "claude-opus-4-5";
    private static final String SYSTEM_PROMPT = """
            Tu es un assistant clinique pour CareTrack, une application de suivi médical.
            Tu as accès à des outils pour récupérer les données des patients, leurs réponses
            aux questionnaires et leurs alertes. Utilise ces outils pour répondre aux questions
            cliniques de manière précise et structurée.
            Réponds toujours en JSON avec les champs: analysis, recommendation, alertGenerated.
            """;

    private final AnthropicClient client;
    private final PatientRepository patientRepository;
    private final ReponseQuestionnaireRepository reponseRepository;
    private final AlerteQuestionnaireRepository alerteRepository;

    public OrchestratorAgentService(
            AnthropicClient client,
            PatientRepository patientRepository,
            ReponseQuestionnaireRepository reponseRepository,
            AlerteQuestionnaireRepository alerteRepository) {
        this.client = client;
        this.patientRepository = patientRepository;
        this.reponseRepository = reponseRepository;
        this.alerteRepository = alerteRepository;
    }

    /**
     * Orchestrate une analyse clinique pour un patient donné.
     *
     * @param request la requête contenant l'identifiant patient et la question clinique
     * @return une réponse structurée avec analyse, recommandation et indicateur d'alerte
     */
    public OrchestratorResponse orchestrate(OrchestratorRequest request) {
        List<Tool> tools = buildTools();
        List<MessageParam> messages = new ArrayList<>();
        messages.add(MessageParam.builder()
                .role(MessageParam.Role.USER)
                .content(buildUserPrompt(request))
                .build());

        // Boucle agentique — maximum 5 tours pour éviter les boucles infinies
        for (int i = 0; i < 5; i++) {
            log.debug("Orchestrator tour {}, patientId={}", i + 1, request.patientId());

            MessageCreateParams.Builder paramsBuilder = MessageCreateParams.builder()
                    .model(MODEL)
                    .maxTokens(2048L)
                    .system(SYSTEM_PROMPT)
                    .messages(messages);

            for (Tool tool : tools) {
                paramsBuilder.addTool(tool);
            }

            Message response = client.messages().create(paramsBuilder.build());
            messages.add(response.toParam());

            if (response.stopReason()
                    .map(sr -> StopReason.END_TURN.equals(sr))
                    .orElse(false)) {
                log.debug("Orchestrator terminé après {} tour(s)", i + 1);
                return parseResponse(response);
            }

            // Traiter les appels d'outils
            List<ContentBlockParam> toolResults = new ArrayList<>();
            for (ContentBlock block : response.content()) {
                if (block.isToolUse()) {
                    ToolUseBlock toolUse = block.asToolUse();
                    log.debug("Appel outil: {}, id={}", toolUse.name(), toolUse.id());
                    String result = executeTool(toolUse.name(), toolUse._input(), request.patientId());
                    toolResults.add(ContentBlockParam.ofToolResult(
                            ToolResultBlockParam.builder()
                                    .toolUseId(toolUse.id())
                                    .content(result)
                                    .build()));
                }
            }

            if (!toolResults.isEmpty()) {
                messages.add(MessageParam.builder()
                        .role(MessageParam.Role.USER)
                        .contentOfBlockParams(toolResults)
                        .build());
            }
        }

        log.warn("Orchestrator: nombre maximum de tours atteint pour patientId={}", request.patientId());
        return new OrchestratorResponse("Analyse non disponible", "Consulter un médecin", false);
    }

    /**
     * Exécute un outil nommé avec l'input JSON fourni par le modèle.
     *
     * @param name      nom de l'outil
     * @param input     valeur JSON de l'input (JsonValue brut depuis le SDK)
     * @param patientId identifiant du patient par défaut
     * @return résultat textuel de l'outil
     */
    @SuppressWarnings("unchecked")
    private String executeTool(String name, JsonValue input, UUID patientId) {
        return switch (name) {
            case "get_patient_info" -> {
                UUID pid = patientId;
                try {
                    Map<String, Object> inputMap = input.convert(Map.class);
                    Object pidValue = inputMap.get("patient_id");
                    if (pidValue instanceof String s) {
                        pid = UUID.fromString(s);
                    }
                } catch (Exception e) {
                    log.debug("Impossible de lire patient_id depuis l'input, utilisation du patientId par défaut");
                }
                UUID finalPid = pid;
                yield patientRepository.findById(finalPid)
                        .map(p -> "Patient: %s %s, Maladie: %s, Actif: %s".formatted(
                                p.getPrenom(),
                                p.getNom(),
                                p.getDisease() != null ? p.getDisease().getNom() : "N/A",
                                p.isActif()))
                        .orElse("Patient introuvable pour l'id: " + finalPid);
            }
            case "get_recent_responses" -> {
                var responses = reponseRepository.findByPatientId(patientId);
                if (responses.isEmpty()) {
                    yield "Aucune réponse aux questionnaires";
                }
                yield "Nombre de réponses aux questionnaires: %d".formatted(responses.size());
            }
            case "get_active_alerts" -> {
                var alerts = alerteRepository.findByPatientId(patientId);
                if (alerts.isEmpty()) {
                    yield "Aucune alerte active";
                }
                long critiques = alerts.stream()
                        .filter(a -> !a.isAcknowledged())
                        .count();
                yield "Total alertes: %d, dont non acquittées: %d".formatted(alerts.size(), critiques);
            }
            default -> {
                log.warn("Outil inconnu demandé: {}", name);
                yield "Outil inconnu: " + name;
            }
        };
    }

    private OrchestratorResponse parseResponse(Message response) {
        String text = response.content().stream()
                .filter(ContentBlock::isText)
                .map(b -> b.asText().text())
                .findFirst()
                .orElse("{}");

        log.debug("Réponse brute du modèle: {}", text);

        boolean hasAlert = text.toLowerCase().contains("\"alertgenerated\":true")
                || text.toLowerCase().contains("\"alertgenerated\": true");
        String analysis = extractJsonField(text, "analysis");
        String recommendation = extractJsonField(text, "recommendation");
        return new OrchestratorResponse(analysis, recommendation, hasAlert);
    }

    /**
     * Extraction naïve d'un champ JSON de type string depuis un texte brut.
     * En production, utiliser {@code ObjectMapper} pour un parsing robuste.
     */
    private String extractJsonField(String json, String field) {
        String key = "\"" + field + "\":\"";
        int start = json.indexOf(key);
        if (start < 0) {
            key = "\"" + field + "\": \"";
            start = json.indexOf(key);
        }
        if (start < 0) return "N/A";
        start += key.length();
        int end = json.indexOf("\"", start);
        return end > start ? json.substring(start, end) : "N/A";
    }

    private String buildUserPrompt(OrchestratorRequest request) {
        return "Patient ID: %s. Question clinique: %s".formatted(
                request.patientId().toString(), request.question());
    }

    private List<Tool> buildTools() {
        return List.of(
                Tool.builder()
                        .name("get_patient_info")
                        .description("Récupère les informations du patient (prénom, nom, maladie, statut actif)")
                        .inputSchema(Tool.InputSchema.builder()
                                .putAdditionalProperty("patient_id", JsonValue.from(
                                        Map.of("type", "string",
                                               "description", "UUID du patient (optionnel, utilise le patient courant par défaut)")))
                                .build())
                        .build(),
                Tool.builder()
                        .name("get_recent_responses")
                        .description("Récupère le nombre de réponses aux questionnaires du patient")
                        .inputSchema(Tool.InputSchema.builder().build())
                        .build(),
                Tool.builder()
                        .name("get_active_alerts")
                        .description("Récupère les alertes du patient avec le compte des alertes non acquittées")
                        .inputSchema(Tool.InputSchema.builder().build())
                        .build()
        );
    }
}
