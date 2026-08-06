import { createClient } from "npm:@supabase/supabase-js@2";
import webpush from "npm:web-push@3.6.7";

const NY_TZ = "America/New_York";
const LEAD_MINUTES = 30;

// Same convention as the rollover function: treat calendar values as if
// they were UTC, since items store NY wall-clock date/time with no
// timezone info — this keeps the arithmetic consistent across both.
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

Deno.serve(async (_req) => {
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  webpush.setVapidDetails(
    "mailto:markthomson585@gmail.com",
    Deno.env.get("VAPID_PUBLIC_KEY")!,
    Deno.env.get("VAPID_PRIVATE_KEY")!,
  );

  const now = nyNow();
  const todayStr = now.toISOString().slice(0, 10);

  const { data: items, error: itemsErr } = await supabase
    .from("items")
    .select("id, text, date, start_time, status, notified_at")
    .eq("date", todayStr)
    .eq("status", "open")
    .is("notified_at", null)
    .not("start_time", "is", null);

  const due = (items ?? []).filter((item) => {
    const eventTime = new Date(`${item.date}T${item.start_time}Z`);
    const diffMinutes = (eventTime.getTime() - now.getTime()) / 60000;
    return diffMinutes > 0 && diffMinutes <= LEAD_MINUTES;
  });

  const { data: subs, error: subsErr } = await supabase
    .from("push_subscriptions")
    .select("endpoint, p256dh, auth");

  let sent = 0;
  const errors: string[] = [];

  for (const item of due) {
    const payload = JSON.stringify({
      title: "Coming up",
      body: `${item.text} — starting in ${LEAD_MINUTES} min`,
    });

    for (const sub of subs ?? []) {
      try {
        await webpush.sendNotification(
          { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
          payload,
        );
        sent++;
      } catch (e) {
        errors.push(`${item.text}: ${e.message ?? String(e)}`);
        if (e.statusCode === 404 || e.statusCode === 410) {
          await supabase.from("push_subscriptions").delete().eq("endpoint", sub.endpoint);
        }
      }
    }

    await supabase.from("items").update({ notified_at: new Date().toISOString() }).eq("id", item.id);
  }

  return new Response(
    JSON.stringify({
      checked: items?.length ?? 0,
      due: due.length,
      sent,
      errors,
      itemsErr: itemsErr?.message,
      subsErr: subsErr?.message,
    }),
    { headers: { "Content-Type": "application/json" } },
  );
});
