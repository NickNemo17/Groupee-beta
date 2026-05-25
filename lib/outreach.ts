// Real, keyless outreach: prefilled Gmail compose + Google Calendar template
// deep-links. Opens the user's own Gmail/Calendar with everything filled in —
// no OAuth, no API keys. (Server-side sending would need Gmail API OAuth.)

export function gmailComposeUrl(to: string, subject: string, body: string): string {
  const u = new URL("https://mail.google.com/mail/");
  u.searchParams.set("view", "cm");
  u.searchParams.set("fs", "1");
  u.searchParams.set("to", to);
  u.searchParams.set("su", subject);
  u.searchParams.set("body", body);
  return u.toString();
}

function fmt(d: Date): string {
  // YYYYMMDDTHHMMSS in local time (Calendar treats template dates as local)
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}${p(d.getMonth() + 1)}${p(d.getDate())}T${p(d.getHours())}${p(d.getMinutes())}00`;
}

// tomorrow at 10:00–10:15 local
export function tomorrowSlot(): { start: string; end: string } {
  const start = new Date();
  start.setDate(start.getDate() + 1);
  start.setHours(10, 0, 0, 0);
  const end = new Date(start.getTime() + 15 * 60 * 1000);
  return { start: fmt(start), end: fmt(end) };
}

export function calendarTemplateUrl(opts: {
  title: string;
  details: string;
  location?: string;
  start: string;
  end: string;
}): string {
  const u = new URL("https://calendar.google.com/calendar/render");
  u.searchParams.set("action", "TEMPLATE");
  u.searchParams.set("text", opts.title);
  u.searchParams.set("details", opts.details);
  if (opts.location) u.searchParams.set("location", opts.location);
  u.searchParams.set("dates", `${opts.start}/${opts.end}`);
  return u.toString();
}
