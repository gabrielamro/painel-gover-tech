import type { Sprint } from '../../domain/sprint/model';

export class PortfolioAnalyticsService {
  constructor(private readonly sprints: Sprint[]) {}
  byLane(lanes?: Sprint['lane'][]): Sprint[] { return lanes?.length ? this.sprints.filter((sprint) => lanes.includes(sprint.lane)) : this.sprints; }
  countBySystem(lanes?: Sprint['lane'][]): Array<{ system: string; count: number }> {
    const result = new Map<string, number>();
    this.byLane(lanes).forEach((sprint) => { const system = sprint.system || sprint.project.split(/\s+-\s+Sprint\s+/i)[0] || sprint.project; result.set(system, (result.get(system) || 0) + 1); });
    return [...result.entries()].map(([system, count]) => ({ system, count }));
  }
  totalEstimated(lanes?: Sprint['lane'][]): number { return this.byLane(lanes).reduce((total, sprint) => total + Number(sprint.functionPoints || 0), 0); }
  totalDetailed(lanes?: Sprint['lane'][]): number { return this.byLane(lanes).reduce((total, sprint) => total + Number(sprint.detailedFunctionPoints || 0), 0); }
}

