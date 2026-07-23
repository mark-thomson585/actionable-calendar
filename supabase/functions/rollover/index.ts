import { createClient } from "npm:@supabase/supabase-js@2";

Deno.serve(async (_req) => {
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  const today = new Date().toISOString().slice(0, 10);

  // Roll forward any open item (task or repeating) whose date has passed.
  const { data: rolled, error: rollErr } = await supabase
    .from("items")
    .update({ date: today, updated_at: new Date().toISOString() })
    .lt("date", today)
    .eq("status", "open")
    .select("id");

  // Advance completed repeating items to their next scheduled occurrence.
  const { data: doneRepeats, error: fetchErr } = await supabase
    .from("items")
    .select("id, date, repeat_rule")
    .not("repeat_rule", "is", null)
    .eq("status", "done")
    .lt("date", today);

  let advanced = 0;
  const todayDate = new Date(today + "T00:00:00Z");

  for (const item of doneRepeats ?? []) {
    const next = new Date(item.date + "T00:00:00Z");
    do {
      switch (item.repeat_rule) {
        case "weekly":
          next.setUTCDate(next.getUTCDate() + 7);
          break;
        case "monthly":
          next.setUTCMonth(next.getUTCMonth() + 1);
          break;
        default: // "daily" or unrecognized rule falls back to daily
          next.setUTCDate(next.getUTCDate() + 1);
      }
    } while (next < todayDate);

    const nextStr = next.toISOString().slice(0, 10);
    const { error } = await supabase
      .from("items")
      .update({ date: nextStr, status: "open", updated_at: new Date().toISOString() })
      .eq("id", item.id);
    if (!error) advanced++;
  }

  return new Response(
    JSON.stringify({
      rolled_over: rolled?.length ?? 0,
      advanced,
      errors: [rollErr?.message, fetchErr?.message].filter(Boolean),
    }),
    { headers: { "Content-Type": "application/json" } },
  );
});
