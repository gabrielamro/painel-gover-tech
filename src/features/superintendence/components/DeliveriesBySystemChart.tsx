import React from 'react';
import { Box, Typography } from '@mui/material';
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
  Cell,
} from 'recharts';
import { DashboardCard } from './DashboardCard';
import { CustomTooltip } from './CustomTooltip';

interface SystemDeliveryEntry {
  sistema: string;
  entregas: number;
  color?: string;
}

interface DeliveriesBySystemChartProps {
  data?: SystemDeliveryEntry[];
  periodSubtitle?: string;
  onViewDetails?: () => void;
}

const DEFAULT_DATA: SystemDeliveryEntry[] = [
  { sistema: 'SIMNAC', entregas: 4, color: '#3B82F6' },
  { sistema: 'SCIEX', entregas: 4, color: '#3B82F6' },
  { sistema: 'SAGAT', entregas: 3, color: '#22C55E' },
  { sistema: 'SPR', entregas: 3, color: '#A855F7' },
  { sistema: 'CADSUF', entregas: 2, color: '#F97316' },
  { sistema: 'SAC', entregas: 2, color: '#38BDF8' },
];

export const DeliveriesBySystemChart: React.FC<DeliveriesBySystemChartProps> = ({
  data = DEFAULT_DATA,
  periodSubtitle = 'Melhorias entregues em julho de 2026',
  onViewDetails,
}) => {
  const headerAction = (
    <Typography
      onClick={onViewDetails}
      sx={{
        fontSize: '0.75rem',
        fontWeight: 600,
        color: '#2563EB',
        cursor: 'pointer',
        '&:hover': { textDecoration: 'underline' },
      }}
    >
      Ver detalhes →
    </Typography>
  );

  return (
    <DashboardCard
      title="Entregas por Sistema"
      subtitle={periodSubtitle}
      icon={<BarChartRoundedIcon sx={{ fontSize: 20 }} />}
      headerAction={headerAction}
    >
      <Box sx={{ width: '100%', height: 210, marginTop: '4px' }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            layout="vertical"
            margin={{ top: 5, right: 30, left: 10, bottom: 0 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              horizontal={false}
              stroke="#F1F5F9"
            />
            <XAxis
              type="number"
              domain={[0, 4]}
              ticks={[0, 1, 2, 3, 4]}
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 11, fill: '#94A3B8' }}
            />
            <YAxis
              type="category"
              dataKey="sistema"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 11, fill: '#0F172A', fontWeight: 600 }}
              width={65}
            />
            <Tooltip
              content={<CustomTooltip valueFormatter={(v) => `${v} entregas`} />}
            />
            <Bar
              dataKey="entregas"
              name="Entregas"
              radius={[0, 4, 4, 0]}
              barSize={14}
            >
              {data.map((entry, index) => (
                <Cell
                  key={`cell-del-${index}`}
                  fill={entry.color || '#3B82F6'}
                />
              ))}
              <LabelList
                dataKey="entregas"
                position="right"
                style={{ fontSize: 11, fill: '#0F172A', fontWeight: 600 }}
              />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </Box>
    </DashboardCard>
  );
};
