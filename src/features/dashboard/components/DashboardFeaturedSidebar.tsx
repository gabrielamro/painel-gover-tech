import type { CSSProperties } from 'react';
import type { Sprint } from '../../../domain/sprint/model';
import { LANES } from '../../../domain/sprint/model';
import { sprintSystem } from '../../../domain/sprint/queries';

interface Props {
  featuredSprints: Sprint[];
  onOpenSprint: (sprint: Sprint) => void;
  getSystemColor: (system: string) => string;
}

export function DashboardFeaturedSidebar({ featuredSprints, onOpenSprint, getSystemColor }: Props) {
  return (
    <aside className="gover-featured-sidebar">
      <div className="gover-featured-heading">
        <div>
          <span className="gover-featured-eyebrow">LEITURA EXECUTIVA</span>
          <h2>Destaques</h2>
        </div>
        <span className="gover-featured-count-badge" aria-label={`${featuredSprints.length} destaques ativos`}>
          {featuredSprints.length}
        </span>
      </div>

      <p className="gover-featured-intro">
        Sprints e entregas selecionadas para acompanhamento.
      </p>

      {featuredSprints.length === 0 ? (
        <div className="gover-featured-empty">
          <span className="gover-featured-empty__star">☆</span>
          <strong>Nenhum destaque selecionado.</strong>
          <small>
            Abra uma Sprint, acesse a aba Destaque e marque “Exibir no Dashboard Gover”.
          </small>
        </div>
      ) : (
        <div className="gover-featured-list">
          {featuredSprints.map((sprint) => {
            const system = sprintSystem(sprint);
            const color = getSystemColor(system);
            const sprintTitle = sprint.sprintNumber ? `Sprint ${sprint.sprintNumber}` : sprint.code;
            const laneLabel = LANES.find((l) => l.id === sprint.lane)?.label || sprint.lane;

            return (
              <button
                key={sprint.code}
                type="button"
                className="gover-featured-item"
                style={{ '--system-color': color } as CSSProperties}
                onClick={() => onOpenSprint(sprint)}
                title={`Abrir detalhes de ${sprint.code}`}
              >
                <div className="gover-featured-item__top">
                  <span className="gover-featured-system-tag">{system}</span>
                  <span className="gover-featured-meta">
                    {sprint.serviceOrder || sprint.code} · {sprintTitle}
                  </span>
                </div>

                <strong className="gover-featured-note">
                  {sprint.featuredNote || sprint.objective || 'Informação executiva registrada.'}
                </strong>

                <div className="gover-featured-foot">
                  <span>{laneLabel}</span>
                  <strong>{sprint.progress || 0}%</strong>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </aside>
  );
}
