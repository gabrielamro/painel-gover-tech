# Roadmap — detalhe editável da Sprint/OS

## Objetivo

Manter o **popup/modal central** de detalhe da Sprint e transformá-lo em uma experiência operacional compacta: identificar a OS imediatamente, editar o resumo sem abrir outro formulário e usar o espaço interno do modal para decisões, não para cartões vazios. Esta melhoria não cria página própria, drawer lateral ou navegação adicional.

## Limite de navegação

- O detalhe continua abrindo sobre o Kanban, Dashboard, Liderança ou qualquer outra tela de origem.
- Fechar o popup retorna o usuário exatamente ao contexto anterior, com filtros e posição preservados.
- Tasks, Histórico e Destaque continuam como abas dentro do mesmo popup.
- O modal deve manter largura ampla no desktop e altura limitada à viewport, com conteúdo interno rolável apenas quando necessário.

## Diagnóstico atual

- O cabeçalho mostra sistema, título e OS/Sprint em uma coluna; as informações principais não ocupam a largura disponível.
- A aba **Resumo** apresenta 16 dados em cartões de mesmo peso visual, inclusive campos que raramente precisam ser consultados juntos.
- O objetivo/resumo aparece em um painel grande, mas é somente leitura.
- Para alterar qualquer campo é preciso alternar para o editor completo, rompendo o fluxo de consulta rápida.
- A janela possui largura suficiente, mas o espaçamento vertical e a repetição de cartões forçam rolagem logo no início.

## Layout alvo do popup

### 1. Cabeçalho operacional em uma linha responsiva

Organizar o topo em três campos de identificação, distribuídos horizontalmente no desktop e empilhados no celular:

| Campo | Componente | Regra |
| --- | --- | --- |
| Projeto / Módulo | Combo pesquisável | Lista projetos e módulos cadastrados; ao trocar, preserva a cor do sistema e valida os vínculos do projeto. |
| Título da OS | Campo de texto | Editável diretamente; máximo de duas linhas, com tooltip quando truncado. |
| Sprint | Campo numérico compacto | Aceita somente inteiro positivo; atualiza a identificação da Sprint sem alterar a OS. |

Abaixo desses campos ficam somente dois combos pequenos: **Situação da Sprint** e **Prioridade**. A etiqueta do sistema e a OS permanecem como metadados visuais, não como campos redundantes.

### 2. Resumo vivo

Substituir o painel “Objetivo” por **Resumo da OS**:

- `Textarea` de edição direta com altura inicial de 3 linhas e expansão controlada.
- Salvar ao perder foco ou por `Ctrl/Cmd + Enter`; exibir estado “Salvando”, “Salvo” ou “Não foi possível salvar”.
- `Esc` descarta apenas a edição ainda não salva.
- Registrar a alteração na auditoria com valor anterior e novo valor.
- Não usar um botão “Editar Sprint” para este fluxo simples.

### 3. Informações agrupadas em vez de 16 cards iguais

Exibir três grupos compactos, com duas a quatro colunas conforme largura:

| Grupo | Campos | Interação |
| --- | --- | --- |
| Planejamento | Início, prazo, previsão de faturamento, PF estimado | Date/month picker e campo numérico. |
| Execução | Situação, entrada na raia, PO, gerente, analista CGTIC, analista de negócio | Combos alimentados pelos cadastros e relações permitidas. |
| Faturamento | PF detalhado, estado de faturamento, última atualização | PF detalhado bloqueado até a raia permitida; última atualização é somente leitura. |

Campos somente de auditoria, como “Última atualização” e “Entrada na raia”, ficam em uma linha discreta no rodapé do resumo, não como cards principais.

### 4. Etiquetas e ações

- Exibir etiquetas ao lado do resumo, com seletor múltiplo pesquisável para adicionar/remover.
- Manter **Destaque** como aba separada, pois possui texto e regra própria de exibição no Dashboard.
- Rodapé fixo e enxuto: `Fechar`, indicação do estado de salvamento e, apenas quando houver edição pendente, `Descartar alterações` / `Salvar alterações`.
- Remover o botão global “Editar Sprint” após a edição direta estar completa.

