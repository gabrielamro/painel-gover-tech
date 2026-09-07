# PainelPro — Roadmap de melhoria do Kanban

## Visão de produto

O Kanban deve permitir que um gestor responda em poucos segundos:

1. Em que etapa está cada Sprint?
2. O que está bloqueado ou atrasado?
3. Qual item exige ação hoje?
4. Quem é o responsável?
5. Qual é o próximo marco da entrega?

O Kanban deve ser uma visão operacional. Gráficos e análise agregada permanecem no Dashboard Gover.

## Diagnóstico atual

### O que funciona bem

- Fluxo visual por raias.
- Drag-and-drop de Sprints e Tasks.
- Busca, filtros básicos e visão em lista.
- Cards ligados a progresso, Health Score e Tasks.
- Popup com detalhes e edição.
- Dados compartilhados com o Dashboard Gover.

### Problemas de experiência

- Os cards exibem muitas métricas com o mesmo peso visual.
- Informações sem ocorrência, como `0 bloqueios` e `0 riscos`, geram ruído.
- Sete raias em uma tela exigem muito scroll horizontal.
- `Planejado` e `Em planejamento` precisam de definições distintas para não parecerem duplicadas.
- Saúde, prioridade, etiqueta e etapa do fluxo ainda se confundem visualmente.
- O popup reúne resumo e Kanban interno de Tasks em um espaço pequeno.
- Filtros não cobrem prioridade, etiquetas, PO, prazo, bloqueios e atraso.
- A criação de etiquetas por prompt não oferece gerenciamento adequado de cor, nome e uso.
- Não há indicador claro de última atualização ou item sem atualização recente.
- Não há limite de trabalho em andamento por raia.

### Riscos técnicos

- Regras e renderização estão concentradas em `app.js`.
- Existem cálculos duplicados entre `app.js`, `domain.js` e scripts auxiliares.
- Vários `MutationObserver` e `setInterval` alteram a interface depois da renderização.
- O estado definitivo ainda está em `localStorage`.
- O CSS acumulou sobrescritas e precisa ser separado por componente.

## Modelo visual recomendado para o card

### Sempre visível

- Sistema e número da Sprint: `SCIEX · Sprint 1`.
- Objetivo resumido em até duas linhas.
- Etapa atual.
- Progresso real e planejado.
- Data final ou dias restantes.
- Responsável principal.
- Prioridade.
- Etiquetas atribuídas.

### Visível somente quando houver ocorrência

- Tasks bloqueadas.
- Impedimentos.
- Riscos.
- Atraso.
- Divergência entre etapa manual e recomendação automática.

### Mover para o popup

- Total de entregas.
- Quantidade total de Tasks.
- Detalhamento de riscos e impedimentos.
- Health Score numérico completo.
- Histórico e auditoria.
- Métricas técnicas secundárias.

## Proposta de hierarquia do card

```text
SCIEX · Sprint 1                 PRIORIDADE ALTA
Integração de serviços

Real 48%  ━━━━━━━━━━░░  Planejado 65%
Fim em 4 dias                    Ana Paula

[Atenção] [Dependência externa]
⚑ 2 bloqueadas    ⚠ 1 impedimento
```

## Definição das raias

| Raia | Definição de entrada | Definição de saída |
|---|---|---|
| Em planejamento | Escopo, responsáveis ou datas ainda estão sendo definidos | Planejamento aprovado |
| Planejado | Escopo, responsáveis, prazo e critérios de aceite aprovados | Desenvolvimento iniciado |
| Em desenvolvimento | Há Tasks em execução | Pacote disponibilizado para homologação |
| Em homologação | Validação funcional em andamento | Aceite formal registrado |
| Homologado | Aceite concluído | Documentação e faturamento preparados |
| Aguardando faturamento | Entrega aceita aguardando processo financeiro | Faturamento concluído |
| Concluída | Entrega e encerramento registrados | Estado terminal |

`Crítica` deve ser prioridade, não raia. `Atenção` deve ser etiqueta, não raia.

## Campos que estão faltando

### Sprint

