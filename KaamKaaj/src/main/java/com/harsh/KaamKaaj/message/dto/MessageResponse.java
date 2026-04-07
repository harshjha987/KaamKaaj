package com.harsh.KaamKaaj.message.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MessageResponse {

    private String id;
    private String workspaceId;

    private String authorId;
    private String authorUsername;

    private String content;
    private boolean edited;

    private String parentMessageId;  // null for top-level posts

    // Replies are embedded in the top-level post response.
    // Empty list for replies themselves.
    private List<MessageResponse> replies;
    private long replyCount;

    private Instant createdAt;
    private Instant updatedAt;
}