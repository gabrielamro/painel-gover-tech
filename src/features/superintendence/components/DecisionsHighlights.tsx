import React from 'react';
import { Box, Typography } from '@mui/material';
import CampaignOutlinedIcon from '@mui/icons-material/CampaignOutlined';
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
  const headerAction = (
    <Typography
      onClick={onViewAll}
      sx={{
        fontSize: '0.75rem',
        fontWeight: 600,
        color: '#2563EB',
        cursor: 'pointer',
        '&:hover': { textDecoration: 'underline' },
      }}
    >
      Ver todas →
    </Typography>
  );

  return (
    <DashboardCard
      title="Decisões e Destaques"
      icon={<CampaignOutlinedIcon sx={{ fontSize: 20 }} />}
      headerAction={headerAction}
    >
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
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
