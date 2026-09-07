import React from 'react';
import { Box, Typography } from '@mui/material';

interface SupportMetricProps {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  iconBg: string;
  iconColor: string;
}

export const SupportMetric: React.FC<SupportMetricProps> = ({
  label,
  value,
  icon,
  iconBg,
  iconColor,
}) => {
  return (
    <Box
      sx={{
        backgroundColor: '#F8FAFC',
        border: '1px solid #E5EAF2',
        borderRadius: '8px',
        padding: '8px 10px',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        flex: 1,
        minWidth: 0,
      }}
    >
      <Box
        sx={{
          width: 30,
          height: 30,
          borderRadius: '50%',
          backgroundColor: iconBg,
          color: iconColor,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        {icon}
      </Box>

      <Box sx={{ minWidth: 0 }}>
        <Typography
          sx={{
            fontSize: '1rem',
            fontWeight: 700,
            color: '#0F2747',
            lineHeight: 1.1,
          }}
        >
          {value}
        </Typography>
        <Typography
          sx={{
            fontSize: '0.6875rem',
            color: '#64748B',
            lineHeight: 1,
            marginTop: '2px',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          {label}
        </Typography>
      </Box>
    </Box>
  );
};
