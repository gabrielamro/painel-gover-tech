// @vitest-environment jsdom
import { describe, expect, it, beforeEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { PfForecastPage } from './PfForecastPage';
import { SprintProvider } from '../../app/providers/SprintProvider';
import { ForecastMonthProvider } from './ForecastMonthContext';
import type { Sprint } from '../../domain/sprint/model';

const currentMonthStr = (() => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
})();

const mockSprints: Sprint[] = [
  {
    code: 'SPR-01',
    system: 'SCIEX',
    project: 'SCIEX - Sprint 1',
    sprintNumber: 1,
    serviceOrder: '#OS15000',
    objective: 'Integrações de Comércio Exterior',
    po: 'Ana Paula',
    lane: 'development',
    progress: 50,
    health: 70,
    functionPoints: 30,
    detailedFunctionPoints: 35,
    billingForecastMonth: currentMonthStr,
    blocked: 1,
    tasks: 10,
    priorityLevel: 'Alta',
  },
  {
    code: 'SPR-02',
    system: 'CADSUF',
    project: 'CADSUF - Sprint 2',
    sprintNumber: 2,
    serviceOrder: '#OS15001',
    objective: 'Cadastro e Validação Facial',
    po: 'Rafael Lima',
    lane: 'billing',
    progress: 100,
    health: 90,
    functionPoints: 20,
    detailedFunctionPoints: 20,
    billingForecastMonth: currentMonthStr,
    blocked: 0,
    tasks: 5,
    priorityLevel: 'Média',
  },
  {
    code: 'SPR-03',
    system: 'SIMNAC',
    project: 'SIMNAC - Sprint 3',
    sprintNumber: 3,
    serviceOrder: '#OS15002',
    objective: 'Vistoria e Internamento',
    po: 'Mariana Costa',
    lane: 'completed',
    progress: 100,
    health: 95,
    functionPoints: 25,
    detailedFunctionPoints: 28,
    billingForecastMonth: currentMonthStr,
    blocked: 0,
    tasks: 8,
    priorityLevel: 'Baixa',
  },
];

describe('PfForecastPage Component', () => {
  beforeEach(() => {
    cleanup();
    localStorage.clear();
    localStorage.setItem('painelpro-sprints', JSON.stringify(mockSprints));
  });

  it('renderiza o cabeçalho financeiro, controle de mês e os 5 KPIs de PF', () => {
    render(
      <SprintProvider><ForecastMonthProvider><PfForecastPage /></ForecastMonthProvider></SprintProvider>
    );

    expect(screen.getByText('PF previstos no mês')).toBeDefined();
    expect(screen.getByText('OSs em desenvolvimento')).toBeDefined();
    expect(screen.getByText('OSs entregues')).toBeDefined();
    expect(screen.getAllByText('Aguardando faturamento').length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText('Total de PF detalhado')).toBeDefined();
  });

  it('renderiza o gráfico comparativo de PF e a seção de pontos críticos', () => {
    render(
      <SprintProvider><ForecastMonthProvider><PfForecastPage /></ForecastMonthProvider></SprintProvider>
    );

    expect(screen.getByText('PF estimado × PF detalhado')).toBeDefined();
    expect(screen.getByText('Pontos críticos')).toBeDefined();
    expect(screen.getByText('Pontos de melhoria')).toBeDefined();
    expect(screen.getAllByText('SCIEX').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('CADSUF').length).toBeGreaterThanOrEqual(1);
  });

  it('permite abrir o modal de adicionar melhoria', () => {
    render(
      <SprintProvider><ForecastMonthProvider><PfForecastPage /></ForecastMonthProvider></SprintProvider>
    );

    const addBtn = screen.getByRole('button', { name: /Adicionar/i });
    fireEvent.click(addBtn);

    expect(screen.getByText('NOVO PONTO DE MELHORIA')).toBeDefined();
    expect(screen.getByPlaceholderText('O que precisa ser melhorado?')).toBeDefined();
  });

  it('renderiza a página consumindo a competência compartilhada pelo shell', () => {
    render(
      <SprintProvider><ForecastMonthProvider><PfForecastPage /></ForecastMonthProvider></SprintProvider>
    );

    expect(screen.getByText('Contagem detalhada')).toBeDefined();
  });
});
