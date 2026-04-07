package com.harsh.KaamKaaj.message;

import com.harsh.KaamKaaj.exception.ResourceNotFoundException;
import com.harsh.KaamKaaj.exception.WorkspaceAccessDeniedException;
import com.harsh.KaamKaaj.message.dto.MessageResponse;
import com.harsh.KaamKaaj.message.dto.PostMessageRequest;
import com.harsh.KaamKaaj.message.mapper.MessageMapper;
import com.harsh.KaamKaaj.model.UserPrincipal;
import com.harsh.KaamKaaj.user.User;
import com.harsh.KaamKaaj.user.UserRepo;
import com.harsh.KaamKaaj.workspace.MemberStatus;
import com.harsh.KaamKaaj.workspace.Workspace;
import com.harsh.KaamKaaj.workspace.WorkspaceMemberRepository;
import com.harsh.KaamKaaj.workspace.WorkspaceRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class MessageService {

    private final WorkspaceMessageRepository messageRepository;
    private final WorkspaceRepository workspaceRepository;
    private final WorkspaceMemberRepository memberRepository;
    private final UserRepo userRepo;
    private final MessageMapper messageMapper;

    public MessageService(WorkspaceMessageRepository messageRepository,
                          WorkspaceRepository workspaceRepository,
                          WorkspaceMemberRepository memberRepository,
                          UserRepo userRepo,
                          MessageMapper messageMapper) {
        this.messageRepository = messageRepository;
        this.workspaceRepository = workspaceRepository;
        this.memberRepository = memberRepository;
        this.userRepo = userRepo;
        this.messageMapper = messageMapper;
    }

    // ── List top-level posts (paginated, newest first) ────────
    @PreAuthorize("@workspaceAuthz.isMember(#workspaceId, authentication)")
    @Transactional(readOnly = true)
    public Page<MessageResponse> getMessages(String workspaceId,
                                             int page, int size,
                                             Authentication authentication) {
        Pageable pageable = PageRequest.of(page, size,
                Sort.by("createdAt").descending());
        return messageRepository
                .findByWorkspaceIdAndParentMessageIsNull(workspaceId, pageable)
                .map(messageMapper::toResponse);
    }

    // ── Post a new top-level message ──────────────────────────
    @PreAuthorize("@workspaceAuthz.isMember(#workspaceId, authentication)")
    @Transactional
    public MessageResponse postMessage(String workspaceId,
                                       PostMessageRequest request,
                                       Authentication authentication) {
        UserPrincipal principal = (UserPrincipal) authentication.getPrincipal();

        Workspace workspace = workspaceRepository.findById(workspaceId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Workspace not found: " + workspaceId));

        User author = userRepo.findById(principal.getUserId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        WorkspaceMessage message = new WorkspaceMessage();
        message.setWorkspace(workspace);
        message.setAuthor(author);
        message.setContent(request.getContent().trim());
        message.setParentMessage(null);

        return messageMapper.toResponse(messageRepository.save(message));
    }

    // ── Reply to an existing top-level post ───────────────────
    @PreAuthorize("@workspaceAuthz.isMember(#workspaceId, authentication)")
    @Transactional
    public MessageResponse postReply(String workspaceId,
                                     String parentMessageId,
                                     PostMessageRequest request,
                                     Authentication authentication) {
        UserPrincipal principal = (UserPrincipal) authentication.getPrincipal();

        Workspace workspace = workspaceRepository.findById(workspaceId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Workspace not found: " + workspaceId));

        WorkspaceMessage parent = messageRepository.findById(parentMessageId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Message not found: " + parentMessageId));

        // Guard: can only reply to top-level posts, not to other replies.
        // This enforces the one-level threading rule.
        if (parent.getParentMessage() != null) {
            throw new WorkspaceAccessDeniedException(
                    "Cannot reply to a reply. Please reply to the original post.");
        }

        // Guard: parent must belong to this workspace
        if (!parent.getWorkspace().getId().equals(workspaceId)) {
            throw new ResourceNotFoundException("Message not found in this workspace");
        }

        User author = userRepo.findById(principal.getUserId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        WorkspaceMessage reply = new WorkspaceMessage();
        reply.setWorkspace(workspace);
        reply.setAuthor(author);
        reply.setContent(request.getContent().trim());
        reply.setParentMessage(parent);

        return messageMapper.toReplyResponse(messageRepository.save(reply));
    }

    // ── Delete a message ──────────────────────────────────────
    // Authors can delete their own messages.
    // Workspace ADMINs can delete any message (moderation).
    @PreAuthorize("@workspaceAuthz.isMember(#workspaceId, authentication)")
    @Transactional
    public void deleteMessage(String workspaceId,
                              String messageId,
                              Authentication authentication) {
        UserPrincipal principal = (UserPrincipal) authentication.getPrincipal();

        WorkspaceMessage message = messageRepository.findById(messageId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Message not found: " + messageId));

        // Verify message belongs to this workspace
        if (!message.getWorkspace().getId().equals(workspaceId)) {
            throw new ResourceNotFoundException("Message not found in this workspace");
        }

        // Check if user is the author or a workspace admin
        boolean isAuthor = message.getAuthor().getId().equals(principal.getUserId());
        boolean isAdmin  = memberRepository
                .findByWorkspaceIdAndUserId(workspaceId, principal.getUserId())
                .map(m -> m.getRole().name().equals("ADMIN"))
                .orElse(false);

        if (!isAuthor && !isAdmin) {
            throw new WorkspaceAccessDeniedException(
                    "You can only delete your own messages");
        }

        messageRepository.delete(message);
    }
}