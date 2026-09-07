# Roadmap — Componentização do Frontend e Backend

## Objetivo

Transformar a SPA atual em uma aplicação modular, testável e pronta para persistência centralizada no Supabase, sem quebrar o fluxo atual do Kanban nem fazer uma reescrita Big Bang.

## Princípios

- preservar a interface e os fluxos existentes;
- separar apresentação, estado, regras de negócio e persistência;
- manter `localStorage` apenas como fallback durante a migração;
- toda escrita relevante deve gerar auditoria;
- autenticação e RLS são responsabilidades do backend/Supabase, não da UI.

## Fase 0 — Contratos e inventário

**Entrega:** mapa de responsabilidades e contratos estáveis.

- catalogar funções de `app.js` por domínio: Kanban, dashboard, filtros, editores, auditoria e forecast;
- padronizar entidades `Sprint`, `Task`, `Delivery`, `Risk`, `Impediment`, `Decision` e `AuditLog`;
- criar adaptadores `LocalRepository` e `ApiRepository` com operações equivalentes;
- definir estados de carregamento, vazio e erro.

**Aceite:** nenhum componente novo acessa diretamente `localStorage` ou chama Supabase.

## Fase 1 — Componentes visuais do Kanban

**Entrega:** decomposição da tela sem mudança visual intencional.

- `AppShell` e navegação;
- `KanbanPage`, `BoardHeader`, `BoardFilters`;
- `KanbanBoard`, `LaneColumn`, `SprintCard`;
- `SprintDrawer`, `TaskList`, `TaskItem`;
- `Modal`, `FormField`, `EmptyState`, `Toast`.

**Aceite:** o Kanban mantém filtros, drag-and-drop, teclado, drawer e editores atuais; cada componente recebe dados por propriedades e emite eventos.

## Fase 2 — Estado e serviços do frontend

**Entrega:** UI sem regras de negócio espalhadas nos componentes.

- `sprintStore` para seleção, filtros e carregamento;
- `SprintService` para criação, atualização e movimentação;
- `TaskService` para cálculo de progresso e bloqueios;
- `AuditService` e `DecisionService` como portas de aplicação;
- `DashboardService` para agregações executivas.

**Aceite:** `app.js` deixa de conter persistência e cálculos; regras existentes continuam cobertas por testes.

## Fase 3 — Repositório e autenticação

**Entrega:** alternância controlada entre local e remoto.

- implementar `ApiRepository` sobre `/api`;
- integrar Supabase Auth no frontend;
- enviar o access token em todas as chamadas protegidas;
- usar feature flag `VITE_DATA_SOURCE=local|api`;
- manter fallback local somente para desenvolvimento/offline.

**Aceite:** usuário autenticado lê e atualiza Sprints no Supabase; usuário anônimo recebe estado de autenticação, nunca dados protegidos.

## Fase 4 — Backend por domínio

**Entrega:** API organizada por recurso, com contratos e auditoria.

- concluir CRUD de Sprints;
- adicionar Tasks e vínculo com Sprint;
- adicionar entregas, riscos e impedimentos;
- adicionar decisões e alertas derivados;
- centralizar validação, autenticação, respostas HTTP e auditoria;
- criar testes de contrato e integração com banco de teste.

**Aceite:** cada mutação valida entrada, respeita RLS e registra `AuditLog` com usuário e entidade afetada.

## Fase 5 — Migração e produção

**Entrega:** Supabase como fonte oficial.

- importar seed de `localStorage` com script idempotente;
- comparar totais locais e remotos;
- ativar realtime apenas onde trouxer benefício operacional;
- configurar ambientes Preview/Production na Vercel;
- configurar backups, observabilidade e política de retenção de auditoria;
- remover fallback local após aceite de produção.

## Ordem recomendada de execução

1. Fase 0 e Fase 1: reduzir risco visual.
2. Fase 2: estabilizar contratos internos.
3. Fase 3: conectar leitura remota com fallback.
4. Fase 4: migrar escritas e entidades restantes.
5. Fase 5: virar a fonte oficial e descontinuar o armazenamento local.

