import type { Role } from "@prisma/client";

const STAFF: Role[] = ["FRONT_DESK", "SUPERVISOR", "DOCTOR"];

export function isStaffRole(role: Role) {
  return STAFF.includes(role);
}

/**
 * Staff may chat with each other. Only FRONT_DESK and PATIENT may message each
 * other (other staff cannot DM patients, and patients cannot DM non–front-desk).
 */
export function canOpenChat(a: { role: Role }, b: { role: Role }): boolean {
  if (a.role === "PATIENT" && b.role === "PATIENT") return false;
  if (a.role === "PATIENT" && b.role === "FRONT_DESK") return true;
  if (b.role === "PATIENT" && a.role === "FRONT_DESK") return true;
  if (a.role === "PATIENT" || b.role === "PATIENT") return false;
  return isStaffRole(a.role) && isStaffRole(b.role);
}

export function makePairKey(userIdA: string, userIdB: string) {
  return userIdA < userIdB ? `${userIdA}|${userIdB}` : `${userIdB}|${userIdA}`;
}
