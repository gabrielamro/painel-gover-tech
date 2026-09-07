import { Box, Typography } from '@mui/material';
import { ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { kpiColors } from './kpi-tokens';

interface Props {
  percent: number;
  remainingPf?: number;
  totalPf?: number;
}

export function SemiGauge({ percent, remainingPf, totalPf }: Props) {
  const clampedPct = Math.min(100, Math.max(0, percent));
  const remainingPct = Math.max(0, 100 - clampedPct);

  const data = [
    { name: 'Concluído', value: clampedPct },
    { name: 'Restante', value: remainingPct },
  ];

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
      {/* Semicírculo via Recharts PieChart */}
      <Box sx={{ width: '100%', height: 75, position: 'relative' }}>
        <ResponsiveContainer width="100%" height="100%" debounce={50}>
          <PieChart margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
            <Pie
              data={data}
              startAngle={180}
              endAngle={0}
              cx="50%"
              cy="85%"
              innerRadius={44}
              outerRadius={58}
              paddingAngle={0}
              dataKey="value"
              stroke="none"
              isAnimationActive={false}
            >
              <Cell fill={kpiColors.blue} />
              <Cell fill="#E9EEF5" />
            </Pie>
          </PieChart>
        </ResponsiveContainer>

        {/* Texto Central do Semicírculo */}
        <Box
          sx={{
            position: 'absolute',
            bottom: 4,
            left: 0,
            right: 0,
            textAlign: 'center',
            pointerEvents: 'none',
          }}
        >
          <Typography
            sx={{
              fontSize: '15px',
              fontWeight: 700,
              color: kpiColors.slateDark,
              lineHeight: 1.1,
            }}
          >
            {clampedPct}%
          </Typography>
          <Typography
            sx={{
              fontSize: '9.5px',
              color: kpiColors.slate,
              fontWeight: 500,
            }}
          >
            Concluído
          </Typography>
        </Box>
      </Box>

      {/* Mini Legenda de Pontos */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1.5, mt: 0.5 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: kpiColors.blue }} />
          <Typography variant="caption" sx={{ fontSize: '10.5px', color: kpiColors.slate, fontWeight: 600 }}>
            Concluído {clampedPct}%
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: kpiColors.orange }} />
          <Typography variant="caption" sx={{ fontSize: '10.5px', color: kpiColors.slate, fontWeight: 600 }}>
            Restante {remainingPct}%
          </Typography>
        </Box>
      </Box>

      {/* Texto de Apoio Compacto (Compatível com os testes unitários) */}
      {remainingPf !== undefined && (
        <Typography
          variant="caption"
          sx={{
            fontSize: '10px',
            color: kpiColors.slate,
            textAlign: 'center',
            mt: 0.4,
          }}
        >
          Falta <strong>{remainingPf} PF</strong>
          {totalPf !== undefined ? ` de ${totalPf} PF` : ''}
        </Typography>
      )}
    </Box>
  );
}
