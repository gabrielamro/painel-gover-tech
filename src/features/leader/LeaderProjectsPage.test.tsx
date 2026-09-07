// @vitest-environment jsdom
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { LeaderProjectsPage } from './LeaderProjectsPage';

vi.mock('../../app/providers/SprintProvider', () => ({
  useSprints: () => ({
    sprints: [
      {
        code: 'SPR-SAC-01',
        system: 'SAC',
        projectName: 'SAC',
        module: 'Atendimento',
        project: 'SAC - Sprint 1',
        objective: 'Entrega SAC',
        lane: 'development',
        progress: 40,
        health: 90,
        projectManager: 'Adilson',
        lastUpdated: '2026-09-01T12:00:00.000Z',
        taskItems: [],
      },
      {
        code: 'SPR-SCIEX-01',
        system: 'SCIEX',
        project: 'SCIEX - Sprint 1',
        objective: 'Entrega SCIEX',
        lane: 'completed',
        progress: 100,
        health: 95,
        manager: "William D'Angelo",
        lastUpdated: '2026-09-02T12:00:00.000Z',
        taskItems: [],
      },
    ],
  }),
}));

describe('LeaderProjectsPage', () => {
  beforeEach(() => cleanup());

  it('filtra projetos pelo gerente e atualiza a visão consolidada', () => {
    render(<LeaderProjectsPage />);

    expect(screen.getByRole('heading', { name: 'SAC - Atendimento' })).toBeDefined();
    expect(screen.getByRole('heading', { name: 'SCIEX' })).toBeDefined();
    expect(screen.getByText('Módulos ativos')).toBeDefined();

    fireEvent.mouseDown(screen.getByRole('combobox', { name: 'Gerente' }));
    fireEvent.click(screen.getByRole('option', { name: 'Adilson' }));

    expect(screen.getByRole('heading', { name: 'SAC - Atendimento' })).toBeDefined();
    expect(screen.queryByRole('heading', { name: 'SCIEX' })).toBeNull();
  });

  it('mantém a exportação como ação somente por ícone e acessível', () => {
    render(<LeaderProjectsPage />);

    expect(screen.getByRole('button', { name: 'Exportar relatório em CSV' })).toBeDefined();
    expect(screen.queryByText('Exportar CSV')).toBeNull();
  });
});
