# Painel Gover Tech — Roadmap da Previsão de PF por Mês

## Status

**Situação:** primeira versão funcional entregue no frontend local-first.

**Implementação:** rota, filtros, KPIs, gráficos, cards por situação, pontos críticos, melhorias, competência mensal, PF estimado e PF detalhado implementados. Persistência em API, permissões e faturamento parcial permanecem no roadmap técnico.

## Atualização implementada — dois tipos de PF

- `PF estimado` é informado desde o planejamento da OS e permanece como base da previsão.
- `PF detalhado` é liberado quando a OS está em `Aguardando faturamento` ou `Faturado`.
- O gráfico compara apenas OSs elegíveis a PF detalhado para não produzir uma variação artificial.
- A página apresenta valor absoluto, diferença em PF, percentual e direção: crescimento, redução ou sem alteração.
- A competência continua pertencendo integralmente à OS e pode ser movida entre meses.

Este documento define o roadmap da nova página `Previsão de PF Mês`, da competência prevista de faturamento da OS — visível e editável no cadastro da Task — e da mudança da raia terminal de `Concluída` para `Faturado`.

## Objetivo de produto

Criar uma visão mensal que permita ao CPO, CTO e gestores responder rapidamente:

1. Quantos Pontos de Função estão previstos para cada mês?
2. Quantas OSs estão em execução e em qual situação?
3. Quanto foi entregue, quanto aguarda faturamento e quanto já foi faturado?
4. Quais Tasks ameaçam a previsão mensal?
5. Quais pontos críticos exigem ação?
6. Quais melhorias foram identificadas e quais já foram resolvidas?
7. Como cada projeto está distribuído entre preparação, desenvolvimento e fluxo de entrega?

## Decisões de domínio recomendadas

### 1. Unidade de acompanhamento

- A OS é a unidade financeira e de faturamento.
- A Sprint continua sendo a unidade operacional exibida no Kanban.
- A Task é a unidade operacional pela qual o PO consulta ou altera a competência prevista da OS.
- Sistema/projeto é a unidade de consolidação dos gráficos.

### 2. PF e competência pertencem à OS

A OS será faturada integralmente em uma única competência prevista. Ao mover a previsão para outro mês, todos os PF da OS saem do mês anterior e entram no novo mês.

Modelo recomendado:

- `sprint.functionPoints`: total contratado ou estimado da OS/Sprint.
- `sprint.billingForecastMonth`: competência vigente da OS no formato `AAAA-MM`.
- O cadastro e a edição da Task exibem o campo `Previsão de faturamento da OS`, mas salvam o valor na OS pai.
- Todas as Tasks da mesma OS exibem a mesma competência.
- Alterar a competência por qualquer Task atualiza a OS e passa a valer para todo o cálculo mensal.
- O histórico deve preservar competência anterior, nova competência, autor, data e justificativa.
- A previsão mensal contabiliza o PF total da OS uma única vez, mesmo que ela possua várias Tasks.

Esta regra pressupõe faturamento integral da OS. Faturamento parcial ou rateio entre meses fica fora do escopo inicial e exigirá futuramente uma entidade `BillingForecastAllocation`.

### 3. Competência mensal

O cadastro e a edição da Task devem oferecer os doze meses do ano selecionado:

- Janeiro
- Fevereiro
- Março
- Abril
- Maio
- Junho
- Julho
- Agosto
- Setembro
- Outubro
- Novembro
- Dezembro

O valor persistido na OS deve incluir ano e mês (`AAAA-MM`). Exibir apenas o nome do mês sem o ano causaria conflito entre exercícios diferentes.

Ao reprogramar a OS:

- Remover seus PF do total previsto do mês anterior.
- Somar seus PF ao novo mês.
- Atualizar imediatamente KPIs, cards e gráficos.
- Registrar a movimentação no histórico.
- Exigir justificativa quando a OS já estiver em homologação, homologada ou aguardando faturamento.

### 4. Raia terminal

- Renomear visualmente `Concluída` para `Faturado`.
- Recomenda-se migrar o identificador interno de `completed` para `invoiced`.
- Registros existentes em `completed` devem ser migrados para `invoiced` uma única vez.
- A mudança não altera o status `Concluída` das Tasks; ela vale apenas para a raia de Sprints/OSs.
- A entrada em `Faturado` deve registrar `invoicedAt`, usuário, valor de PF faturado e evento de auditoria.
- Uma OS só deve entrar em `Faturado` quando o faturamento estiver confirmado. Homologação ou aceite não significam faturamento.

### 5. Definições dos indicadores

