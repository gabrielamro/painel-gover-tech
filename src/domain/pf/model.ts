export interface PfMonthlyRecord {
  id: string;
  project: string;
  module?: string;
  month: string;
  estimatedPf?: number;
  detailedPf: number;
  manager?: string;
  cgticAnalyst?: string;
  source: string;
  sourceRow: number;
  importedAt: string;
  observation?: string;
}

export const PF_HISTORY_STORAGE_KEY = 'painelpro-pf-monthly-history';

export function pfDisplayName(record: Pick<PfMonthlyRecord, 'project' | 'module'>): string {
  return record.module ? `${record.project} - ${record.module}` : record.project;
}
