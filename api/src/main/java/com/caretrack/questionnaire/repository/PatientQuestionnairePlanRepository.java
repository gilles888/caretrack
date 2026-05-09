package com.caretrack.questionnaire.repository;

import com.caretrack.questionnaire.domain.PatientQuestionnairePlan;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface PatientQuestionnairePlanRepository extends JpaRepository<PatientQuestionnairePlan, UUID> {

    List<PatientQuestionnairePlan> findByPatientIdAndIsActiveTrue(UUID patientId);

    List<PatientQuestionnairePlan> findByNextDueDateBeforeAndIsActiveTrue(LocalDate date);

    List<PatientQuestionnairePlan> findByNextDueDateLessThanEqualAndIsActiveTrue(LocalDate date);

    Optional<PatientQuestionnairePlan> findByPatientIdAndTemplateId(UUID patientId, UUID templateId);

    List<PatientQuestionnairePlan> findByPatientIdAndNextDueDateLessThanEqualAndIsActiveTrue(
        UUID patientId, LocalDate date);

    @Query("SELECT p FROM PatientQuestionnairePlan p WHERE p.patient.id = :patientId AND p.template.code = :templateCode")
    Optional<PatientQuestionnairePlan> findByPatientIdAndTemplateCode(
        @Param("patientId") UUID patientId,
        @Param("templateCode") String templateCode);
}
