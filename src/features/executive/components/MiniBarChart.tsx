import { Box } from '@mui/material';
import { ResponsiveContainer, BarChart, Bar } from 'recharts';
import { kpiColors } from './kpi-tokens';

interface Props {
  data?: number[];
  color?: string;
  height?: number;
}

const DEFAULT_BAR_DATA = [15, 38, 20, 42, 65, 30, 48, 55, 35, 75, 25, 60, 70];

export function MiniBarChart({
  data = DEFAULT_BAR_DATA,
  color = kpiColors.greenBright,
  height = 50,
}: Props) {
  const chartData = data.map((value, index) => ({ index, value }));

  return (
    <Box sx={{ width: '100%', height, minWidth: 0 }}>
      <ResponsiveContainer width="100%" height="100%" debounce={50}>
        <BarChart data={chartData} margin={{ top: 2, right: 2, bottom: 2, left: 2 }}>
          <Bar
            dataKey="value"
            fill={color}
            radius={[2, 2, 0, 0]}
            isAnimationActive={false}
          />
        </BarChart>
      </ResponsiveContainer>
    </Box>
  );
}
