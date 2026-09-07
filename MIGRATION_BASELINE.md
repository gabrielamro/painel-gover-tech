# PainelPro React — Baseline e inventário do legado

**Fase:** 0 — Baseline e inventário do legado  
**Data do congelamento:** 2026-09-01  
**Status do gate:** concluído  
**Golden Master:** aplicação legada servida em `http://127.0.0.1:4173/`  
**Migração em andamento:** aplicação React servida em `http://127.0.0.1:4173/react/`

## 1. Objetivo e regra de uso

Este documento congela a referência funcional, visual e de persistência que deve orientar a migração incremental do PainelPro. Ele não autoriza reconstruir o produto do zero nem alterar regras durante a migração.

Regras para as próximas fases:

- O legado é a fonte de verdade funcional.
- O Kanban legado é o Golden Master visual e funcional.
- A versão React atual é somente um protótipo parcial; não é fonte de verdade.
- Nenhuma fase pode apagar, zerar ou sobrescrever dados existentes.
- Kanban, Dashboard, Forecast e Cadastros devem consumir o mesmo domínio e o mesmo repositório.
- Migrações de persistência devem ser versionadas, idempotentes e testadas com cópia dos dados.
- Divergências descritas neste documento devem ser resolvidas por paridade antes de modernização.

## 2. Topologia atual do projeto

### 2.1 Legado

- Entrada: `index.html`.
- Aplicação principal: `app.js`.
- Estilos: `styles.css`.
- Domínio local: `domain.js` e `frontend/services/sprint-domain-service.js`.
- Repositório ativo: `frontend/repositories/sprint-repository.js` com `LocalSprintRepository`.
- Módulos complementares carregados sobre a aplicação principal:
  - `dashboard-gover.js`;
  - `dashboard-gover-modern.js`;
  - `dashboard-gover-status.js`;
  - `dashboard-superintendencia.js`;
  - `history-panel.js`;
  - `detail-editor.js`;
  - `featured-highlights.js`;
  - `kanban-layout.js`;
  - `label-manager.js`.
- O legado renderiza HTML por templates de string e adiciona comportamentos posteriores com listeners e `MutationObserver`.

### 2.2 React atual

- Entrada: `react-index.html` e `src/main.tsx`.
- Aplicação concentrada em `src/App.tsx`.
- Tipos: `src/types.ts`.
- Persistência: `src/repositories.ts`, acessando diretamente somente `painelpro-sprints`.
- Estilos: `src/styles.css` e `src/additional.css`.
- Build: Vite, base `/react/`, saída `react-dist/`.
- Rotas internas manuais por hash, sem React Router.
- Dependências presentes: React, React DOM e Supabase.
- Dependências do roadmap ainda ausentes: React Router, React Hook Form, Zod, dnd-kit, Recharts, Lucide React e biblioteca de testes React/E2E.

### 2.3 Backend preparado, mas não ativo como fonte principal

- API Vercel para Sprints e Tasks em `api/`.
- Supabase com migrations para Sprints, Tasks, entregas, riscos, impedimentos, decisões, auditoria e sistemas.
- `ApiSprintRepository` e autenticação já possuem esqueleto.
- O runtime permanece com fonte `local` por padrão.
- A ativação remota não faz parte da Fase 0.

### 2.4 Observação de versionamento

O diretório atual não contém `.git`; portanto, `git status` e comparação por commit não estão disponíveis nesta baseline. Antes de mudanças estruturais da Fase 1, recomenda-se inicializar ou conectar o repositório Git correto.

## 3. Inventário de rotas e telas

