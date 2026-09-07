import React from 'react';
import { Box, Typography } from '@mui/material';

interface DashboardCardProps {
  title?: string;
  subtitle?: string;
  icon?: React.ReactNode;
  headerAction?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  sx?: object;
}

export const DashboardCard: React.FC<DashboardCardProps> = ({
  title,
  subtitle,
  icon,
  headerAction,
  children,
  className = '',
  sx = {},
}) => {
  const hasHeader = Boolean(title || icon || headerAction);

  return (
    <Box
      className={`dashboard-exec-card ${className}`}
      sx={{
        backgroundColor: '#FFFFFF',
        border: '1px solid #E5EAF2',
        borderRadius: '10px',
        padding: '16px',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 1px 3px rgba(15, 39, 71, 0.03)',
        transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
        '&:hover': {
          borderColor: '#D4DCF0',
        },
        ...sx,
      }}
    >
      {hasHeader && (
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '12px',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {icon && (
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  color: '#2563EB',
                }}
              >
                {icon}
              </Box>
            )}
            <Box>
              {title && (
                <Typography
                  component="h3"
                  sx={{
                    fontSize: '0.875rem',
                    fontWeight: 700,
                    color: '#0F2747',
                    lineHeight: 1.2,
                  }}
                >
                  {title}
                </Typography>
              )}
              {subtitle && (
                <Typography
                  component="p"
                  sx={{
                    fontSize: '0.75rem',
                    color: '#64748B',
                    marginTop: '2px',
                    lineHeight: 1.2,
                  }}
                >
                  {subtitle}
                </Typography>
              )}
            </Box>
          </Box>
          {headerAction && <Box>{headerAction}</Box>}
        </Box>
      )}
      <Box sx={{ flex: 1, minHeight: 0 }}>{children}</Box>
    </Box>
  );
};
