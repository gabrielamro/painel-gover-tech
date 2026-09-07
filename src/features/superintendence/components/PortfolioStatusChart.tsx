import React from 'react';
import { Box, Typography } from '@mui/material';
import PieChartOutlineRoundedIcon from '@mui/icons-material/PieChartOutlineRounded';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';
import { DashboardCard } from './DashboardCard';
import { CustomTooltip } from './CustomTooltip';

interface PortfolioStatusItem {
  name: string;
  value: number;
  color: string;
  percentage: string;
}

interface PortfolioStatusChartProps {
  data?: PortfolioStatusItem[];
  totalProjects?: number;
}

const DEFAULT_PORTFOLIO_DATA: PortfolioStatusItem[] = [
  { name: 'No Prazo', value: 7, color: '#10B981', percentage: '58%' },
  { name: 'Homologação', value: 2, color: '#A855F7', percentage: '17%' },
  { name: 'Em Risco', value: 2, color: '#F59E0B', percentage: '17%' },
  { name: 'Atrasado', value: 1, color: '#EF4444', percentage: '8%' },
];

export const PortfolioStatusChart: React.FC<PortfolioStatusChartProps> = ({
  data = DEFAULT_PORTFOLIO_DATA,
  totalProjects = 12,
}) => {
  return (
    <DashboardCard
      title="Status do Portfólio"
      subtitle="Distribuição das iniciativas"
      icon={<PieChartOutlineRoundedIcon sx={{ fontSize: 20 }} />}
    >
      <Box sx={{ width: '100%', height: 210, position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        {/* Pie Canvas */}
        <Box sx={{ width: '100%', height: 150, position: 'relative' }}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Tooltip content={<CustomTooltip valueFormatter={(v) => `${v} iniciativas`} />} />
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={46}
                outerRadius={62}
                paddingAngle={2}
                dataKey="value"
                label={({ percentage, x, y, cx }: any) => (
                  <text
                    x={x}
                    y={y}
                    fill="#475569"
                    textAnchor={x > cx ? 'start' : 'end'}
                    dominantBaseline="central"
                    fontSize={10}
                    fontWeight={600}
                  >
                    {percentage}
                  </text>
                )}
                labelLine={false}
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-port-${index}`} fill={entry.color} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>

          {/* Center Text inside Donut */}
          <Box
            sx={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              textAlign: 'center',
              pointerEvents: 'none',
            }}
          >
            <Typography
              sx={{
                fontSize: '1.25rem',
                fontWeight: 700,
                color: '#0F172A',
                lineHeight: 1,
              }}
            >
              {totalProjects}
            </Typography>
            <Typography
              sx={{
                fontSize: '0.6875rem',
                color: '#64748B',
                lineHeight: 1,
                marginTop: '3px',
              }}
            >
              Projetos
            </Typography>
          </Box>
        </Box>

        {/* 2x2 Legend below */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: '6px 16px',
            width: '100%',
            maxWidth: '240px',
            marginTop: '6px',
          }}
        >
          {data.map((item) => (
            <Box
              key={item.name}
              sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Box
                  sx={{
                    width: 7,
                    height: 7,
                    borderRadius: '50%',
                    backgroundColor: item.color,
                  }}
                />
                <Typography sx={{ fontSize: '0.6875rem', color: '#64748B' }}>
                  {item.name}
                </Typography>
              </Box>
              <Typography sx={{ fontSize: '0.6875rem', fontWeight: 700, color: '#0F172A' }}>
                {item.value}
              </Typography>
            </Box>
          ))}
        </Box>
      </Box>
    </DashboardCard>
  );
};
