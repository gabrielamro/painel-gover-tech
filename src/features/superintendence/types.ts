export type ProjectStatusType =
  | 'development'
  | 'homologation'
  | 'acceptance'
  | 'completed';

export type DeadlineUrgencyType =
  | 'on_time'
  | 'at_risk'
  | 'delayed';

export interface ExecutiveKpiItem {
  id: string;
  title: string;
  value: string | number;
  comparison?: {
    text: string;
    subtext: string;
    isPositive?: boolean;
    isNeutral?: boolean;
  };
  footer: string;
  iconType: 'teams' | 'deliveries' | 'forecast' | 'decisions';
}

export interface ContractConsumptionData {
  consumedPf: number;
  consumedPercentage: number;
  remainingPf: number;
  ceilingPf: number;
  periodLabel: string;
}

export interface PipelineProject {
  id: string;
  code: string;
  system: string;
  subsystem?: string;
  title: string;
  status: ProjectStatusType;
  dueDate: string;
  deadlineStatus: DeadlineUrgencyType;
  sprintRef?: any;
}

export interface DecisionHighlightItem {
  id: string;
  title: string;
  description: string;
  date?: string;
  severity: 'warning' | 'critical' | 'info';
  sprintRef?: any;
}

export interface SupportSummaryStats {
  openCount: number;
  criticalCount: number;
  slaPercentage: number;
  resolvedCount: number;
  periodLabel: string;
}

export interface SystemDeliveryData {
  sistema: string;
  entregas: number;
}

export interface DeliveryForecastWeek {
  semana: string;
  confirmadas: number;
  risco: number;
  meta: number;
}

export interface PortfolioStatusItem {
  name: string;
  value: number;
  color: string;
}

export interface SystemSprintsData {
  sistema: string;
  entregues: number;
  emAndamento: number;
  total: number;
}
