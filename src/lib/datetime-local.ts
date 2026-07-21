/** Format for `<input type="datetime-local" />` in the server or client local timezone. */
export function formatForDatetimeLocalInput(d: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

/** Tomorrow 9:00 local, minute-aligned (reasonable default booking slot). */
export function defaultBookingStart(): Date {
  const d = new Date(Date.now() + 24 * 60 * 60 * 1000);
  d.setSeconds(0, 0);
  d.setMinutes(0, 0, 0);
  d.setHours(9, 0, 0, 0);
  return d;
}
