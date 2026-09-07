import React from 'react';
import { Box, Typography, Button } from '@mui/material';
import FlagOutlinedIcon from '@mui/icons-material/FlagOutlined';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { DashboardCard } from './DashboardCard';
import { ProjectCard } from './ProjectCard';
import type { PipelineProject } from '../types';

interface ProjectPipelineProps {
  projects: PipelineProject[];
  onSelectProject?: (project: PipelineProject) => void;
  onViewAll?: () => void;
}

export const ProjectPipeline: React.FC<ProjectPipelineProps> = ({
  projects,
  onSelectProject,
  onViewAll,
}) => {
  const headerAction = onViewAll ? (
    <Button
      variant="text"
      size="small"
      onClick={onViewAll}
      endIcon={<ArrowForwardIcon sx={{ fontSize: '14px !important' }} />}
      sx={{
        fontSize: '0.75rem',
        fontWeight: 600,
        color: '#2563EB',
        textTransform: 'none',
        padding: '2px 6px',
        '&:hover': {
          backgroundColor: '#EFF6FF',
        },
      }}
    >
      Ver todos os projetos
    </Button>
  ) : null;

  return (
    <DashboardCard
      title="Pipeline de Projetos"
      subtitle="Principais iniciativas em andamento"
      icon={<FlagOutlinedIcon sx={{ fontSize: 20 }} />}
      headerAction={headerAction}
    >
      {projects.length === 0 ? (
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '32px',
            color: '#94A3B8',
            fontSize: '0.8125rem',
          }}
        >
          Nenhum projeto encontrado para os filtros selecionados.
        </Box>
      ) : (
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: '1fr',
              sm: 'repeat(2, 1fr)',
              md: 'repeat(3, 1fr)',
              lg: 'repeat(4, 1fr)',
            },
            gap: '12px',
          }}
        >
          {projects.map((proj) => (
            <ProjectCard
              key={proj.id}
              project={proj}
              onClick={() => onSelectProject?.(proj)}
            />
          ))}
        </Box>
      )}
    </DashboardCard>
  );
};
