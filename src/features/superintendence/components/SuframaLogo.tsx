import React from 'react';
import { Box, Typography } from '@mui/material';

export const SuframaLogo: React.FC = () => {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
      {/* Suframa Geometric Triangle Icon */}
      <svg
        width="34"
        height="34"
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M24 4L4 38H44L24 4Z"
          stroke="#006837"
          strokeWidth="3"
          strokeLinejoin="round"
        />
        <path
          d="M24 14L13 33H35L24 14Z"
          stroke="#00843D"
          strokeWidth="2.5"
          strokeLinejoin="round"
        />
        <path
          d="M24 22L19 30H29L24 22Z"
          fill="#006837"
        />
        <line x1="24" y1="4" x2="24" y2="14" stroke="#00843D" strokeWidth="2" />
        <line x1="4" y1="38" x2="13" y2="33" stroke="#00843D" strokeWidth="2" />
        <line x1="44" y1="38" x2="35" y2="33" stroke="#00843D" strokeWidth="2" />
      </svg>

      {/* Brand Text */}
      <Typography
        sx={{
          fontFamily: '"Space Grotesk", -apple-system, BlinkMacSystemFont, sans-serif',
          fontWeight: 700,
          fontSize: '1.25rem',
          color: '#006837',
          letterSpacing: '0.04em',
          lineHeight: 1,
        }}
      >
        SUFRAMA
      </Typography>
    </Box>
  );
};
