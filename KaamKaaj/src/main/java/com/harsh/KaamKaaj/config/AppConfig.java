package com.harsh.KaamKaaj.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.EnableScheduling;

// -------------------------------------------------------
// @EnableScheduling activates Spring's task scheduling
// infrastructure. Without this, @Scheduled annotations
// are silently ignored — exactly like @EnableMethodSecurity
// is needed for @PreAuthorize to work.
//
// We put it in a separate config class rather than on
// KaamKaajApplication to keep the main class clean and
// follow the single responsibility principle.
// -------------------------------------------------------
@Configuration
@EnableScheduling
public class AppConfig {
    // No beans needed here — the annotation does the work
}