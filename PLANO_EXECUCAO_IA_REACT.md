# PainelPro React — Caderno de execução para agentes de desenvolvimento

**Documento principal:** `ROADMAP_PARIDADE_MODERNIZACAO_REACT.md`  
**Objetivo:** permitir que uma IA de menor capacidade implemente a migração em tarefas pequenas, verificáveis e sem reinterpretar as regras do produto  
**Regra de uso:** executar um pacote por vez, salvo quando este documento declarar explicitamente que dois pacotes são paralelos

## 1. Instrução obrigatória para qualquer agente

Antes de modificar código, o agente deve:

1. ler integralmente este arquivo;
2. ler a fase correspondente no roadmap principal;
3. inspecionar os arquivos listados no pacote;
4. verificar alterações já existentes e preservá-las;
5. declarar em uma frase o que será alterado;
6. não ampliar o escopo do pacote;
7. implementar;
8. executar os comandos de validação indicados;
9. informar arquivos alterados, testes executados e pendências reais.

Se uma dependência do pacote não estiver concluída, o agente deve parar e reportar a dependência. Não deve criar uma segunda solução provisória.

## 2. Contrato imutável do produto

### 2.1 Raias e IDs

| Ordem | ID técnico | Texto exibido |
|---:|---|---|
| 1 | `planning` | Em planejamento |
| 2 | `planned` | Planejado |
| 3 | `development` | Em desenvolvimento |
| 4 | `homologation` | Em homologação |
| 5 | `approved` | Homologado |
| 6 | `billing` | Aguardando faturamento |
| 7 | `completed` | Faturado |

Não criar IDs alternativos. Não renomear `completed` no armazenamento; apenas o rótulo apresentado é `Faturado`.

### 2.2 Semântica

- `Crítica` pertence a prioridade.
- `Atenção` pertence a etiquetas.
- Saúde/Health Score não aparece como filtro, badge ou informação do card.
- Bloqueio é derivado de Tasks bloqueadas, não de uma raia adicional.
- Risco e dependência não aparecem no card compacto.
- Projeto/sistema e número da Sprint são informações separadas.
- Número da OS é campo obrigatório em nova Sprint.
- PF estimado e PF detalhado nunca são somados como se fossem o mesmo campo.
- PF detalhado pode ser informado em `billing` e `completed`.
- Competência de faturamento usa `YYYY-MM` no modelo e mês/ano em português na interface.

### 2.3 Funcionalidades proibidas

Não implementar:

- Modo Foco;
- limite de cards por raia;
- limite WIP;
- seleção de cards;
- limpar seleção;
- ações em lote;
- raia Atenção;
- raia Crítica;
- gráficos dentro do Kanban;
- mudança automática de raia por recomendação.

### 2.4 Fonte dos textos e dados

- Não inventar nomes, OSs, Sprints, pessoas, percentuais ou métricas.
- Usar apenas dados existentes nos repositórios/fixtures autorizados.
- Estado sem dado deve exibir `Não informado`, `Nenhum item` ou mensagem equivalente objetiva.
- Não usar texto decorativo como `COMMAND CENTER`, `INTELLIGENCE LAYER` ou slogans sem função.

## 3. Contrato visual

### 3.1 Direção

**Âncora:** Swiss.  
**Motivo:** o produto exige alta densidade, leitura rápida, governança e precisão.  
**Diferenciador:** a “espinha operacional” — tarja superior contínua na cor do sistema, badge do projeto e numerais de OS/Sprint/PF como âncoras do card.

### 3.2 Tokens permitidos

- Superfícies: `#FFFFFF` e `#F7F7F8`.
- Cor primária: escolher e manter somente uma entre o azul atual aprovado e `#002FA7`; a Fase 2 formaliza a decisão.
- Tipografia: Helvetica Neue, Söhne ou pilha sans-serif de sistema equivalente.
- Estrutura: bordas de 1 px, alinhamento à esquerda, grid explícito.
- Sombras: discretas; não usar glow, gradiente ou sombra decorativa pesada.
- Cores de sistema: somente do cadastro.
- Cores semânticas: verde para sucesso, âmbar para atenção, vermelho para erro/crítico, violeta para homologação.

### 3.3 Regras verificáveis

