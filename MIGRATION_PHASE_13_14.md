# PainelPro React — Fases 13 e 14

## Fase 13 — Testes

- Cobertura de domínio para filtros e normalização de sistemas.
- Cobertura do `SprintService` para atualização, mudança de raia, reordenação, criação/edição de Sprint, Tasks, progresso por pontos, bloqueios e auditoria.
- Total atual: 9 testes React aprovados, além dos testes legados existentes.

### Pendente

- Testes E2E em navegador para criar Sprint, mover Sprint, editar Task, destacar e faturar. Eles dependem da definição da ferramenta E2E e do ambiente de teste de ponta a ponta.

## Fase 14 — Performance

- Rotas React convertidas para `React.lazy` + `Suspense`.
- Dashboard, Forecast, Cadastros, Superintendência, Kanban e Design System são carregados somente quando acessados.
- Build inicial passou de aproximadamente 344 kB para 237 kB antes de gzip; o Kanban ficou em chunk próprio de aproximadamente 70 kB.

## Validação

- `npm run typecheck`
- `npm run test:react` — 9 testes aprovados
- `npm run build:react`

## Smoke test no navegador

- Superintendência carregada na rota React sem erros de console.
- Command Palette abriu e navegou para Dashboard Gover.
- Em viewport de 390 × 844, o Kanban preservou 7 raias e 20 cards; a página não apresentou overflow horizontal e o board manteve sua rolagem horizontal funcional.