- Prioridade: Baixa, Média, Alta ou Crítica.
- Etiquetas com cor e descrição.
- Última atualização.
- Próximo marco.
- Critério de aceite.
- Dependências externas.
- Data prevista de homologação.
- Data de aceite/homologação.
- Previsão e situação do faturamento.
- Percentual planejado.
- Responsável técnico além do PO.
- Motivo do bloqueio.
- Indicador de dados desatualizados.

### Task

- Tipo: História, Bug, Tarefa ou Melhoria.
- Prioridade.
- Responsável.
- Story Points.
- Prazo.
- Dependências.
- Critério de aceite.
- Impedimento e risco vinculados.
- Data da última atualização.

## Roadmap priorizado

### P0 — Clareza e operação diária

Prazo sugerido: 1 a 2 ciclos.

- Redesenhar o card com hierarquia visual e informações condicionais.
- Diferenciar visualmente prioridade, saúde, etiqueta e etapa.
- Formalizar as regras de entrada e saída das raias.
- Adicionar filtros por PO, prioridade, etiqueta, prazo, atraso e bloqueio.
- Exibir filtros ativos como chips com ação `Limpar tudo`.
- Criar editor real de etiquetas: nome, cor, descrição, editar e excluir.
- Permitir atribuir múltiplas etiquetas a uma Sprint.
- Exibir `última atualização` e alerta de dado desatualizado.
- Ampliar o popup e organizar em abas: Resumo, Tasks, Riscos e Histórico.
- Confirmar movimentos sensíveis, como `Homologado → Em desenvolvimento`.
- Registrar toda mudança de raia no histórico.

Critérios de aceite:

- Um card sem problemas não deve mostrar indicadores zerados.
- Um card crítico deve ser identificado em até três segundos.
- O usuário deve aplicar e remover filtros sem recarregar a página.
- Prioridade, saúde, etiqueta e raia devem usar linguagens visuais distintas.
- Toda movimentação deve identificar origem, destino, usuário e horário.

Status de implementação — 26/08/2026:

- [x] Card redesenhado com prioridade, etiquetas, progresso real × planejado, PO, prazo e exceções.
- [x] Filtros por projeto, PO, prioridade, etiqueta, etapa, saúde e situação, com chips e limpeza total.
- [x] Popup ampliado em abas: Resumo, Tasks, Riscos e Histórico.
- [x] Editor de Sprint com prioridade, múltiplas etiquetas, marco, aceite e responsáveis.
- [x] Gerenciador de etiquetas com nome, cor, uso e exclusão protegida.
- [x] Criação de Sprint pelo Kanban.
- [x] Confirmação e auditoria para movimentações sensíveis entre raias.
- [ ] Filtro específico de prazo por intervalo e dependências externas (P1).
- [ ] Limites de WIP, ações em lote, visões salvas e ordenação (P1).

### P1 — Produtividade e controle do fluxo

Prazo sugerido: 2 a 4 ciclos.

- Permitir recolher e expandir raias.
- Criar cabeçalhos fixos durante o scroll horizontal.
- Adicionar limites de WIP por raia.
- Alertar quando uma raia exceder seu limite.
- Criar ordenação por prioridade, prazo, atraso, atualização e posição manual.
- Salvar visões pessoais de filtro e ordenação.
- Criar ações em lote para responsável, prioridade, etiqueta e raia.
- Adicionar botão `Nova Sprint` e estado vazio acionável.
- Exibir dependências entre Sprints.
- Criar indicador de tempo na raia.
- Adicionar atualização otimista com rollback em falha.
- Melhorar drag-and-drop por teclado e leitores de tela.

Status de implementação — 26/08/2026:

- [x] Recolher e expandir raias, mantendo a preferência local.
- [x] Destacar cabeçalhos das raias durante a navegação do board.
- [x] Quantidade livre de Sprints por raia, sem bloqueio ou confirmação por limite.
- [x] Ordenação por posição manual, prioridade, prazo, atualização e saúde.
- [x] Salvar e restaurar uma visão pessoal de filtros e ordenação.
- [x] Ações em lote para PO, prioridade, etiquetas e raia, com auditoria por Sprint.
- [x] Dependências entre Sprints, com bloqueio de avanço sensível e contexto no card/popup.
- [x] Abrir cards pelo teclado e mover Sprints com Alt + setas, com confirmações.
- [x] Indicação de foco, instruções de teclado e rótulos para leitores de tela.

