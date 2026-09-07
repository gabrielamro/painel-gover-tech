import { useMemo } from 'react';
import { ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react';
import { Bar, BarChart, CartesianGrid, LabelList, Tooltip, XAxis, YAxis } from 'recharts';
import type { Sprint } from '../../../domain/sprint/model';
import { sprintSystem } from '../../../domain/sprint/queries';
import { formatPF } from '../../../domain/billing/format';
import { ChartContainer } from '../../../components/charts/ChartContainer';
import { ChartTooltip } from '../../../components/charts/ChartTooltip';
import { chartAxisTick, chartTheme } from '../../../components/charts/chartTheme';

interface SystemComparison {
  system: string;
  estimated: number;
  detailed: number;
  delta: number;
  percent: number;
}

interface Props {
  sprints: Sprint[];
  totalEstimated: number;
  totalDetailed: number;
  onSelectProject: (system: string) => void;
}

export function PfComparisonChart({
  sprints,
  totalEstimated,
  totalDetailed,
  onSelectProject,
}: Props) {
  const groups = useMemo(() => {
    const map = new Map<string, { estimated: number; detailed: number }>();

    sprints.forEach((s) => {
      const sys = sprintSystem(s);
      const curr = map.get(sys) || { estimated: 0, detailed: 0 };
      curr.estimated += Number(s.functionPoints || 0);
      curr.detailed += Number(s.detailedFunctionPoints || 0);
      map.set(sys, curr);
    });

    const list: SystemComparison[] = Array.from(map.entries())
      .map(([system, data]) => {
        const delta = data.detailed - data.estimated;
        const percent = data.estimated ? Math.abs((delta / data.estimated) * 100) : data.detailed > 0 ? 100 : 0;
        return {
          system,
          estimated: data.estimated,
          detailed: data.detailed,
          delta,
          percent,
        };
      })
      .sort((a, b) => b.estimated - a.estimated || b.detailed - a.detailed);

    return list;
  }, [sprints]);

  const totalDelta = totalDetailed - totalEstimated;
  const totalPercent = totalEstimated
    ? Math.abs((totalDelta / totalEstimated) * 100)
    : totalDetailed > 0
    ? 100
    : 0;

  return (
    <section className="pf-panel pf-comparison-panel">
      <header className="pf-panel__header">
        <div className="pf-panel__title-group">
          <span className="pf-panel__eyebrow">ANÁLISE FINANCEIRA</span>
          <h2 className="pf-panel__title">PF estimado × PF detalhado</h2>
        </div>

        <div className="pf-summary-values">
          <div className="pf-summary-item">
            <small>Estimado</small>
            <strong>{formatPF(totalEstimated)} PF</strong>
          </div>
          <div className="pf-summary-item">
            <small>Detalhado</small>
            <strong>{formatPF(totalDetailed)} PF</strong>
          </div>
          <div className="pf-summary-item">
            <small>Variação</small>
            <strong>
              {totalDelta >= 0 ? '+' : ''}
              {formatPF(totalDelta)} PF
            </strong>
          </div>

          <div
            className={`pf-delta-badge ${
              totalDelta > 0.01 ? 'up' : totalDelta < -0.01 ? 'down' : 'neutral'
            }`}
          >
            {totalDelta > 0.01 ? (
              <>
                <ArrowUpRight size={13} />
                <span>+{formatPF(totalPercent)}% crescimento</span>
              </>
            ) : totalDelta < -0.01 ? (
              <>
                <ArrowDownRight size={13} />
                <span>-{formatPF(totalPercent)}% redução</span>
              </>
            ) : (
              <>
                <Minus size={13} />
                <span>Sem alteração</span>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Legend */}
      <div className="pf-chart-legend">
        <span>
          <i className="dot estimated" />
          PF estimado
        </span>
        <span>
          <i className="dot detailed" />
          PF detalhado
        </span>
      </div>

      {groups.length > 0 ? (
        <ChartContainer
          height={Math.max(170, groups.length * 42)}
          label="Comparação de PF estimado e PF detalhado por projeto"
          className="pf-recharts"
        >
          <BarChart data={groups} layout="vertical" margin={{ top: 4, right: 58, bottom: 0, left: 8 }} barCategoryGap={8} barGap={2} accessibilityLayer>
            <CartesianGrid horizontal={false} stroke={chartTheme.grid} />
            <XAxis type="number" hide />
            <YAxis type="category" dataKey="system" width={126} tick={{ ...chartAxisTick, fill: chartTheme.text, fontWeight: 600 }} axisLine={false} tickLine={false} />
            <Tooltip content={<ChartTooltip valueFormatter={(value) => `${formatPF(value)} PF`} />} />
            <Bar dataKey="estimated" name="PF estimado" fill={chartTheme.primary} radius={[0, 3, 3, 0]} maxBarSize={12} onClick={(_, index) => onSelectProject(groups[index].system)} cursor="pointer" isAnimationActive="auto">
              <LabelList dataKey="estimated" position="right" formatter={(value) => formatPF(Number(value))} fill={chartTheme.muted} fontSize={10} />
            </Bar>
            <Bar dataKey="detailed" name="PF detalhado" fill={chartTheme.secondary} radius={[0, 3, 3, 0]} maxBarSize={12} onClick={(_, index) => onSelectProject(groups[index].system)} cursor="pointer" isAnimationActive="auto">
              <LabelList dataKey="detailed" position="right" formatter={(value) => formatPF(Number(value))} fill={chartTheme.muted} fontSize={10} />
            </Bar>
          </BarChart>
        </ChartContainer>
      ) : (
        <div className="pf-empty">Nenhuma OS prevista para este recorte.</div>
      )}
    </section>
  );
}
