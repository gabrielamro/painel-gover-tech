import { useState, useMemo } from 'react';
import {
  Layers,
  AlertTriangle,
  CheckCircle2,
  Zap,
  Search,
  X,
  Filter,
  RefreshCw,
} from 'lucide-react';
import { useSprints } from '../../app/providers/SprintProvider';
import { LANES, type Lane, type Sprint } from '../../domain/sprint/model';
import { sprintSystem } from '../../domain/sprint/queries';
import { getSystemColor } from '../../domain/project/colors';
import { SprintDetailsModal } from '../sprints/components/SprintDetailsModal';
import { SuperSystemCards, type SystemSummary } from './components/SuperSystemCards';
import { SuperSystemTable, type SystemTableRow } from './components/SuperSystemTable';
import { SuperExecutiveSidebar } from './components/SuperExecutiveSidebar';
import { SuperDeliveriesChart, type DeliveryEvent } from './components/SuperDeliveriesChart';
import { SuperPortfolioDistribution } from './components/SuperPortfolioDistribution';
import './superintendence.css';

function parseDate(value?: string | Date | null): Date | null {
  if (!value) return null;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
}

export function SuperintendencePage() {
  const {
    sprints,
    updateSprint,
    createTask,
    updateTask,
    moveTask,
    deleteTask,
    auditLogs,
  } = useSprints();

  // Filters State
  const [selectedLane, setSelectedLane] = useState<string>('all');
  const [selectedSystem, setSelectedSystem] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [kpiFilter, setKpiFilter] = useState<string | null>(null);
  const [selectedSprint, setSelectedSprint] = useState<Sprint | null>(null);

  // 1. Calculate Delivery Events in the last 30 days
  const { deliveryEvents, weeklyDeliveriesCount, monthlyDeliveriesCount, totalDeliveredPf } =
    useMemo(() => {
      const now = new Date();
      const start = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
      const end = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
      const events: DeliveryEvent[] = [];

      sprints.forEach((sprint) => {
        if (Array.isArray(sprint.deliveryHistory) && sprint.deliveryHistory.length > 0) {
          sprint.deliveryHistory.forEach((item) => {
            const date = parseDate(item.date || item.createdAt);
            if (date && date >= start && date < end) {
              const ageInDays = Math.max(0, Math.floor((now.getTime() - date.getTime()) / 86400000));
              const weekIndex = Math.min(3, Math.floor(ageInDays / 8));
              events.push({ sprint, date, weekIndex });
            }
          });
          return;
        }

        const count = Number(sprint.deliveries || 0);
        const date = parseDate(sprint.lastUpdated) || now;
        if (count > 0 && date >= start && date < end) {
          for (let i = 0; i < count; i += 1) {
            const eventDate = new Date(date.getTime() - (i % 4) * 6 * 86400000);
            const ageInDays = Math.max(0, Math.floor((now.getTime() - eventDate.getTime()) / 86400000));
            const weekIndex = Math.min(3, Math.floor(ageInDays / 8));
            events.push({ sprint, date: eventDate, weekIndex });
          }
        }
      });

      // Sort recent first
      events.sort((a, b) => b.date.getTime() - a.date.getTime());

      const weekThreshold = new Date(now.getTime() - 7 * 86400000);
      const weeklyCount = events.filter((e) => e.date >= weekThreshold).length;
      const monthlyCount = events.length;

      const completedSprints = sprints.filter((s) => ['approved', 'billing', 'completed'].includes(s.lane));
      const pfSum = completedSprints.reduce(
        (sum, s) => sum + (s.detailedFunctionPoints || s.functionPoints || 0),
        0
      );

      return {
        deliveryEvents: events,
        weeklyDeliveriesCount: weeklyCount,
        monthlyDeliveriesCount: monthlyCount,
        totalDeliveredPf: pfSum,
      };
    }, [sprints]);

  // 2. Filtered Sprints based on all criteria
  const filteredSprints = useMemo(() => {
    return sprints.filter((sprint) => {
      const sys = sprintSystem(sprint);

      // System filter
      if (selectedSystem !== 'all' && sys !== selectedSystem) {
        return false;
      }

      // Lane filter
      if (selectedLane === 'blocked') {
        if (Number(sprint.blocked || 0) === 0) return false;
      } else if (selectedLane !== 'all' && sprint.lane !== selectedLane) {
        return false;
      }

      // Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.trim().toLowerCase();
        const searchable = [
          sys,
          sprint.code,
          sprint.serviceOrder,
          sprint.objective,
          sprint.po,
          sprint.technicalLead,
        ]
          .filter(Boolean)
          .join(' ')
          .toLowerCase();

        if (!searchable.includes(q)) return false;
      }

      // KPI Interactive Filter
      if (kpiFilter === 'development') {
        if (sprint.lane !== 'development') return false;
      } else if (kpiFilter === 'blocked') {
        if (Number(sprint.blocked || 0) === 0 && sprint.priorityLevel !== 'Crítica') return false;
      } else if (kpiFilter === 'completed') {
        if (!['approved', 'billing', 'completed'].includes(sprint.lane)) return false;
      } else if (kpiFilter === 'priorities') {
        if (sprint.priorityLevel !== 'Alta' && sprint.priorityLevel !== 'Crítica') return false;
      }

      return true;
    });
  }, [sprints, selectedSystem, selectedLane, searchQuery, kpiFilter]);

  // 3. Unique Systems & Summary Metrics
  const systemsSummary: SystemSummary[] = useMemo(() => {
    const map = new Map<string, { total: number; inProgress: number; delivered: number; blocked: number }>();

    sprints.forEach((s) => {
      const sys = sprintSystem(s);
      const curr = map.get(sys) || { total: 0, inProgress: 0, delivered: 0, blocked: 0 };
      curr.total += 1;
      if (['development', 'homologation', 'approved', 'billing'].includes(s.lane)) {
        curr.inProgress += 1;
      }
      if (s.lane === 'completed') {
        curr.delivered += 1;
      }
      if (Number(s.blocked || 0) > 0) {
        curr.blocked += Number(s.blocked || 0);
      }
      map.set(sys, curr);
    });

    return Array.from(map.entries())
      .map(([name, data]) => ({
        name,
        color: getSystemColor(name),
        total: data.total,
        inProgress: data.inProgress,
        delivered: data.delivered,
        blocked: data.blocked,
      }))
      .sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'));
  }, [sprints]);

  // 4. Consolidated System Table Rows (based on filteredSprints)
  const systemTableRows: SystemTableRow[] = useMemo(() => {
    const grouped = new Map<string, Sprint[]>();
    filteredSprints.forEach((s) => {
      const sys = sprintSystem(s);
      const list = grouped.get(sys) || [];
      list.push(s);
      grouped.set(sys, list);
    });

    return Array.from(grouped.entries()).map(([system, sysSprints]) => {
      // Find featured sprint: prioritize in development with blockers, or lowest health, or highest progress
      const featured =
        sysSprints.find((s) => s.lane === 'development' && Number(s.blocked || 0) > 0) ||
        sysSprints.find((s) => s.lane === 'development') ||
        sysSprints.slice().sort((a, b) => a.health - b.health)[0] ||
        sysSprints[0] ||
        null;

      const totalBlocked = sysSprints.reduce((sum, s) => sum + Number(s.blocked || 0), 0);
      const avgProgress = Math.round(
        sysSprints.reduce((sum, s) => sum + Number(s.progress || 0), 0) / sysSprints.length
      );
      const avgHealth = Math.round(
        sysSprints.reduce((sum, s) => sum + Number(s.health || 0), 0) / sysSprints.length
      );

      return {
        system,
        color: getSystemColor(system),
        totalSprints: sysSprints.length,
        featuredSprint: featured,
        progress: featured ? Number(featured.progress || 0) : avgProgress,
        blockedCount: totalBlocked,
        healthScore: featured ? Number(featured.health || 0) : avgHealth,
      };
    });
  }, [filteredSprints]);

  // 5. Blocked Sprints & Featured Sprints for the Sidebar
  const blockedSprintsList = useMemo(() => {
    return sprints
      .filter((s) => Number(s.blocked || 0) > 0 || s.priorityLevel === 'Crítica')
      .sort((a, b) => Number(b.blocked || 0) - Number(a.blocked || 0) || a.health - b.health);
  }, [sprints]);

  const featuredSprintsList = useMemo(() => {
    return sprints
      .filter((s) => s.isFeatured)
      .sort((a, b) => Number(b.blocked || 0) - Number(a.blocked || 0));
  }, [sprints]);

  // 6. Distribution across 7 Lanes
  const portfolioDistribution = useMemo(() => {
    const total = filteredSprints.length || 1;
    return LANES.map((lane) => {
      const count = filteredSprints.filter((s) => s.lane === lane.id).length;
      return {
        id: lane.id,
        label: lane.label,
        count,
        percentage: Math.round((count / total) * 100),
      };
    });
  }, [filteredSprints]);

  // 7. Executive KPIs values
  const inDevelopmentCount = sprints.filter((s) => s.lane === 'development').length;
  const blockedCountTotal = blockedSprintsList.length;
  const priorityCountTotal = sprints.filter(
    (s) => s.priorityLevel === 'Alta' || sprintSystem(s).length > 0 && s.priorityLevel === 'Crítica'
  ).length;

  const currentModalSprint = selectedSprint
    ? sprints.find((s) => s.code === selectedSprint.code) || selectedSprint
    : null;

  const hasActiveFilters =
    selectedLane !== 'all' ||
    selectedSystem !== 'all' ||
    searchQuery.trim() !== '' ||
    kpiFilter !== null;

  function clearAllFilters() {
    setSelectedLane('all');
    setSelectedSystem('all');
    setSearchQuery('');
    setKpiFilter(null);
  }

  function handleKpiClick(filterKey: string) {
    if (kpiFilter === filterKey) {
      setKpiFilter(null);
    } else {
      setKpiFilter(filterKey);
    }
  }

  return (
    <div className="super-container">
      {/* 1. Header Status */}
      <div className="super-header" style={{ marginBottom: 16 }}>
        <div className="super-header__badge">
          <span className="super-header__dot" />
          <span>
            {sprints.length} Sprints no portfólio · {systemsSummary.length} sistemas
          </span>
        </div>
      </div>

      {/* 2. Executive Decision KPIs Grid */}
      <section className="super-kpis-grid" aria-label="Indicadores executivos">
        {/* KPI 1: Em Desenvolvimento */}
        <div
          className={`super-kpi-card ${kpiFilter === 'development' ? 'is-active-filter' : ''}`}
          onClick={() => handleKpiClick('development')}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && handleKpiClick('development')}
          title="Clique para filtrar apenas Sprints em desenvolvimento"
        >
          <div className="super-kpi-icon blue">
            <Layers size={22} />
          </div>
          <div className="super-kpi-content">
            <small>Em Desenvolvimento</small>
            <strong>{inDevelopmentCount}</strong>
            <em>{systemsSummary.filter((s) => s.inProgress > 0).length} sistemas ativos</em>
          </div>
        </div>

        {/* KPI 2: Com Bloqueios */}
        <div
          className={`super-kpi-card ${kpiFilter === 'blocked' ? 'is-active-filter' : ''}`}
          onClick={() => handleKpiClick('blocked')}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && handleKpiClick('blocked')}
          title="Clique para filtrar Sprints com bloqueios ou impedimentos"
        >
          <div className="super-kpi-icon orange">
            <AlertTriangle size={22} />
          </div>
          <div className="super-kpi-content">
            <small>Com Bloqueios</small>
            <strong style={{ color: blockedCountTotal > 0 ? '#dc2626' : undefined }}>
              {blockedCountTotal}
            </strong>
            <em className={blockedCountTotal > 0 ? 'alert' : ''}>
              {blockedCountTotal > 0 ? 'Exigem decisão executiva' : 'Sem bloqueios ativos'}
            </em>
          </div>
        </div>

        {/* KPI 3: Entregas no Mês */}
        <div
          className={`super-kpi-card ${kpiFilter === 'completed' ? 'is-active-filter' : ''}`}
          onClick={() => handleKpiClick('completed')}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && handleKpiClick('completed')}
          title="Clique para filtrar entregas homologadas ou faturadas"
        >
          <div className="super-kpi-icon green">
            <CheckCircle2 size={22} />
          </div>
          <div className="super-kpi-content">
            <small>Entregas no Mês</small>
            <strong>{monthlyDeliveriesCount}</strong>
            <em className="success">{weeklyDeliveriesCount} na última semana</em>
          </div>
        </div>

        {/* KPI 4: Itens Prioritários */}
        <div
          className={`super-kpi-card ${kpiFilter === 'priorities' ? 'is-active-filter' : ''}`}
          onClick={() => handleKpiClick('priorities')}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && handleKpiClick('priorities')}
          title="Clique para filtrar itens de prioridade Alta ou Crítica"
        >
          <div className="super-kpi-icon purple">
            <Zap size={22} />
          </div>
          <div className="super-kpi-content">
            <small>Itens Prioritários</small>
            <strong>{priorityCountTotal}</strong>
            <em>Prioridade Alta ou Crítica</em>
          </div>
        </div>
      </section>

      {/* 3. Filter Toolbar */}
      <section className="super-filter-toolbar" aria-label="Barra de filtros">
        <div className="super-filter-group">
          {/* Search Input */}
          <div className="super-filter-search">
            <Search size={15} />
            <input
              type="text"
              placeholder="Buscar sistema, Sprint, PO ou objetivo…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              aria-label="Buscar no painel"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                style={{ background: 'none', border: 0, cursor: 'pointer', color: '#94a3b8' }}
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Lane Filter */}
          <select
            className="super-filter-select"
            value={selectedLane}
            onChange={(e) => setSelectedLane(e.target.value)}
            aria-label="Filtrar por etapa do fluxo"
          >
            <option value="all">Todas as etapas</option>
            {LANES.map((lane) => (
              <option key={lane.id} value={lane.id}>
                {lane.label}
              </option>
            ))}
            <option value="blocked">Com bloqueios</option>
          </select>

          {/* System Filter */}
          <select
            className="super-filter-select"
            value={selectedSystem}
            onChange={(e) => setSelectedSystem(e.target.value)}
            aria-label="Filtrar por sistema"
          >
            <option value="all">Todos os sistemas</option>
            {systemsSummary.map((sys) => (
              <option key={sys.name} value={sys.name}>
                {sys.name}
              </option>
            ))}
          </select>
        </div>

        {/* Clear filters action */}
        {hasActiveFilters && (
          <button
            type="button"
            className="super-filter-clear-btn"
            onClick={clearAllFilters}
          >
            <X size={13} />
            Limpar filtros
          </button>
        )}
      </section>

      {/* 4. Top Main Layout: System Cards Grid (Left) + Leitura Executiva / Destaques (Right) */}
      <div className="super-main-layout">
        <div className="super-systems-container">
          <SuperSystemCards
            systems={systemsSummary}
            selectedSystem={selectedSystem}
            onSelectSystem={setSelectedSystem}
          />
        </div>

        <SuperExecutiveSidebar
          blockedSprints={blockedSprintsList}
          featuredSprints={featuredSprintsList}
          getSystemColor={getSystemColor}
          onOpenSprint={(sprint) => setSelectedSprint(sprint)}
        />
      </div>

      {/* 5. Consolidated System Tracking Table */}
      <SuperSystemTable
        rows={systemTableRows}
        onOpenSprint={(sprint) => setSelectedSprint(sprint)}
      />

      {/* 6. Bottom Layout: Deliveries Chart & Drilldown (Left) + Distribution (Right) */}
      <div className="super-bottom-layout">
        <SuperDeliveriesChart
          deliveryEvents={deliveryEvents}
          weeklyDeliveriesCount={weeklyDeliveriesCount}
          monthlyDeliveriesCount={monthlyDeliveriesCount}
          totalDeliveredPf={totalDeliveredPf}
          onOpenSprint={(sprint) => setSelectedSprint(sprint)}
        />

        <SuperPortfolioDistribution
          distribution={portfolioDistribution}
          totalSprints={filteredSprints.length}
          selectedLane={selectedLane}
          onSelectLane={setSelectedLane}
        />
      </div>

      {/* 7. Interactive Sprint Details Modal */}
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