- Não duplicar título no shell e no conteúdo.
- Não colocar card dentro de card sem função de agrupamento.
- Não usar ícone Unicode; usar `lucide-react`.
- Texto padrão de ação permanece padrão: `Salvar`, `Cancelar`, `Editar`, `Excluir`.
- Cards não podem cortar textos sem `title`, tooltip ou acesso ao conteúdo completo.
- Foco deve ser visível.
- O card do Kanban mantém largura mínima definida no Design System e não é comprimido para exibir mais raias.

## 4. Arquitetura de pastas alvo

O agente deve preferir a estrutura abaixo. Novos arquivos só devem ser criados quando o pacote autorizar.

```text
src/
  app/
    providers/
    router/
  components/
    layout/
    ui/
  design-system/
  domain/
    audit/
    billing/
    improvement/
    project/
    registration/
    sprint/
  features/
    dashboard/
    forecast/
    kanban/
    leader/
    registrations/
    sprints/
    superintendence/
    updates/
  repositories/
    contracts/
    local-storage/
  services/
    analytics/
    migration/
```

Regras:

- `features` renderiza e orquestra interação.
- `domain` define tipos e regras puras.
- `services` executa casos de uso.
- `repositories` lê e grava dados.
- nenhum componente React lê `window.localStorage` diretamente.

## 5. Comandos mínimos de validação

Depois de qualquer mudança TypeScript/React:

```text
npm run typecheck
npm run test:react
npm run build:react
```

Quando houver mudança em scripts legados ou migração:

```text
npm run check
npm test
```

Se um comando falhar, o pacote não está concluído. O agente deve corrigir ou relatar o erro exato.

## 6. Registro de execução

Cada pacote deve terminar com este formato:

```text
Pacote: F?-T??
Status: concluído | bloqueado
Arquivos alterados:
- caminho
Validações:
- comando: resultado
Critérios de aceite:
- [x] critério
Pendências:
- nenhuma | descrição objetiva
```

## 7. Pacotes atômicos

### Fase 0 — Rebaseline e proteção

#### F0-T01 — Congelar contrato de domínio

**Depende de:** nenhuma.  
**Arquivos permitidos:** `src/domain/sprint/model.ts`, novo `src/domain/sprint/constants.ts`, testes do domínio.  
**Fazer:** centralizar IDs/rótulos das sete raias, prioridades oficiais e estados de Task. Marcar `health` como legado sem removê-lo do dado nesta tarefa.  
**Não fazer:** alterar UI ou migrar armazenamento.  
**Aceite:** todas as páginas podem importar a mesma constante; nenhum segundo array de raias é criado; testes confirmam ordem e rótulos.

#### F0-T02 — Inventariar armazenamento

**Depende de:** F0-T01.  
**Arquivos permitidos:** novo `src/services/migration/storageInventory.ts`, testes e documentação de baseline.  
**Fazer:** declarar todas as chaves legadas conhecidas, versão e entidade de destino.  
**Aceite:** o inventário cobre Sprints, banco/auditoria, cadastros, etiquetas, cores, relacionamentos, melhorias, visão salva e preferências.

#### F0-T03 — Proteger contra reset destrutivo

**Depende de:** F0-T02.  
**Arquivos permitidos:** scripts de bootstrap/migração identificados pelo inventário e testes.  
**Fazer:** impedir substituição automática de dados existentes por divergência de versão; criar cópia de segurança antes de migração.  
**Aceite:** fixture com dados do usuário permanece intacta; executar duas vezes produz o mesmo resultado.

#### F0-T04 — Fixtures e snapshots de referência

**Depende de:** F0-T02.  
**Arquivos permitidos:** `tests/fixtures/**`, documentação de baseline.  
**Fazer:** criar fixture sanitizada derivada do formato real, incluindo PF decimal, destaque, Tasks e relacionamentos.  
**Aceite:** nenhum dado fictício é exibido na aplicação; fixture serve apenas a teste; casos de borda estão presentes.

### Fase 1 — Dados e repositórios unificados

#### F1-T01 — Modelos de cadastro

**Depende de:** F0-T01.  
**Criar:** `src/domain/registration/model.ts`.  
**Fazer:** tipos para Project, ProjectManager, ProductOwner, CgticAnalyst, BusinessAnalyst, Priority e Label.  
**Aceite:** IDs são estáveis; cores usam string hexadecimal validada; relações usam IDs, não nomes duplicados.

#### F1-T02 — Contrato de repositório de cadastros

