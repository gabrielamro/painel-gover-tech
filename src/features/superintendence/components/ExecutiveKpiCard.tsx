import React from 'react';
import { Box, Typography } from '@mui/material';

interface ComparisonData {
  text: string;
  subtext?: string;
  isPositive?: boolean;
  isNeutral?: boolean;
}

interface ExecutiveKpiCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  iconBg?: string;
  iconColor?: string;
  comparison?: ComparisonData;
  footer?: React.ReactNode;
  onClick?: () => void;
  isActive?: boolean;
}

export const ExecutiveKpiCard: React.FC<ExecutiveKpiCardProps> = ({
  title,
  value,
  icon,
  iconBg = '#DBEAFE',
  iconColor = '#2563EB',
  comparison,
  footer,
  onClick,
  isActive = false,
}) => {
  return (
    <Box
      onClick={onClick}
      sx={{
        backgroundColor: '#FFFFFF',
        border: isActive ? '1.5px solid #2563EB' : '1px solid #E5EAF2',
        borderRadius: '10px',
        padding: '14px 16px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        cursor: onClick ? 'pointer' : 'default',
        transition: 'border-color 0.2s ease, transform 0.2s ease, box-shadow 0.2s ease',
        '&:hover': onClick
          ? {
              borderColor: '#2563EB',
              transform: 'translateY(-1px)',
              boxShadow: '0 2px 8px rgba(37, 99, 235, 0.08)',
            }
          : undefined,
      }}
    >
      {/* Top Header: Title and Icon */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '8px',
        }}
      >
        <Typography
          sx={{
            fontSize: '0.8125rem',
            fontWeight: 600,
            color: '#64748B',
            lineHeight: 1.2,
          }}
        >
          {title}
        </Typography>
        <Box
          sx={{
            width: 36,
            height: 36,
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: iconBg,
            color: iconColor,
            flexShrink: 0,
          }}
        >
          {icon}
        </Box>
      </Box>

      {/* Main Metric Value */}
      <Box sx={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginBottom: '6px' }}>
        <Typography
          sx={{
            fontSize: '1.75rem',
            fontWeight: 700,
            color: '#0F2747',
            lineHeight: 1.1,
            letterSpacing: '-0.02em',
          }}
        >
          {value}
        </Typography>

        {comparison && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Typography
              component="span"
              sx={{
                fontSize: '0.75rem',
                fontWeight: 700,
                color: comparison.isPositive
                  ? '#16A34A'
                  : comparison.isNeutral
                  ? '#64748B'
                  : '#EF4444',
                lineHeight: 1,
              }}
            >
              {comparison.text}
            </Typography>
            {comparison.subtext && (
              <Typography
                component="span"
                sx={{
                  fontSize: '0.6875rem',
                  color: '#94A3B8',
                  lineHeight: 1,
                }}
              >
                {comparison.subtext}
              </Typography>
            )}
          </Box>
        )}
      </Box>

      {/* Footer Text / Indicators */}
      {footer && (
        <Box
          sx={{
            fontSize: '0.75rem',
            color: '#64748B',
            lineHeight: 1.3,
            borderTop: '1px solid #F1F5F9',
            paddingTop: '6px',
            marginTop: '2px',
          }}
        >
          {footer}
        </Box>
      )}
    </Box>
  );
};
