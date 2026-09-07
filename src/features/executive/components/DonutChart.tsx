import { Box, Typography } from '@mui/material';
import { ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { kpiColors } from './kpi-tokens';

interface DonutItem {
  label: string;
  value: number;
  color: string;
}

interface Props {
  items?: DonutItem[];
  height?: number;
}

const DEFAULT_DONUT_ITEMS: DonutItem[] = [
  { label: 'Execução', value: 10, color: kpiColors.blue },
  { label: 'Validação', value: 5, color: kpiColors.orange },
  { label: 'Backlog', value: 3, color: '#CBD5E1' },
];

export function DonutChart({
  items = DEFAULT_DONUT_ITEMS,
  height = 76,
}: Props) {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
      {/* Gráfico Donut */}
      <Box sx={{ width: '100%', height, minWidth: 0 }}>
        <ResponsiveContainer width="100%" height="100%" debounce={50}>
          <PieChart margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
            <Pie
              data={items}
              dataKey="value"
              cx="50%"
              cy="50%"
              innerRadius={26}
              outerRadius={38}
              paddingAngle={2}
              stroke="none"
              isAnimationActive={false}
            >
              {items.map((entry, idx) => (
                <Cell key={`cell-${idx}`} fill={entry.color} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
      </Box>

      {/* Mini Legenda Inferior */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1.2, mt: 0.8, flexWrap: 'wrap' }}>
        {items.map((entry, idx) => (
          <Box key={`leg-${idx}`} sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: entry.color, flexShrink: 0 }} />
            <Typography variant="caption" sx={{ fontSize: '10px', color: kpiColors.slate, fontWeight: 600 }}>
              {entry.value} {entry.label}
            </Typography>
          </Box>
        ))}
      </Box>
    </Box>
  );
}
