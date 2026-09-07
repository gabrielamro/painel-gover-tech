# Backend — Supabase + Vercel

## Decisão técnica

O backend será escrito em TypeScript, usando funções serverless da Vercel e o PostgreSQL/Auth/RLS do Supabase. Esta escolha encaixa no frontend vanilla existente e permite migrar `localStorage` por partes, sem uma reescrita imediata da interface.

## Configuração local

1. Crie um projeto no Supabase.
2. Execute `supabase/migrations/001_initial.sql` no SQL Editor.
3. Copie `.env.example` para `.env.local` e preencha `SUPABASE_URL` e `SUPABASE_ANON_KEY`.
4. Instale as dependências com `npm install`.
5. Publique o projeto na Vercel e cadastre as mesmas variáveis em Project Settings → Environment Variables.

Na Vercel, configure `SUPABASE_URL`, `SUPABASE_ANON_KEY` e `PAINELPRO_DATA_SOURCE=api`. A rota `/api/config` entrega apenas URL, anon key e modo de dados ao frontend. Nunca coloque a `service_role` no navegador.

Para preparar uma migração do seed local, exporte o valor de `painelpro-sprints` para um arquivo JSON e execute `npm run migrate:local -- caminho/para/arquivo.json`. O comando não grava no banco: ele gera um payload revisável para importação segura.

## API inicial

### Estado atual

As migrations foram executadas no projeto Supabase `Painel Gover` e verificadas no SQL Editor. As sete tabelas esperadas estão criadas: `sprints`, `tasks`, `deliveries`, `risks`, `impediments`, `decisions` e `audit_logs`.

O mockup também foi importado: 18 Sprints, 72 Tasks-modelo e 18 eventos de auditoria.

A publicação e configuração de variáveis da Vercel estão descritas em `DEPLOYMENT_VERCEL.md`.

- `GET /api/health` — verificação da função.
- `GET /api/sprints` — lista as Sprints do usuário autenticado.
- `POST /api/sprints` — cria uma Sprint autenticada.
- `GET /api/sprints/:id` — consulta uma Sprint.
- `PATCH /api/sprints/:id` — atualiza campos permitidos.

Todas as rotas de Sprints exigem `Authorization: Bearer <access_token>`. A chave `SUPABASE_ANON_KEY` pode ser usada no servidor porque as políticas RLS continuam sendo a camada de autorização. A `service_role` não deve ser exposta ao navegador. Criações e atualizações geram registros em `audit_logs`.

## Estado da migração do frontend

O frontend já possui o primeiro adaptador em `frontend/repositories/sprint-repository.js`. A aplicação continua usando o repositório local por padrão para não exigir autenticação antes da integração do Supabase Auth. O repositório remoto já está preparado para receber o access token.

O serviço `frontend/services/auth.js` implementa sessão persistente, login, logout e renovação automática. A conexão visual completa do login deve ser ativada quando o projeto Supabase estiver configurado.

Com `PAINELPRO_DATA_SOURCE=api` e usuário autenticado, o frontend hidrata o Kanban a partir de `/api/sprints`; sem sessão ou em caso de falha, permanece com os dados locais.

## Próxima migração

1. Implementar Supabase Auth no frontend.
2. Criar um `ApiRepository` com o mesmo contrato do `LocalRepository`.
3. Migrar primeiro leitura de Sprints, mantendo fallback local.
4. Migrar gravações e auditoria com escrita transacional.
5. Adicionar Tasks, entregas, riscos, impedimentos, decisões e alertas.
6. Remover o fallback `localStorage` somente após validar dados e permissões em produção.
