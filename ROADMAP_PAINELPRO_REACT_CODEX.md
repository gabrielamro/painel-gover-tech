ROADMAP — PainelPro React / PainelPro Next

1. Objetivo

Migrar o PainelPro — Gover Tech para React + TypeScript, preservando integralmente as regras de negócio, dados, relacionamentos, fluxos e comportamento do sistema legado.

A migração deve ser incremental e segura.

Regra principal: primeiro atingir paridade funcional e visual com o legado. Depois modernizar.

Diretriz especial para o Kanban

O Kanban legado é o Golden Master visual e funcional.

A implementação em React deve reproduzir sua organização, densidade, dimensões, fluxo, comportamento e experiência antes de qualquer modernização estrutural.

No Kanban, modernizações devem ser sutis e incrementais.

No Dashboard Gover e nas telas analíticas, há maior liberdade para inovação visual, desde que nenhuma regra de negócio, informação ou métrica seja inventada.

2. Princípios obrigatórios

Não tratar a migração para React como uma reconstrução do produto do zero.

Não alterar regras de negócio durante a migração.

Não apagar, zerar ou sobrescrever dados existentes.

Não criar bases independentes para Kanban, Dashboard e Forecast.

Todas as telas devem consumir a mesma camada de domínio.

Migrações de dados devem ser versionadas e idempotentes.

Antes de alterar uma funcionalidade, analisar o comportamento equivalente no legado.

Trabalhar fase por fase.

Ao concluir uma fase, validar antes de iniciar a próxima.

Quando houver conflito entre modernização visual e preservação funcional, preservar a funcionalidade.

3. Stack recomendada

Base

React

TypeScript

Vite

React Router

Formulários e validação

React Hook Form

Zod

Kanban

dnd-kit

Gráficos

Recharts

Ícones

Lucide React

Estado

Preferir estado local e hooks enquanto possível.

Caso seja necessária uma store global:

Zustand

Dados remotos

TanStack Query deve ser utilizado quando existir uma API/backend real ou cache de dados remotos.

Não usar TanStack Query apenas para encapsular localStorage.

4. Arquitetura React

Estrutura recomendada:

src/
├── app/
│   ├── router/
│   ├── providers/
│   └── App.tsx
│
├── components/
│   ├── ui/
│   └── layout/
│
├── features/
│   ├── kanban/
│   ├── dashboard/
│   ├── sprints/
│   ├── tasks/
│   ├── forecast/
│   ├── portfolio/
│   ├── decisions/
│   └── registrations/
│
├── domain/
│   ├── sprint/
│   ├── task/
│   ├── project/
│   ├── pf/
│   └── audit/
│
├── repositories/
├── services/
├── hooks/
├── design-system/
├── utils/
└── types/

Regra de acesso aos dados

A interface não deve acessar localStorage diretamente.

UI
 ↓
Service
 ↓
Repository Interface
 ↓
LocalStorageRepository

Arquitetura futura:

Repository Interface
      ↓
 ┌───────────────┐
 ↓               ↓
Supabase       API

A substituição do armazenamento não pode exigir reescrita das páginas.

5. FASE 0 — Baseline e inventário do legado

Objetivo

Congelar a referência funcional e visual do sistema atual.

Executar

Mapear todas as rotas.

Mapear todas as telas.

Registrar screenshots das páginas principais.

Identificar dados persistidos.

Identificar chaves existentes no localStorage.

Identificar regras de negócio.

Identificar ações que alteram:

Sprint;

Task;

PF;

previsão mensal;

destaque;

faturamento;

responsáveis;

filtros;

cadastros.

Identificar relacionamentos organizacionais.

Identificar componentes reaproveitáveis.

Criar matriz de paridade.

Criar

MIGRATION_BASELINE.md

Exemplo:

Página

Legado

React

Status

Kanban

OK

-

Pendente

Dashboard Gover

OK

-

Pendente

Previsão PF

OK

-

Pendente

Cadastros

OK

-

Pendente

Sprint Details

OK

-

Pendente

Tasks

OK

-

Pendente

Histórico

OK

-

Pendente

