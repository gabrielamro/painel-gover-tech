# PainelPro React — Roadmap de paridade funcional e modernização UI/UX

**Data do rebaseline:** 01/09/2026  
**Escopo:** React, regras de negócio, dados, experiência, qualidade e transição do legado  
**Natureza deste documento:** diagnóstico e plano; nenhuma funcionalidade é considerada concluída apenas por estar desenhada aqui

## 1. Conclusão executiva

A fundação React existe e já permite navegar por Kanban, Dashboard Gover, Previsão de PF, Superintendência, Cadastros e Design System. Entretanto, a migração ainda não atingiu paridade com o legado. As páginas atuais representam uma primeira camada funcional, mas perderam densidade informacional, acabamento visual, integrações e várias regras de negócio que já funcionavam no produto anterior.

A modernização não deve ser uma cópia literal do legado. O caminho correto é:

1. proteger e unificar os dados;
2. recuperar a paridade operacional;
3. reconstruir a identidade visual com um sistema consistente;
4. melhorar responsividade, acessibilidade e fluidez;
5. só então desativar o legado.

O trabalho restante está organizado em **13 fases, de 0 a 12**, distribuídas em quatro ondas. Algumas fases podem avançar em paralelo, mas páginas analíticas não devem continuar sendo construídas sobre modelos de dados provisórios.

## 2. Estado real da migração

Legenda:

- **Presente:** existe no React e atende ao núcleo esperado.
- **Parcial:** existe, mas faltam comportamento, dados, acabamento ou integração.
- **Ausente:** ainda depende do legado ou não foi criada.

| Área | Estado no React | Lacuna principal |
|---|---|---|
| Shell, rotas e navegação | Parcial | Rotas ausentes, cabeçalhos duplicados e navegação incompleta |
| Kanban de Sprints | Parcial | Cards simplificados, filtros incompletos, lista incompleta, DnD/atalhos e preferências sem paridade |
| Detalhe da Sprint | Parcial | Campos, relações, abas e regras de destaque/auditoria incompletos |
| Tasks | Parcial | CRUD básico, mas sem experiência completa de quadro, edição e histórico |
| Histórico e auditoria | Parcial | Repositório existe, mas a cobertura de eventos e a apresentação são incompletas |
| Destaques executivos | Parcial | Marcação e exibição existem de forma básica; faltam governança, ordenação e navegação completa |
| Dashboard Gover | Parcial | Perdeu filtros, agrupamentos, cards ricos, gráficos, atividades e alertas do legado |
| Previsão de PF Mês | Parcial | Filtros, KPIs, gráficos, melhorias e regras de competência incompletos |
| Dashboard Superintendência | Parcial | Falta visão macro interativa, filtros por etapa, gráficos e drill-down |
| Cadastros e vínculos | Parcial crítico | Usa armazenamento separado e não alimenta corretamente o restante do produto |
| Nova Atualização | Ausente | Não há rota/página React |
| Sala de Situação | Ausente | Continua fora do React; prioridade deliberadamente baixa |
| Acompanhamento de Projetos/Líder | Ausente | Backlog, impeditivos, retornos, próximas ações e KPIs ainda não existem |
| Autenticação e perfis | Ausente no fluxo React | Estruturas técnicas existem, mas não governam a aplicação atual |
| API/PostgreSQL | Parcial técnico | Scaffolding existe; React continua dependente de `localStorage` |
| Testes e observabilidade | Inicial | Poucos testes unitários, sem cobertura E2E e sem telemetria de produto |

### Correção dos roadmaps anteriores

Checklists antigos registram como concluídos itens que não estão presentes no React atual ou só existem no legado. A partir deste rebaseline, uma funcionalidade só pode ser marcada como concluída quando:

- estiver no React;
- consumir o modelo de dados oficial;
- atender aos critérios de aceite;
- tiver estados vazio, carregando e erro quando aplicável;
- funcionar em desktop e telas menores;
- possuir teste proporcional ao risco.

Este documento passa a ser a referência de migração. Roadmaps anteriores continuam úteis como histórico de requisitos, não como prova de conclusão.

## 3. Decisões de produto que devem ser preservadas

### Fluxo oficial

As sete raias, nesta ordem, são:

