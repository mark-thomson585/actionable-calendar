create policy "public_all" on items for all using (true) with check (true);

alter publication supabase_realtime add table items;

create policy "public_all" on push_subscriptions for all using (true) with check (true);
