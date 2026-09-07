import type { Lane, Sprint } from './model';
import { getSystemColor } from '../project/colors';

export interface SprintFilters { query?: string; project?: string; lane?: Lane }

export function sprintSystem(sprint: Sprint): string {
  if (sprint.projectName?.trim() && sprint.module?.trim()) return `${sprint.projectName.trim()} - ${sprint.module.trim()}`;
  if (sprint.projectName?.trim()) return sprint.projectName.trim();
  const projectBase = sprint.project.split(/\s+-\s+Sprint\s+/i)[0] || sprint.project;
  const systemName = sprint.system?.trim();
  if (systemName && projectBase.includes(' - ') && projectBase.toLocaleLowerCase('pt-BR').startsWith(`${systemName.toLocaleLowerCase('pt-BR')} - `)) {
    return projectBase;
  }
  const source = systemName || projectBase;
  const normalized = source.trim().toLocaleUpperCase('pt-BR');
  const aliases: Record<string, string> = {
    'SPR-MEAAP': 'SPR - MEAAP',
    'SPR-MCPP': 'SPR - MCPP',
    'SPR-MPPB': 'SPR - MPPB',
    'SPR-MAPI': 'SPR - MAPI',
    'SPR-MCI': 'SPR - MCI',
    'SAGAT-ANÁLISE': 'SAGAT - Análise',
    'SAGAT-RECEPÇÃO': 'SAGAT - Recepção',
  };
  if (aliases[normalized]) return aliases[normalized];
  return sprint.system || sprint.project.split(/\s+-\s+Sprint\s+/i)[0] || sprint.project;
}

export function filterSprints(sprints: Sprint[], filters: SprintFilters): Sprint[] {
  const query = filters.query?.trim().toLocaleLowerCase('pt-BR') || '';
  return sprints.filter((sprint) => {
    const searchable = [sprintSystem(sprint), sprint.objective, sprint.serviceOrder, sprint.code].filter(Boolean).join(' ').toLocaleLowerCase('pt-BR');
    return (!query || searchable.includes(query)) && (!filters.project || sprintSystem(sprint) === filters.project) && (!filters.lane || sprint.lane === filters.lane);
  });
}

export function systemColor(system: string): string {
  return getSystemColor(system);
}
