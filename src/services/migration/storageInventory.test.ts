import { describe, expect, it } from 'vitest';
import { inventoryForKey, STORAGE_INVENTORY } from './storageInventory';

describe('inventário de armazenamento', () => {
  it('mapeia as chaves críticas sem duplicação de definição', () => {
    const keys = STORAGE_INVENTORY.map((item) => item.key);
    expect(new Set(keys).size).toBe(keys.length);
    expect(inventoryForKey('painelpro-sprints')?.entity).toBe('sprints');
    expect(inventoryForKey('painelpro-registrations-react')?.source).toBe('react');
  });
});
