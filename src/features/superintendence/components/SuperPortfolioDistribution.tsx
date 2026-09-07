import type { Lane } from '../../../domain/sprint/model';
import { LANES } from '../../../domain/sprint/model';

interface LaneDistribution {
  id: Lane;
  label: string;
  count: number;
  percentage: number;
}

interface Props {
  distribution: LaneDistribution[];
  totalSprints: number;
  selectedLane: string;
  onSelectLane: (lane: string) => void;
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

export function SuperPortfolioDistribution({
  distribution,
  totalSprints,
  selectedLane,
  onSelectLane,
}: Props) {
  return (
    <section className="super-panel super-panel--distribution">
      <header className="super-panel__header">
        <div className="super-panel__title-group">
          <span className="super-panel__eyebrow">DISTRIBUIÇÃO POR ETAPA</span>
          <h2 className="super-panel__title">Onde o portfólio está</h2>
        </div>
        <span className="super-panel__count-badge">{totalSprints} Sprints no total</span>
      </header>

      {/* Multi-segment distribution strip */}
      <div className="super-dist-strip" aria-label="Distribuição proporcional das Sprints">
        {distribution.map((item) => {
          if (item.count === 0) return null;
          const color = LANE_COLORS[item.id] || '#64748b';
          return (
            <div
              key={item.id}
              className="super-dist-strip__segment"
              style={{
                width: `${item.percentage}%`,
                background: color,
              }}
              title={`${item.label}: ${item.count} (${item.percentage}%)`}
            />
          );
        })}
      </div>

      {/* Lane Breakdown list */}
      <div className="super-dist-list">
        {distribution.map((item) => {
          const color = LANE_COLORS[item.id] || '#64748b';
          const isSelected = selectedLane === item.id;

          return (
            <button
              key={item.id}
              type="button"
              className={`super-dist-row ${isSelected ? 'is-selected' : ''}`}
              onClick={() => onSelectLane(isSelected ? 'all' : item.id)}
              title={`Filtrar por ${item.label}`}
            >
              <div className="super-dist-row__left">
                <span
                  className="super-dist-row__dot"
                  style={{ background: color }}
                />
                <span className="super-dist-row__label">{item.label}</span>
              </div>

              <div className="super-dist-row__track">
                <div
                  className="super-dist-row__bar"
                  style={{
                    width: `${item.percentage}%`,
                    background: color,
                  }}
                />
              </div>

              <div className="super-dist-row__right">
                <strong className="super-dist-row__count">{item.count}</strong>
                <span className="super-dist-row__pct">{item.percentage}%</span>
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
}
