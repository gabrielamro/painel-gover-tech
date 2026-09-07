import { describe, expect, it } from 'vitest';
import type { Sprint } from '../domain/sprint/model';
import type { SprintRepository } from '../repositories/contracts/SprintRepository';
import type { AuditRepository } from '../repositories/contracts/AuditRepository';
import type { AuditLog } from '../domain/sprint/model';
import { SprintService } from './SprintService';
class MemorySprintRepository implements SprintRepository { constructor(private value: Sprint[]) {} list() { return this.value; } replaceAll(sprints: Sprint[]) { this.value = sprints; } }
class MemoryAuditRepository implements AuditRepository { logs: AuditLog[] = []; listFor(entityId: string) { return this.logs.filter((log) => log.entityId === entityId); } append(log: AuditLog) { this.logs.push(log); } }
const sprint: Sprint = { code: 'SPR-01', system: 'SCIEX', project: 'SCIEX - Sprint 10', objective: 'Entrega', lane: 'development', progress: 50, health: 90 };
describe('SprintService', () => {
  it('sincroniza a cópia local com os identificadores do banco remoto', () => {
    const repository = new MemorySprintRepository([]);
    const service = new SprintService(repository);
    const remoteSprint = { ...sprint, id: 'a0f7f4cd-2a5b-4b20-8e8b-10d9ac1c7b87' };

    const result = service.hydrate([remoteSprint]);

    expect(result[0].id).toBe(remoteSprint.id);
    expect(repository.list()[0].id).toBe(remoteSprint.id);
  });

  it('atualiza uma Sprint', () => { const service = new SprintService(new MemorySprintRepository([sprint])); expect(service.update('SPR-01', { progress: 75 })[0].progress).toBe(75); });
  it('falha ao atualizar uma Sprint inexistente', () => { const service = new SprintService(new MemorySprintRepository([])); expect(() => service.update('inexistente', { progress: 10 })).toThrow('Sprint não encontrada'); });
  it('calcula o progresso a partir dos pontos de Tasks concluídas', () => { const service = new SprintService(new MemorySprintRepository([sprint])); const result = service.createTask('SPR-01', { id: 'TASK-1', title: 'Construir', points: 3, status: 'Concluída' }); service.createTask('SPR-01', { id: 'TASK-2', title: 'Validar', points: 1, status: 'A Fazer' }); expect(result[0].progress).toBe(100); expect(service.list()[0].progress).toBe(75); });
  it('move a Sprint e registra a nova raia', () => { const service = new SprintService(new MemorySprintRepository([sprint])); expect(service.move('SPR-01', 'homologation')[0].lane).toBe('homologation'); });
  it('recalcula bloqueios e registra a auditoria ao mover uma Task', () => { const audit = new MemoryAuditRepository(); const service = new SprintService(new MemorySprintRepository([{ ...sprint, taskItems: [{ id: 'TASK-1', title: 'Construir', points: 5, status: 'A Fazer' }] }]), audit); service.moveTask('SPR-01', 'TASK-1', 'Bloqueada'); const logs = audit.listFor('SPR-01'); expect(service.list()[0].blocked).toBe(1); expect(logs[logs.length - 1]?.action).toBe('TASK_MOVED'); });
  it('preserva uma ordem manual dentro da raia', () => { const second = { ...sprint, code: 'SPR-02', position: 1 }; const service = new SprintService(new MemorySprintRepository([{ ...sprint, position: 0 }, second])); service.reorder('SPR-02', 'SPR-01', 'development'); expect(service.list().find((item) => item.code === 'SPR-02')?.position).toBe(0); });
  it('registra criação e edição de Sprint', () => { const audit = new MemoryAuditRepository(); const service = new SprintService(new MemorySprintRepository([]), audit); service.create(sprint); service.update('SPR-01', { functionPoints: 10 }); expect(audit.listFor('SPR-01').map((entry) => entry.action)).toEqual(['SPRINT_CREATED', 'SPRINT_UPDATED']); });
  it('registra eventos específicos de auditoria conforme o campo alterado', () => {
    const audit = new MemoryAuditRepository();
    const service = new SprintService(new MemorySprintRepository([sprint]), audit);
    service.update('SPR-01', { objective: 'Novo objetivo da OS' });
    service.update('SPR-01', { project: 'SIMNAC', system: 'SIMNAC' });
    service.update('SPR-01', { sprintNumber: 12 });
    service.update('SPR-01', { po: 'Camila Pereira' });
    service.update('SPR-01', { labels: ['Frontend', 'API'] });

    const actions = audit.listFor('SPR-01').map((e) => e.action);
    expect(actions).toEqual([
      'RESUMO_ATUALIZADO',
      'PROJETO_ALTERADO',
      'SPRINT_ALTERADA',
      'RESPONSAVEL_ALTERADO',
      'ETIQUETAS_ATUALIZADAS',
    ]);
  });
});
