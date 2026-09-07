import { Box, Typography } from '@mui/material';

interface SpeedometerGaugeProps {
  realized: number;
  total: number;
  remaining: number;
  percent: number;
  unit?: string;
}

export function SpeedometerGauge({
  realized,
  total,
  remaining,
  percent,
  unit = 'PF',
}: SpeedometerGaugeProps) {
  // SVG Dimensions
  const w = 170;
  const h = 92;
  const cx = 85;
  const cy = 76;
  const r = 56;
  const strokeWidth = 9;

  // Clamped percent between 0 and 100
  const clampedPct = Math.min(100, Math.max(0, percent));
  const arcLength = Math.PI * r; // ~175.93

  // Dashoffset for Realized Arc
  const realizedDashOffset = arcLength * (1 - clampedPct / 100);

  // Needle Math: angle in radians from PI (left, 0%) to 0 (right, 100%)
  const rad = Math.PI * (1 - clampedPct / 100);
  const needleLength = 48;
  const tipX = cx + needleLength * Math.cos(rad);
  const tipY = cy - needleLength * Math.sin(rad);

  // Perpendicular points for needle base
  const baseW = 3.5;
  const bx1 = cx + baseW * Math.cos(rad + Math.PI / 2);
  const by1 = cy - baseW * Math.sin(rad + Math.PI / 2);
  const bx2 = cx + baseW * Math.cos(rad - Math.PI / 2);
  const by2 = cy - baseW * Math.sin(rad - Math.PI / 2);
  const tailX = cx - 7 * Math.cos(rad);
  const tailY = cy + 7 * Math.sin(rad);

  const missingPct = Math.max(0, 100 - clampedPct);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', my: 0.2 }}>
      <svg
        viewBox={`0 0 ${w} ${h}`}
        width="100%"
        height={h}
        style={{ overflow: 'visible', maxWidth: 190 }}
        aria-label={`Velocímetro de Meta: ${clampedPct}% concluído, faltam ${remaining} ${unit}`}
      >
        <defs>
          {/* Gradient for Realized Arc */}
          <linearGradient id="realizedGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#3b82f6" />
            <stop offset="100%" stopColor="#1d4ed8" />
          </linearGradient>

          {/* Gradient for Missing Gap Arc */}
          <linearGradient id="missingGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#fed7aa" />
            <stop offset="100%" stopColor="#fb923c" />
          </linearGradient>
        </defs>

        {/* 1. Track Base Arc (Full 180° Semi-circle) */}
        <path
          d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`}
          fill="none"
          stroke="#f1f5f9"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
        />

        {/* 2. Missing Gap Arc (Visualiza com destaque quanto está faltando para o total) */}
        <path
          d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`}
          fill="none"
          stroke="url(#missingGradient)"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={arcLength}
          strokeDashoffset={0}
          opacity={0.35}
        />

        {/* 3. Realized Progress Arc */}
        <path
          d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`}
          fill="none"
          stroke="url(#realizedGradient)"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={arcLength}
          strokeDashoffset={realizedDashOffset}
        />

        {/* 4. Needle Pointer (Ponteiro do Velocímetro) */}
        <polygon
          points={`${bx1},${by1} ${tipX},${tipY} ${bx2},${by2} ${tailX},${tailY}`}
          fill="#0f172a"
        />

        {/* 5. Needle Center Hub */}
        <circle cx={cx} cy={cy} r={6} fill="#0f172a" />
        <circle cx={cx} cy={cy} r={2.5} fill="#ffffff" />

        {/* 6. Min and Max Markers */}
        <text
          x={cx - r}
          y={cy + 13}
          textAnchor="middle"
          fontSize="8.5"
          fontWeight="600"
          fill="#94a3b8"
          fontFamily="system-ui, sans-serif"
        >
          0
        </text>

        <text
          x={cx + r}
          y={cy + 13}
          textAnchor="middle"
          fontSize="8.5"
          fontWeight="700"
          fill="#64748b"
          fontFamily="system-ui, sans-serif"
        >
          {total}
        </text>

        {/* 7. Missing Gap Callout Tag right inside the dial */}
        <text
          x={cx}
          y={cy - 12}
          textAnchor="middle"
          fontSize="10"
            fontWeight="700"
          fill="#d97706"
          fontFamily="system-ui, sans-serif"
        >
          Falta {missingPct}%
        </text>
      </svg>

      {/* Mini Legenda de Telemetria: Realizado vs Faltando */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', px: 0.5, mt: 0.3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <Box sx={{ width: 7, height: 7, borderRadius: '50%', bgcolor: '#2563eb' }} />
          <Typography variant="caption" sx={{ fontSize: '0.625rem', color: 'text.secondary', fontWeight: 600 }}>
            Concluído: <strong>{clampedPct}%</strong>
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <Box sx={{ width: 7, height: 7, borderRadius: '50%', bgcolor: '#f97316' }} />
          <Typography variant="caption" sx={{ fontSize: '0.625rem', color: '#ea580c', fontWeight: 700 }}>
            Restante: <strong>{missingPct}%</strong>
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}
