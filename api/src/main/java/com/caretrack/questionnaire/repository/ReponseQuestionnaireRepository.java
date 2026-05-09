package com.caretrack.questionnaire.repository;

import com.caretrack.questionnaire.domain.ReponseQuestionnaire;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ReponseQuestionnaireRepository extends JpaRepository<ReponseQuestionnaire, UUID> {

    List<ReponseQuestionnaire> findByPatientId(UUID patientId);

    List<ReponseQuestionnaire> findByPatientIdAndTemplateCodeOrderByCompletedAtDesc(
        UUID patientId, String templateCode);

    Optional<ReponseQuestionnaire> findTop1ByPatientIdAndTemplateCodeOrderByCompletedAtDesc(
        UUID patientId, String templateCode);

    Page<ReponseQuestionnaire> findByPatientIdOrderByCompletedAtDesc(UUID patientId, Pageable pageable);

    // Analytics : évolution d'un patient sur une période pour un template donné
    List<ReponseQuestionnaire> findByPatientIdAndTemplateCodeAndCompletedAtBetweenOrderByCompletedAtAsc(
        UUID patientId, String templateCode, LocalDateTime from, LocalDateTime to);

    // Analytics : toutes réponses d'un patient sur une période (tous templates)
    List<ReponseQuestionnaire> findByPatient_IdAndCompletedAtBetweenOrderByCompletedAtAsc(
        UUID patientId, LocalDateTime from, LocalDateTime to);

    // Analytics : toutes réponses d'un template sur une période (tous patients)
    List<ReponseQuestionnaire> findByTemplate_CodeAndCompletedAtBetweenOrderByCompletedAtAsc(
        String templateCode, LocalDateTime from, LocalDateTime to);

    // Analytics : réponses d'une cohorte par maladie sur une période
    @Query("""
        SELECT r FROM ReponseQuestionnaire r
        JOIN r.patient p
        JOIN p.disease d
        WHERE d.code = :diseaseCode
        AND r.completedAt BETWEEN :from AND :to
        ORDER BY r.completedAt ASC
        """)
    List<ReponseQuestionnaire> findByDiseaseCodeAndPeriod(
        @Param("diseaseCode") String diseaseCode,
        @Param("from") LocalDateTime from,
        @Param("to") LocalDateTime to);

    // Analytics : comptage réponses d'une cohorte sur une période
    @Query("""
        SELECT COUNT(r) FROM ReponseQuestionnaire r
        JOIN r.patient p
        JOIN p.disease d
        WHERE d.code = :diseaseCode
        AND r.completedAt BETWEEN :from AND :to
        """)
    long countByDiseaseCodeAndPeriod(
        @Param("diseaseCode") String diseaseCode,
        @Param("from") LocalDateTime from,
        @Param("to") LocalDateTime to);
}