1. Em planejamento
2. Planejado
3. Em desenvolvimento
4. Em homologação
5. Homologado
6. Aguardando faturamento
7. Faturado

### Semântica oficial

- `Crítica` é prioridade, nunca raia.
- `Atenção` é etiqueta, nunca raia.
- Saúde não deve voltar como filtro ou conceito concorrente no Kanban. O React ainda mostra `Saudável/Atenção` derivado de `health`; isso deve ser removido da experiência operacional ou substituído pelas semânticas oficiais de prioridade, etiqueta e bloqueio.
- Riscos e dependências não aparecem no card compacto. Se necessários, ficam no resumo/detalhe ou nas visões analíticas.
- Não há limite de quantidade de cards por raia.
- Não devem voltar: Modo Foco, seleção de cards, limpar seleção, ações em lote e limite de WIP.
- O clique no card abre o detalhe diretamente na aba Tasks.
- Editar e destacar ficam no menu de três pontos; o destaque também deve ser administrável no detalhe.
- O nome do sistema/projeto é separado do número da Sprint e usa a cor cadastrada.
- A filtragem por projeto desconsidera o número da Sprint.
- `PF estimado` e `PF detalhado` são campos diferentes. O detalhado é informado na etapa de faturamento e pode divergir do estimado.
- A competência de faturamento pode mudar quando uma OS for transferida para outro mês.

## 4. Direção de design: melhor que o legado, não apenas diferente

### Diagnóstico visual

O legado é mais forte hoje porque possui:

- melhor densidade de informação;
- cards com hierarquia, cor e contexto;
- dashboards organizados por decisão, não apenas por blocos genéricos;
- filtros e ações próximos do local de uso;
- mais identidade visual por sistema;
- relações visuais claras entre KPI, card, gráfico e detalhe.

O React melhorou a base tipográfica e a limpeza geral, mas ficou genérico, espaçado demais e com componentes que parecem protótipos. Há repetição de título entre topbar e página, excesso de caixas dentro de caixas, pouca diferenciação entre níveis de informação e perda dos elementos mais úteis dos cards do legado.

### Linguagem visual proposta

Adotar uma direção editorial/Swiss para uma ferramenta pública de operação:

- fundo neutro claro e superfícies brancas;
- um azul primário institucional, usado com disciplina;
- cores de sistema apenas em badges, tarjas e dados relacionados ao projeto;
- verde, âmbar, vermelho e violeta apenas para semântica de estado;
- tipografia sans-serif funcional, com números tabulares em KPIs;
- escala de espaçamento baseada em 4 e 8 pixels;
- bordas finas e sombras discretas;
- cantos moderados, sem aparência excessivamente arredondada;
- ícones de uma única família e sempre acompanhados de rótulo quando a ação não for óbvia;
- nenhuma decoração sem função: sem gradientes gratuitos, glassmorphism ou grandes áreas vazias.

### Assinatura visual do produto

Criar uma “espinha operacional” consistente:

- tarja superior de ponta a ponta nos cards, usando a cor oficial do sistema;
- badge do sistema como âncora visual;
- número da OS, Sprint e PF no primeiro nível de leitura;
- progresso e exceções no segundo nível;
- responsável, data e etiquetas no rodapé;
- conteúdo progressivo: o card resume, o detalhe explica e os dashboards agregam.

### Regras responsivas

- Nenhum card deve quebrar internamente para manter uma quantidade fixa por linha.
- Grids devem reduzir colunas por breakpoint: 5 → 4 → 3 → 2 → 1, conforme a largura mínima do card.
- O Kanban permanece horizontal; as raias não devem ser comprimidas para caber.
- A área de Destaques ocupa 30% no desktop, cai para uma faixa inferior em tablet e vira seção empilhada no celular.
- Filtros avançados devem usar dropdown/painel, mantendo busca, visualização e ação principal no topo.
- Tabelas ganham colunas prioritárias e detalhamento expansível em telas pequenas.
- Modais grandes viram drawer ou tela cheia no celular.

## 5. Inventário funcional por área

### 5.1 Shell e navegação

Falta:

