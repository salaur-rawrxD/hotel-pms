# Hotel PMS

A full-stack Hotel Property Management System.

- **Client**: React 18 + Vite + Tailwind CSS + React Router + React Query + Zustand
- **Server**: Node.js + Express + Prisma + SQLite (dev) / PostgreSQL (prod) + JWT auth + Zod validation
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
- **Local dev:** no database setup required — SQLite is used out of the box
  (`server/src/prisma/dev.db` is created automatically).
- **Production:** switch to PostgreSQL by changing `provider` to `"postgresql"`
  in `server/src/prisma/schema.prisma`, then update `DATABASE_URL` to a
  Postgres URL. You'll also want to replace the JSON-encoded `amenities`
  field with a native `String[]` at the same time.

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
| Admin         | admin@meridian.com           |
| Manager       | manager@meridian.com         |
| Front Desk    | frontdesk1@meridian.com      |
| Front Desk    | frontdesk2@meridian.com      |
| Housekeeping  | housekeeping1@meridian.com   |
| Housekeeping  | housekeeping2@meridian.com   |

## Health checks after first boot

1. `GET http://localhost:3001/api/health` returns `{ status: "ok" }`
2. `POST http://localhost:3001/api/auth/login` with seeded credentials returns a JWT
3. `GET http://localhost:3001/api/rooms` (with `Authorization: Bearer <token>`) returns the 48 seeded rooms
4. http://localhost:5173 loads the login page
