import React from 'react';
import { Box, Typography } from '@mui/material';
import CalendarMonthOutlinedIcon from '@mui/icons-material/CalendarMonthOutlined';
import { ProjectStatusBadge } from './ProjectStatusBadge';
import { DeadlineStatus } from './DeadlineStatus';
import type { PipelineProject } from '../types';

interface ProjectCardProps {
  project: PipelineProject;
  onClick?: () => void;
}

export const ProjectCard: React.FC<ProjectCardProps> = ({ project, onClick }) => {
  return (
    <Box
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if ((e.key === 'Enter' || e.key === ' ') && onClick) {
          e.preventDefault();
          onClick();
        }
      }}
      sx={{
        backgroundColor: '#FFFFFF',
        border: '1px solid #E2E8F0',
        borderRadius: '8px',
        padding: '12px 14px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        cursor: 'pointer',
        minHeight: '128px',
        transition: 'all 0.2s ease',
        '&:hover': {
          borderColor: '#93C5FD',
          boxShadow: '0 2px 8px rgba(37, 99, 235, 0.06)',
          transform: 'translateY(-1px)',
        },
      }}
    >
      {/* Top Header: System / Subsystem */}
      <Box sx={{ marginBottom: '4px' }}>
        <Typography
          sx={{
            fontSize: '0.8125rem',
            fontWeight: 700,
            color: '#0F172A',
            lineHeight: 1.2,
          }}
        >
          {project.system}
          {project.subsystem ? ` / ${project.subsystem}` : ''}
        </Typography>

        {/* Initiative description */}
        <Typography
          sx={{
            fontSize: '0.75rem',
            color: '#64748B',
            lineHeight: 1.3,
            marginTop: '3px',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
          title={project.title}
        >
          {project.title}
        </Typography>
      </Box>

      {/* Badge Line */}
      <Box sx={{ marginY: '6px' }}>
        <ProjectStatusBadge status={project.status} />
      </Box>

      {/* Bottom Row: Delivery Date & Deadline Status */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingTop: '6px',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <CalendarMonthOutlinedIcon sx={{ fontSize: 13, color: '#94A3B8' }} />
          <Typography sx={{ fontSize: '0.6875rem', color: '#64748B' }}>
            Entrega {project.dueDate}
          </Typography>
        </Box>

        <DeadlineStatus status={project.deadlineStatus} />
      </Box>
    </Box>
  );
};
