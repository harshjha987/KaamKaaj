package com.harsh.KaamKaaj.workspace;

// Tracks the lifecycle of a workspace membership.
//
// INVITED → user has been invited but hasn't responded yet.
//           They cannot receive task assignments in this state.
//
// ACTIVE  → user accepted the invitation (or created the
//           workspace). They are a full member.
//
// We don't have a DECLINED status here because a declined
// invitation is tracked on WorkspaceInvitation, not on
// WorkspaceMember. A declined invite never creates a member
// record at all.

public enum MemberStatus {
    INVITED,
    ACTIVE
}