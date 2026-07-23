import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { z } from "zod";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

function buildServer() {
  const server = new McpServer({ name: "actionable-calendar", version: "1.0.0" });

  server.tool(
    "add_item",
    "Add a task or goal to Mark's actionable-calendar. Tasks should have a date (YYYY-MM-DD); goals omit date entirely.",
    {
      text: z.string().describe("The task or goal description"),
      type: z.enum(["task", "goal"]),
      date: z.string().optional().describe("YYYY-MM-DD, omit for goals"),
      repeat_rule: z.enum(["daily", "weekly", "monthly"]).optional(),
    },
    async ({ text, type, date, repeat_rule }) => {
      const { data, error } = await supabase
        .from("items")
        .insert({ text, type, date: date ?? null, repeat_rule: repeat_rule ?? null, status: "open" })
        .select()
        .single();
      if (error) return { content: [{ type: "text", text: `Error: ${error.message}` }], isError: true };
      return { content: [{ type: "text", text: `Added: ${JSON.stringify(data)}` }] };
    },
  );

  server.tool(
    "update_item",
    "Update an existing calendar item by id — mark done/open, reschedule, edit text, or change repeat rule.",
    {
      id: z.string(),
      text: z.string().optional(),
      date: z.string().nullable().optional(),
      status: z.enum(["open", "done"]).optional(),
      repeat_rule: z.string().nullable().optional(),
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
