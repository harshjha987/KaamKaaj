import api from './api'

export const authService = {
  register: (data) => api.post('/auth/register', { userName: data.username, email: data.email, password: data.password }),
  login:    (data) => api.post('/auth/login', { email: data.email, password: data.password }),
  refresh:  (refreshToken) => api.post('/auth/refresh', { refreshToken }),
  me:       () => api.get('/auth/me'),
  logout:   () => api.post('/auth/logout'),
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
  resetPassword:  (token, newPassword) => api.post('/auth/reset-password', { token, newPassword }),
}

export const userService = {
  search: (query) => api.get('/users/search', { params: { q: query } }),
}

export const workspaceService = {
  create:         (data) => api.post('/workspaces', { name: data.name, description: data.description }),
  list:           () => api.get('/workspaces'),
  get:            (workspaceId) => api.get(`/workspaces/${workspaceId}`),
  getMembers:     (workspaceId) => api.get(`/workspaces/${workspaceId}/members`),
  getMyMembership:(workspaceId) => api.get(`/workspaces/${workspaceId}/members/me`),
  removeMember:   (workspaceId, userId) => api.delete(`/workspaces/${workspaceId}/members/${userId}`),
  changeMemberRole:(workspaceId, userId, role) => api.patch(`/workspaces/${workspaceId}/members/${userId}/role`, { role }),
}

export const invitationService = {
  send:      (workspaceId, invitedUserId) => api.post(`/workspaces/${workspaceId}/invitations`, { invitedUserId }),
  list:      (workspaceId) => api.get(`/workspaces/${workspaceId}/invitations`),
  cancel:    (workspaceId, invitationId) => api.delete(`/workspaces/${workspaceId}/invitations/${invitationId}`),
  myPending: () => api.get('/me/invitations'),
  accept:    (invitationId) => api.post(`/me/invitations/${invitationId}/accept`),
  decline:   (invitationId) => api.post(`/me/invitations/${invitationId}/decline`),
}

export const taskService = {
  create:       (workspaceId, data) => api.post(`/workspaces/${workspaceId}/tasks`, { title: data.title, description: data.description, priority: data.priority, dueDate: data.dueDate }),
  list:         (workspaceId) => api.get(`/workspaces/${workspaceId}/tasks`),
  get:          (workspaceId, taskId) => api.get(`/workspaces/${workspaceId}/tasks/${taskId}`),
  update:       (workspaceId, taskId, data) => api.put(`/workspaces/${workspaceId}/tasks/${taskId}`, data),
  delete:       (workspaceId, taskId) => api.delete(`/workspaces/${workspaceId}/tasks/${taskId}`),
  // MEMBER: get only their accepted tasks in a workspace
  myTasks:      (workspaceId) => api.get(`/workspaces/${workspaceId}/me/tasks`),
  // MEMBER: update task status (NOT_STARTED → IN_PROGRESS → COMPLETED)
  updateStatus: (workspaceId, taskId, status) => api.patch(`/workspaces/${workspaceId}/tasks/${taskId}/status`, { status }),
}

export const assignmentService = {
  create:    (workspaceId, taskId, assigneeId) => api.post(`/workspaces/${workspaceId}/tasks/${taskId}/assignments`, { assigneeId }),
  history:   (workspaceId, taskId) => api.get(`/workspaces/${workspaceId}/tasks/${taskId}/assignments`),
  cancel:    (workspaceId, taskId, assignmentId) => api.delete(`/workspaces/${workspaceId}/tasks/${taskId}/assignments/${assignmentId}`),
  myPending: () => api.get('/me/assignments'),
  accept:    (assignmentId) => api.post(`/me/assignments/${assignmentId}/accept`),
  decline:   (assignmentId) => api.post(`/me/assignments/${assignmentId}/decline`),
}