- eliminar a duplicação de título entre topbar e conteúdo;
- restaurar as rotas Nova Atualização e, em etapa posterior, Sala de Situação;
- incluir a futura visão de Acompanhamento dos Projetos/Líder;
- indicar rota ativa com clareza e manter navegação por teclado;
- transformar a paleta de comandos em navegação e busca realmente acionáveis;
- padronizar perfil, ajuda e menu de três pontos;
- adicionar breadcrumbs apenas onde melhoram orientação, sem repetir o título;
- estabelecer política única para cabeçalho compacto de página.

### 5.2 Kanban

Falta:

- recuperar a riqueza do card sem aumentar sua altura atual;
- tarja superior de ponta a ponta, sistema, Sprint, OS, objetivo, PF, progresso, Tasks concluídas/pendentes/bloqueadas quando houver, PO, prazo e etiquetas;
- remover a saúde derivada do rodapé;
- menu de três pontos fora do círculo de progresso;
- edição e destaque no menu;
- destaque persistente e sincronizado com o Dashboard;
- filtros por projeto, PO, gerente, prioridade, etiquetas e situação;
- busca por sistema, Sprint, OS e objetivo;
- painel “Mais filtros” para critérios secundários;
- salvar visão e gerenciar etiquetas no menu superior;
- visualização em lista com as mesmas ações do Kanban;
- rolagem horizontal por mouse, trackpad e teclado;
- DnD entre raias e reordenação na mesma raia;
- Enter para abrir Tasks e Alt + setas para mover;
- confirmação de movimentos sensíveis e auditoria completa;
- estado vazio acionável e contagem discreta de Sprints no rodapé;
- desempenho com pelo menos 50 Sprints;
- acessibilidade do card sem botões interativos aninhados.

### 5.3 Detalhe, edição e Tasks

Falta consolidar quatro abas: Resumo, Tasks, Histórico e Destaque.

Resumo:

- sistema/projeto, Sprint, OS e objetivo;
- raia, prioridade e etiquetas;
- PO, gerente, analista CGTIC e analista de negócio;
- PF estimado, PF detalhado e competência de faturamento;
- datas, dias na raia e última atualização;
- progresso e informações de bloqueio/impedimento;
- sem exibir avisos operacionais redundantes no card compacto.

Tasks:

- estados A fazer, Em andamento, Bloqueada e Concluída;
- criar, editar, mover e remover com confirmação adequada;
- título, tipo, prioridade, responsável, pontos, prazo e critério de aceite;
- DnD e alternativa acessível por controles;
- recálculo único de progresso e bloqueios no domínio.

Histórico:

- criação, edição, movimento de raia, movimento de Task, destaque e alteração de PF;
- autor, data/hora, origem, antes/depois e justificativa quando necessária;
- filtros por evento e ordenação cronológica.

Destaque:

- switch, tipo, texto executivo, autor e datas;
- limite recomendado de 280 caracteres;
- salvar, editar e remover sem apagar histórico;
- abrir a Sprint correta a partir do Dashboard.

### 5.4 Cadastros e relacionamentos

O problema atual é estrutural: a página React grava `painelpro-registrations-react`, enquanto os cards usam outros dados. Isso cria cadastros que não governam o sistema.

Falta:

- repositórios oficiais para Sistemas/Projetos, Gerentes, POs, Analistas CGTIC, Analistas de Negócio, Prioridades e Etiquetas;
- migrar as chaves legadas de forma idempotente;
- cor do projeto aplicada ao card e dashboards;
- cor da etiqueta aplicada em todos os contextos;
- edição e exclusão protegida por vínculos;
- vínculo Gerente 1:N POs;
- vínculo PO 1:N Projetos;
- vínculo do Projeto com analistas CGTIC e de negócio;
- formulários de Sprint alimentados pelos cadastros, sem listas codificadas;
- nomes longos em duas linhas, com fonte adaptada e tooltip;
- estados “Não informado” sem inferir saúde ou responsabilidade inexistente.

### 5.5 Dashboard Gover

Falta:

