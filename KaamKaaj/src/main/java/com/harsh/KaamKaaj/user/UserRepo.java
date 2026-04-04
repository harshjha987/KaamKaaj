package com.harsh.KaamKaaj.user;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface UserRepo extends JpaRepository<User, String> {

    Optional<User> findByEmail(String email);
    boolean existsByEmail(String email);
    boolean existsByUsername(String username);

    // Global user search by name or email.
    //
    // LOWER() makes the search case-insensitive — "harsh"
    // finds "Harsh" and "HARSH". We wrap the search term in
    // %...% for a CONTAINS match (SQL LIKE).
    //
    // CONCAT('%', LOWER(:query), '%') is DB-portable.
    // Some DBs need different syntax — this works on MySQL
    // and PostgreSQL.
    //
    // This returns User entities — we map to UserSearchResponse
    // in the service layer, never exposing the entity directly.
    @Query("""
        SELECT u FROM User u
        WHERE LOWER(u.username) LIKE CONCAT('%', LOWER(:query), '%')
        OR LOWER(u.email) LIKE CONCAT('%', LOWER(:query), '%')
    """)
    List<User> searchByUsernameOrEmail(@Param("query") String query);
}