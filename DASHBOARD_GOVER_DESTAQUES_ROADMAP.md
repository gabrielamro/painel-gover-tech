# Dashboard Gover — Roadmap de Destaques Executivos

## Objetivo

Criar uma Sidebar fixa na lateral direita do Dashboard Gover para exibir Sprints, entregas e informações que merecem atenção executiva. O conteúdo será selecionado na visualização de detalhes da Sprint, sem transformar o Dashboard em uma cópia do Kanban.

## Resultado esperado

O gestor poderá:

1. Abrir uma Sprint na visualização de detalhes.
2. Marcar ou desmarcar a Sprint como destaque.
3. Registrar uma mensagem executiva específica para o destaque.
4. Visualizar esses destaques em uma Sidebar no Dashboard Gover.
5. Clicar no destaque para retornar à Sprint e consultar os detalhes completos.

## Escopo funcional

### 1. Sidebar no Dashboard Gover

Posicionamento: lateral direita da área de conteúdo, alinhada aos KPIs e aos blocos de análise.

Cada item deve apresentar:

- Sistema com sua cor oficial.
- Número da Sprint.
- Tipo de destaque: Sprint, entrega, bloqueio ou decisão.
- Progresso e etapa atual.
- Resumo executivo informado pelo usuário.
- Data da última atualização.
- Link ou ação para abrir a Sprint.

Estados necessários:

- Sidebar com destaques ativos.
- Sidebar vazia, com orientação para marcar uma Sprint.
- Carregamento.
- Erro de leitura dos dados.
- Destaque sem texto, identificado como “Informação adicional não registrada”.

### 2. Marcação de destaque no detalhe da Sprint

Adicionar na visualização que abre ao clicar no card:

- Checkbox ou switch `Exibir no Dashboard Gover`.
- Indicador visual de que a Sprint está em destaque.
- Campo de texto `Informação executiva` habilitado somente quando o check estiver marcado.
- Contador de caracteres e limite recomendado de 280 caracteres.
- Botão para salvar a informação.
- Opção para remover o destaque.

O texto deve orientar o usuário a registrar contexto para decisão, por exemplo:

> “Entrega depende de validação externa até 30/09.”

### 3. Organização dos destaques

Ordem padrão:

1. Bloqueios ou decisões urgentes.
2. Entregas recentes.
3. Sprints em desenvolvimento.
4. Outros destaques manuais.

Critérios de desempate:

- Prioridade da Sprint.
- Data da última atualização.
- Ordem manual definida pelo gestor, em fase posterior.

## Modelo de dados

Adicionar à entidade Sprint, ou a uma entidade de destaque relacionada:

```text
isFeatured: boolean
featuredNote: string | null
featuredType: 'sprint' | 'delivery' | 'blocker' | 'decision'
featuredAt: datetime | null
featuredUpdatedAt: datetime | null
featuredBy: string | null
```

Regras:

- `featuredNote` só pode ser editado quando `isFeatured = true`.
- Desmarcar o check remove o item da Sidebar, mas não apaga o histórico.
- O destaque deve acompanhar a Sprint mesmo que ela mude de raia.
- A remoção do destaque não deve excluir a Sprint, a entrega ou seus registros.
- Ausência de texto não deve impedir o destaque, mas deve ser sinalizada na Sidebar.

## Roadmap de implementação

### Fase 0 — Contrato e protótipo

Prioridade: P0.

- Validar a posição e a largura da Sidebar no Dashboard Gover.
- Definir os tipos de destaque e a ordem de exibição.
- Definir o limite e o tom das mensagens executivas.
- Validar se a Sidebar deve permanecer fixa ou recolhível em telas menores.
- Definir permissões para marcar, editar e remover destaques.

Critérios de aceite:

- O protótipo mostra a relação entre KPI, conteúdo principal e Sidebar.
- O usuário entende em até cinco segundos como uma Sprint vira destaque.
- O comportamento em telas menores está definido antes do desenvolvimento.

### Fase 1 — Marcação e persistência

Prioridade: P0.

- Adicionar check de destaque no popup da Sprint.
- Adicionar campo de informação executiva.
- Persistir marcação, texto, autor e datas.
- Permitir salvar, editar e remover o destaque.
- Registrar auditoria das ações de destacar, editar e remover.

Critérios de aceite:

- Marcar o check habilita o campo de texto.
- Desmarcar o check remove a Sprint da Sidebar.
- Reabrir a Sprint mantém o estado e o texto salvos.
- A alteração não modifica etapa, prioridade ou progresso.

### Fase 2 — Sidebar do Dashboard Gover

Prioridade: P0.

- Criar Sidebar na lateral direita.
- Exibir somente Sprints marcadas como destaque.
- Aplicar cores oficiais dos sistemas.
- Mostrar etapa, progresso, tipo e mensagem executiva.
- Permitir abrir o detalhe da Sprint ao clicar no item.
- Criar estados vazio, carregando e erro.

Critérios de aceite:

- Um destaque salvo aparece no Dashboard Gover sem recarregar manualmente.
- O clique no item abre a Sprint correta.
- O Dashboard continua legível sem rolagem horizontal indevida.
- A Sidebar não altera a seção “Status dos Sistemas”.

### Fase 3 — Priorização executiva

Prioridade: P1.

- Adicionar tipo de destaque.
- Ordenar bloqueios e decisões antes de entregas e Sprints comuns.
- Mostrar data da última atualização e alerta de informação desatualizada.
- Permitir limitar a quantidade de itens visíveis e abrir “Ver todos”.
- Permitir arquivar temporariamente um destaque sem apagar seu histórico.

### Fase 4 — Governança e evolução

Prioridade: P2.

- Permissões por perfil.
- Histórico visual de alterações do destaque.
- Ordenação manual.
- Indicadores de visualização e uso.
- Endpoint analítico compartilhado com Kanban e demais dashboards.
- Testes de integração e ponta a ponta.

## Fora do escopo inicial

- Criar destaques automaticamente sem confirmação humana.
- Alterar status do Kanban a partir da Sidebar.
- Enviar notificações externas.
- Criar uma segunda visão operacional de Tasks.
- Exibir todos os cards do Kanban na Sidebar.

## Riscos e cuidados

- Muitos destaques podem reduzir o valor da Sidebar; a interface deve incentivar seleção criteriosa.
- Mensagens executivas não devem substituir o objetivo, o histórico ou o motivo formal do bloqueio.
- A cor do sistema deve ser consistente com o Kanban e o Dashboard Gover.
- O destaque deve ser independente da raia atual da Sprint.
- Dados sem atualização recente precisam ser sinalizados, não ocultados.

## Status

- [x] Necessidade de Sidebar definida.
- [x] Check de destaque definido.
- [x] Campo de informação executiva definido.
- [x] Modelo inicial de dados definido.
- [x] Fases e critérios de aceite documentados.
- [ ] Validar protótipo visual.
- [ ] Implementar Fase 1.
- [ ] Implementar Fase 2.
- [ ] Implementar Fase 3.
- [ ] Implementar Fase 4.

**Status atual:** Roadmap criado. Implementação ainda não iniciada.
