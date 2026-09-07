import type { AuditAction, Sprint, SprintTask, TaskStatus, TaskActivityLog } from '../domain/sprint/model';
import type { AuditRepository } from '../repositories/contracts/AuditRepository';
import type { SprintRepository } from '../repositories/contracts/SprintRepository';

export class SprintService {
  constructor(
    private readonly repository: SprintRepository,
    private readonly auditRepository?: AuditRepository
  ) {}

  list(): Sprint[] {
    return this.repository.list();
  }

  /** Mantém a cópia local alinhada ao banco remoto, preservando o UUID usado nas atualizações. */
  hydrate(sprints: Sprint[]): Sprint[] {
    this.repository.replaceAll(sprints);
    return this.repository.list();
  }

  create(sprint: Sprint): Sprint[] {
    const next = [
      ...this.repository.list(),
      {
        ...sprint,
        position:
          sprint.position ??
          this.repository.list().filter((item) => item.lane === sprint.lane).length,
      },
    ];
    this.repository.replaceAll(next);
    this.audit(sprint.code, 'SPRINT_CREATED', 'Sprint criada no Kanban.');
    return next;
  }

  update(code: string, changes: Partial<Sprint>): Sprint[] {
    const current = this.repository.list();
    const existing = current.find((sprint) => sprint.code === code);
    if (!existing)
      throw new Error(`Sprint não encontrada: ${code}`);
    const next = current.map((sprint) =>
      sprint.code === code
        ? { ...sprint, ...changes, lastUpdated: new Date().toISOString() }
        : sprint
    );
    this.repository.replaceAll(next);

    // Registro refinado de auditoria
    if (changes.objective !== undefined && changes.objective !== existing.objective) {
      this.audit(
        code,
        'RESUMO_ATUALIZADO',
        `Resumo atualizado de "${(existing.objective || '').slice(0, 40)}" para "${changes.objective.slice(0, 40)}".`
      );
    } else if (
      (changes.project !== undefined && changes.project !== existing.project) ||
      (changes.module !== undefined && changes.module !== existing.module) ||
      (changes.system !== undefined && changes.system !== existing.system)
    ) {
      this.audit(code, 'PROJETO_ALTERADO', `Projeto/Módulo alterado para ${changes.project || changes.system || changes.module}.`);
    } else if (changes.sprintNumber !== undefined && changes.sprintNumber !== existing.sprintNumber) {
      this.audit(code, 'SPRINT_ALTERADA', `Sprint alterada para ${changes.sprintNumber}.`);
    } else if (
      (changes.po !== undefined && changes.po !== existing.po) ||
      (changes.projectManager !== undefined && changes.projectManager !== existing.projectManager) ||
      (changes.manager !== undefined && changes.manager !== existing.manager) ||
      (changes.technicalLead !== undefined && changes.technicalLead !== existing.technicalLead) ||
      (changes.businessAnalyst !== undefined && changes.businessAnalyst !== existing.businessAnalyst)
    ) {
      this.audit(code, 'RESPONSAVEL_ALTERADO', 'Responsáveis da Sprint atualizados.');
    } else if (changes.labels !== undefined) {
      this.audit(code, 'ETIQUETAS_ATUALIZADAS', `Etiquetas atualizadas: ${(changes.labels || []).join(', ')}.`);
    } else {
      this.audit(code, 'SPRINT_UPDATED', 'Dados da Sprint atualizados.');
    }

    return next;
  }

  move(code: string, lane: Sprint['lane']): Sprint[] {
    const sprint = this.requireSprint(code);
    if (sprint.lane === lane) return this.list();
    const next = this.list().map((item) =>
      item.code === code
        ? {
            ...item,
            lane,
            enteredLaneAt: new Date().toISOString(),
            lastUpdated: new Date().toISOString(),
            position: this.list().filter((other) => other.lane === lane).length,
          }
        : item
    );
    this.repository.replaceAll(next);
    this.audit(code, 'SPRINT_MOVED', `Sprint movida para ${lane}.`);
    return next;
  }

  reorder(code: string, overCode: string | undefined, lane: Sprint['lane']): Sprint[] {
    const current = this.list();
    this.requireSprint(code);
    const laneItems = current
      .filter((item) => item.lane === lane && item.code !== code)
      .sort((a, b) => (a.position ?? 0) - (b.position ?? 0));
    const index = overCode
      ? Math.max(0, laneItems.findIndex((item) => item.code === overCode))
      : laneItems.length;
    laneItems.splice(
      index < 0 ? laneItems.length : index,
      0,
      current.find((item) => item.code === code)!
    );
    const positions = new Map(laneItems.map((item, itemIndex) => [item.code, itemIndex]));
    const next = current.map((item) =>
      item.lane === lane
        ? { ...item, position: positions.get(item.code) ?? item.position }
        : item
    );
    this.repository.replaceAll(next);
    this.audit(code, 'SPRINT_REORDERED', 'Ordem da Sprint atualizada na raia.');
    return next;
  }

