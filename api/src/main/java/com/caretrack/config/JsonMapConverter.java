package com.caretrack.config;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

import java.io.IOException;
import java.util.Map;

/**
 * Convertit Map<String, Object> ↔ TEXT (JSON sérialisé).
 *
 * Phase 1 (H2)  : stocké en colonne TEXT
 * Phase 2 (PG)  : changer @Column(columnDefinition="TEXT") → "jsonb"
 *                 ce converter continuera de fonctionner sans modification
 */
@Converter
public class JsonMapConverter implements AttributeConverter<Map<String, Object>, String> {

    private static final ObjectMapper MAPPER = new ObjectMapper();

    @Override
    public String convertToDatabaseColumn(Map<String, Object> map) {
        if (map == null) return null;
        try {
            return MAPPER.writeValueAsString(map);
        } catch (JsonProcessingException e) {
            throw new IllegalArgumentException("Erreur sérialisation JSON", e);
        }
    }

    @Override
    @SuppressWarnings("unchecked")
    public Map<String, Object> convertToEntityAttribute(String json) {
        if (json == null) return null;
        try {
            return MAPPER.readValue(json, Map.class);
        } catch (IOException e) {
            throw new IllegalArgumentException("Erreur désérialisation JSON", e);
        }
    }
}
