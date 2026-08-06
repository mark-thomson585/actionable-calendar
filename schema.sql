create table if not exists items (
  id uuid primary key default gen_random_uuid(),
  text text not null,
  type text not null check (type in ('task','goal')),
  date date,
  status text not null default 'open' check (status in ('open','done')),
  repeat_rule text,
  no_rollover boolean not null default false,
  start_time time,
  end_time time,
  notified_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table items enable row level security;

create table if not exists push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  endpoint text not null unique,
  p256dh text not null,
  auth text not null,
  created_at timestamptz not null default now()
);

alter table push_subscriptions enable row level security;
