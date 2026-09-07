import { Box, Card, CardActionArea, CardContent, Typography } from '@mui/material';
import { UsersRound, CheckCircle2, CalendarClock, AlertTriangle } from 'lucide-react';
import type { Sprint } from '../../../domain/sprint/model';

type Props = {
  teams: number;
  missingTeams: number;
  delivered: Sprint[];
  forecast: Sprint[];
  riskCount: number;
  decisions: Sprint[];
  previousLabel: string;
  currentLabel: string;
  onDrill: (title: string, items: Sprint[]) => void;
  contractTotal?: number;
  contractRealized?: number;
  contractPercent?: number;
  contractPeriodStart?: string;
  contractLatestBilled?: string;
  pfFormatter?: (n: number) => string;
  periodFormatter?: (m: string) => string;
};

const items = (p: Props) => [
  { label: 'Times ativos', value: p.teams || '—', detail: p.missingTeams ? `${p.missingTeams} melhorias sem time vinculado` : 'Com melhorias em execução', icon: UsersRound, title: 'Times e melhorias ativas', rows: [] as Sprint[] },
  { label: 'Melhorias entregues', value: p.delivered.length, detail: `Aceites em ${p.previousLabel}`, icon: CheckCircle2, title: 'Melhorias aceitas no mês anterior', rows: p.delivered },
  { label: `Previstas em ${p.currentLabel}`, value: p.forecast.length, detail: `${p.forecast.length - p.riskCount} no prazo • ${p.riskCount} em risco`, icon: CalendarClock, title: 'Previsão de entregas', rows: p.forecast },
  { label: 'Decisões do cliente', value: p.decisions.length, detail: 'Pendências explicitamente registradas', icon: AlertTriangle, title: 'Decisões do cliente', rows: p.decisions },
];

export function ManagementKpiGrid(props: Props) {
  const pf = props.pfFormatter || ((n: number) => n.toLocaleString('pt-BR', { maximumFractionDigits: 2 }));
  const period = props.periodFormatter || ((m: string) =>
    new Date(`${m}-02T12:00:00`).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })
  );
  const total = props.contractTotal ?? 0;
  const realized = props.contractRealized ?? 0;
  const percent = props.contractPercent ?? (total ? Math.min(100, Math.round((realized / total) * 100)) : 0);
  const periodStart = props.contractPeriodStart || '2025-10';
  const latestBilled = props.contractLatestBilled || '2026-07';
  const saldo = Math.max(0, total - realized);

  return (
    <Box className="management-kpis">
      {items(props).map(({ label, value, detail, icon: Icon, title, rows }) => (
        <Card key={label} elevation={0} variant="outlined" className="management-kpi-card">
          <CardActionArea onClick={() => props.onDrill(title, rows)} sx={{ height: '100%' }}>
            <CardContent
              sx={{
                height: '100%',
                p: '8px 10px',
                '&:last-child': { pb: '8px' },
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                gap: 0.35,
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.85, minWidth: 0 }}>
                <Box
                  sx={{
                    width: 22,
                    height: 22,
                    borderRadius: '50%',
                    bgcolor: '#3b82f6',
                    color: '#fff',
                    display: 'grid',
                    placeItems: 'center',
                    flexShrink: 0,
                  }}
                >
                  <Icon size={12} />
                </Box>
                <Typography sx={{ fontSize: '0.72rem', lineHeight: 1.2, fontWeight: 600, color: '#102a43', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {label}
                </Typography>
              </Box>
              <Typography sx={{ fontSize: '1.45rem', fontWeight: 700, lineHeight: 1.05, color: 'primary.main', fontVariantNumeric: 'tabular-nums' }}>
                {value}
              </Typography>
              <Typography sx={{ fontSize: '.64rem', color: 'text.secondary', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {detail}
              </Typography>
            </CardContent>
          </CardActionArea>
        </Card>
      ))}

      <Card elevation={0} variant="outlined" className="management-contract-card">
        <CardContent
          sx={{
            height: '100%',
            p: '10px 14px',
            '&:last-child': { pb: '10px' },
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            gap: 0.7,
          }}
        >
          <Typography sx={{ fontSize: '0.92rem', fontWeight: 700, color: '#102a43', lineHeight: 1.2 }}>
            Contrato Consolidado
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 1, minWidth: 0 }}>
            <Typography sx={{ fontSize: '1.55rem', fontWeight: 700, lineHeight: 1.1, color: '#2563eb', fontVariantNumeric: 'tabular-nums' }}>
              {pf(realized)} PF
            </Typography>
            <Typography sx={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 500, flexShrink: 0 }}>
              {percent}% consumido
            </Typography>
          </Box>
          <Box sx={{ height: 8, bgcolor: '#e2e8f0', borderRadius: 999, overflow: 'hidden' }} aria-label={`Consumo do contrato: ${percent}%`}>
            <Box sx={{ width: `${Math.max(0, Math.min(100, percent))}%`, height: '100%', bgcolor: '#2563eb', borderRadius: 999 }} />
          </Box>
          <Box>
            <Typography sx={{ fontSize: '0.7rem', color: '#64748b', lineHeight: 1.35 }}>
              Saldo: {pf(saldo)} PF • Teto: {pf(total)} PF
            </Typography>
            <Typography sx={{ fontSize: '0.7rem', color: '#64748b', lineHeight: 1.35 }}>
              {period(periodStart)} a {period(latestBilled)}
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}
