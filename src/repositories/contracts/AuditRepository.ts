import type { AuditLog } from '../../domain/sprint/model';

export interface AuditRepository {
  listFor(entityId: string): AuditLog[];
  append(log: AuditLog): void;
}
