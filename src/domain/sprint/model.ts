export type Lane =
  | 'planning'
  | 'planned'
  | 'development'
  | 'homologation'
  | 'approved'
  | 'billing'
  | 'completed';

export type TaskStatus =
  | 'A Fazer'
  | 'Em Desenvolvimento'
  | 'Em Teste'
  | 'Em Correção'
  | 'Concluída'
  | 'Bloqueada'
  | 'Em Andamento'; // mantido para compatibilidade retroativa

export interface TaskAssignee {
  id: string;
  name: string;
  role?: string;
}

export interface TaskActivityLog {
  id: string;
  fromStatus: TaskStatus | 'Criada';
  toStatus: TaskStatus;
  timestamp: string;
  user: string;
  note?: string;
  hoursLogged?: number;
  type: 'MOVE' | 'FEEDBACK' | 'BUG_REPORT' | 'REOPEN' | 'CREATE';
}

export interface TaskChecklistItem {
  id: string;
  text: string;
  completed: boolean;
}

export interface SprintTask {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority?: 'Baixa' | 'Média' | 'Alta' | 'Crítica';
  points?: number;

  // Atribuição Múltipla
  assignees?: TaskAssignee[];
  owner?: string;
  ownerId?: string;
  ownerRole?: string;

  // Horas & Apontamento
  estimatedDevHours?: number;
  realizedDevHours?: number;
  estimatedQaHours?: number;
  realizedQaHours?: number;

  // Datas de Ciclo & Prazos
  startDate?: string;
  devCompletedAt?: string;
  qaStartedAt?: string;
  completedAt?: string;
  dueDate?: string;

  // Feedbacks dos Responsáveis & Retrabalho
  devFeedback?: string;
  qaFeedback?: string;
  rejectionReason?: string;
  reworkCount?: number;

  // Critérios de Aceite & Bloqueios
  checklist?: TaskChecklistItem[];
  isBlocked?: boolean;
  blockerReason?: string;
  observations?: string;

  // Auditoria da Task
  history?: TaskActivityLog[];
  createdAt?: string;
  updatedAt?: string;
}

export type AuditAction =
  | 'SPRINT_CREATED'
  | 'SPRINT_UPDATED'
  | 'SPRINT_MOVED'
  | 'SPRINT_REORDERED'
  | 'RESUMO_ATUALIZADO'
  | 'PROJETO_ALTERADO'
  | 'SPRINT_ALTERADA'
  | 'RESPONSAVEL_ALTERADO'
  | 'ETIQUETAS_ATUALIZADAS'
  | 'TASK_CREATED'
  | 'TASK_UPDATED'
  | 'TASK_MOVED'
  | 'TASK_DELETED';

export interface AuditLog {
  id: string;
  entityId: string;
  action: AuditAction;
  message: string;
  user: string;
  createdAt: string;
}

export interface Sprint {
  code: string;
  system?: string;
  projectName?: string;
  module?: string;
  project: string;
  sprintNumber?: number;
  serviceOrder?: string;
  objective: string;
  lane: Lane;
  position?: number;
  progress: number;
  expectedProgress?: number;
  health: number;
  functionPoints?: number;
  detailedFunctionPoints?: number;
  billingForecastMonth?: string;
  invoicedAt?: string;
  po?: string;
  tasks?: number;
  completedTasks?: number;
  blocked?: number;
  impediments?: number;
  risks?: number;
  deliveries?: number;
  labels?: string[];
  priorityLevel?: string;
  projectManager?: string;
  manager?: string;
  technicalLead?: string;
  businessAnalyst?: string;
  start?: string;
  end?: string;
  lastUpdated?: string;
  enteredLaneAt?: string;
  isFeatured?: boolean;
  featuredNote?: string;
  taskItems?: SprintTask[];
  [key: string]: unknown;
}

export { LANES } from './constants';
