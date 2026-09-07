// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, cleanup, fireEvent, within, waitFor } from '@testing-library/react';
import { SprintListView } from './SprintListView';
import type { Sprint, SprintTask } from '../../../domain/sprint/model';

const mockTasks: SprintTask[] = [
  { id: 'T-1', title: 'Task 1 - A Fazer', status: 'A Fazer', points: 3, reworkCount: 0, checklist: [] },
  { id: 'T-2', title: 'Task 2 - Em Dev', status: 'Em Desenvolvimento', points: 5, reworkCount: 0, checklist: [] },
  { id: 'T-3', title: 'Task 3 - Em Teste', status: 'Em Teste', points: 2, reworkCount: 0, checklist: [] },
  { id: 'T-4', title: 'Task 4 - Em Correção', status: 'Em Correção', points: 4, reworkCount: 1, isBlocked: true, checklist: [] },
  { id: 'T-5', title: 'Task 5 - Concluída', status: 'Concluída', points: 6, reworkCount: 0, checklist: [] },
];

const mockSprint1: Sprint = {
  code: 'SPR-01',
  system: 'SCIEX',
  project: 'SCIEX - Sprint 10',
  sprintNumber: 10,
  serviceOrder: 'OS-2026-001',
  objective: 'Entrega do Módulo de Declaração',
  lane: 'development',
  progress: 60,
  health: 90,
  functionPoints: 45,
  detailedFunctionPoints: 45,
  start: '2026-09-01',
  end: '2026-09-30',
  po: 'Camila Pereira',
  taskItems: mockTasks,
};

const mockSprint2: Sprint = {
  code: 'SPR-02',
  system: 'SAGAT',
  project: 'SAGAT - Sprint 5',
  sprintNumber: 5,
  serviceOrder: 'OS-2026-002',
  objective: 'Módulo de Recepção e Triagem',
  lane: 'homologation',
  progress: 80,
  health: 95,
  functionPoints: 30,
  detailedFunctionPoints: 30,
  start: '2026-09-05',
  end: '2026-10-05',
  po: 'Julio Maciel',
  taskItems: [
    { id: 'T-21', title: 'Task 21 - SAGAT', status: 'A Fazer', points: 2, checklist: [] },
  ],
};

const mockSprintEmpty: Sprint = {
  code: 'SPR-EMPTY',
  system: 'SISREG',
  project: 'SISREG - Sprint 1',
  sprintNumber: 1,
  serviceOrder: 'OS-2026-099',
  objective: 'Sprint Inicial sem Tarefas',
  lane: 'planning',
  progress: 0,
  health: 100,
  functionPoints: 15,
  detailedFunctionPoints: 15,
  start: '2026-10-01',
  end: '2026-10-20',
  po: 'Mariana Santos',
  taskItems: [],
};

