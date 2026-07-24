create table if not exists items (
  id uuid primary key default gen_random_uuid(),
  text text not null,
  type text not null check (type in ('task','goal')),
  date date,
  status text not null default 'open' check (status in ('open','done')),
  repeat_rule text,
  start_time time,
  end_time time,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table items enable row level security;
