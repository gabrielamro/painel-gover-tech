import React from 'react';
import { Box, Typography } from '@mui/material';
import type { DeadlineUrgencyType } from '../types';

interface DeadlineStatusProps {
  status: DeadlineUrgencyType | string;
  labelOverride?: string;
}

const URGENCY_CONFIG: Record<string, { label: string; dotColor: string; textColor: string }> = {
  on_time: {
    label: 'No prazo',
    dotColor: '#16A34A',
    textColor: '#15803D',
  },
  'No prazo': {
    label: 'No prazo',
    dotColor: '#16A34A',
    textColor: '#15803D',
  },
  at_risk: {
    label: 'Em risco',
    dotColor: '#F59E0B',
    textColor: '#B45309',
  },
  'Em risco': {
    label: 'Em risco',
    dotColor: '#F59E0B',
    textColor: '#B45309',
  },
  delayed: {
    label: 'Atrasado',
    dotColor: '#EF4444',
    textColor: '#B91C1C',
  },
  'Atrasado': {
    label: 'Atrasado',
    dotColor: '#EF4444',
    textColor: '#B91C1C',
  },
};

export const DeadlineStatus: React.FC<DeadlineStatusProps> = ({ status, labelOverride }) => {
  const config = URGENCY_CONFIG[status] || URGENCY_CONFIG.on_time;
  const label = labelOverride || config.label;

  return (
    <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
      <Box
        sx={{
          width: 7,
          height: 7,
          borderRadius: '50%',
          backgroundColor: config.dotColor,
          flexShrink: 0,
        }}
      />
      <Typography
        component="span"
        sx={{
          fontSize: '0.6875rem',
          fontWeight: 600,
          color: config.textColor,
          lineHeight: 1,
        }}
      >
        {label}
      </Typography>
    </Box>
  );
};
