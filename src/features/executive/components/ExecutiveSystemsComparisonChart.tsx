import { useMemo, useState } from 'react';
import { Box, Typography, Paper, Chip, MenuItem, Select } from '@mui/material';
import { Bar, BarChart, CartesianGrid, Cell, LabelList, Tooltip, XAxis, YAxis } from 'recharts';
import { ChartContainer } from '../../../components/charts/ChartContainer';
import { chartAxisTick, chartTheme } from '../../../components/charts/chartTheme';
import type { Sprint } from '../../../domain/sprint/model';
import { sprintSystem, systemColor } from '../../../domain/sprint/queries';
import { projectBaseName } from '../../../domain/project/colors';
import { PfMonthlyRepository } from '../../../repositories/local-storage/PfMonthlyRepository';
import type { PfMonthlyRecord } from '../../../domain/pf/model';
import { CONTRACT_BILLING_PERIOD_START, LATEST_BILLED_MONTH } from '../../../domain/contract/analytics';
import { SystemDeliveryTooltip, type SystemModuleMetric } from './SystemDeliveryTooltip';

interface SystemMetric {
  name: string;
  label: string;
  totalDelivered: number;
  rangeDelivered: number;
  deliveredSprints: number;
  modules: SystemModuleMetric[];
  color: string;
}

interface Props {
  sprints?: Sprint[];
}

export function getCurrentMonth(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}

export { LATEST_BILLED_MONTH } from '../../../domain/contract/analytics';
export const DEFAULT_RANGE_START = CONTRACT_BILLING_PERIOD_START;
export const DEFAULT_RANGE_END = LATEST_BILLED_MONTH;

function roundPf(value: number): number {
  return Math.round(value * 100) / 100;
}

export function isMonthInRange(month: string | undefined, startMonth: string, endMonth: string): boolean {
  return Boolean(month && month >= startMonth && month <= endMonth);
}