**Depende de:** F1-T01.  
**Criar:** `src/repositories/contracts/RegistrationRepository.ts`, implementação local e testes.  
**Fazer:** listar, obter, criar, atualizar e excluir com resultado explícito.  
**Aceite:** componente React não é importado; repositório funciona com `Storage` injetável em teste.

#### F1-T03 — Migração de cadastros legados

**Depende de:** F0-T03, F1-T02.  
**Criar/alterar:** serviço de migração e testes.  
**Fazer:** consolidar `painelpro-cadastros`, labels, cores e relacionamentos; importar também `painelpro-registrations-react` sem duplicar.  
**Aceite:** prevalência de dados é documentada; duas execuções são idempotentes; vínculos inválidos são reportados, não descartados silenciosamente.

#### F1-T04 — Serviço de cadastros

**Depende de:** F1-T02.  
**Criar:** `src/services/RegistrationService.ts` e testes.  
**Fazer:** regras de unicidade, cor, vínculos e exclusão protegida.  
**Aceite:** gerente pode ter vários POs; PO pode ter vários projetos; exclusão vinculada retorna motivo.

#### F1-T05 — Preferências e visões salvas

**Depende de:** F0-T02.  
**Criar:** contrato e repositório para `painelpro-kanban-saved-view` e `painelpro-kanban-preferences`.  
**Aceite:** visão e preferências são independentes dos dados de negócio; ausência de chave retorna padrão seguro.

#### F1-T06 — Analytics compartilhado

**Depende de:** F0-T01.  
**Criar:** `src/services/analytics/PortfolioAnalyticsService.ts` e testes.  
**Fazer:** consultas puras para KPIs, agrupamento por sistema/raia, PF por competência e itens críticos.  
**Aceite:** Dashboard, Forecast e Superintendência não precisam duplicar filtros; números decimais são normalizados.

### Fase 2 — Design System 2.0

#### F2-T01 — Consolidar tokens Swiss

**Depende de:** nenhuma mudança funcional.  
**Arquivos permitidos:** `src/design-system/tokens.css`, `src/foundation.css`, documentação visual.  
**Fazer:** definir cores, tipo, espaços, raios, sombras, z-index e breakpoints; remover tokens conflitantes.  
**Aceite:** uma cor primária; superfícies somente brancas/neutras; sem gradientes; contraste AA documentado.

#### F2-T02 — Primitivos de interação

**Depende de:** F2-T01.  
**Arquivos permitidos:** `src/components/ui/index.tsx`, `src/design-system/components.css`, testes.  
**Fazer:** Button, IconButton, Input, Select, Checkbox, Switch, Tooltip, Menu, Modal, Drawer e Toast.  
**Aceite:** foco visível, labels acessíveis, loading/disabled, Escape fecha overlay e foco retorna ao disparador.

#### F2-T03 — Componentes de informação

**Depende de:** F2-T01.  
**Criar/alterar:** MetricCard, SystemBadge, LabelBadge, PriorityBadge, StatusBadge, ProgressBar, EmptyState, Skeleton e DataTable.  
**Aceite:** StatusBadge não aceita `Saudável`; nomes longos não quebram o layout; numerais usam alinhamento tabular.

#### F2-T04 — Contrato final do SprintCard

**Depende de:** F2-T02, F2-T03.  
**Arquivos permitidos:** `src/features/sprints/components/SprintCard.tsx`, CSS dedicado e testes.  
**Fazer:** implementar tarja contínua, badge, Sprint/OS/PF, objetivo, progresso, contadores condicionais, owner/data e etiquetas.  
**Aceite:** sem Health Score; sem risco/dependência; três pontos fora do progresso; largura mínima e altura compacta respeitadas.

#### F2-T05 — Catálogo de componentes

**Depende de:** F2-T02 a F2-T04.  
**Arquivos permitidos:** `src/features/design-system/DesignSystemPage.tsx`.  
**Fazer:** mostrar estados reais dos componentes usando dados já existentes ou exemplos explicitamente rotulados como amostra.  
**Aceite:** nenhum texto decorativo/fictício; cada estado de interação pode ser verificado.

### Fase 3 — Shell e rotas

#### F3-T01 — Cabeçalho compacto

**Depende de:** F2-T02.  
**Arquivos permitidos:** `src/components/layout/AppShell.tsx`, `app-shell.css`.  
**Fazer:** manter um único título de página, perfil, ajuda e menu de ações; definir API para ações da página.  
**Aceite:** título não se repete; controles cabem em largura menor sem sobreposição.

