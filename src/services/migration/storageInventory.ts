export type StorageEntity = 'sprints' | 'database' | 'registrations' | 'labels' | 'labelColors' | 'systemColors' | 'relationships' | 'improvements' | 'savedViews' | 'preferences';

export interface StorageKeyDefinition {
  key: string;
  entity: StorageEntity;
  source: 'legacy' | 'react';
  migrationRule: string;
}

/** Inventário explícito para impedir migrações implícitas ou destrutivas. */
export const STORAGE_INVENTORY: ReadonlyArray<StorageKeyDefinition> = [
  { key: 'painelpro-sprints', entity: 'sprints', source: 'legacy', migrationRule: 'preservar registros e normalizar campos conhecidos' },
  { key: 'painelpro-db', entity: 'database', source: 'legacy', migrationRule: 'preservar auditoria e dados compatíveis' },
  { key: 'painelpro-cadastros', entity: 'registrations', source: 'legacy', migrationRule: 'consolidar cadastros por ID estável' },
  { key: 'painelpro-labels', entity: 'labels', source: 'legacy', migrationRule: 'consolidar etiquetas sem duplicação' },
  { key: 'painelpro-label-colors', entity: 'labelColors', source: 'legacy', migrationRule: 'associar cor à etiqueta existente' },
  { key: 'painelpro-system-colors', entity: 'systemColors', source: 'legacy', migrationRule: 'associar cor ao projeto/sistema normalizado' },
  { key: 'painelpro-relationships', entity: 'relationships', source: 'legacy', migrationRule: 'validar gerente, PO, projeto e analistas' },
  { key: 'painelpro-pf-improvements', entity: 'improvements', source: 'legacy', migrationRule: 'preservar itens e estado resolvido' },
  { key: 'painelpro-kanban-saved-view', entity: 'savedViews', source: 'legacy', migrationRule: 'preservar visão e filtros' },
  { key: 'painelpro-kanban-preferences', entity: 'preferences', source: 'legacy', migrationRule: 'preservar preferências de apresentação' },
  { key: 'painelpro-registrations-react', entity: 'registrations', source: 'react', migrationRule: 'importar somente registros não duplicados; não usar como fonte final' },
];

export function inventoryForKey(key: string): StorageKeyDefinition | undefined {
  return STORAGE_INVENTORY.find((item) => item.key === key);
}

