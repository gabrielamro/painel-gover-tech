import React from 'react';
import { Box, Typography } from '@mui/material';
import CalendarMonthOutlinedIcon from '@mui/icons-material/CalendarMonthOutlined';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import FiberManualRecordIcon from '@mui/icons-material/FiberManualRecord';
import { SuframaLogo } from './SuframaLogo';

interface DashboardHeaderProps {
  selectedPeriod?: string;
  onPeriodChange?: (period: string) => void;
  selectedVision?: string;
  onVisionChange?: (vision: string) => void;
  selectedSystem?: string;
  onSystemChange?: (system: string) => void;
  systems?: string[];
  lastUpdatedText?: string;
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  selectedPeriod = 'Julho de 2026',
  selectedVision = 'Todos os projetos',
  selectedSystem = 'Todos os sistemas',
  lastUpdatedText = '05/08/2026 10:24',
}) => {
  return (
    <Box
      sx={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '16px',
        paddingBottom: '4px',
      }}
    >
      {/* Left side: Logo + Title + Subtitle */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <SuframaLogo />

        <Box sx={{ borderLeft: '1px solid #E2E8F0', paddingLeft: '16px' }}>
          <Typography
            component="h1"
            sx={{
              fontSize: '1.25rem',
              fontWeight: 700,
              color: '#0F172A',
              lineHeight: 1.2,
            }}
          >
            Visão Executiva da Gestão Suframa
          </Typography>
          <Typography
            component="p"
            sx={{
              fontSize: '0.8125rem',
              color: '#64748B',
              marginTop: '3px',
              lineHeight: 1.2,
            }}
          >
            Panorama consolidado dos projetos e entregas da fábrica de software
          </Typography>
        </Box>
      </Box>

      {/* Right side: 4 Two-row Filters */}
      <Box
        sx={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          gap: '8px',
        }}
      >
        {/* Box 1: Período */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            backgroundColor: '#FFFFFF',
            border: '1px solid #E2E8F0',
            borderRadius: '8px',
            padding: '4px 10px',
            gap: '8px',
            cursor: 'pointer',
            height: '42px',
            '&:hover': { borderColor: '#CBD5E1' },
          }}
        >
          <CalendarMonthOutlinedIcon sx={{ fontSize: 16, color: '#64748B' }} />
          <Box>
            <Typography sx={{ fontSize: '0.625rem', color: '#94A3B8', lineHeight: 1 }}>
              Período
            </Typography>
            <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: '#0F172A', lineHeight: 1.3 }}>
              {selectedPeriod}
            </Typography>
          </Box>
          <KeyboardArrowDownIcon sx={{ fontSize: 16, color: '#64748B' }} />
        </Box>

        {/* Box 2: Visão */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            backgroundColor: '#FFFFFF',
            border: '1px solid #E2E8F0',
            borderRadius: '8px',
            padding: '4px 10px',
            gap: '8px',
            cursor: 'pointer',
            height: '42px',
            '&:hover': { borderColor: '#CBD5E1' },
          }}
        >
          <Box>
            <Typography sx={{ fontSize: '0.625rem', color: '#94A3B8', lineHeight: 1 }}>
              Visão
            </Typography>
            <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: '#0F172A', lineHeight: 1.3 }}>
              {selectedVision}
            </Typography>
          </Box>
          <KeyboardArrowDownIcon sx={{ fontSize: 16, color: '#64748B' }} />
        </Box>

        {/* Box 3: Sistema */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            backgroundColor: '#FFFFFF',
            border: '1px solid #E2E8F0',
            borderRadius: '8px',
            padding: '4px 10px',
            gap: '8px',
            cursor: 'pointer',
            height: '42px',
            '&:hover': { borderColor: '#CBD5E1' },
          }}
        >
          <Box>
            <Typography sx={{ fontSize: '0.625rem', color: '#94A3B8', lineHeight: 1 }}>
              Sistema
            </Typography>
            <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: '#0F172A', lineHeight: 1.3 }}>
              {selectedSystem}
            </Typography>
          </Box>
          <KeyboardArrowDownIcon sx={{ fontSize: 16, color: '#64748B' }} />
        </Box>

        {/* Box 4: Atualizado em */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            backgroundColor: '#FFFFFF',
            border: '1px solid #E2E8F0',
            borderRadius: '8px',
            padding: '4px 10px',
            gap: '8px',
            height: '42px',
          }}
        >
          <FiberManualRecordIcon sx={{ fontSize: 9, color: '#16A34A' }} />
          <Box>
            <Typography sx={{ fontSize: '0.625rem', color: '#94A3B8', lineHeight: 1 }}>
              Atualizado em
            </Typography>
            <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: '#0F172A', lineHeight: 1.3 }}>
              {lastUpdatedText}
            </Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};
