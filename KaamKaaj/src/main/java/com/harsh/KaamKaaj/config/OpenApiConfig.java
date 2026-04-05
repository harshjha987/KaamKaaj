package com.harsh.KaamKaaj.config;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {

    // -------------------------------------------------------
    // This bean configures three things:
    //
    // 1. API metadata (title, version, description, contact)
    //    — shown at the top of Swagger UI
    //
    // 2. Security scheme definition
    //    — tells Swagger "this API uses Bearer JWT tokens
    //      in the Authorization header"
    //    — this is what adds the green "Authorize" button
    //      to the Swagger UI top right corner
    //
    // 3. Global security requirement
    //    — applies the Bearer scheme to ALL endpoints by default
    //    — individual public endpoints (register, login) will
    //      override this with @SecurityRequirements({}) to mark
    //      themselves as requiring no auth
    //
    // The string "bearerAuth" is just a name we give to this
    // scheme — it's referenced by that name in @SecurityRequirement
    // annotations on controllers. You can name it anything but
    // "bearerAuth" is the conventional name.
    // -------------------------------------------------------
    @Bean
    public OpenAPI openAPI() {

        // Define the security scheme
        SecurityScheme bearerScheme = new SecurityScheme()
                .type(SecurityScheme.Type.HTTP)   // HTTP auth (not API key, not OAuth)
                .scheme("bearer")                 // "bearer" tells Swagger the prefix
                .bearerFormat("JWT")              // informational — shown in the UI
                .name("bearerAuth");

        // Define a global security requirement that references
        // the scheme by name. This makes every endpoint in
        // the UI show the lock icon and require auth by default.
        SecurityRequirement globalSecurityRequirement =
                new SecurityRequirement().addList("bearerAuth");

        return new OpenAPI()
                .info(new Info()
                        .title("KaamKaaj API")
                        .version("1.0.0")
                        .description("""
                                Task Management Platform API.

                                Use the Authorize button (top right) to enter your JWT token.
                                Format: just paste the token — Swagger adds "Bearer " automatically.

                                Get a token from POST /api/v1/auth/login first.
                                """)
                        .contact(new Contact()
                                .name("Harsh")
                                .email("your-email@example.com"))
                )
                // Register the scheme definition
                .components(new Components()
                        .addSecuritySchemes("bearerAuth", bearerScheme))
                // Apply it globally to all endpoints
                .addSecurityItem(globalSecurityRequirement);
    }
}