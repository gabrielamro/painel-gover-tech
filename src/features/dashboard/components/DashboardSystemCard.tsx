import type { CSSProperties } from 'react';
import type { Sprint } from '../../../domain/sprint/model';
import { LANES } from '../../../domain/sprint/model';
import { sprintSystem } from '../../../domain/sprint/queries';

interface Props {
  sprint: Sprint;
  color: string;
  onClick: (sprint: Sprint) => void;
}

export function DashboardSystemCard({ sprint, color, onClick }: Props) {
  const system = sprintSystem(sprint);
  const sprintTitle = sprint.sprintNumber ? `Sprint ${sprint.sprintNumber}` : sprint.code;
  const healthTone = sprint.health >= 80 ? 'healthy' : sprint.health >= 60 ? 'warning' : 'critical';
  const laneLabel = LANES.find((item) => item.id === sprint.lane)?.label || sprint.lane;
  const progress = Math.max(0, Math.min(100, Math.round(sprint.progress || 0)));
  const tasks = Number(sprint.tasks || 0);
  const blocked = Number(sprint.blocked || 0);

  return (
    <article
      className="gover-card"
      style={{ '--system-color': color } as CSSProperties}
      onClick={() => onClick(sprint)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick(sprint);
        }
      }}
      aria-label={`${system} ${sprintTitle} - ${sprint.objective}`}
    >
      <div className="gover-card__head">
        <span className="gover-card__badge" title={system}>
          {system}
        </span>
        <span className={`gover-health-pill ${healthTone}`} title={`Saúde: ${sprint.health}/100`}>
          {sprint.health}
        </span>
      </div>

      <div className="gover-card__meta">
        <strong>{sprint.serviceOrder || sprint.code} · {sprintTitle}</strong>
        <p title={sprint.objective}>{sprint.objective}</p>
      </div>

      <div className="gover-card__progress-wrap">
        <div className="gover-card__progress-top">
          <small>Progresso</small>
          <strong className="gover-card__progress-num">{progress}%</strong>
        </div>
        <div className="gover-card__track">
          <div className="gover-card__bar" style={{ width: `${progress}%` }} />
        </div>
      </div>

      <div className="gover-card__foot">
        <span>
          {tasks} tasks · <strong className={blocked > 0 ? 'text-red-600' : ''}>{blocked} bloq.</strong>
        </span>
        <span className={`gover-card__status-tag ${healthTone}`}>
          ● {laneLabel}
        </span>
      </div>
    </article>
  );
}