| Rota | Tela legada | Situação no legado | Situação no React atual | Observações |
|---|---|---|---|---|
| `#/kanban` | Kanban de Sprints | Operacional | Parcial | React mostra raias e cards básicos, mas não possui paridade de card, filtros, DnD, atalhos, Tasks e menus. |
| `#/dashboard` | Dashboard Gover / Análise Executiva | Operacional | Parcial | React possui KPIs e status simplificados; não consome destaques e não replica toda a composição. |
| `#/superintendencia` | Superintendência | Operacional | Ausente | Legado possui filtros, visão macro, entregas e destaques. |
| `#/pf-forecast` | Previsão de PF Mês | Operacional | Parcial | React soma valores globais e não possui competência mensal, filtros, gráficos, pontos críticos ou melhorias. |
| `#/cadastros` | Cadastros | Operacional | Parcial informativo | React mostra apenas contadores; não cria, edita nem mantém vínculos e cores. |
| `#/update` | Nova Atualização | Operacional | Ausente | Atualiza progresso, recalcula indicadores e registra auditoria. |
| `#/attention` | Sala de Situação | Redirecionada | Ausente | O código contém a tela, mas o roteamento atual redireciona para `#/kanban`; tratar como módulo despriorizado. |
| Modal do card | Sprint Details | Operacional | Parcial | Legado possui Resumo, Tasks, Histórico e Destaque. React possui resumo reduzido e editor simples. |
| Aba Tasks | Quadro de Tasks | Operacional | Ausente | Quatro estados, criação, edição e movimentação. O dataset atual possui Sprints sem Tasks. |
| Aba Histórico | Histórico da Sprint | Operacional | Ausente | Consome `painelpro-db.auditLogs`. |
| Aba Destaque | Destaque executivo | Operacional | Parcial | React possui checkbox no detalhe, mas o Dashboard React não consome os itens marcados. |

### 3.1 Navegação React observada

Os botões internos atualizam a página e o hash. Alterações de hash feitas externamente na mesma sessão não atualizam o estado porque `App.tsx` não assina o evento `hashchange`. Back/forward e links profundos precisam ser tratados na Fase 1 com React Router.

## 4. Evidências visuais congeladas

As imagens foram capturadas diretamente das versões servidas localmente, sem alteração de dados.

### 4.1 Legado — Golden Master

| Evidência | Arquivo |
|---|---|
| Kanban | [legacy-kanban.png](docs/migration-baseline/screenshots/legacy-kanban.png) |
| Dashboard Gover | [legacy-dashboard-gover.png](docs/migration-baseline/screenshots/legacy-dashboard-gover.png) |
| Superintendência | [legacy-superintendencia.png](docs/migration-baseline/screenshots/legacy-superintendencia.png) |
| Previsão de PF | [legacy-previsao-pf.png](docs/migration-baseline/screenshots/legacy-previsao-pf.png) |
| Cadastros | [legacy-cadastros.png](docs/migration-baseline/screenshots/legacy-cadastros.png) |
| Nova Atualização | [legacy-nova-atualizacao.png](docs/migration-baseline/screenshots/legacy-nova-atualizacao.png) |
| Detalhe da Sprint / Tasks | [legacy-sprint-details-tasks.png](docs/migration-baseline/screenshots/legacy-sprint-details-tasks.png) |
| Tentativa de Sala de Situação | [legacy-sala-situacao.png](docs/migration-baseline/screenshots/legacy-sala-situacao.png) — evidencia o redirecionamento atual para Kanban. |

### 4.2 React — estado anterior à migração estruturada

| Evidência | Arquivo |
|---|---|
| Kanban React atual | [react-current-kanban.png](docs/migration-baseline/screenshots/react-current-kanban.png) |
| Dashboard React atual | [react-current-dashboard.png](docs/migration-baseline/screenshots/react-current-dashboard.png) |
| Previsão de PF React atual | [react-current-previsao-pf.png](docs/migration-baseline/screenshots/react-current-previsao-pf.png) |
| Cadastros React atual | [react-current-cadastros.png](docs/migration-baseline/screenshots/react-current-cadastros.png) |

## 5. Inventário de persistência local

### 5.1 Chaves funcionais

| Chave | Conteúdo | Escritores principais | Leitores principais |
|---|---|---|---|
| `painelpro-sprints` | Sprints, OS, Tasks embutidas, PF, destaque e responsáveis | `app.js`, `detail-editor.js`, `featured-highlights.js`, repositórios | Kanban, detalhes, dashboards, forecast, React atual |
| `painelpro-db` | `auditLogs`, `decisions`, `alerts` | `domain.js`, `featured-highlights.js` | Histórico e Sala de Situação |
| `painelpro-cadastros` | Sistemas, POs, gerentes, analistas, prioridades e etiquetas | `app.js` | Cadastros, filtros e formulários |
| `painelpro-labels` | Etiquetas com nome e cor em formato legado | `label-manager.js` | Cards, filtros e editores |
| `painelpro-label-colors` | Mapa etiqueta → cor | `app.js` | Cards e Cadastros |
| `painelpro-system-colors` | Mapa sistema/projeto → cor | `app.js` | Cards, dashboards e Superintendência |
| `painelpro-relationships` | Gerentes e vínculos organizacionais | `app.js` | Cadastros, filtros e detalhes |
| `painelpro-pf-improvements` | Pontos de melhoria da página PF | `app.js` | Forecast mensal |
| `painelpro-kanban-saved-view` | Filtros e ordenação salvos | `app.js` | Toolbar/Menu do Kanban |
| `painelpro-kanban-preferences` | Ordenação e raias recolhidas | `app.js` | Kanban |

