package com.harsh.KaamKaaj.workspace;

import com.harsh.KaamKaaj.user.User;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.Instant;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "workspaces")
public class Workspace {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;


    @Column(name = "name", nullable = false, length = 100)
    private String name;

    @Column(name = "description", length = 500)
    private String description;

    // @ManyToOne: many workspaces can be created by one user.
    // LAZY loading means Hibernate does NOT fetch the User
    // from the DB when you load a Workspace — it only fetches
    // it when you explicitly call workspace.getCreatedBy().
    // This is almost always what you want. EAGER loading
    // (the default for @ManyToOne) runs an extra JOIN on
    // every workspace query even when you don't need the user.
    //
    // @JoinColumn names the FK column in the workspaces table.
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by", nullable = false)
    private User createdBy;

    // @CreationTimestamp tells Hibernate to set this field
    // to the current timestamp when the entity is first saved.
    // It never updates after that — it's immutable.
    // Instant (UTC) is better than LocalDateTime here because
    // your users might be in different timezones.
    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;
}