import type { RegistrationRepository, RegistryState, RegistryType } from '../contracts/RegistrationRepository';
import type { RegistryEntity } from '../contracts/RegistrationRepository';
import { isWilliamDAngeloAlias, normalizeProjectManagerName, WILLIAM_DANGELO } from '../../domain/people/projectManager';

export const REGISTRATION_STORAGE_KEY = 'painelpro-registrations';

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

export function mergeProjectManagerRegistrations(state: RegistryState): RegistryState {
  const aliases = state.managers.filter((manager) => isWilliamDAngeloAlias(manager.name));
  if (!aliases.length) return state;

  const preferred = aliases.find((manager) => manager.name === WILLIAM_DANGELO) || aliases[0];
  const canonicalId = preferred.id;
  const aliasIds = new Set(aliases.map((manager) => manager.id));
  const mergedManager = aliases.reduce(
    (result, manager) => ({ ...result, ...manager, id: canonicalId, name: WILLIAM_DANGELO }),
    { ...preferred, id: canonicalId, name: WILLIAM_DANGELO }
  );
  const managers = [
    ...state.managers.filter((manager) => !isWilliamDAngeloAlias(manager.name)),
    mergedManager,
  ];
  const normalizeLinkedEntity = <T extends RegistryEntity>(entity: T): T => {
    const linked = entity as T & { projectManagerId?: string; manager?: string };
    return {
      ...entity,
      ...(linked.projectManagerId && aliasIds.has(linked.projectManagerId)
        ? { projectManagerId: canonicalId }
        : {}),
      ...(linked.manager ? { manager: normalizeProjectManagerName(linked.manager) } : {}),
    };
  };

  return {
    ...state,
    managers,
    projects: state.projects.map(normalizeLinkedEntity),
    pos: state.pos.map(normalizeLinkedEntity),
  };
}

export class LocalStorageRegistrationRepository implements RegistrationRepository {
  constructor(private readonly storage: Pick<Storage, 'getItem' | 'setItem'> = window.localStorage) {}

  list<T extends RegistryEntity>(type: RegistryType): T[] {
    const state = this.read();
    return (state[type] || []) as T[];
  }

  replaceAll(state: RegistryState): void {
    this.storage.setItem(REGISTRATION_STORAGE_KEY, JSON.stringify(mergeProjectManagerRegistrations(state)));
  }

  private read(): RegistryState {
    try {
      const value: unknown = JSON.parse(this.storage.getItem(REGISTRATION_STORAGE_KEY) || 'null');
      if (!value || typeof value !== 'object' || Array.isArray(value)) return emptyState();
      const candidate = value as Partial<RegistryState>;
      const base = emptyState();
      const result = {
        ...base,
        ...Object.fromEntries(
          Object.keys(base).map((key) => [
            key,
            Array.isArray(candidate[key as RegistryType]) && candidate[key as RegistryType]!.length > 0
              ? candidate[key as RegistryType]
              : base[key as RegistryType],
          ])
        ),
      } as RegistryState;
      const normalized = mergeProjectManagerRegistrations(result);
      if (JSON.stringify(normalized) !== JSON.stringify(result)) {
        this.storage.setItem(REGISTRATION_STORAGE_KEY, JSON.stringify(normalized));
      }
      return normalized;
    } catch {
      return emptyState();
    }
  }
}
