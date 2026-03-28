# Calendly Clone MVP

A fully-functional, SaaS-style multi-user scheduling software inspired by Calendly. Built with a modern tech stack entirely from scratch.

## 🚀 Live Demo
*   **Frontend**: [https://calendlyclone-kh5n.vercel.app](https://calendlyclone-kh5n.vercel.app)
*   **Backend API**: [https://calendlyclone-hq1g.onrender.com/api](https://calendlyclone-hq1g.onrender.com/api)

## 🛠 Tech Stack
*   **Frontend**: React (Vite), React Router v6, Lucide Icons, Vanilla CSS (Glassmorphism & Dark Mode)
*   **Backend API**: Node.js, Express.js, JWT (JSON Web Tokens), bcrypt
*   **Database**: PostgreSQL hosted on NeonDB
*   **ORM**: Prisma

## 🌟 Features
*   **Multi-User SaaS Architecture**: Anyone can register for an account securely.
*   **Personal Booking Links**: Create custom event types (e.g. `15-Min Chat`) attached to your unique `.app/book/username` public profile.
*   **Availability Engine**: Design customized weekly working hours. Double-bookings are automatically blocked if slots conflict with confirmed meetings.
*   **Single Page Application (SPA)**: Ultra-fast state management natively switching views without reload delay via React Router.
*   **Interactive UI**: Smooth hover effects, subtle drop-shadows, dynamic active states, and alert animations create a premium user experience.

## 🔧 Installation & Setup
### 1. Database
Create a PostgreSQL instance on NeonDB and paste the connection string into the backend `.env` file as `DATABASE_URL`.
```bash
> npx prisma db push
```

### 2. Backend
Inside the `/backend` folder, run:
```bash
> npm install
> npm run dev
```

### 3. Frontend
Inside the `/frontend` folder, run:
```bash
> npm install
> npm run dev
```
