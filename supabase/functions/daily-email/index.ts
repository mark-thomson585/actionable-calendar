import { createClient } from "npm:@supabase/supabase-js@2";
import { WORDS } from "./words.ts";

const NY_TZ = "America/New_York";
const TO_EMAIL = "markthomson585@gmail.com";
const FROM_EMAIL = "actionable-calendar <onboarding@resend.dev>";

function nyNow(): Date {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: NY_TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).formatToParts(new Date());
  const get = (t: string) => parts.find((p) => p.type === t)!.value;
  return new Date(`${get("year")}-${get("month")}-${get("day")}T${get("hour")}:${get("minute")}:${get("second")}Z`);
}

function addDays(d: Date, n: number): Date {
  const copy = new Date(d);
  copy.setUTCDate(copy.getUTCDate() + n);
  return copy;
}

function toISODate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function fmtTime(t: string | null): string {
  if (!t) return "";
  const [h, m] = t.split(":").map(Number);
  const period = h >= 12 ? "pm" : "am";
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${h12}:${String(m).padStart(2, "0")} ${period}`;
}

function dayOfYear(d: Date): number {
  const start = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.floor((d.getTime() - start.getTime()) / 86400000);
}

// Deterministic shuffle (fixed seed) so the word order is stable across
// invocations but not just grouped by category — mulberry32 PRNG.
function seededShuffle<T>(arr: T[], seed: number): T[] {
  const a = [...arr];
  let s = seed;
  const rand = () => {
    s |= 0;
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const SHUFFLED_WORDS = seededShuffle(WORDS, 20260101);

function pickWordsForDay(doy: number) {
  const n = SHUFFLED_WORDS.length;
  const start = (doy * 5) % n;
  const picks = [];
  for (let i = 0; i < 5; i++) picks.push(SHUFFLED_WORDS[(start + i) % n]);
  return { featured: picks[0], bonus: picks.slice(1) };
}

function itemLine(item: { text: string; start_time: string | null; end_time: string | null }): string {
  const time = item.start_time
    ? item.end_time
      ? `${fmtTime(item.start_time)}–${fmtTime(item.end_time)}`
      : fmtTime(item.start_time)
    : null;
  return time
    ? `<li><strong>${item.text}</strong> <span style="color:#6b6a65;">— ${time}</span></li>`
    : `<li>${item.text}</li>`;
}

function wordBlock(w: { word: string; definition: string; example: string }, featured: boolean): string {
  return `
    <div style="margin-bottom:14px;">
      <div style="font-weight:700;${featured ? "font-size:17px;" : "font-size:15px;"}color:#3a8f11;">${w.word}</div>
      <div style="color:#121212;">${w.definition}</div>
      <div style="color:#6b6a65;font-style:italic;">"${w.example}"</div>
    </div>`;
}

Deno.serve(async (req) => {
  const now = nyNow();

  // The cron runs every 15 min (to stay correct across the EST/EDT switch,
  // same fix as the rollover function's timezone bug) but the email should
  // only actually go out once, in the first 7am slot. Pass ?force=1 to
  // bypass this for manual testing at any time of day.
  const url = new URL(req.url);
  const forced = url.searchParams.get("force") === "1";
  if (!forced && !(now.getUTCHours() === 7 && now.getUTCMinutes() < 15)) {
    return new Response(JSON.stringify({ skipped: true, nyNow: now.toISOString() }), {
      headers: { "Content-Type": "application/json" },
    });
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  const todayStr = toISODate(now);
  const tomorrowStr = toISODate(addDays(now, 1));

  const dow = now.getUTCDay(); // 0 = Sunday
  const daysUntilSunday = (7 - dow) % 7 || 7;
  const nextSundayStr = toISODate(addDays(now, daysUntilSunday));

  const { data: todayItems } = await supabase
    .from("items")
    .select("text, start_time, end_time")
    .eq("date", todayStr)
    .eq("status", "open")
    .or("repeat_rule.is.null,repeat_rule.neq.weekday")
    .order("start_time", { nullsFirst: false });

  const { data: weekItems } = await supabase
    .from("items")
    .select("text, date, start_time, end_time")
    .gte("date", tomorrowStr)
    .lte("date", nextSundayStr)
    .eq("status", "open")
    .or("repeat_rule.is.null,repeat_rule.neq.weekday")
    .order("date")
    .order("start_time", { nullsFirst: false });

  const byDate = new Map<string, typeof weekItems>();
  for (const item of weekItems ?? []) {
    if (!byDate.has(item.date)) byDate.set(item.date, []);
    byDate.get(item.date)!.push(item);
  }

  const weekdayFmt = new Intl.DateTimeFormat("en-US", { timeZone: "UTC", weekday: "long", month: "short", day: "numeric" });

  const weeklySections = [...byDate.entries()]
    .map(([date, items]) => {
      const heading = weekdayFmt.format(new Date(date + "T00:00:00Z"));
      const lines = items.map(itemLine).join("");
      return `<h3 style="margin:14px 0 4px;font-size:14px;color:#3a8f11;">${heading}</h3><ul style="margin:0;padding-left:20px;">${lines}</ul>`;
    })
    .join("");

  const { featured, bonus } = pickWordsForDay(dayOfYear(now));

  const headerDate = weekdayFmt.format(now);

  const html = `
  <div style="font-family:-apple-system,BlinkMacSystemFont,sans-serif;max-width:600px;margin:0 auto;color:#121212;">
    <h1 style="color:#3a8f11;font-size:22px;">Daily Docket for ${headerDate} \u{1F9A6}</h1>

    <h2 style="font-size:15px;text-transform:uppercase;letter-spacing:0.04em;color:#6b6a65;margin-top:24px;">Docket:</h2>
    <ul style="margin:0;padding-left:20px;">
      ${(todayItems ?? []).length ? (todayItems ?? []).map(itemLine).join("") : "<li>Nothing on the docket today.</li>"}
    </ul>

    <h2 style="font-size:15px;text-transform:uppercase;letter-spacing:0.04em;color:#6b6a65;margin-top:24px;">Weekly Docket:</h2>
    ${weeklySections || "<p>Nothing else scheduled this week.</p>"}

    <h2 style="font-size:15px;text-transform:uppercase;letter-spacing:0.04em;color:#6b6a65;margin-top:24px;">Words of the Day</h2>
    ${wordBlock(featured, true)}
    ${bonus.map((w) => wordBlock(w, false)).join("")}
  </div>`;

  const resendRes = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${Deno.env.get("RESEND_API_KEY")}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: FROM_EMAIL,
      to: [TO_EMAIL],
      subject: `Daily Docket for ${headerDate} \u{1F9A6}`,
      html,
    }),
  });

  const resendBody = await resendRes.text();

  return new Response(
    JSON.stringify({ sent: resendRes.ok, status: resendRes.status, resendBody }),
    { headers: { "Content-Type": "application/json" } },
  );
});
