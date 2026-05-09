package com.caretrack.questionnaire.alert;

import com.caretrack.domain.Patient;
import com.caretrack.questionnaire.domain.AlerteQuestionnaire;
import com.caretrack.questionnaire.domain.QuestionnaireTemplate;
import com.caretrack.questionnaire.enums.AlerteNiveau;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.thymeleaf.TemplateEngine;
import org.thymeleaf.context.Context;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import java.time.LocalDateTime;
import java.util.Locale;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Service de notification par email pour les rappels de questionnaires et les alertes cliniques.
 *
 * <p>Stratégie d'envoi :
 * <ul>
 *   <li>Alerte CRITICAL : email immédiat au médecin.</li>
 *   <li>Alerte WARNING : agrégation — maximum 1 email par heure et par patient.</li>
 *   <li>Rappels : envoi asynchrone au patient.</li>
 * </ul>
 *
 * <p>Les envois sont tous asynchrones ({@code @Async}) pour ne pas bloquer le thread
 * de traitement principal.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class NotificationService {

    private final JavaMailSender mailSender;
    private final TemplateEngine templateEngine;

    @Value("${caretrack.notifications.email-enabled:true}")
    private boolean emailEnabled;

    @Value("${caretrack.notifications.digest-delay-minutes:60}")
    private int digestDelayMinutes;

    @Value("${caretrack.app-url:http://localhost:4200}")
    private String appUrl;

    @Value("${caretrack.notifications.from-address:noreply@caretrack.fr}")
    private String fromAddress;

    /** Suivi pour l'agrégation des WARNING : patientId → dernière date d'envoi. */
    private final Map<String, LocalDateTime> lastWarningEmailSent = new ConcurrentHashMap<>();

    /**
     * Envoie un rappel de questionnaire au patient par email.
     *
     * @param patient  le patient destinataire
     * @param template le questionnaire à compléter
     */
    @Async
    public void sendRappelQuestionnaire(Patient patient, QuestionnaireTemplate template) {
        if (!emailEnabled) {
            log.info("[NOTIF DÉSACTIVÉE] Rappel questionnaire : patient={} template={}",
                    patient.getId(), template.getCode());
            return;
        }
        if (patient.getEmail() == null || patient.getEmail().isBlank()) {
            log.warn("Pas d'email pour le patient {}, rappel non envoyé", patient.getId());
            return;
        }

        try {
            Context ctx = new Context(Locale.FRENCH);
            ctx.setVariable("patient", patient);
            ctx.setVariable("template", template);
            ctx.setVariable("appUrl", appUrl);

            String html = templateEngine.process("email/rappel-questionnaire", ctx);

            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            helper.setFrom(fromAddress);
            helper.setTo(patient.getEmail());
            helper.setSubject("Rappel : " + template.getNom() + " à compléter");
            helper.setText(html, true);
            mailSender.send(message);
            log.info("Rappel envoyé : patient={} template={}", patient.getId(), template.getCode());
        } catch (MessagingException e) {
            log.error("Erreur envoi rappel : patient={} template={}", patient.getId(), template.getCode(), e);
        }
    }

    /**
     * Notifie le médecin d'une alerte clinique par email.
     *
     * <p>Les alertes CRITICAL sont envoyées immédiatement.
     * Les alertes WARNING sont agrégées : un seul email est envoyé par patient
     * sur une fenêtre de {@code digestDelayMinutes} minutes.
     *
     * @param alerte l'alerte clinique à notifier
     */
    @Async
    public void sendAlerteMedecin(AlerteQuestionnaire alerte) {
        if (!emailEnabled) {
            log.info("[NOTIF DÉSACTIVÉE] Alerte {} : patient={}", alerte.getNiveau(),
                    alerte.getPatient().getId());
            return;
        }

        // Agrégation pour les WARNING : max 1 email par heure par patient
        if (alerte.getNiveau() == AlerteNiveau.WARNING) {
            String key = alerte.getPatient().getId().toString();
            LocalDateTime lastSent = lastWarningEmailSent.get(key);
            if (lastSent != null && lastSent.plusMinutes(digestDelayMinutes).isAfter(LocalDateTime.now())) {
                log.info("Digest WARNING déjà envoyé récemment pour patient={}, ignoré", key);
                return;
            }
            lastWarningEmailSent.put(key, LocalDateTime.now());
        }

        // TODO Phase 2 : récupérer l'email du médecin traitant depuis la DB
        // Phase 1 : log complet de l'alerte + envoi vers adresse de démo
        log.warn("[ALERTE MEDECIN] niveau={} patient={} item={} valeur={} message={}",
                alerte.getNiveau(),
                alerte.getPatient().getId(),
                alerte.getItemCode(),
                alerte.getValeurObservee(),
                alerte.getMessage());

        String medecinEmail = System.getProperty("caretrack.demo.medecin-email", "medecin@caretrack.fr");
        try {
            Context ctx = new Context(Locale.FRENCH);
            ctx.setVariable("alerte", alerte);
            ctx.setVariable("patient", alerte.getPatient());
            ctx.setVariable("appUrl", appUrl);
            ctx.setVariable("niveauLabel", alerte.getNiveau().name());
            ctx.setVariable("isCritical", alerte.getNiveau() == AlerteNiveau.CRITICAL);

            String html = templateEngine.process("email/alerte-medecin", ctx);

            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            helper.setFrom(fromAddress);
            helper.setTo(medecinEmail);
            helper.setSubject("[CARETRACK " + alerte.getNiveau() + "] Alerte patient "
                    + alerte.getPatient().getNom() + " " + alerte.getPatient().getPrenom());
            helper.setText(html, true);
            mailSender.send(message);
        } catch (MessagingException e) {
            log.error("Erreur envoi alerte médecin : alerteId={}", alerte.getId(), e);
        }
    }
}
