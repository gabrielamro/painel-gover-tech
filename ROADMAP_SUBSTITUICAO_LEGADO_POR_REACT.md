# Roadmap de substituição do legado pelo React

## Objetivo

Tornar a aplicação React a única interface do PainelPro, preservando os dados, regras de negócio, permissões e fluxos que hoje funcionam no legado. A retirada do legado só ocorre depois de uma operação paralela validada e com reversão controlada.

## Situação mapeada

- O legado é uma SPA em JavaScript (`index.html`, `app.js`, `styles.css` e módulos auxiliares), servida pela raiz `/`.
- O React já possui as rotas operacionais: Kanban, Dashboard Gover, Previsão de PF, Cadastros, Superintendência, Atualizações, Liderança, Executivo e Fábrica.
- O React ainda utiliza `localStorage` e importa registros de chaves históricas do legado para preservar compatibilidade.
- Já existem APIs de Sprint e Task, migrações Supabase e estrutura de domínio, porém a API/banco ainda não é a fonte única de operação.
- Não há autenticação/RBAC em produção, nem suíte E2E que proteja todas as mutações críticas.

## Princípios do corte

1. Não apagar dados do navegador nem o código legado antes da homologação formal.
2. Separar migração de dados, troca de interface e limpeza técnica em etapas distintas.
3. Usar o banco como fonte única antes de desligar a leitura das chaves antigas.
4. Toda etapa deve ter critério de aceite, plano de reversão e evidência registrada.

## Fase 0 — Inventário e congelamento funcional

**Objetivo:** estabelecer a referência contra a qual o React será validado.

- Inventariar todas as rotas, ações, filtros, relatórios, exportações e preferências do legado.
- Consolidar as chaves de `localStorage` e o proprietário de cada dado: Sprints, Tasks, cadastros, relacionamentos, etiquetas, cores, destaques, visão salva, melhorias de PF e auditoria.
- Registrar as regras de negócio em testes: cálculo de progresso/saúde, movimentação de raias, PF estimado x detalhado, faturamento mensal, hierarquia Projeto–Módulo e vínculos Gerente–PO–Analistas.
- Congelar novas funcionalidades no legado; toda melhoria nova passa a ser feita somente no React.

**Aceite:** matriz de paridade aprovada e testes de regras críticas executando no pipeline.

## Fase 1 — Fonte única de dados

**Objetivo:** remover dependência operacional do `localStorage` legado.

- Completar o schema Supabase para entidades que ainda são locais: projetos, módulos, POs, gerentes, analistas, etiquetas, relações, preferências, destaques, melhorias e auditoria.
- Completar APIs tipadas para CRUD e movimentações de Sprint/Task; validar payloads e registrar auditoria no servidor.
- Implementar repositórios React com estratégia de leitura: API primeiro, `localStorage` apenas para importação inicial e contingência temporária.
- Criar script idempotente de migração do navegador para o banco, com relatório de itens criados, atualizados, ignorados e erros.
- Criar backup exportável antes da migração e rotina de reconciliação por IDs e totais de PF.

**Aceite:** ambiente de homologação opera sem ler chaves legadas; totais de Sprints, Tasks, PF e cadastros conciliam com o snapshot do legado.

## Fase 2 — Segurança, identidade e governança

**Objetivo:** garantir que o React substitua o legado sem ampliar acessos indevidos.

- Implementar Supabase Auth e perfis: Administrador, Gerente, PO, Analista CGTIC, Analista de Negócio e Leitor executivo.
- Aplicar RLS e autorização na API para leitura/escrita por responsabilidade de projeto.
- Registrar auditoria de criação, edição, exclusão, alteração de PF, mudança de raia e destaque.
- Definir retenção de auditoria, política de backup e recuperação.

**Aceite:** cenários de acesso negado e permitido automatizados; nenhuma API aceita escrita sem identidade válida.

## Fase 3 — Paridade funcional e UX

**Objetivo:** validar que o React é melhor que o legado nas rotinas reais.

