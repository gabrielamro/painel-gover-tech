import type { Sprint } from '../sprint/model';

export const WILLIAM_DANGELO = "William D'Angelo";

const managerKey = (value: string) =>
  value
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLocaleLowerCase('pt-BR')
    .replace(/[^a-z]+/g, ' ')
    .trim();

const williamAliases = new Set([
  'william',
  'willian',
  'william d angelo',
  'willian d angelo',
]);

export function isWilliamDAngeloAlias(value?: string): boolean {
  return Boolean(value && williamAliases.has(managerKey(value)));
}

export function normalizeProjectManagerName(value?: string): string | undefined {
  const trimmed = value?.trim();
  if (!trimmed) return undefined;
  return isWilliamDAngeloAlias(trimmed) ? WILLIAM_DANGELO : trimmed;
}

export function normalizeSprintProjectManager(sprint: Sprint): Sprint {
  const projectManager = normalizeProjectManagerName(sprint.projectManager);
  const manager = normalizeProjectManagerName(sprint.manager);

  if (isWilliamDAngeloAlias(sprint.projectManager) || isWilliamDAngeloAlias(sprint.manager)) {
    return { ...sprint, projectManager: WILLIAM_DANGELO, manager: WILLIAM_DANGELO };
  }

  if (projectManager === sprint.projectManager && manager === sprint.manager) return sprint;
  return { ...sprint, projectManager, manager };
}
