/** Format a DB date for `<input type="date" />` (YYYY-MM-DD). */
export function toDateInputValue(d: Date | null | undefined): string {
  if (!d) return "";
  return d.toISOString().slice(0, 10);
}