- cabeçalho realmente compacto;
- quatro KPIs densos, sem caixas internas redundantes;
- filtros de sistema junto ao título de Status dos Sistemas;
- mostrar somente Em desenvolvimento e Em homologação;
- cards responsivos agrupados por etapa, sem repetir nome do projeto fora do badge;
- badge de projeto com cor oficial e tratamento de nomes longos;
- sidebar de Destaques com 30% da largura no desktop;
- clique em destaque abrindo o detalhe correto;
- progressão geral, atividades recentes e alertas/decisões relevantes;
- interações de KPI e gráfico que apliquem filtro ou abram detalhamento;
- estados vazio e dados desatualizados com contexto.

### 5.6 Previsão de PF Mês

Falta:

- filtros completos em dropdown no cabeçalho: projeto, OS, PO, gerente e situação;
- cinco KPIs compactos: PF previstos, OSs em desenvolvimento, OSs entregues, PF aguardando faturamento e PF faturados;
- Previsão por OS imediatamente abaixo dos KPIs;
- exibir somente OSs da competência selecionada e ocultar raias vazias;
- comparação estimado × detalhado por projeto e no total;
- variação absoluta e percentual com arredondamento correto;
- indicar crescimento, redução ou ausência de comparação;
- gráfico horizontal de cards por projeto, comparando planejamento/desenvolvimento com homologação/homologado/faturamento;
- pontos críticos baseados em prioridade, bloqueio e ausência de PF detalhado quando exigido;
- pontos de melhoria com adicionar, editar, marcar resolvido e histórico;
- mudança de competência de faturamento sem perder histórico;
- regra de `PF detalhado` habilitada na fase de faturamento;
- formatação decimal brasileira e correção de artefatos de ponto flutuante.

### 5.7 Dashboard Superintendência

Falta:

- filtro macro por etapa;
- cards de sistema indicando qual Sprint está em desenvolvimento/homologação;
- KPIs clicáveis para execução, entregas, bloqueios e PF;
- destaque executivo e decisões prioritárias;
- tabela consolidada por sistema com progresso, etapa, responsável e próxima ação;
- gráfico de entregas do último mês com clique/drill-down;
- distribuição do fluxo por etapa;
- comparação planejado × entregue e visão de faturamento;
- responsividade com leitura executiva, sem virar uma cópia do Kanban.

### 5.8 Nova Atualização

Criar no React:

- seleção de projeto/Sprint;
- seleção de Task quando aplicável;
- status, progresso e comentário;
- registro de retorno, impedimento e próximo passo;
- atualização do histórico e indicadores derivados;
- confirmação clara e prevenção contra dupla gravação.

### 5.9 Acompanhamento dos Projetos para Líder

Criar a área prevista em `BACKLOG.md`, separada da Superintendência:

- resumo por projeto;
- existência e itens de backlog;
- impeditivos, impacto, responsável e prazo;
- último retorno, próxima ação e atualização;
- KPIs clicáveis e filtros combináveis;
- detalhe com histórico de retornos;
- vínculo com Sprint, card e Tasks;
- sinalização `Não informado` quando não houver evidência suficiente.

### 5.10 Sala de Situação

Permanece P3, conforme decisão do produto. Quando retomada, deve incluir alertas, decisões, recomendações explicáveis e histórico, sem criar uma raia `Atenção` ou `Crítica`.

## 6. Arquitetura de dados e regras

### Problemas atuais

- Sprints, auditoria e cadastros usam caminhos de armazenamento diferentes.
- A página de Cadastros acessa `localStorage` diretamente.
- Algumas regras são calculadas nos componentes de página.
- O modelo ainda mantém `health`, conflitando com a regra atual do produto.
- Dashboards repetem filtros e agregações sem um serviço analítico compartilhado.
- Não há uma camada React conectada de autenticação/autorização.

### Modelo mínimo a consolidar

- `Project/System`
- `ProjectManager`
- `ProductOwner`
- `CgticAnalyst`
- `BusinessAnalyst`
- `Priority`
- `Label`
- `Sprint/ServiceOrder`
- `Task`
- `FeaturedHighlight`
- `BillingForecast`
- `ImprovementPoint`
- `BacklogItem`
- `Impediment`
- `Return/FollowUp`
- `AuditEvent`
- `Decision/Alert`

### Regras de implementação

