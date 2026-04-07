package com.harsh.KaamKaaj.message;

import com.harsh.KaamKaaj.message.dto.MessageResponse;
import com.harsh.KaamKaaj.message.dto.PostMessageRequest;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@Tag(name = "Discussion", description = "Workspace discussion board")
@RestController
@RequestMapping("/api/v1/workspaces/{workspaceId}/messages")
public class MessageController {

    private final MessageService messageService;

    public MessageController(MessageService messageService) {
        this.messageService = messageService;
    }

    @Operation(summary = "List discussion posts (paginated, newest first)")
    @GetMapping
    public ResponseEntity<Page<MessageResponse>> getMessages(
            @PathVariable String workspaceId,
            @RequestParam(defaultValue = "0")  int page,
            @RequestParam(defaultValue = "15") int size,
            Authentication authentication) {
        return ResponseEntity.ok(
                messageService.getMessages(workspaceId, page, size, authentication));
    }

    @Operation(summary = "Post a new discussion message")
    @PostMapping
    public ResponseEntity<MessageResponse> postMessage(
            @PathVariable String workspaceId,
            @Valid @RequestBody PostMessageRequest request,
            Authentication authentication) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(messageService.postMessage(workspaceId, request, authentication));
    }

    @Operation(summary = "Reply to a discussion post")
    @PostMapping("/{messageId}/reply")
    public ResponseEntity<MessageResponse> postReply(
            @PathVariable String workspaceId,
            @PathVariable String messageId,
            @Valid @RequestBody PostMessageRequest request,
            Authentication authentication) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(messageService.postReply(workspaceId, messageId, request, authentication));
    }

    @Operation(summary = "Delete a message (own message or admin)")
    @DeleteMapping("/{messageId}")
    public ResponseEntity<Void> deleteMessage(
            @PathVariable String workspaceId,
            @PathVariable String messageId,
            Authentication authentication) {
        messageService.deleteMessage(workspaceId, messageId, authentication);
        return ResponseEntity.noContent().build();
    }
}