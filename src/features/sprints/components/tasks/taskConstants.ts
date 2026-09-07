import type { TaskStatus } from '../../../../domain/sprint/model';

export interface TaskLaneConfig {
  id: TaskStatus;
  label: string;
  color: string;
  bgcolor: string;
  borderColor: string;
}

// 5 Raias Oficiais de Engenharia / Fábrica de Software
export const OFFICIAL_TASK_STATES: ReadonlyArray<TaskLaneConfig> = [
  { id: 'A Fazer', label: 'A Fazer', color: '#64748b', bgcolor: '#f8fafc', borderColor: '#e2e8f0' },
  { id: 'Em Desenvolvimento', label: 'Em Desenvolvimento', color: '#2563eb', bgcolor: '#eff6ff', borderColor: '#bfdbfe' },
  { id: 'Em Teste', label: 'Em Teste', color: '#7c3aed', bgcolor: '#faf5ff', borderColor: '#e9d5ff' },
  { id: 'Em Correção', label: 'Em Correção', color: '#d97706', bgcolor: '#fffbeb', borderColor: '#fde68a' },
  { id: 'Concluída', label: 'Concluída', color: '#16a34a', bgcolor: '#f0fdf4', borderColor: '#bbf7d0' },
];

export function normalizeTaskStatus(status: TaskStatus | string | undefined): TaskStatus {
  if (!status) return 'A Fazer';
  if (status === 'Em Andamento') return 'Em Desenvolvimento';
  return status as TaskStatus;
}
