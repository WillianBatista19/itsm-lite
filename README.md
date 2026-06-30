# ITSM Lite

A lightweight IT Service Management (helpdesk) system for managing support tickets, built as a portfolio project. Users can open tickets, agents and admins can manage them, and everyone can track status, priority, and discussion through comments.

🔗 **Live demo:** https://itsm-lite-nyql.vercel.app
**Test login:** `admin@itsm.local` / `password`

> Note: the backend runs on a free Render instance and may take ~50 seconds to wake up on the first request.

---

## Features

- Token-based authentication with Laravel Sanctum
- Role-based access control (Admin, Agent, User)
- Full ticket CRUD with status, priority, and category
- Comment threads on tickets
- Dashboard with real-time stats (open, in progress, resolved today, by priority)
- User management (admin only)
- Filterable and searchable ticket list

---

## Tech Stack

**Backend**
- Laravel 12
- PostgreSQL
- Laravel Sanctum (authentication)
- Pest (testing)

**Frontend**
- Next.js 14 (App Router)
- TypeScript
- TanStack Query
- Tailwind CSS
- React Hook Form + Zod

**Infrastructure**
- Backend deployed on [Render](https://render.com) (Docker)
- Frontend deployed on [Vercel](https://vercel.com)
- Database: PostgreSQL on Render

---

## Project Structure

```
itsm-lite/
├── backend/        # Laravel API
└── frontend/        # Next.js app
```

---

## Running Locally

### Prerequisites
- PHP 8.3+
- Composer
- Node.js 18+
- PostgreSQL (or MySQL)

### Backend

```bash
cd backend
composer install
cp .env.example .env
php artisan key:generate
php artisan migrate --seed
php artisan serve
```

### Frontend

```bash
cd frontend
npm install
cp .env.local.example .env.local
npm run dev
```

The app will be available at `http://localhost:3000`, consuming the API at `http://localhost:8000`.

---

## Test Credentials

| Role  | Email              | Password |
|-------|--------------------|----------|
| Admin | admin@itsm.local   | password |
| Agent | agent1@itsm.local  | password |
| User  | user1@itsm.local   | password |

---

## Roles & Permissions

- **User** — can create and view their own tickets, comment on them
- **Agent** — can view and update all tickets, assign tickets, comment
- **Admin** — full access, including user management and ticket deletion

---

## License

This project was built for portfolio purposes and is free to use as a reference.
