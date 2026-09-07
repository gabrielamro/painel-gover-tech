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

describe('SuperintendencePage Component', () => {
  beforeEach(() => {
    cleanup();
    localStorage.clear();
    localStorage.setItem('painelpro-sprints', JSON.stringify(mockSprints));
  });
  it('renderiza o cabeçalho executivo e os 4 KPIs principais', () => {
    localStorage.setItem('painelpro-sprints', JSON.stringify(mockSprints));

    render(
      <SprintProvider>
        <SuperintendencePage />
      </SprintProvider>
    );

    expect(screen.getByText('Em Desenvolvimento')).toBeDefined();
    expect(screen.getByText('Com Bloqueios')).toBeDefined();
    expect(screen.getByText('Entregas no Mês')).toBeDefined();
    expect(screen.getByText('Itens Prioritários')).toBeDefined();
  });

  it('exibe a tabela consolidada de sistemas e o sidebar de ação necessária', () => {
    localStorage.setItem('painelpro-sprints', JSON.stringify(mockSprints));

    render(
      <SprintProvider>
        <SuperintendencePage />
      </SprintProvider>
    );

    expect(screen.getByText('O que está em andamento')).toBeDefined();
    expect(screen.getAllByText('SCIEX').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('CADSUF').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('SIMNAC').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText(/Ação Necessária/i).length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText(/Destaques/i).length).toBeGreaterThanOrEqual(1);
  });

  it('permite alternar abas entre Ação Necessária e Destaques', () => {
    localStorage.setItem('painelpro-sprints', JSON.stringify(mockSprints));

    render(
      <SprintProvider>
        <SuperintendencePage />
      </SprintProvider>
    );

    const destaquesTabs = screen.getAllByRole('tab', { name: /Destaques/i });
    fireEvent.click(destaquesTabs[0]);

    expect(screen.getByText('LEITURA EXECUTIVA')).toBeDefined();
    expect(screen.getByText('Aguardando validação do webservice da Receita.')).toBeDefined();
  });

  it('permite filtrar sistemas clicando nos cards de resumo', () => {
    localStorage.setItem('painelpro-sprints', JSON.stringify(mockSprints));

    render(
      <SprintProvider>
        <SuperintendencePage />
      </SprintProvider>
    );

    const sciexBtns = screen.getAllByTitle('Filtrar por SCIEX');
    fireEvent.click(sciexBtns[0]);

    expect(screen.getByText(/Limpar filtros/i)).toBeDefined();
  });
});