### 5.2 Chaves de migração/versionamento

- `painelpro-dataset-version` — atualmente `spreadsheet-2026-08-31-v1`.
- `painelpro-delivered-data-version` — atualmente `delivered-sprints-2026-09-01-v2`.
- `painelpro-workflow-migrated-v2`.
- `painelpro-initial-project-manager-v1`.
- `painelpro-official-systems-v1` aparece em limpeza de versão anterior.

### 5.3 Risco crítico de dados congelado

Quando `painelpro-dataset-version` diverge, `app.js` substitui `painelpro-sprints` pelo seed e remove banco local, cadastros, etiquetas, cores, relacionamentos, melhorias, visão salva e versão de entregas. Esse comportamento conflita com o roadmap e deve ser substituído por migração idempotente e não destrutiva antes de qualquer cutover.

Além disso, o bootstrap atual preenche automaticamente alguns campos ausentes — responsável técnico, critério de aceite, PF, PF detalhado e previsão mensal. Esses defaults devem ser classificados na Fase 1 entre regra legítima, compatibilidade e dado fabricado; não devem ser reproduzidos silenciosamente em um domínio novo.

## 6. Modelo funcional observado

### 6.1 Sprint/OS

Campos encontrados:

- `code`, `system`, `project`, `sprintNumber`, `serviceOrder`, `objective`;
- `lane`, `position`, `progress`, `expectedProgress`, `health`, `priorityLevel`;
- `po`, `projectManager`, `manager`, `technicalLead`;
- `start`, `end`, `lastUpdated`, `enteredLaneAt`;
- `tasks`, `blocked`, `impediments`, `risks`, `deliveries`;
- `functionPoints`, `detailedFunctionPoints`, `billingForecastMonth`, `invoicedAt`;
- `sourceStatus`, `deliveryStatus`;
- `labels`, `taskItems`, `nextMilestone`, `acceptanceCriteria`;
- `isFeatured`, `featuredNote`, `featuredType`, `featuredAt`, `featuredUpdatedAt`, `featuredBy`;
- `metrics` e `healthAnalysis` derivados.

### 6.2 Task

Campos observados:

- `id`, `title`, `owner`, `points`, `status`;
- status permitidos: `A Fazer`, `Em Andamento`, `Bloqueada`, `Concluída`.

As Tasks permanecem embutidas em `Sprint.taskItems` no localStorage. O schema Supabase já prevê tabela separada.

### 6.3 Auditoria

Registros locais possuem:

- `id`, `action`, `entity`, `entityId`, `details`, `user`, `createdAt`.

### 6.4 Previsão e melhoria

Pontos de melhoria possuem título, status, prazo, resolução e data de resolução. Forecast é calculado por `billingForecastMonth`, raia e valores estimado/detalhado.

## 7. Regras de negócio inventariadas

### 7.1 Workflow da Sprint

Ordem fixa e canônica:

1. `planning` — Em planejamento;
2. `planned` — Planejado;
3. `development` — Em desenvolvimento;
4. `homologation` — Em homologação;
5. `approved` — Homologado;
6. `billing` — Aguardando faturamento;
7. `completed` — Faturado.

- Não há limite de WIP; todos os limites estão como `Infinity`.
- “Crítica” é prioridade, não raia.
- “Atenção” é etiqueta, não raia.
- Cards podem ser reordenados dentro da mesma raia.
- Cards podem ser movidos entre raias por drag-and-drop e teclado.
- `Alt + ←/→` move entre raias.
- `Enter` ou espaço abre detalhes na aba Tasks.
- Mudança de raia atualiza `enteredLaneAt` e `lastUpdated` e gera auditoria.
- Voltar de etapas finais ou avançar com dependências pendentes pode exigir confirmação.

