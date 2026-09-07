import { Box, type SxProps, type Theme } from '@mui/material';
import type { ReactNode } from 'react';

interface Props {
  children: ReactNode;
  bg?: string;
  color?: string;
  sx?: SxProps<Theme>;
}

export function KpiBadge({ children, bg = '#EFF6FF', color = '#2563EB', sx }: Props) {
  return (
    <Box
      component="span"
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        px: 1,
        py: 0.2,
        borderRadius: '6px',
        bgcolor: bg,
        color: color,
        fontSize: '11px',
        fontWeight: 700,
        lineHeight: 1.3,
        letterSpacing: '0.2px',
        whiteSpace: 'nowrap',
        ...sx,
      }}
    >
      {children}
    </Box>
  );
}
