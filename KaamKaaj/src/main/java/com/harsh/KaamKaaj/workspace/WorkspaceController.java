package com.harsh.KaamKaaj.workspace;

import com.harsh.KaamKaaj.workspace.dto.CreateWorkspaceRequest;
import com.harsh.KaamKaaj.workspace.dto.WorkspaceResponse;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

// Notice: controllers are kept THIN.
// No authorization logic here — that's in @PreAuthorize on
// the service. No business logic either — that's in the service.
// Controllers only: parse the request, call the service,
// return the response.
//
// Authentication is injected by Spring automatically — it reads
// it from the SecurityContext that JwtFilter populated.
// You never parse the JWT manually in controllers.
@RestController
@RequestMapping("/api/v1/workspaces")
public class WorkspaceController {

    private final WorkspaceService workspaceService;

    public WorkspaceController(WorkspaceService workspaceService) {
        this.workspaceService = workspaceService;
    }

    @PostMapping
    public ResponseEntity<WorkspaceResponse> createWorkspace(
            @Valid @RequestBody CreateWorkspaceRequest request,
            Authentication authentication) {
        WorkspaceResponse response = workspaceService.createWorkspace(request, authentication);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping
    public ResponseEntity<List<WorkspaceResponse>> getMyWorkspaces(Authentication authentication) {
        return ResponseEntity.ok(workspaceService.getMyWorkspaces(authentication));
    }

    @GetMapping("/{workspaceId}")
    public ResponseEntity<WorkspaceResponse> getWorkspace(
            @PathVariable String workspaceId,
            Authentication authentication) {
        return ResponseEntity.ok(workspaceService.getWorkspaceById(workspaceId, authentication));
    }
}