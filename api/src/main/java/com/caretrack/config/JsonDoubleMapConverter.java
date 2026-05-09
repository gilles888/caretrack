package com.caretrack.config;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

import java.io.IOException;
import java.util.Map;

/**
 * Convertit Map<String, Double> ↔ TEXT JSON.
 * Utilisé pour les scores de domaine dans ReponseQuestionnaire.
 */
@Converter
public class JsonDoubleMapConverter implements AttributeConverter<Map<String, Double>, String> {

    private static final ObjectMapper MAPPER = new ObjectMapper();
    private static final TypeReference<Map<String, Double>> TYPE = new TypeReference<>() {};

    @Override
    public String convertToDatabaseColumn(Map<String, Double> map) {
        if (map == null) return null;
        try {
            return MAPPER.writeValueAsString(map);
        } catch (JsonProcessingException e) {
            throw new IllegalArgumentException("Erreur sérialisation JSON scores", e);
        }
    }

    @Override
    public Map<String, Double> convertToEntityAttribute(String json) {
        if (json == null) return null;
        try {
            return MAPPER.readValue(json, TYPE);
        } catch (IOException e) {
            throw new IllegalArgumentException("Erreur désérialisation JSON scores", e);
        }
    }
}
