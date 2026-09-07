import { createContext, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import type { AuditLog, Lane, Sprint, SprintTask, TaskStatus } from '../../domain/sprint/model';
import { LocalStorageAuditRepository } from '../../repositories/local-storage/LocalStorageAuditRepository';
import { LocalStorageSprintRepository, SPRINT_STORAGE_KEY } from '../../repositories/local-storage/LocalStorageSprintRepository';
import { SprintService } from '../../services/SprintService';
import { loadSupabaseSprints, saveSupabaseSprintPositions } from '../../services/supabase/SupabaseSprintRepository';

interface SprintContextValue {
  sprints: Sprint[];
  createSprint: (sprint: Sprint) => void;
  updateSprint: (code: string, changes: Partial<Sprint>) => void;
  moveSprint: (code: string, lane: Lane) => void;
  reorderSprint: (code: string, overCode: string | undefined, lane: Lane) => void;
  createTask: (code: string, task: SprintTask) => void;
  updateTask: (code: string, taskId: string, changes: Partial<SprintTask>) => void;
  moveTask: (code: string, taskId: string, status: TaskStatus, note?: string, hoursLogged?: number) => void;
  deleteTask: (code: string, taskId: string) => void;
  auditLogs: (code: string) => AuditLog[];
}

const SprintContext = createContext<SprintContextValue | null>(null);

export function SprintProvider({ children }: { children: ReactNode }) {
  const service = useMemo(
    () => new SprintService(new LocalStorageSprintRepository(), new LocalStorageAuditRepository()),
    []
  );
  const [sprints, setSprints] = useState<Sprint[]>(() => service.list());
  const remoteWriteQueue = useRef(Promise.resolve());

  const persistRemotePositions = (items: Sprint[]) => {
    remoteWriteQueue.current = remoteWriteQueue.current
      .then(() => saveSupabaseSprintPositions(items))
      .then(() => undefined)
      .catch((error: unknown) => {
        // O armazenamento local continua como fallback quando não há sessão ou conexão.
        console.warn('Não foi possível salvar a movimentação no Supabase.', error);
      });
  };

  useEffect(() => {
    const refresh = () => setSprints(service.list());
    const onStorage = (event: StorageEvent) => {
      if (!event.key || [SPRINT_STORAGE_KEY, 'painelpro-db'].includes(event.key)) refresh();
    };
    window.addEventListener('storage', onStorage);
    window.addEventListener('focus', refresh);
    loadSupabaseSprints()
      .then((remoteSprints) => {
        if (remoteSprints) setSprints(service.hydrate(remoteSprints));
      })
      .catch(() => {
        // Modo local continua disponível
      });
    return () => {
      window.removeEventListener('storage', onStorage);
      window.removeEventListener('focus', refresh);
    };
  }, [service]);

  const value = useMemo<SprintContextValue>(
    () => ({
      sprints,
      createSprint: (sprint) => setSprints(service.create(sprint)),
      updateSprint: (code, changes) => setSprints(service.update(code, changes)),
      moveSprint: (code, lane) => {
        const next = service.move(code, lane);
        setSprints(next);
        persistRemotePositions(next.filter((sprint) => sprint.code === code));
      },
      reorderSprint: (code, overCode, lane) => {
        const next = service.reorder(code, overCode, lane);
        setSprints(next);
        persistRemotePositions(next.filter((sprint) => sprint.lane === lane));
      },
      createTask: (code, task) => setSprints(service.createTask(code, task)),
      updateTask: (code, taskId, changes) => setSprints(service.updateTask(code, taskId, changes)),
      moveTask: (code, taskId, status, note, hoursLogged) =>
        setSprints(service.moveTask(code, taskId, status, note, hoursLogged)),
      deleteTask: (code, taskId) => setSprints(service.deleteTask(code, taskId)),
      auditLogs: (code) => new LocalStorageAuditRepository().listFor(code),
    }),
    [service, sprints]
  );

  return <SprintContext.Provider value={value}>{children}</SprintContext.Provider>;
}

export function useSprints(): SprintContextValue {
  const context = useContext(SprintContext);
  if (!context) throw new Error('useSprints deve ser utilizado dentro de SprintProvider.');
  return context;
}
