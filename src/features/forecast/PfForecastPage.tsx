import { useState, useMemo } from 'react';
import { useSprints } from '../../app/providers/SprintProvider';
import type { Sprint } from '../../domain/sprint/model';
import { sprintSystem } from '../../domain/sprint/queries';
import { SprintDetailsModal } from '../sprints/components/SprintDetailsModal';
import { PfForecastFilterBar, type PfFilterState } from './components/PfForecastFilterBar';
import { PfFinancialKpis, type PfKpiSummary } from './components/PfFinancialKpis';
import { PfComparisonChart } from './components/PfComparisonChart';
import { PfFlowDistributionChart } from './components/PfFlowDistributionChart';
import { PfCriticalSidebar, type CriticalItem } from './components/PfCriticalSidebar';
import { PfLaneGrid } from './components/PfLaneGrid';
import { PfImprovementModal, type PfImprovement } from './components/PfImprovementModal';
import { PfMacroHistoryPanel } from './components/PfMacroHistoryPanel';
import { PfMonthlyRepository } from '../../repositories/local-storage/PfMonthlyRepository';
import { pfDisplayName } from '../../domain/pf/model';
import { getSystemColor } from '../../domain/project/colors';
import { useForecastMonth } from './ForecastMonthContext';
import './forecast.css';

const PF_IMPROVEMENTS_KEY = 'painelpro-pf-improvements';
const DEFAULT_IMPROVEMENTS: PfImprovement[] = [
  {
    id: 'IMP-01',
    title: 'Revisar estimativas das OSs do MAPI',
    description: 'Validar as estimativas antes da homologação.',
    system: 'MAPI',
    serviceOrder: '',
    owner: 'Camila Pereira',
    priority: 'Alta',
    status: 'Resolvido',
    resolved: true,
    createdAt: new Date().toISOString(),
    resolvedAt: new Date().toISOString(),
  },
  {
    id: 'IMP-02',
    title: 'Padronizar classificação de situações',
    description: 'Revisar o uso das raias financeiras.',
    system: '',
    serviceOrder: '',
    owner: 'Camila Pereira',
    priority: 'Média',
    status: 'A analisar',
    resolved: false,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'IMP-03',
    title: 'Reduzir lead time em homologação',
    description: 'Definir prazo e responsável para retorno da área dona.',
    system: '',
    serviceOrder: '',
    owner: 'Camila Pereira',
    priority: 'Alta',
    status: 'Em tratamento',
    resolved: false,
    createdAt: new Date().toISOString(),
  },
];

function loadImprovements(): PfImprovement[] {
  try {
    const data = JSON.parse(localStorage.getItem(PF_IMPROVEMENTS_KEY) || 'null');
    return Array.isArray(data) ? data : DEFAULT_IMPROVEMENTS;
  } catch {
    return DEFAULT_IMPROVEMENTS;
  }
}

function saveImprovements(items: PfImprovement[]) {
  localStorage.setItem(PF_IMPROVEMENTS_KEY, JSON.stringify(items));
}

function getMonthLabel(value: string): string {
  const [year, month] = value.split('-').map(Number);
  const date = new Date(year, month - 1, 1);
  const label = new Intl.DateTimeFormat('pt-BR', { month: 'long', year: 'numeric' }).format(date);
  return label.charAt(0).toUpperCase() + label.slice(1);
}

const DEFAULT_FILTERS: PfFilterState = {
  project: 'all',
  os: 'all',
  po: 'all',
  manager: 'all',
  lane: 'all',
  query: '',
};

