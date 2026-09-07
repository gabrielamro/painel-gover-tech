# PainelPro React — Gate de Cutover

## Situação atual

A versão React está utilizável em paralelo no endereço `/react`, mas **não deve substituir definitivamente o legado ainda**.

## Evidências aprovadas

- App Shell e rotas React operacionais.
- Kanban com sete raias, filtros, menu de ações, atalhos e persistência local.
- Detalhes, Tasks e auditoria local-first.
- Dashboard, Forecast, Cadastros e Superintendência lendo a mesma base de Sprints.
- Command Palette e responsividade estrutural implementadas.
- Typecheck, testes de domínio/serviço e build aprovados.
- Smoke test de navegação, Command Palette e viewport estreito aprovado.

## Bloqueadores para substituir o legado

- API/banco como fonte operacional única ainda não está ativa.
- Autenticação e permissões por perfil não foram implementadas.
- Cadastros e relacionamentos ainda não são aplicados automaticamente na criação de Sprint.
- Testes E2E automatizados para mutações críticas ainda não existem.
- Necessário validar migração idempotente de todos os dados locais antes do corte.

## Próxima decisão recomendada

Manter o React em operação paralela e planejar uma fase de backend, autenticação e testes E2E antes de autorizar o cutover definitivo.
