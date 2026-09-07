import React from 'react';
import { Box, Typography, LinearProgress } from '@mui/material';
import PaidOutlinedIcon from '@mui/icons-material/PaidOutlined';

interface ContractConsumptionCardProps {
  consumedPf?: number | string;
  consumedPercentage?: number;
  remainingPf?: number | string;
  ceilingPf?: number | string;
  periodRange?: string;
}

export const ContractConsumptionCard: React.FC<ContractConsumptionCardProps> = ({
  consumedPf = '7.469,04 PF',
  consumedPercentage = 68,
  remainingPf = '3.530,96 PF',
  ceilingPf = '11.000 PF',
  periodRange = 'Outubro de 2025 a Julho de 2026',
}) => {
  return (
    <Box
      sx={{
        backgroundColor: '#FFFFFF',
        border: '1px solid #E2E8F0',
        borderRadius: '10px',
        padding: '16px',
        display: 'flex',
        alignItems: 'flex-start',
        gap: '14px',
        transition: 'all 0.2s ease',
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
          backgroundColor: '#ECFDF5',
          color: '#10B981',
          flexShrink: 0,
        }}
      >
        <PaidOutlinedIcon sx={{ fontSize: 22 }} />
      </Box>

      {/* Content on Right */}
      <Box sx={{ flex: 1, minWidth: 0 }}>
        {/* Top Header: Title & Consumed % */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '2px',
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
            Contrato Consumido
          </Typography>
          <Typography
            sx={{
              fontSize: '0.75rem',
              fontWeight: 700,
              color: '#0F172A',
              lineHeight: 1.2,
            }}
          >
            {consumedPercentage}% consumido
          </Typography>
        </Box>

        {/* Big PF Number */}
        <Typography
          sx={{
            fontSize: '1.5rem',
            fontWeight: 700,
            color: '#0F172A',
            lineHeight: 1.1,
            letterSpacing: '-0.02em',
            marginBottom: '6px',
          }}
        >
          {consumedPf}
        </Typography>

        {/* Progress Bar */}
        <Box sx={{ width: '100%', marginBottom: '8px' }}>
          <LinearProgress
            variant="determinate"
            value={consumedPercentage}
            sx={{
              height: 7,
              borderRadius: 4,
              backgroundColor: '#E2E8F0',
              '& .MuiLinearProgress-bar': {
                backgroundColor: '#2563EB',
                borderRadius: 4,
              },
            }}
          />
        </Box>

        {/* Saldo e Teto */}
        <Typography
          sx={{
            fontSize: '0.6875rem',
            fontWeight: 600,
            color: '#0F172A',
            lineHeight: 1.2,
          }}
        >
          Saldo: {remainingPf} | Teto: {ceilingPf}
        </Typography>

        {/* Period */}
        <Typography
          sx={{
            fontSize: '0.625rem',
            color: '#94A3B8',
            marginTop: '2px',
            lineHeight: 1.2,
          }}
        >
          {periodRange}
        </Typography>
      </Box>
    </Box>
  );
};