## Regras de interação e dados

1. O projeto deve seguir a hierarquia Projeto → Módulo. Se o módulo for alterado, o projeto-pai é atualizado; não permitir módulo sem projeto.
2. A troca de projeto deve revalidar PO, gerente, analistas e etiquetas disponíveis. Campos incompatíveis exigem confirmação antes de salvar.
3. O combo de situação usa as raias oficiais; ao mudar, reaplica as regras de PF detalhado e previsão/faturamento existentes.
4. PO, gerente e analistas devem vir dos cadastros e respeitar os vínculos atuais: PO ligado ao gerente e analistas vinculados ao projeto.
5. Nenhuma atualização é enviada a cada tecla: texto usa `blur`/atalho; combos e datas salvam por seleção. Todas as falhas mantêm o valor local e mostram uma ação de tentar novamente.
6. A aba Tasks, Histórico e Destaque preservam o comportamento atual.

## Fases de implementação

### Fase 1 — Modelo de dados e testes

- Confirmar que `Sprint` possui campos normalizados para projeto, módulo, título/objetivo, número da Sprint, situação, prioridade e responsáveis.
- Criar testes unitários para atualização parcial de cada grupo e para regras de PF detalhado/faturamento.
- Definir eventos de auditoria específicos: `RESUMO_ATUALIZADO`, `PROJETO_ALTERADO`, `SPRINT_ALTERADA`, `RESPONSAVEL_ALTERADO` e `ETIQUETAS_ATUALIZADAS`.

**Aceite:** uma atualização parcial não apaga dados não editados e é registrada em auditoria.

### Fase 2 — Cabeçalho e resumo vivo

- Criar componente `SprintIdentityEditor` para Projeto/Módulo, Título da OS e Sprint.
- Criar componente `SprintSummaryEditor` com salvamento por blur/atalho e estados de rede.
- Ajustar o popup para cabeçalho compacto, altura responsiva e sem espaço em branco acima das abas.

**Aceite:** os três campos do topo e o resumo podem ser atualizados sem entrar no editor completo.

### Fase 3 — Grupos de dados editáveis

- Criar `PlanningFields`, `ExecutionFields` e `BillingFields` com combos e validação contextual.
- Migrar etiquetas para seletor múltiplo.
- Mover metadados de auditoria para rodapé discreto.

**Aceite:** a primeira dobra do desktop mostra identificação, resumo e os campos de planejamento sem rolagem desnecessária.

### Fase 4 — Estados, responsividade e acessibilidade

- Testar desktop, notebook, tablet e celular: 3 colunas, 2 colunas e 1 coluna conforme espaço.
- Incluir foco visível, navegação por teclado, rótulos acessíveis e mensagens de salvamento por `aria-live`.
- Definir estados de carregamento, vazio e erro dos combos cadastráveis.

**Aceite:** nenhum campo ou ação essencial fica truncado, sobreposto ou inacessível em telas menores.

### Fase 5 — Regressão e homologação

- Criar E2E para edição de resumo, troca de situação, troca de projeto/módulo, responsáveis, PF e etiquetas.
- Validar que Tasks, Destaque, Histórico, drag-and-drop e auditoria continuam funcionando.
- Homologar com PO, gerente e analista CGTIC usando dados reais.

**Aceite:** todas as alterações refletem no Kanban, Dashboard, Previsão de PF e telas executivas onde aplicável.

## Critérios finais de qualidade

- O cabeçalho identifica Projeto/Módulo, título da OS e Sprint em até uma dobra.
- Não existe área decorativa vazia no resumo.
- Campos editáveis deixam claro o tipo de controle: texto, combo, data, mês ou número.
- A edição direta acontece no mesmo popup, sem abrir um segundo modal e sem perder informações por erro de salvamento.
- O design mantém a leitura compacta: poucos cartões, agrupamento semântico e ação próxima ao dado.
