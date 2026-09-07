export interface KanbanViewPreferences {
  collapsedLanes?: string[];
  viewMode?: 'kanban' | 'list';
}

export interface SavedKanbanView {
  id: string;
  name: string;
  filters: Record<string, string | undefined>;
  createdAt: string;
}

export interface ViewPreferencesRepository {
  getPreferences(): KanbanViewPreferences;
  savePreferences(preferences: KanbanViewPreferences): void;
  listViews(): SavedKanbanView[];
  replaceViews(views: SavedKanbanView[]): void;
}

