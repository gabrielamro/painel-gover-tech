import { describe, expect, it } from 'vitest';
import { LocalStorageRegistrationRepository, REGISTRATION_STORAGE_KEY } from './LocalStorageRegistrationRepository';
import type { RegistryState } from '../contracts/RegistrationRepository';

function storage() {
  const values = new Map<string, string>();
  return { getItem: (key: string) => values.get(key) ?? null, setItem: (key: string, value: string) => values.set(key, value) };
}

describe('LocalStorageRegistrationRepository', () => {
  it('retorna coleções vazias quando não há cadastro', () => {
    expect(new LocalStorageRegistrationRepository(storage()).list('projects')).toEqual([]);
  });

  it('persiste e lê o estado unificado', () => {
    const fakeStorage = storage();
    const repository = new LocalStorageRegistrationRepository(fakeStorage);
    const state = {
      projects: [{ id: 'p1', name: 'SCIEX', color: '#002FA7' }],
      pos: [],
      managers: [],
      cgticAnalysts: [],
      businessAnalysts: [],
      priorities: [],
      labels: [],
      teamMembers: [],
    } as RegistryState;
    repository.replaceAll(state);
    expect(fakeStorage.getItem(REGISTRATION_STORAGE_KEY)).toContain('SCIEX');
    expect(repository.list('projects')).toEqual(state.projects);
  });

  it('funde os cadastros duplicados de William e preserva os vínculos', () => {
    const fakeStorage = storage();
    const repository = new LocalStorageRegistrationRepository(fakeStorage);
    repository.replaceAll({
      projects: [{ id: 'p1', name: 'SCIEX', color: '#002FA7', projectManagerId: 'manager-short' }],
      modules: [],
      pos: [{ id: 'po1', name: 'Ana', projectManagerId: 'manager-full' }],
      managers: [
        { id: 'manager-short', name: 'William' },
        { id: 'manager-full', name: "William D'Angelo" },
      ],
      cgticAnalysts: [],
      businessAnalysts: [],
      priorities: [],
      labels: [],
      teamMembers: [],
    });

    expect(repository.list('managers')).toEqual([
      expect.objectContaining({ id: 'manager-full', name: "William D'Angelo" }),
    ]);
    expect(repository.list('projects')[0]).toEqual(
      expect.objectContaining({ projectManagerId: 'manager-full' })
    );
    expect(repository.list('pos')[0]).toEqual(
      expect.objectContaining({ projectManagerId: 'manager-full' })
    );
  });
});
