// @vitest-environment jsdom
import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import { SprintProvider } from '../../app/providers/SprintProvider';
import { ExecutivePerformancePage } from './ExecutivePerformancePage';
import { DEFAULT_CONTRACTS } from '../../domain/contract/model';
import { contractRepository } from '../../repositories/local-storage/LocalStorageContractRepository';
import { DEFAULT_RANGE_END, formatMonthLabel } from './components/ExecutiveSystemsComparisonChart';

describe('ExecutivePerformancePage Component', () => {
  beforeEach(() => {
    cleanup();
    localStorage.clear();
    contractRepository.replaceAll(DEFAULT_CONTRACTS);
  });

  it('renderiza a barra superior de contratos, os 5 hero KPIs e o pipeline dinâmico', () => {
    render(
      <SprintProvider>
        <ExecutivePerformancePage />
      </SprintProvider>
    );

    // 1. Top Ribbon Contratos
    expect(screen.getByText(/Contrato 1 \(Dev & Melhorias\)/i)).toBeDefined();
    expect(screen.getByText(/Contrato 2 \(Sustentação\)/i)).toBeDefined();
    expect(screen.getByText(/Outubro a Setembro \(2º Ano\)/i)).toBeDefined();

    // 2. Hero KPIs
    expect(screen.getByText('CONTRATO CONSOLIDADO')).toBeDefined();
    expect(screen.getByText('Desenvolvimento + Sustentação')).toBeDefined();
    expect(screen.getByText('PROJETO DESENVOLVIMENTO')).toBeDefined();
    expect(screen.getByText('ENTREGAS ÚLTIMO MÊS')).toBeDefined();
    expect(screen.getByText('MELHORIAS EM ANDAMENTO')).toBeDefined();
    expect(screen.getByText('PROJETO SUSTENTAÇÃO')).toBeDefined();

    // 3. Gráficos e Status Operacional
    expect(screen.getByText('STATUS OPERACIONAL')).toBeDefined();
    expect(screen.getByText(/Última entrega:/i)).toBeDefined();
    expect(screen.getByText('Total Entregue × Último Ano (PF)')).toBeDefined();
    expect(screen.getByText(`Período: Outubro de 2025 até ${formatMonthLabel(DEFAULT_RANGE_END, 'long')}`)).toBeDefined();
    expect(screen.getByText('+927,5 PF')).toBeDefined();
    expect(screen.getByText('Última entrega: Julho de 2026')).toBeDefined();
    expect(screen.getByLabelText('Mês inicial do período')).toBeDefined();
    expect(screen.getByLabelText('Mês final do período')).toBeDefined();

    // 4. Pipeline Dinâmico de Melhorias
    expect(screen.getByText(/Melhorias e Demandas Ativas em Execução \(\d+ OSs em Andamento\)/)).toBeDefined();
    expect(screen.getByText('Software Factory a Todo Vapor')).toBeDefined();
  });

  it('exibe o saldo restante correto para a meta de 8.000 PF', () => {
    render(
      <SprintProvider>
        <ExecutivePerformancePage />
      </SprintProvider>
    );

    // Outubro/2025 a julho/2026: 4.803,84 PF realizados -> faltam 3.196,16 PF
    expect(screen.getAllByText(/4803.84 PF/i).length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText(/3196.16 PF/i).length).toBeGreaterThanOrEqual(1);
  });

  it('consolida faturamento e sustentação em um único indicador', () => {
    render(
      <SprintProvider>
        <ExecutivePerformancePage />
      </SprintProvider>
    );

    expect(screen.getByText(/7469.04 PF/i)).toBeDefined();
    expect(screen.getByText(/3530.96 PF/i)).toBeDefined();
    expect(screen.getByText(/11000 PF/i)).toBeDefined();
  });
});
