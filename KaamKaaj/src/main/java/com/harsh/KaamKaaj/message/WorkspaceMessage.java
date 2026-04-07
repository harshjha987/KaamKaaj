package com.harsh.KaamKaaj.message;

import com.harsh.KaamKaaj.user.User;
import com.harsh.KaamKaaj.workspace.Workspace;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

// -------------------------------------------------------
// WorkspaceMessage models a discussion board post.
//
// Two types of messages:
//   1. Top-level post — parentMessage is null
//   2. Reply         — parentMessage points to a top-level post
//
// We only allow one level of threading (post → replies).
// Replies cannot themselves have replies — this keeps the
// UI simple and the data model clean.
// -------------------------------------------------------
@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "workspace_messages")
public class WorkspaceMessage {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "workspace_id", nullable = false)
    private Workspace workspace;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "author_id", nullable = false)
    private User author;

    @Column(name = "content", nullable = false, columnDefinition = "TEXT")
    private String content;

    // Self-referential FK for threading.
    // Null = top-level post. Non-null = reply to that post.
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "parent_message_id", nullable = true)
    private WorkspaceMessage parentMessage;

    // Replies to this message — only populated for top-level posts
    @OneToMany(mappedBy = "parentMessage", fetch = FetchType.LAZY,
            cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("createdAt ASC")
    private List<WorkspaceMessage> replies = new ArrayList<>();

    @Column(name = "edited", nullable = false)
    private boolean edited = false;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private Instant updatedAt;
}