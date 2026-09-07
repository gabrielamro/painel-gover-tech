import { Box, Card, CardActionArea, CardContent, Chip, Divider, Stack, Typography } from '@mui/material';
import { AlertTriangle } from 'lucide-react';
import type { Sprint } from '../../../domain/sprint/model';
import { sprintName } from '../metrics';

type Props = {
  featured: Sprint[];
  page: number;
  demo: boolean;
  onNext: () => void;
  onOpen: (code: string) => void;
  realized?: number;
  total?: number;
  percent?: number;
  period?: string;
  formatPf?: (value: number) => string;
};

export function ManagementSideRail({ featured, page, demo, onNext, onOpen }: Props) {
  const visible = featured.slice(page * 3, page * 3 + 3);
  return (
    <Box className="management-aside">
      <Card component="section" elevation={0} variant="outlined" className="management-highlights">
        <CardContent sx={{ p: 1.25, '&:last-child': { pb: 1.25 }, height: '100%', display: 'flex', flexDirection: 'column' }}>
          <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
            <Typography variant="subtitle2">Decisões e destaques</Typography>
            <Chip
              label="Mais"
              size="small"
              onClick={onNext}
              disabled={featured.length <= 3}
              variant="outlined"
              sx={{ height: 22 }}
            />
          </Stack>
          <Box sx={{ flex: 1, minHeight: 0, overflow: 'hidden' }}>
            {visible.length ? (
              visible.map((s, index) => (
                <Box key={s.code}>
                  <CardActionArea onClick={() => onOpen(s.code)} sx={{ py: 0.65 }}>
                    <Stack direction="row" spacing={0.75} sx={{ alignItems: 'center' }}>
                      <AlertTriangle size={15} color={s.needsClientDecision ? '#d97706' : '#2563eb'} />
                      <Box sx={{ minWidth: 0, flex: 1 }}>
                        <Typography variant="caption" noWrap sx={{ fontWeight: 700, display: 'block' }}>
                          {sprintName(s)} {s.module}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" noWrap sx={{ display: 'block' }}>
                          {s.featuredNote || 'Detalhe a pendência no card'}
                        </Typography>
                      </Box>
                    </Stack>
                  </CardActionArea>
                  {index < visible.length - 1 && <Divider />}
                </Box>
              ))
            ) : (
              <Typography variant="caption" color="text.secondary">
                Nenhum destaque registrado.
              </Typography>
            )}
          </Box>
        </CardContent>
      </Card>
      <Card component="section" elevation={0} variant="outlined">
        <CardContent sx={{ p: 1.25, '&:last-child': { pb: 1.25 }, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <Box>
            <Typography variant="subtitle2">Sustentação</Typography>
            <Box className="management-support">
              {[
                ['Abertos', '14'],
                ['Críticos', '2'],
                ['No SLA', '96%'],
                ['Resolvidos', '42'],
              ].map(([label, value]) => (
                <Box key={label}>
                  <Typography variant="h6">{demo ? value : '—'}</Typography>
                  <Typography variant="caption" color="text.secondary">
                    {label}
                  </Typography>
                </Box>
              ))}
            </Box>
          </Box>
          <Typography variant="caption" color="text.secondary">
            {demo ? 'Dados temporários • Resolvidos em julho' : 'Fonte de chamados e SLA ainda não integrada'}
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
}
