# Backlog de produto — Painel Gover Tech

Este arquivo reúne ideias e requisitos que ainda não foram colocados em desenvolvimento. Os itens abaixo são propostas futuras e não representam funcionalidades já implementadas.

## BL-001 — Dashboard de acompanhamento para líderes

**Status:** Backlog

**Prioridade sugerida:** P1

**Perfil principal:** Líder/gestor responsável pelo acompanhamento dos projetos.

**Não confundir com:** Dashboard Superintendência, que possui uma visão mais macro para tomada de decisão institucional. Este item deve apoiar o líder no acompanhamento detalhado da situação de cada projeto.

### Objetivo

Criar uma área no dashboard para o líder verificar rapidamente como está cada projeto, identificar a existência de backlog, entender quais itens estão pendentes, acompanhar impeditivos e saber se houve retorno dos responsáveis ou das áreas envolvidas.

### Perguntas que a área deve responder

1. Como está cada projeto atualmente?
2. O projeto possui backlog?
3. Quais itens compõem esse backlog?
4. Existe algum impeditivo?
5. Qual é o impeditivo e qual o seu impacto?
6. Quem deve agir e qual é o prazo da próxima ação?
7. Houve retorno desde o último acompanhamento?
8. Qual projeto está sem retorno ou sem atualização há mais tempo?

### Área proposta: Acompanhamento dos Projetos

Criar uma seção própria no dashboard do líder, com uma linha ou cartão resumido por projeto.

#### Resumo visível por projeto

- Nome do sistema/projeto e cor correspondente.
- Estado atual do projeto.
- Responsável principal e líder responsável.
- Última atualização.
- Situação do backlog: `Sem backlog`, `Com backlog` ou `Backlog crítico`.
- Quantidade de itens no backlog.
- Situação de impeditivos: `Sem impeditivo`, `Com impeditivo` ou `Impedimento crítico`.
- Quantidade de impeditivos abertos.
- Data e status do último retorno.
- Próxima ação e prazo.

#### Detalhamento ao clicar

Ao clicar em um projeto, abrir um painel ou página de detalhes contendo:

- Lista completa do backlog.
- Item, tipo, prioridade, responsável, prazo e status de cada item.
- Data de entrada de cada item no backlog.
- Tempo parado ou sem atualização.
- Impeditivo relacionado ao item, quando existir.
- Descrição do impeditivo e impacto no projeto.
- Dependência ou área responsável pela resolução.
- Histórico de retornos, com data, autor, resumo e próximo passo.
- Histórico de alterações de status.
- Link para abrir a Sprint, o card ou as Tasks correspondentes.

### Filtros necessários

- Projeto/sistema.
- Situação do projeto.
- Com backlog / sem backlog.
- Com impeditivo / sem impeditivo.
- Backlog crítico.
- Impeditivo crítico.
- Sem retorno.
- Sem atualização há mais de 7 dias.
- Responsável ou líder.
- Prioridade.
- Período da última atualização.

Os filtros devem ser combináveis e apresentar a quantidade de resultados. O estado dos filtros deve permanecer ao abrir e fechar o detalhamento.

### KPIs da visão do líder

- Total de projetos acompanhados.
- Projetos com backlog.
- Total de itens no backlog.
- Projetos com impeditivo.
- Total de impeditivos abertos.
- Projetos sem retorno.
- Projetos sem atualização recente.
- Itens de backlog vencidos.

Cada KPI deve permitir clique para aplicar o filtro correspondente na área de projetos.

### Alertas e destaque visual

Priorizar os seguintes casos:

- Impeditivo crítico sem responsável.
- Impeditivo vencido.
- Projeto sem retorno após solicitação.
- Backlog com itens vencidos.
- Backlog crescendo por mais de um período.
- Projeto sem atualização há mais de 7 dias.
- Item de alta prioridade sem próximo passo definido.

O destaque deve explicar o motivo do alerta. Evitar mostrar somente uma cor ou um número sem contexto.

### Registro de retorno

A área deve permitir registrar um retorno relacionado ao projeto ou a um impeditivo, contendo:

- Data e hora.
- Pessoa que registrou.
- Origem do retorno.
- Resumo do retorno.
- Decisão ou encaminhamento.
- Próxima ação.
- Responsável.
- Prazo.
- Anexo ou referência, se aplicável.

O registro de retorno deve gerar histórico e atualizar a data de acompanhamento do projeto.

### Regras de negócio sugeridas

- Um projeto com pelo menos um item aberto no backlog deve ser identificado como `Com backlog`.
- Um projeto com item vencido ou de prioridade crítica deve ser identificado como `Backlog crítico`.
- Um projeto com impeditivo aberto deve ser identificado como `Com impeditivo`.
- Um impeditivo sem responsável, vencido ou de alto impacto deve ser identificado como `Impedimento crítico`.
- “Sem retorno” deve considerar a data da última solicitação e o prazo definido para resposta.
- “Sem atualização” deve considerar a última atividade registrada, não somente a alteração do card.
- O sistema não deve concluir que um projeto está saudável apenas porque não há dados; ausência de informação deve aparecer como `Não informado`.

### Critérios de aceite

- O líder consegue visualizar todos os projetos em uma única área.
- Cada projeto informa claramente backlog, impeditivos e retorno.
- É possível abrir o detalhamento completo do backlog de um projeto.
- É possível identificar o impeditivo, impacto, responsável e próximo passo.
- É possível registrar e consultar retornos anteriores.
- Os filtros atualizam os KPIs e a lista sem recarregar a página.
- Os indicadores não misturam backlog de projeto com Tasks em execução.
- A visão não altera automaticamente status, prioridade ou responsável.
- Os dados exibem a data de atualização e sinalizam informações desatualizadas.

### Dependências de dados

- Cadastro padronizado de projetos e sistemas.
- Relação entre projeto, Sprint, card e Tasks.
- Entidade de backlog com status, prioridade, responsável e prazo.
- Entidade de impeditivos com impacto, responsável e prazo.
- Histórico de solicitações e retornos.
- Auditoria de mudanças.

### Fatiamento recomendado para desenvolvimento

1. Modelo de dados de backlog, impeditivo e retorno.
2. Lista resumida de projetos para líderes.
3. Filtros e KPIs.
4. Detalhamento do backlog por projeto.
5. Registro e histórico de retornos.
6. Alertas de atraso, ausência de retorno e ausência de atualização.
7. Integração com Kanban, Tasks e Dashboard Gover.

### Fora do escopo inicial

- Visão institucional consolidada para a superintendência.
- Alteração automática de etapa do Kanban.
- Priorização automática do backlog.
- Comunicação automática com áreas externas.
- Substituição do acompanhamento operacional de Tasks.

## Referências relacionadas

- [Roadmap do Dashboard Superintendência](SUPERINTENDENCIA_DASHBOARD_ROADMAP.md)
- [Roadmap de melhoria do Kanban](KANBAN_IMPROVEMENT_ROADMAP.md)