#### F3-T02 — Navegação completa

**Depende de:** F3-T01.  
**Arquivos permitidos:** AppShell, `src/app/router/AppRouter.tsx`, placeholders de rota sem dados inventados.  
**Fazer:** registrar rotas oficiais para Atualização e visão do Líder; Sala de Situação permanece sinalizada como posterior.  
**Aceite:** URL direta e refresh funcionam; item ativo é perceptível.

#### F3-T03 — Paleta de comandos

**Depende de:** F3-T02.  
**Arquivos permitidos:** `CommandPalette.tsx` e testes.  
**Fazer:** navegação, busca de Sprint/OS e abertura do detalhe correto.  
**Aceite:** teclado completo; nenhum resultado sem ação.

### Fase 4 — Kanban

#### F4-T01 — Estado de filtros

**Depende de:** F1-T04, F1-T05.  
**Criar:** hook/serviço de filtros em `src/features/kanban`.  
**Fazer:** busca, projeto, PO, gerente, prioridade, etiqueta e situação. Projeto é normalizado sem Sprint.  
**Aceite:** filtros combinam por AND; limpar retorna padrão; nomes dos filtros são `Projetos`, `POs`, `Gerentes`, `Prioridades`, `Etiquetas`, `Situações`.

#### F4-T02 — Toolbar compacta

**Depende de:** F2-T02, F4-T01.  
**Fazer:** busca + dropdown de filtros; Kanban/Lista ao lado de `Nova Sprint`; etiquetas e salvar visão no menu de três pontos próximo ao perfil.  
**Aceite:** não existe barra de filtros permanentemente expandida; contagem de Sprints fica discreta no rodapé.

#### F4-T03 — Raias e rolagem

**Depende de:** F0-T01, F2-T04.  
**Arquivos permitidos:** `KanbanPage.tsx`, CSS/componentes da feature.  
**Fazer:** sete raias em fluxo horizontal, largura fixa responsiva, scroll por wheel/trackpad e cabeçalhos visíveis.  
**Aceite:** Aguardando faturamento e Faturado ficam à direita e acessíveis por scroll; nenhuma raia é comprimida.

#### F4-T04 — Drag-and-drop e ordenação

**Depende de:** F4-T03.  
**Fazer:** usar `@dnd-kit` para mover entre raias e reordenar; persistir posição; rollback em falha.  
**Aceite:** destino correto; mesma raia reordena; sem limite; auditoria contém origem/destino/posição.

#### F4-T05 — Interações do card

**Depende de:** F2-T04, F4-T04.  
**Fazer:** clique abre Tasks; menu com Editar e Destacar; Enter abre; Alt+setas move.  
**Aceite:** não há botão dentro de botão; menu não dispara abertura do card; instrução de teclado fica no rodapé externo.

#### F4-T06 — Visão em lista

**Depende de:** F4-T01, F4-T05.  
**Fazer:** tabela com sistema, Sprint, OS, objetivo, etapa, prioridade, PF, PO, prazo e ações.  
**Aceite:** usa o mesmo conjunto filtrado; ações equivalentes ao card; colunas adaptam em telas menores.

#### F4-T07 — Visões salvas e etiquetas

**Depende de:** F1-T05, F4-T01.  
**Fazer:** salvar/restaurar filtros; abrir gerenciador oficial de etiquetas.  
**Aceite:** recarregar preserva visão; etiqueta criada aparece em cadastro, editor e filtro.

### Fase 5 — Detalhe e Tasks

#### F5-T01 — Estrutura do detalhe

**Depende de:** F2-T02.  
**Arquivos permitidos:** `SprintDetailsModal.tsx`, CSS e testes.  
**Fazer:** abas Resumo, Tasks, Histórico e Destaque; default Tasks quando origem for Kanban.  
**Aceite:** URL/estado identifica Sprint; Escape fecha; celular usa tela cheia.

#### F5-T02 — Resumo completo

**Depende de:** F1-T04, F5-T01.  
**Fazer:** exibir todos os campos oficiais e responsáveis; PF próximo à data; dias na raia apenas no resumo.  
**Aceite:** dados ausentes são `Não informado`; vínculos vêm do cadastro.

#### F5-T03 — Editor de Sprint

