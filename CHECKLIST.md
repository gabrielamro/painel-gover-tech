# PainelPro — Checklist de evolução

Legenda: `[x]` concluído · `[~]` parcialmente implementado · `[ ]` pendente

## Migração PainelPro React

- [x] Fase 0 — Baseline e inventário do legado.
- [x] Fase 1 — Fundação React, Router, domínio, serviços, Repository e testes.
- [x] Fase 2 — Design System PainelPro Next.
- [x] Fase 3 — App Shell definitivo.
- [x] Fase 4 — Paridade operacional do Kanban com o Golden Master.
- [x] Fase 5 — Detalhes da Sprint: Resumo, Tasks, Histórico e Destaque.
- [x] Fase 6 — Tasks e histórico auditável local-first.
- [x] Fase 7 — Cadastros e relacionamentos local-first.
- [x] Fase 8 — Dashboard Gover Next sincronizado.
- [x] Fase 9 — Previsão de PF Next sincronizada.
- [x] Fase 10 — Command Palette por atalho.
- [x] Fase 11 — Visão de Superintendência.
- [x] Fase 12 — Responsividade estrutural das rotas React.
- [~] Fase 13 — Testes: domínio e integração local cobertos; E2E pendente.
- [x] Fase 14 — Performance: carregamento sob demanda por rota.
- [~] Fase 15 — Gate de cutover documentado; substituição definitiva bloqueada por requisitos de produção.

## Previsão de PF Mês

- [x] Criar rota e navegação `Previsão de PF Mês`.
- [x] Criar filtros por competência, projeto, OS, PO, gerente e situação.
- [x] Exibir KPIs mensais de previsão, desenvolvimento, entrega, aguardando faturamento e faturado.
- [x] Separar PF estimado de PF detalhado.
- [x] Liberar PF detalhado nas etapas `Aguardando faturamento` e `Faturado`.
- [x] Criar gráfico comparativo com crescimento, redução ou estabilidade.
- [x] Criar gráfico de distribuição de PF por projeto e fluxo.
- [x] Exibir cards de OS agrupados por situação e conectados ao detalhamento existente.
- [x] Criar pontos críticos derivados dos dados do Kanban.
- [x] Criar cadastro e resolução persistente de pontos de melhoria.
- [x] Adicionar o botão `Adicionar ponto de melhoria`.
- [x] Permitir editar a competência da OS pelo cadastro da Sprint e pela Task.
- [x] Renomear visualmente a raia terminal para `Faturado`.
- [x] Adaptar a página para telas menores sem quebrar KPIs, gráficos ou cards.
- [ ] Migrar previsão, melhorias e faturamento de `localStorage` para API/banco.
- [ ] Aplicar permissões para confirmação financeira e auditoria multiusuário.

## Estado atual

- [x] Criar primeira página do Kanban de Sprints.
- [x] Criar 12 Sprints seed com os sistemas existentes.
- [x] Distribuir as Sprints nas raias Planejado, Em andamento, Em atenção, Crítica e Concluída.
- [x] Criar cards compactos de Sprint.
- [x] Exibir projeto, objetivo, PO, progresso, prazo, tasks, bloqueios, impedimentos, riscos e entregas.
- [x] Criar filtros por projeto e saúde.
- [x] Criar busca por Sprint, projeto ou objetivo.
- [x] Criar toggle entre visão Kanban e visão Lista.
- [x] Implementar drag-and-drop entre raias.
- [x] Persistir a raia alterada no navegador via `localStorage`.
- [x] Atualizar contadores, distribuição, progresso e alertas após movimentação.
- [x] Criar drawer de detalhe da Sprint.
- [x] Exibir tasks no drawer da Sprint.
- [x] Criar painel analítico lateral.
- [x] Criar indicador de avanço geral.
- [x] Criar distribuição das Sprints por raia.
- [x] Criar painel de principais alertas.
- [x] Criar painel de entregas recentes.
- [x] Centralizar cálculo de progresso, saúde e alertas em serviços de domínio iniciais.
- [x] Criar Tasks seed associadas às Sprints.
- [x] Criar edição detalhada dos Cards de Sprint.
- [x] Criar edição detalhada dos Subcards/Tasks.
- [x] Permitir avançar o status de uma Task pelo drawer.
- [x] Recalcular progresso, bloqueios e Health Score após alteração de Task.
- [x] Criar estados vazios para raias e alertas.
- [x] Criar layout responsivo básico.
- [x] Executar verificação sintática do JavaScript.
- [x] Criar camada de domínio local-first separada da UI.
- [x] Criar repositório local para auditoria, alertas e decisões.
- [x] Criar contratos iniciais das entidades do domínio.
- [x] Criar documentação de arquitetura.
- [x] Criar testes unitários dos serviços de domínio.

