import api from './api'

// ── AUTH ──────────────────────────────────────────────────────────────────────

export const authService = {
  // POST /api/v1/auth/register
  register: (data) =>
    api.post('/auth/register', {
      userName: data.username,
      email: data.email,
      password: data.password,
    }),

  // POST /api/v1/auth/login
  login: (data) =>
    api.post('/auth/login', {
      email: data.email,
      password: data.password,
    }),

  // POST /api/v1/auth/refresh
  refresh: (refreshToken) =>
    api.post('/auth/refresh', { refreshToken }),

  // GET /api/v1/auth/me
  me: () => api.get('/auth/me'),

  // POST /api/v1/auth/logout
  logout: () => api.post('/auth/logout'),
}

// ── USERS ─────────────────────────────────────────────────────────────────────

export const userService = {
  // GET /api/v1/users/search?q=query
  search: (query) =>
    api.get('/users/search', { params: { q: query } }),
}

// ── WORKSPACES ────────────────────────────────────────────────────────────────

export const workspaceService = {
  // POST /api/v1/workspaces
  create: (data) =>
    api.post('/workspaces', {
      name: data.name,
      description: data.description,
    }),

  // GET /api/v1/workspaces
  list: () => api.get('/workspaces'),

  // GET /api/v1/workspaces/:id
  get: (workspaceId) =>
    api.get(`/workspaces/${workspaceId}`),

  // ── Members ──

  // GET /api/v1/workspaces/:id/members
  getMembers: (workspaceId) =>
    api.get(`/workspaces/${workspaceId}/members`),

  // GET /api/v1/workspaces/:id/members/me
  getMyMembership: (workspaceId) =>
    api.get(`/workspaces/${workspaceId}/members/me`),

  // DELETE /api/v1/workspaces/:id/members/:userId
  removeMember: (workspaceId, userId) =>
    api.delete(`/workspaces/${workspaceId}/members/${userId}`),

  // PATCH /api/v1/workspaces/:id/members/:userId/role
  changeMemberRole: (workspaceId, userId, role) =>
    api.patch(`/workspaces/${workspaceId}/members/${userId}/role`, { role }),
}

// ── INVITATIONS ───────────────────────────────────────────────────────────────

export const invitationService = {
  // POST /api/v1/workspaces/:id/invitations
  send: (workspaceId, invitedUserId) =>
    api.post(`/workspaces/${workspaceId}/invitations`, { invitedUserId }),

  // GET /api/v1/workspaces/:id/invitations
  list: (workspaceId) =>
    api.get(`/workspaces/${workspaceId}/invitations`),

  // DELETE /api/v1/workspaces/:id/invitations/:invId
  cancel: (workspaceId, invitationId) =>
    api.delete(`/workspaces/${workspaceId}/invitations/${invitationId}`),

  // GET /api/v1/me/invitations
  myPending: () => api.get('/me/invitations'),

  // POST /api/v1/me/invitations/:id/accept
  accept: (invitationId) =>
    api.post(`/me/invitations/${invitationId}/accept`),

  // POST /api/v1/me/invitations/:id/decline
  decline: (invitationId) =>
    api.post(`/me/invitations/${invitationId}/decline`),
}

// ── TASKS ─────────────────────────────────────────────────────────────────────

export const taskService = {
  // POST /api/v1/workspaces/:id/tasks
  create: (workspaceId, data) =>
    api.post(`/workspaces/${workspaceId}/tasks`, {
      title: data.title,
      description: data.description,
      priority: data.priority,
      dueDate: data.dueDate,
    }),

  // GET /api/v1/workspaces/:id/tasks
  list: (workspaceId) =>
    api.get(`/workspaces/${workspaceId}/tasks`),

  // GET /api/v1/workspaces/:id/tasks/:taskId
  get: (workspaceId, taskId) =>
    api.get(`/workspaces/${workspaceId}/tasks/${taskId}`),

  // PUT /api/v1/workspaces/:id/tasks/:taskId
  update: (workspaceId, taskId, data) =>
    api.put(`/workspaces/${workspaceId}/tasks/${taskId}`, data),

  // DELETE /api/v1/workspaces/:id/tasks/:taskId
  delete: (workspaceId, taskId) =>
    api.delete(`/workspaces/${workspaceId}/tasks/${taskId}`),

  // PATCH /api/v1/workspaces/:id/tasks/:taskId/status
  updateStatus: (workspaceId, taskId, status) =>
    api.patch(`/workspaces/${workspaceId}/tasks/${taskId}/status`, { status }),

  // GET /api/v1/workspaces/:id/me/tasks
  myTasks: (workspaceId) =>
    api.get(`/workspaces/${workspaceId}/me/tasks`),
}

// ── ASSIGNMENTS ───────────────────────────────────────────────────────────────

export const assignmentService = {
  // POST /api/v1/workspaces/:id/tasks/:taskId/assignments
  create: (workspaceId, taskId, assigneeId) =>
    api.post(`/workspaces/${workspaceId}/tasks/${taskId}/assignments`, { assigneeId }),

  // GET /api/v1/workspaces/:id/tasks/:taskId/assignments
  history: (workspaceId, taskId) =>
    api.get(`/workspaces/${workspaceId}/tasks/${taskId}/assignments`),

  // DELETE /api/v1/workspaces/:id/tasks/:taskId/assignments/:assignmentId
  cancel: (workspaceId, taskId, assignmentId) =>
    api.delete(`/workspaces/${workspaceId}/tasks/${taskId}/assignments/${assignmentId}`),

  // GET /api/v1/me/assignments
  myPending: () => api.get('/me/assignments'),

  // POST /api/v1/me/assignments/:id/accept
  accept: (assignmentId) =>
    api.post(`/me/assignments/${assignmentId}/accept`),

  // POST /api/v1/me/assignments/:id/decline
  decline: (assignmentId) =>
    api.post(`/me/assignments/${assignmentId}/decline`),
}
