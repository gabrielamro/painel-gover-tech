import React, { useState, useMemo } from 'react';
import { Box } from '@mui/material';
import GroupsOutlinedIcon from '@mui/icons-material/GroupsOutlined';
import CheckCircleOutlinedIcon from '@mui/icons-material/CheckCircleOutlined';
import EventAvailableOutlinedIcon from '@mui/icons-material/EventAvailableOutlined';
import WarningAmberRoundedIcon from '@mui/icons-material/WarningAmberRounded';

import { useSprints } from '../../app/providers/SprintProvider';
import { sprintSystem } from '../../domain/sprint/queries';
import type { Sprint } from '../../domain/sprint/model';
import { SprintDetailsModal } from '../sprints/components/SprintDetailsModal';

import {
  DashboardHeader,
  ExecutiveKpiCard,
  ContractConsumptionCard,
  ProjectPipeline,
  DecisionsHighlights,
  SupportSummary,
  DeliveriesBySystemChart,
  DeliveryForecastChart,
  PortfolioStatusChart,
  SprintsBySystemChart,
} from './components';

import type {
  PipelineProject,
  DecisionHighlightItem,
  SystemDeliveryData,
  SystemSprintsData,
  PortfolioStatusItem,
  DeliveryForecastWeek,
} from './types';

import './superintendence.css';

