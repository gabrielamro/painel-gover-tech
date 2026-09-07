// @vitest-environment jsdom
import { beforeEach, describe, expect, it } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import { ThemeProvider } from '@mui/material/styles';
import { executiveTheme } from '../../../theme/executiveTheme';
import { LeaderProjectCard, type LeaderProjectCardData } from './LeaderProjectCard';

const project: LeaderProjectCardData = {
  name: 'SAC',
  color: '#d97706',
  sprintCount: 8,
  taskCount: 10,
  progress: 50,
  blockedCount: 2,
  reworkRate: 0,
  realizedDevHours: 4,
  estimatedDevHours: 8,
  realizedQaHours: 2,
  estimatedQaHours: 3,
  developedCount: 3,
  openCount: 5,
  completedTasks: 6,
  assigneeNames: ['Ana Souza'],
  latest: '2026-09-01T12:00:00.000Z',
};

function renderCard(data: LeaderProjectCardData = project) {
  return render(
    <ThemeProvider theme={executiveTheme}>
      <LeaderProjectCard project={data} />
    </ThemeProvider>,
  );
}

describe('LeaderProjectCard', () => {
  beforeEach(() => cleanup());

  it('mantém os indicadores operacionais no formato compacto', () => {
    renderCard();

    expect(screen.getByText('Desenvolvidas')).toBeDefined();
    expect(screen.getByText('Em andamento')).toBeDefined();
    expect(screen.getByText('4h / 8h')).toBeDefined();
    expect(screen.getByText('2h / 3h')).toBeDefined();
    expect(screen.getByText('6/10 tasks')).toBeDefined();
  });

  it('exibe alerta e contador somente quando existem bloqueios', () => {
    const { rerender } = renderCard();

    expect(screen.getByRole('status', { name: '2 bloqueios ativos' })).toBeDefined();

    rerender(
      <ThemeProvider theme={executiveTheme}>
        <LeaderProjectCard project={{ ...project, blockedCount: 0 }} />
      </ThemeProvider>,
    );

    expect(screen.queryByRole('status')).toBeNull();
  });
});
