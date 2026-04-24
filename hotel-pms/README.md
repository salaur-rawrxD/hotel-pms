# Hotel PMS

A full-stack Hotel Property Management System.

- **Client**: React 18 + Vite + Tailwind CSS + React Router + React Query + Zustand
- **Server**: Node.js + Express + Prisma + PostgreSQL + JWT auth + Zod validation
- **Shared**: Common constants/types consumed by both apps

## Project Structure

```
hotel-pms/
├── client/     # React frontend (Vite)
├── server/     # Node/Express API
├── shared/     # Shared constants and type shapes
├── .env.example
├── .gitignore
└── README.md
```

## Prerequisites

- Node.js 18+
- PostgreSQL 14+ running locally (or update `DATABASE_URL` for your setup)

## First-time setup

```bash
# 1. Copy env files
cp .env.example .env
cp .env.example server/.env
cp .env.example client/.env

# 2. Install all dependencies
npm run install:all

# 3. Create the database schema
npm run migrate

# 4. Seed mock data
npm run seed
```

## Run everything

```bash
npm run dev
```

- API → http://localhost:3001
- Web → http://localhost:5173

## Useful scripts

| Script              | What it does                              |
| ------------------- | ----------------------------------------- |
| `npm run dev`       | Start server + client concurrently        |
| `npm run migrate`   | Run Prisma migrations (dev)               |
| `npm run seed`      | Seed the database with mock hotel data    |
| `npm run studio`    | Open Prisma Studio to browse the DB       |
| `npm run generate`  | Regenerate the Prisma client              |

## Default seeded logins (password: `password123`)

| Role          | Email                         |
| ------------- | ----------------------------- |
| Admin         | admin@meridian.test           |
| Manager       | manager@meridian.test         |
| Front Desk    | frontdesk1@meridian.test      |
| Front Desk    | frontdesk2@meridian.test      |
| Housekeeping  | housekeeping1@meridian.test   |
| Housekeeping  | housekeeping2@meridian.test   |

## Health checks after first boot

1. `GET http://localhost:3001/api/health` returns `{ status: "ok" }`
2. `POST http://localhost:3001/api/auth/login` with seeded credentials returns a JWT
3. `GET http://localhost:3001/api/rooms` (with `Authorization: Bearer <token>`) returns the 48 seeded rooms
4. http://localhost:5173 loads the login page
