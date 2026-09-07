import React from 'react';
import { Box, Button } from '@mui/material';
import CampaignOutlinedIcon from '@mui/icons-material/CampaignOutlined';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { DashboardCard } from './DashboardCard';
import { DecisionItem } from './DecisionItem';
import type { DecisionHighlightItem } from '../types';

interface DecisionsHighlightsProps {
  items: DecisionHighlightItem[];
  onSelectItem?: (item: DecisionHighlightItem) => void;
  onViewAll?: () => void;
}

export const DecisionsHighlights: React.FC<DecisionsHighlightsProps> = ({
  items,
  onSelectItem,
  onViewAll,
}) => {
  const headerAction = onViewAll ? (
    <Button
      variant="text"
      size="small"
      onClick={onViewAll}
      endIcon={<ArrowForwardIcon sx={{ fontSize: '14px !important' }} />}
      sx={{
        fontSize: '0.75rem',
        fontWeight: 600,
        color: '#2563EB',
        textTransform: 'none',
        padding: '2px 6px',
        '&:hover': {
          backgroundColor: '#EFF6FF',
        },
      }}
    >
      Ver todas
    </Button>
  ) : null;

  return (
    <DashboardCard
      title="Decisões e Destaques"
      subtitle="Itens críticos e homologações disponíveis"
      icon={<CampaignOutlinedIcon sx={{ fontSize: 20 }} />}
      headerAction={headerAction}
    >
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
          maxHeight: '260px',
          overflowY: 'auto',
          paddingRight: '2px',
        }}
      >
        {items.length === 0 ? (
          <Box
            sx={{
              padding: '16px',
              textAlign: 'center',
              color: '#94A3B8',
              fontSize: '0.75rem',
            }}
          >
            Nenhuma decisão pendente no momento.
          </Box>
        ) : (
          items.map((item) => (
            <DecisionItem
              key={item.id}
              item={item}
              onClick={() => onSelectItem?.(item)}
            />
          ))
        )}
      </Box>
    </DashboardCard>
  );
};