Gate

Não iniciar a reconstrução das páginas antes de finalizar o inventário.

6. FASE 1 — Fundação React

Objetivo

Criar a estrutura técnica antes da migração das telas.

Executar

Configurar React + TypeScript + Vite.

Configurar React Router.

Criar estrutura de pastas.

Criar contratos de Repository.

Criar camada de domínio.

Criar camada de serviços.

Criar providers globais realmente necessários.

Configurar tratamento centralizado de erros.

Criar estrutura de testes.

Regras

Não concentrar toda a aplicação em App.tsx.

Não colocar regras de negócio em componentes visuais.

Não acoplar páginas ao mecanismo atual de persistência.

Não duplicar modelos entre features.

Gate

A arquitetura base deve estar estável antes de migrar as telas.

7. FASE 2 — Design System PainelPro Next

Objetivo

Criar uma linguagem visual única para a aplicação.

Direção visual

Sidebar azul-marinho escura.

Área principal clara.

Surfaces brancas.

Azul elétrico como primary.

Verde para sucesso.

Âmbar para atenção.

Vermelho para crítico.

Roxo para homologação.

Bordas discretas.

Shadows sutis.

Interface compacta.

Alta densidade informacional.

Sem excesso de glassmorphism.

Sem gradientes decorativos desnecessários.

Tokens sugeridos

--bg-app: #F6F8FC;
--bg-sidebar: #061A38;
--surface: #FFFFFF;
--surface-hover: #F8FAFC;

--primary: #155EEF;
--primary-hover: #0B4DD8;
--primary-soft: #EEF4FF;

--text-primary: #101828;
--text-secondary: #475467;
--text-tertiary: #98A2B3;

--border: #EAECF0;

--success: #12B76A;
--warning: #F79009;
--danger: #F04438;
--purple: #7F56D9;

Criar componentes

Button

IconButton

Card

Badge

StatusBadge

ProjectBadge

PriorityBadge

ProgressBar

Input

Select

Dropdown

Tooltip

Modal

Drawer

Tabs

Table

Skeleton

EmptyState

Avatar

MetricCard

PageHeader

FilterBar

SearchInput

Criar página temporária

/design-system

Mostrar todos os componentes e seus estados:

default;

hover;

focus;

disabled;

loading;

error;

success.

Gate

Nenhuma página deve criar seus próprios padrões visuais paralelos.

8. FASE 3 — App Shell

Objetivo

Migrar a estrutura global da aplicação.

Criar

<AppShell>
  <Sidebar />
  <Main>
    <Topbar />
    <Outlet />
  </Main>
</AppShell>

Sidebar sugerida

VISÃO
Command Center
Portfólio

OPERAÇÃO
Sprints
Backlog
Entregas
Atualizações

GESTÃO
Decisões
Riscos
Faturamento

ANÁLISE
Indicadores
Relatórios

Comportamento

Sidebar expandida: aproximadamente 236 px.

Sidebar recolhida: aproximadamente 72 px.

Navegação responsiva.

Estado ativo evidente.

Header compacto.

Perfil e ações no canto superior direito.

Gate

Todas as rotas React devem abrir corretamente dentro do mesmo App Shell.

9. FASE 4 — Kanban React

Objetivo

Migrar o Kanban preservando integralmente sua estrutura e experiência.

REGRA CRÍTICA

NÃO REDESENHAR O KANBAN.

O Kanban legado é o Golden Master.

Manter exatamente as sete raias

Em planejamento

Planejado

Em desenvolvimento

Em homologação

Homologado

Aguardando faturamento

Faturado

Preservar

layout horizontal;

ordem das raias;

largura estável das colunas;

cards compactos;

rolagem horizontal;

título e subtítulo;

busca;

filtros;

alternância Kanban / Lista;

botão Nova Sprint;

drag-and-drop;

menu de ações do card;

informações atualmente disponíveis;

comportamento de clique;

atalhos de teclado.

Atalhos

Alt + ← move para a raia anterior.

Alt + → move para a próxima raia.

Enter abre a Sprint diretamente na aba Tasks.

