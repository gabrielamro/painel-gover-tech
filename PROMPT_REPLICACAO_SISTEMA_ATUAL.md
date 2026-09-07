# Prompt mestre para replicar o PainelPro atual

Copie o conteúdo abaixo para iniciar uma nova implementação do sistema. A versão legada disponível na raiz do projeto é a fonte de verdade funcional. A rota `/react` é uma migração incompleta e não deve ser usada como referência de paridade.

---

## Prompt

Você é um engenheiro de software sênior, arquiteto de sistemas, CPO e especialista em UX/UI para sistemas corporativos de governança de TI.

Crie uma réplica funcional do **PainelPro — Gover Tech**, um sistema para acompanhamento de projetos, Sprints, Ordens de Serviço, Tasks, Pontos de Função, homologação e faturamento. A réplica deve preservar integralmente as regras de negócio, os relacionamentos, os dados e a mecânica de uso descritos abaixo. Não simplifique o produto para um dashboard estático e não substitua funcionalidades por dados fictícios.

### 1. Objetivo do produto

O PainelPro centraliza a operação de um portfólio de sistemas de TI. Ele atende principalmente POs, gerentes de projetos, analistas da CGTIC, analistas de negócio, líderes e gestores executivos.

O Kanban é a fonte operacional. Dashboards, indicadores, destaques e previsões financeiras devem ser derivados dos mesmos dados e atualizados quando uma Sprint/OS ou Task for alterada ou movimentada.

### 2. Stack e arquitetura recomendadas

- Front-end em React com TypeScript e Vite.
- Rotas por hash ou React Router, preservando URLs equivalentes às atuais.
- Separar `pages`, `components`, `domain`, `services`, `repositories`, `hooks` e `styles`.
- Não concentrar todas as páginas e regras em um único componente.
- Criar uma camada de domínio independente da interface.
- Criar um repositório com contrato abstrato. Inicialmente pode usar `localStorage`, mas deve permitir substituição por Supabase/API sem reescrever as páginas.
- Toda movimentação relevante deve produzir registro de auditoria.
- Reaproveitar os dados existentes sem apagar ou sobrescrever informações do usuário.

### 3. Estrutura visual global

- Sidebar lateral esquerda com identidade **PainelPro / Gover Tech**.
- Menu dividido em Visão Geral e Gestão.
- Cabeçalho superior reduzido, com título, subtítulo, busca e ações da página.
- Perfil no canto superior direito com menu de três pontos.
- Interface clara, compacta e responsiva.
- Cards nunca podem quebrar ou comprimir campos essenciais em telas menores.
- Em resoluções menores, reduzir a quantidade de cards por linha e reorganizar grids.
- No Kanban, manter largura estável dos cards e usar rolagem horizontal para acessar todas as raias.
- Cores dos sistemas/projetos são dados configuráveis e aparecem na tarja superior e no botão do projeto.
- Etiquetas também possuem cores configuráveis.
- Nomes longos de projetos podem ocupar duas linhas com fonte menor.
- Não repetir o nome do sistema fora do botão quando ele já estiver apresentado no botão.

### 4. Páginas e rotas

Implemente as seguintes áreas:

1. `#/kanban` — Kanban de Sprints.
2. `#/dashboard` — Dashboard Gover / análise executiva do portfólio.
3. `#/superintendencia` — visão macro para a Superintendência.
4. `#/pf-forecast` — Previsão de PF Mês.
5. `#/cadastros` — cadastros e relacionamentos básicos.
6. `#/update` — registro de atualização operacional.
7. Sala de Situação pode existir como módulo secundário, sem prioridade sobre o Kanban.

### 5. Fluxo do Kanban

As raias devem aparecer exatamente nesta ordem:

1. Em planejamento.
2. Planejado.
3. Em desenvolvimento.
4. Em homologação.
5. Homologado.
6. Aguardando faturamento.
7. Faturado.

Regras:

