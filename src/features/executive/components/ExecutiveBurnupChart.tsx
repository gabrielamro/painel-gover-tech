import { Box, Typography, Paper, Chip } from '@mui/material';
import { Area, CartesianGrid, ComposedChart, Line, ReferenceLine, Tooltip, XAxis, YAxis } from 'recharts';
import { ChartContainer } from '../../../components/charts/ChartContainer';
import { ChartTooltip } from '../../../components/charts/ChartTooltip';
import { chartAxisTick, chartTheme } from '../../../components/charts/chartTheme';

interface DataPoint {
  month: string;
  realized: number | null;
  projected: number | null;
  target: number;
}

const MONTHLY_DATA: DataPoint[] = [
  { month: 'Out', realized: 420, projected: null, target: 666 },
  { month: 'Nov', realized: 950, projected: null, target: 1333 },
  { month: 'Dez', realized: 1580, projected: null, target: 2000 },
  { month: 'Jan', realized: 2190, projected: null, target: 2666 },
  { month: 'Fev', realized: 2840, projected: null, target: 3333 },
  { month: 'Mar', realized: 3510, projected: null, target: 4000 },
  { month: 'Abr', realized: 4180, projected: null, target: 4666 },
  { month: 'Mai', realized: 4890, projected: null, target: 5333 },
  { month: 'Jun', realized: 5620, projected: null, target: 6000 },
  { month: 'Jul', realized: 6240, projected: 6240, target: 6666 },
  { month: 'Ago', realized: null, projected: 7120, target: 7333 },
  { month: 'Set', realized: null, projected: 8000, target: 8000 },
];

export function ExecutiveBurnupChart({
  contractLimit = 8000,
  currentRealized = 6240,
}: {
  contractLimit?: number;
  currentRealized?: number;
}) {
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
            EVOLUÇÃO CONTÍNUA DE FATURAMENTO
          </Typography>
          <Typography variant="h3" sx={{ fontSize: '0.9375rem', fontWeight: 700, color: 'text.primary', mt: 0.1 }}>
            Curva de Burnup Acumulado (Outubro a Setembro)
          </Typography>
        </Box>
        <Chip
          label="Ritmo Acelerado · 78%"
          size="small"
          sx={{ bgcolor: '#eff6ff', color: '#1d4ed8', fontWeight: 700, fontSize: '0.6875rem', height: 22 }}
        />
      </Box>

      <Box sx={{ width: '100%', flex: 1, minHeight: 165 }}>
        <ChartContainer height={165} label="Curva de burnup acumulado do contrato">
          <ComposedChart data={MONTHLY_DATA} margin={{ top: 10, right: 18, bottom: 0, left: -4 }} accessibilityLayer>
            <defs>
              <linearGradient id="burnupGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={chartTheme.primary} stopOpacity={0.22} />
                <stop offset="100%" stopColor={chartTheme.primary} stopOpacity={0.01} />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} stroke={chartTheme.grid} />
            <XAxis dataKey="month" tick={chartAxisTick} axisLine={{ stroke: chartTheme.grid }} tickLine={false} />
            <YAxis domain={[0, 8500]} ticks={[0, 2000, 4000, 6000, 8000]} tickFormatter={(value) => value >= 1000 ? `${value / 1000}k` : String(value)} tick={chartAxisTick} axisLine={false} tickLine={false} />
            <Tooltip content={<ChartTooltip valueFormatter={(value) => `${value.toLocaleString('pt-BR')} PF`} />} />
            <ReferenceLine y={contractLimit} stroke="#94a3b8" strokeDasharray="4 4" label={{ value: `Meta: ${contractLimit.toLocaleString('pt-BR')} PF`, fill: chartTheme.muted, fontSize: 9, position: 'insideTopRight' }} />
            <Area type="monotone" dataKey="realized" name="Realizado" stroke="none" fill="url(#burnupGrad)" connectNulls={false} isAnimationActive="auto" />
            <Line type="monotone" dataKey="realized" name="Realizado" stroke={chartTheme.primary} strokeWidth={2.5} dot={{ r: 2.5, fill: chartTheme.primary, stroke: '#fff' }} activeDot={{ r: 4 }} connectNulls={false} isAnimationActive="auto" />
            <Line type="monotone" dataKey="projected" name="Projeção" stroke={chartTheme.success} strokeWidth={2} strokeDasharray="4 4" dot={{ r: 2.5, fill: chartTheme.success, stroke: '#fff' }} activeDot={{ r: 4 }} connectNulls isAnimationActive="auto" />
          </ComposedChart>
        </ChartContainer>
      </Box>

      {/* Legend */}
      <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', mt: 0.5, pt: 0.8, borderTop: '1px solid #f1f5f9' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.6 }}>
          <Box sx={{ width: 10, height: 2.5, bgcolor: '#2563eb', borderRadius: 1 }} />
          <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, fontSize: '0.6875rem' }}>
            Realizado ({currentRealized} PF)
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.6 }}>
          <Box sx={{ width: 10, height: 2.5, bgcolor: '#16a34a', borderStyle: 'dashed', borderRadius: 1 }} />
          <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, fontSize: '0.6875rem' }}>
            Projeção (8.000 PF)
          </Typography>
        </Box>
      </Box>
    </Paper>
  );
}
