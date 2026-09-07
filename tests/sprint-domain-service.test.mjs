import assert from 'node:assert/strict';
import { createTasks, SprintProgressService, SprintHealthService, syncSprintDerived } from '../frontend/services/sprint-domain-service.js';

const sprint = { code: 'SPR-TEST', progress: 40, expectedProgress: 70, blocked: 1, impediments: 0, risks: 0, health: undefined };
const tasks = createTasks(sprint);
assert.equal(tasks.length, 4);
assert.equal(tasks[0].status, 'Concluída');

const hydrated = syncSprintDerived([{ ...sprint, taskItems: tasks.map((task, index) => ({ ...task, status: index === 0 ? 'Concluída' : 'A Fazer' })) }])[0];
assert.equal(hydrated.metrics.actualProgress, 28);
assert.equal(SprintHealthService.calculate(hydrated).status, 'WARNING');
assert.equal(SprintProgressService.calculate(hydrated).isLate, true);

console.log('sprint domain service tests passed');
