# HealthSync

A full-stack healthcare management platform built as a thesis project. HealthSync connects patients, doctors, and administrators through a unified dashboard for appointment booking, medical records, and clinic operations.

---

## Features

### Patients
- Book appointments online with Stripe payment integration
- View and manage upcoming/past appointments
- Access personal medical records and prescriptions
- Leave reviews for completed appointments
- Real-time in-app notifications (booking confirmations, status updates, new records)
- Two-factor authentication via email OTP

### Doctors
- Manage appointment schedule and availability (per day of week)
- View assigned appointments and patient records
- Create and update medical records (diagnosis, treatment, prescription, notes)
- Export medical records as PDF

### Administrators
- Full user management (create, update roles, delete)
- Manage clinic services and doctor assignments
- View all appointments and medical records across the system
- Analytics dashboard with KPI cards, revenue trends, appointment volume, and service breakdowns

---

## Tech Stack

**Frontend**
- React 19 + TypeScript
- Vite
- Tailwind CSS v4
- React Router v7
- TanStack Query v5
- Recharts

**Backend**
- Node.js + Express + TypeScript
- MongoDB + Mongoose
- JWT authentication + bcrypt
- Stripe (payment processing)
- Nodemailer (transactional emails)
- Multer + Sharp (image uploads)

---

## Project Structure

```
HealthSync/
├── backend/          # Express API
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   └── utils/
├── frontend/         # React app
│   └── src/
│       ├── components/
│       ├── features/
│       ├── services/
│       └── types/
└── diagrams/         # UML use-case diagrams
```

---

## Getting Started

### Prerequisites
- Node.js 18+
- MongoDB Atlas account (or local MongoDB)
- Stripe account
- Gmail account (for email notifications)

### Backend Setup

```bash
cd backend
npm install
```

Create a `config.env` file in the `backend/` directory:

```env
NODE_ENV=development
PORT=3000
FRONTEND_URL=http://localhost:5173

DATABASE=your_mongodb_connection_string
DATABASE_PASSWORD=your_db_password

JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=90d
JWT_COOKIE_EXPIRES_IN=90

EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USERNAME=your_email@gmail.com
EMAIL_PASSWORD=your_app_password
EMAIL_FROM=your_email@gmail.com

STRIPE_SECRET_KEY=your_stripe_secret_key
```

Start the server:

```bash
npm run dev
```

The API will be available at `http://localhost:3000`.

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

The app will be available at `http://localhost:5173`.

---

## API Overview

| Resource | Base Route |
|---|---|
| Auth | `/api/v1/users` |
| Services | `/api/v1/services` |
| Appointments | `/api/v1/appointments` |
| Medical Records | `/api/v1/medical-records` |
| Reviews | `/api/v1/reviews` |
| Notifications | `/api/v1/notifications` |

---

## User Roles

| Role | Access |
|---|---|
| `USER` | Patient-facing features |
| `DOCTOR` | Clinical tools + patient records |
| `ADMIN` | Full system access + analytics |
