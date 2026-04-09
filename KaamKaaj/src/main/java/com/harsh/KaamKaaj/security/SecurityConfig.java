package com.harsh.KaamKaaj.security;

import com.harsh.KaamKaaj.security.jwt.JwtFilter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {

    private final UserDetailsService userDetailsService;
    private final JwtFilter jwtFilter;
    private final AuthEntryPoint authEntryPoint;
    private final AppAccessDeniedHandler accessDeniedHandler;

    public SecurityConfig(
            UserDetailsService userDetailsService,
            JwtFilter jwtFilter,
            AuthEntryPoint authEntryPoint,
            AppAccessDeniedHandler accessDeniedHandler
    ) {
        this.userDetailsService = userDetailsService;
        this.jwtFilter = jwtFilter;
        this.authEntryPoint = authEntryPoint;
        this.accessDeniedHandler = accessDeniedHandler;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        return http
                .csrf(csrf -> csrf.disable())
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers(
                                "/api/v1/auth/register",
                                "/api/v1/auth/login"
                        ).permitAll()
                        .requestMatchers(
                                "/swagger-ui/**",
                                "/swagger-ui.html",
                                "/v3/api-docs/**"
                        ).permitAll()
                        .requestMatchers(HttpMethod.POST, "/api/v1/workspaces").authenticated()
                        .anyRequest().authenticated()
                )
                .sessionManagement(session ->
                        session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .formLogin(form -> form.disable())
                // -------------------------------------------------------
                // Wire the two exception handlers into Spring Security.
                //
                // exceptionHandling() configures what happens when
                // Spring Security itself throws an exception —
                // NOT exceptions from your controllers/services.
                //
                // authenticationEntryPoint → called when authentication
                //   is missing or invalid (no token, expired token)
                //
                // accessDeniedHandler → called when authentication is
                //   valid but authorization fails (@PreAuthorize = false,
                //   or URL-level role check fails)
                //
                // Without this wiring, Spring uses its own default
                // handlers which return HTML or plain-text responses.
                // -------------------------------------------------------
                .exceptionHandling(ex -> ex
                        .authenticationEntryPoint(authEntryPoint)
                        .accessDeniedHandler(accessDeniedHandler)
                )
                .addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class)
                .build();
    }

    @Bean
    public BCryptPasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder(12);
    }

    @Bean
    public AuthenticationProvider authenticationProvider() {
        DaoAuthenticationProvider provider = new DaoAuthenticationProvider(userDetailsService);
        provider.setPasswordEncoder(passwordEncoder());
        return provider;
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config)
            throws Exception {
        return config.getAuthenticationManager();
    }
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowedOrigins(List.of(
                "http://localhost:5173",
                "http://localhost:3000"
        ));
        config.setAllowedMethods(List.of("GET","POST","PUT","PATCH","DELETE","OPTIONS"));
        config.setAllowedHeaders(List.of("*"));
        // Required — allows cookies to be sent with cross-origin requests
        config.setAllowCredentials(true);
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/api/**", config);
        return source;
    }
}