- Componentes nunca acessam persistência diretamente.
- Toda mutação passa por serviço de aplicação/domínio.
- Uma única fonte calcula progresso, bloqueios, PF e agrupamentos.
- Migrações de dados são versionadas, idempotentes e nunca redefinem dados por divergência de versão.
- O legado deve continuar legível durante a transição, mas não pode sobrescrever dados novos.
- API e banco devem validar permissões e regras críticas no servidor.
- Valores de PF são armazenados como decimal seguro, não como soma de `float` sem normalização.

## 7. Roadmap priorizado

### Fase 0 — Rebaseline, contrato e proteção de dados — P0

Entregas:

- congelar o contrato oficial de raias e semânticas;
- catalogar campos e chaves legadas;
- criar fixtures sanitizadas de referência;
- remover qualquer bootstrap destrutivo;
- definir matriz de paridade automatizável;
- registrar screenshots de referência do legado e React.

Aceite:

- abrir o React não altera nem apaga dados;
- todas as entidades e chaves possuem destino de migração;
- decisões removidas não aparecem no backlog de implementação.

### Fase 1 — Repositórios unificados e migração segura — P0

Entregas:

- contratos de repositório para cadastros, preferências, melhorias, destaques e auditoria;
- migrador versionado das chaves legadas;
- eliminação do `painelpro-registrations-react` isolado;
- serviço de consultas/analytics compartilhado;
- testes de migração e rollback lógico.

Aceite:

- cadastro alterado reflete imediatamente em criação, edição, Kanban e dashboards;
- recarregar a página preserva dados e vínculos;
- executar a migração duas vezes não duplica nem redefine registros.

### Fase 2 — Design System 2.0 — P0

Entregas:

- tokens finais de cor, tipo, espaço, borda, sombra e movimento;
- componentes base acessíveis;
- padrões de KPI, SprintCard, SystemBadge, FilterDropdown, DataTable, Modal, Drawer e EmptyState;
- documentação de densidade e responsividade;
- galeria com dados reais sanitizados, sem conteúdo fictício.

Aceite:

- nenhuma página cria uma variação visual local para um componente já padronizado;
- contraste e foco atendem WCAG AA;
- cards e KPIs mantêm leitura em todos os breakpoints suportados.

### Fase 3 — App Shell e navegação — P0

Entregas:

- topbar compacto sem títulos duplicados;
- sidebar completa e responsiva;
- menus de perfil, ajuda e ações;
- paleta de comandos funcional;
- rotas e fallback consistentes.

Aceite:

- todas as páginas são acessíveis pelo menu e por URL direta;
- atualizar a página mantém a rota;
- navegação por teclado não fica presa.

### Fase 4 — Kanban com paridade e novo acabamento — P0

Entregas:

- card final compacto e informativo;
- filtros, busca, dropdown avançado, visão salva e etiquetas;
- modos Kanban e Lista;
- DnD, reordenação, scroll e atalhos;
- menu de três pontos, edição e destaque;
- comportamento responsivo e acessível.

Aceite:

- as sete raias aparecem na ordem oficial;
- nenhuma raia limita a quantidade de cards;
- card crítico é identificado pela prioridade, não por Health Score;
- 50 Sprints continuam navegáveis sem degradação perceptível;
- todas as ações geram auditoria.

### Fase 5 — Detalhe, edição, Tasks, histórico e destaque — P0

Entregas:

- quatro abas oficiais;
- todos os campos e relacionamentos;
- quadro de Tasks completo;
- trilha de auditoria legível;
- destaque executivo integrado ao Dashboard.

Aceite:

- clicar no card abre Tasks;
- edição mantém dados após recarregar;
- progresso e bloqueios são recalculados pelo domínio;
- destaque aparece/desaparece no Dashboard sem inconsistência.

### Fase 6 — Cadastros e vínculos organizacionais — P0

Entregas:

- CRUD completo de todas as entidades de cadastro;
- cores, validação de nomes e exclusão protegida;
- relações Gerente → POs → Projetos e analistas por projeto;
- uso dos cadastros em todos os formulários e filtros.

Aceite:

- não existem listas paralelas de responsáveis ou projetos;
- vínculos inválidos são impedidos com explicação;
- nomes e cores permanecem consistentes em todas as páginas.

### Fase 7 — Previsão de PF Mês — P1

Entregas:

- competência móvel, filtros completos, cinco KPIs;
- agrupamento de OSs sem raias vazias;
- comparação estimado × detalhado;
- fluxo por projeto;
- críticos e melhorias com histórico.

