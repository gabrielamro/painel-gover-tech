export const TASK_STATUSES = ['A Fazer', 'Em Andamento', 'Bloqueada', 'Concluída'];

const taskTemplates = ['Mapear contratos da integração', 'Implementar autenticação', 'Validar fluxo com usuário', 'Documentar endpoint'];

export const createTasks = (sprint) => taskTemplates.map((title, index) => ({
  id: `T${String(67 + index).padStart(3, '0')}`,
  title,
  owner: ['Lucas A.', 'Mariana C.', 'Rafael L.', 'Ana P.'][index],
  status: index < Math.round(sprint.progress / 25) ? 'Concluída' : index === Math.round(sprint.progress / 25) ? 'Em Andamento' : index < Math.round(sprint.progress / 25) + sprint.blocked ? 'Bloqueada' : 'A Fazer',
  points: [5, 8, 3, 2][index],
}));

export const SprintProgressService = {
  calculate(sprint) {
    const tasks = sprint.taskItems || [];
    const totalPoints = tasks.reduce((sum, task) => sum + task.points, 0);
    const donePoints = tasks.filter((task) => task.status === 'Concluída').reduce((sum, task) => sum + task.points, 0);
    const actualProgress = totalPoints ? Math.round((donePoints / totalPoints) * 100) : sprint.progress;
    const expectedProgress = sprint.expectedProgress ?? 70;
    return { expectedProgress, actualProgress, deviation: actualProgress - expectedProgress, timeConsumed: 70, daysRemaining: 3, isLate: actualProgress < expectedProgress - 10 };
  },
};

export const SprintHealthService = {
  calculate(sprint, metrics = SprintProgressService.calculate(sprint)) {
    const score = Math.max(0, Math.min(100, Math.round(100 - Math.max(0, -metrics.deviation) * 0.35 - sprint.blocked * 6 - sprint.impediments * 5 - sprint.risks * 4)));
    const finalScore = sprint.health ?? score;
    return { score: finalScore, status: finalScore >= 80 ? 'HEALTHY' : finalScore >= 60 ? 'WARNING' : 'CRITICAL', reasons: [metrics.deviation < -10 ? 'Progresso abaixo do esperado' : '', sprint.blocked ? `${sprint.blocked} tasks bloqueadas` : '', sprint.risks > 1 ? `${sprint.risks} riscos ativos` : ''].filter(Boolean), recommendations: metrics.deviation < -10 ? ['Revisar impedimentos e plano de entrega'] : [] };
  },
};

export const SprintAlertService = { list(data) { return data.flatMap((sprint) => [{ type: sprint.health < 60 ? 'CRITICAL_RISK' : 'PROGRESS_BELOW_EXPECTED', sprint }]).filter((alert) => alert.sprint.health < 60 || alert.sprint.blocked > 1); } };

export function syncSprintDerived(sprints) {
  sprints.forEach((sprint) => {
    if (!sprint.taskItems) sprint.taskItems = createTasks(sprint);
    sprint.metrics = SprintProgressService.calculate(sprint);
    sprint.healthAnalysis = SprintHealthService.calculate(sprint, sprint.metrics);
  });
  return sprints;
}

