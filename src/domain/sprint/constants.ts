import type { Lane, TaskStatus } from './model';

export const LANES: ReadonlyArray<{ id: Lane; label: string }> = [
  { id: 'planning', label: 'Em planejamento' },
  { id: 'planned', label: 'Planejado' },
  { id: 'development', label: 'Em desenvolvimento' },
  { id: 'homologation', label: 'Em homologação' },
  { id: 'approved', label: 'Homologado' },
  { id: 'billing', label: 'Aguardando faturamento' },
  { id: 'completed', label: 'Faturado' },
];

export const PRIORITIES = ['Baixa', 'Média', 'Alta', 'Crítica'] as const;
export type Priority = (typeof PRIORITIES)[number];

export const TASK_STATUSES: ReadonlyArray<TaskStatus> = [
  'A Fazer',
  'Em Desenvolvimento',
  'Em Teste',
  'Em Correção',
  'Concluída',
  'Bloqueada',
  'Em Andamento',
];

export const ATTENTION_LABEL = 'Atenção' as const;
