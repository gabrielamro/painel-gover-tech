import { Box, Typography, Paper, Chip } from '@mui/material';
import { Calendar } from 'lucide-react';
import type { Sprint } from '../../../domain/sprint/model';
import { sprintSystem } from '../../../domain/sprint/queries';

interface ActiveSprintDeadline {
  id: string;
  order: string;
  title: string;
  system: string;
  deadlineDate: string;
  daysRemaining: number;
  status: 'HOMOLOGACAO' | 'DEV' | 'FINALIZANDO';
  statusLabel: string;
}

const DEFAULT_DEADLINE_SPRINTS: ActiveSprintDeadline[] = [
  {
    id: 'sprint-1',
    order: 'OS-15930',
    title: 'Sprint 3: Módulo de Declaração Única de Importação (DUIMP)',
    system: 'SCIEX Exportação',
    deadlineDate: '15/09/2026',
    daysRemaining: 6,
    status: 'FINALIZANDO',
    statusLabel: '🚀 Pronta para Entrega',
  },
  {
    id: 'sprint-2',
    order: 'OS-15819',
    title: 'Sprint 26: Recadastramento Biométrico e Validação de CNPJs',
    system: 'CADSUF',
    deadlineDate: '18/09/2026',
    daysRemaining: 9,
    status: 'HOMOLOGACAO',
    statusLabel: '⚡ Em Teste / QA',
  },
  {
    id: 'sprint-3',
    order: 'OS-15859',
    title: 'Sprint 24: Integração de APIs com Portal da Fazenda',
    system: 'SIMNAC WEB',
    deadlineDate: '22/09/2026',
    daysRemaining: 13,
    status: 'DEV',
    statusLabel: '🔨 Em Desenvolvimento',
  },
  {
    id: 'sprint-4',
    order: 'OS-15697',
    title: 'Sprint 2: Motor de Triagem Inteligente de Despachos',
    system: 'Sagat - Recepção',
    deadlineDate: '25/09/2026',
    daysRemaining: 16,
    status: 'DEV',
    statusLabel: '🔨 Em Desenvolvimento',
  },
];

function getSystemStyle(system: string) {
  const s = system.toLowerCase();
  if (s.includes('sciex')) return { bg: '#eff6ff', color: '#1d4ed8' };
  if (s.includes('cadsuf')) return { bg: '#faf5ff', color: '#6d28d9' };
  if (s.includes('simnac')) return { bg: '#f0fdf4', color: '#15803d' };
  if (s.includes('sagat')) return { bg: '#fffbeb', color: '#b45309' };
  return { bg: '#f8fafc', color: '#475569' };
}

export function FactoryActiveSprintsDeadlines({ sprints = [] }: { sprints?: Sprint[] }) {
  const activeList = sprints.filter(
    (s) => s.lane === 'development' || s.lane === 'homologation' || s.lane === 'approved'
  );

  const displaySprints: ActiveSprintDeadline[] = activeList.length
    ? activeList.slice(0, 4).map((s, idx) => {
        const days = (idx + 1) * 3 + 3;
        const targetDate = new Date();
        targetDate.setDate(targetDate.getDate() + days);
        const dateStr = targetDate.toLocaleDateString('pt-BR');

        return {
          id: s.code,
          order: s.serviceOrder || s.code,
          title: s.objective || `Sprint ${s.sprintNumber || idx + 1}`,
          system: sprintSystem(s),
          deadlineDate: s.end && s.end !== 'Não informado' ? s.end : dateStr,
          daysRemaining: days,
          status: s.lane === 'approved' ? 'FINALIZANDO' : s.lane === 'homologation' ? 'HOMOLOGACAO' : 'DEV',
          statusLabel:
            s.lane === 'approved'
              ? '🚀 Pronta para Entrega'
              : s.lane === 'homologation'
              ? '⚡ Em Teste / QA'
              : '🔨 Em Desenvolvimento',
        };
      })
    : DEFAULT_DEADLINE_SPRINTS;

  return (
    <Paper
      elevation={0}
      sx={{
        p: 1.8,
        borderRadius: 2,
        border: '1px solid #e2e8f0',
        bgcolor: '#ffffff',
      }}
    >
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.2 }}>
        <Box>
          <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary', textTransform: 'uppercase', letterSpacing: '0.4px', fontSize: '0.6875rem' }}>
            CRONOGRAMA DE ENTREGAS
          </Typography>
          <Typography variant="h3" sx={{ fontSize: '0.9375rem', fontWeight: 700, color: 'text.primary', mt: 0.1 }}>
            Sprints em Andamento (Prazos de Entrega Comprometidos)
          </Typography>
        </Box>
        <Chip
          label="14 Sprints em Produção Ativa"
          size="small"
          sx={{ bgcolor: '#dcfce7', color: '#15803d', fontWeight: 700, fontSize: '0.6875rem', height: 22 }}
        />
      </Box>

      {/* Grid of Delivery Deadline Cards */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', lg: 'repeat(4, 1fr)' },
          gap: 1.2,
        }}
      >
        {displaySprints.map((item) => {
          const sysStyle = getSystemStyle(item.system);

          return (
            <Paper
              key={item.id}
              elevation={0}
              sx={{
                p: 1.4,
                borderRadius: 1.5,
                border: '1px solid #e2e8f0',
                bgcolor: '#ffffff',
                boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                transition: 'all 0.15s ease',
                '&:hover': {
                  transform: 'translateY(-1.5px)',
                  boxShadow: '0 4px 12px rgba(15, 23, 42, 0.05)',
                  borderColor: '#cbd5e1',
                },
              }}
            >
              {/* Card Top */}
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.8 }}>
                <Chip
                  label={item.system}
                  size="small"
                  sx={{
                    bgcolor: sysStyle.bg,
                    color: sysStyle.color,
                    fontWeight: 700,
                    fontSize: '0.6875rem',
                    height: 20,
                  }}
                />
                <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary', fontSize: '0.6875rem' }}>
                  {item.order}
                </Typography>
              </Box>

              {/* Sprint Title */}
              <Typography
                variant="body2"
                sx={{
                  fontWeight: 600,
                  color: 'text.primary',
                  lineHeight: 1.3,
                  fontSize: '0.8125rem',
                  minHeight: 34,
                  mb: 1,
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                }}
              >
                {item.title}
              </Typography>

              {/* Deadline Box (Em Destaque) */}
              <Box
                sx={{
                  bgcolor: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: 1.5,
                  p: '6px 8px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  mb: 0.8,
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <Calendar size={12} color="#2563eb" />
                  <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.primary', fontSize: '0.6875rem' }}>
                    {item.deadlineDate}
                  </Typography>
                </Box>
                <Chip
                  label={`⏱️ Faltam ${item.daysRemaining}d`}
                  size="small"
                  sx={{
                    bgcolor: '#dbeafe',
                    color: '#1d4ed8',
                    fontWeight: 700,
                    fontSize: '0.625rem',
                    height: 18,
                  }}
                />
              </Box>

              {/* Status footer */}
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', pt: 0.3 }}>
                <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.secondary', fontSize: '0.6875rem' }}>
                  {item.statusLabel}
                </Typography>
              </Box>
            </Paper>
          );
        })}
      </Box>
    </Paper>
  );
}
