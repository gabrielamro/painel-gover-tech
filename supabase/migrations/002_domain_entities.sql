create type public.task_status as enum ('A Fazer', 'Em Andamento', 'Bloqueada', 'Concluída');

create table public.tasks (
  id uuid primary key default gen_random_uuid(),
  sprint_id uuid not null references public.sprints(id) on delete cascade,
  title text not null,
  owner text,
  status public.task_status not null default 'A Fazer',
  points integer not null default 1 check (points > 0),
  created_by uuid references auth.users(id) default auth.uid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.deliveries (
  id uuid primary key default gen_random_uuid(),
  sprint_id uuid not null references public.sprints(id) on delete cascade,
  title text not null,
  delivered_at timestamptz,
  details jsonb not null default '{}'::jsonb,
  created_by uuid references auth.users(id) default auth.uid(),
  created_at timestamptz not null default now()
);

create table public.risks (
  id uuid primary key default gen_random_uuid(),
  sprint_id uuid not null references public.sprints(id) on delete cascade,
  title text not null,
  severity text not null default 'MEDIUM',
  status text not null default 'OPEN',
  owner text,
  created_by uuid references auth.users(id) default auth.uid(),
  created_at timestamptz not null default now()
);

create table public.impediments (
  id uuid primary key default gen_random_uuid(),
  sprint_id uuid not null references public.sprints(id) on delete cascade,
  title text not null,
  status text not null default 'OPEN',
  owner text,
  due_at timestamptz,
  created_by uuid references auth.users(id) default auth.uid(),
  created_at timestamptz not null default now()
);

create table public.decisions (
  id uuid primary key default gen_random_uuid(),
  sprint_id uuid references public.sprints(id) on delete set null,
  title text not null,
  decision text not null,
  decided_at timestamptz not null default now(),
  created_by uuid references auth.users(id) default auth.uid()
);

do $$ declare table_name text; begin
  foreach table_name in array array['tasks','deliveries','risks','impediments','decisions'] loop
    execute format('alter table public.%I enable row level security', table_name);
    execute format('create policy "authenticated users can read %1$s" on public.%1$I for select to authenticated using (true)', table_name);
    execute format('create policy "authenticated users can insert %1$s" on public.%1$I for insert to authenticated with check (created_by = auth.uid())', table_name);
  end loop;
end $$;

create policy "authenticated users can update tasks" on public.tasks for update to authenticated using (true) with check (true);
create index tasks_sprint_idx on public.tasks (sprint_id, created_at);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
security invoker
as $$ begin
  new.updated_at = now();
  return new;
end $$;

create trigger sprints_set_updated_at before update on public.sprints for each row execute function public.set_updated_at();
create trigger tasks_set_updated_at before update on public.tasks for each row execute function public.set_updated_at();
