import { Box, Typography, Paper, Chip } from '@mui/material';
import { Bar, CartesianGrid, ComposedChart, Line, Tooltip, XAxis, YAxis } from 'recharts';
import { ChartContainer } from '../../../components/charts/ChartContainer';
import { ChartTooltip } from '../../../components/charts/ChartTooltip';
import { chartAxisTick, chartTheme } from '../../../components/charts/chartTheme';

interface MonthThroughput {
  month: string;
  invoiced: number;
  cumulative: number;
}

const MONTHLY_THROUGHPUT_DATA: MonthThroughput[] = [
  { month: 'Out', invoiced: 4, cumulative: 4 },
  { month: 'Nov', invoiced: 5, cumulative: 9 },
  { month: 'Dez', invoiced: 6, cumulative: 15 },
  { month: 'Jan', invoiced: 7, cumulative: 22 },
  { month: 'Fev', invoiced: 8, cumulative: 30 },
  { month: 'Mar', invoiced: 9, cumulative: 39 },
  { month: 'Abr', invoiced: 8, cumulative: 47 },
  { month: 'Mai', invoiced: 9, cumulative: 56 },
  { month: 'Jun', invoiced: 8, cumulative: 64 },
  { month: 'Jul', invoiced: 12, cumulative: 76 },
  { month: 'Ago', invoiced: 8, cumulative: 84 },
  { month: 'Set', invoiced: 6, cumulative: 90 },
];

export function FactoryMonthlyThroughputChart() {
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
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.8 }}>
        <Box>
          <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary', textTransform: 'uppercase', letterSpacing: '0.4px', fontSize: '0.6875rem' }}>
            VAZÃO & RITMO MENSAL
          </Typography>
          <Typography variant="h3" sx={{ fontSize: '0.9375rem', fontWeight: 700, color: 'text.primary', mt: 0.1 }}>
            Sprints Faturadas por Mês & Curva Acumulada
          </Typography>
        </Box>
        <Chip
          label="Alta Produtividade"
          size="small"
          sx={{ bgcolor: '#dcfce7', color: '#15803d', fontWeight: 700, fontSize: '0.6875rem', height: 22 }}
        />
      </Box>

      <Box sx={{ width: '100%', flex: 1, minHeight: 165 }}>
        <ChartContainer height={165} label="Sprints faturadas por mês e total acumulado">
          <ComposedChart data={MONTHLY_THROUGHPUT_DATA} margin={{ top: 8, right: 20, bottom: 0, left: -10 }} accessibilityLayer>
            <CartesianGrid vertical={false} stroke={chartTheme.grid} />
            <XAxis dataKey="month" tick={chartAxisTick} axisLine={{ stroke: chartTheme.grid }} tickLine={false} />
            <YAxis yAxisId="monthly" domain={[0, 15]} ticks={[0, 5, 10, 15]} tick={chartAxisTick} axisLine={false} tickLine={false} />
            <YAxis yAxisId="cumulative" orientation="right" domain={[0, 100]} ticks={[0, 25, 50, 75, 100]} tick={{ ...chartAxisTick, fill: chartTheme.primary }} axisLine={false} tickLine={false} />
            <Tooltip content={<ChartTooltip />} />
            <Bar yAxisId="monthly" dataKey="invoiced" name="Faturadas no mês" fill={chartTheme.success} radius={[3, 3, 0, 0]} maxBarSize={24} isAnimationActive="auto" />
            <Line yAxisId="cumulative" type="monotone" dataKey="cumulative" name="Total acumulado" stroke={chartTheme.primary} strokeWidth={2.5} dot={{ r: 2.5, fill: chartTheme.primary, stroke: '#fff' }} activeDot={{ r: 4 }} isAnimationActive="auto" />
          </ComposedChart>
        </ChartContainer>
      </Box>

      {/* Legend */}
      <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', mt: 0.5, pt: 0.8, borderTop: '1px solid #f1f5f9' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.6 }}>
          <Box sx={{ width: 10, height: 8, bgcolor: '#16a34a', borderRadius: 0.5 }} />
          <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, fontSize: '0.6875rem' }}>
            Faturadas no Mês
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.6 }}>
          <Box sx={{ width: 10, height: 2.5, bgcolor: '#2563eb', borderRadius: 1 }} />
          <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, fontSize: '0.6875rem' }}>
            Total Acumulado (76 Sprints)
          </Typography>
        </Box>
      </Box>
    </Paper>
  );
}
