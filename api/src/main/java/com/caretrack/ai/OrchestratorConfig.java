package com.caretrack.ai;

import com.anthropic.client.AnthropicClient;
import com.anthropic.client.okhttp.AnthropicOkHttpClient;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * Configuration Spring pour le client Anthropic.
 * Si la clé API est fournie via la variable d'environnement {@code ANTHROPIC_API_KEY},
 * elle est injectée directement ; sinon le client lit l'environnement lui-même.
 */
@Configuration
public class OrchestratorConfig {

    @Value("${anthropic.api-key:}")
    private String apiKey;

    @Bean
    public AnthropicClient anthropicClient() {
        if (apiKey != null && !apiKey.isBlank()) {
            return AnthropicOkHttpClient.builder().apiKey(apiKey).build();
        }
        return AnthropicOkHttpClient.fromEnv();
    }
}