  createTask(code: string, task: SprintTask): Sprint[] {
    const sprint = this.requireSprint(code);
    const now = new Date().toISOString();
    const initialLog: TaskActivityLog = {
      id: `LOG-${Date.now()}`,
      fromStatus: 'Criada',
      toStatus: task.status || 'A Fazer',
      timestamp: now,
      user: 'Camila Pereira',
      type: 'CREATE',
      note: 'Tarefa criada na Sprint.',
    };

    const nextTasks = [
      ...(sprint.taskItems || []),
      {
        ...task,
        reworkCount: task.reworkCount || 0,
        estimatedDevHours: task.estimatedDevHours || 0,
        realizedDevHours: task.realizedDevHours || 0,
        estimatedQaHours: task.estimatedQaHours || 0,
        realizedQaHours: task.realizedQaHours || 0,
        checklist: task.checklist || [],
        assignees: task.assignees || (task.owner ? [{ id: task.ownerId || task.owner, name: task.owner, role: task.ownerRole }] : []),
        history: [...(task.history || []), initialLog],
        createdAt: now,
        updatedAt: now,
      },
    ];
    return this.saveTasks(code, nextTasks, 'TASK_CREATED', `Task criada: ${task.title}.`);
  }

  updateTask(code: string, taskId: string, changes: Partial<SprintTask>): Sprint[] {
    const sprint = this.requireSprint(code);
    const task = (sprint.taskItems || []).find((item) => item.id === taskId);
    if (!task) throw new Error(`Task não encontrada: ${taskId}`);
    return this.saveTasks(
      code,
      (sprint.taskItems || []).map((item) =>
        item.id === taskId ? { ...item, ...changes, updatedAt: new Date().toISOString() } : item
      ),
      'TASK_UPDATED',
      `Task atualizada: ${task.title}.`
    );
  }

  moveTask(code: string, taskId: string, status: TaskStatus, note?: string, hoursLogged?: number): Sprint[] {
    const sprint = this.requireSprint(code);
    const task = (sprint.taskItems || []).find((item) => item.id === taskId);
    if (!task) throw new Error(`Task não encontrada: ${taskId}`);

    const now = new Date().toISOString();
    const fromStatus = task.status;
    const isReproval = status === 'Em Correção' && fromStatus === 'Em Teste';
    const isReopen = isReproval || (status === 'Em Desenvolvimento' && fromStatus === 'Concluída');

    const activityLog: TaskActivityLog = {
      id: `LOG-${Date.now()}`,
      fromStatus,
      toStatus: status,
      timestamp: now,
      user: 'Camila Pereira',
      note,
      hoursLogged,
      type: isReproval ? 'BUG_REPORT' : isReopen ? 'REOPEN' : 'MOVE',
    };

    const nextTasks = (sprint.taskItems || []).map((item) => {
      if (item.id !== taskId) return item;

      const reworkCount = (item.reworkCount || 0) + (isReproval ? 1 : 0);
      const updatedItem: SprintTask = {
        ...item,
        status,
        reworkCount,
        rejectionReason: isReproval ? note || item.rejectionReason : item.rejectionReason,
        startDate: status === 'Em Desenvolvimento' && !item.startDate ? now : item.startDate,
        devCompletedAt: status === 'Em Teste' ? now : item.devCompletedAt,
        qaStartedAt: status === 'Em Teste' && !item.qaStartedAt ? now : item.qaStartedAt,
        completedAt: status === 'Concluída' ? now : item.completedAt,
        history: [...(item.history || []), activityLog],
        updatedAt: now,
      };

      // Apontamento de horas nas transições
      if (hoursLogged) {
        if (fromStatus === 'Em Desenvolvimento') {
          updatedItem.realizedDevHours = (updatedItem.realizedDevHours || 0) + hoursLogged;
        } else if (fromStatus === 'Em Teste') {
          updatedItem.realizedQaHours = (updatedItem.realizedQaHours || 0) + hoursLogged;
        }
      }

      return updatedItem;
    });

    return this.saveTasks(code, nextTasks, 'TASK_MOVED', `Task movida para ${status}: ${task.title}.`);
  }

  deleteTask(code: string, taskId: string): Sprint[] {
    const sprint = this.requireSprint(code);
    const task = (sprint.taskItems || []).find((item) => item.id === taskId);
    if (!task) throw new Error(`Task não encontrada: ${taskId}`);
    return this.saveTasks(
      code,
      (sprint.taskItems || []).filter((item) => item.id !== taskId),
      'TASK_DELETED',
      `Task removida: ${task.title}.`
    );
  }

  private saveTasks(
    code: string,
    taskItems: SprintTask[],
    action: AuditAction,
    message: string
  ): Sprint[] {
    const totalPoints = taskItems.reduce((total, item) => total + (item.points || 0), 0);
    const completedPoints = taskItems
      .filter((item) => item.status === 'Concluída')
      .reduce((total, item) => total + (item.points || 0), 0);
    const next = this.list().map((sprint) =>
      sprint.code === code
        ? {
            ...sprint,
            taskItems,
            tasks: taskItems.length,
            completedTasks: taskItems.filter((item) => item.status === 'Concluída').length,
            blocked: taskItems.filter((item) => item.status === 'Bloqueada' || item.isBlocked).length,
            deliveries: taskItems.filter((item) => item.status === 'Concluída').length,
            progress:
              totalPoints > 0
                ? Math.round((completedPoints / totalPoints) * 100)
                : sprint.progress,
            lastUpdated: new Date().toISOString(),
          }
        : sprint
    );
    this.repository.replaceAll(next);
    this.audit(code, action, message);
    return next;
  }

  private requireSprint(code: string): Sprint {
    const sprint = this.list().find((item) => item.code === code);
    if (!sprint) throw new Error(`Sprint não encontrada: ${code}`);
    return sprint;
  }

  private audit(entityId: string, action: AuditAction, message: string): void {
    this.auditRepository?.append({
      id: `${entityId}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      entityId,
      action,
      message,
      user: 'Camila Pereira',
      createdAt: new Date().toISOString(),
    });
  }
}
