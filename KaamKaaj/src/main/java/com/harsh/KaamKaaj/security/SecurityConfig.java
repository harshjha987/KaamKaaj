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

@Configuration
@EnableWebSecurity
// -------------------------------------------------------
// @EnableMethodSecurity activates Spring Security's AOP-based
// method interception. Without this annotation, @PreAuthorize,
// @PostAuthorize, and @Secured annotations on your service
// methods are completely ignored — no error, no protection.
//
// prePostEnabled = true (default when you use @EnableMethodSecurity)
// enables @PreAuthorize and @PostAuthorize.
//
// HOW IT WORKS UNDER THE HOOD:
// Spring wraps every bean that has @PreAuthorize on its methods
// in an AOP proxy. When you call workspaceService.createWorkspace(),
// you're actually calling the proxy. The proxy:
//   1. Evaluates the SpEL expression in @PreAuthorize
//   2. If false → throws AccessDeniedException (→ 403)
//   3. If true  → delegates to the real method
//
// This means @PreAuthorize only works on SPRING-MANAGED BEANS
// called through the proxy. Calling a method on 'this' from
// within the same class bypasses the proxy — no auth check.
// -------------------------------------------------------
@EnableMethodSecurity
public class SecurityConfig {

    private final UserDetailsService userDetailsService;
    private final JwtFilter jwtFilter;

    // Fixed: constructor injection instead of @Autowired fields.
    // Constructor injection makes dependencies explicit and
    // allows the class to be tested without a Spring context.
    public SecurityConfig(UserDetailsService userDetailsService, JwtFilter jwtFilter) {
        this.userDetailsService = userDetailsService;
        this.jwtFilter = jwtFilter;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        return http
                .csrf(csrf -> csrf.disable())
                // -------------------------------------------------------
                // URL-level authorization rules.
                // These are the FIRST line of defense — coarse-grained.
                // Fine-grained workspace/resource checks happen in
                // @PreAuthorize on service methods.
                //
                // Rules are evaluated TOP TO BOTTOM, first match wins.
                // Always put specific rules before broad ones.
                // -------------------------------------------------------
                .authorizeHttpRequests(auth -> auth
                        // Public endpoints — no token needed
                        .requestMatchers(
                                "/api/v1/auth/register",
                                "/api/v1/auth/login"
                        ).permitAll()

                        // Swagger UI — open in dev, lock down in prod
                        .requestMatchers(
                                "/swagger-ui/**",
                                "/v3/api-docs/**"
                        ).permitAll()

                        // Workspace creation — any authenticated user
                        .requestMatchers(HttpMethod.POST, "/api/v1/workspaces").authenticated()

                        // Everything else — must be authenticated
                        // Fine-grained checks (@PreAuthorize) happen
                        // at the service layer, not here
                        .anyRequest().authenticated()
                )
                // STATELESS: Spring will never create or use a
                // HttpSession. Every request must carry its JWT.
                .sessionManagement(session ->
                        session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .formLogin(form -> form.disable())
                // JwtFilter runs before Spring's own
                // UsernamePasswordAuthenticationFilter.
                // It extracts the token, validates it, and sets
                // the Authentication in the SecurityContext so
                // that Spring Security knows who the caller is.
                .addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class)
                .build();
    }

    @Bean
    public BCryptPasswordEncoder passwordEncoder() {
        // Cost factor 12 means BCrypt runs 2^12 = 4096 rounds.
        // Slows down brute-force attacks significantly.
        // Higher = more secure but slower registration/login.
        // 10-12 is the production sweet spot.
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
}