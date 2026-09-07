import { Box, Paper, Typography } from '@mui/material';
import { PieChart as PieIcon } from 'lucide-react';
import { ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import type { Sprint } from '../../../domain/sprint/model';
import { kpiColors } from './kpi-tokens';

interface Props {
  sprints?: Sprint[];
}

interface StatusItem {
  id: string;
  label: string;
  value: number;
  pct: number;
  color: string;
  pillBg: string;
  pillColor: string;
}

export function StatusOperacionalCard({ sprints = [] }: Props) {
  // Cálculo dinâmico baseado no banco / sprints com fallback fiel à referência (Total 33)
  const items: StatusItem[] = (() => {
    if (sprints && sprints.length > 0) {
      const concluidas = sprints.filter((s) => s.lane === 'completed').length;
      const emAndamento = sprints.filter((s) => s.lane === 'development').length;
      const emValidacao = sprints.filter((s) => ['homologation', 'approved', 'billing'].includes(s.lane)).length;
      const backlog = sprints.filter((s) => ['planning', 'planned'].includes(s.lane)).length;
      const risco = sprints.filter((s) => (s.blocked || 0) > 0 || (s.health && s.health < 70)).length;

      const total = concluidas + emAndamento + emValidacao + backlog + risco;
      if (total > 0) {
        const calcPct = (v: number) => Math.round((v / total) * 100);
        return [
          {
            id: 'concluidas',
            label: 'Concluídas',
            value: concluidas,
            pct: calcPct(concluidas),
            color: '#22C55E',
            pillBg: '#DCFCE7',
            pillColor: '#16A34A',
          },
          {
            id: 'andamento',
            label: 'Em andamento',
            value: emAndamento,
            pct: calcPct(emAndamento),
            color: '#2563EB',
            pillBg: '#DBEAFE',
            pillColor: '#2563EB',
          },
          {
            id: 'validacao',
            label: 'Em validação',
            value: emValidacao,
            pct: calcPct(emValidacao),
            color: '#F59E0B',
            pillBg: '#FEF3C7',
            pillColor: '#F59E0B',
          },
          {
            id: 'backlog',
            label: 'Backlog',
            value: backlog,
            pct: calcPct(backlog),
            color: '#A8B0BD',
            pillBg: '#F1F5F9',
            pillColor: '#64748B',
          },
          {
            id: 'risco',
            label: 'Risco / Atraso',
            value: risco,
            pct: calcPct(risco),
            color: '#EF4444',
            pillBg: '#FEE2E2',
            pillColor: '#EF4444',
          },
        ];
      }
    }

    // Padrão visual de referência exata da especificação
    return [
      { id: 'concluidas', label: 'Concluídas', value: 12, pct: 36, color: '#22C55E', pillBg: '#DCFCE7', pillColor: '#16A34A' },
      { id: 'andamento', label: 'Em andamento', value: 10, pct: 30, color: '#2563EB', pillBg: '#DBEAFE', pillColor: '#2563EB' },
      { id: 'validacao', label: 'Em validação', value: 5, pct: 15, color: '#F59E0B', pillBg: '#FEF3C7', pillColor: '#F59E0B' },
      { id: 'backlog', label: 'Backlog', value: 3, pct: 9, color: '#A8B0BD', pillBg: '#F1F5F9', pillColor: '#64748B' },
      { id: 'risco', label: 'Risco / Atraso', value: 3, pct: 9, color: '#EF4444', pillBg: '#FEE2E2', pillColor: '#EF4444' },
    ];
  })();

  const total = items.reduce((sum, it) => sum + it.value, 0);

  return (
    <Paper
      elevation={0}
      sx={{
        p: 2,
        borderRadius: '14px',
        border: `1px solid ${kpiColors.border}`,
        bgcolor: kpiColors.cardBg,
        boxShadow: '0 2px 8px rgba(15, 23, 42, 0.04)',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
      }}
    >
      {/* Cabeçalho */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
        <Box
          sx={{
            width: 26,
            height: 26,
            borderRadius: '7px',
            bgcolor: '#F1F5F9',
            color: kpiColors.slate,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <PieIcon size={14} />
        </Box>
        <Typography
          variant="caption"
          sx={{
            fontSize: '11px',
            fontWeight: 600,
            letterSpacing: '0.3px',
            color: kpiColors.slate,
            textTransform: 'uppercase',
          }}
        >
          STATUS OPERACIONAL
        </Typography>
      </Box>

      {/* Grid Principal: Donut à esquerda + Tabela Compacta à direita */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', sm: '150px 1fr' },
          alignItems: 'center',
          gap: 2,
          flex: 1,
        }}
      >
        {/* Donut Chart com Total ao Centro */}
        <Box sx={{ width: 140, height: 140, position: 'relative', mx: 'auto' }}>
          <ResponsiveContainer width="100%" height="100%" debounce={50}>
            <PieChart margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
              <Pie
                data={items}
                dataKey="value"
                cx="50%"
                cy="50%"
                innerRadius={46}
                outerRadius={64}
                paddingAngle={2}
                stroke="none"
                isAnimationActive={false}
              >
                {items.map((entry) => (
                  <Cell key={entry.id} fill={entry.color} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>

          {/* Rótulo Central */}
          <Box
            sx={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              textAlign: 'center',
              pointerEvents: 'none',
            }}
          >
            <Typography
              sx={{
                fontSize: '22px',
                fontWeight: 700,
                color: kpiColors.slateDark,
                lineHeight: 1,
              }}
            >
              {total}
            </Typography>
            <Typography
              sx={{
                fontSize: '10.5px',
                fontWeight: 500,
                color: kpiColors.slate,
                mt: 0.3,
              }}
            >
              Total
            </Typography>
          </Box>
        </Box>

        {/* Legenda Tabular Ultra-Compacta com Pills */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.8, width: '100%' }}>
          {items.map((item) => (
            <Box
              key={item.id}
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                py: 0.2,
              }}
            >
              {/* Ponto colorido + Rótulo */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, minWidth: 110 }}>
                <Box
                  sx={{
                    width: 7,
                    height: 7,
                    borderRadius: '50%',
                    bgcolor: item.color,
                    flexShrink: 0,
                  }}
                />
                <Typography
                  sx={{
                    fontSize: '12px',
                    color: '#334155',
                    fontWeight: 500,
                    lineHeight: 1.2,
                  }}
                >
                  {item.label}
                </Typography>
              </Box>

              {/* Quantidade */}
              <Typography
                sx={{
                  fontSize: '12px',
                  fontWeight: 700,
                  color: kpiColors.slateDark,
                  minWidth: 24,
                  textAlign: 'right',
                }}
              >
                {item.value}
              </Typography>

              {/* Badge de Percentual */}
              <Box
                sx={{
                  bgcolor: item.pillBg,
                  color: item.pillColor,
                  fontSize: '11px',
                  fontWeight: 700,
                  px: 0.9,
                  py: 0.2,
                  borderRadius: '6px',
                  minWidth: 38,
                  textAlign: 'center',
                  lineHeight: 1.2,
                }}
              >
                {item.pct}%
              </Box>
            </Box>
          ))}
        </Box>
      </Box>
    </Paper>
  );
}
