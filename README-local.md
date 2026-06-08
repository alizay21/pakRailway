<<<<<<< HEAD
# PakRail (React + Express + MongoDB)

A train booking web application.

## Tech stack
- Frontend: React + Vite
- Backend: Node.js + Express
- Database: MongoDB (Mongoose)
- Auth: JWT

## Prerequisites
- Node.js 18+ (recommended)
- MongoDB running (local or hosted)

## Setup (local development)
### 1) Backend
```bash
cd server
cp .env.example .env
npm ci
npm run dev
```
- Server will run on `PORT` (default `5000`).

### 2) Frontend
In another terminal:
```bash
cd client
npm ci
npm run dev
```
- Frontend runs on Vite (default `5173`).
- In development, Vite proxies `/api` to the backend.

## Production-like setup (single deploy)
This repo is configured so the backend can serve the built frontend.

### Build frontend + start server
```bash
cd client
npm ci
npm run build

cd ../server
npm ci
NODE_ENV=production npm start
```
Backend will serve:
- API under `/api/*`
- Frontend under `/` (from `client/dist`)

## Environment variables (backend)
Copy `server/.env.example` to `server/.env` and set:
- `MONGO_URI`
- `JWT_SECRET`
- `JWT_EXPIRE`
- `PORT`

## GitHub
Commit **no secrets**. `server/.env` is ignored by `.gitignore`.

=======
# pakRailway
>>>>>>> a762c5df1b1efc7644aafd2460639562321a4032
