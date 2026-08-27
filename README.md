# FlowStud

A full-stack study planner for students: track courses, assignments, and study
sessions, tag and prioritise your work, and follow other students to see their
progress. Built as a decoupled **Laravel 13 REST API** and a **React 19 single-page
application**.

---

## Features

**Study management**
- **Courses** – full CRUD, each owned by a user.
- **Assignments** – title, description, type (homework / exam / project / reading /
  lab / presentation), status (pending / in progress / completed / overdue),
  priority (low / medium / high / critical), due date & time, optional course link,
  and a one-tap "mark complete" action.
- **Study sessions** – group assignments into a dated session, add/remove items,
  and **drag to reorder** them (persisted via a `sort_order` pivot column).
- **Tags** – colour-coded, either personal or global, attachable to assignments as
  a many-to-many relation.
- **Dashboard** – aggregated stats and upcoming work.

**Social**
- Public user profiles with configurable visibility (each user chooses whether to
  expose their completed-assignment count, study streak, and session count).
- Follow / unfollow other users; followers and following lists.
- User search.

**Accounts & access control**
- Registration, login, logout, password reset, and email verification
  (Laravel Breeze API stack).
- Token authentication with **Laravel Sanctum** (Bearer tokens).
- Role-based authorisation (`student` / `admin`) enforced by custom middleware.

**Admin panel**
- Platform statistics.
- User management – change roles, delete accounts.
- Tag moderation – list and delete tags.

---

## Tech stack

| Layer | Technology |
|---|---|
| Backend | PHP 8.3+, Laravel 13, Sanctum, Eloquent ORM |
| Auth scaffolding | Laravel Breeze (API) |
| Database | SQLite by default (any Laravel-supported driver works) |
| Frontend | React 19, Vite, React Router 7 |
| Data fetching | TanStack Query (React Query) |
| Styling | Tailwind CSS + daisyUI |
| HTTP | Axios (with token-injection and 401 interceptors) |
| Tests | PHPUnit (Feature + Unit) |

---

## Architecture

```
┌─────────────────┐         JSON / HTTPS          ┌──────────────────────┐
│  React SPA       │  ───────────────────────────▶ │  Laravel REST API    │
│  (client/)       │  ◀─────────────────────────── │  (server/)           │
│                  │      Bearer token (Sanctum)   │                      │
│  React Query     │                               │  Controllers ─▶ ...  │
│  Router 7        │                               │  Eloquent ─▶ SQLite  │
└─────────────────┘                               └──────────────────────┘
```

The client keeps the auth token in `localStorage`; an Axios request interceptor
attaches it as `Authorization: Bearer <token>`, and a response interceptor clears
it and redirects to `/login` on any `401`.

### Data model

- `User` *hasMany* `Course`, `Assignment`, `StudySession`
- `User` *belongsToMany* `User` through `follows` (self-referencing, unique pair)
- `Assignment` *belongsTo* `Course` (nullable), *belongsToMany* `Tag`
- `StudySession` *hasMany* `SessionItem` → each references an `Assignment`, ordered
  by `sort_order`, unique per (session, assignment)

---

## Getting started

### Prerequisites

- PHP **8.3+** with the usual Laravel extensions
- Composer 2
- Node.js **20+** and npm

### 1. Backend (`server/`)

```bash
cd server
composer install
cp .env.example .env
php artisan key:generate
php artisan migrate --seed
php artisan serve            # http://localhost:8000
```

### 2. Frontend (`client/`)

```bash
cd client
npm install
npm run dev                  # http://localhost:5173
```

The API base URL is set in [`client/src/api/client.js`](client/src/api/client.js)
(`http://localhost:8000/api`). CORS origins are configured in
[`server/config/cors.php`](server/config/cors.php).

### Seeded accounts

`php artisan migrate --seed` creates:

| Role | Username | Email | Password |
|---|---|---|---|
| Admin | `admin` | `admin@flowstud.test` | `password` |
| Student | `alice` … `eve` | `alice@flowstud.test` … | `password` |

