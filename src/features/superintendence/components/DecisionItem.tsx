import React from 'react';
import { Box, Typography } from '@mui/material';
import WarningAmberRoundedIcon from '@mui/icons-material/WarningAmberRounded';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import ReportProblemOutlinedIcon from '@mui/icons-material/ReportProblemOutlined';
import ChevronRightRoundedIcon from '@mui/icons-material/ChevronRightRounded';
import type { DecisionHighlightItem } from '../types';

interface DecisionItemProps {
  item: DecisionHighlightItem;
  onClick?: () => void;
}

export const DecisionItem: React.FC<DecisionItemProps> = ({ item, onClick }) => {
  const getIconConfig = () => {
    switch (item.severity) {
      case 'critical':
        return {
          icon: <ReportProblemOutlinedIcon sx={{ fontSize: 16 }} />,
          bg: '#FEE2E2',
          color: '#EF4444',
        };
      case 'warning':
        return {
          icon: <WarningAmberRoundedIcon sx={{ fontSize: 16 }} />,
          bg: '#FEF3C7',
          color: '#F59E0B',
        };
      case 'info':
      default:
        return {
          icon: <InfoOutlinedIcon sx={{ fontSize: 16 }} />,
          bg: '#DBEAFE',
          color: '#2563EB',
        };
    }
  };

  const iconConfig = getIconConfig();

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
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '8px 10px',
        borderRadius: '6px',
        backgroundColor: '#F8FAFC',
        border: '1px solid #E5EAF2',
        cursor: 'pointer',
        transition: 'background-color 0.15s ease, border-color 0.15s ease',
        '&:hover': {
          backgroundColor: '#EFF6FF',
          borderColor: '#BFDBFE',
        },
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: '8px', minWidth: 0 }}>
        <Box
          sx={{
            width: 26,
            height: 26,
            borderRadius: '50%',
            backgroundColor: iconConfig.bg,
            color: iconConfig.color,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            marginTop: '2px',
          }}
        >
          {iconConfig.icon}
        </Box>

        <Box sx={{ minWidth: 0 }}>
          <Box sx={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
            <Typography
              sx={{
                fontSize: '0.75rem',
                fontWeight: 700,
                color: '#0F2747',
                lineHeight: 1.2,
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {item.title}
            </Typography>
            {item.date && (
              <Typography
                sx={{
                  fontSize: '0.6875rem',
                  color: '#94A3B8',
                  lineHeight: 1,
                  whiteSpace: 'nowrap',
                }}
              >
                {item.date}
              </Typography>
            )}
          </Box>
          <Typography
            sx={{
              fontSize: '0.6875rem',
              color: '#64748B',
              lineHeight: 1.3,
              marginTop: '2px',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
            title={item.description}
          >
            {item.description}
          </Typography>
        </Box>
      </Box>

      <ChevronRightRoundedIcon
        sx={{
          fontSize: 16,
          color: '#94A3B8',
          flexShrink: 0,
          marginLeft: '4px',
        }}
      />
    </Box>
  );
};
