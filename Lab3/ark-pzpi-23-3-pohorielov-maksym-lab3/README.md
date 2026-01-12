# FeedMate Backend (JS) — Lab #2 Skeleton

Tech: **Node.js + Express + MSSQL (mssql package)**

## 1) Install
```bash
npm i
cp .env.example .env
```

## 2) Run
```bash
npm run dev
# or
npm start
```

## 3) DB
- Create your tables in SQL Server first (USERS, PETS, DEVICES, ...).
- Then set `.env` to point to your SQL Server instance.

## 4) Endpoints (starter)
- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/pets`
- `POST /api/pets`
- `DELETE /api/pets/:id`
- `GET /api/pets/:petId/schedules`
- `POST /api/pets/:petId/schedules`
- `POST /api/pets/:petId/feed-now`
- `GET /api/pets/:petId/history`
- `GET /api/notifications/user`
- `PATCH /api/notifications/user/:id/read`
- `POST /api/iot/status`
- `POST /api/iot/event`

> This is a clean layered structure: **routes → controllers → services → repositories → DB**.
