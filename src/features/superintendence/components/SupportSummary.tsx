import React from 'react';
import { Box, Typography } from '@mui/material';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import FolderOpenOutlinedIcon from '@mui/icons-material/FolderOpenOutlined';
import ReportProblemOutlinedIcon from '@mui/icons-material/ReportProblemOutlined';
import VerifiedUserOutlinedIcon from '@mui/icons-material/VerifiedUserOutlined';
import CheckCircleOutlineOutlinedIcon from '@mui/icons-material/CheckCircleOutlineOutlined';
import { DashboardCard } from './DashboardCard';
import { SupportMetric } from './SupportMetric';
import type { SupportSummaryStats } from '../types';

interface SupportSummaryProps {
  stats?: SupportSummaryStats;
  onViewDetails?: () => void;
}

export const SupportSummary: React.FC<SupportSummaryProps> = ({
  stats = {
    openCount: 14,
    criticalCount: 2,
    slaPercentage: 96,
    resolvedCount: 42,
    periodLabel: 'Julho/2026',
  },
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
      title={`Sustentação (${stats.periodLabel})`}
      icon={<SettingsOutlinedIcon sx={{ fontSize: 20 }} />}
      headerAction={headerAction}
    >
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: 'repeat(2, 1fr)',
            sm: 'repeat(4, 1fr)',
          },
          gap: '10px',
        }}
      >
        <SupportMetric
          label="Abertos"
          value={stats.openCount}
          icon={<FolderOpenOutlinedIcon sx={{ fontSize: 18 }} />}
          iconBg="#ECFDF5"
          iconColor="#10B981"
        />

        <SupportMetric
          label="Críticos"
          value={stats.criticalCount}
          icon={<ReportProblemOutlinedIcon sx={{ fontSize: 18 }} />}
          iconBg="#FEE2E2"
          iconColor="#EF4444"
        />

        <SupportMetric
          label="No SLA"
          value={`${stats.slaPercentage}%`}
          icon={<VerifiedUserOutlinedIcon sx={{ fontSize: 18 }} />}
          iconBg="#EFF6FF"
          iconColor="#2563EB"
        />

        <SupportMetric
          label="Resolvidos"
          value={stats.resolvedCount}
          icon={<CheckCircleOutlineOutlinedIcon sx={{ fontSize: 18 }} />}
          iconBg="#ECFDF5"
          iconColor="#10B981"
        />
      </Box>
    </DashboardCard>
  );
};
