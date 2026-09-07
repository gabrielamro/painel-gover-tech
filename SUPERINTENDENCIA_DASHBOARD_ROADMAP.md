# Dashboard Superintendência — Roadmap de visão macro

## Objetivo

Criar uma visão executiva para o superintendente acompanhar o portfólio sem precisar navegar Sprint por Sprint. A tela deve responder rapidamente:

1. O que está em andamento agora?
2. Quais sistemas estão com desenvolvimento ativo?
3. Onde existem bloqueios que exigem decisão?
4. O que foi entregue no último mês?
5. Qual é o impacto e a tendência do portfólio?

O Dashboard Superintendência será uma visão de decisão. O Kanban continua sendo a visão operacional e o Dashboard Gover continua sendo a visão analítica detalhada.

## Escopo inicial

### Filtros por etapa

O dashboard deve permitir filtrar o portfólio pelas etapas atuais:

- Em planejamento
- Planejado
- Em desenvolvimento
- Em homologação
- Homologado
- Aguardando faturamento
- Concluída

Os filtros devem funcionar em conjunto com sistema/projeto, período, responsável e prioridade. O filtro selecionado deve atualizar KPIs, gráficos, lista de bloqueios e entregas sem recarregar a página.

## Estrutura visual proposta

### 1. Cabeçalho executivo

- Nome: `Dashboard Superintendência`.
- Período selecionado, com padrão no mês atual.
- Filtros de etapa em chips ou botões de seleção rápida.
- Filtros adicionais em um painel secundário para não poluir a tela.
- Data e hora da última atualização dos dados.

### 2. KPIs de decisão

Exibir no topo, com números grandes e comparação com o período anterior:

- Sprints em andamento.
- Sistemas com desenvolvimento ativo.
- Sprints bloqueadas.
- Entregas concluídas no último mês.
- Sprints em homologação.
- Sprints aguardando faturamento.

Cada KPI deve ser clicável e aplicar automaticamente o filtro correspondente no restante da tela.

### 3. Visão macro por sistema

Exibir uma tabela ou matriz resumida com uma linha por sistema/projeto:

- Sistema/projeto com cor própria.
- Sprint atualmente em desenvolvimento.
- Etapa atual.
- Progresso real e planejado.
- Prioridade.
- Quantidade de bloqueios.
- Próximo marco.
- Última atualização.

Quando houver mais de uma Sprint ativa no mesmo sistema, mostrar a Sprint de maior prioridade e indicar a quantidade de outras Sprints ativas. O nome deve seguir o padrão `SCIEX — Sprint 1`, mantendo sistema e Sprint visualmente separados.

### 4. Bloqueios e pontos de decisão

Criar uma área de destaque com os itens que exigem atuação da superintendência:

- Sistema e Sprint afetados.
- Motivo do bloqueio.
- Tempo bloqueado.
- Responsável pela próxima ação.
- Impacto estimado.
- Data limite ou próximo marco.
- Ação recomendada.

Ordenação padrão: impacto, criticidade e atraso. Bloqueios sem atualização recente devem receber destaque adicional.

### 5. Entregas do último mês

Criar um gráfico interativo de entregas por sistema e por semana no último mês.

Interações previstas:

- Clique em uma barra ou ponto do gráfico abre o detalhamento daquele período.
- O detalhamento mostra sistema, Sprint, data da entrega, etapa final, responsável e quantidade de PF.
- Deve ser possível clicar em uma entrega para abrir a Sprint no contexto do Kanban ou na aba Tasks.
- Tooltip deve mostrar valores exatos sem exigir navegação adicional.

### 6. Tendência do portfólio

Exibir uma visualização simples para tomada de decisão:

- Evolução de Sprints concluídas por mês.
- Evolução de bloqueios abertos e resolvidos.
- Distribuição por etapa.
- Tendência de atraso e de homologação.

Evitar excesso de gráficos. Cada gráfico deve responder a uma pergunta gerencial específica.

## Hierarquia de informação

1. Alertas que exigem decisão hoje.
2. Sistemas com desenvolvimento ativo.
3. Entregas recentes.
4. Tendência e distribuição do portfólio.
5. Detalhamento acessível por clique.

O dashboard não deve replicar o conteúdo completo do card ou do popup do Kanban. A regra é mostrar o contexto necessário para decidir e permitir aprofundamento sob demanda.

## Roadmap de implementação

### Fase 0 — Contrato e critérios

Prioridade: P0.

- Definir o significado de “em andamento”, “entregue” e “bloqueado”.
- Definir o período do último mês: mês calendário ou últimos 30 dias.
- Definir quais etapas entram na visão de desenvolvimento ativo.
- Definir impacto, criticidade e responsável pela próxima ação.
- Validar a fonte oficial de PF, datas, status e auditoria.

