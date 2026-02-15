# Delivery App MVP

A simple delivery application built with React, Node.js, Express, and PostgreSQL.

## Structure

- `backend`: Node.js API with Express and Prisma.
- `frontend`: React application (Vite).

## Setup

### Backend

1.  Navigate to `backend`: `cd backend`
2.  Install dependencies: `npm install`
3.  Setup environment variables (copy `.env.example` to `.env`).
4.  Run migrations: `npx prisma migrate dev`
5.  Seed database: `node prisma/seed.js`
6.  Start server: `npm run dev`

### Frontend

1.  Navigate to `frontend`: `cd frontend`
2.  Install dependencies: `npm install`
3.  Start app: `npm run dev`
