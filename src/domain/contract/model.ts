export type ContractType = 'DESENVOLVIMENTO' | 'SUSTENTACAO';
export type ContractStatus = 'VIGENTE' | 'RENOVADO' | 'ENCERRADO';

export interface ProjectContract {
  id: string;
  code: string;
  name: string;
  type: ContractType;
  totalPf: number;
  realizedPf: number;
  startMonth: string;
  endMonth: string;
  yearPeriod: number;
  startDate: string;
  endDate: string;
  status: ContractStatus;
  description?: string;
}

export const DEFAULT_CONTRACTS: ProjectContract[] = [
  {
    id: 'contract-dev-01',
    code: 'CONT-DEV-8K',
    name: 'Contrato 1 — Desenvolvimento e Melhorias de Software',
    type: 'DESENVOLVIMENTO',
    totalPf: 8000,
    realizedPf: 6240,
    startMonth: 'Outubro',
    endMonth: 'Setembro',
    yearPeriod: 2,
    startDate: '2024-10-01',
    endDate: '2026-09-30',
    status: 'VIGENTE',
    description: 'Fábrica de software e evolução tecnológica contínua dos sistemas de comércio exterior e gestão governamental.',
  },
  {
    id: 'contract-sust-02',
    code: 'CONT-SUST-3K',
    name: 'Contrato 2 — Sustentação e Suporte Técnico Operacional',
    type: 'SUSTENTACAO',
    totalPf: 3000,
    realizedPf: 2450,
    startMonth: 'Outubro',
    endMonth: 'Setembro',
    yearPeriod: 2,
    startDate: '2024-10-01',
    endDate: '2026-09-30',
    status: 'VIGENTE',
    description: 'Atendimento a chamados corretivos, suporte operacional, estabilização e monitoramento de ambientes de produção.',
  },
];
