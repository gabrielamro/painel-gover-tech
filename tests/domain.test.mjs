import assert from 'node:assert/strict';
import { AnalyticsService, HealthService, PfForecastService, ProgressService, StatusService } from '../domain.js';

const sprint = { code: 'SPR-TEST', lane: 'active', progress: 40, blocked: 2, impediments: 1, risks: 2, taskItems: [{ points: 5, status: 'Concluída' }, { points: 5, status: 'Bloqueada' }] };
const metrics = ProgressService.calculate(sprint);
assert.equal(metrics.actualProgress, 50);
assert.equal(metrics.deviation, -20);
assert.equal(HealthService.calculate(sprint, metrics).status, 'WARNING');
assert.equal(StatusService.suggested(sprint), 'development');
assert.equal(AnalyticsService.summarize([sprint]).counts.critical || 0, 0);

const pfSummary = PfForecastService.summarize([
  { billingForecastMonth: '2026-08', lane: 'development', functionPoints: 10 },
  { billingForecastMonth: '2026-08', lane: 'billing', functionPoints: 20, detailedFunctionPoints: 24 },
  { billingForecastMonth: '2026-08', lane: 'completed', functionPoints: 15, detailedFunctionPoints: 12 },
  { billingForecastMonth: '2026-09', lane: 'billing', functionPoints: 99, detailedFunctionPoints: 99 },
], '2026-08');
assert.equal(pfSummary.estimatedPf, 45);
assert.equal(pfSummary.comparableEstimatedPf, 35);
assert.equal(pfSummary.detailedPf, 36);
assert.equal(pfSummary.deltaPf, 1);
assert.equal(pfSummary.waitingPf, 24);
assert.equal(pfSummary.invoicedPf, 12);
console.log('domain tests passed');
