package com.harsh.KaamKaaj.message.mapper;

import com.harsh.KaamKaaj.message.WorkspaceMessage;
import com.harsh.KaamKaaj.message.dto.MessageResponse;
import org.springframework.stereotype.Component;

import java.util.Collections;
import java.util.List;

@Component
public class MessageMapper {

    // Map a top-level post — includes embedded replies
    public MessageResponse toResponse(WorkspaceMessage message) {
        List<MessageResponse> replies = message.getReplies() == null
                ? Collections.emptyList()
                : message.getReplies().stream()
                .map(this::toReplyResponse)
                .toList();

        return MessageResponse.builder()
                .id(message.getId())
                .workspaceId(message.getWorkspace().getId())
                .authorId(message.getAuthor().getId())
                .authorUsername(message.getAuthor().getUsername())
                .content(message.getContent())
                .edited(message.isEdited())
                .parentMessageId(null)
                .replies(replies)
                .replyCount(replies.size())
                .createdAt(message.getCreatedAt())
                .updatedAt(message.getUpdatedAt())
                .build();
    }

    // Map a reply — no nested replies
    public MessageResponse toReplyResponse(WorkspaceMessage reply) {
        return MessageResponse.builder()
                .id(reply.getId())
                .workspaceId(reply.getWorkspace().getId())
                .authorId(reply.getAuthor().getId())
                .authorUsername(reply.getAuthor().getUsername())
                .content(reply.getContent())
                .edited(reply.isEdited())
                .parentMessageId(reply.getParentMessage().getId())
                .replies(Collections.emptyList())
                .replyCount(0)
                .createdAt(reply.getCreatedAt())
                .updatedAt(reply.getUpdatedAt())
                .build();
    }
}