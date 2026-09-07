import type { AuditLog } from '../../domain/sprint/model';
import type { AuditRepository } from '../contracts/AuditRepository';

const LEGACY_DATABASE_KEY = 'painelpro-db';

export class LocalStorageAuditRepository implements AuditRepository {
  constructor(private readonly storage: Pick<Storage, 'getItem' | 'setItem'> = window.localStorage) {}

  listFor(entityId: string): AuditLog[] {
    const database = this.readDatabase();
    const logs = Array.isArray(database.auditLogs) ? database.auditLogs : [];
    return logs.filter((log): log is AuditLog => Boolean(log && typeof log === 'object' && (log as AuditLog).entityId === entityId))
      .sort((left, right) => right.createdAt.localeCompare(left.createdAt));
  }

  append(log: AuditLog): void {
    const database = this.readDatabase();
    const logs = Array.isArray(database.auditLogs) ? database.auditLogs : [];
    this.storage.setItem(LEGACY_DATABASE_KEY, JSON.stringify({ ...database, auditLogs: [...logs, log] }));
  }

  private readDatabase(): Record<string, unknown> {
    try {
      const parsed: unknown = JSON.parse(this.storage.getItem(LEGACY_DATABASE_KEY) || '{}');
      return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed as Record<string, unknown> : {};
    } catch { return {}; }
  }
}