along with sample tags, courses, assignments, and study sessions.

---

## API overview

All routes are prefixed with `/api`. Protected routes require
`Authorization: Bearer <token>`; admin routes additionally require the `admin` role.

### Auth
| Method | Endpoint | Description |
|---|---|---|
| POST | `/register` | Create account |
| POST | `/login` | Obtain token |
| POST | `/logout` | Revoke token |
| POST | `/forgot-password` · `/reset-password` | Password reset flow |
| GET  | `/user` | Current authenticated user |

### Resources (auth required)
| Method | Endpoint | Description |
|---|---|---|
| `apiResource` | `/courses` | Course CRUD |
| `apiResource` | `/assignments` | Assignment CRUD |
| PATCH | `/assignments/{id}/complete` | Mark complete |
| POST / DELETE | `/assignments/{id}/tags/{tagId}` | Attach / detach tag |
| `apiResource` | `/sessions` | Study session CRUD |
| POST / DELETE | `/sessions/{id}/items[/{assignmentId}]` | Add / remove session item |
| PATCH | `/sessions/{id}/items/reorder` | Reorder session items |
| GET/POST/PATCH/DELETE | `/tags` | Tag management |
| GET | `/dashboard` | Dashboard stats |
| PATCH | `/user/profile` | Update own profile |
| GET | `/user/followers` · `/user/following` | Own social lists |

### Social
| Method | Endpoint | Description |
|---|---|---|
| GET | `/users` · `/users/{username}` | Public user list / profile |
| POST / DELETE | `/users/{user}/follow` | Follow / unfollow |

### Admin (`admin` role)
| Method | Endpoint | Description |
|---|---|---|
| GET | `/admin/stats` | Platform statistics |
| GET | `/admin/users` | List users |
| PATCH | `/admin/users/{user}/role` | Change role |
| DELETE | `/admin/users/{user}` | Delete user |
| GET / DELETE | `/admin/tags[/{tag}]` | Tag moderation |

---

## Tests

```bash
cd server
php artisan test
```

Feature tests cover the authentication and registration flows
(`server/tests/Feature/Auth`).

---

## Project structure

```
FlowStud/
├── client/                 React 19 + Vite SPA
│   └── src/
│       ├── api/            Axios instance & interceptors
│       ├── context/        AuthContext (token + current user)
│       ├── components/     Navbar, ProtectedRoute, AdminRoute
│       └── pages/          Landing, auth, dashboard, courses,
│                           assignments, sessions, tags, admin, social
└── server/                 Laravel 13 REST API
    ├── app/Http/Controllers/Api    Resource + admin controllers
    ├── app/Http/Middleware         EnsureUserIsAdmin, EnsureEmailIsVerified
    ├── app/Models                  User, Course, Assignment, StudySession,
    │                               SessionItem, Tag
    ├── database/migrations
    ├── database/seeders
    └── routes/                     api.php, auth.php
```

---

## Deployment notes

This repo runs locally out of the box. For a real deployment:

- Serve the built client (`npm run build` → `client/dist`) and the API behind the
  **same origin** (reverse-proxy `/api` to Laravel) to avoid CORS entirely, or add
  the deployed frontend origin to `server/config/cors.php`.
- Make the API base URL configurable via `import.meta.env.VITE_API_URL` instead of
  the hardcoded localhost value.
- Set `APP_ENV=production`, `APP_DEBUG=false`, a fresh `APP_KEY`, and switch from
  SQLite to a persistent database (Postgres / MySQL) if the host filesystem is
  ephemeral.
- Configure a real mail driver for password-reset and email-verification messages.
- Run `php artisan config:cache route:cache` and
  `composer install --no-dev --optimize-autoloader` on the server.

---

## Background

FlowStud started as a university full-stack coursework project (Advanced Web
Programming, ELTE) and was later refactored from a Blade monolith into the
decoupled API + SPA architecture documented here.