- “Em planejamento” é sempre a primeira raia.
- “Em andamento” foi substituído por “Em desenvolvimento”.
- “Concluído” foi substituído por “Faturado”.
- “Crítica” não é uma raia; é um nível de prioridade.
- “Atenção” não é uma raia; é uma etiqueta.
- Não existe limite de quantidade de cards por raia.
- Todas as raias permanecem lado a lado. “Aguardando faturamento” e “Faturado” são acessadas por rolagem horizontal, sem serem empilhadas abaixo do Kanban.
- Cards podem ser movidos entre raias por drag-and-drop.
- `Alt + ←/→` move a Sprint para a raia anterior ou seguinte.
- `Enter` abre a Sprint diretamente na aba Tasks.
- A instrução de teclado deve aparecer centralizada no rodapé, fora do quadro do Kanban.
- Registrar data/hora de entrada em cada raia e reiniciar a contagem quando a Sprint mudar de etapa.
- Não exibir no card os avisos “dias na raia” e “sem atualização há X dias”; essas informações pertencem ao Resumo.

### 6. Toolbar e filtros do Kanban

- Busca por sistema, Sprint, OS ou objetivo.
- Um único botão `Filtros` abre um dropdown com subfiltros.
- Filtros por Projeto, PO, Gerente, Prioridade, Etiqueta e Situação.
- A opção geral de cada filtro deve usar apenas o nome da funcionalidade: `Projetos`, `POs`, `Gerentes`, `Prioridades`, `Etiquetas` e `Situações`. Não usar “Todos os...”.
- O filtro de projeto deve considerar o nome-base do projeto, sem o número da Sprint, para retornar todas as Sprints daquele projeto.
- Alternador `Kanban | Lista` ao lado do filtro e do botão `Nova Sprint`.
- Menu de três pontos próximo ao perfil com ações como `Etiquetas` e `Salvar visão`.
- Permitir salvar e restaurar uma visão de filtros.
- Não incluir modo foco.
- Não incluir seleção de cards, limpar seleção ou ações em lote na interface principal.
- Não mostrar banner de recomendações automáticas.

### 7. Card da Sprint/OS

O card deve ser compacto, mas conter:

- Tarja superior na cor do sistema, de ponta a ponta.
- Botão colorido com o nome do sistema/projeto.
- Número pequeno da Sprint.
- Número da OS no formato `OS #15000`.
- Objetivo/descrição da Sprint.
- Indicador circular de progresso.
- Menu de três pontos fora do círculo de progresso.
- Quantidade de Tasks concluídas, pendentes e bloqueadas quando aplicável.
- Barra de progresso fina.
- PO/responsável com avatar ou iniciais.
- Data/prazo.
- Quantidade de PF estimados ao lado da data ou da identificação da Sprint.
- Prioridade e etiquetas.
- Campo Equipe e indicador Concluídos não devem ocupar blocos próprios no card.
- Riscos e dependências não devem aparecer no card compacto.

O menu de três pontos contém, no mínimo:

- Editar Sprint.
- Abrir Tasks.
- Destacar card ou remover destaque.

### 8. Cadastro e edição de Sprint

Campos obrigatórios ou disponíveis:

- Sistema/projeto.
- Número da Sprint.
- Número da OS.
- Objetivo.
- PO responsável.
- Prazo.
- PF estimado.
- PF detalhado.
- Mês de previsão de faturamento.
- Raia inicial.
- Prioridade.
- Etiquetas.
- Destaque executivo e texto do destaque.

Ao escolher um projeto, preencher o PO vinculado quando existir. O mês de previsão de faturamento pode ser alterado sempre que a OS for transferida para outro mês.

### 9. Detalhes da Sprint

Ao clicar no card, abrir um modal ou painel detalhado. A abertura normal deve permitir as abas:

- Resumo.
- Tasks.
- Histórico.
- Destaque.

No Resumo mostrar:

- Sistema, Sprint, OS, objetivo, raia e prioridade.
- PO e gerente de projetos.
- Analista CGTIC e analista de negócio.
- PF estimado e PF detalhado.
- Previsão de faturamento.
- Datas, prazo, dias na raia e última atualização.
- Etiquetas, impedimentos e informações executivas.

Na aba Destaque:

- Checkbox `Exibir no Dashboard Gover`.
- Quando marcado, habilitar campo de texto para a informação executiva.
- Salvar a informação imediatamente ou ao confirmar a edição.
- O item deve aparecer na área Destaques do Dashboard Gover.

### 10. Tasks e subcards

- Cada Sprint possui Tasks.
- Estados das Tasks: `A Fazer`, `Em Andamento`, `Bloqueada` e `Concluída`.
- Permitir criar, editar e movimentar Tasks entre estados.
- Cada Task pode conter título, responsável, pontos, status e observações.
- O progresso da Sprint deve ser recalculado a partir das Tasks quando houver pontuação disponível.
- Tasks bloqueadas influenciam indicadores e pontos críticos.
- Toda alteração deve aparecer no Histórico/Auditoria.

