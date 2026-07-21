const DEV_FALLBACK =
  "dev-only-auth-secret-min-32-chars-do-not-use-in-prod";

/**
 * Secret for Auth.js and `getToken` in middleware. Prefer `AUTH_SECRET` in `.env`.
 */
export function getAuthSecret(): string | undefined {
  const fromEnv = process.env.AUTH_SECRET?.trim();
  if (fromEnv) return fromEnv;
  if (process.env.NODE_ENV === "production") return undefined;
  return DEV_FALLBACK;
}