Modernização permitida

Somente microvisual inicialmente:

tipografia;

alinhamento;

espaçamento;

bordas;

shadows;

iconografia;

hover;

focus;

skeleton;

transições;

drag preview;

destaque da área de drop.

Não permitido

transformar colunas em grandes cards;

empilhar raias;

criar dashboards dentro do Kanban;

esconder informações existentes;

aumentar significativamente os cards;

alterar a arquitetura de navegação do Kanban;

transformar o fluxo em um Trello genérico;

utilizar efeitos visuais que prejudiquem a leitura.

Validação

Comparar lado a lado:

KANBAN LEGADO  ×  KANBAN REACT

Meta:

100% de paridade funcional.

95% ou mais de paridade visual antes da modernização incremental.

Gate

O Kanban React não substitui o legado até atingir paridade.

10. FASE 5 — Sprint Details

Objetivo

Migrar a visualização e edição da Sprint.

Abas

Resumo

Tasks

Histórico

Destaque

Resumo

Mostrar:

sistema;

Sprint;

OS;

objetivo;

raia;

prioridade;

PO;

gerente;

analista CGTIC;

analista de negócio;

PF estimado;

PF detalhado;

previsão de faturamento;

datas;

prazo;

dias na raia;

última atualização;

etiquetas;

impedimentos;

informações executivas.

Destaque

Checkbox Exibir no Dashboard Gover.

Campo de texto executivo habilitado quando marcado.

Persistir imediatamente ou ao salvar.

Refletir no Dashboard Gover.

Gate

Alterações na Sprint devem aparecer imediatamente nas telas derivadas.

11. FASE 6 — Tasks e Histórico

Estados de Task

A Fazer

Em Andamento

Bloqueada

Concluída

Campos

título;

responsável;

pontos;

status;

observações.

Progresso

Quando houver pontuação nas Tasks:

Progresso da Sprint =
Pontos concluídos / Pontos totais

Auditoria

Registrar:

criação de Sprint;

edição;

mudança de raia;

reordenação;

criação de Task;

edição de Task;

alteração de status;

bloqueio;

conclusão;

alteração de PF;

alteração de previsão mensal;

alteração de responsáveis;

destaque;

faturamento.

Gate

Fluxo obrigatório:

Task
 ↓
Sprint
 ↓
Kanban
 ↓
Dashboard
 ↓
Indicadores

12. FASE 7 — Cadastros e relacionamentos

Cadastros

Sistemas / Projetos

POs

Gerentes de Projetos

Analistas CGTIC

Analistas de Negócio

Prioridades

Etiquetas

Relacionamentos

Gerente
  ↓
PO
  ↓
Projeto
  ↓
Sprint

Projeto pode possuir:

PO;

Analista CGTIC;

Analista de Negócio;

cor.

PO deve possuir Gerente vinculado.

Gate

Ao selecionar um projeto em uma Sprint, preencher automaticamente os relacionamentos cadastrados quando aplicável.

13. FASE 8 — Dashboard Gover Next

Objetivo

Modernizar significativamente a experiência executiva.

Diferentemente do Kanban, o Dashboard pode receber redesign.

Estrutura sugerida

COMMAND CENTER

KPIs

Executive Pulse

Status dos Sistemas
+
Próximas Entregas
+
Decisões Necessárias

Entregas & Capacidade

KPIs

Exemplos permitidos quando derivados dos dados reais:

Sprints ativas;

execução média;

PF em execução;

entregas no mês;

itens em atenção.

Mostrar tendência somente quando existir histórico confiável.

Nunca inventar métricas.

Executive Pulse

Pode sintetizar:

operação;

decisões;

entregas;

previsão de PF.

Status dos Sistemas

Mostrar somente Sprints nas situações:

Em desenvolvimento

Em homologação

Diferencial visual

O Dashboard deve transmitir:

inteligência;

governança;

tecnologia;

controle;

clareza executiva.

Gate

Toda alteração operacional deve refletir automaticamente no Dashboard.

14. FASE 9 — Previsão de PF Next

Objetivo

Migrar e modernizar a visão de previsão mensal.

