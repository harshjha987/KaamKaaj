package com.harsh.KaamKaaj.workspace;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface WorkspaceRepository extends JpaRepository<Workspace, String> {

    // Finds all workspaces a user belongs to (any status,
    // any role). Used for "list my workspaces" endpoint.
    //
    // This is a JPQL query — it uses entity/field names,
    // not table/column names. "WorkspaceMember wm" refers
    // to the WorkspaceMember entity class. wm.workspace
    // refers to the workspace field on that entity.
    //
    // Why not a JOIN in the repository method name?
    // Spring Data's method naming (findBy...) can't express
    // "join through another entity". For any query that
    // crosses entity boundaries, write JPQL explicitly.
    @Query("""
        SELECT wm.workspace
        FROM WorkspaceMember wm
        WHERE wm.user.id = :userId
        AND wm.status = 'ACTIVE'
    """)
    List<Workspace> findActiveWorkspacesByUserId(@Param("userId") String userId);
}