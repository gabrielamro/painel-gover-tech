import React from 'react';
import { Box } from '@mui/material';
import type { ProjectStatusType } from '../types';

interface ProjectStatusBadgeProps {
  status: ProjectStatusType | string;
}

interface BadgeStyle {
  label: string;
  bg: string;
  color: string;
}

const STATUS_MAP: Record<string, BadgeStyle> = {
  development: {
    label: 'Em desenvolvimento',
    bg: '#DBEAFE',
    color: '#2563EB',
  },
  'Em desenvolvimento': {
    label: 'Em desenvolvimento',
    bg: '#DBEAFE',
    color: '#2563EB',
  },
  homologation: {
    label: 'Em homologação',
    bg: '#EDE9FE',
    color: '#7C3AED',
  },
  'Em homologação': {
    label: 'Em homologação',
    bg: '#EDE9FE',
    color: '#7C3AED',
  },
  acceptance: {
    label: 'Aguardando aceite',
    bg: '#FEF3C7',
    color: '#D97706',
  },
  'Aguardando aceite': {
    label: 'Aguardando aceite',
    bg: '#FEF3C7',
    color: '#D97706',
  },
  approved: {
    label: 'Aguardando aceite',
    bg: '#FEF3C7',
    color: '#D97706',
  },
  billing: {
    label: 'Aguardando aceite',
    bg: '#FEF3C7',
    color: '#D97706',
  },
  completed: {
    label: 'Concluído',
    bg: '#DCFCE7',
    color: '#16A34A',
  },
  'Concluído': {
    label: 'Concluído',
    bg: '#DCFCE7',
    color: '#16A34A',
  },
};

export const ProjectStatusBadge: React.FC<ProjectStatusBadgeProps> = ({ status }) => {
  const config = STATUS_MAP[status] || {
    label: status,
    bg: '#F1F5F9',
    color: '#475569',
  };

  return (
    <Box
      component="span"
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        padding: '2px 8px',
        borderRadius: '6px',
        fontSize: '0.6875rem',
        fontWeight: 600,
        backgroundColor: config.bg,
        color: config.color,
        lineHeight: 1.4,
        whiteSpace: 'nowrap',
      }}
    >
      {config.label}
    </Box>
  );
};
