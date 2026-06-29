# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

---

## Stack

| Layer | Technology |
|---|---|
| Backend | Laravel **12**, PHP 8.3, PostgreSQL, Laravel Sanctum |
| Frontend | Next.js **14** (App Router), TypeScript, Tailwind CSS, TanStack Query v5 |
| Testing | Pest (backend), `npm run build` / `tsc --noEmit` (frontend type-check) |
| Formatting | Laravel Pint (backend), ESLint + Prettier (frontend) |

> **Note:** Laravel 12 is used (not 11). All Laravel 11 versions have security-advisory blocks in Composer as of mid-2026.

---

## Commands

### Backend (`cd backend`)

```bash
# PHP and Composer are not in the default PATH on this machine — always prefix:
$env:PATH = [System.Environment]::GetEnvironmentVariable("PATH","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("PATH","User")

# Install dependencies
php "C:\Users\Willian\AppData\Local\Programs\composer\composer.phar" install

# Run all tests (uses in-memory SQLite — no DB setup needed)
php artisan test

# Run a single test file
php artisan test tests/Feature/TicketTest.php

# Run a single test by description
php artisan test --filter "lets admin delete a ticket"

# Migrate and seed
php artisan migrate --seed

# Format with Pint
php artisan pint
```

### Frontend (`cd frontend`)

```bash
# Install dependencies
npm install

# Dev server
npm run dev        # http://localhost:3000

# Type-check without emitting
npx tsc --noEmit

# Production build (the canonical correctness check)
npm run build

# Lint
npm run lint
```

---

## Monorepo Structure

```
itsm-lite/
├── backend/          # Laravel 12 API
│   ├── app/
│   │   ├── Enums/            # TicketStatus, TicketPriority, UserRole (backed string enums)
│   │   ├── Http/
│   │   │   ├── Controllers/  # AuthController, TicketController, CommentController,
│   │   │   │                 # UserController, CategoryController, StatsController
│   │   │   ├── Requests/     # One FormRequest per create/update action
│   │   │   └── Resources/    # UserResource, TicketResource, CommentResource, CategoryResource
│   │   ├── Models/           # User, Ticket, Comment, Category
│   │   └── Policies/         # TicketPolicy, CommentPolicy, UserPolicy
│   ├── database/
│   │   ├── factories/        # UserFactory (.admin()/.agent() states), TicketFactory (.open() etc.)
│   │   ├── migrations/
│   │   └── seeders/          # RolesSeeder, CategorySeeder, TicketSeeder
│   ├── routes/api.php        # All routes under /api/v1/
│   └── tests/Feature/        # 42 Pest feature tests (Auth, Ticket, Comment, User, Category, Stats)
└── frontend/         # Next.js 14 App Router
    └── src/
        ├── app/
        │   ├── (auth)/       # Login page, centered-card layout
        │   └── (dashboard)/  # All protected pages, sidebar layout
        ├── components/
        │   ├── layout/       # Sidebar (client component)
        │   └── ui/           # Button, Badge, Input, Textarea, Select, Modal, Spinner, EmptyState
        ├── hooks/            # TanStack Query hooks (useAuth, useTickets, useComments, useUsers, useCategories)
        ├── lib/
        │   ├── api.ts        # Axios instance with auth interceptors
        │   └── auth.ts       # localStorage + cookie helpers
        ├── middleware.ts     # Cookie-based auth guard
        ├── providers/        # QueryProvider (client-side)
        └── types/index.ts    # All TypeScript interfaces
```

---

## Backend Architecture

### Request → Response Flow
Every request follows: **Route → FormRequest (validates) → Controller → Policy (authorizes) → Model → Resource (serializes)**

The base `Controller` includes the `AuthorizesRequests` trait (Laravel 12 stripped it from the default). Every controller action calls `$this->authorize()` before touching data.

### Auth
Sanctum token-based (not session/cookie). Login returns a token; all subsequent requests send `Authorization: Bearer <token>`. Tests use `actingAs($user)` which works with Sanctum via `TransientToken`.

The logout action checks `instanceof PersonalAccessToken` before deleting — `actingAs()` in tests sets a `TransientToken` with no DB record, so calling `delete()` directly on the return of `currentAccessToken()` would fail in tests.

### Response Format
All responses use `JsonResource` / `ResourceCollection` — never raw Eloquent. Paginated lists include a `meta` key with `current_page`, `last_page`, `total`.

### Authorization Rules
- **TicketPolicy:** regular users see/edit only their own tickets; agents/admins see all; only admins delete
- **CommentPolicy:** ticket participants (requester, assignee) + agents/admins can comment; agents/admins or the author can delete
- **UserPolicy:** all CRUD is admin-only; an admin cannot delete themselves (`$user->id !== $model->id`)

### Testing
Tests run against in-memory SQLite (configured in `phpunit.xml`). Use `RefreshDatabase` via `Pest.php`. Factories have named states: `User::factory()->admin()`, `User::factory()->agent()`, `Ticket::factory()->open()`, etc.

---

## Frontend Architecture

### Auth Token Storage
The token is stored in **both** `localStorage` (for Axios Bearer header) and a cookie named `itsm_token` (for Next.js middleware server-side checks). Both are written together in `lib/auth.ts::setToken()` and cleared together in `clearAuth()`.

### Middleware
`src/middleware.ts` reads the `itsm_token` cookie. Unauthenticated requests to protected routes redirect to `/login?from=<path>`. Already-authenticated users hitting `/login` redirect to `/dashboard`.

### API Client
`lib/api.ts` — Axios instance with `baseURL: NEXT_PUBLIC_API_URL/api/v1`. Request interceptor attaches Bearer token from localStorage. Response interceptor on 401 calls `clearAuth()` and redirects to `/login`.

### TanStack Query Keys
```ts
['user']                        // current user (from /auth/me)
['tickets', filters]            // paginated ticket list
['tickets', id]                 // single ticket
['tickets', 'stats']            // dashboard stats
['tickets', ticketId, 'comments'] // comments for a ticket
['users']                       // user list (admin)
['categories']                  // category list (staleTime: Infinity)
```

### Component Conventions
- `'use client'` is required on any component using hooks, event handlers, or browser APIs
- All hooks files start with `'use client'` at the top
- UI components (`components/ui/`) are server-compatible by default; `Modal` is the exception (`'use client'`)
- Sidebar is a client component (uses `usePathname`, `useCurrentUser`, `useLogout`)
- Dashboard layout is a server component that imports the client Sidebar
- Extract to a new component when a file exceeds ~120 lines

### Role-Gated Rendering
Read `user.role` from the query cache (`useCurrentUser()`) to conditionally render admin-only UI. The `/users` nav item in Sidebar is already filtered by `user?.role === 'admin'`.

---

## Environment Variables

### Backend (`backend/.env`)
```
DB_CONNECTION=pgsql
DB_HOST=127.0.0.1
DB_PORT=5432
DB_DATABASE=itsm_lite
DB_USERNAME=postgres
DB_PASSWORD=secret
SANCTUM_STATEFUL_DOMAINS=localhost:3000
FRONTEND_URL=http://localhost:3000
```

### Frontend (`frontend/.env.local`)
```
NEXT_PUBLIC_API_URL=http://localhost:8000
```

---

## Key Invariants

- **No `any` in TypeScript** — all types are in `src/types/index.ts`
- **No raw Eloquent in responses** — always a Resource or ResourceCollection
- **No validation in controllers** — always a FormRequest class
- **Every new API route** needs a corresponding TanStack Query hook
- **Every new hook** must use the correct query key from the table above
- **Policy check on every controller action** — `$this->authorize()` is mandatory, not optional
