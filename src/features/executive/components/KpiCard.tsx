import { Box, Paper, Typography, type SxProps, type Theme } from '@mui/material';
import type { ReactNode } from 'react';
import { kpiColors } from './kpi-tokens';

interface Props {
  icon: ReactNode;
  iconBg?: string;
  iconColor?: string;
  title: string;
  badge?: ReactNode;
  children: ReactNode;
  sx?: SxProps<Theme>;
}

export function KpiCard({
  icon,
  iconBg = kpiColors.blueLight,
  iconColor = kpiColors.blue,
  title,
  badge,
  children,
  sx,
}: Props) {
  return (
    <Paper
      elevation={0}
      sx={{
        p: 2,
        height: '100%',
        minHeight: 235,
        maxHeight: 250,
        bgcolor: kpiColors.cardBg,
        border: `1px solid ${kpiColors.border}`,
        borderRadius: '14px',
        boxShadow: '0 2px 8px rgba(15, 23, 42, 0.04)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        transition: 'all 0.15s ease',
        '&:hover': {
          boxShadow: '0 4px 12px rgba(15, 23, 42, 0.06)',
          borderColor: '#CBD5E1',
        },
        ...sx,
      }}
    >
      {/* Cabeçalho Compacto do Card */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box
            sx={{
              width: 26,
              height: 26,
              borderRadius: '7px',
              bgcolor: iconBg,
              color: iconColor,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            {icon}
          </Box>
          <Typography
            variant="caption"
            sx={{
              fontSize: '11px',
              fontWeight: 600,
              letterSpacing: '0.3px',
              color: kpiColors.slate,
              textTransform: 'uppercase',
              lineHeight: 1.2,
            }}
          >
            {title}
          </Typography>
        </Box>

        {badge && <Box sx={{ flexShrink: 0 }}>{badge}</Box>}
      </Box>

      {/* Conteúdo Principal / Visual */}
      <Box sx={{ display: 'flex', flexDirection: 'column', flex: 1, justifyContent: 'space-between' }}>
        {children}
      </Box>
    </Paper>
  );
}
