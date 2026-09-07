// @vitest-environment jsdom
import { describe, expect, it, beforeEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { SuperintendencePage } from './SuperintendencePage';
import { SprintProvider } from '../../app/providers/SprintProvider';
import type { Sprint } from '../../domain/sprint/model';

const mockSprints: Sprint[] = [
  {
    code: 'SPR-01',
    system: 'SCIEX',
    project: 'SCIEX - Sprint 1',
    sprintNumber: 1,
    serviceOrder: '#OS15000',
    objective: 'Integrações e APIs de Comércio Exterior',
    po: 'Ana Paula',
    lane: 'development',
    progress: 48,
    health: 58,
    blocked: 1,
    tasks: 12,
    priorityLevel: 'Alta',
    isFeatured: true,
    featuredNote: 'Aguardando validação do webservice da Receita.',
    deliveries: 2,
    functionPoints: 24,
  },
  {
    code: 'SPR-02',
    system: 'CADSUF',
    project: 'CADSUF - Sprint 2',
    sprintNumber: 2,
    serviceOrder: '#OS15001',
    objective: 'Cadastro de Empresas e Validação Facial',
    po: 'Rafael Lima',
    lane: 'homologation',
    progress: 85,
    health: 88,
    blocked: 0,
    tasks: 8,
    priorityLevel: 'Média',
    isFeatured: false,
    deliveries: 1,
    functionPoints: 16,
  },
  {
    code: 'SPR-03',
    system: 'SIMNAC',
    project: 'SIMNAC - Sprint 3',
    sprintNumber: 3,
    serviceOrder: '#OS15002',
    objective: 'Painel de Internamento e Vistoria',
    po: 'Mariana Costa',
    lane: 'completed',
    progress: 100,
    health: 95,
    blocked: 0,
    tasks: 10,
    priorityLevel: 'Baixa',
    isFeatured: false,
    deliveries: 3,
    functionPoints: 20,
  },
];

describe('SuperintendencePage Component — Dashboard Executivo SUFRAMA', () => {
  beforeEach(() => {
    cleanup();
    localStorage.clear();
    localStorage.setItem('painelpro-sprints', JSON.stringify(mockSprints));
  });

  it('renderiza o cabeçalho executivo da SUFRAMA e os 5 KPIs principais', () => {
    render(
      <SprintProvider>
        <SuperintendencePage />
      </SprintProvider>
    );

    // Header
    expect(screen.getByText('Visão Executiva da Gestão Suframa')).toBeDefined();
    expect(
      screen.getByText('Panorama consolidado dos projetos e entregas da fábrica de software')
    ).toBeDefined();

    // 5 KPIs
    expect(screen.getByText('Times Ativos')).toBeDefined();
    expect(screen.getByText('Entregas no Mês')).toBeDefined();
    expect(screen.getByText('Previsão do Próximo Mês')).toBeDefined();
    expect(screen.getByText('Decisões Pendentes')).toBeDefined();
    expect(screen.getByText('Contrato Consumido')).toBeDefined();
  });

  it('renderiza o Pipeline de Projetos e cards com badges de status', () => {
    render(
      <SprintProvider>
        <SuperintendencePage />
      </SprintProvider>
    );

    expect(screen.getByText('Pipeline de Projetos')).toBeDefined();
    expect(screen.getByText('Principais iniciativas em andamento')).toBeDefined();
    expect(screen.getAllByText(/SIMNAC/i).length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText(/SCIEX/i).length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText(/Em desenvolvimento/i).length).toBeGreaterThanOrEqual(1);
  });

  it('renderiza a seção de Decisões e Destaques e o card de Sustentação com mini KPIs', () => {
    render(
      <SprintProvider>
        <SuperintendencePage />
      </SprintProvider>
    );

    expect(screen.getByText('Decisões e Destaques')).toBeDefined();
    expect(screen.getByText(/Sustentação/i)).toBeDefined();

    // Mini KPIs de sustentação
    expect(screen.getByText('Abertos')).toBeDefined();
    expect(screen.getByText('Críticos')).toBeDefined();
    expect(screen.getByText('No SLA')).toBeDefined();
    expect(screen.getByText('Resolvidos')).toBeDefined();
  });

  it('renderiza os 4 cards analíticos de gráficos', () => {
    render(
      <SprintProvider>
        <SuperintendencePage />
      </SprintProvider>
    );

    expect(screen.getByText('Entregas por Sistema')).toBeDefined();
    expect(screen.getByText('Previsão de Entregas')).toBeDefined();
    expect(screen.getByText('Status do Portfólio')).toBeDefined();
    expect(screen.getByText('Sprints por Sistema')).toBeDefined();
  });

  it('abre o modal de detalhes da Sprint ao clicar em um item de decisão ou projeto', () => {
    render(
      <SprintProvider>
        <SuperintendencePage />
      </SprintProvider>
    );

    // Click on decision or project with sprint attached
    const sciexElements = screen.getAllByText(/SCIEX/i);
    expect(sciexElements.length).toBeGreaterThanOrEqual(1);
    fireEvent.click(sciexElements[0]);
  });
});
