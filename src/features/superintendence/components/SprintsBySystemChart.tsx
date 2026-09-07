import React from 'react';
import { Box } from '@mui/material';
import BoltOutlinedIcon from '@mui/icons-material/BoltOutlined';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  LabelList,
} from 'recharts';
import { DashboardCard } from './DashboardCard';
import { CustomTooltip } from './CustomTooltip';
import type { SystemSprintsData } from '../types';

interface SprintsBySystemChartProps {
  data?: SystemSprintsData[];
}

const DEFAULT_SPRINTS_DATA: SystemSprintsData[] = [
  { sistema: 'SCIEX', entregues: 4, emAndamento: 3, total: 7 },
  { sistema: 'SIMNAC', entregues: 4, emAndamento: 2, total: 6 },
  { sistema: 'SPR', entregues: 3, emAndamento: 3, total: 6 },
  { sistema: 'SAGAT', entregues: 3, emAndamento: 2, total: 5 },
  { sistema: 'CADSUF', entregues: 2, emAndamento: 1, total: 3 },
];

export const SprintsBySystemChart: React.FC<SprintsBySystemChartProps> = ({
  data = DEFAULT_SPRINTS_DATA,
}) => {
  // Ensure total is present
  const chartData = React.useMemo(() => {
    return data.map((d) => ({
      ...d,
      total: d.total || d.entregues + d.emAndamento,
    }));
  }, [data]);

  return (
    <DashboardCard
      title="Sprints por Sistema"
      subtitle="Entregues vs. Em andamento"
      icon={<BoltOutlinedIcon sx={{ fontSize: 20 }} />}
    >
      <Box sx={{ width: '100%', height: 220, marginTop: '8px' }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            layout="vertical"
            margin={{ top: 10, right: 30, left: 10, bottom: 0 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              horizontal={false}
              stroke="#EEF2F7"
            />
            <XAxis
              type="number"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 11, fill: '#64748B' }}
              allowDecimals={false}
            />
            <YAxis
              type="category"
              dataKey="sistema"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 11, fill: '#0F2747', fontWeight: 600 }}
              width={65}
            />
            <Tooltip
              content={
                <CustomTooltip
                  valueFormatter={(v) => `${v} sprints`}
                />
              }
            />
            <Legend
              iconType="circle"
              iconSize={8}
              wrapperStyle={{
                fontSize: '0.6875rem',
                paddingTop: '6px',
                color: '#64748B',
              }}
            />
            <Bar
              dataKey="entregues"
              name="Sprints Entregues"
              stackId="sprints"
              fill="#1E40AF"
              barSize={16}
            />
            <Bar
              dataKey="emAndamento"
              name="Em Andamento"
              stackId="sprints"
              fill="#93C5FD"
              barSize={16}
              radius={[0, 4, 4, 0]}
            >
              <LabelList
                dataKey="total"
                position="right"
                style={{ fontSize: 11, fill: '#64748B', fontWeight: 600 }}
              />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </Box>
    </DashboardCard>
  );
};
