// @vitest-environment jsdom
import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import { SprintProvider } from '../../app/providers/SprintProvider';
import { FactoryPerformancePage } from './FactoryPerformancePage';

describe('FactoryPerformancePage Component', () => {
  beforeEach(() => {
    cleanup();
  });

  it('renderiza o Top Ribbon de cadência e os 4 hero KPIs operacionais focados em Sprints', () => {
    render(
      <SprintProvider>
        <FactoryPerformancePage />
      </SprintProvider>
    );

    // 1. Top Ribbon
    expect(screen.getByText(/Ritmo da Fábrica:/i)).toBeDefined();
    expect(screen.getByText(/8.4 Sprints \/ Mês/i)).toBeDefined();
    expect(screen.getByText(/5 de 5 Sistemas em Produção Ativa/i)).toBeDefined();
    expect(screen.getByText(/96.2% de Entregas no Prazo/i)).toBeDefined();

    // 2. 4 Hero KPIs
    expect(screen.getByText('TOTAL DE SPRINTS ENTREGUES')).toBeDefined();
    expect(screen.getByText('SPRINTS EM ANDAMENTO')).toBeDefined();
    expect(screen.getByText('THROUGHPUT DO ÚLTIMO MÊS')).toBeDefined();
    expect(screen.getByText('LEAD TIME MÉDIO')).toBeDefined();

    // 3. Valores dos KPIs
    expect(screen.getByText(/18.5 Dias/i)).toBeDefined();
    expect(screen.getByText(/\+35% acima da média histórica/i)).toBeDefined();
  });

  it('renderiza os gráficos de throughput mensal e entregas por sistema', () => {
    render(
      <SprintProvider>
        <FactoryPerformancePage />
      </SprintProvider>
    );

    // Gráfico 1: Throughput mensal
    expect(screen.getByText('Sprints Faturadas por Mês & Curva Acumulada')).toBeDefined();
    expect(screen.getByText('Total Acumulado (76 Sprints)')).toBeDefined();

    // Gráfico 2: Entregas por sistema
    expect(screen.getByText('Quantidade de Sprints Entregues vs. Em Andamento')).toBeDefined();
    expect(screen.getByText('SCIEX Exportação / Importação')).toBeDefined();
    expect(screen.getByText('CADSUF Cadastro Único')).toBeDefined();
  });

  it('renderiza os cards de Sprints em andamento focados em prazos de entrega sem fases de subtasks', () => {
    render(
      <SprintProvider>
        <FactoryPerformancePage />
      </SprintProvider>
    );

    expect(screen.getByText('Sprints em Andamento (Prazos de Entrega Comprometidos)')).toBeDefined();
    expect(screen.getByText('14 Sprints em Produção Ativa')).toBeDefined();

    // Prazos em destaque
    expect(screen.getAllByText(/Faltam/i).length).toBeGreaterThanOrEqual(1);
  });
});
