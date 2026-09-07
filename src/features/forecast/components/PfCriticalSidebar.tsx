import { AlertTriangle, Clock, RotateCcw, Plus, CheckCircle2, ShieldAlert } from 'lucide-react';
import type { Sprint } from '../../../domain/sprint/model';
import { formatPF } from '../../../domain/billing/format';
import type { PfImprovement } from './PfImprovementModal';

export interface CriticalItem {
  tone: 'red' | 'orange' | 'purple';
  icon: 'alert' | 'clock' | 'rotate';
  title: string;
  detail: string;
  sprint: Sprint;
}

interface Props {
  criticalItems: CriticalItem[];
  improvements: PfImprovement[];
  onOpenImprovementModal: () => void;
  onToggleImprovement: (id: string, resolved: boolean) => void;
  onOpenSprint: (sprint: Sprint) => void;
}

export function PfCriticalSidebar({
  criticalItems,
  improvements,
  onOpenImprovementModal,
  onToggleImprovement,
  onOpenSprint,
}: Props) {
  return (
    <aside className="pf-insights-sidebar">
      {/* 1. Pontos Críticos */}
      <section className="pf-panel pf-critical-panel">
        <header className="pf-panel__header">
          <div className="pf-panel__title-group">
            <span className="pf-panel__eyebrow">ACOMPANHAMENTO</span>
            <h3 className="pf-panel__title">Pontos críticos</h3>
          </div>
          <span className={`pf-panel__count-badge ${criticalItems.length > 0 ? 'alert' : ''}`}>
            {criticalItems.length}
          </span>
        </header>

        <div className="pf-critical-list">
          {criticalItems.length > 0 ? (
            criticalItems.map((item, idx) => (
              <article
                key={idx}
                className={`pf-critical-card ${item.tone}`}
                onClick={() => onOpenSprint(item.sprint)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onOpenSprint(item.sprint);
                  }
                }}
                title="Clique para ver os detalhes da Sprint"
              >
                <div className="pf-critical-card__icon">
                  {item.icon === 'alert' && <ShieldAlert size={14} />}
                  {item.icon === 'clock' && <Clock size={14} />}
                  {item.icon === 'rotate' && <RotateCcw size={14} />}
                </div>
                <div className="pf-critical-card__details">
                  <strong>{item.title}</strong>
                  <small>{item.detail}</small>
                </div>
              </article>
            ))
          ) : (
            <div className="pf-empty compact">
              <CheckCircle2 size={18} className="text-green-600" />
              <span>Nenhum ponto crítico neste recorte.</span>
            </div>
          )}
        </div>
      </section>

      {/* 2. Pontos de Melhoria */}
      <section className="pf-panel pf-improvements-panel">
        <header className="pf-panel__header">
          <div className="pf-panel__title-group">
            <span className="pf-panel__eyebrow">GOVERNANÇA</span>
            <h3 className="pf-panel__title">Pontos de melhoria</h3>
          </div>
          <button
            type="button"
            className="pf-btn-add-improvement"
            onClick={onOpenImprovementModal}
          >
            <Plus size={13} />
            Adicionar
          </button>
        </header>

        <div className="pf-improvement-list">
          {improvements.length > 0 ? (
            improvements.map((item) => (
              <label key={item.id} className="pf-improvement-item">
                <input
                  type="checkbox"
                  checked={item.resolved}
                  onChange={(e) => onToggleImprovement(item.id, e.target.checked)}
                />
                <div className="pf-improvement-item__body">
                  <strong className={item.resolved ? 'is-resolved' : ''}>
                    {item.title}
                  </strong>
                  <small>
                    {item.resolved ? (
                      <span className="text-green-600">
                        Resolvido
                        {item.resolvedAt
                          ? ` em ${new Date(item.resolvedAt).toLocaleDateString('pt-BR')}`
                          : ''}
                      </span>
                    ) : (
                      <>
                        <span className="pf-status-tag">{item.status}</span>
                        {item.dueDate && (
                          <span className="pf-due-tag">
                            · prazo {new Date(`${item.dueDate}T12:00:00`).toLocaleDateString('pt-BR')}
                          </span>
                        )}
                      </>
                    )}
                  </small>
                </div>
              </label>
            ))
          ) : (
            <div className="pf-empty compact">Nenhuma melhoria cadastrada.</div>
          )}
        </div>
      </section>
    </aside>
  );
}
