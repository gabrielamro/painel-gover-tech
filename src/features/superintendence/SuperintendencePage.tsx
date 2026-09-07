import React, { useState, useMemo } from 'react';
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
} from './types';

import './superintendence.css';

// Exact projects as shown in the reference design
const EXACT_PIPELINE_PROJECTS: Array<Omit<PipelineProject, 'sprintRef'>> = [
  {
    id: 'proj-simnac-web',
    code: 'SIMNAC-01',
    system: 'SIMNAC',
    subsystem: 'Web',
    title: 'Consultar solicitações',
    status: 'development',
    dueDate: '14/08',
    deadlineStatus: 'on_time',
  },
  {
    id: 'proj-simnac-mob',
    code: 'SIMNAC-02',
    system: 'SIMNAC',
    subsystem: 'Mobile',
    title: 'Receber notificações',
    status: 'homologation',
    dueDate: '07/08',
    deadlineStatus: 'on_time',
  },
  {
    id: 'proj-sagat-rec',
    code: 'SAGAT-01',
    system: 'SAGAT',
    subsystem: 'Recepção',
    title: 'Protocolar documentos',
    status: 'development',
    dueDate: '21/08',
    deadlineStatus: 'on_time',
  },
  {
    id: 'proj-sagat-ana',
    code: 'SAGAT-02',
    system: 'SAGAT',
    subsystem: 'Análise',
    title: 'Validar documentos',
    status: 'development',
    dueDate: '21/08',
    deadlineStatus: 'at_risk',
  },
  {
    id: 'proj-sciex-imp',
    code: 'SCIEX-01',
    system: 'SCIEX',
    subsystem: 'Importação',
    title: 'Conferir documentos',
    status: 'homologation',
    dueDate: '14/08',
    deadlineStatus: 'on_time',
  },
  {
    id: 'proj-sciex-exp',
    code: 'SCIEX-02',
    system: 'SCIEX',
    subsystem: 'Exportação',
    title: 'Acompanhar processos',
    status: 'development',
    dueDate: '28/08',
    deadlineStatus: 'on_time',
  },
  {
    id: 'proj-spr-mapp',
    code: 'SPR-01',
    system: 'SPR',
    subsystem: 'MAPP',
    title: 'Consultar indicadores',
    status: 'homologation',
    dueDate: '14/08',
    deadlineStatus: 'on_time',
  },
  {
    id: 'proj-sac',
    code: 'SAC-01',
    system: 'SAC',
    title: 'Acompanhar solicitações',
    status: 'development',
    dueDate: '14/09',
    deadlineStatus: 'on_time',
  },
];

// Exact decisions from the reference design
const EXACT_DECISIONS: DecisionHighlightItem[] = [
  {
    id: 'dec-simnac-mob',
    title: 'SIMNAC Mobile',
    description: 'Homologação disponível',
    date: '05/08/2026',
    severity: 'warning',
  },
  {
    id: 'dec-sagat-ana',
    title: 'SAGAT Análise',
    description: 'Validar regra de documentos – Cliente até 10/08',
    date: '03/08/2026',
    severity: 'warning',
  },
  {
    id: 'dec-spr-mcpp',
    title: 'SPR MCPP',
    description: 'Revisão de cadastro',
    date: '01/08/2026',
    severity: 'info',
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
  const [selectedVision, setSelectedVision] = useState<string>('Todos os projetos');
  const [selectedSystem, setSelectedSystem] = useState<string>('Todos os sistemas');
  const [kpiFilter, setKpiFilter] = useState<string | null>(null);

  // Modal State
  const [selectedSprint, setSelectedSprint] = useState<Sprint | null>(null);

  // Map Real Sprints with Exact Reference Projects
  const pipelineProjects = useMemo<PipelineProject[]>(() => {
    return EXACT_PIPELINE_PROJECTS.map((base) => {
      // Find matching live sprint if present to enable full modal interactivity
      const matchingSprint = sprints.find(
        (s) =>
          sprintSystem(s).toLowerCase() === base.system.toLowerCase() ||
          s.code === base.code
      );
      return {
        ...base,
        sprintRef: matchingSprint || (sprints.length > 0 ? sprints[0] : null),
      };
    });
  }, [sprints]);

  // Map Decisions with Real Sprints
  const decisionItems = useMemo<DecisionHighlightItem[]>(() => {
    return EXACT_DECISIONS.map((dec) => {
      const matching = sprints.find((s) => sprintSystem(s).includes(dec.title.split(' ')[0]));
      return {
        ...dec,
        sprintRef: matching || (sprints.length > 0 ? sprints[0] : null),
      };
    });
  }, [sprints]);

  // Handler to open sprint in details modal
  const handleOpenSprint = (sprint: Sprint | null | undefined) => {
    if (sprint) {
      setSelectedSprint(sprint);
    } else if (sprints.length > 0) {
      setSelectedSprint(sprints[0]);
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
        lastUpdatedText="05/08/2026 10:24"
      />

      {/* 2. Primeira Linha: 5 KPIs Executivos */}
      <section className="super-exec-kpis-grid" aria-label="KPIs Executivos">
        {/* KPI 01 — Times Ativos */}
        <ExecutiveKpiCard
          title="Times Ativos"
          value="12"
          icon={<GroupsOutlinedIcon sx={{ fontSize: 22 }} />}
          iconBg="#EFF6FF"
          iconColor="#2563EB"
          comparison={{
            text: '▲ +2',
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
          icon={<CheckCircleOutlinedIcon sx={{ fontSize: 22 }} />}
          iconBg="#ECFDF5"
          iconColor="#10B981"
          comparison={{
            text: '▲ +20%',
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
          icon={<EventAvailableOutlinedIcon sx={{ fontSize: 22 }} />}
          iconBg="#EFF6FF"
          iconColor="#2563EB"
          comparison={{
            text: '— 0%',
            subtext: 'vs. mês atual',
            isNeutral: true,
          }}
          footer="8 no prazo • 2 em risco"
        />

        {/* KPI 04 — Decisões Pendentes */}
        <ExecutiveKpiCard
          title="Decisões Pendentes"
          value="2"
          icon={<WarningAmberRoundedIcon sx={{ fontSize: 22 }} />}
          iconBg="#FFFBEB"
          iconColor="#F59E0B"
          comparison={{
            text: '▼ -50%',
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
          onViewAll={() => setSelectedVision('Todos os projetos')}
        />

        {/* Coluna Direita: Decisões e Destaques + Sustentação */}
        <div className="super-exec-right-rail">
          <DecisionsHighlights
            items={decisionItems}
            onSelectItem={(item) => handleOpenSprint(item.sprintRef)}
            onViewAll={() => setSelectedVision('Decisões')}
          />

          <SupportSummary
            stats={{
              openCount: 14,
              criticalCount: 2,
              slaPercentage: 96,
              resolvedCount: 42,
              periodLabel: 'Julho/2026',
            }}
            onViewDetails={() => setSelectedVision('Sustentação')}
          />
        </div>
      </section>

      {/* 4. Linha Inferior: 4 Gráficos Analíticos */}
      <section className="super-exec-charts-grid" aria-label="Gráficos Analíticos">
        <DeliveriesBySystemChart
          periodSubtitle="Melhorias entregues em julho de 2026"
          onViewDetails={() => {}}
        />

        <DeliveryForecastChart
          subtitle="Compromissos por semana • Agosto de 2026"
          onViewDetails={() => {}}
        />

        <PortfolioStatusChart
          totalProjects={12}
        />

        <SprintsBySystemChart
          onViewDetails={() => {}}
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
