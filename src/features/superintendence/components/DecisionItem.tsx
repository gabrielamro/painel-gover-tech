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
          icon: <ReportProblemOutlinedIcon sx={{ fontSize: 18 }} />,
          bg: '#FEE2E2',
          color: '#EF4444',
        };
      case 'warning':
        return {
          icon: <WarningAmberRoundedIcon sx={{ fontSize: 18 }} />,
          bg: '#FEF3C7',
          color: '#F59E0B',
        };
      case 'info':
      default:
        return {
          icon: <InfoOutlinedIcon sx={{ fontSize: 18 }} />,
          bg: '#EFF6FF',
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
        padding: '10px 6px',
        borderRadius: '8px',
        cursor: 'pointer',
        transition: 'background-color 0.15s ease',
        borderBottom: '1px solid #F1F5F9',
        '&:last-child': {
          borderBottom: 'none',
        },
        '&:hover': {
          backgroundColor: '#F8FAFC',
        },
      }}
    >
      {/* Left: Icon + Content */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0 }}>
        <Box
          sx={{
            width: 36,
            height: 36,
            borderRadius: '50%',
            backgroundColor: iconConfig.bg,
            color: iconConfig.color,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          {iconConfig.icon}
        </Box>

        <Box sx={{ minWidth: 0 }}>
          <Typography
            sx={{
              fontSize: '0.8125rem',
              fontWeight: 700,
              color: '#0F172A',
              lineHeight: 1.2,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {item.title}
          </Typography>
          <Typography
            sx={{
              fontSize: '0.75rem',
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

      {/* Right: Date + Chevron */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: '4px', flexShrink: 0, marginLeft: '12px' }}>
        {item.date && (
          <Typography
            sx={{
              fontSize: '0.75rem',
              color: '#64748B',
              whiteSpace: 'nowrap',
            }}
          >
            {item.date}
          </Typography>
        )}
        <ChevronRightRoundedIcon
          sx={{
            fontSize: 18,
            color: '#94A3B8',
          }}
        />
      </Box>
    </Box>
  );
};
