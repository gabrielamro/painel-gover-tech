// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, cleanup, fireEvent } from '@testing-library/react';
import { SprintDetailsModal } from './SprintDetailsModal';
import type { Sprint } from '../../../domain/sprint/model';

const mockSprint: Sprint = {
  code: 'SPR-01',
  system: 'SCIEX',
  project: 'SCIEX - Sprint 10',
  sprintNumber: 10,
  serviceOrder: 'OS-2026-001',
  objective: 'Entrega do Módulo de Declaração de Importação',
  lane: 'development',
  progress: 60,
  health: 90,
  functionPoints: 45,
  detailedFunctionPoints: 45,
  start: '2026-09-01',
  end: '2026-09-15',
  billingForecastMonth: '2026-09',
  po: 'Camila Pereira',
  projectManager: 'Mariana Santos',
  technicalLead: 'Julio Maciel',
  businessAnalyst: 'Carla Dias',
  labels: ['API', 'Frontend'],
  priorityLevel: 'Alta',
  enteredLaneAt: '2026-09-01T10:00:00.000Z',
  lastUpdated: '2026-09-02T15:30:00.000Z',
  taskItems: [],
};

describe('SprintDetailsModal Component', () => {
  beforeEach(() => {
    cleanup();
    localStorage.clear();
  });

  it('renderiza o cabeçalho operacional com campos de identificação essenciais', () => {
    const handleUpdate = vi.fn();
    const handleClose = vi.fn();

    render(
      <SprintDetailsModal
        sprint={mockSprint}
        onClose={handleClose}
        onUpdate={handleUpdate}
        onCreateTask={vi.fn()}
        onUpdateTask={vi.fn()}
        onMoveTask={vi.fn()}
        onDeleteTask={vi.fn()}
        auditLogs={[]}
      />
    );

    // 1. Título da OS no input editável
    const titleInput = screen.getByLabelText(/Título da OS \/ Demanda/i);
    expect(titleInput).toBeDefined();
    expect((titleInput as HTMLInputElement).value).toBe('Entrega do Módulo de Declaração de Importação');

    // 2. Sprint Nº no input numérico
    const sprintNumInput = screen.getByLabelText(/Sprint Nº/i);
    expect(sprintNumInput).toBeDefined();
    expect((sprintNumInput as HTMLInputElement).value).toBe('10');

    // 3. Metadados discretos
    expect(screen.getByText('OS-2026-001')).toBeDefined();
    expect(screen.getByText('SCIEX')).toBeDefined();
  });

  it('permite edição direta do Resumo da OS com salvamento por blur', () => {
    const handleUpdate = vi.fn();
    const handleClose = vi.fn();

    render(
      <SprintDetailsModal
        sprint={mockSprint}
        onClose={handleClose}
        onUpdate={handleUpdate}
        onCreateTask={vi.fn()}
        onUpdateTask={vi.fn()}
        onMoveTask={vi.fn()}
        onDeleteTask={vi.fn()}
        auditLogs={[]}
      />
    );

    const summaryInput = screen.getByPlaceholderText(/Descreva o objetivo, impacto e detalhes principais/i);
    expect(summaryInput).toBeDefined();

    fireEvent.change(summaryInput, { target: { value: 'Novo escopo detalhado de homologação' } });
    fireEvent.blur(summaryInput);

    expect(handleUpdate).toHaveBeenCalledWith({
      objective: 'Novo escopo detalhado de homologação',
    });
  });

  it('renderiza os três grupos compactos de Planejamento, Execução e Faturamento', () => {
    render(
      <SprintDetailsModal
        sprint={mockSprint}
        onClose={vi.fn()}
        onUpdate={vi.fn()}
        onCreateTask={vi.fn()}
        onUpdateTask={vi.fn()}
        onMoveTask={vi.fn()}
        onDeleteTask={vi.fn()}
        auditLogs={[]}
      />
    );

    // Grupo Planejamento
    expect(screen.getByText(/CRONOGRAMA & PLANEJAMENTO/i)).toBeDefined();
    expect(screen.getByLabelText(/Data de Início/i)).toBeDefined();
    expect(screen.getByLabelText(/Data de Fim/i)).toBeDefined();
    expect(screen.getByLabelText(/PF Estimado/i)).toBeDefined();

    // Grupo Execução
    expect(screen.getByText(/RESPONSÁVEIS & PAPÉIS/i)).toBeDefined();

    // Grupo Faturamento
    expect(screen.getByText(/FATURAMENTO & PONTO DE FUNÇÃO/i)).toBeDefined();

    // Rodapé de auditoria
    expect(screen.getByText(/Entrada na raia atual:/i)).toBeDefined();
    expect(screen.getByText(/Última atualização:/i)).toBeDefined();
  });

  it('seleciona o projeto e módulo vinculados à Sprint', () => {
    localStorage.setItem('painelpro-registrations', JSON.stringify({
      projects: [{ id: 'P-SAGAT', name: 'SAGAT', color: '#16a34a', active: true }],
      modules: [{ id: 'M-RECEPCAO', name: 'Recepção', projectId: 'P-SAGAT', active: true }],
    }));
    const sagatSprint: Sprint = {
      ...mockSprint,
      code: 'SPR-03',
      system: 'Sagat - Recepção',
      projectName: 'SAGAT',
      module: 'Recepção',
      project: 'Sagat - Recepção - Sprint 3',
    };

    render(
      <SprintDetailsModal
        sprint={sagatSprint}
        onClose={vi.fn()}
        onUpdate={vi.fn()}
        onCreateTask={vi.fn()}
        onUpdateTask={vi.fn()}
        onMoveTask={vi.fn()}
        onDeleteTask={vi.fn()}
        auditLogs={[]}
      />
    );

    expect(screen.getByRole('combobox', { name: /Projeto \/ Módulo/i }).textContent).toContain('SAGAT → Recepção');
  });

  it('aceita digitação ou colagem de datas e oferece os 12 meses para faturamento', () => {
    const handleUpdate = vi.fn();
    render(
      <SprintDetailsModal
        sprint={mockSprint}
        onClose={vi.fn()}
        onUpdate={handleUpdate}
        onCreateTask={vi.fn()}
        onUpdateTask={vi.fn()}
        onMoveTask={vi.fn()}
        onDeleteTask={vi.fn()}
        auditLogs={[]}
      />
    );

    const startInput = screen.getByLabelText(/Data de Início/i) as HTMLInputElement;
    expect(startInput.type).toBe('text');
    fireEvent.change(startInput, { target: { value: '05/10/2026' } });
    fireEvent.blur(startInput);
    expect(handleUpdate).toHaveBeenCalledWith({ start: '2026-10-05' });

    const forecast = screen.getByRole('combobox', { name: /Previsão Faturamento/i });
    expect(forecast.textContent).toContain('Setembro de 2026');
    fireEvent.mouseDown(forecast);
    expect(screen.getAllByRole('option')).toHaveLength(13);
  });

  it('bloqueia PF detalhado quando a Sprint não está em raia de homologação/faturamento', () => {
    const sprintInDev = { ...mockSprint, lane: 'development' as const };

    render(
      <SprintDetailsModal
        sprint={sprintInDev}
        onClose={vi.fn()}
        onUpdate={vi.fn()}
        onCreateTask={vi.fn()}
        onUpdateTask={vi.fn()}
        onMoveTask={vi.fn()}
        onDeleteTask={vi.fn()}
        auditLogs={[]}
      />
    );

    const detailedPfInput = screen.getByLabelText(/PF Detalhado \(Bloqueado\)/i);
    expect(detailedPfInput).toBeDefined();
    expect((detailedPfInput as HTMLInputElement).disabled).toBe(true);
  });

  it('libera PF detalhado quando a Sprint está na raia de faturamento', () => {
    const sprintInBilling = { ...mockSprint, lane: 'billing' as const };

    render(
      <SprintDetailsModal
        sprint={sprintInBilling}
        onClose={vi.fn()}
        onUpdate={vi.fn()}
        onCreateTask={vi.fn()}
        onUpdateTask={vi.fn()}
        onMoveTask={vi.fn()}
        onDeleteTask={vi.fn()}
        auditLogs={[]}
      />
    );

    const detailedPfInput = screen.getByLabelText(/PF Detalhado \(Liberado\)/i);
    expect(detailedPfInput).toBeDefined();
    expect((detailedPfInput as HTMLInputElement).disabled).toBe(false);
  });
});