| Indicador | Definição recomendada |
|---|---|
| Previsão total de PF do mês | Soma de `sprint.functionPoints` das OSs cuja competência vigente seja o mês selecionado |
| OSs em desenvolvimento | Quantidade distinta de OSs com Sprint em `Em desenvolvimento` |
| Quantidade entregue | OSs que atingiram `Homologado` no mês selecionado, usando o histórico de movimentação |
| Total já faturado no mês | Soma de PF das OSs que entraram em `Faturado` no mês selecionado |
| Total faturado acumulado | Soma histórica de PF faturado até o fim do mês selecionado |
| Aguardando faturamento | OSs na raia `Aguardando faturamento` |
| OS sem previsão | OSs que ainda não possuem `billingForecastMonth` definido |

`Entregue`, `homologado`, `aguardando faturamento` e `faturado` devem permanecer conceitos diferentes.

## Estrutura da página `Previsão de PF Mês`

### 1. Cabeçalho e filtros

- Seletor de ano.
- Seletor de mês.
- Sistema/projeto.
- OS.
- PO.
- Gerente de Projetos.
- Analista CGTIC.
- Analista de Negócio.
- Situação da Sprint/OS.
- Prioridade e etiquetas.
- Botão para limpar filtros.
- Data e hora da última atualização.

Os filtros devem atualizar todos os KPIs, cards, pontos críticos, melhorias e gráficos simultaneamente.

### 2. KPIs do mês

- `PF previstos no mês`.
- `OSs sem previsão de faturamento`.
- `OSs em desenvolvimento`.
- `OSs entregues no mês`.
- `PF aguardando faturamento`.
- `PF faturados no mês`.
- `PF faturados acumulados`.

Cada KPI deve ser clicável e aplicar o recorte correspondente à lista de OSs.

### 3. OSs em andamento por situação

Exibir cards de OS agrupados pelas situações:

- Em planejamento.
- Planejado.
- Em desenvolvimento.
- Em homologação.
- Homologado.
- Aguardando faturamento.

Cada card deve mostrar:

- Sistema/projeto e cor cadastrada.
- Número da OS.
- Sprint.
- Objetivo resumido.
- Situação atual.
- PF total e competência prevista vigente.
- PO e responsáveis do projeto no detalhamento.
- Competência prevista.
- Progresso.
- Tasks bloqueadas ou críticas.
- Última movimentação relevante.

O clique deve abrir o mesmo detalhamento da Sprint/Tasks usado pelo Kanban, preservando a fonte única de dados.

### 4. Pontos críticos

Criar uma área priorizada por impacto e prazo com:

- Task bloqueada.
- OS sem competência de faturamento.
- OS sem PF informado.
- Tasks da mesma OS exibindo competência divergente por dado legado.
- OS prevista para o mês sem homologação próxima.
- OS aguardando faturamento além do prazo definido.
- OS sem atualização recente.
- Mudança de competência após homologação.

Cada ponto crítico deve informar causa, impacto em PF, responsável, próxima ação e prazo.

### 5. Pontos de melhoria

Criar uma entidade persistente de melhoria, sem usar apenas um checkbox solto na interface:

- Título.
- Descrição.
- Projeto/OS/Task relacionados.
- Responsável.
- Prioridade.
- Data de identificação.
- Prazo.
- Status: `A analisar`, `Em tratamento` ou `Resolvido`.
- Checkbox de resolução.
- `resolvedAt` e `resolvedBy`.
- Evidência ou observação da solução.
- Histórico de alterações.

Marcar como resolvido deve exigir confirmação e registrar auditoria. A melhoria resolvida continua consultável no histórico.

### 6. Gráfico horizontal por projeto

Exibir uma linha por sistema/projeto e duas séries comparáveis:

- `Preparação e execução`: Em planejamento + Planejado + Em desenvolvimento.
- `Fluxo de entrega`: Em homologação + Homologado + Aguardando faturamento.

Recomendações:

- Permitir alternar a métrica entre quantidade de OSs e quantidade de PF.
- Mostrar valores exatos em tooltip.
- Clicar em uma barra deve filtrar os cards correspondentes.
- Não incluir `Faturado` nas duas séries; exibi-lo como referência separada ou no KPI.
- Ordenar por PF total ou quantidade de OSs, com opção de troca.

## Modelo de dados proposto

### Task

```text
id
sprintId
title
status
owner
storyPoints
// Não persiste PF nem competência próprios nesta fase.
// Exibe e edita billingForecastMonth da OS pai.
```

### Sprint/OS

```text
code
serviceOrder
system
sprintNumber
functionPoints
// Competência vigente da OS; fonte oficial da previsão mensal.
billingForecastMonth   // AAAA-MM
billingForecastUpdatedAt
billingForecastUpdatedBy
billingForecastReason
lane
homologatedAt
billingReadyAt
invoicedAt
invoicedFunctionPoints
invoiceReference
```

### Melhoria

```text
id
title
description
system
serviceOrder
sprintId
taskId
priority
status
owner
dueDate
resolved
resolvedAt
resolvedBy
resolutionNote
createdAt
updatedAt
```

