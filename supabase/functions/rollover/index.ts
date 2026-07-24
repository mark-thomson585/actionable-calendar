import { createClient } from "npm:@supabase/supabase-js@2";

function nextOccurrence(dateStr: string, repeatRule: string | null): Date {
  const next = new Date(dateStr + "T00:00:00Z");
  switch (repeatRule) {
    case "weekly":
      next.setUTCDate(next.getUTCDate() + 7);
      break;
    case "biweekly":
      next.setUTCDate(next.getUTCDate() + 14);
      break;
    case "monthly":
      next.setUTCMonth(next.getUTCMonth() + 1);
      break;
    case "monthly-first-saturday":
      // Jump to the 1st of next month, then advance to the first Saturday.
      next.setUTCMonth(next.getUTCMonth() + 1, 1);
      while (next.getUTCDay() !== 6) next.setUTCDate(next.getUTCDate() + 1);
      break;
    case "weekday":
      // Advance a day at a time, skipping Saturday (6) and Sunday (0).
      do {
        next.setUTCDate(next.getUTCDate() + 1);
      } while (next.getUTCDay() === 0 || next.getUTCDay() === 6);
      break;
    default: // "daily" or unrecognized rule falls back to daily
      next.setUTCDate(next.getUTCDate() + 1);
  }
  return next;
}

function advanceUntilTodayOrLater(dateStr: string, repeatRule: string | null, todayDate: Date): string {
  let next = nextOccurrence(dateStr, repeatRule);
  while (next < todayDate) next = nextOccurrence(next.toISOString().slice(0, 10), repeatRule);
  return next.toISOString().slice(0, 10);
}

Deno.serve(async (_req) => {
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  const today = new Date().toISOString().slice(0, 10);
  const todayDate = new Date(today + "T00:00:00Z");

  // Roll forward any open, rollover-eligible item whose date has passed.
  const { data: rolled, error: rollErr } = await supabase
    .from("items")
    .update({ date: today, updated_at: new Date().toISOString() })
    .lt("date", today)
    .eq("status", "open")
    .eq("no_rollover", false)
    .select("id");

  // Advance completed, rollover-eligible repeating items to their next occurrence.
  const { data: doneRepeats, error: fetchErr } = await supabase
    .from("items")
    .select("id, date, repeat_rule")
    .not("repeat_rule", "is", null)
    .eq("status", "done")
    .eq("no_rollover", false)
    .lt("date", today);

  let advanced = 0;
  for (const item of doneRepeats ?? []) {
    const nextStr = advanceUntilTodayOrLater(item.date, item.repeat_rule, todayDate);
    const { error } = await supabase
      .from("items")
      .update({ date: nextStr, status: "open", updated_at: new Date().toISOString() })
      .eq("id", item.id);
    if (!error) advanced++;
  }

  // no_rollover items never nag forward while incomplete — once their date
  // passes they always jump straight to the next scheduled occurrence and
  // reset to open, whether or not the previous one was completed.
  const { data: noRolloverPast, error: nrErr } = await supabase
    .from("items")
    .select("id, date, repeat_rule")
    .eq("no_rollover", true)
    .lt("date", today);

  let reset = 0;
  for (const item of noRolloverPast ?? []) {
    const nextStr = advanceUntilTodayOrLater(item.date, item.repeat_rule, todayDate);
    const { error } = await supabase
      .from("items")
      .update({ date: nextStr, status: "open", updated_at: new Date().toISOString() })
      .eq("id", item.id);
    if (!error) reset++;
  }

  return new Response(
    JSON.stringify({
      rolled_over: rolled?.length ?? 0,
      advanced,
      reset_no_rollover: reset,
      errors: [rollErr?.message, fetchErr?.message, nrErr?.message].filter(Boolean),
    }),
    { headers: { "Content-Type": "application/json" } },
  );
});