KPIs

PF previstos no mês;

OS em desenvolvimento;

OS entregues;

PF aguardando faturamento;

PF faturados;

PF detalhados.

Regra

PF estimado ≠ PF detalhado

PF estimado é utilizado durante planejamento e desenvolvimento.

PF detalhado representa o detalhamento efetivo da entrega.

Funcionalidades

seletor de mês;

mês anterior;

próximo mês;

filtros;

previsão por OS;

agrupamento por situação;

comparativo estimado × detalhado;

diferença absoluta;

diferença percentual;

pontos críticos;

pontos de melhoria.

Visual sugerido

Adicionar visão acumulada de:

Previsto × Detalhado

desde que os dados permitam.

Gate

Alterar a previsão mensal de uma OS deve atualizar imediatamente o Forecast.

15. FASE 10 — Command Palette

Objetivo

Adicionar uma experiência moderna sem alterar o fluxo principal.

Atalho

Ctrl/Cmd + K

Pesquisa

Sprint

OS

Sistema

Projeto

Task

Página

Ações futuras possíveis

Nova Sprint

Abrir Kanban

Abrir Forecast

Abrir Dashboard

Regra

A Command Palette é um atalho adicional e nunca deve substituir a navegação principal.

16. FASE 11 — Superintendência

Objetivo

Criar uma visão macro para tomada de decisão.

A tela deve responder:

O que está em desenvolvimento?

O que será entregue?

O que está bloqueado?

O que precisa de decisão?

Qual o impacto?

Qual a previsão?

Evitar

excesso de detalhes de Tasks;

excesso de cards operacionais;

métricas sem contexto.

Priorizar

bloqueios;

entregas;

decisões;

previsões;

evolução do portfólio.

17. FASE 12 — Responsividade

Resoluções mínimas de teste

1920 px

1440 px

1366 px

1280 px

1024 px

768 px

390 px

Regra do Kanban

As raias não devem ser empilhadas.

Em telas menores:

manter largura funcional dos cards;

manter largura funcional das raias;

utilizar rolagem horizontal.

Cards

Não comprimir informações essenciais para caber mais cards.

Reduzir a quantidade de cards por linha nas demais telas conforme o espaço disponível.

18. FASE 13 — Testes

Testes de domínio

Cobrir:

progresso de Sprint;

progresso de Tasks;

mudança de raia;

PF estimado;

PF detalhado;

previsão de faturamento;

filtros;

prioridade;

saúde;

destaques;

auditoria;

relacionamentos.

Testes E2E prioritários

criar Sprint;

editar Sprint;

mover Sprint;

criar Task;

editar Task;

bloquear Task;

concluir Task;

alterar PF;

destacar Sprint;

alterar previsão mensal;

faturar Sprint.

Regressão

Sempre comparar comportamento do React com o legado.

19. FASE 14 — Performance

Avaliar somente após paridade

Investigar quando necessário:

React.memo;

useMemo;

useCallback;

lazy loading;

route splitting;

virtualização.

Kanban

Caso haja grande volume de Sprints por raia, avaliar virtualização vertical.

Não aplicar otimizações sem evidência de problema.

20. FASE 15 — Cutover React

A versão React só pode substituir definitivamente o legado quando:

Kanban está 100% funcional.

Dados existentes foram preservados.

Migrações estão versionadas.

Tasks funcionam.

Histórico funciona.

Dashboard usa os mesmos dados.

Forecast usa os mesmos dados.

Cadastros funcionam.

Relacionamentos funcionam.

Filtros funcionam.

Responsividade foi validada.

Testes estão passando.

Não existem regressões críticas.

O legado não contém funcionalidade necessária ausente no React.

21. Ordem de execução

00 Baseline
     ↓
01 Fundação React
     ↓
02 Design System
     ↓
03 App Shell
     ↓
04 Kanban
     ↓
05 Sprint Details
     ↓
06 Tasks + Histórico
     ↓
07 Cadastros
     ↓
08 Dashboard Gover Next
     ↓
09 Forecast PF Next
     ↓
10 Command Palette
     ↓
