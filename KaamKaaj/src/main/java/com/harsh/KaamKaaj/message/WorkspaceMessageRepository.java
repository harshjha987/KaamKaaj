package com.harsh.KaamKaaj.message;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface WorkspaceMessageRepository extends JpaRepository<WorkspaceMessage, String> {

    // Top-level posts only — parentMessage is null
    Page<WorkspaceMessage> findByWorkspaceIdAndParentMessageIsNull(
            String workspaceId, Pageable pageable);

    // Replies to a specific message
    // Ordered by createdAt ASC via @OrderBy on the entity
    java.util.List<WorkspaceMessage> findByParentMessageId(String parentMessageId);

    // Count replies — shown on each post card
    long countByParentMessageId(String parentMessageId);
}