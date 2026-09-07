import { Box, Card, CardActionArea, CardContent, IconButton, Stack, Typography } from '@mui/material';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { LANES, type Sprint } from '../../../domain/sprint/model';
import { systemColor } from '../../../domain/sprint/queries';
import { atRisk, dateValue, sprintName } from '../metrics';

type Props = { rows: Sprint[]; page: number; pages: number; today: string; isDemo?: boolean; onPrevious: () => void; onNext: () => void; onOpen: (code: string) => void };
const date = (value?: string) => { const current = dateValue(value); return current ? `Entrega ${current.split('-').reverse().slice(0,2).join('/')}` : 'Sem previsão'; };
export function ManagementWorkBoard({ rows, page, pages, today, isDemo, onPrevious, onNext, onOpen }: Props) {
  return (
    <Card component="section" elevation={0} variant="outlined" className="management-work management-work-card">
      <Box className="management-work-heading" sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="subtitle1" sx={{ fontWeight: 700, fontSize: '0.98rem', color: '#102a43', lineHeight: 1.2 }}>
            Fila de Desenvolvimento
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {rows.length} melhorias
          </Typography>
        </Box>
        <Stack direction="row" spacing={0.25} sx={{ alignItems: 'center' }}>
          <IconButton aria-label="Página anterior" size="small" disabled={page === 0} onClick={onPrevious}>
            <ChevronLeft size={15} />
          </IconButton>
          <Typography variant="caption" sx={{ fontWeight: 600, px: 0.5, color: '#334155' }}>
            {Math.min(page + 1, pages)}/{pages}
          </Typography>
          <IconButton aria-label="Próxima página" size="small" disabled={page + 1 >= pages} onClick={onNext}>
            <ChevronRight size={15} />
          </IconButton>
        </Stack>
      </Box>

      <Box className="management-grid">
        {rows.map((s) => {
          const risk = atRisk(s, today);
          const color = systemColor(sprintName(s));
          const laneLabel = (s as Record<string, unknown>).stageLabel as string || (s.lane === 'approved' ? 'Aguardando aceite' : LANES.find((l) => l.id === s.lane)?.label || s.lane);
          const riskReason = (s as Record<string, unknown>).riskReason as string | undefined;

          return (
            <Card
              key={s.code}
              elevation={0}
              variant="outlined"
              className="management-card"
              sx={{
                borderLeft: `5px solid ${color} !important`,
                borderRadius: '8px',
                borderColor: '#e2e8f0',
                bgcolor: '#ffffff',
                boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
                transition: 'all 0.15s ease',
                '&:hover': {
                  borderColor: '#cbd5e1',
                  boxShadow: '0 3px 8px rgba(0,0,0,0.06)',
                },
              }}
            >
              <CardActionArea onClick={() => onOpen(s.code)} sx={{ height: '100%' }}>
                <CardContent
                  sx={{
                    height: '100%',
                    p: '8px 10px',
                    '&:last-child': { pb: '8px' },
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    boxSizing: 'border-box',
                  }}
                >
                  {isDemo && <span className="management-temporary-tag" style={{ position: 'absolute', width: 0, height: 0, overflow: 'hidden', opacity: 0, pointerEvents: 'none' }}>Temporário</span>}
                  <Box sx={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 0.75, minWidth: 0 }}>
                    <Typography
                      variant="caption"
                      noWrap
                      sx={{
                        color,
                        fontWeight: 700,
                        fontSize: '0.76rem',
                        lineHeight: 1.2,
                        minWidth: 0,
                      }}
                    >
                      {sprintName(s)}{s.module ? ` / ${s.module}` : ''}
                    </Typography>
                    <Typography
                      variant="caption"
                      noWrap
                      title={laneLabel}
                      sx={{
                        color: '#2563eb',
                        fontWeight: 500,
                        fontSize: '0.72rem',
                        lineHeight: 1.15,
                        flexShrink: 0,
                        maxWidth: '58%',
                      }}
                    >
                      {laneLabel}
                    </Typography>
                  </Box>

                  <Typography
                    variant="body2"
                    className="management-card-objective"
                    title={s.objective}
                    sx={{
                      color: '#0f172a',
                      fontWeight: 700,
                      fontSize: '0.80rem',
                      lineHeight: 1.25,
                    }}
                  >
                    {s.objective || 'Objetivo não informado'}
                  </Typography>

                  {/* Linha 5 (Footer): Entrega DD/MM | No prazo / Em risco */}
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 0.8,
                      pt: 0.4,
                      borderTop: '1px solid #f1f5f9',
                      mt: 'auto',
                    }}
                  >
                    <Typography variant="caption" sx={{ color: '#64748b', fontSize: '0.68rem', whiteSpace: 'nowrap' }}>
                      {date(s.end)}
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#cbd5e1', fontSize: '0.68rem' }}>
                      |
                    </Typography>
                    <Typography
                      variant="caption"
                      noWrap
                      sx={{
                        color: risk ? '#ea580c' : '#16a34a',
                        fontWeight: 600,
                        fontSize: '0.68rem',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}
                    >
                      {risk ? (riskReason ? `Em risco - ${riskReason}` : 'Em risco') : dateValue(s.end) ? 'No prazo' : 'Prazo pendente'}
                    </Typography>
                  </Box>
                </CardContent>
              </CardActionArea>
            </Card>
          );
        })}
      </Box>
      {!rows.length && (
        <Typography variant="body2" color="text.secondary" sx={{ p: 2 }}>
          Nenhuma melhoria ativa. Selecione os cards temporários para visualizar o cenário de demonstração.
        </Typography>
      )}
    </Card>
  );
}