11 Superintendência
     ↓
12 Responsividade
     ↓
13 Testes
     ↓
14 Performance
     ↓
15 Cutover

22. Protocolo de execução para o Codex

O Codex deve executar uma fase por vez.

Antes de modificar código em cada fase:

analisar os arquivos existentes relacionados;

identificar dependências;

descrever resumidamente o plano;

identificar riscos de regressão;

indicar quais arquivos serão criados ou alterados.

Depois:

implementar somente o escopo da fase;

executar lint;

executar build;

executar testes aplicáveis;

verificar erros de console;

comparar com o legado;

registrar pendências.

Ao final, apresentar:

FASE:
STATUS:

IMPLEMENTADO:
-

ARQUIVOS ALTERADOS:
-

TESTES EXECUTADOS:
-

REGRESSÕES ENCONTRADAS:
-

PENDÊNCIAS:
-

PRÓXIMA FASE RECOMENDADA:
-

Não iniciar automaticamente a próxima fase sem concluir a atual.

23. Prompt inicial para o Codex

Copiar o texto abaixo ao iniciar o trabalho:

Você está migrando um sistema existente chamado PainelPro para React.
Não está criando um novo sistema do zero.

A versão legada é a fonte de verdade funcional.

A migração deve preservar:
- dados;
- regras de negócio;
- relacionamentos;
- fluxos;
- comportamento;
- persistência;
- atalhos;
- filtros;
- estados;
- histórico.

Trabalhe de forma incremental e execute somente a fase solicitada do ROADMAP_PAINELPRO_REACT_CODEX.md.

Não tente executar todo o roadmap de uma única vez.

Ao iniciar uma fase:

1. analise o código existente relacionado;
2. apresente resumidamente o que pretende alterar;
3. identifique riscos de regressão;
4. implemente somente o escopo daquela fase;
5. execute os testes aplicáveis;
6. execute lint/build quando aplicável;
7. verifique erros;
8. compare com o legado;
9. apresente o relatório de conclusão.

REGRA CRÍTICA DO KANBAN:

O Kanban legado é o Golden Master visual e funcional.

Não redesenhe sua macroestrutura durante a migração.

Preserve:
- as sete raias;
- a ordem das raias;
- layout horizontal;
- largura estável das colunas;
- cards compactos;
- rolagem horizontal;
- toolbar;
- busca;
- filtros;
- Kanban/Lista;
- Nova Sprint;
- drag-and-drop;
- atalhos;
- informações existentes.

Modernizações iniciais no Kanban devem se limitar a:
- tipografia;
- alinhamento;
- espaçamento;
- bordas;
- sombras;
- iconografia;
- hover;
- focus;
- skeleton;
- transições;
- feedback de drag-and-drop.

Dashboard Gover e telas analíticas podem receber modernização visual mais significativa, desde que nenhuma informação ou métrica seja inventada.

Toda informação derivada deve vir da mesma camada de domínio.

Não criar bases isoladas para Dashboard, Kanban e Forecast.

Não apagar, zerar ou sobrescrever dados existentes.

Toda migração de persistência deve ser versionada e idempotente.

Quando houver conflito entre criar algo visualmente novo e preservar uma funcionalidade existente, preserve a funcionalidade existente.

24. Primeiro comando recomendado

Após adicionar este roadmap ao repositório, iniciar com:

Leia integralmente o arquivo ROADMAP_PAINELPRO_REACT_CODEX.md.

Execute somente a FASE 0 — Baseline e inventário do legado.

Não altere funcionalidades nesta fase.

Ao final, crie o MIGRATION_BASELINE.md e apresente o relatório de conclusão previsto no roadmap.

25. Regra final de qualidade

Uma tela renderizar corretamente não significa que a migração terminou.

A fase só pode ser considerada concluída quando houver:

paridade funcional;

dados corretos;

persistência;

integração com o domínio;

responsividade;

ausência de regressões críticas;

comportamento equivalente ou superior ao legado;

testes aplicáveis executados.

No PainelPro, o React deve substituir a tecnologia do legado sem perder a qualidade do produto existente.