## Fase 1 — Base operacional do Kanban

- [x] Estrutura visual das raias.
- [x] Cards de Sprint.
- [x] Filtros e busca.
- [x] Drag-and-drop entre raias.
- [~] Persistência de posição: existe localmente, falta persistência no banco.
- [x] Rearranjar cards dentro da mesma raia.
- [~] Ordenação automática por criticidade, desvio e prazo; ordem manual já persistida.
- [ ] Atualização otimista com rollback em caso de erro de backend.
- [ ] Modal de confirmação para movimentos sensíveis.
- [~] Registro de histórico local de movimentações e reordenação; falta backend multiusuário.

## Fase 2 — Modelo Projeto → Sprint → Task

- [~] Dados seed simulando projetos e Sprints.
- [~] Tasks exibidas no detalhe da Sprint.
- [ ] Criar banco de dados real.
- [ ] Criar entidades `User`, `Project`, `Sprint` e `Task`.
- [ ] Criar entidades `Delivery`, `Impediment`, `Risk`, `Comment` e `SprintMetric`.
- [ ] Criar relacionamentos e migrações.
- [ ] Criar endpoint consolidado `getKanbanBoard(filters)`.
- [ ] Substituir `localStorage` por persistência no servidor.

## Fase 3 — Kanban interno de Tasks

- [x] Criar Kanban interno com as raias A Fazer, Em Andamento, Bloqueada e Concluída.
- [x] Permitir drag-and-drop de Tasks.
- [x] Editar status, progresso, prioridade e Story Points.
- [ ] Registrar impedimentos, riscos e comentários por Task.
- [x] Recalcular a Sprint ao mover uma Task.
- [x] Atualizar o Kanban principal sem recarregar a página.

## Fase 4 — Serviços de domínio

- [x] Criar `SprintProgressService` inicial.
- [x] Calcular progresso por Story Points concluídos nas Tasks visíveis.
- [ ] Implementar fallback por quantidade de Tasks.
- [ ] Calcular progresso esperado, tempo consumido, desvio e dias restantes.
- [x] Criar `SprintHealthService` inicial.
- [x] Calcular Health Score de 0 a 100.
- [x] Retornar score, status, motivos e recomendações.
- [ ] Criar `SprintStatusService`.
- [ ] Separar status manual de status calculado.
- [x] Detectar divergência entre status manual e análise automática.
- [x] Exibir recomendações automáticas de status no Kanban.
- [ ] Criar `PortfolioAnalyticsService` como fonte única dos KPIs.

## Fase 5 — Alertas e Sala de Situação

- [x] Criar `SprintAlertService` inicial.
- [ ] Implementar alertas de atraso, desvio, bloqueios e riscos.
- [ ] Implementar alertas de entrega ameaçada ou atrasada.
- [x] Implementar alerta visual de divergência de status.
- [ ] Criar entidade `Alert`.
- [x] Criar entidade `Decision` local-first.
- [x] Criar rota `/attention` com o nome Sala de Situação.
- [x] Permitir registrar decisão gerencial localmente.
- [ ] Ordenar itens por criticidade.

