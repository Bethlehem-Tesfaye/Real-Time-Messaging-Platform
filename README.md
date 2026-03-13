# Real-Time Messaging Platform

A full-stack real-time group messaging app built with React + TypeScript on the frontend and Express + Prisma + PostgreSQL on the backend, with Socket.IO for live events and Redis for pub/sub.

## Features

- Authentication with Better Auth
- Group/room management (create, update, delete, join, leave)
- Real-time room messaging with Socket.IO
- Notifications (message + mention), unread counts, mark-read flows
- Profile and account modules
- Prisma migrations and seeding support

## Tech Stack

- Frontend: React, TypeScript, Vite, TanStack Query, Tailwind, Socket.IO client
- Backend: Node.js, Express, TypeScript, Prisma, PostgreSQL, Redis, Socket.IO
- Tooling: ESLint, Prettier, Vitest

## Project Structure

```text
.
├── frontend/   # React client
└── server/     # Express API + Prisma + Socket server
```

## Prerequisites

- Node.js 20+
- npm 10+
- PostgreSQL
- Redis

## Environment Variables

Create `server/.env`:

```env
PORT=5000
NODE_ENV=development

DATABASE_URL=postgresql://USER:PASSWORD@localhost:5432/rtm_platform
REDIS_URL=redis://localhost:6379

CLIENT_URL=http://localhost:5173

# Better Auth
BETTER_AUTH_BASE_URL=http://localhost:5000
GOOGLE_CLIENT_ID_BAUTH=
GOOGLE_CLIENT_SECRET_BAUTH=

# Email / Google APIs
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_REFRESH_TOKEN=
SENDER_EMAIL=
QSTASH_TOKEN=
EMAIL_API_URL=

# Cloudinary
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
```

Create `frontend/.env`:

```env
VITE_API_URL=http://localhost:5000
```

## Installation

From the repo root:

```bash
cd server
npm install

cd ../frontend
npm install
```

## Database Setup

In `server/`:

```bash
npx prisma migrate dev
npm run seed
```

## Run Locally

Start backend (terminal 1):

```bash
cd server
npm run dev
```

Start frontend (terminal 2):

```bash
cd frontend
npm run dev
```

App URLs:

- Frontend: `http://localhost:5173`
- Backend: `http://localhost:5000`

## Scripts

### Server (`server/package.json`)

- `npm run dev` – run server with nodemon
- `npm run build` – compile TypeScript
- `npm run start` – run compiled server
- `npm run lint` / `npm run lint:fix`
- `npm run test` / `npm run test:run`
- `npm run seed`

### Frontend (`frontend/package.json`)

- `npm run dev` – start Vite dev server
- `npm run build` – type-check + production build
- `npm run lint`
- `npm run preview`

## Troubleshooting

- If backend exits on startup, verify all required `server/.env` variables and that PostgreSQL + Redis are running.
- If realtime events are missing, confirm `REDIS_URL` and `VITE_API_URL` are correct.
- If Prisma errors occur, run `npx prisma migrate dev` again in `server/`.

## Status

Active project under development.
