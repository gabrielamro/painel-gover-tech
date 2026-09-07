import React from 'react';
import { Box, Typography } from '@mui/material';
import CalendarMonthOutlinedIcon from '@mui/icons-material/CalendarMonthOutlined';
import {
  ResponsiveContainer,
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';
import { DashboardCard } from './DashboardCard';
import { CustomTooltip } from './CustomTooltip';

interface DeliveryForecastItem {
  semana: string;
  confirmadas: number;
  risco: number;
  meta: number;
  total: number;
}

interface DeliveryForecastChartProps {
  data?: DeliveryForecastItem[];
  subtitle?: string;
  onViewDetails?: () => void;
}

const DEFAULT_FORECAST_DATA: DeliveryForecastItem[] = [
  { semana: '01–02', confirmadas: 0, risco: 0, meta: 2, total: 0 },
  { semana: '03–09', confirmadas: 3, risco: 0, meta: 3, total: 3 },
  { semana: '10–16', confirmadas: 3, risco: 0, meta: 3, total: 3 },
  { semana: '17–23', confirmadas: 1, risco: 1, meta: 2, total: 2 },
  { semana: '24–30', confirmadas: 1, risco: 1, meta: 2, total: 2 },
  { semana: '31', confirmadas: 0, risco: 0, meta: 2, total: 0 },
];

export const DeliveryForecastChart: React.FC<DeliveryForecastChartProps> = ({
  data = DEFAULT_FORECAST_DATA,
  subtitle = 'Compromissos por semana • Agosto de 2026',
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
      title="Previsão de Entregas"
      subtitle={subtitle}
      icon={<CalendarMonthOutlinedIcon sx={{ fontSize: 20 }} />}
      headerAction={headerAction}
    >
      {/* Custom Top Legend */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-start',
          gap: '14px',
          marginTop: '2px',
          marginBottom: '6px',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
          <Box sx={{ width: 8, height: 8, borderRadius: '2px', backgroundColor: '#10B981' }} />
          <Typography sx={{ fontSize: '0.6875rem', color: '#64748B' }}>
            Entregas confirmadas
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
          <Box sx={{ width: 8, height: 8, borderRadius: '2px', backgroundColor: '#F59E0B' }} />
          <Typography sx={{ fontSize: '0.6875rem', color: '#64748B' }}>
            Em risco
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
          <Box
            sx={{
              width: 14,
              height: 2,
              borderTop: '2px dashed #2563EB',
              position: 'relative',
              '&::after': {
                content: '""',
                position: 'absolute',
                width: 4,
                height: 4,
                borderRadius: '50%',
                backgroundColor: '#2563EB',
                top: -3,
                left: 5,
              },
            }}
          />
          <Typography sx={{ fontSize: '0.6875rem', color: '#64748B' }}>
            Meta planejada
          </Typography>
        </Box>
      </Box>

      {/* Chart Canvas */}
      <Box sx={{ width: '100%', height: 185 }}>
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart
            data={data}
            margin={{ top: 15, right: 10, left: -25, bottom: 0 }}
          >
            <CartesianGrid stroke="#F1F5F9" vertical={false} />
            <XAxis
              dataKey="semana"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 11, fill: '#64748B' }}
            />
            <YAxis
              domain={[0, 5]}
              ticks={[0, 1, 2, 3, 4, 5]}
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 11, fill: '#94A3B8' }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar
              dataKey="confirmadas"
              name="Confirmadas"
              stackId="entregas"
              fill="#10B981"
              barSize={18}
            />
            <Bar
              dataKey="risco"
              name="Em risco"
              stackId="entregas"
              fill="#F59E0B"
              barSize={18}
              radius={[3, 3, 0, 0]}
            />
            <Line
              type="linear"
              dataKey="meta"
              name="Meta planejada"
              stroke="#2563EB"
              strokeWidth={1.5}
              strokeDasharray="4 4"
              dot={{ r: 3, fill: '#2563EB', strokeWidth: 0 }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </Box>
    </DashboardCard>
  );
};