export function formatMonthLabel(month: string, style: 'short' | 'long' = 'short'): string {
  const [year, monthNumber] = month.split('-').map(Number);
  if (!year || !monthNumber) return month;

  const value = new Intl.DateTimeFormat('pt-BR', {
    month: style,
    year: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(Date.UTC(year, monthNumber - 1, 1)));

  return value.charAt(0).toUpperCase() + value.slice(1).replace('.', '');
}

function deliveredSprintLabel(name: string, count: number): string {
  return `${name} · ${count} ${count === 1 ? 'OS' : 'OSs'}`;
}

export function ExecutiveSystemsComparisonChart({ sprints = [] }: Props) {
  const [rangeStart, setRangeStart] = useState(DEFAULT_RANGE_START);
  const [rangeEnd, setRangeEnd] = useState(DEFAULT_RANGE_END);

  const pfRecords = useMemo<PfMonthlyRecord[]>(() => {
    try {
      return new PfMonthlyRepository().list();
    } catch {
      return [];
    }
  }, []);

  const availableMonths = useMemo(() => {
    const months = new Set(
      pfRecords
        .filter((record) => record.month <= LATEST_BILLED_MONTH)
        .map((record) => record.month)
    );
    months.add(DEFAULT_RANGE_START);
    months.add(DEFAULT_RANGE_END);
    return Array.from(months).sort();
  }, [pfRecords]);

  const systemsMetrics: SystemMetric[] = useMemo(() => {

    // 3. Mapa de agregação por nome oficial do sistema (conforme cadastro no banco)
    const systemMap = new Map<string, {
      totalDelivered: number;
      rangeDelivered: number;
      deliveredSprints: number;
      modules: Map<string, number>;
      color: string;
    }>();

    // Agrega do histórico mensal (desconsidera Sustentação que pertence ao Contrato 2)
    pfRecords.forEach((record) => {
      if (record.month > LATEST_BILLED_MONTH) return;
      const sysName = record.project.trim();
      if (sysName.toLowerCase() === 'sustentação') return;

      const curr = systemMap.get(sysName) || {
        totalDelivered: 0,
        rangeDelivered: 0,
        deliveredSprints: 0,
        modules: new Map<string, number>(),
        color: systemColor(sysName),
      };
      curr.totalDelivered += Number(record.detailedPf || 0);
      if (record.module) {
        curr.modules.set(record.module, (curr.modules.get(record.module) || 0) + Number(record.detailedPf || 0));
      }
      if (isMonthInRange(record.month, rangeStart, rangeEnd)) {
        curr.rangeDelivered += Number(record.detailedPf || 0);
      }
      systemMap.set(sysName, curr);
    });

    // Agrega também de Sprints concluídas operacionais (não-macro)
    sprints.forEach((s) => {
      if (s.lane !== 'completed') return;
      if (s.billingForecastMonth && s.billingForecastMonth > LATEST_BILLED_MONTH) return;

      const sysName = s.projectName?.trim() || projectBaseName(sprintSystem(s)) || sprintSystem(s);
      if (sysName.toLowerCase() === 'sustentação') return;

      const curr = systemMap.get(sysName) || {
        totalDelivered: 0,
        rangeDelivered: 0,
        deliveredSprints: 0,
        modules: new Map<string, number>(),
        color: systemColor(sysName),
      };
      // Cada card faturado representa uma OS/Sprint entregue. Os cards MACRO
      // entram só nesta contagem: seu PF já foi agregado pelo histórico mensal.
      curr.deliveredSprints += 1;
      if (s.code.startsWith('MACRO-')) {
        systemMap.set(sysName, curr);
        return;
      }
      const pf = Number(s.detailedFunctionPoints || s.functionPoints || 0);
      curr.totalDelivered += pf;
      if (isMonthInRange(s.billingForecastMonth, rangeStart, rangeEnd)) {
        curr.rangeDelivered += pf;
      }
      systemMap.set(sysName, curr);
    });

    return Array.from(systemMap.entries())
      .map(([name, data]) => ({
        name,
        label: deliveredSprintLabel(name, data.deliveredSprints),
        totalDelivered: roundPf(data.totalDelivered),
        rangeDelivered: roundPf(data.rangeDelivered),
        deliveredSprints: data.deliveredSprints,
        modules: Array.from(data.modules.entries())
          .map(([module, pf]) => ({ name: module, pf: Math.round(pf * 100) / 100 }))
          .sort((a, b) => b.pf - a.pf),
        color: data.color || systemColor(name),
      }))
      .sort((a, b) => b.totalDelivered - a.totalDelivered);
  }, [pfRecords, rangeEnd, rangeStart, sprints]);

  const totalDeliveredSum = useMemo(
    () => systemsMetrics.reduce((sum, item) => sum + item.totalDelivered, 0),
    [systemsMetrics]
  );

  const rangeDeliveredSum = useMemo(
    () => roundPf(systemsMetrics.reduce((sum, item) => sum + item.rangeDelivered, 0)),
    [systemsMetrics]
  );

  const deliveredSprintsTotal = useMemo(
    () => systemsMetrics.reduce((sum, item) => sum + item.deliveredSprints, 0),
    [systemsMetrics]
  );

  const periodLabel = `${formatMonthLabel(rangeStart, 'long')} até ${formatMonthLabel(rangeEnd, 'long')}`;
  const formatPf = (value: number) => value.toLocaleString('pt-BR', { maximumFractionDigits: 2 });

  const handleStartChange = (month: string) => {
    setRangeStart(month);
    if (month > rangeEnd) setRangeEnd(month);
  };

  const handleEndChange = (month: string) => {
    setRangeEnd(month);
    if (month < rangeStart) setRangeStart(month);
  };

  return (
    <Paper
      elevation={0}
      sx={{
        p: 1.8,
        borderRadius: 2,
        border: '1px solid #e2e8f0',
        bgcolor: '#ffffff',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 1.5, mb: 1, flexWrap: 'wrap' }}>
        <Box>
          <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary', textTransform: 'uppercase', letterSpacing: '0.4px', fontSize: '0.6875rem' }}>
            DISTRIBUIÇÃO POR SISTEMA
          </Typography>
          <Typography variant="h3" sx={{ fontSize: '0.9375rem', fontWeight: 700, color: 'text.primary', mt: 0.1 }}>
            Total Entregue × Último Ano (PF)
          </Typography>
          <Typography variant="caption" sx={{ display: 'block', color: 'text.secondary', fontSize: '0.6875rem', mt: 0.25 }}>
            Período: {periodLabel}
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'flex-end', gap: 0.75, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
          <Box component="label" sx={{ display: 'grid', gap: 0.25 }}>
            <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.625rem', fontWeight: 600 }}>
              De
            </Typography>
            <Select
              size="small"
              value={rangeStart}
              onChange={(event) => handleStartChange(String(event.target.value))}
              inputProps={{ 'aria-label': 'Mês inicial do período' }}
              sx={{ minWidth: 118, height: 30, fontSize: '0.6875rem', bgcolor: '#fff', borderRadius: 1 }}
            >
              {availableMonths.map((month) => (
                <MenuItem key={`start-${month}`} value={month} sx={{ fontSize: '0.75rem' }}>
                  {formatMonthLabel(month)}
                </MenuItem>
              ))}
            </Select>
          </Box>
          <Box component="label" sx={{ display: 'grid', gap: 0.25 }}>
            <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.625rem', fontWeight: 600 }}>
              Até
            </Typography>
            <Select
              size="small"
              value={rangeEnd}
              onChange={(event) => handleEndChange(String(event.target.value))}
              inputProps={{ 'aria-label': 'Mês final do período' }}
              sx={{ minWidth: 118, height: 30, fontSize: '0.6875rem', bgcolor: '#fff', borderRadius: 1 }}
            >
              {availableMonths.map((month) => (
                <MenuItem key={`end-${month}`} value={month} sx={{ fontSize: '0.75rem' }}>
                  {formatMonthLabel(month)}
                </MenuItem>
              ))}
            </Select>
          </Box>
          <Chip
            label={`${deliveredSprintsTotal} OSs/Sprints entregues`}
            size="small"
            sx={{ bgcolor: '#ecfdf3', color: '#027a48', fontWeight: 700, fontSize: '0.6875rem', height: 22 }}
          />
          <Chip
            label={`${systemsMetrics.length} Sistemas Ativos`}
            size="small"
            sx={{ bgcolor: '#f1f5f9', color: '#475569', fontWeight: 700, fontSize: '0.6875rem', height: 22 }}
          />
        </Box>
      </Box>

      <Box sx={{ flex: 1, minHeight: 180 }}>
        <ChartContainer height={Math.max(180, systemsMetrics.length * 42)} label={`PF total entregue e PF de ${periodLabel} por sistema`}>
          <BarChart data={systemsMetrics} layout="vertical" margin={{ top: 4, right: 18, bottom: 0, left: 4 }} accessibilityLayer>
            <CartesianGrid horizontal={false} stroke={chartTheme.grid} />
            <XAxis type="number" hide />
            <YAxis
              type="category"
              dataKey="label"
              width={120}
              tick={{ ...chartAxisTick, fill: chartTheme.text, fontWeight: 700, fontSize: 11 }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip content={<SystemDeliveryTooltip />} />
            <Bar dataKey="totalDelivered" name="Total entregue" radius={[0, 3, 3, 0]} maxBarSize={10} isAnimationActive="auto">
              {systemsMetrics.map((item) => <Cell key={item.name} fill={item.color} />)}
              <LabelList dataKey="totalDelivered" position="right" formatter={(value) => formatPf(Number(value))} fill={chartTheme.text} fontSize={9} fontWeight={700} />
            </Bar>
            <Bar dataKey="rangeDelivered" name="Período selecionado" fill={chartTheme.success} radius={[0, 3, 3, 0]} maxBarSize={10} isAnimationActive="auto">
              <LabelList dataKey="rangeDelivered" position="right" formatter={(value) => formatPf(Number(value))} fill={chartTheme.text} fontSize={9} fontWeight={700} />
            </Bar>
          </BarChart>
        </ChartContainer>
      </Box>

      {/* Legend */}
      <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', mt: 0.5, pt: 0.8, borderTop: '1px solid #f1f5f9' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.6 }}>
          <Box sx={{ width: 10, height: 8, bgcolor: '#2563eb', borderRadius: 0.5 }} />
          <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, fontSize: '0.6875rem' }}>
            Total Entregue ({formatPf(totalDeliveredSum)} PF)
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.6 }}>
          <Box sx={{ width: 10, height: 8, bgcolor: '#16a34a', borderRadius: 0.5 }} />
          <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, fontSize: '0.6875rem' }}>
            Período selecionado ({formatPf(rangeDeliveredSum)} PF)
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.6 }}>
          <Box sx={{ width: 10, height: 8, bgcolor: '#ecfdf3', border: '1px solid #86efac', borderRadius: 0.5 }} />
          <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, fontSize: '0.6875rem' }}>
            OSs/Sprints entregues ({deliveredSprintsTotal})
          </Typography>
        </Box>
      </Box>
    </Paper>
  );
}