### 7.2 Progresso e saúde

- Quando Tasks possuem pontos, progresso real = pontos concluídos ÷ pontos totais.
- Sem pontos, preserva-se o progresso informado na Sprint.
- Saúde é limitada entre 0 e 100 e considera desvio do progresso esperado, bloqueios, impedimentos e riscos.
- Faixas atuais: saudável ≥ 80; atenção ≥ 60; crítico < 60.
- Saúde derivada não substitui a prioridade manual.

### 7.3 PF e faturamento

- PF estimado é armazenado em `functionPoints`.
- PF detalhado é armazenado em `detailedFunctionPoints`.
- O editor habilita PF detalhado apenas em `billing` ou `completed`.
- Previsão mensal é armazenada em `billingForecastMonth` no formato `YYYY-MM`.
- A previsão pode ser movida para outro mês e a alteração é auditada.
- Entrar em `completed` registra `invoicedAt`.
- A tela mensal filtra Sprints pela competência selecionada.
- OS em `billing` sem PF detalhado gera ponto crítico.
- Comparativos exibem estimado, detalhado, diferença absoluta e percentual.
- Raias vazias não devem aparecer na seção Previsão por OS.

### 7.4 Filtros

Kanban:

- texto livre;
- projeto base sem número da Sprint;
- PO;
- gerente;
- prioridade;
- etiqueta;
- situação operacional: bloqueios, atraso e sem atualização.

Forecast:

- mês;
- projeto;
- OS;
- PO;
- gerente;
- raia.

### 7.5 Destaque executivo

- A Sprint pode ser marcada ou desmarcada no menu do card e no detalhe.
- O texto executivo possui até 280 caracteres.
- A alteração registra autor e datas e gera auditoria.
- Dashboard Gover e Superintendência leem as Sprints destacadas.
- Clicar no destaque volta ao Kanban e abre a Sprint.

## 8. Inventário de ações mutáveis

| Ação | Entidade afetada | Persistência | Reflexos derivados | Auditoria observada |
|---|---|---|---|---|
| Criar Sprint | Sprint/OS | `painelpro-sprints` | Kanban, Dashboard, Forecast, filtros | `SPRINT_CREATED` |
| Editar Sprint | Sprint/OS | `painelpro-sprints` | Todas as telas derivadas | `SPRINT_UPDATED` |
| Mover Sprint | Sprint/OS | `painelpro-sprints` | Contagens, indicadores, Forecast | mudança de raia registrada |
| Reordenar card | Sprint.position | `painelpro-sprints` | Ordem da raia | `SPRINT_REORDERED` |
| Criar Task | Task + Sprint | `painelpro-sprints` | Progresso, saúde e bloqueios | evento de Task |
| Editar/mover Task | Task + Sprint | `painelpro-sprints` | Progresso, saúde, Kanban e Dashboard | `TASK_UPDATED` |
| Alterar PF | Sprint/OS | `painelpro-sprints` | Forecast e detalhes | dentro de `SPRINT_UPDATED`/`TASK_UPDATED` |
| Alterar competência | Sprint/OS | `painelpro-sprints` | Forecast do mês antigo e novo | guarda mês anterior e novo |
| Faturar | Sprint/OS | `painelpro-sprints` | Forecast, KPIs e entregas | registra raia e `invoicedAt` |
| Destacar | Sprint | `painelpro-sprints` + `painelpro-db` | Dashboard e Superintendência | `SPRINT_HIGHLIGHT_*` |
| Salvar visão | Filtros | `painelpro-kanban-saved-view` | Toolbar do Kanban | não observada |
| Alterar cadastros | Registro + vínculos | chaves de cadastro/relacionamento | Formulários, filtros e detalhes | parcial/não uniforme |
| Adicionar/resolver melhoria | Melhoria PF | `painelpro-pf-improvements` | Painel de melhorias | não observada |
| Registrar decisão | Decisão | `painelpro-db` | Sala de Situação/Histórico | `DECISION_CREATED` |

## 9. Relacionamentos organizacionais

Persistidos em `painelpro-relationships`:

```text
Gerente 1 ── N POs
PO 1 ── N Projetos
Projeto 1 ── N Sprints
Projeto 0..1 ── Analista CGTIC
Projeto 0..1 ── Analista de Negócio
```

