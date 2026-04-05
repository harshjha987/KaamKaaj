# KaamKaaj Frontend

React + Vite frontend for the KaamKaaj Task Management Platform.

## Tech Stack

- **React 18** with React Router v6
- **Framer Motion** for page transitions and animations
- **Zustand** for auth state management
- **Axios** with automatic JWT refresh interceptor
- **Lucide React** for icons
- **Fonts:** Syne (display) + DM Sans (body)

## Getting Started

```bash
# 1. Install dependencies
npm install

# 2. Start dev server (proxies /api to localhost:8080)
npm run dev

# 3. Open http://localhost:3000
```

Your Spring Boot backend must be running on port 8080.

## Project Structure

```
src/
├── App.jsx                    # Router + page transitions
├── main.jsx                   # Entry point
├── styles/globals.css         # Design tokens + global styles
│
├── pages/
│   ├── LandingPage.jsx        # Marketing page with hero + features
│   ├── AuthPage.jsx           # Login / Register (split layout)
│   ├── DashboardPage.jsx      # Overview, workspaces, inbox
│   └── WorkspacePage.jsx      # Tasks board, members, invitations
│
├── components/
│   ├── layout/
│   │   ├── Navbar.jsx         # Fixed navbar with home + theme toggle
│   │   ├── Sidebar.jsx        # App sidebar with workspace list
│   │   ├── AppShell.jsx       # Sidebar + create workspace modal
│   │   └── ProtectedRoute.jsx # Auth guard
│   │
│   ├── ui/                    # Reusable primitives
│   │   ├── Button.jsx
│   │   ├── Input.jsx          # Input, Select, Textarea
│   │   ├── Modal.jsx
│   │   ├── Toast.jsx          # Notification stack
│   │   ├── Avatar.jsx
│   │   └── Badge.jsx          # Priority, Status, Role, Invitation badges
│   │
│   ├── dashboard/
│   │   ├── MetricsRow.jsx     # 4 metric cards
│   │   ├── WorkspaceGrid.jsx  # Workspace cards grid
│   │   └── InboxPanel.jsx     # Invitations + assignments inbox
│   │
│   ├── workspace/
│   │   ├── TaskBoard.jsx      # 3-column kanban board
│   │   ├── MembersTable.jsx   # Members with promote/remove
│   │   └── InvitationsTable.jsx # Invitations with search + send
│   │
│   ├── auth/
│   │   ├── LoginForm.jsx
│   │   └── RegisterForm.jsx
│   │
│   └── landing/
│       ├── HeroSection.jsx
│       └── Sections.jsx       # Features, stats, CTA
│
├── services/
│   ├── api.js                 # Axios instance + JWT refresh interceptor
│   └── endpoints.js           # All API calls (auth, workspaces, tasks, etc.)
│
├── store/
│   ├── authStore.js           # Zustand auth store (login, register, logout)
│   └── toastStore.js          # Toast notification store
│
├── hooks/
│   ├── useTheme.js            # Dark/light theme toggle (persists to localStorage)
│   └── useScrollReveal.js     # IntersectionObserver scroll animations
│
└── utils/
    └── helpers.js             # getInitials, formatDate, PRIORITY_META, etc.
```

## API Integration

All endpoints are wired in `src/services/endpoints.js`:

| Service           | Methods                                          |
|-------------------|--------------------------------------------------|
| `authService`     | register, login, refresh, me, logout             |
| `userService`     | search                                           |
| `workspaceService`| create, list, get, getMembers, getMyMembership, removeMember, changeMemberRole |
| `invitationService`| send, list, cancel, myPending, accept, decline  |
| `taskService`     | create, list, get, update, delete, updateStatus, myTasks |
| `assignmentService`| create, history, cancel, myPending, accept, decline |

## Design System

CSS custom properties defined in `src/styles/globals.css`:

| Token | Purpose |
|-------|---------|
| `--violet` / `--cyan` | Brand accent colors |
| `--bg` / `--bg2` / `--bg3` | Background layers |
| `--text` / `--text2` / `--text3` | Text hierarchy |
| `--grad2` | Primary gradient (violet → indigo → cyan) |
| `--font-display` | Syne — headings |
| `--font-body` | DM Sans — body text |

All tokens automatically adapt to dark mode via `[data-theme="dark"]`.

## Features

- Dark / light theme toggle (persists across sessions)
- Smooth page transitions with Framer Motion
- Scroll reveal animations on landing page
- Automatic JWT token refresh (transparent to the user)
- Role-aware UI (admin actions hidden from members)
- Real-time toast notifications
- Confirm modals for destructive actions (remove member, cancel invitation)
- Global user search with invite flow
- Kanban board grouped by task status
