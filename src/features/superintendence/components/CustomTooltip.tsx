import React from 'react';
import { Box, Typography } from '@mui/material';

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    name?: string;
    value?: number | string;
    color?: string;
    dataKey?: string;
    payload?: any;
  }>;
  label?: string;
  valueFormatter?: (value: any) => string;
}

export const CustomTooltip: React.FC<CustomTooltipProps> = ({
  active,
  payload,
  label,
  valueFormatter,
}) => {
  if (!active || !payload || payload.length === 0) {
    return null;
  }

  return (
    <Box
      sx={{
        backgroundColor: '#FFFFFF',
        border: '1px solid #E5EAF2',
        borderRadius: '8px',
        padding: '8px 12px',
        boxShadow: '0 4px 12px rgba(15, 39, 71, 0.08)',
        minWidth: '120px',
      }}
    >
      {label && (
        <Typography
          sx={{
            fontSize: '0.75rem',
            fontWeight: 700,
            color: '#0F2747',
            marginBottom: '4px',
            borderBottom: '1px solid #F1F5F9',
            paddingBottom: '2px',
          }}
        >
          {label}
        </Typography>
      )}
      {payload.map((entry, index) => {
        const val = valueFormatter ? valueFormatter(entry.value) : entry.value;
        const entryName = entry.name || entry.dataKey;
        return (
          <Box
            key={`tooltip-item-${index}`}
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '8px',
              fontSize: '0.75rem',
              marginTop: index > 0 ? '3px' : '0',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Box
                sx={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  backgroundColor: entry.color || '#2563EB',
                }}
              />
              <Typography sx={{ fontSize: '0.75rem', color: '#64748B' }}>
                {entryName}:
              </Typography>
            </Box>
            <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, color: '#0F2747' }}>
              {val}
            </Typography>
          </Box>
        );
      })}
    </Box>
  );
};
