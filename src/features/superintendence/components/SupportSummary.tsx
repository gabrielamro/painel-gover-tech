import React from 'react';
import { Box } from '@mui/material';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import FolderOpenOutlinedIcon from '@mui/icons-material/FolderOpenOutlined';
import ReportProblemOutlinedIcon from '@mui/icons-material/ReportProblemOutlined';
import VerifiedUserOutlinedIcon from '@mui/icons-material/VerifiedUserOutlined';
import TaskAltOutlinedIcon from '@mui/icons-material/TaskAltOutlined';
import { DashboardCard } from './DashboardCard';
import { SupportMetric } from './SupportMetric';
import type { SupportSummaryStats } from '../types';

interface SupportSummaryProps {
  stats?: SupportSummaryStats;
}

export const SupportSummary: React.FC<SupportSummaryProps> = ({
  stats = {
    openCount: 14,
    criticalCount: 2,
    slaPercentage: 96,
    resolvedCount: 42,
    periodLabel: 'Julho/2026',
  },
}) => {
  return (
    <DashboardCard
      title={`Sustentação (${stats.periodLabel})`}
      subtitle="Chamados, SLA e resoluções operacionais"
      icon={<SettingsOutlinedIcon sx={{ fontSize: 20 }} />}
    >
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: 'repeat(2, 1fr)',
            sm: 'repeat(4, 1fr)',
          },
          gap: '8px',
        }}
      >
        <SupportMetric
          label="Abertos"
          value={stats.openCount}
          icon={<FolderOpenOutlinedIcon sx={{ fontSize: 16 }} />}
          iconBg="#CCFBF1"
          iconColor="#0D9488"
        />

        <SupportMetric
          label="Críticos"
          value={stats.criticalCount}
          icon={<ReportProblemOutlinedIcon sx={{ fontSize: 16 }} />}
          iconBg="#FEE2E2"
          iconColor="#EF4444"
        />

        <SupportMetric
          label="No SLA"
          value={`${stats.slaPercentage}%`}
          icon={<VerifiedUserOutlinedIcon sx={{ fontSize: 16 }} />}
          iconBg="#DBEAFE"
          iconColor="#2563EB"
        />

        <SupportMetric
          label="Resolvidos"
          value={stats.resolvedCount}
          icon={<TaskAltOutlinedIcon sx={{ fontSize: 16 }} />}
          iconBg="#DCFCE7"
          iconColor="#16A34A"
        />
      </Box>
    </DashboardCard>
  );
};
