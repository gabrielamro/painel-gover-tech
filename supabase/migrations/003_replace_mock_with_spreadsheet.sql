begin;

alter table public.sprints
  add column if not exists function_points numeric(10,2),
  add column if not exists detailed_function_points numeric(10,2),
  add column if not exists source_status text,
  add column if not exists billing_forecast_month date;

create table if not exists public.systems (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  created_at timestamptz not null default now()
);

alter table public.systems enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'systems'
      and policyname = 'authenticated users can read systems'
  ) then
    create policy "authenticated users can read systems"
      on public.systems for select to authenticated using (true);
  end if;
end $$;

-- Substituição integral dos dados operacionais do mockup.
delete from public.tasks;
delete from public.deliveries;
delete from public.risks;
delete from public.impediments;
delete from public.decisions;
delete from public.audit_logs;
delete from public.sprints;
delete from public.systems;

insert into public.systems (name) values
  ('CADSUF'),
  ('SIMNAC WEB'),
  ('SIMNAC APP'),
  ('SAC'),
  ('Sagat - Recepção'),
  ('Sagat- Analise RD');

insert into public.sprints (
  code,
  project,
  system,
  sprint_number,
  objective,
  lane,
  progress,
  expected_progress,
  priority_level,
  service_order,
  position,
  function_points,
  detailed_function_points,
  source_status,
  billing_forecast_month
) values
  ('OS-15819', 'CADSUF', 'CADSUF', 26, 'SPRINT 26', 'approved', 0, 0, 'Média', '#15819', 1, 40, 74.75, 'CONTAGEM REALIZADA', date_trunc('month', current_date)::date),
  ('OS-15859', 'SIMNAC WEB', 'SIMNAC WEB', 24, 'SPRINT 24 WEB', 'homologation', 0, 0, 'Média', '#15859', 2, 40, 36.45, 'EM HOMOLOGAÇÃO', date_trunc('month', current_date)::date),
  ('OS-15860', 'SIMNAC APP', 'SIMNAC APP', 22, 'SPRINT 22 APP', 'homologation', 0, 0, 'Média', '#15860', 3, 40, 75, 'EM HOMOLOGAÇÃO', date_trunc('month', current_date)::date),
  ('OS-15807', 'SAC', 'SAC', 26, 'SPRINT 26', 'billing', 0, 0, 'Média', '#15807', 4, 20, 10.5, 'APTA PARA FATURAMENTO', date_trunc('month', current_date)::date),
  ('OS-15600', 'SAC', 'SAC', 26, 'SPRINT 26', 'billing', 0, 0, 'Média', '#15600', 5, 20, 5.75, 'APTA PARA FATURAMENTO', date_trunc('month', current_date)::date),
  ('OS-15599', 'SAC', 'SAC', 26, 'SPRINT 26', 'billing', 0, 0, 'Média', '#15599', 6, 20, 17.25, 'APTA PARA FATURAMENTO', date_trunc('month', current_date)::date),
  ('OS-15598', 'SAC', 'SAC', 26, 'SPRINT 26', 'billing', 0, 0, 'Média', '#15598', 7, 20, 30, 'APTA PARA FATURAMENTO', date_trunc('month', current_date)::date),
  ('OS-15883', 'SAC', 'SAC', 26, 'SPRINT 26', 'billing', 0, 0, 'Média', '#15883', 8, 20, 9, 'APTA PARA FATURAMENTO', date_trunc('month', current_date)::date),
  ('OS-15843', 'SAC', 'SAC', 26, 'SPRINT 26', 'billing', 0, 0, 'Média', '#15843', 9, 20, 6, 'APTA PARA FATURAMENTO', date_trunc('month', current_date)::date),
  ('OS-15930', 'Sagat - Recepção', 'Sagat - Recepção', 3, 'SPRINT 3', 'development', 0, 0, 'Média', '#15930', 10, 40, 148, 'REVISÃO OU IMPLANTAÇÃO', date_trunc('month', current_date)::date),
  ('OS-15697', 'Sagat - Recepção', 'Sagat - Recepção', 2, 'SPRINT 2', 'approved', 0, 0, 'Média', '#15697', 11, 40, 97, 'CONTAGEM REALIZADA', date_trunc('month', current_date)::date),
  ('OS-15793', 'Sagat- Analise RD', 'Sagat- Analise RD', 18, 'SPRINT 18', 'billing', 0, 0, 'Média', '#15793', 12, 30, 33.6, 'APTA PARA FATURAMENTO', date_trunc('month', current_date)::date),
  ('OS-15896', 'Sagat- Analise RD', 'Sagat- Analise RD', 19, 'SPRINT 19', 'approved', 0, 0, 'Média', '#15896', 13, 40, 30.75, 'CONTAGEM REALIZADA', date_trunc('month', current_date)::date),
  ('OS-15776', 'SAC', 'SAC', 25, 'SPRINT 25', 'billing', 0, 0, 'Média', '#15776', 14, null, 25, 'APTA PARA FATURAMENTO', date_trunc('month', current_date)::date);

do $$
declare
  imported_count integer;
  system_count integer;
  estimated_total numeric;
  detailed_total numeric;
begin
  select count(*), coalesce(sum(function_points), 0), coalesce(sum(detailed_function_points), 0)
    into imported_count, estimated_total, detailed_total
    from public.sprints;
  select count(*) into system_count from public.systems;

  if imported_count <> 14 then
    raise exception 'Importação inválida: esperado 14 OS, encontrado %', imported_count;
  end if;
  if system_count <> 6 then
    raise exception 'Importação inválida: esperado 6 sistemas, encontrado %', system_count;
  end if;
  if estimated_total <> 390 then
    raise exception 'Importação inválida: PF estimado esperado 390, encontrado %', estimated_total;
  end if;
  if detailed_total <> 599.05 then
    raise exception 'Importação inválida: PF detalhado esperado 599.05, encontrado %', detailed_total;
  end if;
end $$;

commit;

select
  count(*) as total_os,
  count(distinct system) as total_sistemas,
  sum(function_points) as total_pf_estimado,
  sum(detailed_function_points) as total_pf_detalhado
from public.sprints;
