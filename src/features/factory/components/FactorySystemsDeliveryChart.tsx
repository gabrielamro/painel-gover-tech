import { Box, Typography, Paper, Chip } from '@mui/material';
import { Bar, BarChart, CartesianGrid, Cell, LabelList, Tooltip, XAxis, YAxis } from 'recharts';
import { ChartContainer } from '../../../components/charts/ChartContainer';
import { ChartTooltip } from '../../../components/charts/ChartTooltip';
import { chartAxisTick, chartTheme } from '../../../components/charts/chartTheme';

export interface SystemSprintMetric {
  name: string;
  deliveredSprints: number;
  wipSprints: number;
  color: string;
}

export const SYSTEMS_SPRINT_METRICS: SystemSprintMetric[] = [
  { name: 'SCIEX Exportação / Importação', deliveredSprints: 26, wipSprints: 4, color: '#2563eb' },
  { name: 'CADSUF Cadastro Único', deliveredSprints: 18, wipSprints: 3, color: '#7c3aed' },
  { name: 'SIMNAC WEB & Mobile', deliveredSprints: 15, wipSprints: 3, color: '#16a34a' },
  { name: 'SAGAT (Recepção / Análise)', deliveredSprints: 11, wipSprints: 2, color: '#d97706' },
  { name: 'SAC Atendimento ao Cidadão', deliveredSprints: 6, wipSprints: 2, color: '#0d9488' },
];

type Props = {
  metrics?: SystemSprintMetric[];
  compact?: boolean;
};

export function FactorySystemsDeliveryChart({ metrics = SYSTEMS_SPRINT_METRICS, compact = false }: Props) {
  const deliveredTotal = metrics.reduce((n, item) => n + item.deliveredSprints, 0);
  const wipTotal = metrics.reduce((n, item) => n + item.wipSprints, 0);
  const chartHeight = compact ? '100%' : 180;
  const yWidth = compact ? 86 : 150;

  return (
    <Paper
      elevation={0}
      sx={{
        p: compact ? 1 : 1.8,
        borderRadius: 2,
        border: '1px solid #e2e8f0',
        bgcolor: '#ffffff',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        minHeight: 0,
        boxSizing: 'border-box',
      }}
    >
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: compact ? 0.4 : 1, gap: 1 }}>
        <Box sx={{ minWidth: 0 }}>
          <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary', textTransform: 'uppercase', letterSpacing: '0.4px', fontSize: '0.6875rem' }}>
            ENTREGAS POR SISTEMA
          </Typography>
          <Typography variant="h3" sx={{ fontSize: compact ? '0.8rem' : '0.9375rem', fontWeight: 700, color: 'text.primary', mt: 0.1, lineHeight: 1.25 }}>
            Quantidade de Sprints Entregues vs. Em Andamento
          </Typography>
        </Box>
        <Chip
          label={`${metrics.length} Sistemas Ativos`}
          size="small"
          sx={{ bgcolor: '#f1f5f9', color: '#475569', fontWeight: 700, fontSize: '0.6875rem', height: 22, flexShrink: 0 }}
        />
      </Box>

      <Box sx={{ flex: 1, minHeight: compact ? 0 : 180, position: 'relative' }}>
        <ChartContainer height={chartHeight} label="Sprints entregues e em andamento por sistema">
          <BarChart data={metrics} layout="vertical" margin={{ top: 4, right: compact ? 8 : 16, bottom: 0, left: compact ? 0 : 8 }} accessibilityLayer>
            <CartesianGrid horizontal={false} stroke={chartTheme.grid} />
            <XAxis type="number" hide />
            <YAxis type="category" dataKey="name" width={yWidth} tick={{ ...chartAxisTick, fill: chartTheme.text, fontWeight: 600, fontSize: compact ? 9 : chartAxisTick.fontSize }} axisLine={false} tickLine={false} />
            <Tooltip content={<ChartTooltip valueFormatter={(value) => `${value} Sprint${value === 1 ? '' : 's'}`} />} />
            <Bar dataKey="deliveredSprints" name="Entregues" stackId="sprints" radius={[3, 0, 0, 3]} maxBarSize={compact ? 14 : 20} isAnimationActive="auto">
              {metrics.map((item) => <Cell key={item.name} fill={item.color} />)}
              <LabelList dataKey="deliveredSprints" position="center" fill="#fff" fontSize={10} fontWeight={700} />
            </Bar>
            <Bar dataKey="wipSprints" name="Em produção" stackId="sprints" fill={chartTheme.success} radius={[0, 3, 3, 0]} maxBarSize={compact ? 14 : 20} isAnimationActive="auto">
              <LabelList dataKey="wipSprints" position="center" fill="#fff" fontSize={10} fontWeight={700} />
            </Bar>
          </BarChart>
        </ChartContainer>
        <Box
          component="ul"
          sx={{ position: 'absolute', width: 1, height: 1, p: 0, m: -1, overflow: 'hidden', clip: 'rect(0 0 0 0)', whiteSpace: 'nowrap', border: 0 }}
        >
          {metrics.map((item) => (
            <li key={item.name}>{item.name}</li>
          ))}
        </Box>
      </Box>

      <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', mt: 0.5, pt: 0.8, borderTop: '1px solid #f1f5f9' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.6 }}>
          <Box sx={{ width: 10, height: 8, bgcolor: '#2563eb', borderRadius: 0.5 }} />
          <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, fontSize: '0.6875rem' }}>
            Sprints Entregues ({deliveredTotal})
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.6 }}>
          <Box sx={{ width: 10, height: 8, bgcolor: '#16a34a', borderRadius: 0.5 }} />
          <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, fontSize: '0.6875rem' }}>
            Em Produção ({wipTotal})
          </Typography>
        </Box>
      </Box>
    </Paper>
  );
}
