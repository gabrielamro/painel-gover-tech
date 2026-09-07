# PainelPro React — Fases 4, 5 e 6

## Status

Concluídas no modo local-first. O Kanban, o detalhe da Sprint e as Tasks usam o mesmo `SprintService` e a mesma fonte persistida.

## Implementado

- Sete raias fixas, horizontais e com rolagem lateral.
- Busca, filtros adicionais, visualizações Kanban/Lista e criação de Sprint.
- Drag-and-drop com `dnd-kit`, ordenação persistida e atalhos `Alt + ←/→`.
- `Enter` e clique abrem diretamente a aba Tasks.
- Menu de ações com edição, destaque e movimentação da Sprint.
- Detalhes nas abas Resumo, Tasks, Histórico e Destaque.
- CRUD local de Tasks, estados operacionais e cálculo de progresso por pontos concluídos.
- Registro local de criação, edição, movimento, reordenação e eventos de Task em `painelpro-db.auditLogs`.

## Limites conhecidos

- Auditoria ainda é local e identifica a sessão demonstrativa; autenticação e API serão tratados em fase posterior.
- O fluxo de Tasks usa alteração de status por seletor. A movimentação drag-and-drop das Tasks pode ser adicionada sem alterar o domínio.
