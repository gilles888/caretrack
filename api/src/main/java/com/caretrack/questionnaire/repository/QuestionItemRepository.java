package com.caretrack.questionnaire.repository;

import com.caretrack.questionnaire.domain.QuestionItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface QuestionItemRepository extends JpaRepository<QuestionItem, UUID> {

    List<QuestionItem> findByTemplateIdOrderByOrdreAsc(UUID templateId);
}
