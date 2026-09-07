-- ==========================================================================
-- Migração Supabase / PostgreSQL: Gestão de Equipe e Atribuição de Tasks
-- Data: 2026-09-02
-- Descrição: Cria a tabela team_members e adiciona colunas de atribuição em tasks
-- ==========================================================================

-- 1. Criação da tabela team_members
create table if not exists public.team_members (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  role text not null, -- 'Desenvolvedor Frontend', 'Desenvolvedor Backend', 'QA / Analista de Testes', 'Tech Lead', etc.
  email text,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 2. Habilitação de RLS (Row Level Security)
alter table public.team_members enable row level security;

create policy "Permitir leitura de equipe para usuários autenticados"
  on public.team_members
  for select
  using (auth.role() = 'authenticated');

create policy "Permitir modificação de equipe para usuários autenticados"
  on public.team_members
  for all
  using (auth.role() = 'authenticated');

-- 3. Atualização da tabela tasks para atribuição e rastreabilidade
alter table public.tasks
  add column if not exists owner_id uuid references public.team_members(id) on delete set null,
  add column if not exists owner_role text;

-- Índices de performance
create index if not exists idx_tasks_owner_id on public.tasks(owner_id);
create index if not exists idx_team_members_role on public.team_members(role);
create index if not exists idx_team_members_active on public.team_members(active);

-- 4. Inserção de dados iniciais (Seed) se a tabela estiver vazia
insert into public.team_members (name, role, active)
select name, role, active from (values
  ('Lucas Almeida', 'Tech Lead', true),
  ('João Victor', 'Desenvolvedor Backend', true),
  ('Rafael Lima', 'Desenvolvedor Frontend', true),
  ('Mariana Costa', 'QA / Analista de Testes', true),
  ('Beatriz Santos', 'QA / Analista de Testes', true),
  ('Gabriel Souza', 'Desenvolvedor Fullstack', true)
) as t(name, role, active)
where not exists (select 1 from public.team_members limit 1);
