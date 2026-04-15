<div align="center">

# KaamKaaj

### A production-grade, full-stack task management platform
**Inspired by Jira · Built to master Spring Security**

![Java](https://img.shields.io/badge/Java-17-orange?style=flat-square&logo=openjdk)
![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.x-brightgreen?style=flat-square&logo=springboot)
![Spring Security](https://img.shields.io/badge/Spring%20Security-6.x-brightgreen?style=flat-square&logo=springsecurity)
![React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react)
![MySQL](https://img.shields.io/badge/MySQL-8.x-blue?style=flat-square&logo=mysql)
![Railway](https://img.shields.io/badge/Backend-Railway-blueviolet?style=flat-square)
![Vercel](https://img.shields.io/badge/Frontend-Vercel-black?style=flat-square&logo=vercel)

**[Live App](https://kaamkaaj.site) ·

</div>

---

## What is KaamKaaj?

KaamKaaj is a full-stack task management platform built from scratch — conceptually similar to Jira. The primary goal was to **deeply understand Spring Security** by building a real, deployed application around it rather than following tutorials.

Every feature here was built with production concerns in mind: stateless authentication, multi-tenant workspace isolation, refresh token rotation with reuse detection, role-based access control using custom SpEL expressions, cross-browser cookie compatibility, and a fully responsive React frontend.

---

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Database Design](#database-design)
- [Security Deep Dive](#security-deep-dive)
- [API Reference](#api-reference)
- [Frontend Architecture](#frontend-architecture)
- [Getting Started](#getting-started)
- [Deployment](#deployment)
- [Project Structure](#project-structure)

---

## Features

### Authentication & Security
- Stateless JWT authentication transported via **HttpOnly cookies** — tokens are invisible to JavaScript, eliminating XSS-based token theft
- BCrypt password hashing with cost factor 10
- **Refresh token rotation** — every refresh invalidates the old token and issues a new one
- **Reuse detection** — if a rotated token is replayed, all sessions for that user are immediately invalidated
- Forgot password flow with time-limited (15-minute), single-use email tokens
- Password change that revokes all existing sessions across devices
- User enumeration prevention on the forgot-password endpoint

### Workspaces (Multi-Tenancy)
- Create, update, and delete workspaces
- Every request scoped by `X-Workspace-Id` header — membership verified before any operation
- Full cascade delete — removing a workspace atomically cleans up all members, invitations, tasks, assignments, and messages at the database level
- Last-admin protection — cannot remove, demote, or leave if you are the only admin

### Invitations
- Admin searches the global user directory — returns only name and email, never workspace membership info
- Send, cancel, accept, and decline invitations
- Re-invite users after decline (uniqueness enforced at service layer, not DB constraint)

### Tasks & Assignments
- Tasks and assignments are **separate entities** — full assignment history per task
- **ADMIN**: create, update all fields, delete tasks, cancel assignments
- **MEMBER**: update task status only, via enforced state machine:
  `NOT_STARTED → IN_PROGRESS → COMPLETED`
- Assignment inbox with accept/decline
- Track assigned-by, completed-by, and declined history

### Discussion Board
- Workspace-scoped threaded messages — post, reply, delete
- Self-referential foreign key for threaded replies
- Paginated message feed

### Frontend
- Fully responsive across desktop, tablet, and mobile
- Dark / light theme toggle
- Silent token refresh — users never see session-expired popups mid-session
- Real-time inbox count badge (polled every 30 seconds)
- Framer Motion page transitions and animations
- Unified inbox — invitations and assignments in one place

---

## Tech Stack

### Backend
| Layer | Technology |
|---|---|
| Language | Java 17 |
| Framework | Spring Boot 3.x |
| Security | Spring Security 6.x |
| Persistence | Spring Data JPA + Hibernate |
| Database | MySQL 8 |
| Authentication | JWT via JJWT library |
| Token Transport | HttpOnly Cookies |
| API Docs | Springdoc OpenAPI 3 (Swagger UI) |
| Email | JavaMailSender (Gmail SMTP) |
| Build | Maven |
| Hosting | Railway |

### Frontend
| Layer | Technology |
|---|---|
| Framework | React 18 + Vite 5 |
| Routing | React Router v6 |
| State Management | Zustand 4 |
| HTTP Client | Axios with interceptors |
| Animations | Framer Motion |
| Icons | Lucide React |
| Styling | Custom CSS design system (CSS variables) |
| Hosting | Vercel |

---

## Architecture

```
Browser (kaamkaaj.site)
    │  HttpOnly cookies + X-Workspace-Id header
    ▼
┌──────────────────────────────────────────────┐
│           Spring Security Filter Chain        │
│  JwtAuthenticationFilter                      │
│    → reads accessToken cookie                 │
│    → validates signature + expiry             │
│    → populates SecurityContextHolder          │
└──────────────────────┬───────────────────────┘
                       │
                       ▼
┌──────────────────────────────────────────────┐
│              Controller Layer                 │
│  reads X-Workspace-Id header                  │
│  delegates to service with workspaceId        │
└──────────────────────┬───────────────────────┘
                       │
                       ▼
┌──────────────────────────────────────────────┐
│               Service Layer                   │
│  @PreAuthorize("@workspaceAuthz.isAdmin()")   │
│  business logic + @Transactional boundaries   │
└──────────────────────┬───────────────────────┘
                       │
                       ▼
┌──────────────────────────────────────────────┐
│             Repository Layer                  │
│  Spring Data JPA                              │
│  all queries scoped by workspaceId            │
└──────────────────────┬───────────────────────┘
                       │
                       ▼
              MySQL (api.kaamkaaj.site)
```

### Multi-Tenancy Model

Every authenticated request carries two pieces of identity:
- **Cookie** — identifies *who* you are
- **`X-Workspace-Id` header** — identifies *which workspace* you're acting in

A dedicated `WorkspaceAuthorizationService` bean (referenced as `@workspaceAuthz` in SpEL expressions) queries `workspace_members` before every method executes. Being authenticated is not enough — you also have to be an active member of the claimed workspace.

---

## Database Design

### Schema

```
users
  id · username · email · password_hash · role · created_at

workspaces
  id · name · description · created_by → users · created_at

workspace_members
  id · workspace_id → workspaces · user_id → users
  role [ADMIN|MEMBER] · status [ACTIVE|REMOVED] · joined_at

workspace_invitations
  id · workspace_id → workspaces · invited_user_id → users
  invited_by_id → users · status [PENDING|ACCEPTED|DECLINED|CANCELLED]

tasks
  id · workspace_id → workspaces · title · description
  priority · due_date · status · created_by → users

task_assignments
  id · task_id → tasks · assignee_id → users
  assigned_by_id → users · status [PENDING|ACCEPTED|DECLINED|CANCELLED]

refresh_tokens
  id · user_id → users · token · expiry

password_reset_tokens
  id · user_id → users · token · expiry · used

workspace_messages
  id · workspace_id → workspaces · author_id → users
  content · parent_message_id → workspace_messages (self-referential)
```

### Foreign Keys & Cascade Delete

All foreign keys use `ON DELETE CASCADE` at the MySQL level. Deleting a workspace triggers a fully automatic cleanup chain in the database — no application-level code needed:

```
DELETE workspace
  → workspace_members deleted
  → workspace_invitations deleted
  → tasks deleted
      → task_assignments deleted
  → workspace_messages deleted
      → reply messages deleted (self-referential cascade)
```



---

## Security Deep Dive

### JWT Authentication

Tokens have three Base64-encoded parts: **Header.Payload.Signature**

```
Payload: { "sub": "user@email.com", "userId": "uuid", "role": "ROLE_ADMIN",
           "iat": 1700000000, "exp": 1700000900 }
```

The HMAC-SHA256 signature is computed using a 256-bit secret. Any tampering with the payload invalidates the signature — the server trusts the claims without hitting the database on every request.

### Why HttpOnly Cookies Over localStorage

Tokens in `localStorage` are readable by any JavaScript on the page — an XSS vulnerability anywhere becomes a token theft. HttpOnly cookies are completely inaccessible to JavaScript; only the browser sends them, only the server reads them.

### Refresh Token Rotation

```
Access token expires (15 min)
  → Axios interceptor catches 401
  → POST /auth/refresh (refresh cookie sent automatically by browser)
  → Server: find token in DB → validate → DELETE old token → issue new pair
  → New cookies set → original request retried transparently
```

If an attacker steals and uses a refresh token before the legitimate user, the user's next refresh finds their token already rotated — the server detects the reuse and invalidates all sessions for that user.

### `@PreAuthorize` with Custom SpEL

```java
// Requires @EnableMethodSecurity on SecurityConfig

@PreAuthorize("@workspaceAuthz.isAdmin(#workspaceId, authentication)")
public TaskResponse createTask(String workspaceId, CreateTaskRequest req) { ... }

@PreAuthorize("@workspaceAuthz.isMember(#workspaceId, authentication)")
public List<TaskResponse> getTasks(String workspaceId) { ... }
```

Spring wraps each annotated bean in an **AOP proxy**. The proxy evaluates the SpEL expression before delegating to the real method — if it returns false, `AccessDeniedException` is thrown (→ 403) and the method body never executes.

The `workspaceAuthz` bean is kept separate from `WorkspaceService` intentionally — calling a `@PreAuthorize` method on `this` within the same class bypasses the AOP proxy entirely.

---

## API Reference

Base URL: `https://api.kaamkaaj.site/api/v1`


### Auth
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/auth/register` | Public | Register new user |
| POST | `/auth/login` | Public | Login, sets HttpOnly cookies |
| POST | `/auth/logout` | Cookie | Logout, clears cookies |
| POST | `/auth/refresh` | Cookie | Rotate refresh token |
| GET | `/auth/me` | Cookie | Get current user profile |
| POST | `/auth/forgot-password` | Public | Send password reset email |
| POST | `/auth/reset-password` | Public | Reset password with token |
| PATCH | `/auth/change-password` | Cookie | Change password (revokes all sessions) |
| PATCH | `/auth/change-username` | Cookie | Change username |

### Workspaces
| Method | Endpoint | Role | Description |
|---|---|---|---|
| POST | `/workspaces` | Any | Create workspace |
| GET | `/workspaces` | Any | List my workspaces |
| GET | `/workspaces/{id}` | Member | Get workspace details |
| PUT | `/workspaces/{id}` | Admin | Update workspace |
| DELETE | `/workspaces/{id}` | Admin | Delete workspace (full cascade) |
| GET | `/workspaces/{id}/members` | Member | List members |
| PATCH | `/workspaces/{id}/members/{mId}/promote` | Admin | Promote to admin |
| PATCH | `/workspaces/{id}/members/{mId}/demote` | Admin | Demote to member |
| DELETE | `/workspaces/{id}/members/{mId}` | Admin | Remove member |
| POST | `/workspaces/{id}/leave` | Member | Leave workspace |

### Invitations
| Method | Endpoint | Role | Description |
|---|---|---|---|
| GET | `/users/search?query=` | Any | Search users by name or email |
| POST | `/workspaces/{id}/invitations` | Admin | Send invitation |
| GET | `/workspaces/{id}/invitations` | Admin | List workspace invitations |
| DELETE | `/workspaces/{id}/invitations/{invId}` | Admin | Cancel invitation |
| GET | `/invitations/received` | Any | My received invitations |
| POST | `/invitations/{invId}/accept` | Any | Accept invitation |
| POST | `/invitations/{invId}/decline` | Any | Decline invitation |

### Tasks & Assignments
| Method | Endpoint | Role | Description |
|---|---|---|---|
| POST | `/workspaces/{id}/tasks` | Admin | Create task |
| GET | `/workspaces/{id}/tasks` | Member | List tasks (paginated) |
| GET | `/workspaces/{id}/tasks/{taskId}` | Member | Get task detail |
| PUT | `/workspaces/{id}/tasks/{taskId}` | Admin | Update task (all fields) |
| DELETE | `/workspaces/{id}/tasks/{taskId}` | Admin | Delete task |
| POST | `/workspaces/{id}/tasks/{taskId}/assignments` | Admin | Assign task to member |
| GET | `/workspaces/{id}/tasks/{taskId}/assignments` | Admin | Assignment history |
| DELETE | `/workspaces/{id}/tasks/{taskId}/assignments/{aId}` | Admin | Cancel assignment |
| GET | `/me/assignments` | Member | Pending assignment inbox |
| POST | `/me/assignments/{aId}/accept` | Member | Accept assignment |
| POST | `/me/assignments/{aId}/decline` | Member | Decline assignment |
| PATCH | `/me/tasks/{taskId}/status` | Member | Update task status |
| GET | `/me/tasks` | Member | My accepted tasks |

### Discussion
| Method | Endpoint | Role | Description |
|---|---|---|---|
| POST | `/workspaces/{id}/messages` | Member | Post message |
| GET | `/workspaces/{id}/messages` | Member | List messages (paginated) |
| POST | `/workspaces/{id}/messages/{msgId}/replies` | Member | Reply to message |
| DELETE | `/workspaces/{id}/messages/{msgId}` | Author/Admin | Delete message |

---

## Frontend Architecture

### State Management — Zustand

Four focused stores instead of one monolithic Redux store:

```
useAuthStore       → user identity, login, logout, register
useWorkspaceStore  → workspace list, active workspace selection
useInboxStore      → inbox count (polled every 30s for live badge)
useToastStore      → toast notifications queue
```

### Axios Interceptors

**Request interceptor** — attaches `X-Workspace-Id` from the active workspace in Zustand to every outgoing request.

**Response interceptor** — catches 401 responses. If the user was authenticated and the failing request isn't an auth endpoint, it fires a silent refresh, waits for new cookies, and retries the original request — completely transparent to the user.

A **refresh lock** prevents multiple concurrent 401s from triggering multiple refresh calls. Only one refresh fires; all others are queued and retried after it resolves.

### Safari ITP Fix

Safari's Intelligent Tracking Prevention blocks cookies between different root domains regardless of `SameSite=None`. Running the frontend on `kaamkaaj.site` and the backend on `something.railway.app` caused Safari users to be logged out immediately after login — while Chrome worked fine.

The fix: point `api.kaamkaaj.site` (a subdomain) at the Railway backend via CNAME. Both frontend and backend now share the `kaamkaaj.site` root domain. Safari treats this as same-site and allows cookies.

---

## Getting Started

### Prerequisites

- Java 17+, Maven 3.8+, MySQL 8+
- Node.js 18+, npm

### Backend

```bash
cd KaamKaaj

# Create local database
mysql -u root -p -e "CREATE DATABASE kaamkaajv0;"

# Configure
cp src/main/resources/application.properties.example \
   src/main/resources/application.properties
# Fill in DB credentials, JWT secret, mail config

# Run
mvn spring-boot:run
# → http://localhost:8080
# → http://localhost:8080/swagger-ui.html
```

### Frontend

```bash
cd KaamKaajFrontend

npm install

# Configure
echo "VITE_API_URL=http://localhost:8080/api/v1" > .env

npm run dev
# → http://localhost:5173
```

### Generating a JWT Secret

```bash
openssl rand -base64 32
```

---

## Deployment

| Component | Platform | Domain |
|---|---|---|
| Frontend | Vercel | `kaamkaaj.site` |
| Backend | Railway | `api.kaamkaaj.site` |
| Database | Railway (MySQL plugin) | internal |

### Backend — Railway

```
Root Directory:   KaamKaaj
Build Command:    mvn clean package -DskipTests
Start Command:    java -Xmx400m -jar target/KaamKaaj-0.0.1-SNAPSHOT.jar
```

Key environment variables:
```
SPRING_DATASOURCE_URL      → jdbc:mysql://<railway-host>/<db>
APP_JWT_SECRET             → 256-bit base64 secret
SPRING_MAIL_USERNAME       → gmail address
SPRING_MAIL_PASSWORD       → gmail app password
APP_FRONTEND_URL           → https://kaamkaaj.site
APP_COOKIES_SECURE         → true
APP_COOKIES_SAME_SITE      → None
```

### Frontend — Vercel

```
Root Directory:   KaamKaajFrontend
Build Command:    npm run build
Output:           dist
```

Environment variable:
```
VITE_API_URL  →  https://api.kaamkaaj.site/api/v1
```

---

## Project Structure

```
kaamkaaj/                          ← repository root
│
├── KaamKaaj/                      ← Spring Boot backend
│   ├── src/main/java/com/harsh/KaamKaaj/
│   │   ├── auth/                  ← register, login, refresh, reset password
│   │   ├── workspace/             ← workspace CRUD + member management
│   │   ├── invitation/            ← invite, accept, decline flow
│   │   ├── task/                  ← task CRUD
│   │   ├── assignment/            ← assignment lifecycle + member inbox
│   │   ├── message/               ← discussion board
│   │   ├── security/
│   │   │   ├── SecurityConfig.java
│   │   │   ├── WorkspaceAuthorizationService.java
│   │   │   ├── UserPrincipal.java
│   │   │   ├── MyUserDetailsService.java
│   │   │   └── jwt/
│   │   │       ├── JwtService.java
│   │   │       └── JwtAuthenticationFilter.java
│   │   ├── entity/                ← JPA entities
│   │   ├── exception/             ← GlobalExceptionHandler + ErrorResponse
│   │   └── scheduler/             ← expired token cleanup jobs
│   ├── src/main/resources/
│   │   └── application.properties
│   └── pom.xml
│
├── KaamKaajFrontend/              ← React + Vite frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── ui/                ← Button, Modal, Toast, Pagination...
│   │   │   ├── layout/            ← AppShell, Sidebar, Navbar
│   │   │   ├── auth/              ← LoginForm, RegisterForm, ForgotPassword
│   │   │   ├── dashboard/         ← MetricCard, ActivityFeed, InboxPreview
│   │   │   ├── workspace/         ← TaskBoard, MembersTable, DiscussionBoard...
│   │   │   └── landing/           ← Hero, Features, About, Footer
│   │   ├── pages/                 ← LandingPage, AuthPage, DashboardPage...
│   │   ├── services/              ← API call definitions
│   │   ├── store/                 ← Zustand stores (auth, workspace, inbox, toast)
│   │   ├── utils/
│   │   │   └── api.js             ← Axios instance + interceptors
│   │   └── styles/                ← CSS variables + theme tokens
│   ├── .env.example
│   ├── vite.config.js
│   └── package.json
│
└── README.md                      ← you are here
```

---

<div align="center">

Built by [Harsh](https://github.com/your-username) · Deployed at [kaamkaaj.site](https://kaamkaaj.site)

</div>
