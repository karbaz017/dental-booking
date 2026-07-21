# Specification: DentalCare Booking Application

DentalCare Booking is a Next.js (App Router) demo application built to simulate a dental appointment scheduling portal for US dental practices.

---

## 1. Product Scope & Functional Goals

### Patient Features
*   **Self-registration & Login**: Secure account creation and role-based login.
*   **Family Group Management**: Patients can add and manage family members, scheduling appointments on their behalf.
*   **Insurance Profiling**: Capture subscriber info, member ID, carrier, and group numbers.
*   **Self-Service Scheduling**: Browse available slots, pick a provider, set department, specify visit reason, and book.
*   **Secure Direct Messaging**: Chat directly with dental office staff.

### Staff Features (Clinicians, Front Desk, Supervisors)
*   **Dynamic Dashboard**: Overview of today's schedule, with role-based filters (e.g., General Dentistry, Orthodontics).
*   **CRUD Actions**: Front desk and supervisors can schedule, reschedule, cancel, or complete appointments.
*   **Emergency Flags**: Highlight emergency visits so clinicians can prioritize chair time.
*   **Staff-to-Staff DMs**: Secure direct messaging between different staff members.

### Reminder System
*   **Cron Job Trigger**: Automated HTTP endpoint (`/api/cron/reminders`) and CLI command (`npm run reminders:run`) processing due reminders.
*   **Multi-window reminders**: Triggers alerts at two specific milestones:
    *   **T-7 days** (one week before appointment)
    *   **T-1 day** (one day before appointment)
*   **Delivery Integration**: Consoles logs in local development; delivers email alerts via Resend in production.

---

## 2. Technical Stack
*   **Frontend & Routing**: Next.js 16 (App Router with Server/Client component design).
*   **Styling**: Tailwind CSS v4.
*   **Database & Schema**: Prisma v6.19.0 mapping PostgreSQL tables.
*   **Authentication**: Auth.js / NextAuth (v5 beta) using credentials provider.
*   **Email Deliverability**: Resend integration.

---

## 3. Database Schema Models

The schema defined in [schema.prisma](file:///Users/arbaz/Projects/dental-booking/prisma/schema.prisma) covers:
*   **`User`**: Core accounts, passwords, profile details, and role enums (`PATIENT`, `FRONT_DESK`, `SUPERVISOR`, `DOCTOR`).
*   **`FamilyMember`**: Tracks patient dependents/family members (DOB, relationship).
*   **`Insurance`**: Holds insurance details linked to a patient user.
*   **`Appointment`**: Connects patient (or family member) with a doctor, start/end times, emergency flags, status (`SCHEDULED`, `CONFIRMED`, `CANCELLED`, `COMPLETED`, `NO_SHOW`), reason, and notes.
*   **`AppointmentReminder`**: Tracks the status and scheduled time (`fireAt`, `sentAt`) for the `SEVEN_DAYS` and `ONE_DAY` notification windows.
*   **`ChatThread` / `ChatParticipant` / `ChatMessage`**: Implements chat capabilities. The `pairKey` is generated lexicographically to guarantee unique 2-person direct message threads.

---

## 4. Current Feature Status & Verification Progress

All core components and workflows in the DentalCare Booking system have been successfully implemented and verified:

### Patient Portal Features
*   **[Completed & Verified]** **Self-registration & Login**: Fully implemented via NextAuth.js credentials flow at `/register` and `/login`.
*   **[Completed & Verified]** **Family Group Management**: Dependents can be added/edited via `/dashboard/family`. Tested to ensure cascade database deletion works correctly.
*   **[Completed & Verified]** **Insurance Profiles**: Patients can manage active carrier files via `/dashboard/insurance`.
*   **[Completed & Verified]** **Self-Service Appointment Scheduling**: Multi-step calendar booking flow via `/dashboard/appointments/new`. Verified that booking a slot creates corresponding `SEVEN_DAYS` and `ONE_DAY` reminder logs in the database.
*   **[Completed & Verified]** **Direct Messaging**: Patient-to-Front Desk messaging in `/dashboard/chat` using the secure `pairKey` logic.

### Staff Dashboard Features
*   **[Completed & Verified]** **Operational Dashboard**: Calendar scheduling, doctor list assignments, and department filters in `/staff/dashboard`.
*   **[Completed & Verified]** **Status Transitions**: Front desk and supervisors can modify appointment status to `CONFIRMED`, `CANCELLED`, `COMPLETED`, or `NO_SHOW`.
*   **[Completed & Verified]** **Emergency Visits Flagging**: Immediate visually highlighted emergency indicators on the scheduler grid.
*   **[Completed & Verified]** **Staff-to-Staff DMs**: Fully functional direct messaging at `/staff/dashboard/chat`.

### Appointment Reminders
*   **[Completed & Verified]** **Offline Reminder CLI Job**: CLI task execution (`npm run reminders:run`) triggers reminder processing.
*   **[Completed & Verified]** **Automated Reminder Cron**: GET/POST route `/api/cron/reminders` dispatches due reminders.
*   **[Completed & Verified]** **Email Delivery Integration**: Delivered via Resend API in production and printed to the terminal console in development.

