/** Local calendar day bounds for `YYYY-MM-DD`. */
export function parseLocalDayBounds(
  dateStr: string,
): { start: Date; end: Date } | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateStr.trim());
  if (!m) return null;
  const y = Number(m[1]);
  const mo = Number(m[2]) - 1;
  const d = Number(m[3]);
  const start = new Date(y, mo, d, 0, 0, 0, 0);
  const end = new Date(y, mo, d, 23, 59, 59, 999);
  if (Number.isNaN(start.getTime())) return null;
  return { start, end };
}
