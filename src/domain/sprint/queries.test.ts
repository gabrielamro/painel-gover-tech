import { describe, expect, it } from 'vitest';
import type { Sprint } from './model';
import { filterSprints, sprintSystem } from './queries';
import { ATTENTION_LABEL, LANES, PRIORITIES, TASK_STATUSES } from './constants';

const sprint: Sprint = {
  code: 'SPR-01',
  system: 'SCIEX',
  project: 'SCIEX - Sprint 10',
  sprintNumber: 10,
  serviceOrder: '15537',
  objective: 'SCIEX Exportação',
  lane: 'development',
  progress: 50,
  health: 90,
};

describe('consultas de Sprint', () => {
  it('usa o sistema sem o número da Sprint', () => expect(sprintSystem(sprint)).toBe('SCIEX'));
  it('filtra por OS, projeto e raia', () => {
    expect(filterSprints([sprint], { query: '15537', project: 'SCIEX', lane: 'development' })).toEqual([sprint]);
    expect(filterSprints([sprint], { project: 'MAPI' })).toEqual([]);
  });
});

describe('contrato oficial do fluxo', () => {
  it('mantém as sete raias na ordem oficial', () => {
    expect(LANES.map(({ id }) => id)).toEqual([
      'planning',
      'planned',
      'development',
      'homologation',
      'approved',
      'billing',
      'completed',
    ]);
    expect(LANES[LANES.length - 1]?.label).toBe('Faturado');
  });

  it('mantém prioridade e atenção como conceitos distintos de raia', () => {
    expect(PRIORITIES).toEqual(['Baixa', 'Média', 'Alta', 'Crítica']);
    expect(ATTENTION_LABEL).toBe('Atenção');
    expect(LANES.some(({ label }) => label === 'Crítica' || label === 'Atenção')).toBe(false);
  });

  it('mantém os estados oficiais de Task da fábrica de software', () => {
    expect(TASK_STATUSES).toEqual([
      'A Fazer',
      'Em Desenvolvimento',
      'Em Teste',
      'Em Correção',
      'Concluída',
      'Bloqueada',
      'Em Andamento',
    ]);
  });
});