### 11. Prioridade, etiquetas e saúde

- Prioridades iniciais: Baixa, Média, Alta e Crítica.
- Crítica é usada para escalonamento gerencial.
- Atenção é uma etiqueta configurável.
- Etiquetas podem ser criadas, editadas e receber cor.
- O sistema atual também calcula uma leitura de saúde a partir de progresso esperado, bloqueios, impedimentos e riscos, apresentando estados como Saudável, Atenção e Crítico. Esse cálculo deve ficar na camada de domínio e não substituir a prioridade definida pelo usuário.

### 12. Relacionamentos organizacionais

- Um Projeto é vinculado a um PO.
- Um PO é vinculado a um Gerente de Projetos.
- Um Gerente pode ter vários POs.
- O PO alimenta os responsáveis do projeto.
- Um Projeto pode ter um Analista CGTIC e um Analista de Negócio.
- O Analista CGTIC é responsável pelo acompanhamento do projeto; gerente e PO prestam justificativas a ele.
- O Analista de Negócio representa a área dona/usuária do sistema; o Analista CGTIC presta justificativa a ele.
- Analistas são mostrados no Resumo da Sprint, não no card compacto.

### 13. Cadastros

A página de Cadastros deve listar, criar e editar:

- Sistemas/projetos, incluindo cor, PO, Analista CGTIC e Analista de Negócio.
- POs, incluindo Gerente vinculado.
- Gerentes de Projetos.
- Analistas CGTIC.
- Analistas de Negócio.
- Prioridades.
- Etiquetas, incluindo seletor de cor.

Não criar páginas meramente informativas: todas as listagens precisam ter ações reais de cadastro e edição.

### 14. Dashboard Gover

- Exibir KPIs compactos de Sprints, Tasks, entregas e itens em atenção.
- A seção `Status dos Sistemas` mostra somente Sprints em `Em desenvolvimento` e `Em homologação`.
- Sprints em planejamento, planejadas, homologadas, aguardando faturamento ou faturadas não aparecem nessa seção.
- Filtros por sistema/projeto ficam próximos ao título `Status dos Sistemas`.
- Usar cards responsivos; reduzir a quantidade por linha conforme a largura disponível, sem quebrar seu conteúdo.
- Em telas largas, utilizar até cinco cards por linha quando houver espaço real.
- A área `Destaques` ocupa aproximadamente 30% da largura e fica ao lado do Status dos Sistemas.
- A área mostra todas as Sprints marcadas como destaque e seus textos executivos.
- Não duplicar o nome do projeto fora do botão colorido.

### 15. Dashboard da Superintendência

Esta página possui visão ainda mais macro:

- Filtros por situação: Em planejamento, Planejado, Em desenvolvimento, Em homologação, Homologado, Aguardando faturamento e Faturado.
- Mostrar qual Sprint está em desenvolvimento por sistema.
- Dar destaque a bloqueios, entregas e informações que exigem decisão.
- Permitir clicar em gráficos para abrir o detalhe das entregas do último mês.
- Evitar excesso de informação operacional de Tasks; priorizar decisão executiva.

### 16. Previsão de PF Mês

O mês selecionado controla todos os dados da página.

KPIs:

- Total de PF previstos no mês.
- Quantidade de OS em desenvolvimento.
- Quantidade de OS entregues.
- PF aguardando faturamento.
- Total de PF faturados no mês.
- Total de PF detalhados quando relevante.

Regras de PF:

- Existem `PF estimado` e `PF detalhado`.
- PF estimado é informado durante o planejamento/desenvolvimento.
- PF detalhado é informado quando a OS está em Aguardando faturamento, após análise detalhada do que foi entregue.
- A OS possui mês de previsão de faturamento e pode ser movida para outro mês.
- A página sempre reflete a movimentação do Kanban e o mês vigente da previsão.
- O comparativo deve mostrar PF estimado × PF detalhado, diferença absoluta, percentual e se houve aumento ou redução.
- Quando o PF detalhado ainda não existir em uma OS aguardando faturamento, apresentar ponto crítico `PF detalhado pendente`.

Layout e comportamento:

