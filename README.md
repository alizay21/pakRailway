# Pak Railway

Pak Railway is a full-stack railway booking web application for searching trains, selecting seats, booking tickets, managing reservations, tracking PNR status, and supporting administrative train and booking management.

## Overview

The project is organized as a React/Vite frontend in `client/` and a Node.js/Express backend in `server/`. The backend exposes REST API routes for authentication, trains, bookings, payments, and admin workflows, using MongoDB through Mongoose models.

## Features

- User registration and login with JWT-based authentication.
- Train search and results pages for passenger booking flows.
- Seat selection, passenger details, payment, and booking confirmation pages.
- PNR tracking and user booking history.
- Admin dashboard pages for trains, bookings, reports, and operational management.
- English and Urdu locale files for multilingual interface support.
- Production mode where the Express server can serve the built frontend.

## Tech Stack

- Frontend: React 18, Vite, React Router, Axios, Tailwind CSS, i18next, Recharts, Lucide React.
- Backend: Node.js, Express, Mongoose, JWT, bcryptjs, dotenv, CORS.
- Database: MongoDB.
- Tooling: npm, Vite, nodemon, c8.

## Project Structure

```text
pakrailway/
  client/              React/Vite frontend
    src/
      components/      Shared UI components
      context/         Auth context
      locales/         Translation files
      pages/           Passenger and admin pages
  server/              Express backend
    config/            Database connection
    controllers/       API request handlers
    middleware/        Auth middleware
    models/            Mongoose schemas
    routes/            Express route modules
```

## Prerequisites

- Node.js 18 or newer.
- npm.
- MongoDB connection string for a local or hosted MongoDB database.

## Setup

These instructions cover local development for both application layers.

1. Install backend dependencies.

   ```bash
   cd server
   npm ci
   ```

2. Create a backend environment file at `server/.env`.

   ```env
   MONGO_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret
   JWT_EXPIRE=30d
   PORT=5000
   ```

3. Start the backend development server.

   ```bash
   npm run dev
   ```

4. In a second terminal, install and run the frontend.

   ```bash
   cd client
   npm ci
   npm run dev
   ```

5. Open the Vite development URL shown in the terminal, commonly `http://localhost:5173`.

## Usage

- Register or log in as a passenger.
- Search available trains and choose a suitable option.
- Select seats, enter passenger details, complete payment, and confirm the booking.
- Use the PNR tracking page to check booking status.
- Use admin pages to manage trains, bookings, and reports when logged in with an authorized admin account.

## Production Build

Build the frontend and start the backend in production mode:

```bash
cd client
npm ci
npm run build

cd ../server
npm ci
NODE_ENV=production npm start
```

In production mode, the backend serves API routes under `/api/*` and can serve the frontend build from `client/dist`.

## GitHub Workflow Summary

- `main` is the stable branch for release-ready work.
- `dev` is the shared integration branch where reviewed feature, documentation, and workflow updates are staged before release.
- Feature branches use descriptive names such as `feature-readme-improvements` or `feature-contributing-guidelines`.
- Pull requests should target `dev` first, include related issue links, and document checks performed.
- After validation, `dev` can be merged into `main` for a tagged release.

## Version and Release Notes

### v1.0.0

- Added professional repository documentation.
- Added contribution workflow guidance.
- Added GitHub workflow lab structure with branch, issue, pull request, conflict-resolution, and release evidence.
- Confirmed the project structure for a React/Vite frontend and Express/MongoDB backend.