**Depende de:** F1-T04, F5-T02.  
**Arquivos permitidos:** `SprintEditors.tsx`, serviço e testes.  
**Fazer:** criar/editar sistema, Sprint, OS, objetivo, responsáveis, raia, prioridade, etiquetas, datas, PFs e competência.  
**Aceite:** OS obrigatória; opções vêm dos cadastros; PF detalhado respeita etapa.

#### F5-T04 — Quadro de Tasks

**Depende de:** F5-T01.  
**Fazer:** quatro estados, CRUD, DnD e alternativa por select/teclado.  
**Aceite:** progresso e bloqueadas atualizam Sprint pelo serviço; nenhuma regra fica só no componente.

#### F5-T05 — Histórico

**Depende de:** F4-T04, F5-T03, F5-T04.  
**Fazer:** listar eventos com autor, horário e antes/depois; filtrar por tipo.  
**Aceite:** movimentos, edições, PF e Tasks aparecem sem duplicação.

#### F5-T06 — Destaques

**Depende de:** F5-T01.  
**Fazer:** switch, tipo, texto de 280 caracteres, autor e datas; adicionar ação equivalente no menu do card.  
**Aceite:** estado persiste; desmarcar remove do Dashboard sem apagar histórico.

### Fase 6 — Cadastros

#### F6-T01 — Substituir armazenamento isolado

**Depende de:** F1-T02 a F1-T04.  
**Arquivos permitidos:** `RegistrationsPage.tsx` e provider/hook oficial.  
**Fazer:** remover acesso direto a `window.localStorage`.  
**Aceite:** não há ocorrência de `painelpro-registrations-react` na feature.

#### F6-T02 — Lista e edição

**Depende de:** F6-T01, F2-T02.  
**Fazer:** listar, buscar, criar, editar e excluir cada tipo.  
**Aceite:** edição aparece na listagem; exclusão vinculada explica bloqueio.

#### F6-T03 — Cores

**Depende de:** F6-T02.  
**Fazer:** seletor de cor para Projetos e Etiquetas; validação e preview.  
**Aceite:** alteração se reflete em card, filtro e dashboard sem recarregar.

#### F6-T04 — Vínculos

**Depende de:** F6-T02.  
**Fazer:** gerente-PO, PO-projeto e analistas-projeto.  
**Aceite:** formulários impedem referência inexistente; um gerente aceita vários POs.

### Fase 7 — Previsão de PF

#### F7-T01 — Regras de competência e PF

**Depende de:** F1-T06, F5-T03.  
**Criar/alterar:** domínio de billing e testes.  
**Fazer:** competência móvel, PF estimado/detalhado, faturado por `invoicedAt` e arredondamento.  
**Aceite:** casos 15,75 e 12,75 mantêm precisão; mudança de mês recalcula os dois meses.

#### F7-T02 — Cabeçalho e filtros

**Depende de:** F7-T01, F2-T02.  
**Arquivos permitidos:** `PfForecastPage.tsx` e componentes da feature.  
**Fazer:** mês e dropdown com projeto, OS, PO, gerente e situação ao lado do título.  
**Aceite:** filtros ocupam topo sem criar segunda faixa permanente.

#### F7-T03 — KPIs e Previsão por OS

**Depende de:** F7-T01, F7-T02.  
**Fazer:** cinco KPIs compactos e grupos por situação logo abaixo.  
**Aceite:** somente competência escolhida; raias vazias não aparecem; textos longos têm duas linhas/tooltip.

#### F7-T04 — Comparação e fluxo

**Depende de:** F1-T06, F7-T03.  
**Fazer:** estimado × detalhado por projeto e gráfico horizontal de fluxo.  
**Aceite:** variação absoluta/percentual formatada; sem números como `398.799999`.

#### F7-T05 — Críticos e melhorias

**Depende de:** F7-T01.  
**Criar:** modelo/repositório/serviço de ImprovementPoint e UI.  
**Fazer:** adicionar, editar e marcar resolvido; listar críticos derivados.  
**Aceite:** histórico preservado; resolver não exclui; listas respeitam filtros/mês.

### Fase 8 — Dashboard Gover

#### F8-T01 — KPIs e status

**Depende de:** F1-T06, F2-T03.  
**Arquivos permitidos:** `DashboardPage.tsx` e componentes da feature.  
**Fazer:** KPIs compactos; Status apenas desenvolvimento/homologação; filtros por sistema.  
**Aceite:** outras raias não aparecem; cards reorganizam por breakpoint.

