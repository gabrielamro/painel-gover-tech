import React from 'react';
import { Box, Typography, Select, MenuItem, FormControl } from '@mui/material';
import CalendarMonthOutlinedIcon from '@mui/icons-material/CalendarMonthOutlined';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import FiberManualRecordIcon from '@mui/icons-material/FiberManualRecord';

interface DashboardHeaderProps {
  selectedPeriod: string;
  onPeriodChange: (period: string) => void;
  selectedVision: string;
  onVisionChange: (vision: string) => void;
  selectedSystem: string;
  onSystemChange: (system: string) => void;
  systems: string[];
  lastUpdatedText?: string;
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  selectedPeriod,
  onPeriodChange,
  selectedVision,
  onVisionChange,
  selectedSystem,
  onSystemChange,
  systems,
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
        paddingBottom: '16px',
        borderBottom: '1px solid #E5EAF2',
        marginBottom: '16px',
      }}
    >
      {/* Left side: Branding / Title */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <Box
          sx={{
            width: 38,
            height: 38,
            borderRadius: '8px',
            backgroundColor: '#0F2747',
            color: '#FFFFFF',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 700,
            fontSize: '0.875rem',
            letterSpacing: '0.05em',
            flexShrink: 0,
          }}
        >
          SUF
        </Box>
        <Box>
          <Typography
            component="h1"
            sx={{
              fontSize: '1.25rem',
              fontWeight: 700,
              color: '#0F2747',
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
              marginTop: '2px',
              lineHeight: 1.2,
            }}
          >
            Panorama consolidado dos projetos e entregas da fábrica de software
          </Typography>
        </Box>
      </Box>

      {/* Right side: Compact Filters & Updated Tag */}
      <Box
        sx={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          gap: '10px',
        }}
      >
        {/* Period Filter */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            backgroundColor: '#FFFFFF',
            border: '1px solid #E5EAF2',
            borderRadius: '8px',
            padding: '2px 8px',
            height: '34px',
          }}
        >
          <CalendarMonthOutlinedIcon
            sx={{ fontSize: 16, color: '#64748B', marginRight: '6px' }}
          />
          <FormControl size="small" variant="standard">
            <Select
              value={selectedPeriod}
              onChange={(e) => onPeriodChange(e.target.value)}
              disableUnderline
              IconComponent={KeyboardArrowDownIcon}
              sx={{
                fontSize: '0.8125rem',
                fontWeight: 600,
                color: '#0F2747',
                '& .MuiSelect-select': {
                  paddingRight: '22px !important',
                  paddingY: 0,
                },
                '& .MuiSvgIcon-root': {
                  color: '#64748B',
                  fontSize: 18,
                  right: 0,
                },
              }}
            >
              <MenuItem value="Julho de 2026">Julho de 2026</MenuItem>
              <MenuItem value="Agosto de 2026">Agosto de 2026</MenuItem>
              <MenuItem value="Setembro de 2026">Setembro de 2026</MenuItem>
            </Select>
          </FormControl>
        </Box>

        {/* Vision Filter */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            backgroundColor: '#FFFFFF',
            border: '1px solid #E5EAF2',
            borderRadius: '8px',
            padding: '2px 8px',
            height: '34px',
          }}
        >
          <FormControl size="small" variant="standard">
            <Select
              value={selectedVision}
              onChange={(e) => onVisionChange(e.target.value)}
              disableUnderline
              IconComponent={KeyboardArrowDownIcon}
              sx={{
                fontSize: '0.8125rem',
                fontWeight: 600,
                color: '#0F2747',
                '& .MuiSelect-select': {
                  paddingRight: '22px !important',
                  paddingY: 0,
                },
                '& .MuiSvgIcon-root': {
                  color: '#64748B',
                  fontSize: 18,
                  right: 0,
                },
              }}
            >
              <MenuItem value="all">Todos os projetos</MenuItem>
              <MenuItem value="critical">Projetos críticos / em risco</MenuItem>
              <MenuItem value="active">Projetos em andamento</MenuItem>
            </Select>
          </FormControl>
        </Box>

        {/* System Filter */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            backgroundColor: '#FFFFFF',
            border: '1px solid #E5EAF2',
            borderRadius: '8px',
            padding: '2px 8px',
            height: '34px',
          }}
        >
          <FormControl size="small" variant="standard">
            <Select
              value={selectedSystem}
              onChange={(e) => onSystemChange(e.target.value)}
              disableUnderline
              IconComponent={KeyboardArrowDownIcon}
              sx={{
                fontSize: '0.8125rem',
                fontWeight: 600,
                color: '#0F2747',
                '& .MuiSelect-select': {
                  paddingRight: '22px !important',
                  paddingY: 0,
                },
                '& .MuiSvgIcon-root': {
                  color: '#64748B',
                  fontSize: 18,
                  right: 0,
                },
              }}
            >
              <MenuItem value="all">Todos os sistemas</MenuItem>
              {systems.map((sys) => (
                <MenuItem key={sys} value={sys}>
                  {sys}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>

        {/* Updated Time Badge */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            backgroundColor: '#FFFFFF',
            border: '1px solid #E5EAF2',
            borderRadius: '8px',
            padding: '6px 10px',
            height: '34px',
          }}
        >
          <FiberManualRecordIcon sx={{ fontSize: 9, color: '#16A34A' }} />
          <Typography
            sx={{
              fontSize: '0.75rem',
              color: '#64748B',
              whiteSpace: 'nowrap',
            }}
          >
            Atualizado em {lastUpdatedText}
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};
