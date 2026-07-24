import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { z } from "zod";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

function buildServer() {
  const server = new McpServer({ name: "actionable-calendar", version: "1.0.0" });

  server.tool(
    "add_item",
    "Add a task or goal to Mark's actionable-calendar. Tasks should have a date (YYYY-MM-DD); goals omit date entirely. For a single time-of-day, set start_time only. For a time range, set both start_time and end_time. Use repeat_rule 'weekday' for a Monday-Friday routine, 'biweekly' for every other week, or 'monthly-first-saturday' for the first Saturday of each month. Set no_rollover for items that should never nag forward when left unchecked — they just jump straight to their next scheduled occurrence instead.",
    {
      text: z.string().describe("The task or goal description"),
      type: z.enum(["task", "goal"]),
      date: z.string().optional().describe("YYYY-MM-DD, omit for goals"),
      repeat_rule: z.enum(["daily", "weekday", "weekly", "biweekly", "monthly", "monthly-first-saturday"]).optional(),
      no_rollover: z.boolean().optional().describe("If true, an incomplete item never rolls forward — it jumps to its next scheduled occurrence instead"),
      start_time: z.string().optional().describe("HH:MM 24-hour, e.g. 15:00"),
      end_time: z.string().optional().describe("HH:MM 24-hour, only for a time range"),
    },
    async ({ text, type, date, repeat_rule, no_rollover, start_time, end_time }) => {
      const { data, error } = await supabase
        .from("items")
        .insert({
          text,
          type,
          date: date ?? null,
          repeat_rule: repeat_rule ?? null,
          no_rollover: no_rollover ?? false,
          start_time: start_time ?? null,
          end_time: end_time ?? null,
          status: "open",
        })
        .select()
        .single();
      if (error) return { content: [{ type: "text", text: `Error: ${error.message}` }], isError: true };
      return { content: [{ type: "text", text: `Added: ${JSON.stringify(data)}` }] };
    },
  );

  server.tool(
    "update_item",
    "Update an existing calendar item by id — mark done/open, reschedule, edit text, change repeat rule, or set/clear its time.",
    {
      id: z.string(),
      text: z.string().optional(),
      date: z.string().nullable().optional(),
      status: z.enum(["open", "done"]).optional(),
      repeat_rule: z.string().nullable().optional(),
      no_rollover: z.boolean().optional(),
      start_time: z.string().nullable().optional(),
      end_time: z.string().nullable().optional(),
    },
    async ({ id, ...updates }) => {
      const clean = Object.fromEntries(Object.entries(updates).filter(([, v]) => v !== undefined));
      const { data, error } = await supabase
        .from("items")
        .update({ ...clean, updated_at: new Date().toISOString() })
        .eq("id", id)
        .select()
        .single();
      if (error) return { content: [{ type: "text", text: `Error: ${error.message}` }], isError: true };
      return { content: [{ type: "text", text: `Updated: ${JSON.stringify(data)}` }] };
    },
  );

  server.tool(
    "list_items",
    "List Mark's calendar items, optionally filtered by status and/or date range.",
    {
      status: z.enum(["open", "done"]).optional(),
      from_date: z.string().optional(),
      to_date: z.string().optional(),
    },
    async ({ status, from_date, to_date }) => {
      let query = supabase.from("items").select("*").order("date");
      if (status) query = query.eq("status", status);
      if (from_date) query = query.gte("date", from_date);
      if (to_date) query = query.lte("date", to_date);
      const { data, error } = await query;
      if (error) return { content: [{ type: "text", text: `Error: ${error.message}` }], isError: true };
      return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
    },
  );

  return server;
}

export default async function handler(req, res) {
  const server = buildServer();
  const transport = new StreamableHTTPServerTransport({ sessionIdGenerator: undefined });
  res.on("close", () => {
    transport.close();
    server.close();
  });
  await server.connect(transport);
  await transport.handleRequest(req, res, req.body);
}
