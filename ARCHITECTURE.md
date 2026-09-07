# PainelPro — Arquitetura atual

O workspace começou sem aplicação, dependências ou backend. A implementação atual é uma SPA local-first executada por `server.js`. A fundação de backend foi adicionada para a migração gradual para Vercel + Supabase.

## Camadas

- `app.js`: composição da interface e interação do Kanban.
- `domain.js`: regras de progresso, Health Score, status, alertas, analytics, auditoria e decisões.
- `server.js`: servidor HTTP local sem dependências externas.
- `localStorage`: repositório temporário para o seed operacional e o banco local de auditoria/decisões.
- `tests/domain.test.mjs`: testes unitários das regras principais.
- `api/`: funções serverless TypeScript executadas pela Vercel.
- `supabase/migrations/`: schema PostgreSQL, RLS e índices.
- `ROADMAP_COMPONENTIZACAO_BACKEND.md`: plano de decomposição do frontend e evolução do backend.

## Contrato para a próxima migração

O `LocalRepository` deve ser substituído por uma implementação de API que preserve as operações `load`, `save` e `insert`. A primeira fatia implementada expõe leitura/criação/atualização de Sprints em `/api/sprints` e `/api/sprints/:id`; exige Bearer token, valida entrada e registra auditoria. O token Supabase é encaminhado para que o RLS seja aplicado.

## Limites conhecidos

Ainda falta conectar a UI à API, configurar Supabase Auth no frontend, criar as demais tabelas/entidades, sincronização em tempo real, filas, backups e deploy. Nunca use `SUPABASE_SERVICE_ROLE_KEY` no navegador; as funções atuais usam a chave anon e RLS.
