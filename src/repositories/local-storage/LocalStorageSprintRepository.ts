import type { Sprint, SprintTask } from '../../domain/sprint/model';
import { normalizeSprintProjectManager } from '../../domain/people/projectManager';
import type { SprintRepository } from '../contracts/SprintRepository';
import { PfMonthlyRepository, mergeMacroSprints } from './PfMonthlyRepository';

export const SPRINT_STORAGE_KEY = 'painelpro-sprints';
const LEGACY_DATABASE_KEY = 'painelpro-db';

export class LocalStorageSprintRepository implements SprintRepository {
  constructor(private readonly storage: Pick<Storage, 'getItem' | 'setItem'> = window.localStorage) {}

  list(): Sprint[] {
    const current = this.parse(this.storage.getItem(SPRINT_STORAGE_KEY));
    const legacyDatabase = this.parseUnknown(this.storage.getItem(LEGACY_DATABASE_KEY));
    if (current.length) {
      const normalized = current.map(normalizeSprintProjectManager);
      if (JSON.stringify(normalized) !== JSON.stringify(current)) {
        this.storage.setItem(SPRINT_STORAGE_KEY, JSON.stringify(normalized));
      }
      return mergeMacroSprints(this.attachLegacyTasks(normalized, legacyDatabase), new PfMonthlyRepository(this.storage).list());
    }

    // O legado usa o mesmo domínio, mas algumas versões gravam as Sprints
    // dentro do envelope do banco. O React precisa entender os dois formatos.
    try {
      const database = legacyDatabase;
      if (Array.isArray(database)) return mergeMacroSprints(this.attachLegacyTasks((database as Sprint[]).map(normalizeSprintProjectManager), database), new PfMonthlyRepository(this.storage).list());
      if (database && typeof database === 'object' && Array.isArray((database as { sprints?: unknown }).sprints)) {
        const legacySprints = (database as { sprints: Sprint[] }).sprints;
        const normalized = legacySprints.map(normalizeSprintProjectManager);
        if (JSON.stringify(normalized) !== JSON.stringify(legacySprints)) {
          this.storage.setItem(LEGACY_DATABASE_KEY, JSON.stringify({ ...database, sprints: normalized }));
        }
        return mergeMacroSprints(this.attachLegacyTasks(normalized, database), new PfMonthlyRepository(this.storage).list());
      }
    } catch { /* mantém o estado vazio quando o legado estiver incompleto */ }
    return mergeMacroSprints([], new PfMonthlyRepository(this.storage).list());
  }

  replaceAll(sprints: Sprint[]): void {
    this.storage.setItem(SPRINT_STORAGE_KEY, JSON.stringify(sprints.map(normalizeSprintProjectManager)));
  }

  private parse(value: string | null): Sprint[] {
    try {
      const parsed: unknown = JSON.parse(value || '[]');
      return Array.isArray(parsed) ? parsed as Sprint[] : [];
    } catch { return []; }
  }

  private parseUnknown(value: string | null): unknown {
    try { return JSON.parse(value || 'null'); } catch { return null; }
  }

  private attachLegacyTasks(sprints: Sprint[], database?: unknown): Sprint[] {
    const dbTasks = database && typeof database === 'object' && Array.isArray((database as { tasks?: unknown }).tasks)
      ? (database as { tasks: unknown[] }).tasks
      : [];
    return sprints.map((sprint) => {
      const nested = Array.isArray((sprint as Sprint & { tasks?: unknown }).tasks)
        ? (sprint as Sprint & { tasks: unknown[] }).tasks
        : [];
      const linked = dbTasks.filter((task) => this.belongsToSprint(task, sprint));
      const taskItems = (sprint.taskItems?.length ? sprint.taskItems : nested.length ? this.mapTasks(nested) : this.mapTasks(linked));
      if (!taskItems.length) return sprint;
      const completedTasks = taskItems.filter((task) => task.status === 'Concluída').length;
      const blocked = taskItems.filter((task) => task.status === 'Bloqueada').length;
      return { ...sprint, taskItems, tasks: taskItems.length, completedTasks, blocked, deliveries: completedTasks };
    });
  }

  private belongsToSprint(value: unknown, sprint: Sprint): boolean {
    if (!value || typeof value !== 'object') return false;
    const task = value as Record<string, unknown>;
    const references = [task.sprint_id, task.sprintId, task.sprint_code, task.sprintCode, task.sprint, task.parentId].filter(Boolean).map(String);
    return references.includes(String((sprint as Sprint & { id?: string }).id || ''))
      || references.includes(sprint.code)
      || references.includes(String(sprint.serviceOrder || '').replace(/^#/, ''));
  }

  private mapTasks(values: unknown[]): SprintTask[] {
    return values.filter((value): value is Record<string, unknown> => Boolean(value && typeof value === 'object')).map((value, index) => ({
      id: String(value.id || value.code || `TASK-${index + 1}`),
      title: String(value.title || value.name || value.description || 'Task sem título'),
      owner: value.owner ? String(value.owner) : undefined,
      points: Number(value.points ?? value.function_points ?? 0),
      status: (value.status || 'A Fazer') as SprintTask['status'],
      observations: value.observations ? String(value.observations) : undefined,
      createdAt: value.created_at ? String(value.created_at) : undefined,
      updatedAt: value.updated_at ? String(value.updated_at) : undefined,
    }));
  }
}
