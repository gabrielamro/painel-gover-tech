import { describe, expect, it } from 'vitest';
import { LocalStorageViewPreferencesRepository } from './LocalStorageViewPreferencesRepository';

describe('LocalStorageViewPreferencesRepository', () => {
  it('mantém preferências e visões separadas', () => {
    const data = new Map<string, string>();
    const storage = { getItem: (key: string) => data.get(key) ?? null, setItem: (key: string, value: string) => data.set(key, value) };
    const repository = new LocalStorageViewPreferencesRepository(storage);
    repository.savePreferences({ viewMode: 'list', collapsedLanes: ['planning'] });
    repository.replaceViews([{ id: 'v1', name: 'Em desenvolvimento', filters: { lane: 'development' }, createdAt: '2026-09-01' }]);
    expect(repository.getPreferences().viewMode).toBe('list');
    expect(repository.listViews()).toHaveLength(1);
  });
});

