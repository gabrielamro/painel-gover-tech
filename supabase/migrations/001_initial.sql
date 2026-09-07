create extension if not exists "pgcrypto";

create type public.sprint_lane as enum ('planning', 'planned', 'development', 'homologation', 'approved', 'billing', 'completed');
create type public.priority_level as enum ('Baixa', 'Média', 'Alta', 'Crítica');

create table public.sprints (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  project text not null,
  system text,
  sprint_number integer,
  objective text not null,
  po text,
  lane public.sprint_lane not null default 'planning',
  progress integer not null default 0 check (progress between 0 and 100),
  expected_progress integer not null default 70 check (expected_progress between 0 and 100),
  priority_level public.priority_level not null default 'Média',
  service_order text,
  position integer not null default 0,
  created_by uuid references auth.users(id) default auth.uid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.sprints enable row level security;
create policy "authenticated users can read sprints" on public.sprints for select to authenticated using (true);
create policy "authenticated users can create sprints" on public.sprints for insert to authenticated with check (created_by = auth.uid());
create policy "authenticated users can update sprints" on public.sprints for update to authenticated using (true) with check (true);

create table public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  action text not null,
  entity text not null,
  entity_id text not null,
  details jsonb not null default '{}'::jsonb,
  created_by uuid references auth.users(id) default auth.uid(),
  created_at timestamptz not null default now()
);

alter table public.audit_logs enable row level security;
create policy "authenticated users can read audit logs" on public.audit_logs for select to authenticated using (true);
create policy "authenticated users can create audit logs" on public.audit_logs for insert to authenticated with check (created_by = auth.uid());

create index sprints_lane_position_idx on public.sprints (lane, position);
create index audit_logs_created_at_idx on public.audit_logs (created_at desc);

