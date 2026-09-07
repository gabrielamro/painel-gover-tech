import type { CSSProperties } from 'react';
import type { Sprint } from '../../../domain/sprint/model';
import { LANES } from '../../../domain/sprint/model';
import { sprintSystem } from '../../../domain/sprint/queries';
import { formatPF } from '../../../domain/billing/format';

interface Props {
  sprints: Sprint[];
  monthLabel: string;
  getSystemColor: (system: string) => string;
  onOpenSprint: (sprint: Sprint) => void;
}

const LANE_COLORS: Record<string, string> = {
  planning: '#94a3b8',
  planned: '#60a5fa',
  development: '#2563eb',
  homologation: '#7c3aed',
  approved: '#16a34a',
  billing: '#d97706',
  completed: '#0f766e',
};

export function PfLaneGrid({
  sprints,
  monthLabel,
  getSystemColor,
  onOpenSprint,
}: Props) {
  const laneColumns = LANES.map((lane) => ({
    ...lane,
    sprints: sprints.filter((s) => s.lane === lane.id),
  }));

  const hasAnySprints = sprints.length > 0;

  return (
    <section className="pf-panel pf-os-section">
      <header className="pf-panel__header">
        <div className="pf-panel__title-group">
          <span className="pf-panel__eyebrow">PREVISÃO POR OS</span>
          <h2 className="pf-panel__title">OSs previstas para {monthLabel}</h2>
        </div>
        <span className="pf-panel__count-badge">
          {sprints.length} OS{sprints.length !== 1 ? 's' : ''}
        </span>
      </header>

      {hasAnySprints ? (
        <div className="pf-lane-grid">
          {laneColumns.map((lane) => {
            const laneColor = LANE_COLORS[lane.id] || '#64748b';

            return (
              <section key={lane.id} className="pf-lane">
                <header className="pf-lane__head">
                  <span
                    className="pf-lane__dot"
                    style={{ background: laneColor }}
                  />
                  <strong className="pf-lane__title">{lane.label}</strong>
                  <span className="pf-lane__count">{lane.sprints.length}</span>
                </header>

                <div className="pf-lane__cards">
                  {lane.sprints.length > 0 ? (
                    lane.sprints.map((sprint) => {
                      const system = sprintSystem(sprint);
                      const color = getSystemColor(system);
                      const detailed = Number(sprint.detailedFunctionPoints || 0);
                      const estimated = Number(sprint.functionPoints || 0);
                      const progress = Math.max(0, Math.min(100, Math.round(sprint.progress || 0)));
                      const sprintLabel = sprint.sprintNumber
                        ? `Sprint ${sprint.sprintNumber}`
                        : sprint.code;

                      return (
                        <button
                          key={sprint.code}
                          type="button"
                          className="pf-os-card"
                          style={{ '--system-color': color } as CSSProperties}
                          onClick={() => onOpenSprint(sprint)}
                          title="Clique para ver os detalhes da Sprint"
                        >
                          <div className="pf-os-card__head">
                            <span className="pf-os-card__system">{system}</span>
                            <strong className="pf-os-card__os">
                              {sprint.serviceOrder || sprint.code}
                            </strong>
                          </div>

                          <span className="pf-os-card__sprint">{sprintLabel}</span>
                          <h4 className="pf-os-card__title" title={sprint.objective}>
                            {sprint.objective}
                          </h4>

                          <div className="pf-os-card__values">
                            <div className="pf-os-card__val-box">
                              <small>PF estimado</small>
                              <strong>{formatPF(estimated)}</strong>
                            </div>
                            <div className="pf-os-card__val-box">
                              <small>PF detalhado</small>
                              <strong>{formatPF(detailed)}</strong>
                            </div>
                          </div>

                          <div className="pf-os-card__foot">
                            <span>{monthLabel}</span>
                            <span className="pf-os-card__progress-val">{progress}%</span>
                          </div>

                          <div className="pf-os-card__track">
                            <div
                              className="pf-os-card__bar"
                              style={{ width: `${progress}%` }}
                            />
                          </div>
                        </button>
                      );
                    })
                  ) : (
                    <div className="pf-lane__empty">Nenhuma OS</div>
                  )}
                </div>
              </section>
            );
          })}
        </div>
      ) : (
        <div className="pf-empty pf-empty-month">
          Nenhuma OS prevista para o mês e filtros selecionados.
        </div>
      )}
    </section>
  );
}
