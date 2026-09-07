import { describe, expect, it } from 'vitest';
import {
  normalizeProjectManagerName,
  normalizeSprintProjectManager,
  WILLIAM_DANGELO,
} from './projectManager';

describe('normalização do gerente William D\'Angelo', () => {
  it.each([
    'William',
    'Willian',
    "William D'Angelo",
    'William D’Angelo',
    'William D’Ângelo',
  ])('consolida a variação %s no nome canônico', (value) => {
    expect(normalizeProjectManagerName(value)).toBe(WILLIAM_DANGELO);
  });

  it('atualiza os dois campos de gerente da sprint', () => {
    const sprint = normalizeSprintProjectManager({
      code: 'SPR-1',
      project: 'SCIEX',
      objective: 'Entrega',
      lane: 'completed',
      progress: 100,
      health: 100,
      manager: 'Willian',
    });

    expect(sprint.projectManager).toBe(WILLIAM_DANGELO);
    expect(sprint.manager).toBe(WILLIAM_DANGELO);
  });
});
