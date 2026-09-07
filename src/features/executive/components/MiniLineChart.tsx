import { Box } from '@mui/material';
import { ResponsiveContainer, LineChart, Line } from 'recharts';
import { kpiColors } from './kpi-tokens';

interface Props {
  data?: number[];
  color?: string;
  height?: number;
}

const DEFAULT_LINE_DATA = [180, 160, 210, 240, 220, 290, 270, 340, 380, 420];

export function MiniLineChart({
  data = DEFAULT_LINE_DATA,
  color = kpiColors.blue,
  height = 42,
}: Props) {
  const chartData = data.map((value, index) => ({ index, value }));

  return (
    <Box sx={{ width: '100%', height, minWidth: 0 }}>
      <ResponsiveContainer width="100%" height="100%" debounce={50}>
        <LineChart data={chartData} margin={{ top: 4, right: 4, bottom: 4, left: 4 }}>
          <Line
            type="monotone"
            dataKey="value"
            stroke={color}
            strokeWidth={2}
            dot={{ r: 2, fill: color, strokeWidth: 0 }}
            activeDot={{ r: 3.5, fill: color }}
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </Box>
  );
}
