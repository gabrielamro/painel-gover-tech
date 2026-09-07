# Roadmap — Carga macro de PF detalhado por sistema e mês

Status: **Em implementação — carga histórica macro inicial concluída**  
Responsável pela validação funcional: a definir  
Fonte: planilha histórica fornecida no pedido

## 1. Entendimento do pedido

Será criada uma carga histórica, em nível macro, para registrar os Pontos de Função já realizados/faturados por mês e por projeto ou módulo.

O catálogo deverá adotar a hierarquia **Projeto → Módulo**. O Projeto representa o sistema principal e o Módulo representa uma frente funcional desse sistema. Quando não existir módulo, o registro permanece vinculado somente ao Projeto.

Cada registro deverá representar um sistema/projeto acompanhado no portfólio e conter:

- projeto;
- módulo, quando existir;
- mês de competência;
- PF previsto, quando informado;
- PF detalhado/realizado, que será o valor usado para as OSs já faturadas;
- gerente responsável;
- analista responsável;
- aderência entre previsto e realizado, quando os dois valores existirem.

Os valores da coluna **Realizado** serão tratados como PF detalhado histórico. Como as OSs já foram faturadas, os registros carregados deverão aparecer no fluxo de faturamento/conclusão conforme a regra de negócio validada, sem serem confundidos com previsão futura.

## 2. Escopo funcional

### 2.1 Cadastro histórico

Criar uma entidade de histórico mensal de PF, relacionada a um sistema/projeto. A entidade não substitui a Sprint nem a OS detalhada do Kanban; ela consolida o resultado mensal para análise gerencial.

Campos mínimos:

| Campo | Regra |
|---|---|
| ID | Identificador único da linha importada |
| Sistema/projeto | Nome normalizado do sistema ou projeto |
| Mês | Competência no formato `YYYY-MM` |
| PF previsto | Valor da coluna Previsto; vazio deve ser nulo ou zero conforme decisão de produto |
| PF detalhado | Valor da coluna Realizado |
| Gerente | Gerente responsável pela linha |
| Analista CGTIC | Analista informado na planilha |
| Origem | Referência à carga/planilha e linha de origem |
| Importado em | Data e hora da carga |
| Observação | Campo opcional para exceções e ajustes |

### 2.2 Cards macro no dashboard

Criar um card para cada sistema/projeto exibido na visão selecionada, sem limitar a quantidade de cards por sistema.

Cada card deve mostrar:

- nome do sistema/projeto em botão colorido, usando a cor cadastrada;
- PF detalhado acumulado no período selecionado;
- PF detalhado do mês selecionado;
- último mês com movimentação;
- gerente responsável;
- analista CGTIC;
- indicador de previsto x realizado quando houver previsto;
- variação e aderência, quando calculáveis;
- quantidade de meses com realizado;
- acesso ao detalhamento mensal.

O card não deve exibir dados inventados. Quando não houver previsto, deve mostrar “Sem previsto informado” e manter o realizado disponível.

### 2.3 Filtros e detalhamento

Adicionar, na visão macro:

- competência ou intervalo de meses;
- sistema/projeto;
- gerente;
- analista CGTIC;
- somente sistemas com realizado;
- somente sistemas com divergência previsto x realizado.

Ao clicar no card, abrir um detalhamento com:

- tabela mês a mês;
- previsto;
- realizado/PF detalhado;
- variação;
- aderência;
- gerente e analista;
- origem do dado.

## 3. Interpretação da planilha

### 3.1 Colunas mensais

Para cada mês entre Jul/25 e Dez/26 existem duas colunas:

1. Previsto;
2. Realizado.

Mapeamento proposto:

- `Previsto` → PF previsto do mês;
- `Realizado` → PF detalhado do mês, pois o pedido informa que as OSs já foram faturadas.

Os campos `∑ Previsto`, `∑ Realizado` e `Aderência %` devem ser usados para conferência, não como fonte primária. O sistema deverá recalcular os totais a partir dos meses e sinalizar divergência entre o total informado e o total calculado.

### 3.2 Hierarquia Projeto → Módulo e risco de duplicidade

A planilha possui linhas de Projeto e linhas que representam Módulos. O entendimento oficial para a carga será:

| Projeto | Módulo |
|---|---|
| SCIEX | Importação |
| SCIEX | Exportação |
| SCIEX | Portal Único |
| SAGAT | Análise |
| SAGAT | Recepção |
| SIMNAC | Mobile |
| SIMNAC | Web |
| SPR | MEAAP |
| SPR | MCPP |
| SPR | MPPB |
| SPR | MAPI |
| SPR | MCI |
| CADSUF | — |
| SAC | — |
| Sustentação | — |

Exemplos de normalização:

