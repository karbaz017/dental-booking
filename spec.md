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
