import type { PfMonthlyRecord } from '../pf/model';
import type { ContractType, ProjectContract } from './model';

export const CONTRACT_BILLING_PERIOD_START = '2025-10';
export const LATEST_BILLED_MONTH = '2026-07';

const roundPf = (value: number) => Math.round(value * 100) / 100;

export function isContractBillingMonth(month: string): boolean {
  return month >= CONTRACT_BILLING_PERIOD_START && month <= LATEST_BILLED_MONTH;
}

export function contractRealizedPf(type: ContractType, records: PfMonthlyRecord[]): number {
  return roundPf(records.reduce((total, record) => {
    if (!isContractBillingMonth(record.month)) return total;
    const isSustentacao = record.project.trim().toLocaleLowerCase('pt-BR') === 'sustentação';
    const belongsToContract = type === 'SUSTENTACAO' ? isSustentacao : !isSustentacao;
    return belongsToContract ? total + Number(record.detailedPf || 0) : total;
  }, 0));
}

export function contractWithCalculatedRealized(
  contract: ProjectContract,
  records: PfMonthlyRecord[]
): ProjectContract {
  return { ...contract, realizedPf: contractRealizedPf(contract.type, records) };
}

