// @vitest-environment jsdom
import { describe, expect, it } from 'vitest';
import { PfMonthlyRepository } from '../../repositories/local-storage/PfMonthlyRepository';
import { contractRealizedPf, isContractBillingMonth } from './analytics';

describe('contract analytics', () => {
  it('considera somente outubro de 2025 até julho de 2026', () => {
    expect(isContractBillingMonth('2025-09')).toBe(false);
    expect(isContractBillingMonth('2025-10')).toBe(true);
    expect(isContractBillingMonth('2026-07')).toBe(true);
    expect(isContractBillingMonth('2026-08')).toBe(false);
  });

  it('calcula o realizado de cada contrato pelo histórico faturado', () => {
    localStorage.clear();
    const records = new PfMonthlyRepository().list();
    expect(contractRealizedPf('DESENVOLVIMENTO', records)).toBe(4803.84);
    expect(contractRealizedPf('SUSTENTACAO', records)).toBe(2665.2);
  });
});