// Fallback baseline projects for the executive 4x2 grid
const BASELINE_PIPELINE_PROJECTS: Array<Omit<PipelineProject, 'sprintRef'>> = [
  {
    id: 'proj-simnac-web',
    code: 'SIMNAC-01',
    system: 'SIMNAC',
    subsystem: 'Web',
    title: 'Consultar solicitações e vistorias',
    status: 'development',
    dueDate: '14/08',
    deadlineStatus: 'on_time',
  },
  {
    id: 'proj-simnac-mob',
    code: 'SIMNAC-02',
    system: 'SIMNAC',
    subsystem: 'Mobile',
    title: 'Check-in de fiscais e upload de fotos',
    status: 'homologation',
    dueDate: '18/08',
    deadlineStatus: 'on_time',
  },
  {
    id: 'proj-sagat-rec',
    code: 'SAGAT-01',
    system: 'SAGAT',
    subsystem: 'Recepção',
    title: 'Protocolo eletrônico e triagem inicial',
    status: 'development',
    dueDate: '20/08',
    deadlineStatus: 'on_time',
  },
  {
    id: 'proj-sagat-ana',
    code: 'SAGAT-02',
    system: 'SAGAT',
    subsystem: 'Análise',
    title: 'Validação documental com assinatura digital',
    status: 'development',
    dueDate: '10/08',
    deadlineStatus: 'at_risk',
  },
  {
    id: 'proj-sciex-imp',
    code: 'SCIEX-01',
    system: 'SCIEX',
    subsystem: 'Importação',
    title: 'Integrações e APIs Siscomex / Receita',
    status: 'development',
    dueDate: '12/08',
    deadlineStatus: 'at_risk',
  },
  {
    id: 'proj-sciex-exp',
    code: 'SCIEX-02',
    system: 'SCIEX',
    subsystem: 'Exportação',
    title: 'Desembaraço aduaneiro e declarações',
    status: 'acceptance',
    dueDate: '25/08',
    deadlineStatus: 'on_time',
  },
  {
    id: 'proj-spr-mapp',
    code: 'SPR-01',
    system: 'SPR',
    subsystem: 'MAPP',
    title: 'Mapeamento de processos e fluxos Suframa',
    status: 'development',
    dueDate: '22/08',
    deadlineStatus: 'on_time',
  },
  {
    id: 'proj-sac',
    code: 'SAC-01',
    system: 'SAC',
    subsystem: 'Atendimento',
    title: 'Canal de atendimento ao cidadão e ouvidoria',
    status: 'completed',
    dueDate: '04/08',
    deadlineStatus: 'on_time',
  },
];

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

  // Header Filters State
  const [selectedPeriod, setSelectedPeriod] = useState<string>('Julho de 2026');
  const [selectedVision, setSelectedVision] = useState<string>('all');
  const [selectedSystem, setSelectedSystem] = useState<string>('all');
  const [kpiFilter, setKpiFilter] = useState<string | null>(null);

  // Modal State
  const [selectedSprint, setSelectedSprint] = useState<Sprint | null>(null);

  // List of unique systems from sprints
  const systemOptions = useMemo(() => {
    const set = new Set<string>();
    sprints.forEach((s) => {
      const sys = sprintSystem(s);
      if (sys) set.add(sys);
    });
    // Ensure default core systems are represented
    ['SIMNAC', 'SCIEX', 'SAGAT', 'SPR', 'CADSUF', 'SAC'].forEach((s) => set.add(s));
    return Array.from(set).sort((a, b) => a.localeCompare(b, 'pt-BR'));
  }, [sprints]);

  // Derived Pipeline Projects (matching real sprints when available + fallback baseline)
  const pipelineProjects = useMemo<PipelineProject[]>(() => {
    // Map existing sprints to pipeline format
    const mappedSprints: PipelineProject[] = sprints
      .filter((s) => s.lane !== 'completed' || sprints.length <= 4)
      .map((s) => {
        const sys = sprintSystem(s) || 'SISTEMA';
        let status: PipelineProject['status'] = 'development';
        if (s.lane === 'homologation') status = 'homologation';
        else if (['approved', 'billing'].includes(s.lane)) status = 'acceptance';
        else if (s.lane === 'completed') status = 'completed';

        let deadlineStatus: PipelineProject['deadlineStatus'] = 'on_time';
        if (Number(s.blocked || 0) > 0 || Number(s.health || 100) < 60) {
          deadlineStatus = 'at_risk';
        }
        if (Number(s.health || 100) < 40) {
          deadlineStatus = 'delayed';
        }

        const dateFormatted = s.end
          ? new Date(s.end).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
          : '14/08';

        return {
          id: s.code,
          code: s.code,
          system: sys,
          subsystem: s.module || (s.system?.includes('/') ? s.system.split('/')[1]?.trim() : 'Web'),
          title: s.objective || s.project,
          status,
          dueDate: dateFormatted,
          deadlineStatus,
          sprintRef: s,
        };
      });

    // Merge with baseline projects to ensure an executive, dense 8-card grid
    const mergedMap = new Map<string, PipelineProject>();
    mappedSprints.forEach((p) => mergedMap.set(p.system.toUpperCase(), p));

    BASELINE_PIPELINE_PROJECTS.forEach((base) => {
      const key = `${base.system}-${base.subsystem}`.toUpperCase();
      if (!mergedMap.has(key)) {
        // Link with real sprint if matching system exists
        const matchingSprint = sprints.find((s) => sprintSystem(s) === base.system);
        mergedMap.set(key, {
          ...base,
          sprintRef: matchingSprint || null,
        });
      }
    });

    let list = Array.from(mergedMap.values());

    // Apply System Filter
    if (selectedSystem !== 'all') {
      list = list.filter((p) => p.system.toLowerCase() === selectedSystem.toLowerCase());
    }

    // Apply Vision Filter
    if (selectedVision === 'critical') {
      list = list.filter((p) => p.deadlineStatus === 'at_risk' || p.deadlineStatus === 'delayed');
    } else if (selectedVision === 'active') {
      list = list.filter((p) => p.status === 'development' || p.status === 'homologation');
    }

    // Apply KPI Filter if clicked
    if (kpiFilter === 'development') {
      list = list.filter((p) => p.status === 'development');
    } else if (kpiFilter === 'blocked') {
      list = list.filter((p) => p.deadlineStatus === 'at_risk' || p.deadlineStatus === 'delayed');
    } else if (kpiFilter === 'completed') {
      list = list.filter((p) => p.status === 'completed');
    }

    return list.slice(0, 8);
  }, [sprints, selectedSystem, selectedVision, kpiFilter]);

  // Derived Decisions & Highlights
  const decisionItems = useMemo<DecisionHighlightItem[]>(() => {
    const list: DecisionHighlightItem[] = [];

    // Check sprints with blockers or notes
    sprints.forEach((s) => {
      if (Number(s.blocked || 0) > 0 || s.priorityLevel === 'Crítica' || s.isFeatured) {
        const sys = sprintSystem(s);
        list.push({
          id: `dec-${s.code}`,
          title: `${sys} ${s.module || ''}`.trim(),
          description: s.featuredNote || s.objective || 'Aguardando validação e desbloqueio.',
          date: s.lastUpdated ? new Date(s.lastUpdated).toLocaleDateString('pt-BR') : '05/08/2026',
          severity: Number(s.blocked || 0) > 0 ? 'critical' : 'warning',
          sprintRef: s,
        });
      }
    });

    // Default executive highlights to match prompt reference
    const defaultDecisions: DecisionHighlightItem[] = [
      {
        id: 'dec-simnac-mob',
        title: 'SIMNAC Mobile',
        description: 'Homologação disponível para testes de campo',
        date: '05/08/2026',
        severity: 'warning',
      },
      {
        id: 'dec-sagat-ana',
        title: 'SAGAT Análise',
        description: 'Validar regra de documentos – Cliente até 10/08',
        date: '10/08/2026',
        severity: 'warning',
      },
      {
        id: 'dec-spr-mcpp',
        title: 'SPR MCPP',
        description: 'Revisão de cadastro e parametrização',
        date: '12/08/2026',
        severity: 'info',
      },
    ];

    defaultDecisions.forEach((def) => {
      if (!list.some((item) => item.title.includes(def.title))) {
        list.push(def);
      }
    });

    return list.slice(0, 5);
  }, [sprints]);

  // Derived Deliveries by System (BarChart data)
  const deliveriesBySystemData = useMemo<SystemDeliveryData[]>(() => {
    const countMap: Record<string, number> = {
      SIMNAC: 4,
      SCIEX: 4,
      SAGAT: 3,
      SPR: 3,
      CADSUF: 2,
      SAC: 2,
    };

    // Augment with real sprint deliveries if present
    sprints.forEach((s) => {
      const sys = sprintSystem(s);
      const dels = Number(s.deliveries || 0) + (s.lane === 'completed' ? 1 : 0);
      if (dels > 0 && sys) {
        countMap[sys] = (countMap[sys] || 0) + dels;
      }
    });

    return Object.entries(countMap).map(([sistema, entregas]) => ({
      sistema,
      entregas,
    }));
  }, [sprints]);

  // Derived Sprints by System (Stacked BarChart data)
  const sprintsBySystemData = useMemo<SystemSprintsData[]>(() => {
    return [
      { sistema: 'SCIEX', entregues: 4, emAndamento: 3, total: 7 },
      { sistema: 'SIMNAC', entregues: 4, emAndamento: 2, total: 6 },
      { sistema: 'SPR', entregues: 3, emAndamento: 3, total: 6 },
      { sistema: 'SAGAT', entregues: 3, emAndamento: 2, total: 5 },
      { sistema: 'CADSUF', entregues: 2, emAndamento: 1, total: 3 },
    ];
  }, []);

  // Derived Portfolio Status (Donut data)
  const portfolioStatusData = useMemo<PortfolioStatusItem[]>(() => {
    return [
      { name: 'No Prazo', value: 7, color: '#16A34A' },
      { name: 'Em Risco', value: 2, color: '#F59E0B' },
      { name: 'Atrasado', value: 1, color: '#EF4444' },
      { name: 'Homologação', value: 2, color: '#7C3AED' },
    ];
  }, []);

  // Forecast data
  const deliveryForecastData: DeliveryForecastWeek[] = [
    { semana: '01–02', confirmadas: 3, risco: 0, meta: 3 },
    { semana: '03–09', confirmadas: 4, risco: 1, meta: 5 },
    { semana: '10–16', confirmadas: 5, risco: 1, meta: 6 },
    { semana: '17–23', confirmadas: 4, risco: 2, meta: 5 },
    { semana: '24–30', confirmadas: 3, risco: 1, meta: 4 },
    { semana: '31', confirmadas: 2, risco: 0, meta: 2 },
  ];

  // Handler to open sprint in details modal
  const handleOpenSprint = (sprint: Sprint | null | undefined) => {
    if (sprint) {
      setSelectedSprint(sprint);
    } else {
      // Open the first available sprint as representative
      if (sprints.length > 0) {
        setSelectedSprint(sprints[0]);
      }
    }
  };

  // Find the live sprint object if updated
  const currentModalSprint = selectedSprint
    ? sprints.find((s) => s.code === selectedSprint.code) || selectedSprint
    : null;

  return (
    <div className="super-exec-dashboard">
      {/* 1. Header Executivo Horizontal */}
      <DashboardHeader
        selectedPeriod={selectedPeriod}
        onPeriodChange={setSelectedPeriod}
        selectedVision={selectedVision}
        onVisionChange={setSelectedVision}
        selectedSystem={selectedSystem}
        onSystemChange={setSelectedSystem}
        systems={systemOptions}
        lastUpdatedText="05/08/2026 10:24"
      />

      {/* 2. Primeira Linha: 5 KPIs Executivos */}
      <section className="super-exec-kpis-grid" aria-label="KPIs Executivos">
        {/* KPI 01 — Times Ativos */}
        <ExecutiveKpiCard
          title="Times Ativos"
          value="12"
          icon={<GroupsOutlinedIcon sx={{ fontSize: 20 }} />}
          iconBg="#DBEAFE"
          iconColor="#2563EB"
          comparison={{
            text: '↑ +2',
            subtext: 'vs. mês anterior',
            isPositive: true,
          }}
          footer="Com melhorias em execução"
          isActive={kpiFilter === 'development'}
          onClick={() => setKpiFilter(kpiFilter === 'development' ? null : 'development')}
        />

        {/* KPI 02 — Entregas no Mês */}
        <ExecutiveKpiCard
          title="Entregas no Mês"
          value="18"
          icon={<CheckCircleOutlinedIcon sx={{ fontSize: 20 }} />}
          iconBg="#DCFCE7"
          iconColor="#16A34A"
          comparison={{
            text: '↑ +20%',
            subtext: 'vs. junho/2026',
            isPositive: true,
          }}
          footer="Melhorias e demandas concluídas"
          isActive={kpiFilter === 'completed'}
          onClick={() => setKpiFilter(kpiFilter === 'completed' ? null : 'completed')}
        />

        {/* KPI 03 — Previsão do Próximo Mês */}
        <ExecutiveKpiCard
          title="Previsão do Próximo Mês"
          value="10"
          icon={<EventAvailableOutlinedIcon sx={{ fontSize: 20 }} />}
          iconBg="#EFF6FF"
          iconColor="#2563EB"
          footer="8 no prazo • 2 em risco"
        />

        {/* KPI 04 — Decisões Pendentes */}
        <ExecutiveKpiCard
          title="Decisões Pendentes"
          value="2"
          icon={<WarningAmberRoundedIcon sx={{ fontSize: 20 }} />}
          iconBg="#FEF3C7"
          iconColor="#F59E0B"
          comparison={{
            text: '↓ -50%',
            subtext: 'vs. mês anterior',
            isPositive: true,
          }}
          footer="Aguardando definição do cliente"
          isActive={kpiFilter === 'blocked'}
          onClick={() => setKpiFilter(kpiFilter === 'blocked' ? null : 'blocked')}
        />

        {/* KPI 05 — Contrato Consumido */}
        <ContractConsumptionCard
          consumedPf="7.469,04 PF"
          consumedPercentage={68}
          remainingPf="3.530,96 PF"
          ceilingPf="11.000 PF"
          periodRange="Outubro de 2025 a Julho de 2026"
        />
      </section>

      {/* 3. Área Central: Pipeline de Projetos (65-70%) + Decisões & Sustentação (30-35%) */}
      <section className="super-exec-middle-grid" aria-label="Iniciativas e Decisões">
        {/* Pipeline de Projetos */}
        <ProjectPipeline
          projects={pipelineProjects}
          onSelectProject={(proj) => handleOpenSprint(proj.sprintRef)}
          onViewAll={() => setSelectedVision('all')}
        />

        {/* Coluna Direita: Decisões e Destaques + Sustentação */}
        <div className="super-exec-right-rail">
          <DecisionsHighlights
            items={decisionItems}
            onSelectItem={(item) => handleOpenSprint(item.sprintRef)}
            onViewAll={() => setSelectedVision('critical')}
          />

          <SupportSummary
            stats={{
              openCount: 14,
              criticalCount: 2,
              slaPercentage: 96,
              resolvedCount: 42,
              periodLabel: 'Julho/2026',
            }}
          />
        </div>
      </section>

      {/* 4. Linha Inferior: 4 Gráficos Analíticos */}
      <section className="super-exec-charts-grid" aria-label="Gráficos Analíticos">
        <DeliveriesBySystemChart
          data={deliveriesBySystemData}
          periodSubtitle="Melhorias entregues em julho de 2026"
        />

        <DeliveryForecastChart
          data={deliveryForecastData}
          subtitle="Compromissos por semana • Agosto de 2026"
        />

        <PortfolioStatusChart
          data={portfolioStatusData}
          totalProjects={12}
        />

        <SprintsBySystemChart
          data={sprintsBySystemData}
        />
      </section>

      {/* 5. Modal de Detalhes da Sprint Integrado */}
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
export default SuperintendencePage;
