package com.harsh.KaamKaaj.workspace.dto;

import com.harsh.KaamKaaj.workspace.MemberStatus;
import com.harsh.KaamKaaj.workspace.WorkspaceRole;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;

// What we expose about a workspace member.
//
// Notice what is NOT here:
//   - passwordHash (obviously)
//   - emailVerified
//   - the user's global Role
//   - what other workspaces they belong to
//
// A member of workspace W1 should not be able to infer
// anything about a user's activity in workspace W2 just
// by listing W1's members. We expose only what's relevant
// to THIS workspace context.
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class MemberResponse {
    private String memberId;        // WorkspaceMember.id
    private String userId;
    private String username;
    private String email;
    private WorkspaceRole role;     // ADMIN or MEMBER in this workspace
    private MemberStatus status;    // ACTIVE (INVITED members are not listed)
    private Instant joinedAt;
}