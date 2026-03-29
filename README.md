# Medicare+ — Next.js Healthcare Appointment Platform

A production-ready Next.js conversion of the Medicare+ healthcare appointment booking application.

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: JavaScript (JSX)
- **State Management**: Zustand
- **Styling**: CSS Variables + Inline Styles
- **Fonts**: Cabinet Grotesk, Instrument Serif, Geist Mono (Google Fonts)

## Project Structure

```
medicare-app-next/
├── public/                  # Static assets
├── src/
│   ├── app/                 # Next.js App Router pages
│   │   ├── admin/           # Admin dashboard routes
│   │   ├── auth/           # Auth routes (login, register, otp, success)
│   │   ├── doctor/          # Doctor dashboard routes
│   │   └── patient/         # Patient dashboard routes
│   ├── components/
│   │   ├── layout/         # Layout components (Sidebar, DashboardLayout)
│   │   └── ui/             # Shared UI components (Badge, Card, Btn, Modal, etc.)
│   └── lib/
│       ├── config.js        # API configuration & endpoints
│       ├── store.js         # Initial mock data
│       └── store-client.js  # Zustand store (client-side state)
├── .env.local.example      # Environment variables template
├── next.config.js          # Next.js configuration
├── package.json
└── jsconfig.json           # Path aliases (@/*)
```

## Getting Started

### 1. Install Dependencies

```bash
cd medicare-app-next
npm install
```

### 2. Configure Environment

Copy the example env file:

```bash
cp .env.local.example .env.local
```

### 3. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Demo Credentials

| Role    | Email                | Password |
|---------|----------------------|----------|
| Patient | patient@demo.com     | 1234     |
| Doctor  | doctor@demo.com      | 1234     |
| Admin   | admin@demo.com       | 1234     |

## Features

### Patient Portal
- Dashboard with stats overview
- Book appointments with doctor selection
- View & cancel appointments
- View prescriptions
- View lab reports
- Family member management
- Profile management

### Doctor Portal
- Dashboard with patient stats
- Patient consultations
- Availability management (time slot grid)
- Profile management

### Admin Portal
- Platform dashboard with stats
- Verify doctor registrations
- Manage doctors (suspend/activate)
- Manage patients
- All appointments oversight

## API Integration

The app is currently running with mock data. To connect to a real backend:

1. Set `NEXT_PUBLIC_API_BASE_URL` in `.env.local`
2. Replace mock operations in the Zustand store with `apiGet`/`apiPost` calls from `config.js`
3. All API endpoints are pre-configured in `src/lib/config.js`

## Production Deployment

```bash
npm run build
npm start
```

For containerized deployment (Docker/Kubernetes), the `output: 'standalone'` option is enabled in `next.config.js`.

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NEXT_PUBLIC_API_BASE_URL` | Backend API base URL | `http://localhost:5000` |
| `NODE_ENV` | Environment | `development` |