- Executar roteiro de homologação por perfil cobrindo todas as rotas React.
- Comparar, ação a ação, o Kanban, detalhes de card, Tasks, edição, filtros, destaque, dashboard, previsão de PF, cadastros, superintendência e painéis executivos.
- Corrigir diferenças de dados exibidos, principalmente contadores de Tasks, PF mensal, status faturado, módulos e cores de sistema.
- Revisar responsividade em desktop, notebook, tablet e celular; nenhuma raia/card pode quebrar ou ocultar ação essencial.
- Garantir estados de carregamento, vazio, erro e recuperação em todas as telas.

**Aceite:** 100% das ações classificadas como críticas têm equivalência aprovada; pendências não críticas têm backlog priorizado e aceite do negócio.

## Fase 4 — Qualidade e observabilidade

**Objetivo:** tornar o React operável com confiança.

- Criar testes E2E para: criar/editar Sprint, criar/mover/editar Task, filtros, destaque, cadastro de relações, cálculo PF e faturamento.
- Manter typecheck, testes unitários e build como obrigatórios no CI.
- Adicionar monitoramento de erros de frontend/API, health check e logs correlacionados por usuário e operação.
- Definir métricas de corte: taxa de erro, latência, falhas de migração, divergência de totais e uso por rota.

**Aceite:** pipeline bloqueia regressões críticas e o painel de monitoramento está disponível em homologação.

## Fase 5 — Operação paralela controlada

**Objetivo:** validar o React com uso real antes de mudar a entrada principal.

- Disponibilizar o React como ambiente oficial de homologação e migrar primeiro um grupo piloto.
- Direcionar usuários selecionados ao React, mantendo o legado em modo somente leitura para comparação.
- Executar reconciliação diária de dados e PF durante o piloto.
- Registrar incidentes, divergências e feedbacks; corrigir somente no React.
- Estabelecer período mínimo de estabilidade, por exemplo 10 dias úteis sem incidente crítico aberto.

**Aceite:** negócio aprova o React, não há divergência não explicada e os indicadores de estabilidade atendem à meta definida.

## Fase 6 — Cutover

**Objetivo:** fazer o React ser a aplicação principal.

- Publicar o build React na raiz `/` em vez de `/react/`; ajustar `base` do Vite, links, assets e redirecionamentos de hash.
- Redirecionar URLs antigas para as rotas React correspondentes, preservando links compartilhados.
- Trocar o menu/atalhos internos para URLs React e comunicar a mudança aos usuários.
- Manter o legado disponível apenas em URL restrita de contingência, somente leitura, por um período definido.
- Monitorar em tempo real erros, autenticação, operações críticas e integridade das gravações nas primeiras 48 horas.

**Reversão:** voltar o roteamento para a versão anterior, mantendo o banco como fonte de verdade; não restaurar dados manualmente sem reconciliação.

**Aceite:** React atende tráfego integral, APIs e métricas estão saudáveis e não há incidente crítico durante a janela de estabilização.

## Fase 7 — Desativação e exclusão do legado

**Objetivo:** retirar código e dependências legadas com segurança.

- Encerrar a contingência somente leitura após o período de retenção aprovado.
- Exportar e arquivar snapshot do legado, dados migrados, documentação de esquema e relatório final de reconciliação.
- Remover a leitura e escrita das chaves legadas no React.
- Remover arquivos legados do deploy: `index.html`, `app.js`, `styles.css`, módulos JavaScript legados e servidor estático que existam apenas para eles.
- Excluir dependências, documentação e testes obsoletos; atualizar README, arquitetura e runbooks para React + API + Supabase.

**Aceite:** busca no código não encontra imports, rotas ou chaves de compatibilidade legada em uso; backup e procedimento de restauração foram testados.

## Ordem recomendada de execução

1. Fases 0 e 1: inventário + banco/API.
2. Fases 2, 3 e 4: segurança, paridade e qualidade.
3. Fase 5: piloto paralelo.
4. Fase 6: corte de rota e estabilização.
5. Fase 7: exclusão definitiva após retenção.

## Decisão arquitetural

Não é seguro excluir o legado agora. A substituição deve começar quando o React deixar de depender de dados locais legados, tiver autenticação e E2E para operações críticas, e concluir uma operação paralela homologada. A exclusão física fica restrita à fase 7.
