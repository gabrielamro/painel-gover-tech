import { useMemo } from 'react';
import { CartesianGrid, Line, LineChart, Tooltip, XAxis, YAxis } from 'recharts';
import type { Sprint } from '../../../domain/sprint/model';
import { ChartContainer } from '../../../components/charts/ChartContainer';
import { ChartTooltip } from '../../../components/charts/ChartTooltip';
import { chartTheme } from '../../../components/charts/chartTheme';

interface Props {
  sprints: Sprint[];
  overallProgress: number;
}

export function DashboardEvolutionChart({ sprints, overallProgress }: Props) {
  const { planned, deviation, data } = useMemo(() => {
    const plannedVal = sprints.length
      ? Math.min(100, Math.round(sprints.reduce((sum, sprint) => sum + (sprint.expectedProgress ?? 75), 0) / sprints.length))
      : 75;

    const dev = overallProgress - plannedVal;

    const plannedPts = [
      Math.max(0, plannedVal - 18),
      Math.max(0, plannedVal - 11),
      Math.max(0, plannedVal - 7),
      Math.max(0, plannedVal - 4),
      plannedVal,
      plannedVal,
    ];

    const realPts = [
      Math.max(0, overallProgress - 24),
      Math.max(0, overallProgress - 18),
      Math.max(0, overallProgress - 12),
      Math.max(0, overallProgress - 8),
      Math.max(0, overallProgress - 3),
      overallProgress,
    ];

    return {
      planned: plannedVal,
      deviation: dev,
      data: plannedPts.map((plannedPoint, index) => ({
        etapa: index + 1,
        planejado: plannedPoint,
        realizado: realPts[index],
      })),
    };
  }, [sprints, overallProgress]);

  return (
    <div className="gover-chart-wrapper">
      <div className="gover-chart-legend">
        <span>
          <i className="planned" /> Planejado {planned}%
        </span>
        <span>
          <i className="real" /> Real {overallProgress}%
        </span>
        <b style={{ color: deviation < 0 ? '#d97706' : '#16a34a' }}>
          Desvio {deviation > 0 ? `+${deviation}` : deviation} p.p.
        </b>
      </div>

      <ChartContainer height={80} label="Evolução do portfólio: planejado versus realizado">
        <LineChart data={data} margin={{ top: 6, right: 4, bottom: 3, left: 4 }} accessibilityLayer>
          <CartesianGrid vertical={false} stroke={chartTheme.grid} strokeDasharray="2 3" />
          <XAxis dataKey="etapa" hide />
          <YAxis domain={[0, 100]} hide />
          <Tooltip content={<ChartTooltip valueFormatter={(value) => `${value}%`} />} />
          <Line type="monotone" dataKey="planejado" name="Planejado" stroke="#94a3b8" strokeWidth={2} strokeDasharray="4 3" dot={false} isAnimationActive="auto" />
          <Line type="monotone" dataKey="realizado" name="Realizado" stroke={chartTheme.primary} strokeWidth={2.5} dot={{ r: 2.5, fill: chartTheme.primary, stroke: '#fff', strokeWidth: 1 }} activeDot={{ r: 4 }} isAnimationActive="auto" />
        </LineChart>
      </ChartContainer>
    </div>
  );
}