Aceite:

- mover uma OS de competência atualiza os totais dos dois meses;
- PF detalhado respeita a etapa de faturamento;
- totais e variações não exibem erros de ponto flutuante;
- gráficos e cards usam exatamente o mesmo conjunto filtrado.

### Fase 8 — Dashboard Gover — P1

Entregas:

- status em Desenvolvimento/Homologação;
- filtros por sistema;
- sidebar de 30% para Destaques;
- progresso, atividades e decisões;
- interações e responsividade.

Aceite:

- projetos em outras etapas não aparecem em Status dos Sistemas;
- nomes não são duplicados;
- clicar em KPI, card ou destaque conduz ao contexto correto.

### Fase 9 — Superintendência e visão do Líder — P1

Entregas:

- Superintendência com macrofluxo, gráfico de entrega e drill-down;
- primeira versão do Acompanhamento dos Projetos;
- separação clara entre visão institucional e acompanhamento operacional do líder.

Aceite:

- o superintendente identifica andamento, entregue no mês e decisões em poucos segundos;
- o líder identifica backlog, impeditivo, retorno e próxima ação por projeto;
- nenhuma das visões duplica o Kanban.

### Fase 10 — Nova Atualização e Sala de Situação mínima — P2/P3

Entregas:

- Nova Atualização em React;
- registro de retorno e próxima ação;
- Sala de Situação apenas após estabilização das áreas prioritárias.

Aceite:

- atualizações alimentam histórico e dashboards;
- recomendações nunca movem cards automaticamente;
- prioridade baixa da Sala de Situação não bloqueia o corte do núcleo operacional.

### Fase 11 — API, autenticação e governança — P1 para produção

Entregas:

- React conectado à API/PostgreSQL;
- login, sessão e perfis;
- autorização por ação;
- concorrência, tratamento de conflito e rollback otimista;
- logs estruturados e trilha de auditoria no servidor.

Aceite:

- regra crítica não depende somente do navegador;
- usuários sem permissão não conseguem mutar dados pela API;
- duas edições concorrentes têm comportamento previsível.

### Fase 12 — Qualidade, desempenho e cutover — P0 para desligar o legado

Entregas:

- testes unitários, integração e E2E dos fluxos críticos;
- regressão visual dos componentes e páginas-chave;
- auditoria de acessibilidade;
- metas de performance e telemetria;
- piloto, janela de convivência e plano de rollback;
- remoção do legado somente após aceite formal.

Aceite:

- zero perda de dados no ensaio de migração;
- fluxos P0 cobertos por E2E;
- páginas críticas aprovadas visualmente e em telas menores;
- cutover possui responsável, checklist e rollback testado.

## 8. Ondas de execução e paralelismo seguro

### Onda 1 — Fundação

Fases 0, 1, 2 e 3.

Podem ocorrer em duas frentes paralelas:

- dados/domínio: Fases 0 e 1;
- design/shell: Fases 2 e 3.

### Onda 2 — Núcleo operacional

Fases 4, 5 e 6.

Kanban e Detalhe podem dividir componentes, mas Cadastros precisa ter o contrato fechado antes de integrar formulários. No máximo três frentes, todas consumindo os mesmos modelos.

### Onda 3 — Inteligência e decisão

Fases 7, 8, 9 e 10.

Previsão, Gover e Superintendência podem ser desenvolvidos em paralelo depois que o serviço analítico estiver estável. Nova Atualização depende do histórico consolidado.

### Onda 4 — Produção

Fases 11 e 12.

Backend e testes avançam juntos. O cutover é sequencial e só começa quando os gates anteriores estiverem verdes.

**Limite recomendado:** até três frentes funcionais simultâneas. Mais do que isso aumenta retrabalho porque Kanban, dashboards, PF e Cadastros compartilham os mesmos dados e componentes.

## 9. Ordem prática para os próximos ciclos

1. Fase 0: corrigir a verdade do projeto e proteger dados.
2. Fase 1: unificar cadastros, relações e migrações.
3. Fase 2: fechar o Design System 2.0 com o card definitivo.
4. Fase 3: corrigir shell, títulos e rotas.
5. Fases 4, 5 e 6: recuperar o núcleo operacional.
6. Fases 7, 8 e 9: reconstruir as páginas de decisão.
7. Fases 10, 11 e 12: completar operação, segurança e transição.