## Fase 6 — Histórico e auditoria

- [~] Criar entidade `AuditLog` local-first; falta persistência server-side.
- [ ] Registrar criação, edição e exclusão.
- [ ] Registrar drag-and-drop e mudança manual de status.
- [ ] Registrar sugestão automática de mudança.
- [ ] Registrar decisão de confirmar ou manter status.
- [x] Criar visualização do histórico recente no painel gerencial.
- [ ] Identificar usuário e data/hora em cada evento.

## Fase 7 — Dashboard Executivo sincronizado

- [~] Painel analítico inicial dentro do Kanban.
- [x] Criar rota `/dashboard`.
- [x] Criar página visual `Dashboard Gover` com KPIs, status dos sistemas, atividades e alertas.
- [x] Separar a Análise Executiva em aba própria, mantendo o Kanban focado na operação.
- [x] Criar raia `Em planejamento` e refletir a distribuição no Dashboard Gover.
- [x] Atualizar fluxo operacional: `Em desenvolvimento`, `Em homologação`, `Homologado` e `Aguardando faturamento`.
- [x] Converter `Crítica` em prioridade e `Atenção` em etiqueta durante a migração dos dados.
- [x] Padronizar nomenclatura oficial dos sistemas no formato `SISTEMA - Sprint N`.
- [x] Corrigir `Siecx` para `SCIEX`.
- [x] Incluir SCME, MCI, MEAAP, MAPI, MPPB e MCPP no seed do Kanban.
- [x] Consumir os mesmos dados do Kanban.
- [x] Criar gráfico de evolução Planejado x Real.
- [ ] Permitir filtros por portfólio, projeto e Sprint.
- [ ] Criar matriz de riscos.
- [ ] Criar indicadores de tarefas, impedimentos, riscos e entregas.
- [ ] Garantir que não existam cálculos duplicados no frontend.

## Fase 8 — Operação do PO

- [x] Criar rota `/update` com o nome Nova Atualização.
- [ ] Selecionar Projeto e Sprint.
- [ ] Listar Tasks da Sprint.
- [x] Atualizar Task.
- [ ] Registrar impedimento.
- [ ] Registrar risco.
- [ ] Registrar entrega.
- [x] Adicionar comentário.
- [x] Exibir feedback de salvamento.

## Fase 9 — Segurança e qualidade

- [ ] Implementar autenticação.
- [ ] Implementar permissões de PO, gerente e administrador.
- [ ] Validar payloads com schemas.
- [ ] Adicionar loading states e skeletons.
- [ ] Adicionar error boundaries e estados de erro.
- [ ] Melhorar acessibilidade por teclado e leitores de tela.
- [x] Adicionar testes unitários dos serviços de domínio.
- [ ] Adicionar testes de integração das ações de Kanban.
- [ ] Adicionar testes end-to-end dos fluxos principais.
- [ ] Executar lint, typecheck, testes e build em CI.

## Fase 10 — Deploy e operação

- [ ] Definir stack definitiva do projeto.
- [ ] Configurar ambiente de desenvolvimento, homologação e produção.
- [ ] Configurar banco de produção.
- [ ] Configurar variáveis de ambiente e segredos.
- [ ] Configurar logs e monitoramento.
- [ ] Configurar backup e recuperação do banco.
- [ ] Publicar a aplicação.
- [ ] Validar responsividade em 1920×1080, 1600×900 e 1366×768.

## Próximo passo recomendado

1. Escolher a stack definitiva (por exemplo, Next.js + TypeScript + Prisma + PostgreSQL).
2. Migrar os dados seed para o banco.
3. Implementar `getKanbanBoard(filters)`.
4. Conectar o drag-and-drop a uma mutation transacional.
5. Criar os serviços de progresso, saúde e alertas.