#### F8-T02 — Cards de sistema

**Depende de:** F6-T03, F8-T01.  
**Fazer:** badge colorido, Sprint, OS, progresso, Tasks e etapa sem repetir sistema fora do badge.  
**Aceite:** nomes longos usam duas linhas e tooltip; nenhuma rolagem lateral indevida.

#### F8-T03 — Sidebar de Destaques

**Depende de:** F5-T06.  
**Fazer:** 30% desktop, empilhada em telas menores, clique abre Sprint.  
**Aceite:** somente marcados; ordem definida; vazio orienta sem inventar conteúdo.

#### F8-T04 — Atividades e decisões

**Depende de:** F1-T06, F5-T05.  
**Fazer:** progresso geral, atividades recentes e decisões/alertas.  
**Aceite:** cada item conduz à origem; sem duplicar o Kanban.

### Fase 9 — Superintendência e Líder

#### F9-T01 — Filtros e KPIs da Superintendência

**Depende de:** F1-T06.  
**Fazer:** filtros por etapa e KPIs clicáveis.  
**Aceite:** clique aplica filtro e atualiza todos os blocos.

#### F9-T02 — Sistemas e decisões

**Depende de:** F9-T01.  
**Fazer:** cards macro por sistema, Sprints ativas, bloqueios e próxima ação.  
**Aceite:** leitura macro; sem Tasks detalhadas no primeiro nível.

#### F9-T03 — Entregas e drill-down

**Depende de:** F9-T01.  
**Fazer:** gráfico do último mês e detalhe clicável; distribuição por etapa.  
**Aceite:** gráfico e detalhe compartilham filtro; mês e timezone consistentes.

#### F9-T04 — Domínio do acompanhamento do Líder

**Depende de:** F1-T01.  
**Criar:** modelos/repositórios/serviços para BacklogItem, Impediment e Return.  
**Aceite:** regras de crítico, sem retorno e sem atualização são testadas.

#### F9-T05 — Página do Líder

**Depende de:** F9-T04, F2-T03.  
**Criar:** `src/features/leader/LeaderProjectsPage.tsx`.  
**Fazer:** KPIs, filtros, resumo por projeto e detalhe.  
**Aceite:** responde backlog, impeditivo, retorno e próxima ação; ausência vira `Não informado`.

### Fase 10 — Atualizações e Sala de Situação

#### F10-T01 — Nova Atualização

**Depende de:** F5-T04, F5-T05, F9-T04.  
**Criar:** `src/features/updates/UpdatePage.tsx`, serviço e testes.  
**Fazer:** selecionar Sprint/Task, registrar status, progresso, comentário, retorno e próxima ação.  
**Aceite:** uma submissão gera uma atualização; botão bloqueia dupla gravação; histórico é atualizado.

#### F10-T02 — Rota e navegação da atualização

**Depende de:** F10-T01.  
**Fazer:** registrar rota e item de menu.  
**Aceite:** abrir por URL, menu e contexto de Sprint.

#### F10-T03 — Sala de Situação mínima

**Depende de:** F9-T04 e autorização expressa para iniciar P3.  
**Fazer:** alertas, decisões e histórico; não criar novas raias.  
**Aceite:** recomendações explicam dados usados e nunca movem Sprint automaticamente.

### Fase 11 — Backend e autenticação

#### F11-T01 — Contrato HTTP

**Depende de:** modelos consolidados das Fases 1, 5, 7 e 9.  
**Fazer:** documentar endpoints, payloads, erros e paginação.  
**Aceite:** nenhum componente depende do formato do banco; decimal e datas têm contrato explícito.

#### F11-T02 — Repositórios API

**Depende de:** F11-T01.  
**Fazer:** implementar contratos existentes via API com seleção por configuração.  
**Aceite:** UI não muda ao trocar repositório local por remoto.

#### F11-T03 — Sessão e perfis

**Depende de:** F11-T01.  
**Fazer:** login, expiração, rotas protegidas e perfis.  
**Aceite:** 401 encerra sessão; 403 explica ausência de permissão; UI oculta ação e servidor bloqueia.

#### F11-T04 — Concorrência e auditoria

**Depende de:** F11-T02.  
**Fazer:** versão de entidade, conflito 409, retry/rollback e auditoria server-side.  
**Aceite:** duas edições não sobrescrevem silenciosamente.

