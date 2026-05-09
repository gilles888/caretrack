package com.caretrack.questionnaire.repository;

import com.caretrack.questionnaire.domain.QuestionnaireTemplate;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface QuestionnaireTemplateRepository extends JpaRepository<QuestionnaireTemplate, UUID> {

    Optional<QuestionnaireTemplate> findByCode(String code);

    boolean existsByCode(String code);

    List<QuestionnaireTemplate> findByIsActiveTrue();

    @Query("SELECT t FROM QuestionnaireTemplate t JOIN t.diseases d WHERE d.code = :diseaseCode AND t.isActive = true")
    List<QuestionnaireTemplate> findByDiseaseCodeAndIsActiveTrue(@Param("diseaseCode") String diseaseCode);
}
