package com.harsh.KaamKaaj.workspace.mapper;

import com.harsh.KaamKaaj.user.User;
import com.harsh.KaamKaaj.workspace.Workspace;
import com.harsh.KaamKaaj.workspace.WorkspaceMember;
import com.harsh.KaamKaaj.workspace.dto.CreateWorkspaceRequest;
import com.harsh.KaamKaaj.workspace.dto.MemberResponse;
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
        return workspace;
    }

    public WorkspaceResponse toResponse(Workspace workspace) {
        return new WorkspaceResponse(
                workspace.getId(),
                workspace.getName(),
                workspace.getDescription(),
                workspace.getCreatedBy().getUsername(),
                workspace.getCreatedAt()
        );
    }

    // NEW: Map WorkspaceMember entity → MemberResponse DTO
    public MemberResponse toMemberResponse(WorkspaceMember member) {
        return new MemberResponse(
                member.getId(),
                member.getUser().getId(),
                member.getUser().getUsername(),
                member.getUser().getEmail(),
                member.getRole(),
                member.getStatus(),
                member.getJoinedAt()
        );
    }
}