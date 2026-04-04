package com.harsh.KaamKaaj.workspace.mapper;

import com.harsh.KaamKaaj.user.User;
import com.harsh.KaamKaaj.workspace.Workspace;
import com.harsh.KaamKaaj.workspace.dto.CreateWorkspaceRequest;
import com.harsh.KaamKaaj.workspace.dto.WorkspaceResponse;
import org.springframework.stereotype.Component;

@Component
public class WorkspaceMapper {

    public Workspace toEntity(CreateWorkspaceRequest request, User creator) {
        Workspace workspace = new Workspace();
        workspace.setName(request.getName().trim());
        workspace.setDescription(
                request.getDescription() != null ? request.getDescription().trim() : null
        );
        workspace.setCreatedBy(creator);
        // createdAt is set automatically by @CreationTimestamp
        return workspace;
    }

    public WorkspaceResponse toResponse(Workspace workspace) {
        return new WorkspaceResponse(
                workspace.getId(),
                workspace.getName(),
                workspace.getDescription(),
                // workspace.getCreatedBy() is LAZY — this triggers
                // one DB fetch. This is fine inside a @Transactional
                // service call. If called outside a transaction,
                // Hibernate throws LazyInitializationException.
                // We'll solve this cleanly with projections later.
                workspace.getCreatedBy().getUsername(),
                workspace.getCreatedAt()
        );
    }
}