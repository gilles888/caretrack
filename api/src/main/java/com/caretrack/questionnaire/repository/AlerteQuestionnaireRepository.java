package com.caretrack.questionnaire.repository;

import com.caretrack.questionnaire.domain.AlerteQuestionnaire;
import com.caretrack.questionnaire.enums.AlerteNiveau;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Repository
public interface AlerteQuestionnaireRepository extends JpaRepository<AlerteQuestionnaire, UUID> {

    List<AlerteQuestionnaire> findByPatientId(UUID patientId);

    List<AlerteQuestionnaire> findByPatientIdAndIsAcknowledgedFalseOrderByCreatedAtDesc(UUID patientId);

    List<AlerteQuestionnaire> findByReponseId(UUID reponseId);

    List<AlerteQuestionnaire> findByPatientIdAndNiveauAndIsAcknowledgedFalse(UUID patientId, AlerteNiveau niveau);

    List<AlerteQuestionnaire> findByIsAcknowledgedFalseOrderByCreatedAtDesc();

    List<AlerteQuestionnaire> findByNiveauAndIsAcknowledgedFalse(AlerteNiveau niveau);

    // Analytics : alertes sur une période
    List<AlerteQuestionnaire> findByCreatedAtBetweenOrderByCreatedAtAsc(
        LocalDateTime from, LocalDateTime to);

    // Analytics : alertes d'un patient sur une période
    List<AlerteQuestionnaire> findByPatientIdAndCreatedAtBetweenOrderByCreatedAtAsc(
        UUID patientId, LocalDateTime from, LocalDateTime to);

    // Analytics batch : alertes pour une liste de reponseIds (évite le N+1 dans getCohorteData)
    List<AlerteQuestionnaire> findByReponseIdIn(List<UUID> reponseIds);
}
