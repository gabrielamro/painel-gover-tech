import React from 'react';
import { Box } from '@mui/material';

export const GoverLogo: React.FC<{ height?: number }> = ({ height = 28 }) => {
  const baseUrl = import.meta.env.BASE_URL || '/';
  const logoSrc = `${baseUrl.replace(/\/$/, '')}/gover-logo.png`;

  return (
    <Box
      component="img"
      src={logoSrc}
      alt="Gover Tech"
      onError={(e) => {
        // Fallback in case of relative path difference
        (e.currentTarget as HTMLImageElement).src = './gover-logo.png';
      }}
      sx={{
        height: `${height}px`,
        width: 'auto',
        display: 'block',
        objectFit: 'contain',
        userSelect: 'none',
        flexShrink: 0,
      }}
    />
  );
};

