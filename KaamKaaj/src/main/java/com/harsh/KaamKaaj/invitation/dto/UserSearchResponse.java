package com.harsh.KaamKaaj.user.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

// This is the ONLY response shape allowed for global user search.
//
// It deliberately contains ONLY identity fields.
// It must NEVER include:
//   - which workspaces this user belongs to
//   - what tasks they have
//   - their role in any workspace
//   - whether they're already a member of your workspace
//
// The last point is subtle: if you returned "alreadyMember: true",
// an admin from workspace W1 could probe whether a user belongs
// to workspace W2 — a privacy violation. The admin should only
// know about their own workspace's membership, which they get
// from the /workspaces/{id}/members endpoint.
@Getter
@AllArgsConstructor
public class UserSearchResponse {
    private String userId;
    private String username;
    private String email;
}