export function PfForecastPage() {
  const {
    sprints,
    updateSprint,
    createTask,
    updateTask,
    moveTask,
    deleteTask,
    auditLogs,
  } = useSprints();

  const { currentMonth } = useForecastMonth();

  const [filters, setFilters] = useState<PfFilterState>(DEFAULT_FILTERS);
  const [improvements, setImprovements] = useState<PfImprovement[]>(loadImprovements);
  const [isImprovementModalOpen, setIsImprovementModalOpen] = useState(false);
  const [selectedSprint, setSelectedSprint] = useState<Sprint | null>(null);
  const [macroRecords] = useState(() => new PfMonthlyRepository().list());
  const operationalSprints = useMemo(() => sprints.filter((sprint) => !sprint.code.startsWith('MACRO-')), [sprints]);

  // 1. Unique select options from all sprints
  const projects = useMemo(
    () => [...new Set(operationalSprints.map(sprintSystem))].sort((a, b) => a.localeCompare(b, 'pt-BR')),
    [operationalSprints]
  );

  const serviceOrders = useMemo(
    () =>
      operationalSprints
        .map((s) => ({
          code: s.code,
          os: s.serviceOrder,
          system: sprintSystem(s),
        }))
        .filter((so) => Boolean(so.os || so.code))
        .sort((a, b) => (a.os || a.code).localeCompare(b.os || b.code, 'pt-BR')),
    [operationalSprints]
  );

  const uniqueOsList = useMemo(
    () =>
      [...new Set(operationalSprints.map((s) => s.serviceOrder).filter(Boolean) as string[])].sort((a, b) =>
        a.localeCompare(b, 'pt-BR')
      ),
    [operationalSprints]
  );

  const pos = useMemo(
    () =>
      [...new Set(operationalSprints.map((s) => s.po).filter(Boolean) as string[])].sort((a, b) =>
        a.localeCompare(b, 'pt-BR')
      ),
    [operationalSprints]
  );

  const managers = useMemo(
    () =>
      [
        ...new Set(
          operationalSprints
            .map((s) => (s.projectManager || s.manager || s.technicalLead) as string)
            .filter(Boolean)
        ),
      ].sort((a, b) => a.localeCompare(b, 'pt-BR')),
    [operationalSprints]
  );

  // 2. Sprints filtered by Month and Search/Filters
  const filteredSprints = useMemo(() => {
    return operationalSprints.filter((sprint) => {
      const sys = sprintSystem(sprint);

      // Month match (compare normalized billingForecastMonth or fallback)
      const sprintMonth = sprint.billingForecastMonth || currentMonth;
      if (sprintMonth !== currentMonth) {
        return false;
      }

      // Project filter
      if (filters.project !== 'all' && sys !== filters.project) {
        return false;
      }

      // OS filter
      if (filters.os !== 'all' && sprint.serviceOrder !== filters.os) {
        return false;
      }

      // PO filter
      if (filters.po !== 'all' && sprint.po !== filters.po) {
        return false;
      }

      // Manager filter
      if (filters.manager !== 'all') {
        const mgr = sprint.projectManager || sprint.manager || sprint.technicalLead;
        if (mgr !== filters.manager) return false;
      }

      // Lane filter
      if (filters.lane !== 'all' && sprint.lane !== filters.lane) {
        return false;
      }

      // Search Query
      if (filters.query.trim()) {
        const q = filters.query.trim().toLowerCase();
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

      return true;
    });
  }, [operationalSprints, currentMonth, filters]);

  // 3. Financial Summary KPIs
  const summary: PfKpiSummary = useMemo(() => {
    const estimated = filteredSprints.reduce(
      (sum, s) => sum + Number(s.functionPoints || 0),
      0
    );
    const detailed = filteredSprints.reduce(
      (sum, s) => sum + Number(s.detailedFunctionPoints || 0),
      0
    );
    const inDevelopment = filteredSprints.filter((s) => s.lane === 'development').length;
    const delivered = filteredSprints.filter((s) =>
      ['approved', 'billing', 'completed'].includes(s.lane)
    ).length;
    const waitingBilling = filteredSprints
      .filter((s) => s.lane === 'billing')
      .reduce((sum, s) => sum + Number(s.detailedFunctionPoints || s.functionPoints || 0), 0);
    const monthlyMacroDetailed = macroRecords
      .filter((record) => record.month === currentMonth)
      .filter((record) => filters.project === 'all' || record.project === filters.project || pfDisplayName(record) === filters.project)
      .filter((record) => filters.manager === 'all' || record.manager === filters.manager)
      .reduce((sum, record) => sum + Number(record.detailedPf || 0), 0);

    return {
      estimatedPf: estimated,
      detailedPf: detailed + monthlyMacroDetailed,
      developmentCount: inDevelopment,
      deliveredCount: delivered,
      waitingBillingPf: waitingBilling,
    };
  }, [filteredSprints, macroRecords, currentMonth, filters.project, filters.manager]);

  // 4. Critical Items derivation
  const criticalItems: CriticalItem[] = useMemo(() => {
    const items: CriticalItem[] = [];
    const now = Date.now();

    filteredSprints.forEach((sprint) => {
      const blocked = Number(sprint.blocked || 0);
      const pf = Number(sprint.functionPoints || 0);
      const osLabel = sprint.serviceOrder || sprint.code;

      if (blocked > 0) {
        items.push({
          tone: 'red',
          icon: 'alert',
          title: `${blocked} task${blocked > 1 ? 's' : ''} bloqueada${blocked > 1 ? 's' : ''}`,
          detail: `${osLabel} · impacto de ${pf} PF`,
          sprint,
        });
      }

      if (sprint.lane === 'billing' && !sprint.detailedFunctionPoints) {
        items.push({
          tone: 'orange',
          icon: 'clock',
          title: 'PF detalhado pendente',
          detail: `${osLabel} · aguardando análise`,
          sprint,
        });
      }

      const lastUpdated = sprint.lastUpdated ? new Date(sprint.lastUpdated).getTime() : 0;
      if (lastUpdated > 0 && now - lastUpdated > 7 * 86400000) {
        items.push({
          tone: 'purple',
          icon: 'rotate',
          title: 'OS sem atualização recente',
          detail: `${osLabel} · ${sprintSystem(sprint)}`,
          sprint,
        });
      }
    });

    return items.slice(0, 5);
  }, [filteredSprints]);

  // Handler for updating a filter property
  function handleFilterChange<K extends keyof PfFilterState>(key: K, value: PfFilterState[K]) {
    setFilters((prev) => ({ ...prev, [key]: value }));
  }

  // Handler for resetting filters
  function handleResetFilters() {
    setFilters(DEFAULT_FILTERS);
  }

  // Handler for toggle improvement
  function handleToggleImprovement(id: string, resolved: boolean) {
    const updated = improvements.map((item) => {
      if (item.id === id) {
        return {
          ...item,
          resolved,
          status: resolved ? 'Resolvido' : 'Em tratamento',
          resolvedAt: resolved ? new Date().toISOString() : null,
          resolvedBy: resolved ? 'Camila Pereira' : null,
        };
      }
      return item;
    });

    setImprovements(updated);
    saveImprovements(updated);
  }

  // Handler for adding improvement
  function handleAddImprovement(newImprovement: PfImprovement) {
    const updated = [newImprovement, ...improvements];
    setImprovements(updated);
    saveImprovements(updated);
  }

  const currentModalSprint = selectedSprint
    ? sprints.find((s) => s.code === selectedSprint.code) || selectedSprint
    : null;

  const monthName = getMonthLabel(currentMonth);

  return (
    <div className="pf-container">
      {/* Filter Toolbar */}
      <PfForecastFilterBar
        filters={filters}
        onFilterChange={handleFilterChange}
        onResetFilters={handleResetFilters}
        projects={projects}
        serviceOrders={uniqueOsList}
        pos={pos}
        managers={managers}
      />

      {/* 3. Financial KPI Cards */}
      <PfFinancialKpis summary={summary} monthName={monthName} />

      <PfMacroHistoryPanel
        records={macroRecords}
        month={currentMonth}
        project={filters.project}
        manager={filters.manager}
        getSystemColor={getSystemColor}
      />

      {/* 4. Main Financial Grid: Comparison & Flow (Left) + Critical Points (Right) */}
      <div className="pf-dashboard-grid">
        <div className="pf-main-column">
          <PfComparisonChart
            sprints={filteredSprints}
            totalEstimated={summary.estimatedPf}
            totalDetailed={summary.detailedPf}
            onSelectProject={(sys) => handleFilterChange('project', sys)}
          />

          <PfFlowDistributionChart
            sprints={filteredSprints}
            onSelectProject={(sys) => handleFilterChange('project', sys)}
          />
        </div>

        <PfCriticalSidebar
          criticalItems={criticalItems}
          improvements={improvements}
          onOpenImprovementModal={() => setIsImprovementModalOpen(true)}
          onToggleImprovement={handleToggleImprovement}
          onOpenSprint={(sprint) => setSelectedSprint(sprint)}
        />
      </div>

      {/* 5. Previsão por OS (Kanban de OSs por Situação) */}
      <PfLaneGrid
        sprints={filteredSprints}
        monthLabel={monthName}
        getSystemColor={getSystemColor}
        onOpenSprint={(sprint) => setSelectedSprint(sprint)}
      />

      {/* 6. Improvement Modal */}
      <PfImprovementModal
        isOpen={isImprovementModalOpen}
        onClose={() => setIsImprovementModalOpen(false)}
        onAddImprovement={handleAddImprovement}
        systems={projects}
        serviceOrders={serviceOrders}
      />

      {/* 7. Sprint Details Modal */}
      {currentModalSprint && (
        <SprintDetailsModal
          sprint={currentModalSprint}
          initialTab="summary"
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
