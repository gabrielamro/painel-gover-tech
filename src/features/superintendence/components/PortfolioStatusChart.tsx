import React from 'react';
import { Box, Typography } from '@mui/material';
import PieChartOutlineRoundedIcon from '@mui/icons-material/PieChartOutlineRounded';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';
import { DashboardCard } from './DashboardCard';
import { CustomTooltip } from './CustomTooltip';
import type { PortfolioStatusItem } from '../types';

interface PortfolioStatusChartProps {
  data?: PortfolioStatusItem[];
  totalProjects?: number;
}

const DEFAULT_PORTFOLIO_DATA: PortfolioStatusItem[] = [
  { name: 'No Prazo', value: 7, color: '#16A34A' },
  { name: 'Em Risco', value: 2, color: '#F59E0B' },
  { name: 'Atrasado', value: 1, color: '#EF4444' },
  { name: 'Homologação', value: 2, color: '#7C3AED' },
];

export const PortfolioStatusChart: React.FC<PortfolioStatusChartProps> = ({
  data = DEFAULT_PORTFOLIO_DATA,
  totalProjects,
}) => {
  const total = totalProjects ?? data.reduce((acc, curr) => acc + curr.value, 0);

  return (
    <DashboardCard
      title="Status do Portfólio"
      subtitle="Distribuição das iniciativas"
      icon={<PieChartOutlineRoundedIcon sx={{ fontSize: 20 }} />}
    >
      <Box sx={{ width: '100%', height: 220, position: 'relative', marginTop: '8px' }}>
        <ResponsiveContainer width="100%" height={160}>
          <PieChart>
            <Tooltip
              content={
                <CustomTooltip
                  valueFormatter={(v) => `${v} projetos`}
                />
              }
            />
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={52}
              outerRadius={70}
              paddingAngle={2}
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>

        {/* Center Donut Text */}
        <Box
          sx={{
            position: 'absolute',
            top: 80,
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
              color: '#0F2747',
              lineHeight: 1,
            }}
          >
            {total}
          </Typography>
          <Typography
            sx={{
              fontSize: '0.6875rem',
              color: '#64748B',
              lineHeight: 1,
              marginTop: '2px',
            }}
          >
            Projetos
          </Typography>
        </Box>

        {/* Compact Legend below */}
        <Box
          sx={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px 12px',
            marginTop: '6px',
          }}
        >
          {data.map((item) => (
            <Box
              key={item.name}
              sx={{ display: 'flex', alignItems: 'center', gap: '5px' }}
            >
              <Box
                sx={{
                  width: 7,
                  height: 7,
                  borderRadius: '50%',
                  backgroundColor: item.color,
                }}
              />
              <Typography
                sx={{
                  fontSize: '0.6875rem',
                  color: '#64748B',
                }}
              >
                {item.name}{' '}
                <Box
                  component="span"
                  sx={{ fontWeight: 700, color: '#0F2747' }}
                >
                  {item.value}
                </Box>
              </Typography>
            </Box>
          ))}
        </Box>
      </Box>
    </DashboardCard>
  );
};
