import api from './api'

// export const authService = {
//   register: (data) => api.post('/auth/register', { userName: data.username, email: data.email, password: data.password }),
//   login:    (data) => api.post('/auth/login', { email: data.email, password: data.password }),
//   refresh:  (refreshToken) => api.post('/auth/refresh', { refreshToken }),
//   me:       () => api.get('/auth/me'),
//   logout:   () => api.post('/auth/logout'),
//   forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
//   resetPassword:  (token, newPassword) => api.post('/auth/reset-password', { token, newPassword }),
// }
export const authService = {
  register: (data) => api.post('/auth/register', {
    userName: data.username,
    email: data.email,
    password: data.password,
  }),
  login:   (data) => api.post('/auth/login', {
    email: data.email,
    password: data.password,
  }),
  // Refresh reads cookie automatically — empty body
  refresh: () => api.post('/auth/refresh', {}),
  me:      () => api.get('/auth/me'),
  logout:  () => api.post('/auth/logout'),
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
  resetPassword:  (token, newPassword) => api.post('/auth/reset-password', { token, newPassword }),
}

export const userService = {
  search: (query) => api.get('/users/search', { params: { q: query } }),
}

export const workspaceService = {
  create:          (data) => api.post('/workspaces', data),
  list:            () => api.get('/workspaces'),
  get:             (workspaceId) => api.get(`/workspaces/${workspaceId}`),
  update:          (workspaceId, data) => api.patch(`/workspaces/${workspaceId}`, data),
  delete:          (workspaceId) => api.delete(`/workspaces/${workspaceId}`),
  getMembers:      (workspaceId, page = 0, size = 20) =>
    api.get(`/workspaces/${workspaceId}/members`, { params: { page, size } }),
  getMyMembership: (workspaceId) => api.get(`/workspaces/${workspaceId}/members/me`),
  removeMember:    (workspaceId, userId) =>
    api.delete(`/workspaces/${workspaceId}/members/${userId}`),
  changeMemberRole:(workspaceId, userId, role) =>
    api.patch(`/workspaces/${workspaceId}/members/${userId}/role`, { role }),
  leave:           (workspaceId) => api.delete(`/workspaces/${workspaceId}/members/me`),
}

export const invitationService = {
  send:      (workspaceId, invitedUserId) =>
    api.post(`/workspaces/${workspaceId}/invitations`, { invitedUserId }),
  list:      (workspaceId, page = 0, size = 10) =>
    api.get(`/workspaces/${workspaceId}/invitations`, { params: { page, size } }),
  cancel:    (workspaceId, invitationId) =>
    api.delete(`/workspaces/${workspaceId}/invitations/${invitationId}`),
  myPending: () => api.get('/me/invitations'),
  accept:    (invitationId) => api.post(`/me/invitations/${invitationId}/accept`),
  decline:   (invitationId) => api.post(`/me/invitations/${invitationId}/decline`),
}

export const taskService = {
  create:       (workspaceId, data) =>
    api.post(`/workspaces/${workspaceId}/tasks`, data),
  list:         (workspaceId, page = 0, size = 10) =>
    api.get(`/workspaces/${workspaceId}/tasks`, { params: { page, size } }),
  get:          (workspaceId, taskId) =>
    api.get(`/workspaces/${workspaceId}/tasks/${taskId}`),
  update:       (workspaceId, taskId, data) =>
    api.put(`/workspaces/${workspaceId}/tasks/${taskId}`, data),
  delete:       (workspaceId, taskId) =>
    api.delete(`/workspaces/${workspaceId}/tasks/${taskId}`),
  myTasks:      (workspaceId) =>
    api.get(`/workspaces/${workspaceId}/me/tasks`),
  updateStatus: (workspaceId, taskId, status) =>
    api.patch(`/workspaces/${workspaceId}/tasks/${taskId}/status`, { status }),
}
export const assignmentService = {
  create:    (workspaceId, taskId, assigneeId) => api.post(`/workspaces/${workspaceId}/tasks/${taskId}/assignments`, { assigneeId }),
  history:   (workspaceId, taskId) => api.get(`/workspaces/${workspaceId}/tasks/${taskId}/assignments`),
  cancel:    (workspaceId, taskId, assignmentId) => api.delete(`/workspaces/${workspaceId}/tasks/${taskId}/assignments/${assignmentId}`),
  myPending: () => api.get('/me/assignments'),
  accept:    (assignmentId) => api.post(`/me/assignments/${assignmentId}/accept`),
  decline:   (assignmentId) => api.post(`/me/assignments/${assignmentId}/decline`),
}

export const messageService = {
  // GET paginated top-level posts with embedded replies
  list:   (workspaceId, page = 0, size = 15) =>
    api.get(`/workspaces/${workspaceId}/messages`, { params: { page, size } }),

  // POST new top-level message
  post:   (workspaceId, content) =>
    api.post(`/workspaces/${workspaceId}/messages`, { content }),

  // POST reply to a message
  reply:  (workspaceId, messageId, content) =>
    api.post(`/workspaces/${workspaceId}/messages/${messageId}/reply`, { content }),

  // DELETE a message
  delete: (workspaceId, messageId) =>
    api.delete(`/workspaces/${workspaceId}/messages/${messageId}`),
}