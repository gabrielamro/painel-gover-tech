import { useState, type CSSProperties } from 'react';
import { AlertTriangle, Star, ArrowUpRight, ShieldAlert, Sparkles, CheckCircle } from 'lucide-react';
import type { Sprint } from '../../../domain/sprint/model';
import { LANES } from '../../../domain/sprint/model';
import { sprintSystem } from '../../../domain/sprint/queries';

interface Props {
  blockedSprints: Sprint[];
  featuredSprints: Sprint[];
  getSystemColor: (system: string) => string;
  onOpenSprint: (sprint: Sprint) => void;
}

export function SuperExecutiveSidebar({
  blockedSprints,
  featuredSprints,
  getSystemColor,
  onOpenSprint,
}: Props) {
  const [activeTab, setActiveTab] = useState<'featured' | 'blockers'>('featured');

  return (
    <aside className="super-sidebar-panel">
      {/* Tab Switcher */}
      <div className="super-sidebar-tabs" role="tablist">
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'featured'}
          className={`super-sidebar-tab ${activeTab === 'featured' ? 'active' : ''}`}
          onClick={() => setActiveTab('featured')}
        >
          <Star size={14} className="super-sidebar-tab__icon star" />
          <span>Destaques</span>
          {featuredSprints.length > 0 && (
            <span className="super-sidebar-tab__badge star">{featuredSprints.length}</span>
          )}
        </button>

        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'blockers'}
          className={`super-sidebar-tab ${activeTab === 'blockers' ? 'active' : ''}`}
          onClick={() => setActiveTab('blockers')}
        >
          <AlertTriangle size={14} className="super-sidebar-tab__icon alert" />
          <span>Ação Necessária</span>
          {blockedSprints.length > 0 && (
            <span className="super-sidebar-tab__badge alert">{blockedSprints.length}</span>
          )}
        </button>
      </div>

      {/* Tab 1: Destaques Executivos (Visual exato da imagem anexa) */}
      {activeTab === 'featured' && (
        <div className="super-sidebar-content">
          <div className="super-panel-title">
            <div>
              <span className="eyebrow">LEITURA EXECUTIVA</span>
              <h3>Destaques</h3>
            </div>
            <span className="super-panel-title__count">{featuredSprints.length}</span>
          </div>
          <p className="super-featured-intro">Sprints selecionadas para acompanhamento.</p>

          <div className="gover-feature-list">
            {featuredSprints.length > 0 ? (
              featuredSprints.map((sprint) => {
                const system = sprintSystem(sprint);
                const color = getSystemColor(system);
                const laneLabel = LANES.find((l) => l.id === sprint.lane)?.label || sprint.lane;
                const progress = Math.round(sprint.progress || 0);
                const sprintLabel = sprint.sprintNumber ? `SPRINT ${sprint.sprintNumber}` : sprint.code;

                return (
                  <button
                    key={sprint.code}
                    type="button"
                    className="gover-feature-item"
                    style={{ '--feature-color': color } as CSSProperties}
                    onClick={() => onOpenSprint(sprint)}
                    title="Clique para abrir detalhes da Sprint"
                  >
                    <span className="gover-feature-system">{system}</span>
                    <span className="gover-feature-meta">{sprintLabel}</span>
                    <strong>
                      {sprint.featuredNote ||
                        sprint.objective ||
                        'O Sistema está apresentando um ótimo desempenho após a última entrega.'}
                    </strong>
                    <small>
                      {laneLabel} · {progress}%
                    </small>
                  </button>
                );
              })
            ) : (
              <div className="super-sidebar-empty">
                <Sparkles size={24} className="super-sidebar-empty__icon muted" />
                <strong>Nenhum destaque ativo</strong>
                <p>Marque uma Sprint como "Destaque" nos detalhes para exibi-la nesta seção.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 2: Bloqueios Críticos / Ação Necessária */}
      {activeTab === 'blockers' && (
        <div className="super-sidebar-content">
          <div className="super-panel-title">
            <div>
              <span className="eyebrow">AÇÃO NECESSÁRIA</span>
              <h3>Bloqueios em destaque</h3>
            </div>
            <span className="super-panel-title__count alert">{blockedSprints.length}</span>
          </div>
          <p className="super-featured-intro">
            Sprints com impedimentos ou bloqueios que impactam o cronograma de entrega.
          </p>

          <div className="super-sidebar-list">
            {blockedSprints.length > 0 ? (
              blockedSprints.map((sprint) => {
                const system = sprintSystem(sprint);
                const color = getSystemColor(system);
                const priorityClass = sprint.priorityLevel?.toLowerCase().replace('í', 'i') || 'media';
                const blockedCount = Number(sprint.blocked || 0);

                return (
                  <article
                    key={sprint.code}
                    className="super-blocker-card"
                    style={{ '--system-color': color } as CSSProperties}
                    onClick={() => onOpenSprint(sprint)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        onOpenSprint(sprint);
                      }
                    }}
                  >
                    <div className="super-blocker-card__header">
                      <span className="super-blocker-card__system">{system}</span>
                      <span className="super-blocker-card__code">
                        {sprint.serviceOrder || sprint.code}
                      </span>
                      <span className={`super-blocker-card__priority ${priorityClass}`}>
                        {sprint.priorityLevel || 'Média'}
                      </span>
                    </div>

                    <h3 className="super-blocker-card__title" title={sprint.objective}>
                      {sprint.objective}
                    </h3>

                    <div className="super-blocker-card__info-row">
                      <div className="super-blocker-card__issue-pill">
                        <ShieldAlert size={12} />
                        <strong>{blockedCount} bloqueio{blockedCount !== 1 ? 's' : ''}</strong>
                      </div>
                      <span className="super-blocker-card__milestone">
                        Marco: {typeof sprint.nextMilestone === 'string' ? sprint.nextMilestone : 'Definir pacote de entrega'}
                      </span>
                    </div>

                    <div className="super-blocker-card__footer">
                      <span className="super-blocker-card__po">PO: {sprint.po}</span>
                      <span className="super-blocker-card__link">
                        Abrir Sprint <ArrowUpRight size={13} />
                      </span>
                    </div>
                  </article>
                );
              })
            ) : (
              <div className="super-sidebar-empty">
                <CheckCircle size={24} className="super-sidebar-empty__icon success" />
                <strong>Tudo em conformidade</strong>
                <p>Nenhum bloqueio ou impedimento crítico ativo no momento.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </aside>
  );
}