Não é recomendável continuar adicionando gráficos ou páginas isoladas antes das Fases 0 e 1. Isso ampliaria a diferença entre o que a interface mostra e o que os dados realmente representam.

## 10. Definition of Done global

Uma entrega só está concluída quando:

- implementa a regra oficial, sem depender do legado;
- usa repositório/serviço, não `localStorage` direto no componente;
- preserva dados existentes;
- tem loading, vazio, erro e sucesso quando aplicável;
- funciona com teclado e possui foco visível;
- responde sem quebrar cards ou dashboards;
- não introduz textos, sistemas ou métricas fictícias;
- possui teste unitário para regra e E2E para fluxo crítico;
- foi comparada visualmente com a referência aprovada;
- atualiza este roadmap com evidência verificável.

## 11. Métricas de sucesso

- localizar uma Sprint por sistema, OS ou responsável em até 10 segundos;
- identificar uma Sprint crítica em até 3 segundos;
- abrir e atualizar uma Task sem sair do contexto da Sprint;
- 100% dos cadastros compartilhados entre Kanban e dashboards;
- zero reset ou duplicação na migração de dados;
- erro inferior a 0,01 PF em agregações exibidas;
- nenhuma rolagem lateral indevida em dashboards;
- Kanban navegável com 50 ou mais Sprints;
- WCAG AA para contraste, foco e controles principais;
- redução mensurável de cliques para filtrar, editar e acompanhar uma Sprint.

## 12. Riscos principais e mitigação

| Risco | Impacto | Mitigação |
|---|---|---|
| Marcar fase como concluída sem paridade | Falsa sensação de avanço | Gate com critérios e evidência |
| Cadastros em armazenamento paralelo | Dados divergentes | Fase 1 antes das páginas analíticas |
| Reset por versão de dataset | Perda de dados | Migração idempotente e backup |
| Duplicação de cálculos | KPIs inconsistentes | Serviço analítico único |
| Copiar o legado sem modernizar | Migração sem ganho | Design System 2.0 e testes de usabilidade |
| Simplificar demais o React | Perda de contexto operacional | Hierarquia e exposição progressiva |
| Excesso de frentes paralelas | Retrabalho | Máximo de três frentes e contratos congelados |
| Backend tardio | Regras inseguras | Preparar contratos desde a Fase 1 |

## 13. Artefatos de apoio existentes

- `MIGRATION_BASELINE.md`: inventário de dados e riscos de migração.
- `KANBAN_IMPROVEMENT_ROADMAP.md`: histórico de requisitos do Kanban.
- `DASHBOARD_GOVER_DESTAQUES_ROADMAP.md`: contrato inicial de Destaques.
- `BACKLOG.md`: visão de Acompanhamento dos Projetos para líderes.
- `CUTOVER_READINESS.md`: base para o gate final de transição.
- `ROADMAP_PAINELPRO_REACT_CODEX.md`: roadmap anterior, agora subordinado a este rebaseline.

---

**Próxima decisão recomendada:** iniciar a Onda 1 pelas Fases 0, 1 e 2, mantendo a Fase 3 em paralelo após o contrato visual do shell. O primeiro resultado visível deve ser um React com dados confiáveis, card definitivo, cadastros integrados e estrutura visual claramente superior à versão atual.

## 14. Guia operacional para delegação

Este roadmap define produto, arquitetura, UX e prioridade. A execução por agentes de desenvolvimento deve seguir obrigatoriamente o arquivo `PLANO_EXECUCAO_IA_REACT.md`, que divide as 13 fases em pacotes atômicos com:

- identificador único;
- dependências explícitas;
- arquivos permitidos;
- instruções do que fazer e do que não fazer;
- critérios objetivos de aceite;
- comandos mínimos de validação;
- ordem obrigatória e paralelismo seguro;
- prompt padrão para delegar um único pacote.

Não delegar uma fase inteira em um único prompt. Para uma IA mais simples, delegar exatamente um pacote por vez, revisar a evidência e somente então liberar o pacote dependente.
