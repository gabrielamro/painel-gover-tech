// Domínio local-first do PainelPro. Esta camada pode ser trocada por API/ORM sem alterar os componentes.
export const ENTITY_NAMES = ['User', 'Project', 'Sprint', 'Task', 'Delivery', 'Impediment', 'Risk', 'Comment', 'SprintMetric', 'Alert', 'Decision', 'AuditLog'];
export const TASK_STATUSES = ['A Fazer', 'Em Andamento', 'Bloqueada', 'Concluída'];
export const ALERT_TYPES = ['SPRINT_LATE', 'PROGRESS_BELOW_EXPECTED', 'BLOCKED_TASK', 'MULTIPLE_BLOCKERS', 'CRITICAL_RISK', 'DELIVERY_AT_RISK', 'DELIVERY_LATE', 'SPRINT_ENDING_SOON', 'STATUS_HEALTH_DIVERGENCE'];

const uid = (prefix) => `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
const safeParse = (value, fallback) => { try { return value ? JSON.parse(value) : fallback; } catch { return fallback; } };

export const LocalRepository = {
  load() { return safeParse(localStorage.getItem('painelpro-db'), { auditLogs: [], decisions: [], alerts: [] }); },
  save(database) { localStorage.setItem('painelpro-db', JSON.stringify(database)); return database; },
  insert(table, record) { const database = this.load(); database[table] ||= []; database[table].push({ id: uid(table.slice(0, 3).toUpperCase()), createdAt: new Date().toISOString(), ...record }); this.save(database); return database[table].at(-1); },
};

export const ProgressService = {
  calculate(sprint) { const tasks = sprint.taskItems || []; const points = tasks.reduce((sum, task) => sum + (task.points || 0), 0); const completed = tasks.filter((task) => task.status === 'Concluída').reduce((sum, task) => sum + (task.points || 0), 0); const actualProgress = points ? Math.round((completed / points) * 100) : sprint.progress || 0; const expectedProgress = sprint.expectedProgress ?? 70; return { expectedProgress, actualProgress, deviation: actualProgress - expectedProgress, timeConsumed: 70, daysRemaining: 3, isLate: actualProgress < expectedProgress - 10 }; },
};

export const HealthService = {
  calculate(sprint, metrics = ProgressService.calculate(sprint)) { const score = Math.max(0, Math.min(100, Math.round(100 - Math.max(0, -metrics.deviation) * .35 - (sprint.blocked || 0) * 6 - (sprint.impediments || 0) * 5 - (sprint.risks || 0) * 4))); const status = score >= 80 ? 'HEALTHY' : score >= 60 ? 'WARNING' : 'CRITICAL'; return { score, status, reasons: [metrics.deviation < -10 && 'Progresso abaixo do esperado', sprint.blocked > 0 && `${sprint.blocked} tasks bloqueadas`, sprint.risks > 1 && `${sprint.risks} riscos ativos`].filter(Boolean), recommendations: status === 'CRITICAL' ? ['Escalonar impedimentos críticos', 'Revisar plano de entrega'] : [] }; },
};

export const StatusService = { suggested(sprint) { const health = HealthService.calculate(sprint); if (sprint.progress >= 100) return 'approved'; if (sprint.progress === 0) return 'planning'; if (health.status === 'CRITICAL' || health.status === 'WARNING') return 'development'; return 'development'; }, divergence(sprint) { const suggested = this.suggested(sprint); return suggested !== sprint.lane ? { manual: sprint.lane, suggested, message: 'Status manual divergente da análise automática' } : null; } };
export const AlertService = { evaluate(sprint) { const metrics = ProgressService.calculate(sprint); const alerts = []; if (metrics.isLate) alerts.push({ type: 'PROGRESS_BELOW_EXPECTED', severity: 'HIGH' }); if (sprint.blocked > 0) alerts.push({ type: 'BLOCKED_TASK', severity: sprint.blocked > 1 ? 'CRITICAL' : 'MEDIUM' }); if (sprint.risks > 1) alerts.push({ type: 'CRITICAL_RISK', severity: 'HIGH' }); const divergence = StatusService.divergence(sprint); if (divergence) alerts.push({ type: 'STATUS_HEALTH_DIVERGENCE', severity: 'MEDIUM' }); return alerts.map((alert) => ({ id: uid('ALT'), sprintId: sprint.code, createdAt: new Date().toISOString(), ...alert })); } };
export const AnalyticsService = { summarize(sprints) { const counts = Object.fromEntries(['planned', 'planning', 'development', 'homologation', 'approved', 'billing', 'completed'].map((lane) => [lane, sprints.filter((sprint) => sprint.lane === lane).length])); const totalTasks = sprints.reduce((sum, sprint) => sum + (sprint.tasks || 0), 0); return { totalSprints: sprints.length, plannedSprints: counts.planned, planningSprints: counts.planning, developmentSprints: counts.development, homologationSprints: counts.homologation, approvedSprints: counts.approved, billingSprints: counts.billing, completedSprints: counts.completed, overallProgress: sprints.length ? Math.round(sprints.reduce((sum, sprint) => sum + (sprint.progress || 0), 0) / sprints.length) : 0, totalTasks, blockedTasks: sprints.reduce((sum, sprint) => sum + (sprint.blocked || 0), 0), impediments: sprints.reduce((sum, sprint) => sum + (sprint.impediments || 0), 0), risks: sprints.reduce((sum, sprint) => sum + (sprint.risks || 0), 0), deliveries: sprints.reduce((sum, sprint) => sum + (sprint.deliveries || 0), 0), counts }; } };

// Fonte única dos indicadores financeiros da OS. A Sprint representa a OS nesta versão local-first.
export const PfForecastService = {
  normalizeMonth(value, fallback = new Date()) {
    if (/^\d{4}-\d{2}$/.test(String(value || ''))) return String(value);
    return `${fallback.getFullYear()}-${String(fallback.getMonth() + 1).padStart(2, '0')}`;
  },
  estimated(sprint) { return Math.max(0, Number(sprint.functionPoints || 0)); },
  detailed(sprint) { return Math.max(0, Number(sprint.detailedFunctionPoints || 0)); },
  summarize(sprints, month) {
    const selected = sprints.filter((sprint) => sprint.billingForecastMonth === month);
    const invoiced = selected.filter((sprint) => sprint.lane === 'completed');
    const waiting = selected.filter((sprint) => sprint.lane === 'billing');
    const detailedEligible = selected.filter((sprint) => ['billing', 'completed'].includes(sprint.lane));
    const estimatedPf = selected.reduce((sum, sprint) => sum + this.estimated(sprint), 0);
    const detailedPf = detailedEligible.reduce((sum, sprint) => sum + (this.detailed(sprint) || this.estimated(sprint)), 0);
    const comparableEstimatedPf = detailedEligible.reduce((sum, sprint) => sum + this.estimated(sprint), 0);
    const deltaPf = detailedPf - comparableEstimatedPf;
    return {
      selected,
      estimatedPf,
      detailedPf,
      comparableEstimatedPf,
      deltaPf,
      deltaPercent: comparableEstimatedPf ? (deltaPf / comparableEstimatedPf) * 100 : 0,
      developmentCount: selected.filter((sprint) => sprint.lane === 'development').length,
      deliveredCount: selected.filter((sprint) => ['approved', 'billing', 'completed'].includes(sprint.lane)).length,
      waitingPf: waiting.reduce((sum, sprint) => sum + (this.detailed(sprint) || this.estimated(sprint)), 0),
      invoicedPf: invoiced.reduce((sum, sprint) => sum + (this.detailed(sprint) || this.estimated(sprint)), 0),
    };
  },
};
export const AuditService = { log(action, entity, entityId, details = {}) { return LocalRepository.insert('auditLogs', { action, entity, entityId, details, user: 'Camila Pereira' }); } };
export const DecisionService = { create(input) { return LocalRepository.insert('decisions', { ...input, createdBy: 'Camila Pereira' }); } };
