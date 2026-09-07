import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useSprints } from '../../app/providers/SprintProvider';
import { LANES, type Lane, type Sprint } from '../../domain/sprint/model';
import { sprintSystem } from '../../domain/sprint/queries';
import { getSystemColor } from '../../domain/project/colors';
import { SprintDetailsModal } from '../sprints/components/SprintDetailsModal';
import { DashboardEvolutionChart } from './components/DashboardEvolutionChart';
import { DashboardFeaturedSidebar } from './components/DashboardFeaturedSidebar';
import { DashboardSystemCard } from './components/DashboardSystemCard';
import './dashboard.css';

export function DashboardPage() {
  const {
    sprints,
    updateSprint,
    createTask,
    updateTask,
    moveTask,
    deleteTask,
    auditLogs,
  } = useSprints();

  const [selectedSystem, setSelectedSystem] = useState<string>('all');
  const [selectedLane, setSelectedLane] = useState<string>('all');
  const [selectedSprint, setSelectedSprint] = useState<Sprint | null>(null);

  // KPIs
  const totalSprints = sprints.length;
  const totalTasks = sprints.reduce((sum, s) => sum + Number(s.tasks || 0), 0);
  const totalBlocked = sprints.reduce((sum, s) => sum + Number(s.blocked || 0), 0);
  const totalDeliveries = sprints.reduce((sum, s) => sum + Number(s.deliveries || 0), 0);
  const attentionItems = sprints.filter(
    (s) => s.health < 70 || Number(s.blocked || 0) > 0 || s.priorityLevel === 'Crítica'
  );
  const overallProgress = totalSprints
    ? Math.round(sprints.reduce((sum, s) => sum + (s.progress || 0), 0) / totalSprints)
    : 0;

  // Unique Systems
  const systems = useMemo(
    () => [...new Set(sprints.map(sprintSystem))].sort((a, b) => a.localeCompare(b, 'pt-BR')),
    [sprints]
  );

  // Filtered sprints
  const filtered = useMemo(() => {
    return sprints.filter((sprint) => {
      const matchSystem = selectedSystem === 'all' || sprintSystem(sprint) === selectedSystem;
      const matchLane = selectedLane === 'all' || sprint.lane === selectedLane;
      return matchSystem && matchLane;
    });
  }, [sprints, selectedSystem, selectedLane]);

  const visibleLanes = useMemo(
    () => (selectedLane === 'all' ? LANES : LANES.filter((lane) => lane.id === selectedLane))
      .filter((lane) => filtered.some((sprint) => sprint.lane === lane.id)),
    [filtered, selectedLane]
  );

  // Featured Sprints
  const featuredSprints = useMemo(
    () =>
      sprints
        .filter((s) => s.isFeatured)
        .sort((a, b) => Number(b.blocked || 0) - Number(a.blocked || 0)),
    [sprints]
  );

  // System progress summary for the bottom panel
  const systemProgressList = useMemo(() => {
    const map = new Map<string, { totalProgress: number; count: number }>();
    sprints.forEach((s) => {
      const sys = sprintSystem(s);
      const curr = map.get(sys) || { totalProgress: 0, count: 0 };
      curr.totalProgress += Number(s.progress || 0);
      curr.count += 1;
      map.set(sys, curr);
    });
    return Array.from(map.entries())
      .map(([sys, data]) => ({
        system: sys,
        progress: Math.round(data.totalProgress / data.count),
        color: getSystemColor(sys),
      }))
      .sort((a, b) => b.progress - a.progress)
      .slice(0, 6);
  }, [sprints]);

  // Recent activities list
  const recentActivities = useMemo(() => {
    return [...sprints]
      .sort((a, b) => (Number(b.deliveries) || 0) - (Number(a.deliveries) || 0))
      .slice(0, 3);
  }, [sprints]);

  // Risks list
  const risksList = useMemo(() => {
    return [...attentionItems]
      .sort((a, b) => a.health - b.health || Number(b.blocked || 0) - Number(a.blocked || 0))
      .slice(0, 3);
  }, [attentionItems]);

  const currentModalSprint = selectedSprint
    ? sprints.find((s) => s.code === selectedSprint.code) || selectedSprint
    : null;

  return (
    <div className="gover-container">
      {/* 1. Top KPIs Bar */}
      <section className="gover-kpis-grid" aria-label="Indicadores do portfólio">
        {/* KPI 1: Total Sprints */}
        <div className="gover-kpi-card">
          <div className="gover-kpi-icon blue">◒</div>
          <div className="gover-kpi-content">
            <small>Total de Sprints</small>
            <strong>{totalSprints}</strong>
            <em>Portfólio atual</em>
          </div>
        </div>

        {/* KPI 2: Tasks no Portfólio */}
        <div className="gover-kpi-card">
          <div className="gover-kpi-icon purple">▣</div>
          <div className="gover-kpi-content">
            <small>Tasks no Portfólio</small>
            <strong>{totalTasks}</strong>
            <em className={totalBlocked > 0 ? 'alert' : ''}>{totalBlocked} bloqueadas</em>
          </div>
        </div>

        {/* KPI 3: Entregas registradas */}
        <div className="gover-kpi-card">
          <div className="gover-kpi-icon green">✓</div>
          <div className="gover-kpi-content">
            <small>Entregas registradas</small>
            <strong>{totalDeliveries}</strong>
            <em className="success">Atualizadas pelas Sprints</em>
          </div>
        </div>

        {/* KPI 4: Itens em atenção */}
        <div className="gover-kpi-card">
          <div className="gover-kpi-icon orange">!</div>
          <div className="gover-kpi-content">
            <small>Itens em atenção</small>
            <strong style={{ color: attentionItems.length > 0 ? '#dc2626' : undefined }}>
              {attentionItems.length}
            </strong>
            <em className={attentionItems.length > 0 ? 'warning' : ''}>Exigem acompanhamento</em>
          </div>
        </div>
      </section>

      {/* 2. Main Area: Status dos Sistemas (Left) + Destaques (Right) */}
      <div className="gover-main-layout">
        {/* Left Column: Status dos Sistemas with Filter Bar & Lane Groups */}
        <section className="gover-systems-panel">
          <header className="gover-systems-panel__header">
            <div className="gover-systems-panel__title-row">
              <h2>Status dos Sistemas</h2>
            </div>

            {/* Filter controls */}
            <div className="gover-filters-bar">
              <select
                className="gover-system-select"
                aria-label="Filtrar por projeto"
                value={selectedSystem}
                onChange={(event) => setSelectedSystem(event.target.value)}
              >
                <option value="all">Projetos</option>
                {systems.map((system) => (
                  <option key={system} value={system}>
                    {system}
                  </option>
                ))}
              </select>

              <select
                className="gover-lane-select"
                aria-label="Filtrar situação da Sprint"
                value={selectedLane}
                onChange={(e) => setSelectedLane(e.target.value)}
              >
                <option value="all">Todas as situações</option>
                {LANES.map((lane) => (
                  <option key={lane.id} value={lane.id}>
                    {lane.label}
                  </option>
                ))}
              </select>
            </div>
          </header>

          {/* Side-by-side Columns (Igual no Kanban) com cards empilhados verticalmente */}
          <div className="gover-status-columns">
            {visibleLanes.length ? visibleLanes.map((lane) => {
              const laneSprints = filtered.filter((sprint) => sprint.lane === lane.id);
              return (
                <section key={lane.id} className="gover-status-column">
                  <header className="gover-status-column__header">
                    <h3>{lane.label}</h3>
                    <span>{laneSprints.length}</span>
                  </header>

                  <div className="gover-status-column__cards">
                    {laneSprints.map((sprint) => (
                      <DashboardSystemCard
                        key={sprint.code}
                        sprint={sprint}
                        color={getSystemColor(sprintSystem(sprint))}
                        onClick={(item) => setSelectedSprint(item)}
                      />
                    ))}
                  </div>
                </section>
              );
            }) : (
              <div className="gover-empty-lane">Nenhuma Sprint encontrada para os filtros selecionados.</div>
            )}
          </div>
        </section>

        {/* Right Column: Leitura Executiva / Destaques Sidebar */}
        <DashboardFeaturedSidebar
          featuredSprints={featuredSprints}
          onOpenSprint={(sprint) => setSelectedSprint(sprint)}
          getSystemColor={getSystemColor}
        />
      </div>

      {/* 4. Bottom Grid (3 Panels) */}
      <div className="gover-bottom-grid">
        {/* Panel 1: Progresso Geral dos Projetos (Planejado × Real) */}
        <section className="gover-panel">
          <div>
            <div className="gover-panel__title">
              <h2>Progresso Geral dos Projetos</h2>
              <span>Planejado × Real</span>
            </div>

            <div className="gover-progress-summary">
              <strong>{overallProgress}%</strong>
              <span>avanço geral</span>
            </div>

            <DashboardEvolutionChart sprints={sprints} overallProgress={overallProgress} />

            <div className="gover-bars">
              {systemProgressList.map((item) => (
                <div key={item.system} className="gover-bar-row">
                  <span title={item.system}>{item.system}</span>
                  <div className="gover-bar-track">
                    <div
                      className="gover-bar-fill"
                      style={{ width: `${item.progress}%`, background: item.color }}
                    />
                  </div>
                  <small>{item.progress}%</small>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Panel 2: Atividades Recentes */}
        <section className="gover-panel">
          <div>
            <div className="gover-panel__title">
              <h2>Atividades Recentes</h2>
              <Link to="/updates">Nova atualização →</Link>
            </div>

            <div className="gover-activity-list">
              {recentActivities.map((sprint) => {
                const system = sprintSystem(sprint);
                const sprintLabel = sprint.sprintNumber ? `Sprint ${sprint.sprintNumber}` : sprint.code;
                return (
                  <article key={sprint.code} className="gover-activity-item">
                    <span className="gover-activity-icon">✓</span>
                    <div className="gover-activity-details">
                      <strong>Atualização registrada</strong>
                      <p title={`${system} · ${sprint.code}`}>
                        {system} · {sprint.serviceOrder || sprint.code}
                      </p>
                      <small title={sprint.objective}>
                        {sprint.objective || `Entrega da ${sprintLabel}`}
                      </small>
                    </div>
                    <time className="gover-activity-time">
                      {sprint.deliveries || 1} ent.
                    </time>
                  </article>
                );
              })}
            </div>
          </div>

          <Link to="/kanban" className="gover-panel-link">
            Ver operação completa no Kanban →
          </Link>
        </section>

        {/* Panel 3: Alertas e Riscos */}
        <section className="gover-panel">
          <div>
            <div className="gover-panel__title">
              <h2>Alertas e Riscos</h2>
              <Link to="/kanban">Ver sala →</Link>
            </div>

            <div className="gover-risk-list">
              {risksList.length > 0 ? (
                risksList.map((sprint) => {
                  const system = sprintSystem(sprint);
                  const isCritical = sprint.health < 60 || sprint.priorityLevel === 'Crítica';
                  const title =
                    Number(sprint.blocked || 0) > 0
                      ? `${sprint.blocked} task(s) bloqueada(s)`
                      : 'Progresso abaixo do esperado';

                  return (
                    <article
                      key={sprint.code}
                      className={`gover-risk-item ${isCritical ? 'critical' : 'warning'}`}
                      onClick={() => setSelectedSprint(sprint)}
                      style={{ cursor: 'pointer' }}
                      title="Clique para ver os detalhes da Sprint"
                    >
                      <span className="gover-risk-icon">!</span>
                      <div className="gover-risk-details">
                        <strong>{title}</strong>
                        <p>
                          {system} · {sprint.serviceOrder || sprint.code}
                        </p>
                        <small>
                          {Number(sprint.blocked || 0)} bloqueios · {Number(sprint.risks || 0)} riscos · Saúde {sprint.health}/100
                        </small>
                      </div>
                    </article>
                  );
                })
              ) : (
                <div className="gover-risk-empty">Nenhum alerta ativo no momento.</div>
              )}
            </div>
          </div>

          <Link to="/kanban" className="gover-panel-link">
            Ver todos os alertas no Kanban →
          </Link>
        </section>
      </div>

      {/* 5. Sprint Details Modal */}
      {currentModalSprint && (
        <SprintDetailsModal
          sprint={currentModalSprint}
          initialTab={currentModalSprint.isFeatured ? 'featured' : 'summary'}
          onClose={() => setSelectedSprint(null)}
          onUpdate={(changes) => updateSprint(currentModalSprint.code, changes)}
          onCreateTask={createTask}
          onUpdateTask={updateTask}
          onMoveTask={moveTask}
          onDeleteTask={deleteTask}
          auditLogs={auditLogs(currentModalSprint.code)}
        />
      )}
    </div>
  );
}
