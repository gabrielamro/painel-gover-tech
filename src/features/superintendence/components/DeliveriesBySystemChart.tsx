import React from 'react';
import { Box } from '@mui/material';
import BarChartRoundedIcon from '@mui/icons-material/BarChartRounded';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  LabelList,
} from 'recharts';
import { DashboardCard } from './DashboardCard';
import { CustomTooltip } from './CustomTooltip';
import type { SystemDeliveryData } from '../types';

interface DeliveriesBySystemChartProps {
  data: SystemDeliveryData[];
  periodSubtitle?: string;
}

export const DeliveriesBySystemChart: React.FC<DeliveriesBySystemChartProps> = ({
  data,
  periodSubtitle = 'Melhorias entregues em julho de 2026',
}) => {
  // Sort descending by count
  const sortedData = React.useMemo(() => {
    return [...data].sort((a, b) => b.entregas - a.entregas);
  }, [data]);

  return (
    <DashboardCard
      title="Entregas por Sistema"
      subtitle={periodSubtitle}
      icon={<BarChartRoundedIcon sx={{ fontSize: 20 }} />}
    >
      <Box sx={{ width: '100%', height: 220, marginTop: '8px' }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={sortedData}
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
                  valueFormatter={(v) => `${v} entregas`}
                />
              }
            />
            <Bar
              dataKey="entregas"
              name="Entregas"
              fill="#2563EB"
              radius={[0, 5, 5, 0]}
              barSize={16}
            >
              <LabelList
                dataKey="entregas"
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