- `SCIEX IMPORTAÇÃO` → Projeto `SCIEX`, Módulo `Importação`;
- `SCIEX EXPORTAÇÃO` → Projeto `SCIEX`, Módulo `Exportação`;
- `SAGAT RECEPÇÃO` → Projeto `SAGAT`, Módulo `Recepção`;
- `SIMNAC (Mobile)` → Projeto `SIMNAC`, Módulo `Mobile`;
- `SPR - MAPI | MCI` → duas associações do Projeto `SPR`: Módulo `MAPI` e Módulo `MCI`.

Uma linha-pai com total próprio, como `SCIEX`, deverá ser tratada como total do Projeto. Ela não poderá ser somada novamente com os módulos no mesmo KPI. A tela deverá indicar se o valor exibido é:

- total direto do Projeto;
- total consolidado dos Módulos;
- ou ambos, em linhas separadas.

O modo recomendado é exibir um card do Projeto com o total consolidado e permitir expandir os Módulos. Os valores dos Módulos serão a base da soma quando existirem; o total direto do Projeto será usado apenas para conferência.

## 4. Normalização de nomes e responsáveis

### 4.1 Projetos e Módulos

Criar ou reutilizar os cadastros existentes com dois níveis:

**Projetos:** SCIEX, SPR, SAGAT, SIMNAC, CADSUF, SAC e Sustentação.

**Módulos:** Importação, Exportação, Portal Único, MEAAP, MCPP, MPPB, MAPI, MCI, Análise, Recepção, Mobile e Web.

Regras do cadastro:

- um Módulo sempre pertence a um Projeto;
- um Projeto pode ter vários Módulos;
- um Projeto pode existir sem Módulo;
- o nome do Módulo não deve ser cadastrado como Projeto quando a relação já estiver definida;
- a edição do Projeto deve preservar seus Módulos e históricos;
- a edição do Módulo deve atualizar a exibição dos cards e filtros relacionados;
- não permitir excluir um Projeto que possua Módulos ou histórico sem fluxo de transferência/arquivamento;
- permitir ativar, inativar e editar Projetos e Módulos sem apagar o histórico.

Exibição padrão no card:

```text
Projeto - Módulo
SCIEX - Importação
SAGAT - Recepção
```

Quando não houver Módulo, o card exibirá apenas o Projeto:

```text
CADSUF
SAC
```

O botão colorido do card usará a cor do Projeto. O Módulo será exibido como texto complementar, mantendo a identificação visual consistente entre todos os módulos do mesmo Projeto.

### 4.2 Gerentes

Alimentar o cadastro de Gerentes de Projetos e vincular cada linha ao gerente informado:

- Willian/William — planilha informa “Willian”, enquanto o cadastro anterior usa “William D’Ângelo”; validar se é a mesma pessoa antes da carga;
- Adilson;
- Gabriel.

Não criar duas pessoas para a variação “William” x “Willian” sem confirmação.

### 4.3 Analistas

Alimentar o cadastro de Analistas CGTIC com:

- Francisco Eronildo;
- Luiz Gustavo;
- Enio Souza;
- Francisco Canindé;
- Paulo Peres;
- Aurílio Pinto;
- Equipe SUS.

O cabeçalho da planilha usa “Analista SGTiC”; o sistema deverá exibir “Analista CGTIC”, conforme a regra de negócio já definida. “Equipe SUS” deve ser tratado como equipe/área, não como pessoa, até validação.

## 5. Fases de implementação futura

### Fase 0 — Validação da fonte

- Confirmar se `Realizado` equivale sempre a PF detalhado faturado.
- Confirmar se vazios representam zero ou ausência de informação.
- Confirmar a grafia oficial dos gerentes.
- Confirmar a hierarquia pai/filho dos sistemas compostos.
- Conferir se os totais da planilha fecham com a soma mensal.

Saída: planilha revisada e aprovada para importação.

### Fase 1 — Modelo e persistência — concluída parcialmente

- Criar a entidade de histórico mensal de PF.
- Criar entidades de Projeto e Módulo ou campos equivalentes com relacionamento pai-filho.
- Criar relacionamento do histórico com Projeto e, opcionalmente, Módulo.
- Definir integridade referencial: Módulo não pode apontar para Projeto inexistente.
- Criar identificador estável para Projeto e Módulo, independente do nome exibido.
- Definir unicidade por sistema/projeto, mês e origem.
- Registrar lote de importação e linha de origem.
- Manter o histórico separado da Sprint para não alterar o cálculo de PF estimado/detalhado das OSs existentes.

### Fase 2 — Importação segura — carga inicial executada

- Implementar pré-visualização da carga.
- Validar números com vírgula decimal e separador de milhar.
- Rejeitar linhas sem sistema/projeto ou mês identificável.
- Detectar duplicidades.
- Exibir totais antes de confirmar.
- Permitir reprocessar o mesmo lote sem duplicar dados.

### Fase 3 — Cadastro e vínculos — hierarquia inicial concluída

