import type { RegistryState } from '../../repositories/contracts/RegistrationRepository';
import { mergeProjectManagerRegistrations } from '../../repositories/local-storage/LocalStorageRegistrationRepository';

export interface MigrationStorage {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
}

export const REGISTRATION_MIGRATION_VERSION = 2;
export const REGISTRATION_MIGRATION_KEY = 'painelpro-registrations-migration-version';

const defaultTeamMembers = [
  { id: 'TM-01', name: 'Lucas Almeida', role: 'Tech Lead', active: true },
  { id: 'TM-02', name: 'João Victor', role: 'Desenvolvedor Backend', active: true },
  { id: 'TM-03', name: 'Rafael Lima', role: 'Desenvolvedor Frontend', active: true },
  { id: 'TM-04', name: 'Mariana Costa', role: 'QA / Analista de Testes', active: true },
  { id: 'TM-05', name: 'Beatriz Santos', role: 'QA / Analista de Testes', active: true },
  { id: 'TM-06', name: 'Gabriel Souza', role: 'Desenvolvedor Fullstack', active: true },
];

const emptyState = (): RegistryState => ({
  projects: [],
  modules: [],
  pos: [],
  managers: [],
  cgticAnalysts: [],
  businessAnalysts: [],
  priorities: [],
  labels: [],
  teamMembers: defaultTeamMembers,
});

const parse = (storage: MigrationStorage, key: string): unknown => {
  try {
    return JSON.parse(storage.getItem(key) || 'null');
  } catch {
    return null;
  }
};

const unique = (items: Array<{ id: string; name: string; [key: string]: unknown }>) => [
  ...new Map(
    items
      .filter((item) => item.name?.trim())
      .map((item) => [item.name.trim().toLocaleLowerCase('pt-BR'), { ...item, name: item.name.trim() }])
  ).values(),
];

export function migrateRegistrations(storage: MigrationStorage): { state: RegistryState; migrated: boolean } {
  const current = parse(storage, 'painelpro-registrations');
  if (current && typeof current === 'object' && !Array.isArray(current)) {
    const candidate = current as Partial<RegistryState>;
    const state = mergeProjectManagerRegistrations({
        ...emptyState(),
        ...candidate,
        teamMembers: candidate.teamMembers?.length ? candidate.teamMembers : defaultTeamMembers,
      });
    if (JSON.stringify(state) !== JSON.stringify(current)) {
      storage.setItem('painelpro-registrations', JSON.stringify(state));
    }
    return {
      state,
      migrated: false,
    };
  }
  const legacy = parse(storage, 'painelpro-cadastros');
  const react = parse(storage, 'painelpro-registrations-react');
  const state = emptyState();
  const sources = [legacy, react].filter(
    (value): value is Record<string, unknown> => Boolean(value && typeof value === 'object' && !Array.isArray(value))
  );
  const names = (key: string) =>
    sources
      .flatMap((source) => (Array.isArray(source[key]) ? source[key] : []))
      .filter((value): value is string => typeof value === 'string')
      .map((name) => ({ id: `${key}-${name}`, name }));
  state.projects = unique(names('systems').concat(names('projects')));
  state.pos = unique(names('pos'));
  state.managers = unique(names('managers'));
  state.cgticAnalysts = unique(names('cgticAnalysts'));
  state.businessAnalysts = unique(names('businessAnalysts'));
  state.priorities = unique(names('priorities'));
  state.labels = unique(names('labels'));
  state.teamMembers = defaultTeamMembers;
  const normalizedState = mergeProjectManagerRegistrations(state);
  storage.setItem('painelpro-registrations', JSON.stringify(normalizedState));
  storage.setItem(REGISTRATION_MIGRATION_KEY, String(REGISTRATION_MIGRATION_VERSION));
  return { state: normalizedState, migrated: true };
}
