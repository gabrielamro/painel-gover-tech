import React from 'react';
import { Box } from '@mui/material';
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
  Legend,
} from 'recharts';
import { DashboardCard } from './DashboardCard';
import { CustomTooltip } from './CustomTooltip';
import type { DeliveryForecastWeek } from '../types';

interface DeliveryForecastChartProps {
  data?: DeliveryForecastWeek[];
  subtitle?: string;
}

const DEFAULT_FORECAST_DATA: DeliveryForecastWeek[] = [
  { semana: '01–02', confirmadas: 3, risco: 0, meta: 3 },
  { semana: '03–09', confirmadas: 4, risco: 1, meta: 5 },
  { semana: '10–16', confirmadas: 5, risco: 1, meta: 6 },
  { semana: '17–23', confirmadas: 4, risco: 2, meta: 5 },
  { semana: '24–30', confirmadas: 3, risco: 1, meta: 4 },
  { semana: '31', confirmadas: 2, risco: 0, meta: 2 },
];

export const DeliveryForecastChart: React.FC<DeliveryForecastChartProps> = ({
  data = DEFAULT_FORECAST_DATA,
  subtitle = 'Compromissos por semana • Agosto de 2026',
}) => {
  return (
    <DashboardCard
      title="Previsão de Entregas"
      subtitle={subtitle}
      icon={<CalendarMonthOutlinedIcon sx={{ fontSize: 20 }} />}
    >
      <Box sx={{ width: '100%', height: 220, marginTop: '8px' }}>
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart
            data={data}
            margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
          >
            <CartesianGrid stroke="#EEF2F7" vertical={false} />
            <XAxis
              dataKey="semana"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 11, fill: '#64748B' }}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              allowDecimals={false}
              tick={{ fontSize: 11, fill: '#64748B' }}
            />
            <Tooltip
              content={
                <CustomTooltip
                  valueFormatter={(v) => `${v}`}
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
              dataKey="confirmadas"
              name="Entregas confirmadas"
              stackId="entregas"
              fill="#16A34A"
              barSize={20}
            />
            <Bar
              dataKey="risco"
              name="Em risco"
              stackId="entregas"
              fill="#F59E0B"
              barSize={20}
              radius={[4, 4, 0, 0]}
            />
            <Line
              type="monotone"
              dataKey="meta"
              name="Meta planejada"
              stroke="#2563EB"
              strokeWidth={2}
              strokeDasharray="5 5"
              dot={{ r: 3, fill: '#2563EB' }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </Box>
    </DashboardCard>
  );
};