- Criar/atualizar Projetos.
- Criar/atualizar Módulos vinculados ao Projeto.
- Permitir cadastro e edição da hierarquia em uma única área.
- Exibir a árvore Projeto → Módulos antes de salvar alterações.
- Validar nomes duplicados dentro do mesmo Projeto.
- Permitir o mesmo nome de Módulo em Projetos diferentes sem conflito, por exemplo `Mobile` em outro Projeto.
- Criar/atualizar gerentes.
- Criar/atualizar analistas CGTIC.
- Vincular o responsável sem sobrescrever vínculos de Sprints existentes.
- Mostrar alertas para nomes não reconhecidos.

### Fase 4 — Dashboard macro

- Criar os cards por Projeto, com Módulo exibido no formato `Projeto - Módulo`.
- Permitir alternar entre visão consolidada por Projeto e visão detalhada por Módulo.
- Exibir a hierarquia no detalhe do card.
- Adicionar filtro por competência e intervalo.
- Adicionar filtros independentes por Projeto e Módulo.
- Mostrar PF detalhado do mês e acumulado.
- Mostrar previsto x realizado apenas quando houver dados dos dois lados.
- Adicionar ranking e gráfico de evolução mensal.
- Impedir dupla contagem de linhas-pai e linhas-filhas.

### Fase 5 — Detalhamento e auditoria

- Abrir o detalhamento mensal pelo card.
- Exibir origem da linha importada.
- Registrar alterações manuais.
- Permitir correção controlada de valores.
- Diferenciar dado importado, ajustado e confirmado.

### Fase 6 — Integração com Kanban e Previsão de PF

- Relacionar histórico faturado às OSs existentes quando OS, Sprint, Projeto e Módulo forem identificáveis.
- Atualizar o cadastro de Sprint/OS para selecionar Projeto e Módulo separadamente.
- Manter compatibilidade com registros antigos que possuem apenas o nome do sistema.
- Exibir no Kanban o nome no padrão `Projeto - Módulo` quando houver Módulo.
- Manter PF estimado da OS separado do PF detalhado faturado.
- Usar o histórico no relatório de realizado.
- Não alterar previsão futura quando o usuário estiver consultando meses históricos.
- Evitar que o mesmo PF seja contado simultaneamente na previsão e no faturado.

## 6. Regras de negócio propostas

- OS faturada deve ser considerada realizado histórico.
- PF detalhado não substitui PF estimado.
- PF estimado pode ser zero quando não informado.
- PF detalhado vazio deve permanecer ausente, salvo decisão de tratar vazio como zero.
- Aderência só deve ser calculada quando PF previsto for maior que zero.
- Crescimento positivo significa `realizado > previsto` ou `realizado atual > realizado anterior`, conforme o relatório; o indicador deve deixar claro qual comparação está sendo usada.
- A soma de um agrupador não pode ser somada novamente às suas linhas-filhas.
- A alteração de um sistema, gerente ou analista deve preservar o histórico original da carga.

## 7. Critérios de aceite

- Todos os meses de Jul/25 a Dez/26 são carregados com competência correta.
- Os valores com vírgula decimal são convertidos sem perda de precisão.
- Cada sistema/projeto aparece uma única vez na visão escolhida.
- Os cards mostram PF detalhado mensal e acumulado.
- Gerente e Analista CGTIC aparecem corretamente no card ou detalhamento definido.
- Filtros por sistema, gerente, analista e mês funcionam em conjunto.
- O total exibido no dashboard é conciliável com a soma da fonte.
- Linhas-pai e linhas-filhas não geram dupla contagem.
- Registros sem previsto não produzem aderência artificial.
- A carga pode ser repetida sem duplicar o histórico.
- A operação atual do Kanban, PF estimado, PF detalhado das OSs e faturamento não é quebrada.

## 8. Pendências para decisão antes de implementar

1. “Willian” e “William D’Ângelo” são a mesma pessoa?
2. Os valores `Realizado` são sempre o PF detalhado final faturado?
3. Células vazias devem ser nulas ou zero?
4. A linha total do Projeto, como `SCIEX`, deve ser usada somente para conferência ou também exibida separadamente?
5. O card macro padrão será consolidado por Projeto ou detalhado por Módulo?
6. Os Módulos `MEAAP`, `MCPP`, `MPPB`, `MAPI` e `MCI` pertencem todos ao Projeto `SPR`?
7. O card macro deve aparecer em qual página: Dashboard Gover, Previsão de PF Mês ou uma nova página de histórico?
8. “Equipe SUS” deve ser cadastrada como analista, equipe ou área responsável?
9. OSs históricas possuem número de OS para vinculação com o Kanban ou serão apenas consolidadas por Projeto/Módulo e mês?

## 9. Fora do escopo desta etapa

- Não alterar Supabase nesta etapa; a carga inicial foi persistida no `localStorage` do React.
- Os cards históricos já foram criados no Kanban; os gráficos macro avançados permanecem para a fase 4.
- Não alterar status das Sprints.
- A hierarquia de Projetos e Módulos já foi estruturada no cadastro e utilizada na carga macro inicial.
- Não recalcular PF das OSs já cadastradas.
- Não sobrescrever cadastros de gerentes, analistas ou sistemas sem validação.
