import { describe, expect, it } from 'vitest';
import {
  DEFAULT_RANGE_END,
  DEFAULT_RANGE_START,
  formatMonthLabel,
  isMonthInRange,
} from './ExecutiveSystemsComparisonChart';

describe('ExecutiveSystemsComparisonChart period helpers', () => {
  it('usa outubro de 2025 até julho de 2026, última competência faturada, como intervalo padrão', () => {
    expect(DEFAULT_RANGE_START).toBe('2025-10');
    expect(DEFAULT_RANGE_END).toBe('2026-07');
    expect(formatMonthLabel(DEFAULT_RANGE_START, 'long')).toBe('Outubro de 2025');
    expect(formatMonthLabel(DEFAULT_RANGE_END, 'long')).toBe('Julho de 2026');
  });

  it('considera os meses inicial e final no cálculo do intervalo', () => {
    expect(isMonthInRange('2025-10', '2025-10', '2026-09')).toBe(true);
    expect(isMonthInRange('2026-02', '2025-10', '2026-09')).toBe(true);
    expect(isMonthInRange('2026-09', '2025-10', '2026-09')).toBe(true);
    expect(isMonthInRange('2025-09', '2025-10', '2026-09')).toBe(false);
    expect(isMonthInRange('2026-10', '2025-10', '2026-09')).toBe(false);
  });
});
