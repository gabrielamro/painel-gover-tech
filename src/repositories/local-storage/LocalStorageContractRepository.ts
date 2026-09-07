import { DEFAULT_CONTRACTS, type ProjectContract } from '../../domain/contract/model';
import type { ContractRepository } from '../contracts/ContractRepository';

export const CONTRACT_STORAGE_KEY = 'painelpro-contracts';

const memoryStore: Record<string, string> = {};
const fallbackStorage: Pick<Storage, 'getItem' | 'setItem'> = {
  getItem: (key: string) => memoryStore[key] ?? null,
  setItem: (key: string, value: string) => {
    memoryStore[key] = value;
  },
};

function getStorage(): Pick<Storage, 'getItem' | 'setItem'> {
  if (typeof window !== 'undefined' && window.localStorage) {
    return window.localStorage;
  }
  if (typeof globalThis !== 'undefined' && 'localStorage' in globalThis && globalThis.localStorage) {
    return globalThis.localStorage as Pick<Storage, 'getItem' | 'setItem'>;
  }
  return fallbackStorage;
}

export class LocalStorageContractRepository implements ContractRepository {
  private storage: Pick<Storage, 'getItem' | 'setItem'>;

  constructor(storage?: Pick<Storage, 'getItem' | 'setItem'>) {
    this.storage = storage || getStorage();
  }

  list(): ProjectContract[] {
    try {
      const store = this.getSafeStorage();
      const raw = store.getItem(CONTRACT_STORAGE_KEY);
      if (!raw) {
        this.replaceAll(DEFAULT_CONTRACTS);
        return DEFAULT_CONTRACTS;
      }
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed as ProjectContract[];
      }
      return DEFAULT_CONTRACTS;
    } catch {
      return DEFAULT_CONTRACTS;
    }
  }

  save(contract: ProjectContract): void {
    const list = this.list();
    const index = list.findIndex((item) => item.id === contract.id);
    if (index >= 0) {
      list[index] = contract;
    } else {
      list.push(contract);
    }
    this.replaceAll(list);
  }

  remove(id: string): void {
    const list = this.list().filter((item) => item.id !== id);
    this.replaceAll(list);
  }

  replaceAll(contracts: ProjectContract[]): void {
    try {
      const store = this.getSafeStorage();
      store.setItem(CONTRACT_STORAGE_KEY, JSON.stringify(contracts));
    } catch {
      // safe fallback
    }
  }

  private getSafeStorage(): Pick<Storage, 'getItem' | 'setItem'> {
    if (typeof window !== 'undefined' && window.localStorage) {
      return window.localStorage;
    }
    return this.storage || getStorage();
  }
}

export const contractRepository = new LocalStorageContractRepository();