### Fase 12 — Qualidade e cutover

#### F12-T01 — Testes E2E P0

**Depende de:** Fases 4, 5 e 6.  
**Fazer:** criar testes para criar Sprint, mover, editar, Task, destaque, cadastros e filtros.  
**Aceite:** executáveis localmente e isolados de dados pessoais.

#### F12-T02 — Regressão visual

**Depende de:** Fases 2, 4, 7, 8 e 9.  
**Fazer:** snapshots nos breakpoints aprovados e comparação das páginas-chave.  
**Aceite:** diferenças deliberadas são revisadas; cards não quebram.

#### F12-T03 — Acessibilidade e performance

**Depende de:** páginas finais.  
**Fazer:** auditoria de teclado, foco, contraste, nomes acessíveis e desempenho com 50+ Sprints.  
**Aceite:** sem bloqueios AA nos fluxos principais; metas registradas.

#### F12-T04 — Ensaio de migração

**Depende de:** F11-T02 e F0-T03.  
**Fazer:** backup, migração, reconciliação de contagens/PF/vínculos e rollback.  
**Aceite:** zero perda, zero duplicação e relatório de divergências vazio ou explicado.

#### F12-T05 — Cutover

**Depende de:** F12-T01 a F12-T04.  
**Fazer:** piloto, aceite formal, janela de mudança, monitoramento e plano de retorno.  
**Aceite:** responsáveis nomeados; rollback testado; legado só é desligado após aceite.

## 8. Sequência obrigatória

```text
F0-T01 → F0-T02 → F0-T03
             └──→ F0-T04

F1-T01 → F1-T02 → F1-T03 → F1-T04
F0-T02 → F1-T05
F0-T01 → F1-T06

F2-T01 → F2-T02 → F2-T03 → F2-T04 → F2-T05
F2-T02 → F3-T01 → F3-T02 → F3-T03

Fases 1 + 2 prontas → Fases 4, 5 e 6
Fases 4 + 5 + 6 prontas → Fases 7, 8 e 9
Fases 5 + 9 prontas → Fase 10
Domínio estável → Fase 11
Todas as áreas P0/P1 prontas → Fase 12
```

## 9. Pacotes que podem ocorrer em paralelo

- F0-T02 e F2-T01.
- F1-T01 e F2-T02, após F0-T01.
- F1-T05, F1-T06 e F2-T03.
- F4-T01 e F6-T01, após Fase 1.
- F4-T03 e F5-T01, após F2-T04/F2-T02.
- F7-T02, F8-T01 e F9-T01, após F1-T06 e respectivos domínios.

Nunca executar em paralelo:

- duas tarefas que alterem `src/domain/sprint/model.ts`;
- duas tarefas que alterem a mesma migração;
- F2-T04 e F4-T05;
- F5-T03 e F6-T04 antes de fechar o contrato de vínculos;
- cutover e qualquer alteração de modelo.

## 10. Prompt padrão para delegar um pacote

Copiar e preencher somente o ID:

```text
Implemente exclusivamente o pacote [ID] descrito em
PLANO_EXECUCAO_IA_REACT.md.

Antes de alterar código:
1. leia integralmente PLANO_EXECUCAO_IA_REACT.md;
2. leia a fase correspondente em ROADMAP_PARIDADE_MODERNIZACAO_REACT.md;
3. inspecione os arquivos permitidos e preserve alterações existentes.

Não implemente tarefas de outros pacotes, não invente dados e não altere as
decisões imutáveis do produto. Use os arquivos e dependências definidos no
pacote. Ao terminar, execute todos os comandos mínimos aplicáveis e entregue o
registro de execução no formato obrigatório. Se uma dependência não estiver
concluída, pare e relate o bloqueio sem criar solução paralela.
```

## 11. Checklist do revisor

O revisor só marca o pacote como concluído se todas as respostas forem `sim`:

- O agente trabalhou apenas no pacote solicitado?
- As dependências estavam concluídas?
- As regras imutáveis foram preservadas?
- Não há leitura direta de armazenamento em componente novo?
- Não foram inventados dados ou textos decorativos?
- O comportamento responsivo foi considerado quando há UI?
- Typecheck, testes e build passaram?
- Os critérios de aceite têm evidência?
- O próximo pacote pode usar esta entrega sem criar adaptação provisória?

Se qualquer resposta for `não`, o pacote permanece incompleto.