- Seletor de mês com anterior e próximo.
- Filtros dentro de um dropdown no topo, ao lado do título e subtítulo.
- Subfiltros por Projeto, OS, PO, Gerente e Situação.
- KPIs compactos, sem grandes áreas vazias.
- Textos longos em até duas linhas ou com reticências e tooltip.
- `Previsão por OS` imediatamente abaixo dos KPIs.
- Mostrar somente OS previstas para o mês selecionado.
- Agrupar cards por situação e não renderizar raias vazias.
- Gráfico horizontal comparando PF estimado e detalhado por projeto ou recorte.
- Área de Pontos críticos.
- Área de Pontos de melhoria, com botão para adicionar e checkbox para marcar como resolvido.
- Clicar em card ou barra do gráfico abre o detalhe correspondente.

### 17. Sistemas/projetos conhecidos

O cadastro é dinâmico, mas deve aceitar e preservar pelo menos estes sistemas e projetos:

- SCIEX — Sistema de Controle de Importação e Exportação.
- SCME — Sistema de Controle de Mercadoria Estrangeira.
- SIMNAC — Sistema de Ingresso de Mercadoria Nacional.
- CADSUF — Sistema de Cadastro SUFRAMA.
- SAC — Sistema de Arrecadação.
- Mobile — APP de Vistoria.
- SAGAT — Sistema de Acompanhamento, Gestão e Análise Tecnológica.
- Sistema de Projetos.
- MCI — Módulo de Controle de Insumos.
- MEAAP — Módulo de Elaboração, Apresentação e Análise de Projetos.
- MAPI — Módulo de Acompanhamento de Projetos Industriais.
- MPPB — Módulo de Processo Produtivo Básico.
- MCPP — Módulo de Cadastramento de Produto Padronizado.

Corrigir qualquer ocorrência de `Siecx` para `Sciex` ou `SCIEX`, conforme o padrão visual adotado.

### 18. Registros entregues que devem ser preservados

Os seguintes registros possuem PF estimado igual a zero, PF detalhado informado, Gerente de Projetos `William D’Ângelo` e origem/status de entrega:

- Sprint 11 · OS 15672 · SPR-MCI · 15,75 PF detalhados.
- Sprint 16 · OS 15891 · SPR-MAPI · 12,75 PF detalhados.
- Sprint 15 · OS 15788 · SPR-MAPI · 34,5 PF detalhados.
- Sprint 12 · OS 15787 · SPR-MCI · 20,25 PF detalhados.
- Sprint 10 · OS 15537 · SCIEX Exportação · 49 PF detalhados · prioridade Crítica.
- Sprint 13 · OS 15646 · SCIEX Portal Único · 57,50 PF detalhados · prioridade Crítica.

### 19. Persistência e auditoria

- Persistir Sprints, Tasks, cadastros, cores, relacionamentos, filtros salvos, destaques e pontos de melhoria.
- Migrações de dados devem ser versionadas e idempotentes.
- Nunca limpar todo o armazenamento apenas porque uma nova versão foi publicada.
- Registrar no histórico: criação, edição, mudança de raia, reordenação, atualização de Task, destaque, mudança de PF, previsão mensal e alteração de responsáveis.
- Mudanças de tela devem aparecer imediatamente em todas as áreas derivadas.

### 20. Critérios de aceitação

A réplica somente está pronta quando:

- Todas as sete raias funcionarem e puderem ser acessadas horizontalmente.
- Cadastro, edição, detalhes, Tasks e Histórico funcionarem de verdade.
- Filtros e relacionamentos retornarem dados corretos.
- Dashboard Gover respeitar os dois status permitidos e mostrar destaques.
- Previsão de PF respeitar mês, situação e PF estimado/detalhado.
- Cadastros permitirem criar e editar todos os tipos e vínculos.
- A interface permanecer utilizável em desktop, notebook, tablet e celular.
- Os dados existentes forem migrados sem perda.
- Não houver regressão visual em relação ao sistema legado.
- Testes de domínio cobrirem progresso, saúde, movimentação, PF, faturamento e relacionamentos.

Antes de implementar, apresente:

1. Arquitetura de componentes e pastas.
2. Modelo de dados completo.
3. Matriz de paridade por página.
4. Plano de migração dos dados existentes.
5. Sequência incremental de implementação.

Não considere o trabalho concluído apenas porque as telas renderizam. A conclusão exige paridade funcional, dados compartilhados entre páginas, persistência, responsividade e ausência de perda de regras de negócio.

