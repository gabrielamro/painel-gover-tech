import { describe, expect, it } from 'vitest';
import { migrateRegistrations } from './registrationMigration';

const storage = (entries: Record<string, string>): { getItem: (key: string) => string | null; setItem: (key: string, value: string) => void } => ({ getItem: (key: string) => entries[key] ?? null, setItem: (key: string, value: string) => { entries[key] = value; } });

describe('migração de cadastros', () => {
  it('consolida fontes antigas sem duplicar nomes', () => {
    const entries: Record<string, string> = { 'painelpro-cadastros': JSON.stringify({ systems: ['SCIEX'], pos: ['Ana'] }), 'painelpro-registrations-react': JSON.stringify({ 'Sistemas / Projetos': [{ name: 'SCIEX' }], POs: [{ name: 'Ana' }] }) };
    const result = migrateRegistrations(storage(entries));
    expect(result.migrated).toBe(true);
    expect(result.state.projects).toHaveLength(1);
    expect(result.state.pos).toHaveLength(1);
    expect(entries['painelpro-registrations']).toContain('SCIEX');
  });

  it('é idempotente quando já existe estado unificado', () => {
    const entries: Record<string, string> = { 'painelpro-registrations': JSON.stringify({ projects: [{ id: 'p1', name: 'MAPI' }], pos: [] }) };
    const result = migrateRegistrations(storage(entries));
    expect(result.migrated).toBe(false);
    expect(result.state.projects[0].name).toBe('MAPI');
  });
});