describe('SprintListView - Modo Lista Refatorado', () => {
  beforeEach(() => {
    cleanup();
    localStorage.clear();
  });

  // 1. A lista renderiza as Sprints.
  it('1. Renderiza as Sprints na tabela com suas 12 colunas', () => {
    render(
      <SprintListView
        sprints={[mockSprint1, mockSprint2]}
        onOpenSprint={vi.fn()}
        onUpdateSprint={vi.fn()}
        onCreateTask={vi.fn()}
        onUpdateTask={vi.fn()}
        onMoveTask={vi.fn()}
        onDeleteTask={vi.fn()}
      />
    );

    // Colunas do cabeçalho
    expect(screen.getByText('Sistema / Sprint')).toBeDefined();
    expect(screen.getByText('Objetivo')).toBeDefined();
    expect(screen.getByText('Progresso')).toBeDefined();
    expect(screen.getByText('Tasks')).toBeDefined();
    expect(screen.getByText('Bloqueios')).toBeDefined();
    expect(screen.getByText('Ações')).toBeDefined();

    // Linhas
    expect(screen.getByText('Entrega do Módulo de Declaração')).toBeDefined();
    expect(screen.getByText('Módulo de Recepção e Triagem')).toBeDefined();
    expect(screen.getByText('OS-2026-001')).toBeDefined();
    expect(screen.getByText('OS-2026-002')).toBeDefined();
  });

  // 2. Clicar na linha expande o Kanban correto.
  it('2. Clicar na linha expande o Kanban correto imediatamente abaixo dela', () => {
    render(
      <SprintListView
        sprints={[mockSprint1, mockSprint2]}
        onOpenSprint={vi.fn()}
        onUpdateSprint={vi.fn()}
        onCreateTask={vi.fn()}
        onUpdateTask={vi.fn()}
        onMoveTask={vi.fn()}
        onDeleteTask={vi.fn()}
      />
    );

    expect(screen.queryByText('Tasks da Sprint 10')).toBeNull();

    const row = screen.getByText('Entrega do Módulo de Declaração').closest('tr');
    expect(row).toBeDefined();
    fireEvent.click(row!);

    // Agora o Kanban inline deve estar visível
    expect(screen.getByText('Tasks da Sprint 10')).toBeDefined();
    expect(screen.getByText('Task 1 - A Fazer')).toBeDefined();
    expect(screen.getByText('Task 2 - Em Dev')).toBeDefined();
  });

  // 3. Clicar novamente recolhe.
  it('3. Clicar novamente na mesma linha recolhe o Kanban inline', () => {
    render(
      <SprintListView
        sprints={[mockSprint1, mockSprint2]}
        onOpenSprint={vi.fn()}
        onUpdateSprint={vi.fn()}
        onCreateTask={vi.fn()}
        onUpdateTask={vi.fn()}
        onMoveTask={vi.fn()}
        onDeleteTask={vi.fn()}
      />
    );

    const row = screen.getByText('Entrega do Módulo de Declaração').closest('tr');
    fireEvent.click(row!);
    expect(screen.getByText('Tasks da Sprint 10')).toBeDefined();

    fireEvent.click(row!);
    expect(screen.queryByText('Tasks da Sprint 10')).toBeNull();
  });

  // 4. Expandir outra linha recolhe a anterior.
  it('4. Expandir outra linha recolhe a anterior (somente uma expandida por vez)', () => {
    render(
      <SprintListView
        sprints={[mockSprint1, mockSprint2]}
        onOpenSprint={vi.fn()}
        onUpdateSprint={vi.fn()}
        onCreateTask={vi.fn()}
        onUpdateTask={vi.fn()}
        onMoveTask={vi.fn()}
        onDeleteTask={vi.fn()}
      />
    );

    const row1 = screen.getByText('Entrega do Módulo de Declaração').closest('tr');
    const row2 = screen.getByText('Módulo de Recepção e Triagem').closest('tr');

    fireEvent.click(row1!);
    expect(screen.getByText('Tasks da Sprint 10')).toBeDefined();
    expect(screen.queryByText('Tasks da Sprint 5')).toBeNull();

    fireEvent.click(row2!);
    expect(screen.queryByText('Tasks da Sprint 10')).toBeNull();
    expect(screen.getByText('Tasks da Sprint 5')).toBeDefined();
  });

  // 5. “Abrir Card” abre o detalhe completo.
  it('5. "Abrir Card" abre o detalhe completo da Sprint', () => {
    const handleOpenSprint = vi.fn();
    render(
      <SprintListView
        sprints={[mockSprint1]}
        onOpenSprint={handleOpenSprint}
        onUpdateSprint={vi.fn()}
        onCreateTask={vi.fn()}
        onUpdateTask={vi.fn()}
        onMoveTask={vi.fn()}
        onDeleteTask={vi.fn()}
      />
    );

    const openButton = screen.getByRole('button', { name: 'Abrir Card' });
    fireEvent.click(openButton);

    expect(handleOpenSprint).toHaveBeenCalledTimes(1);
    expect(handleOpenSprint).toHaveBeenCalledWith(mockSprint1);
  });

  // 6. “Abrir Card” não expande nem recolhe a linha.
  it('6. "Abrir Card" não expande nem recolhe a linha', () => {
    render(
      <SprintListView
        sprints={[mockSprint1]}
        onOpenSprint={vi.fn()}
        onUpdateSprint={vi.fn()}
        onCreateTask={vi.fn()}
        onUpdateTask={vi.fn()}
        onMoveTask={vi.fn()}
        onDeleteTask={vi.fn()}
      />
    );

    const openButton = screen.getByRole('button', { name: 'Abrir Card' });
    fireEvent.click(openButton);

    // A linha não deve expandir
    expect(screen.queryByText('Tasks da Sprint 10')).toBeNull();
  });

  // 7. “+ Nova Task” abre o editor existente.
  it('7. "+ Nova Task" abre o modal de cadastro de tarefa existente', () => {
    render(
      <SprintListView
        sprints={[mockSprint1]}
        onOpenSprint={vi.fn()}
        onUpdateSprint={vi.fn()}
        onCreateTask={vi.fn()}
        onUpdateTask={vi.fn()}
        onMoveTask={vi.fn()}
        onDeleteTask={vi.fn()}
      />
    );

    // Expande a sprint
    fireEvent.click(screen.getByText('Entrega do Módulo de Declaração').closest('tr')!);

    const newTaskButton = screen.getByRole('button', { name: /Nova Task/i });
    fireEvent.click(newTaskButton);

    expect(screen.getByText('Cadastrar Nova Tarefa na Sprint')).toBeDefined();
    expect(screen.getByLabelText(/Título da Tarefa/i)).toBeDefined();
  });

  // 8. Sprint sem Tasks apresenta os cinco estados vazios.
  it('8. Sprint sem Tasks apresenta os cinco estados vazios com o texto "Nenhuma Task nesta etapa"', () => {
    render(
      <SprintListView
        sprints={[mockSprintEmpty]}
        onOpenSprint={vi.fn()}
        onUpdateSprint={vi.fn()}
        onCreateTask={vi.fn()}
        onUpdateTask={vi.fn()}
        onMoveTask={vi.fn()}
        onDeleteTask={vi.fn()}
      />
    );

    fireEvent.click(screen.getByText('Sprint Inicial sem Tarefas').closest('tr')!);

    expect(screen.getByText('Tasks da Sprint 1')).toBeDefined();
    const emptyStates = screen.getAllByText('Nenhuma Task nesta etapa');
    expect(emptyStates).toHaveLength(5);
  });

  // 9 e 10. Drag-and-drop não altera o status imediatamente e abre a confirmação.
  it('9 e 10. Movimentação entre raias não altera o status imediatamente e abre a confirmação obrigatória', () => {
    render(
      <SprintListView
        sprints={[mockSprint1]}
        onOpenSprint={vi.fn()}
        onUpdateSprint={vi.fn()}
        onCreateTask={vi.fn()}
        onUpdateTask={vi.fn()}
        onMoveTask={vi.fn()}
        onDeleteTask={vi.fn()}
      />
    );

    fireEvent.click(screen.getByText('Entrega do Módulo de Declaração').closest('tr')!);

    // Na Task 1 (A Fazer), seleciona a raia "Em Desenvolvimento" pelo seletor rápido
    const taskCard = screen.getByRole('article', { name: 'Tarefa: Task 1 - A Fazer' });
    expect(taskCard).toBeDefined();

    const statusSelect = within(taskCard).getByRole('combobox');
    fireEvent.mouseDown(statusSelect);

    const optionEmDev = screen.getByRole('option', { name: 'Em Desenvolvimento' });
    fireEvent.click(optionEmDev);

    // Confirmação obrigatória aberta
    expect(screen.getByRole('heading', { name: 'Confirmar movimentação' })).toBeDefined();
    expect(
      screen.getByText((content) =>
        content.includes('Deseja mover a Task') && content.includes('de') && content.includes('para')
      )
    ).toBeDefined();
  });

  // 11. Cancelar mantém a Task na raia original.
  it('11. Cancelar fecha a confirmação e mantém a Task na raia original sem chamar onMoveTask', () => {
    const handleMoveTask = vi.fn();
    render(
      <SprintListView
        sprints={[mockSprint1]}
        onOpenSprint={vi.fn()}
        onUpdateSprint={vi.fn()}
        onCreateTask={vi.fn()}
        onUpdateTask={vi.fn()}
        onMoveTask={handleMoveTask}
        onDeleteTask={vi.fn()}
      />
    );

    fireEvent.click(screen.getByText('Entrega do Módulo de Declaração').closest('tr')!);

    const taskCard = screen.getByRole('article', { name: 'Tarefa: Task 1 - A Fazer' });
    const statusSelect = within(taskCard).getByRole('combobox');
    fireEvent.mouseDown(statusSelect);
    fireEvent.click(screen.getByRole('option', { name: 'Em Desenvolvimento' }));

    expect(screen.getByRole('heading', { name: 'Confirmar movimentação' })).toBeDefined();

    const cancelButton = screen.getByRole('button', { name: 'Cancelar' });
    fireEvent.click(cancelButton);

    expect(screen.queryByRole('heading', { name: 'Confirmar movimentação' })).toBeNull();
    expect(handleMoveTask).not.toHaveBeenCalled();
  });

  // 12, 13 e 14. Confirmar executa moveTask uma única vez, muda de raia e atualiza contagens.
  it('12, 13 e 14. Confirmar executa moveTask uma única vez e fecha com sucesso', async () => {
    const handleMoveTask = vi.fn().mockResolvedValue(undefined);
    render(
      <SprintListView
        sprints={[mockSprint1]}
        onOpenSprint={vi.fn()}
        onUpdateSprint={vi.fn()}
        onCreateTask={vi.fn()}
        onUpdateTask={vi.fn()}
        onMoveTask={handleMoveTask}
        onDeleteTask={vi.fn()}
      />
    );

    fireEvent.click(screen.getByText('Entrega do Módulo de Declaração').closest('tr')!);

    const taskCard = screen.getByRole('article', { name: 'Tarefa: Task 1 - A Fazer' });
    const statusSelect = within(taskCard).getByRole('combobox');
    fireEvent.mouseDown(statusSelect);
    fireEvent.click(screen.getByRole('option', { name: 'Em Desenvolvimento' }));

    const confirmButton = screen.getByRole('button', { name: 'Confirmar movimentação' });
    fireEvent.click(confirmButton);

    await waitFor(() => {
      expect(handleMoveTask).toHaveBeenCalledTimes(1);
      expect(handleMoveTask).toHaveBeenCalledWith(
        'SPR-01',
        'T-1',
        'Em Desenvolvimento',
        undefined,
        undefined
      );
    });

    // Mensagem de sucesso
    expect(screen.getByText('Task movimentada para Em Desenvolvimento.')).toBeDefined();
  });

  // 15. Falha na persistência restaura a situação anterior e exibe erro.
  it('15. Falha na persistência exibe mensagem de erro e permite tentar novamente', async () => {
    const handleMoveTask = vi.fn().mockRejectedValue(new Error('Erro de conexão ao banco'));
    render(
      <SprintListView
        sprints={[mockSprint1]}
        onOpenSprint={vi.fn()}
        onUpdateSprint={vi.fn()}
        onCreateTask={vi.fn()}
        onUpdateTask={vi.fn()}
        onMoveTask={handleMoveTask}
        onDeleteTask={vi.fn()}
      />
    );

    fireEvent.click(screen.getByText('Entrega do Módulo de Declaração').closest('tr')!);

    const taskCard = screen.getByRole('article', { name: 'Tarefa: Task 1 - A Fazer' });
    const statusSelect = within(taskCard).getByRole('combobox');
    fireEvent.mouseDown(statusSelect);
    fireEvent.click(screen.getByRole('option', { name: 'Em Desenvolvimento' }));

    const confirmButton = screen.getByRole('button', { name: 'Confirmar movimentação' });
    fireEvent.click(confirmButton);

    await waitFor(() => {
      expect(screen.getByText('Erro de conexão ao banco')).toBeDefined();
    });
  });

  // 16. Mover para “Em Correção” preserva a regra de retrabalho.
  it('16. Mover para "Em Correção" exibe aviso sobre incremento de retrabalho', () => {
    render(
      <SprintListView
        sprints={[mockSprint1]}
        onOpenSprint={vi.fn()}
        onUpdateSprint={vi.fn()}
        onCreateTask={vi.fn()}
        onUpdateTask={vi.fn()}
        onMoveTask={vi.fn()}
        onDeleteTask={vi.fn()}
      />
    );

    fireEvent.click(screen.getByText('Entrega do Módulo de Declaração').closest('tr')!);

    const taskCard = screen.getByRole('article', { name: 'Tarefa: Task 3 - Em Teste' });
    const statusSelect = within(taskCard).getByRole('combobox');
    fireEvent.mouseDown(statusSelect);
    fireEvent.click(screen.getByRole('option', { name: 'Em Correção' }));

    expect(screen.getByText(/Ao mover para/i)).toBeDefined();
    expect(screen.getByText(/métrica de retrabalho desta tarefa será incrementada/i)).toBeDefined();
  });

  // 17. Mover para “Concluída” recalcula o progresso e mostra alerta de conclusão.
  it('17. Mover para "Concluída" apresenta alerta de conclusão e aceite', () => {
    render(
      <SprintListView
        sprints={[mockSprint1]}
        onOpenSprint={vi.fn()}
        onUpdateSprint={vi.fn()}
        onCreateTask={vi.fn()}
        onUpdateTask={vi.fn()}
        onMoveTask={vi.fn()}
        onDeleteTask={vi.fn()}
      />
    );

    fireEvent.click(screen.getByText('Entrega do Módulo de Declaração').closest('tr')!);

    const taskCard = screen.getByRole('article', { name: 'Tarefa: Task 2 - Em Dev' });
    const statusSelect = within(taskCard).getByRole('combobox');
    fireEvent.mouseDown(statusSelect);
    fireEvent.click(screen.getByRole('option', { name: 'Concluída' }));

    expect(screen.getByText(/A tarefa será marcada como entregue/i)).toBeDefined();
  });

  // 18. Filtros e pesquisa continuam funcionando: se sprint expandida deixar de existir, limpa expandedSprintCode.
  it('18. Limpa o estado expandido caso a sprint seja filtrada', () => {
    const { rerender } = render(
      <SprintListView
        sprints={[mockSprint1, mockSprint2]}
        onOpenSprint={vi.fn()}
        onUpdateSprint={vi.fn()}
        onCreateTask={vi.fn()}
        onUpdateTask={vi.fn()}
        onMoveTask={vi.fn()}
        onDeleteTask={vi.fn()}
      />
    );

    fireEvent.click(screen.getByText('Entrega do Módulo de Declaração').closest('tr')!);
    expect(screen.getByText('Tasks da Sprint 10')).toBeDefined();

    // Rerenderiza com apenas a mockSprint2 (simulando filtro ativo)
    rerender(
      <SprintListView
        sprints={[mockSprint2]}
        onOpenSprint={vi.fn()}
        onUpdateSprint={vi.fn()}
        onCreateTask={vi.fn()}
        onUpdateTask={vi.fn()}
        onMoveTask={vi.fn()}
        onDeleteTask={vi.fn()}
      />
    );

    expect(screen.queryByText('Tasks da Sprint 10')).toBeNull();
  });

  // 19. O estado expandido é preservado após editar uma Task.
  it('19. O estado expandido é preservado após abrir e salvar edição de uma Task', () => {
    const handleUpdateTask = vi.fn();
    render(
      <SprintListView
        sprints={[mockSprint1]}
        onOpenSprint={vi.fn()}
        onUpdateSprint={vi.fn()}
        onCreateTask={vi.fn()}
        onUpdateTask={handleUpdateTask}
        onMoveTask={vi.fn()}
        onDeleteTask={vi.fn()}
      />
    );

    fireEvent.click(screen.getByText('Entrega do Módulo de Declaração').closest('tr')!);

    const taskCard = screen.getByRole('article', { name: 'Tarefa: Task 1 - A Fazer' });
    const editBtn = within(taskCard).getByLabelText('Editar');
    fireEvent.click(editBtn);

    expect(screen.getByText(/Editar: Task 1 - A Fazer/i)).toBeDefined();

    const saveBtn = screen.getByRole('button', { name: /Salvar Alterações/i });
    fireEvent.click(saveBtn);

    // Kanban inline continua expandido
    expect(screen.getByText('Tasks da Sprint 10')).toBeDefined();
    expect(handleUpdateTask).toHaveBeenCalled();
  });

  // 20. A navegação por teclado funciona (Enter / Espaço expande e recolhe).
  it('20. Navegação por teclado: Enter e Espaço na linha alternam a expansão', () => {
    render(
      <SprintListView
        sprints={[mockSprint1]}
        onOpenSprint={vi.fn()}
        onUpdateSprint={vi.fn()}
        onCreateTask={vi.fn()}
        onUpdateTask={vi.fn()}
        onMoveTask={vi.fn()}
        onDeleteTask={vi.fn()}
      />
    );

    const row = screen.getByText('Entrega do Módulo de Declaração').closest('tr');
    expect(row).toBeDefined();

    // Enter expande
    fireEvent.keyDown(row!, { key: 'Enter' });
    expect(screen.getByText('Tasks da Sprint 10')).toBeDefined();

    // Espaço recolhe
    fireEvent.keyDown(row!, { key: ' ' });
    expect(screen.queryByText('Tasks da Sprint 10')).toBeNull();
  });

  // 13 e 14. A Task muda de raia após confirmação e as contagens são atualizadas.
  it('13 e 14. A Task muda de raia após atualização dos dados e as contagens das raias são atualizadas', () => {
    const { rerender } = render(
      <SprintListView
        sprints={[mockSprint1]}
        onOpenSprint={vi.fn()}
        onUpdateSprint={vi.fn()}
        onCreateTask={vi.fn()}
        onUpdateTask={vi.fn()}
        onMoveTask={vi.fn()}
        onDeleteTask={vi.fn()}
      />
    );

    fireEvent.click(screen.getByText('Entrega do Módulo de Declaração').closest('tr')!);

    // Raia "A Fazer" tem Task 1, "Em Desenvolvimento" tem Task 2
    const laneAFazer = screen.getByRole('region', { name: 'Raia A Fazer' });
    const laneEmDev = screen.getByRole('region', { name: 'Raia Em Desenvolvimento' });

    expect(within(laneAFazer).getByText('Task 1 - A Fazer')).toBeDefined();
    expect(within(laneAFazer).getByText('1')).toBeDefined();
    expect(within(laneEmDev).getByText('1')).toBeDefined();

    // Rerender com a Task 1 movida para Em Desenvolvimento
    const updatedSprint1: Sprint = {
      ...mockSprint1,
      taskItems: mockSprint1.taskItems?.map((t) =>
        t.id === 'T-1' ? { ...t, status: 'Em Desenvolvimento' } : t
      ),
    };

    rerender(
      <SprintListView
        sprints={[updatedSprint1]}
        onOpenSprint={vi.fn()}
        onUpdateSprint={vi.fn()}
        onCreateTask={vi.fn()}
        onUpdateTask={vi.fn()}
        onMoveTask={vi.fn()}
        onDeleteTask={vi.fn()}
      />
    );

    // Agora "A Fazer" está vazia (0) e "Em Desenvolvimento" tem 2 tasks
    expect(within(laneAFazer).queryByText('Task 1 - A Fazer')).toBeNull();
    expect(within(laneAFazer).getByText('Nenhuma Task nesta etapa')).toBeDefined();
    expect(within(laneEmDev).getByText('Task 1 - A Fazer')).toBeDefined();
    expect(within(laneEmDev).getByText('2')).toBeDefined();
  });

  // Movimentação com mesma origem e destino não abre confirmação
  it('Movimentação com mesma origem e destino não abre confirmação nem executa persistência', () => {
    const handleMoveTask = vi.fn();
    render(
      <SprintListView
        sprints={[mockSprint1]}
        onOpenSprint={vi.fn()}
        onUpdateSprint={vi.fn()}
        onCreateTask={vi.fn()}
        onUpdateTask={vi.fn()}
        onMoveTask={handleMoveTask}
        onDeleteTask={vi.fn()}
      />
    );

    fireEvent.click(screen.getByText('Entrega do Módulo de Declaração').closest('tr')!);

    const taskCard = screen.getByRole('article', { name: 'Tarefa: Task 1 - A Fazer' });
    const statusSelect = within(taskCard).getByRole('combobox');
    fireEvent.mouseDown(statusSelect);
    fireEvent.click(screen.getByRole('option', { name: 'A Fazer' }));

    expect(screen.queryByRole('heading', { name: 'Confirmar movimentação' })).toBeNull();
    expect(handleMoveTask).not.toHaveBeenCalled();
  });
});
