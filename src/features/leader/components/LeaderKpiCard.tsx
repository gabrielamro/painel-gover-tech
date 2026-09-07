import { Box, Paper, Tooltip, Typography } from '@mui/material';
import type { LucideIcon } from 'lucide-react';

interface LeaderKpiCardProps {
  icon: LucideIcon;
  label: string;
  value: string;
  helper: string;
  tooltip: string;
  color?: string;
  softColor?: string;
}

export function LeaderKpiCard({
  icon: Icon,
  label,
  value,
  helper,
  tooltip,
  color = '#2563eb',
  softColor = '#eff6ff',
}: LeaderKpiCardProps) {
  return (
    <Paper
      elevation={0}
      sx={{
        minWidth: 0,
        minHeight: 88,
        p: 1.5,
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 1.25,
        bgcolor: 'background.paper',
        display: 'flex',
        alignItems: 'center',
        gap: 1.4,
      }}
    >
      <Tooltip title={tooltip} arrow>
        <Box
          tabIndex={0}
          sx={{
            width: 38,
            height: 38,
            flexShrink: 0,
            display: 'grid',
            placeItems: 'center',
            borderRadius: 1,
            bgcolor: softColor,
            color,
            outline: 'none',
            '&:focus-visible': { boxShadow: '0 0 0 3px rgb(37 99 235 / 18%)' },
          }}
        >
          <Icon size={19} strokeWidth={1.8} aria-hidden="true" />
        </Box>
      </Tooltip>

      <Box sx={{ minWidth: 0 }}>
        <Typography
          sx={{
            color: 'text.primary',
            fontFamily: '"Space Grotesk", sans-serif',
            fontSize: '1.45rem',
            fontWeight: 700,
            fontVariantNumeric: 'tabular-nums',
            letterSpacing: '-0.035em',
            lineHeight: 1,
          }}
        >
          {value}
        </Typography>
        <Typography sx={{ mt: 0.45, color: 'text.primary', fontSize: '0.75rem', fontWeight: 600 }}>
          {label}
        </Typography>
        <Typography
          title={helper}
          sx={{
            mt: 0.2,
            color: 'text.secondary',
            fontSize: '0.6875rem',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {helper}
        </Typography>
      </Box>
    </Paper>
  );
}
