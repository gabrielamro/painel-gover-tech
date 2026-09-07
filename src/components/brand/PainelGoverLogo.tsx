import { Box, Typography } from '@mui/material';

interface Props {
  variant?: 'light' | 'dark';
  size?: 'small' | 'medium' | 'large';
  collapsed?: boolean;
}

export function PainelGoverLogo({ variant = 'light', size = 'medium', collapsed = false }: Props) {
  const isDark = variant === 'dark';

  // Cores institucionais
  const painelGreen = isDark ? '#10b981' : '#00843D'; // Verde SUFRAMA institucional
  const cyanArrow = isDark ? '#38bdf8' : '#0284c7';   // Cyan/Blue chevron da Gover
  const goverColor = isDark ? '#ffffff' : '#0f172a';  // Black/Dark slate no claro, branco no escuro

  const fontSize = size === 'small' ? '1rem' : size === 'large' ? '1.5rem' : '1.1875rem';
  const markSize = size === 'small' ? 24 : size === 'large' ? 36 : 28;

  if (collapsed) {
    return (
      <Box
        sx={{
          width: markSize,
          height: markSize,
          borderRadius: 1.5,
          bgcolor: isDark ? '#00843D' : '#00843D',
          color: '#ffffff',
          display: 'grid',
          placeItems: 'center',
          fontWeight: 800,
          fontSize: '0.875rem',
          boxShadow: '0 2px 6px rgba(0, 132, 61, 0.25)',
          userSelect: 'none',
        }}
      >
        G
      </Box>
    );
  }

  return (
    <Box
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '2px',
        userSelect: 'none',
        lineHeight: 1,
      }}
    >
      {/* Palavra Painel em Verde SUFRAMA */}
      <Typography
        component="span"
        sx={{
          fontWeight: 800,
          fontSize,
          color: painelGreen,
          fontFamily: "'Space Grotesk', 'DM Sans', -apple-system, sans-serif",
          letterSpacing: '-0.3px',
        }}
      >
        Painel
      </Typography>

      {/* Ícone Chevron / Seta Gover em Cyan */}
      <Box
        component="svg"
        viewBox="0 0 16 16"
        sx={{
          width: size === 'small' ? 12 : size === 'large' ? 18 : 14,
          height: size === 'small' ? 12 : size === 'large' ? 18 : 14,
          mx: '1px',
          flexShrink: 0,
        }}
        fill="none"
      >
        <path
          d="M3 2.5 L12.5 8 L3 13.5 C5.5 10 5.5 6 3 2.5 Z"
          fill={cyanArrow}
        />
      </Box>

      {/* Palavra gover em negrito */}
      <Typography
        component="span"
        sx={{
          fontWeight: 800,
          fontSize,
          color: goverColor,
          fontFamily: "'Space Grotesk', 'DM Sans', -apple-system, sans-serif",
          letterSpacing: '-0.4px',
        }}
      >
        gover
      </Typography>
    </Box>
  );
}
