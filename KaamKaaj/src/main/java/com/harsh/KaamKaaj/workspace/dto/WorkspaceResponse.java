package com.harsh.KaamKaaj.workspace.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;

// We never expose the full Workspace entity directly from
// controllers. Always map to a DTO first because:
//   1. Entities can have LAZY-loaded associations that trigger
//      extra DB queries if Jackson tries to serialize them.
//      This causes the N+1 problem and "lazy init" exceptions.
//   2. You control exactly what fields the client sees.
//   3. Your internal DB structure is decoupled from your API
//      contract — you can change the entity without breaking clients.
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class WorkspaceResponse {
    private String id;
    private String name;
    private String description;
    private String createdByUsername;
    private Instant createdAt;
}