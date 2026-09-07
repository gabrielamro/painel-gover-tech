import { useMemo } from 'react';
import { Bar, BarChart, CartesianGrid, LabelList, Tooltip, XAxis, YAxis } from 'recharts';
import type { Sprint } from '../../../domain/sprint/model';
import { sprintSystem } from '../../../domain/sprint/queries';
import { formatPF } from '../../../domain/billing/format';
import { ChartContainer } from '../../../components/charts/ChartContainer';
import { ChartTooltip } from '../../../components/charts/ChartTooltip';
import { chartAxisTick, chartTheme } from '../../../components/charts/chartTheme';

interface SystemFlow {
  system: string;
  execution: number;
  delivery: number;
  total: number;
}

interface Props {
  sprints: Sprint[];
  onSelectProject: (system: string) => void;
}

export function PfFlowDistributionChart({ sprints, onSelectProject }: Props) {
  const groups = useMemo(() => {
    const map = new Map<string, { execution: number; delivery: number }>();

    sprints.forEach((s) => {
      const sys = sprintSystem(s);
      const curr = map.get(sys) || { execution: 0, delivery: 0 };
      const pf = Number(s.functionPoints || 0);

      if (['planning', 'planned', 'development'].includes(s.lane)) {
        curr.execution += pf;
      } else if (['homologation', 'approved', 'billing', 'completed'].includes(s.lane)) {
        curr.delivery += pf;
      }

      map.set(sys, curr);
    });

    const list: SystemFlow[] = Array.from(map.entries())
      .map(([system, data]) => ({
        system,
        execution: data.execution,
        delivery: data.delivery,
        total: data.execution + data.delivery,
      }))
      .sort((a, b) => b.total - a.total);

    return list;
  }, [sprints]);

  return (
    <section className="pf-panel pf-flow-panel">
      <header className="pf-panel__header">
        <div className="pf-panel__title-group">
          <span className="pf-panel__eyebrow">DISTRIBUIÇÃO</span>
          <h2 className="pf-panel__title">Etapa e projeto</h2>
        </div>
        <span className="pf-panel__count-badge">Valores em PF</span>
      </header>

      {/* Legend */}
      <div className="pf-chart-legend compact">
        <span>
          <i className="dot execution" />
          Preparação e execução
        </span>
        <span>
          <i className="dot delivery" />
          Fluxo de entrega
        </span>
      </div>

      {groups.length > 0 ? (
        <ChartContainer
          height={Math.max(170, groups.length * 42)}
          label="Distribuição de PF por etapa e projeto"
          className="pf-recharts"
        >
          <BarChart data={groups} layout="vertical" margin={{ top: 4, right: 58, bottom: 0, left: 8 }} barCategoryGap={8} barGap={2} accessibilityLayer>
            <CartesianGrid horizontal={false} stroke={chartTheme.grid} />
            <XAxis type="number" hide />
            <YAxis type="category" dataKey="system" width={126} tick={{ ...chartAxisTick, fill: chartTheme.text, fontWeight: 600 }} axisLine={false} tickLine={false} />
            <Tooltip content={<ChartTooltip valueFormatter={(value) => `${formatPF(value)} PF`} />} />
            <Bar dataKey="execution" name="Preparação e execução" fill={chartTheme.primary} radius={[0, 3, 3, 0]} maxBarSize={12} onClick={(_, index) => onSelectProject(groups[index].system)} cursor="pointer" isAnimationActive="auto">
              <LabelList dataKey="execution" position="right" formatter={(value) => formatPF(Number(value))} fill={chartTheme.muted} fontSize={10} />
            </Bar>
            <Bar dataKey="delivery" name="Fluxo de entrega" fill={chartTheme.success} radius={[0, 3, 3, 0]} maxBarSize={12} onClick={(_, index) => onSelectProject(groups[index].system)} cursor="pointer" isAnimationActive="auto">
              <LabelList dataKey="delivery" position="right" formatter={(value) => formatPF(Number(value))} fill={chartTheme.muted} fontSize={10} />
            </Bar>
          </BarChart>
        </ChartContainer>
      ) : (
        <div className="pf-empty">Sem distribuição para o período.</div>
      )}
    </section>
  );
}
