import { PrismaClientInitializationError } from "@prisma/client/runtime/library";

const DB_HELP =
  "Cannot connect to the database. Start PostgreSQL (Docker: `docker compose up -d` in this folder, or install Postgres locally — see README), then run `npm run db:migrate`. Check `DATABASE_URL` in `.env` (user, password if any, host, port, database name).";

/** Maps DB-down / bad URL errors to a user-visible message; returns null if unrelated. */
export function mapDbConnectionError(error: unknown): string | null {
  if (error instanceof PrismaClientInitializationError) {
    return DB_HELP;
  }
  const msg = error instanceof Error ? error.message : String(error);
  if (
    msg.includes("not available") ||
    msg.includes("Can't reach database") ||
    msg.includes("P1001")
  ) {
    return DB_HELP;
  }
  return null;
}