Critérios de aceite:

- Os indicadores possuem definições documentadas.
- O mesmo dado apresenta o mesmo resultado no Kanban, Dashboard Gover e Superintendência.
- O período selecionado é explícito e reproduzível.

### Fase 1 — Resumo para decisão

Prioridade: P0.

- Criar a rota e a navegação para `Dashboard Superintendência`.
- Implementar cabeçalho, filtros por etapa e KPIs.
- Criar a matriz macro por sistema.
- Destacar bloqueios e pontos de decisão.
- Adicionar estados de carregamento, vazio, erro e dados desatualizados.

Critérios de aceite:

- O superintendente identifica sistemas em desenvolvimento em até 10 segundos.
- Um clique em um KPI filtra as informações relacionadas.
- Bloqueios aparecem antes de informações secundárias.
- A tela funciona com todos os sistemas fornecidos pelo portfólio.

### Fase 2 — Entregas interativas

Prioridade: P1.

- Criar gráfico de entregas do último mês.
- Implementar clique por semana, sistema e Sprint.
- Criar painel de detalhamento da entrega.
- Permitir abrir a Sprint no Kanban ou as Tasks relacionadas.
- Incluir PF no detalhamento sem transformar PF em indicador principal nesta fase.

Critérios de aceite:

- O clique em qualquer elemento do gráfico apresenta o conjunto correto de entregas.
- O detalhamento mantém o filtro e o período escolhidos.
- A navegação para Kanban/Tasks preserva a identificação da Sprint.

### Fase 3 — Tendência e decisão assistida

Prioridade: P1.

- Adicionar evolução de entregas e bloqueios.
- Comparar período atual com período anterior.
- Sinalizar tendências de atraso, homologação e faturamento.
- Criar resumo executivo exportável.
- Registrar filtros e contexto usados na consulta.

Critérios de aceite:

- Cada tendência possui período, fórmula e fonte identificáveis.
- Nenhuma recomendação altera o Kanban automaticamente.
- A exportação mantém os filtros aplicados e a data de geração.

### Fase 4 — Fundação técnica

Prioridade: P2.

- Criar endpoint analítico consolidado para o portfólio.
- Evitar cálculos duplicados entre Kanban e dashboards.
- Migrar dados de `localStorage` para persistência centralizada.
- Adicionar permissões para visão de superintendência.
- Criar testes de integração e ponta a ponta para filtros e drill-down.
- Instrumentar tempo de carregamento, erros e uso dos gráficos.

## Modelo de dados necessário

Cada Sprint deve disponibilizar, no mínimo:

- Sistema/projeto e cor do sistema.
- Número da Sprint.
- Etapa atual.
- Prioridade e etiquetas.
- Progresso real e planejado.
- PF.
- Responsável e responsável pela próxima ação.
- Bloqueios, motivo, impacto e data de abertura.
- Datas de início, homologação, aceite, faturamento e conclusão.
- Última atualização.
- Histórico de mudanças de etapa.

## Fora do escopo inicial

- Editar Sprint diretamente pelo Dashboard Superintendência.
- Exibir todas as Tasks individualmente.
- Reproduzir o Kanban completo.
- Criar um modo foco.
- Alterar automaticamente prioridade, etapa ou responsável.

## Riscos e cuidados

- “Entregue no último mês” pode gerar números diferentes se o período não for definido.
- Uma Sprint pode aparecer como ativa mesmo com progresso parado; usar última atualização e bloqueios para contextualizar.
- Sistemas com várias Sprints precisam de uma regra clara de consolidação.
- Gráficos sem drill-down devem ser evitados, pois não ajudam na tomada de decisão.
- Dados incompletos devem ser sinalizados, nunca ocultados silenciosamente.

## Métricas de sucesso

- Tempo para identificar todos os sistemas em desenvolvimento: até 10 segundos.
- Tempo para localizar um bloqueio de alto impacto: até 5 segundos.
- Pelo menos 90% das entregas do último mês acessíveis por clique no gráfico.
- 100% dos KPIs com origem e período identificáveis.
- Zero divergência entre filtros equivalentes nos três painéis.

## Status

- [x] Ideia e objetivo definidos.
- [x] Escopo macro definido.
- [x] Filtros por etapa especificados.
- [x] Visão por sistema e Sprint especificada.
- [x] Bloqueios e informações em destaque especificados.
- [x] Gráfico interativo de entregas especificado.
- [ ] Validar contrato de dados com as áreas responsáveis.
- [ ] Validar protótipo visual com a superintendência.
- [ ] Implementar Fase 1.
- [ ] Implementar Fase 2.
- [ ] Implementar Fase 3.
- [ ] Implementar Fase 4.
