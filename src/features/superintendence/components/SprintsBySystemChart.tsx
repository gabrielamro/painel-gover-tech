import React from 'react';
import { Box, Typography } from '@mui/material';
import BoltOutlinedIcon from '@mui/icons-material/BoltOutlined';
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

interface SystemSprintItem {
  sistema: string;
  entregues: number;
  emAndamento: number;
  total: number;
}

interface SprintsBySystemChartProps {
  data?: SystemSprintItem[];
  onViewDetails?: () => void;
}

const DEFAULT_SPRINTS_DATA: SystemSprintItem[] = [
  { sistema: 'SCIEX', entregues: 4, emAndamento: 3, total: 7 },
  { sistema: 'SIMNAC', entregues: 4, emAndamento: 2, total: 6 },
  { sistema: 'SPR', entregues: 3, emAndamento: 3, total: 6 },
  { sistema: 'SAGAT', entregues: 3, emAndamento: 2, total: 5 },
  { sistema: 'CADSUF', entregues: 2, emAndamento: 1, total: 3 },
];

export const SprintsBySystemChart: React.FC<SprintsBySystemChartProps> = ({
  data = DEFAULT_SPRINTS_DATA,
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
      title="Sprints por Sistema"
      subtitle="Entregues vs. Em andamento"
      icon={<BoltOutlinedIcon sx={{ fontSize: 20 }} />}
      headerAction={headerAction}
    >
      {/* Top Legend */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
          marginTop: '2px',
          marginBottom: '6px',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
          <Box sx={{ width: 8, height: 8, borderRadius: '2px', backgroundColor: '#2563EB' }} />
          <Typography sx={{ fontSize: '0.6875rem', color: '#64748B' }}>
            Sprints Entregues
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
          <Box sx={{ width: 8, height: 8, borderRadius: '2px', backgroundColor: '#93C5FD' }} />
          <Typography sx={{ fontSize: '0.6875rem', color: '#64748B' }}>
            Em Andamento
          </Typography>
        </Box>
      </Box>

      {/* Chart Canvas */}
      <Box sx={{ width: '100%', height: 185 }}>
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
              domain={[0, 8]}
              ticks={[0, 2, 4, 6, 8]}
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
            <Tooltip content={<CustomTooltip valueFormatter={(v) => `${v} sprints`} />} />
            <Bar
              dataKey="entregues"
              name="Entregues"
              stackId="sprints"
              fill="#2563EB"
              barSize={14}
            >
              <LabelList
                dataKey="entregues"
                position="center"
                style={{ fontSize: 10, fill: '#FFFFFF', fontWeight: 600 }}
              />
            </Bar>
            <Bar
              dataKey="emAndamento"
              name="Em Andamento"
              stackId="sprints"
              fill="#93C5FD"
              barSize={14}
              radius={[0, 4, 4, 0]}
            >
              <LabelList
                dataKey="emAndamento"
                position="center"
                style={{ fontSize: 10, fill: '#1E3A8A', fontWeight: 600 }}
              />
              <LabelList
                dataKey="total"
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
