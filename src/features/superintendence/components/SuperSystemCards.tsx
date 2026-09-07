import type { CSSProperties } from 'react';

export interface SystemSummary {
  name: string;
  color: string;
  total: number;
  inProgress: number;
  delivered: number;
  blocked: number;
}

interface Props {
  systems: SystemSummary[];
  selectedSystem: string;
  onSelectSystem: (system: string) => void;
}

export function SuperSystemCards({ systems, selectedSystem, onSelectSystem }: Props) {
  if (systems.length === 0) {
    return null;
  }

  return (
    <div className="super-system-cards-shelf" role="toolbar" aria-label="Resumo por sistema">
      {systems.map((sys) => {
        const isSelected = selectedSystem === sys.name;
        const initials = sys.name.slice(0, 2).toUpperCase();

        return (
          <button
            key={sys.name}
            type="button"
            className={`super-system-box ${isSelected ? 'is-selected' : ''}`}
            style={{ '--system-color': sys.color } as CSSProperties}
            onClick={() => onSelectSystem(isSelected ? 'all' : sys.name)}
            title={`Filtrar por ${sys.name}`}
          >
            {/* Top: Avatar + Name */}
            <div className="super-system-box__head">
              <span className="super-system-box__avatar">{initials}</span>
              <strong className="super-system-box__title">{sys.name}</strong>
            </div>

            {/* Row 1: In Progress */}
            <div className="super-system-box__row">
              <span className="super-system-box__num blue">{sys.inProgress}</span>
              <span className="super-system-box__label">
                {sys.inProgress === 1 ? 'Sprint em andamento' : 'Sprints em andamento'}
              </span>
            </div>

            {/* Row 2: Delivered */}
            <div className="super-system-box__row">
              <span className="super-system-box__num green">{sys.delivered}</span>
              <span className="super-system-box__label">
                {sys.delivered === 1 ? 'Sprint entregue' : 'Sprints entregues'}
              </span>
            </div>
          </button>
        );
      })}
    </div>
  );
}
