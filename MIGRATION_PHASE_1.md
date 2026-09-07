# PainelPro React — Fase 1: Fundação React

**Data:** 2026-09-01  
**Status:** concluída  
**Gate:** aprovado por typecheck, testes, build e validação local

## Objetivo atendido

A versão React deixou de concentrar navegação, persistência, regras de consulta e páginas em um único `App.tsx`. A fundação agora separa aplicação, domínio, serviços, repositórios, providers, layout e features, preservando a chave `painelpro-sprints` e o formato dos dados existentes.

## Implementado

- React Router com `HashRouter`, rotas profundas e fallback seguro para o Kanban.
- `AppErrorBoundary` para falhas não tratadas sem apagar ou regravar dados.
- `SprintProvider` como ponto único de estado da interface.
- contrato `SprintRepository` independente de persistência;
- adapter `LocalStorageSprintRepository` mantendo `painelpro-sprints`;
- `SprintService` para criação e atualização;
- domínio tipado de Sprint, Task e workflow;
- consultas reutilizáveis de projeto, busca e filtros;
- páginas React separadas por feature;
- componentes separados para card, detalhes e editores;
- estrutura de testes com Vitest em execução serial;
- scripts `typecheck` e `test:react`.

## Estrutura criada

```text
src/
├── app/
│   ├── errors/
│   ├── providers/
│   ├── router/
│   └── App.tsx
├── components/layout/
├── domain/sprint/
├── features/
│   ├── dashboard/
│   ├── forecast/
│   ├── kanban/
│   ├── registrations/
│   └── sprints/
├── repositories/
│   ├── contracts/
│   └── local-storage/
└── services/
```

## Validações

- `npm run typecheck`: aprovado.
- `npm run test:react`: 2 arquivos e 4 testes aprovados.
- `npm run build:react`: aprovado.
- Rotas verificadas: Kanban, Dashboard Gover, Previsão de PF Mês e Cadastros.
- Detalhe de Sprint verificado.
- Console do navegador: sem erros.
- Dataset local existente carregado: 20 Sprints na validação.
- `npm audit --omit=dev`: nenhuma vulnerabilidade em dependências de produção.

## Riscos e pendências controladas

- O adapter ainda usa `localStorage`; a troca futura por API/Supabase deverá implementar o mesmo contrato.
- A cobertura atual valida consultas e serviço; testes de interação crescerão nas fases das features.
- O layout permanece propositalmente próximo do protótipo React nesta fase; o Design System é o escopo da Fase 2.
- O Kanban ainda não possui paridade funcional com o legado; drag-and-drop, atalhos, menu e Tasks pertencem às fases seguintes.

## Próxima fase recomendada

Fase 2 — Design System PainelPro Next, sem reconstruir ainda o Kanban Golden Master.
