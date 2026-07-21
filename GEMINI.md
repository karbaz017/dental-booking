# Gemini Workspace Context

This file serves as the directory map and technical reference for AI agents working in this repository.

## Tech Stack
*   **Framework**: Next.js 16 (App Router)
*   **Language**: TypeScript
*   **Database ORM**: Prisma v6.19.0 (PostgreSQL client)
*   **Styling**: Tailwind CSS v4 + Vanilla CSS custom variables
*   **Authentication**: Auth.js / NextAuth (v5 beta)
*   **Email Deliverability**: Resend API Integration

## Directory Structure & Code Map

### Core Architecture
*   **[prisma/schema.prisma](file:///Users/arbaz/Projects/dental-booking/prisma/schema.prisma)**: The PostgreSQL database schema definition. Contains tables for users/auth, family members, insurance profiles, appointments, appointment reminders, and in-app chat.
*   **[src/auth.ts](file:///Users/arbaz/Projects/dental-booking/src/auth.ts)**: Configures NextAuth adapter and handlers.
*   **[src/middleware.ts](file:///Users/arbaz/Projects/dental-booking/src/middleware.ts)**: Intercepts and guards routes based on user session roles.

### Routing (`src/app/`)
*   **`page.tsx`**: Public marketing page.
*   **`register/`**: Patient registration.
*   **`login/`**: Patient sign-in.
*   **`staff/`**: Staff portals (logins, dashboard, scheduler).
*   **`dashboard/`**: Patient dashboard for booking and family management.
*   **`api/cron/reminders/`**: HTTP endpoint triggering simulated automated reminder checks.

### Libraries & Business Logic (`src/lib/`)
*   **`prisma.ts`**: Global Prisma client singleton.
*   **`require-patient.ts` & `require-staff.ts`**: Route protection helpers verifying active roles. `requireStaff()` redirects if the staff member does not have an assigned department.
*   **`chat-access.ts`**: Custom authorization rules for direct messaging. resticts DMs to Patients <-> Front Desk and Staff <-> Staff only. Includes lexicographical `makePairKey` logic.
*   **`appointment-scheduling.ts`**: Configures default slot intervals (45 mins) and functions to build reminder dates.
*   **`process-due-reminders.ts`**: Script/core logic querying upcoming appointment reminders (T-7d, T-1d) and processing them.
*   **`reminder-delivery.ts`**: Interface for sending notifications (falls back to console log in development, sends email via Resend in production).
*   **`reminder-email-templates.ts`**: Text copy templates for reminder emails.

### Utility Scripts
*   **`scripts/run-reminders.ts`**: CLI entrypoint to trigger reminders manually (`npm run reminders:run`).

## Environment Configurations (`.env`)
*   **`DATABASE_URL`**: PostgreSQL connection string. Defaults to a local docker/brew postgres instance.
*   **`AUTH_SECRET`**: Secret string for session signatures. Generated in production using `openssl rand -base64 32`.
*   **`STAFF_REGISTRATION_CODE`**: Required passphrase for registering new clinic staff at `/staff/register`. Registration is disabled if this is unset.
*   **`CRON_SECRET`**: API token guarding the `/api/cron/reminders` endpoint in production. Checked in headers as a Bearer token.
*   **`RESEND_API_KEY` & `RESEND_FROM_EMAIL`**: Required for transactional email delivery in production. In development, logs print to the terminal when these are omitted.

