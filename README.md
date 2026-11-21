# LeadFlow CRM — Lead Manager

A production-grade full-stack sales lead manager built with **Next.js 16 (App Router)**, **React 19.3**, **Tailwind CSS v4**, **Motion v14**, **Express 5 (TypeScript)**, and **SQLite (`better-sqlite3` v13)**, managed as a **pnpm 12 workspace**.

---

## Features

### Core
- **Add Lead**: Capture `name`, `email`, `phone`, `company`, `source` (dropdown), and `status` (`New`, `Contacted`, `Qualified`, `Lost`).
- **Leads Table & Card Grid**: Switch seamlessly between a full data table and a mobile-friendly responsive card grid, with outlined status badges and inline quick-status updates.
- **Edit Lead**: Animated spring modal for updating any lead field or pipeline status.
- **Delete Lead**: Dedicated confirmation modal before permanent removal.
- **Search & Multi-Filter**: Global `⌘K` / `Ctrl+K` debounced search by name, email, or company, combined with server-side status and source filters.
- **Dual-Layer Validation**: Instant client-side validation plus strict backend Zod schemas returning structured field-level errors.

### Bonus & UI Polish
- **Dark & Light Mode**: Obsidian dark-first CRM aesthetic with one-click theme toggle, `localStorage` persistence, and zero-FOUC hydration.
- **Smooth Animations**: Powered by `motion/react` (`MotionConfig reducedMotion="user"`) for spring modals, mobile sidebar drawer, staggered KPI cards, and toast notifications.
- **Mobile-First Responsive Shell**: Collapsible desktop sidebar, slide-over mobile drawer, and automatic card grid default on small screens.
- **Authentication & Data Isolation**: JWT-based signup/login (`bcryptjs` password hashing) so each user sees and manages only their own leads.
- **Pagination & Sorting**: Server-side pagination and column sorting (`name`, `company`, `status`, `created_at`).
- **Status Summary Dashboard**: Clickable KPI cards showing total leads and counts per status.
- **Automated API Tests**: End-to-end REST API test suite with Vitest + Supertest against an in-memory SQLite database.

---

## Tech Stack & Why

| Layer | Choice | Rationale |
|---|---|---|
| **Frontend** | Next.js 16 (App Router), React 19.3, TypeScript, Tailwind CSS v4, Motion v14 | Modern React/Next.js stack with CSS-first Tailwind v4 (`@tailwindcss/postcss`), hardware-accelerated UI animations, and zero-bloat responsive components. |
| **Backend** | Express 5, TypeScript, Zod, Helmet, Rate Limit | Native async error handling in Express 5, strict runtime validation, and production security defaults. |
| **Database** | SQLite (`better-sqlite3` v13) | Zero-infrastructure relational DB with WAL mode, foreign keys, `CHECK` constraints, and composite indexes for fast filtered queries. |
| **Testing** | Vitest + Supertest | Fast, isolated API integration tests running against `:memory:` SQLite with zero external test dependencies. |
| **Package Manager** | pnpm 12 Workspaces | Fast, disk-efficient installs with a single root `pnpm install` and parallel dev scripts. |

---

## Folder Structure

```text
lead-manager/
├── backend/
│   ├── src/
│   │   ├── config/          # Environment validation & SQLite schema/indexes
│   │   ├── controllers/     # Express 5 HTTP request/response handlers
│   │   ├── middleware/      # JWT auth, Express 5 Zod validation, global error handler
│   │   ├── routes/          # Express 5 route definitions
│   │   ├── services/        # Business logic & parameterized SQLite queries
│   │   ├── validators/      # Zod schemas for auth & leads
│   │   ├── app.ts           # Express app factory (imported by server & tests)
│   │   └── server.ts        # HTTP server + graceful shutdown
│   ├── tests/api.test.ts    # Automated API integration tests
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── app/             # Next.js 16 App Router pages (/, /login, /register)
│   │   ├── components/      # Modular UI (Sidebar, Topbar, StatsCards, LeadsTable, Modals, Toast)
│   │   ├── context/         # AuthContext & ThemeContext (Dark/Light mode)
│   │   ├── lib/             # Typed API client & validation helpers
│   │   └── types/           # Shared TypeScript interfaces & constants
│   ├── next.config.ts       # Next.js 16 TypeScript config
│   ├── postcss.config.mjs   # Tailwind CSS v4 PostCSS plugin
│   └── .env.example
├── pnpm-workspace.yaml      # pnpm workspace & native build allowlist
├── package.json             # Root workspace scripts
└── README.md
```

---

## Running Locally

### Prerequisites
- Node.js 20.9+
- pnpm 10+ (recommended: `corepack enable` for pnpm 12)

### 1. Install dependencies
```bash
pnpm install
```

### 2. Configure environment variables
```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env.local
```
> Update `JWT_SECRET` in `backend/.env` before deploying to production.

### 3. Start backend and frontend
Run both servers concurrently from the root:
```bash
pnpm dev
```
Or run them individually in separate terminals:
```bash
# Terminal 1 — Express API on http://localhost:5000
pnpm dev:backend

# Terminal 2 — Next.js App on http://localhost:3000
pnpm dev:frontend
```

### 4. Run automated API tests & typecheck
```bash
pnpm test
pnpm typecheck
```

---

## API Overview

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/api/health` | Public | Service health check |
| `POST` | `/api/auth/register` | Public | Create user account and return JWT |
| `POST` | `/api/auth/login` | Public | Authenticate user and return JWT |
| `GET` | `/api/auth/me` | Bearer | Return authenticated user profile |
| `GET` | `/api/leads` | Bearer | List leads (`search`, `status`, `source`, `sortBy`, `sortOrder`, `page`, `limit`) |
| `GET` | `/api/leads/stats` | Bearer | Total leads and counts grouped by status |
| `POST` | `/api/leads` | Bearer | Create a new lead |
| `GET` | `/api/leads/:id` | Bearer | Fetch a single lead owned by the user |
| `PATCH` / `PUT` | `/api/leads/:id` | Bearer | Update lead fields or status |
| `DELETE` | `/api/leads/:id` | Bearer | Permanently delete a lead |

---

## Assumptions Made

- **Single-tenant user workspaces**: Each registered sales user manages their own private leads list rather than sharing a global team pipeline.
- **Token storage**: JWTs are stored in `localStorage` to keep cross-origin local development (`localhost:3000` -> `localhost:5000`) simple; in a same-domain production setup, `HttpOnly` cookies would be preferred.
- **Optional fields**: `phone` and `company` are optional so users can quickly log early-stage leads with just a name, email, and source.

## What I Would Improve With More Time

- **HttpOnly Cookie Auth & Refresh Tokens**: Move JWTs from `localStorage` into `HttpOnly`, `SameSite=Lax` cookies with short-lived access tokens and rotating refresh tokens.
- **Database Migrations**: Add a lightweight SQL migration runner instead of `CREATE TABLE IF NOT EXISTS` for zero-downtime schema evolution.
- **Activity Notes & CSV Export**: Let sales reps log follow-up notes per lead and export filtered views to CSV.
- **Frontend Tests & CI**: Add Playwright E2E tests and a GitHub Actions workflow running typecheck, build, and API tests on every push.

## Reflection Note

Separating the Express 5 app factory (`createApp(db)`) from `server.ts` made the backend clean to test against an in-memory SQLite database with zero mocking. On the frontend, pairing Tailwind CSS v4's `@custom-variant dark` with a tiny pre-hydration script prevented dark-mode flicker, while keeping a clean collapsible sidebar and responsive card grid made mobile and desktop views feel equally native.
