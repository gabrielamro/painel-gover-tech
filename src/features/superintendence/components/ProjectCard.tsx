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
        border: '1px solid #E5EAF2',
        borderRadius: '8px',
        padding: '12px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        cursor: 'pointer',
        transition: 'border-color 0.2s ease, transform 0.2s ease, box-shadow 0.2s ease',
        '&:hover': {
          borderColor: '#93C5FD',
          transform: 'translateY(-1px)',
          boxShadow: '0 2px 6px rgba(37, 99, 235, 0.06)',
        },
      }}
    >
      {/* Top Header: System/Subsystem & Badge */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '8px',
          marginBottom: '6px',
        }}
      >
        <Typography
          sx={{
            fontSize: '0.75rem',
            fontWeight: 700,
            color: '#2563EB',
            letterSpacing: '0.01em',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {project.system}
          {project.subsystem ? ` / ${project.subsystem}` : ''}
        </Typography>

        <ProjectStatusBadge status={project.status} />
      </Box>

      {/* Main Initiative Title / Objective */}
      <Typography
        sx={{
          fontSize: '0.8125rem',
          fontWeight: 600,
          color: '#0F2747',
          lineHeight: 1.3,
          marginBottom: '10px',
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
          minHeight: '34px',
        }}
        title={project.title}
      >
        {project.title}
      </Typography>

      {/* Bottom Row: Delivery Date & Deadline Indicator */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderTop: '1px solid #F1F5F9',
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