Critérios de aceite:

- O sistema deve impedir ou confirmar movimentos incompatíveis.
- Alterações em lote devem gerar um evento de auditoria por Sprint.
- O Kanban deve continuar fluido com pelo menos 50 Sprints.

### P2 — Inteligência e previsibilidade

Prazo sugerido: 4 a 6 ciclos.

- Calcular previsão de conclusão por velocidade e capacidade.
- Sugerir mudança de prioridade sem alterar automaticamente a raia.
- Detectar Sprint parada por ausência de atualização.
- Identificar gargalos por tempo médio em cada raia.
- Medir lead time e cycle time.
- Prever risco de atraso e de faturamento.
- Recomendar redistribuição de capacidade.
- Criar explicação auditável para cada recomendação.

Status de implementação — 26/08/2026:

- [x] Detectar Sprint parada por ausência de atualização e permanência na raia.
- [x] Sinalizar risco de prazo a partir de desvio, bloqueios, riscos e dependências.
- [x] Exibir recomendação explicável no card e no popup, sem mover Sprint automaticamente.
- [x] Registrar o reinício de tempo na raia após movimentação.
- [ ] Calcular previsão por velocidade/capacidade, lead time e cycle time com histórico real.
- [ ] Recomendar redistribuição de capacidade e risco de faturamento.

Critérios de aceite:

- Toda recomendação deve mostrar motivo e dados utilizados.
- O usuário deve poder aceitar ou rejeitar uma recomendação.
- A decisão deve ficar registrada no histórico.
- O modelo analítico não pode alterar status sem confirmação humana.

### P3 — Fundação técnica para produção

Prazo sugerido: paralelo a P0 e P1.

- Migrar o frontend para componentes React/TypeScript.
- Separar `SprintKanban`, `KanbanLane`, `SprintCard`, filtros e popup.
- Consolidar regras em serviços de domínio únicos.
- Remover observadores e intervalos usados como remendos de renderização.
- Migrar `localStorage` para API e PostgreSQL.
- Implementar endpoint consolidado do board.
- Adicionar autenticação e perfis de acesso.
- Criar testes de integração e ponta a ponta.
- Instrumentar logs, métricas e monitoramento.

Critérios de aceite:

- Kanban e Dashboard devem consumir a mesma resposta analítica.
- Nenhuma regra de negócio deve existir somente no componente visual.
- Falhas de persistência devem reverter alterações otimistas.
- Permissões devem ser validadas no servidor.

## Ordem recomendada de execução

1. Definir o contrato das raias e dos campos.
2. Redesenhar o card e o popup.
3. Completar filtros e etiquetas.
4. Implementar histórico e validação das movimentações.
5. Adicionar recolhimento de raias, WIP e ações em lote.
6. Migrar persistência e autenticação.
7. Adicionar inteligência de fluxo e previsões.

## Métricas de sucesso

- Tempo para localizar uma Sprint crítica: até 5 segundos.
- Tempo para identificar o responsável e o próximo marco: até 10 segundos.
- Movimentações revertidas por erro: menos de 1%.
- Sprints sem atualização há mais de 7 dias: redução contínua.
- Percentual de cards com campos obrigatórios completos: acima de 95%.
- Tempo médio em cada raia e gargalo do fluxo visíveis ao gestor.

## Decisões recomendadas do CPO/CTO

- Não acrescentar todos os campos ao card; usar exposição progressiva.
- Manter gráficos fora do Kanban.
- Tratar prioridade, saúde, etiqueta e etapa como conceitos independentes.
- Usar o popup como central de detalhes e ações da Sprint.
- Priorizar P0 antes de expandir o dashboard ou a Sala de Situação.
- Iniciar a migração técnica antes de adicionar recursos analíticos avançados.
