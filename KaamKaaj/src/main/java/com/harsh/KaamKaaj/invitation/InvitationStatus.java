package com.harsh.KaamKaaj.invitation;

// The lifecycle of a workspace invitation.
//
// PENDING  → sent by admin, awaiting response from the user
// ACCEPTED → user accepted, WorkspaceMember record was created
// DECLINED → user declined, no member record created
// CANCELLED → admin withdrew the invitation before user responded
//
// Only PENDING invitations appear in the user's inbox.
// Once an invitation leaves PENDING it is terminal —
// it cannot be changed again. This is a simple state machine:
//
//   PENDING → ACCEPTED
//   PENDING → DECLINED
//   PENDING → CANCELLED
//
// There are no other valid transitions.

public enum InvitationStatus {
    PENDING,
    ACCEPTED,
    DECLINED,
    CANCELLED
}