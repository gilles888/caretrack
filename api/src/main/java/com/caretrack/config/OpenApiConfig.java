package com.caretrack.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI caretrackOpenAPI() {
        return new OpenAPI()
            .info(new Info()
                .title("CareTrack API")
                .description("Application médicale de suivi de patients chroniques")
                .version("v1.0.0")
            );
    }
}
