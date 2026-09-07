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
  iconBg = '#EFF6FF',
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
        border: isActive ? '1.5px solid #2563EB' : '1px solid #E2E8F0',
        borderRadius: '10px',
        padding: '16px',
        display: 'flex',
        alignItems: 'flex-start',
        gap: '14px',
        cursor: onClick ? 'pointer' : 'default',
        transition: 'all 0.2s ease',
        '&:hover': onClick
          ? {
              borderColor: '#2563EB',
              boxShadow: '0 2px 6px rgba(0, 0, 0, 0.04)',
            }
          : undefined,
      }}
    >
      {/* Icon Circle on Left */}
      <Box
        sx={{
          width: 44,
          height: 44,
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

      {/* Content Column on Right */}
      <Box sx={{ flex: 1, minWidth: 0 }}>
        {/* Title */}
        <Typography
          sx={{
            fontSize: '0.8125rem',
            fontWeight: 600,
            color: '#64748B',
            lineHeight: 1.2,
            marginBottom: '4px',
          }}
        >
          {title}
        </Typography>

        {/* Big Number + Comparison */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
          <Typography
            sx={{
              fontSize: '1.75rem',
              fontWeight: 700,
              color: '#0F172A',
              lineHeight: 1,
              letterSpacing: '-0.02em',
            }}
          >
            {value}
          </Typography>

          {comparison && (
            <Box sx={{ display: 'flex', flexDirection: 'column' }}>
              <Typography
                component="span"
                sx={{
                  fontSize: '0.6875rem',
                  fontWeight: 700,
                  color: comparison.isPositive
                    ? '#16A34A'
                    : comparison.isNeutral
                    ? '#64748B'
                    : '#EF4444',
                  lineHeight: 1.1,
                }}
              >
                {comparison.text}
              </Typography>
              {comparison.subtext && (
                <Typography
                  component="span"
                  sx={{
                    fontSize: '0.625rem',
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

        {/* Footer text */}
        {footer && (
          <Typography
            sx={{
              fontSize: '0.6875rem',
              color: '#64748B',
              lineHeight: 1.2,
            }}
          >
            {footer}
          </Typography>
        )}
      </Box>
    </Box>
  );
};