Estrutura atual:

- `managers`: lista de gerentes;
- `poManager`: mapa PO → gerente;
- `systemPO`: mapa sistema/projeto → PO;
- `systemAnalysts`: mapa sistema/projeto → `{ cgtic, business }`.

Ao selecionar um sistema na criação de Sprint, o PO vinculado deve ser preenchido automaticamente. O gerente é derivado do PO. Analistas aparecem no Resumo, não no card compacto.

## 10. Componentes e serviços reaproveitáveis

O HTML legado não deve ser copiado diretamente para componentes React, mas estas responsabilidades podem orientar portas e adapters:

- `renderSprintCard` — contrato visual e conteúdo do card.
- `renderTaskBoard` — agrupamento dos quatro estados de Task.
- `ProgressService` / `SprintProgressService` — cálculo de progresso.
- `HealthService` / `SprintHealthService` — cálculo de saúde.
- `PfForecastService` — normalização de mês e resumo de PF.
- `AuditService` e `DecisionService` — registros locais.
- `LocalSprintRepository` / `ApiSprintRepository` — ponto inicial para Repository Interface.
- `AuthService` — autenticação preparada.
- funções de cor de sistema/etiqueta — devem migrar para tokens semânticos.

Antes da reutilização, eliminar duplicação entre `domain.js` e `frontend/services/sprint-domain-service.js` e definir uma única implementação canônica por regra.

## 11. Matriz de paridade

Legenda: **OK** = disponível; **Parcial** = existe sem paridade; **Ausente** = não implementado; **Bloqueado** = há código, mas fluxo atual impede acesso.

| Capacidade | Legado | React atual | Status da migração | Fase-alvo |
|---|---|---|---|---|
| App Shell | OK | Parcial | Pendente | 3 |
| Rotas completas | OK | Parcial | Pendente | 1/3 |
| Kanban com 7 raias | OK | Parcial | Pendente | 4 |
| Rolagem horizontal estável | OK | Parcial | Pendente | 4/12 |
| Card Golden Master | OK | Parcial | Pendente | 4 |
| Busca | OK | Parcial | Pendente | 4 |
| Filtros completos | OK | Parcial | Pendente | 4/7 |
| Visão Kanban/Lista | OK | Parcial | Pendente | 4 |
| Nova Sprint | OK | Parcial | Pendente | 4/5 |
| Drag-and-drop | OK | Ausente | Pendente | 4 |
| Atalhos de teclado | OK | Ausente | Pendente | 4 |
| Menu de ações | OK | Ausente | Pendente | 4/5 |
| Sprint Details | OK | Parcial | Pendente | 5 |
| Aba Resumo | OK | Parcial | Pendente | 5 |
| Aba Tasks | OK | Ausente | Pendente | 6 |
| Aba Histórico | OK | Ausente | Pendente | 6 |
| Aba Destaque | OK | Parcial | Pendente | 5 |
| CRUD de Tasks | OK | Ausente | Pendente | 6 |
| Progresso por pontos | OK | Ausente na UI | Pendente | 6 |
| Auditoria | OK | Ausente | Pendente | 6 |
| Cadastros CRUD | OK | Ausente | Pendente | 7 |
| Cores de projeto/etiqueta | OK | Ausente/configuração não usada | Pendente | 2/7 |
| Vínculos organizacionais | OK | Ausente | Pendente | 7 |
| Dashboard Gover | OK | Parcial | Pendente | 8 |
| Destaques no Dashboard | OK | Ausente | Pendente | 8 |
| Forecast por mês | OK | Ausente | Pendente | 9 |
| Comparativo PF | OK | Ausente | Pendente | 9 |
| Pontos críticos/melhoria | OK | Ausente | Pendente | 9 |
| Superintendência | OK | Ausente | Pendente | 11 |
| Sala de Situação | Bloqueado/redirecionado | Ausente | Fora da prioridade atual | posterior |
| Responsividade validada | Parcial | Parcial | Pendente | 12 |
| Testes de domínio | Parcial | Ausente | Pendente | 1/13 |
| Testes E2E | Ausente | Ausente | Pendente | 13 |

## 12. Divergências e riscos para a Fase 1