### Histórico de movimentação

O histórico deve registrar pelo menos:

- Origem e destino da raia.
- Data e hora.
- Usuário.
- OS e Sprint.
- Competência antes e depois.
- PF antes e depois.
- Justificativa quando aplicável.

## Impactos nas páginas existentes

### Kanban

- Renomear a raia `Concluída` para `Faturado`.
- Migrar registros antigos e preservar auditoria.
- Revisar confirmações de movimentação para a nova raia terminal.
- Exibir no Resumo a competência prevista, PF previsto, PF faturado e datas financeiras.
- Manter o card compacto; não adicionar todos os dados financeiros ao card principal.

### Cadastro e edição de Task

- Adicionar ano e mês previstos para faturamento da OS.
- Exibir o PF total da OS como informação somente leitura.
- Salvar a competência na OS pai e refletir a mudança em todas as Tasks relacionadas.
- Exigir justificativa ao alterar competência após homologação.
- Registrar autor e data da alteração.

### Cadastro e edição de Sprint/OS

- Manter o PF total da OS.
- Exibir a competência vigente e o histórico de reprogramações.
- Adicionar dados de faturamento confirmado somente na etapa adequada.
- Bloquear `Faturado` sem data e confirmação de faturamento.

### Dashboard Gover

- Substituir referências a `Concluída` por `Faturado` quando se referirem à raia.
- Separar entrega operacional de faturamento financeiro.
- Permitir acesso à nova página sem duplicar seus gráficos.
- Atualizar KPIs que hoje usam a etapa terminal como sinônimo de entrega.

### Dashboard Superintendência

- Atualizar filtros e consolidações para `Faturado`.
- Manter foco macro; mostrar previsão versus faturado, sem listar todas as Tasks.
- Usar a mesma definição de período e PF da página mensal.

### Página de Cadastros

- Não cadastrar os doze meses como valores livres.
- O mês deve vir de uma lista fixa e o ano de um seletor controlado.
- Considerar cadastro futuro de calendário fiscal, prazo padrão e metas mensais de PF.

### Nova Atualização

- Permitir atualizar a competência da OS com controle de permissão.
- Registrar motivo quando houver replanejamento.
- Atualizar automaticamente a nova página após persistência.

### Relatórios futuros

- Usar a competência vigente da OS para previsão.
- Usar `invoicedAt` e PF faturado para realizado.
- Nunca inferir faturamento apenas pelo progresso em 100%.

## Perfis e responsabilidades

- PO: alimenta responsáveis, competência, PF previsto e justificativas operacionais.
- Gerente de Projetos: acompanha coerência, desvios e pontos críticos dos POs vinculados.
- Analista CGTIC: responde tecnicamente pelo projeto e presta justificativas à área dona.
- Analista de Negócio: representa a área dona, acompanha previsão, entrega e aceite.
- Perfil financeiro/gestor autorizado: confirma faturamento e informa referência financeira.

O PO pode planejar o faturamento, mas a confirmação de `Faturado` deve ser restrita a um perfil autorizado.

## Roadmap de implementação

### Fase 0 — Contrato de negócio e protótipo

Prioridade: P0.

- Validar as definições de previsto, entregue, aguardando faturamento e faturado.
- Manter o faturamento integral da OS em uma única competência na primeira versão.
- Definir quem confirma o faturamento.
- Definir mês calendário versus competência fiscal.
- Validar wireframe da página com CPO, CTO, PO, CGTIC e área de negócio.
- Definir a regra para OS com várias Sprints.

Critérios de aceite:

- Todas as métricas possuem fórmula, fonte, data e responsável.
- Não existe dupla contagem de PF.
- Entrega e faturamento não são tratados como sinônimos.

### Fase 1 — Fundação de dados e migração

Prioridade: P0.

- Adicionar competência prevista à OS e disponibilizá-la no editor da Task.
- Adicionar datas e dados de faturamento à OS/Sprint.
- Criar entidade de melhorias.
- Criar histórico de movimentações e replanejamentos.
- Migrar `completed` para `invoiced`.
- Preencher dados ausentes como `Não informado` ou `OS sem previsão`.
- Centralizar cálculos de PF em um serviço de domínio único.

Critérios de aceite:

- Dados existentes continuam acessíveis.
- A migração é idempotente e auditável.
- A soma mensal é reproduzível a partir dos registros persistidos.

### Fase 2 — Cadastro de Task e fluxo do Kanban

Prioridade: P0.

- Adicionar os doze meses e seletor de ano ao cadastro/edição da Task.
- Exibir o PF integral da OS junto ao campo de competência.
- Implementar reprogramação integral da OS entre meses.
- Renomear e ajustar a raia `Faturado`.
- Adicionar confirmação e permissão para faturamento.
- Atualizar Resumo e Histórico da Sprint.

