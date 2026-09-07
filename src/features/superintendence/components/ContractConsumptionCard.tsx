import React from 'react';
import { Box, Typography, LinearProgress } from '@mui/material';
import AccountBalanceWalletOutlinedIcon from '@mui/icons-material/AccountBalanceWalletOutlined';

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
        border: '1px solid #E5EAF2',
        borderRadius: '10px',
        padding: '14px 16px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
        '&:hover': {
          borderColor: '#D4DCF0',
        },
      }}
    >
      {/* Header: Title and Icon */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '6px',
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
        <Box
          sx={{
            width: 36,
            height: 36,
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#EFF6FF',
            color: '#2563EB',
            flexShrink: 0,
          }}
        >
          <AccountBalanceWalletOutlinedIcon sx={{ fontSize: 20 }} />
        </Box>
      </Box>

      {/* Main Metric Value & Percentage */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'baseline',
          justifyContent: 'space-between',
          marginBottom: '6px',
        }}
      >
        <Typography
          sx={{
            fontSize: '1.5rem',
            fontWeight: 700,
            color: '#0F2747',
            lineHeight: 1.1,
            letterSpacing: '-0.02em',
          }}
        >
          {consumedPf}
        </Typography>
        <Typography
          sx={{
            fontSize: '0.8125rem',
            fontWeight: 700,
            color: '#2563EB',
          }}
        >
          {consumedPercentage}% consumido
        </Typography>
      </Box>

      {/* LinearProgress */}
      <Box sx={{ width: '100%', marginBottom: '8px' }}>
        <LinearProgress
          variant="determinate"
          value={consumedPercentage}
          sx={{
            height: 6,
            borderRadius: 3,
            backgroundColor: '#E2E8F0',
            '& .MuiLinearProgress-bar': {
              backgroundColor: '#2563EB',
              borderRadius: 3,
            },
          }}
        />
      </Box>

      {/* Footer Info */}
      <Box
        sx={{
          borderTop: '1px solid #F1F5F9',
          paddingTop: '6px',
          display: 'flex',
          flexDirection: 'column',
          gap: '2px',
        }}
      >
        <Typography
          sx={{
            fontSize: '0.75rem',
            fontWeight: 600,
            color: '#0F2747',
            lineHeight: 1.2,
          }}
        >
          Saldo: {remainingPf} | Teto: {ceilingPf}
        </Typography>
        <Typography
          sx={{
            fontSize: '0.6875rem',
            color: '#94A3B8',
            lineHeight: 1.2,
          }}
        >
          {periodRange}
        </Typography>
      </Box>
    </Box>
  );
};