1. **Risco de perda de dados:** bootstrap legado destrutivo em troca de versão.
2. **Domínio duplicado:** cálculos semelhantes em dois módulos com diferenças de implementação.
3. **Acesso direto ao storage:** UI e módulos complementares leem/escrevem localStorage sem Repository Interface.
4. **App React monolítico:** páginas, formulários e navegação estão concentrados em `src/App.tsx`.
5. **Tipos incompletos:** `Sprint.taskItems` usa `Record<string, unknown>` e não há contratos completos para cadastros, relacionamentos, auditoria e PF.
6. **Rotas incompletas:** React atual cobre somente quatro telas e não reage corretamente a todo o ciclo de navegação do hash.
7. **Dados automáticos não confiáveis:** templates de Tasks e defaults de responsáveis/PF podem criar informação que parece real.
8. **Módulos por observação de DOM:** `MutationObserver` e timers adicionam funcionalidades que podem passar despercebidas numa leitura superficial do `app.js`.
9. **Auditoria parcial:** algumas mutações de cadastros, filtros e melhorias não produzem evento uniforme.
10. **Sem controle de versão Git no diretório:** aumenta o risco de regressão durante a fundação.

## 13. Gate da Fase 0

- [x] Rotas mapeadas.
- [x] Telas mapeadas.
- [x] Screenshots principais do legado registrados.
- [x] Estado atual do React registrado.
- [x] Dados persistidos e chaves identificados.
- [x] Regras de negócio identificadas.
- [x] Ações mutáveis identificadas.
- [x] Relacionamentos organizacionais identificados.
- [x] Componentes e serviços reaproveitáveis identificados.
- [x] Matriz de paridade criada.
- [x] Riscos de regressão registrados.

## 14. Próxima fase autorizável

**Fase 1 — Fundação React.**

Antes de migrar qualquer página, a Fase 1 deve:

1. criar a estrutura de pastas definida no roadmap;
2. instalar/configurar React Router;
3. consolidar contratos completos do domínio;
4. criar Repository Interfaces sem trocar a fonte ativa;
5. encapsular o localStorage atrás de adapter;
6. criar migração não destrutiva e versionada;
7. configurar tratamento de erros e testes;
8. manter `/` e `/react/` funcionando em paralelo.

Nenhuma reconstrução de página foi iniciada na Fase 0.

## 15. Validação executada na conclusão

| Validação | Resultado |
|---|---|
| `npm run check` | Aprovado; sintaxe de `app.js`, `server.js` e `domain.js` válida. |
| `npm test` | Aprovado; testes de domínio e de serviço de Sprint passaram. |
| `npm run build:react` | Aprovado; Vite gerou o bundle em `react-dist/`. |
| Console do legado | Nenhum `error` ou `warn` capturado durante o registro. |
| Console do React | Nenhum `error` ou `warn` capturado durante o registro. |
| Lint | Não executado: o projeto ainda não possui script/configuração de lint. Deve ser criado na Fase 1. |
| Comparação visual | Evidências do legado e do React atual registradas lado a lado na seção 4. |

## 16. Relatório de conclusão da fase

**FASE:** 0 — Baseline e inventário do legado  
**STATUS:** concluída

**IMPLEMENTADO:**

- roadmap canônico adicionado ao repositório;
- inventário de rotas, telas, persistência, regras, mutações e relacionamentos;
- screenshots do Golden Master e do React atual;
- matriz de paridade e riscos de regressão;
- gate e preparação explícita para a Fase 1.

**ARQUIVOS CRIADOS/GERADOS:**

- `ROADMAP_PAINELPRO_REACT_CODEX.md`;
- `MIGRATION_BASELINE.md`;
- `docs/migration-baseline/screenshots/*.png`;
- `react-dist/` regenerado somente para validação do build existente.

**REGRESSÕES ENCONTRADAS:**

- nenhuma regressão causada pela Fase 0;
- foram registradas divergências preexistentes entre legado e React;
- a rota Sala de Situação está redirecionada no legado atual;
- foi identificado risco preexistente de reset destrutivo na mudança de versão do dataset.

**PENDÊNCIAS:**

- configurar Git no diretório correto;
- configurar lint e estrutura de testes React;
- iniciar a arquitetura da Fase 1 sem migrar páginas antes de estabilizar contratos e repositórios.

**PRÓXIMA FASE RECOMENDADA:** Fase 1 — Fundação React.
