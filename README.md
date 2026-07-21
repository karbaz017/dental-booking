DentalCare Booking is a [Next.js](https://nextjs.org) (App Router) demo for US dental appointment scheduling: patients (family, insurance, booking), staff (filters, CRUD), and simulated reminder jobs.

## Getting Started

Copy environment variables and point **`DATABASE_URL`** at a running PostgreSQL instance.

```bash
cp .env.example .env
# Edit .env: DATABASE_URL (must match your Postgres), AUTH_SECRET
npm run db:migrate
npm run db:seed
```

**Option A — Docker** (matches default `DATABASE_URL` in `.env.example`):

```bash
docker compose up -d
```

**Option B — Postgres on your machine (no Docker), macOS + [Homebrew](https://brew.sh)**:

```bash
brew install postgresql@16
brew services start postgresql@16
createdb dental_booking
```

Then set in `.env` (replace `YOUR_USERNAME` with your macOS user — run `whoami`):

```env
DATABASE_URL="postgresql://YOUR_USERNAME@127.0.0.1:5432/dental_booking"
```

If you use a password, use `postgresql://USER:PASSWORD@127.0.0.1:5432/dental_booking`. You can also use [Postgres.app](https://postgresapp.com/) and point `DATABASE_URL` at its port (often `5432`).

Run the dev server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Demo staff logins (after seed): `doctor@demo.clinic`, `frontdesk@demo.clinic`, `supervisor@demo.clinic` — password `Demo1234!`.

### Useful commands

| Command | Purpose |
| --- | --- |
| `npm run db:studio` | Prisma Studio |
| `npm run reminders:run` | CLI: process due `AppointmentReminder` rows (same logic as cron API) |
| `npm run build` | Production build (needs `AUTH_SECRET` in env) |

### Reminder cron (HTTP)

`GET` or `POST` `/api/cron/reminders` runs the reminder job.

- **Production:** set `CRON_SECRET` in the environment and call with header `Authorization: Bearer <CRON_SECRET>`.
- **Local dev:** if `CRON_SECRET` is unset, the route is allowed (do not deploy that way).

On Vercel, add a [Cron Job](https://vercel.com/docs/cron-jobs) pointing at this URL with the bearer secret.

### Email (Resend)

When **`RESEND_API_KEY`** and **`RESEND_FROM_EMAIL`** are set, due reminders trigger a real email via [Resend](https://resend.com) (`src/lib/reminder-delivery.ts`). If they are unset, delivery is skipped in production; in development a short log line is printed instead.

Copy for messages lives in `src/lib/reminder-email-templates.ts`. Failed sends leave the row unsent so the next cron run retries.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to load [Geist](https://vercel.com/font).

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

Connect the repo and set **`DATABASE_URL`**, **`AUTH_SECRET`**, and **`CRON_SECRET`** (for `/api/cron/reminders`). Run `npm run db:migrate` against your production database from CI or locally with production `DATABASE_URL`.

See [Next.js on Vercel](https://vercel.com/docs/frameworks/nextjs) and [environment variables](https://vercel.com/docs/projects/environment-variables).
