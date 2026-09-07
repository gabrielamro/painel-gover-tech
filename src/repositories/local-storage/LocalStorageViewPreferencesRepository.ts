import type { KanbanViewPreferences, SavedKanbanView, ViewPreferencesRepository } from '../contracts/ViewPreferencesRepository';

export const KANBAN_PREFERENCES_KEY = 'painelpro-kanban-preferences';
export const KANBAN_SAVED_VIEWS_KEY = 'painelpro-kanban-saved-view';

export class LocalStorageViewPreferencesRepository implements ViewPreferencesRepository {
  constructor(private readonly storage: Pick<Storage, 'getItem' | 'setItem'> = window.localStorage) {}
  getPreferences(): KanbanViewPreferences { return this.read<KanbanViewPreferences>(KANBAN_PREFERENCES_KEY, {}); }
  savePreferences(preferences: KanbanViewPreferences): void { this.storage.setItem(KANBAN_PREFERENCES_KEY, JSON.stringify(preferences)); }
  listViews(): SavedKanbanView[] { return this.read<SavedKanbanView[]>(KANBAN_SAVED_VIEWS_KEY, []); }
  replaceViews(views: SavedKanbanView[]): void { this.storage.setItem(KANBAN_SAVED_VIEWS_KEY, JSON.stringify(views)); }
  private read<T>(key: string, fallback: T): T { try { const value: unknown = JSON.parse(this.storage.getItem(key) || 'null'); return value === null ? fallback : value as T; } catch { return fallback; } }
}

