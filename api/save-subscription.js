import { createClient } from "@supabase/supabase-js";

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.statusCode = 405;
    res.end("Method not allowed");
    return;
  }

  const sub = req.body;
  if (!sub || !sub.endpoint || !sub.keys) {
    res.statusCode = 400;
    res.json({ error: "Invalid subscription" });
    return;
  }

  const { error } = await supabase
    .from("push_subscriptions")
    .upsert(
      { endpoint: sub.endpoint, p256dh: sub.keys.p256dh, auth: sub.keys.auth },
      { onConflict: "endpoint" },
    );

  if (error) {
    res.statusCode = 500;
    res.json({ error: error.message });
    return;
  }

  res.statusCode = 200;
  res.json({ ok: true });
}
