import { useState } from 'react';
import { CheckCircle2, Calendar, TrendingUp, X, ArrowUpRight } from 'lucide-react';
import { Bar, BarChart, CartesianGrid, Cell, LabelList, Tooltip, XAxis, YAxis } from 'recharts';
import type { Sprint } from '../../../domain/sprint/model';
import { sprintSystem } from '../../../domain/sprint/queries';
import { ChartContainer } from '../../../components/charts/ChartContainer';
import { ChartTooltip } from '../../../components/charts/ChartTooltip';
import { chartAxisTick, chartTheme } from '../../../components/charts/chartTheme';

export interface DeliveryEvent {
  sprint: Sprint;
  date: Date;
  weekIndex: number; // 0 to 3 (0: most recent week, 3: 4th week ago)
}

interface Props {
  deliveryEvents: DeliveryEvent[];
  weeklyDeliveriesCount: number;
  monthlyDeliveriesCount: number;
  totalDeliveredPf: number;
  onOpenSprint: (sprint: Sprint) => void;
}

export function SuperDeliveriesChart({
  deliveryEvents,
  weeklyDeliveriesCount,
  monthlyDeliveriesCount,
  totalDeliveredPf,
  onOpenSprint,
}: Props) {
  const [selectedWeek, setSelectedWeek] = useState<number | null>(null);

  // Calculate 4 weekly buckets (0: Sem. 1 (mais antiga), 1: Sem. 2, 2: Sem. 3, 3: Sem. 4 (mais recente))
  // In reverse display: Sem 1 (22-28d atrás), Sem 2 (15-21d), Sem 3 (8-14d), Sem 4 (0-7d atrás)
  const weekCounts = [0, 0, 0, 0];
  deliveryEvents.forEach((event) => {
    if (event.weekIndex >= 0 && event.weekIndex <= 3) {
      // event.weekIndex 0 is last 7 days (Sem 4)
      const displayIndex = 3 - event.weekIndex;
      weekCounts[displayIndex] += 1;
    }
  });

  const chartData = weekCounts.map((count, index) => ({
    week: `Sem. ${index + 1}`,
    count,
    index,
  }));

  // Filtered deliveries for drilldown
  const displayedDeliveries = selectedWeek !== null
    ? deliveryEvents.filter((e) => (3 - e.weekIndex) === selectedWeek)
    : deliveryEvents.slice(0, 8);

  return (
    <section className="super-panel super-panel--deliveries">
      <header className="super-panel__header">
        <div className="super-panel__title-group">
          <span className="super-panel__eyebrow">FLUXO DE ENTREGAS</span>
          <h2 className="super-panel__title">Resumo de entregas</h2>
        </div>
        <span className="super-panel__count-badge">Últimos 30 dias</span>
      </header>

      {/* Summary KPI mini-cards */}
      <div className="super-delivery-summary-grid">
        <div className="super-delivery-summary-card">
          <div className="super-delivery-summary-card__icon blue">
            <TrendingUp size={16} />
          </div>
          <div className="super-delivery-summary-card__data">
            <small>Entregas da Semana</small>
            <strong>{weeklyDeliveriesCount}</strong>
            <em>últimos 7 dias</em>
          </div>
        </div>

        <div className="super-delivery-summary-card">
          <div className="super-delivery-summary-card__icon green">
            <CheckCircle2 size={16} />
          </div>
          <div className="super-delivery-summary-card__data">
            <small>Entregas do Mês</small>
            <strong>{monthlyDeliveriesCount}</strong>
            <em>últimos 30 dias</em>
          </div>
        </div>

        <div className="super-delivery-summary-card">
          <div className="super-delivery-summary-card__icon purple">
            <Calendar size={16} />
          </div>
          <div className="super-delivery-summary-card__data">
            <small>Volume em PF</small>
            <strong>{totalDeliveredPf}</strong>
            <em>pontos de função entregues</em>
          </div>
        </div>
      </div>

      {/* Weekly Chart */}
      <div className="super-chart-container">
        <ChartContainer height={150} label="Gráfico de entregas por semana">
          <BarChart data={chartData} margin={{ top: 18, right: 8, bottom: 0, left: -24 }} accessibilityLayer>
            <CartesianGrid vertical={false} stroke={chartTheme.grid} />
            <XAxis dataKey="week" tick={chartAxisTick} axisLine={{ stroke: chartTheme.grid }} tickLine={false} />
            <YAxis allowDecimals={false} tick={chartAxisTick} axisLine={false} tickLine={false} />
            <Tooltip content={<ChartTooltip valueFormatter={(value) => `${value} entrega${value === 1 ? '' : 's'}`} />} />
            <Bar dataKey="count" name="Entregas" radius={[4, 4, 0, 0]} maxBarSize={46} isAnimationActive="auto">
              <LabelList dataKey="count" position="top" fill={chartTheme.text} fontSize={11} fontWeight={700} />
              {chartData.map((item) => (
                <Cell
                  key={item.week}
                  fill={selectedWeek === item.index ? chartTheme.primary : '#93c5fd'}
                  cursor="pointer"
                  onClick={() => setSelectedWeek(selectedWeek === item.index ? null : item.index)}
                />
              ))}
            </Bar>
          </BarChart>
        </ChartContainer>
        <p className="super-chart-helper">
          {selectedWeek !== null
            ? `Exibindo entregas da Semana ${selectedWeek + 1}. Clique na barra novamente para ver todas.`
            : 'Clique em uma das semanas acima para filtrar o detalhamento abaixo.'}
        </p>
      </div>

      {/* Drilldown Section */}
      <div className="super-delivery-drilldown">
        <div className="super-delivery-drilldown__head">
          <h3>
            {selectedWeek !== null
              ? `Entregas da Semana ${selectedWeek + 1} (${displayedDeliveries.length})`
              : `Entregas Recentes (${displayedDeliveries.length})`}
          </h3>
          {selectedWeek !== null && (
            <button
              type="button"
              className="super-delivery-drilldown__clear"
              onClick={() => setSelectedWeek(null)}
            >
              <X size={12} />
              Limpar seleção
            </button>
          )}
        </div>

        <div className="super-delivery-drilldown__list">
          {displayedDeliveries.length > 0 ? (
            displayedDeliveries.map((item, idx) => {
              const sys = sprintSystem(item.sprint);
              const pf = item.sprint.detailedFunctionPoints || item.sprint.functionPoints || 0;

              return (
                <div
                  key={`${item.sprint.code}-${idx}`}
                  className="super-delivery-item"
                  onClick={() => onOpenSprint(item.sprint)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      onOpenSprint(item.sprint);
                    }
                  }}
                >
                  <span className="super-delivery-item__check">
                    <CheckCircle2 size={15} />
                  </span>
                  <div className="super-delivery-item__details">
                    <div className="super-delivery-item__title-row">
                      <strong className="super-delivery-item__system">{sys}</strong>
                      <span className="super-delivery-item__code">
                        {item.sprint.serviceOrder || item.sprint.code}
                      </span>
                      <span className="super-delivery-item__date">
                        {item.date.toLocaleDateString('pt-BR')}
                      </span>
                    </div>
                    <p className="super-delivery-item__objective" title={item.sprint.objective}>
                      {item.sprint.objective}
                    </p>
                  </div>
                  <div className="super-delivery-item__right">
                    <span className="super-delivery-item__pf">{pf} PF</span>
                    <ArrowUpRight size={14} className="super-delivery-item__arrow" />
                  </div>
                </div>
              );
            })
          ) : (
            <div className="super-delivery-empty">
              Nenhuma entrega registrada para o período selecionado.
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