Critérios de aceite:

- Qualquer Task da OS exibe a mesma competência prevista.
- Alterar a competência move integralmente os PF da OS entre os meses.
- Mover para `Faturado` registra data, usuário e PF.

### Fase 3 — Página `Previsão de PF Mês`

Prioridade: P1.

- Criar rota e item de navegação.
- Implementar filtros e KPIs.
- Implementar cards de OS por situação.
- Criar área de pontos críticos.
- Criar melhorias com fluxo de resolução.
- Implementar gráfico horizontal por projeto.
- Criar drill-down para Sprint e Tasks.
- Implementar estados vazio, carregamento, erro e dados desatualizados.

Critérios de aceite:

- Trocar mês atualiza toda a página sem divergência.
- O total mensal corresponde à soma única das OSs do recorte, sem duplicação por Task ou Sprint.
- Clicar em KPI ou barra mostra as OSs que compõem o valor.
- Pontos críticos explicam causa e impacto.
- Melhorias resolvidas mantêm histórico.

### Fase 4 — Integração dos dashboards

Prioridade: P1.

- Atualizar Dashboard Gover.
- Atualizar Dashboard Superintendência.
- Atualizar filtros, legendas e contagens de etapa.
- Adicionar navegação contextual para a previsão mensal.
- Garantir que todas as páginas consumam o mesmo serviço analítico.

Critérios de aceite:

- O mesmo filtro retorna os mesmos totais em todas as páginas.
- Nenhum dashboard calcula PF de forma independente.
- `Faturado` substitui `Concluída` somente no domínio de Sprint/OS.

### Fase 5 — Segurança, persistência e qualidade

Prioridade: P1/P2.

- Migrar previsões e faturamento de `localStorage` para API e banco de dados.
- Implementar perfis e permissões.
- Adicionar testes unitários das fórmulas.
- Adicionar testes de integração das movimentações.
- Adicionar testes ponta a ponta dos filtros e drill-down.
- Instrumentar auditoria, erros e desempenho.
- Preparar exportação mensal futura.

Critérios de aceite:

- Alterações concorrentes não sobrescrevem previsões.
- Somente perfil autorizado confirma faturamento.
- Toda alteração financeira possui auditoria.
- A página permanece utilizável com pelo menos 500 OSs e 10.000 Tasks.

## Ordem recomendada

1. Aprovar conceitos e fórmulas.
2. Formalizar a OS como fonte única de PF e competência.
3. Criar migração e serviço de domínio.
4. Alterar Task e fluxo `Faturado`.
5. Construir a página mensal.
6. Integrar dashboards.
7. Adicionar permissões, testes e persistência de produção.

## Riscos principais

- Dupla contagem quando uma OS possui várias Sprints.
- Dupla contagem da mesma OS por ela possuir várias Tasks ou Sprints.
- Mês sem ano gerar colisão entre exercícios.
- Tratar homologação como faturamento.
- Alterar a raia sem migrar dashboards, filtros e regras.
- Permitir que qualquer usuário confirme faturamento.
- Perder histórico ao alterar a competência.
- Usar apenas o estado atual da raia para calcular entregas passadas.
- Produzir totais diferentes em páginas distintas por cálculos duplicados.

## Fora do escopo inicial

- Emissão de nota fiscal.
- Integração contábil ou financeira externa.
- Previsão automática por inteligência artificial.
- Alteração automática da competência.
- Metas financeiras em moeda.
- Faturamento parcial ou rateio de uma OS entre vários meses.

## Métricas de sucesso

- 100% dos PF previstos associados a OS, projeto, mês e ano.
- Menos de 2% de OSs sem competência ao fechamento mensal.
- Zero divergência entre a competência da OS e a competência exibida em suas Tasks.
- 100% dos faturamentos com data, usuário e referência auditável.
- Tempo para identificar OS crítica do mês inferior a 10 segundos.
- Redução contínua de replanejamentos sem justificativa.

## Checklist de decisão antes do desenvolvimento

- [x] Confirmado: os PF não serão distribuídos por Task na primeira versão.
- [x] Confirmado: a OS inteira pertence a uma competência vigente e pode ser movida para outro mês.
- [ ] Confirmar a regra de OS com várias Sprints.
- [ ] Confirmar quem pode mover para `Faturado`.
- [ ] Confirmar a definição oficial de `Quantidade entregue`.
- [ ] Confirmar se `Total já faturado` é mensal, acumulado ou ambos.
- [ ] Confirmar se o exercício fiscal acompanha o ano calendário.
- [ ] Aprovar o protótipo da nova página.
- [ ] Aprovar a migração de `completed` para `invoiced`.
- [ ] Aprovar critérios de pontos críticos e melhorias.
