import { useState } from 'react';
import { Box, Typography, Paper, Chip, Tooltip, IconButton } from '@mui/material';
import { ChevronLeft, ChevronRight, Clock } from 'lucide-react';
import type { Sprint } from '../../../domain/sprint/model';
import { sprintSystem, systemColor } from '../../../domain/sprint/queries';

interface ActiveImprovement {
  id: string;
  order: string;
  title: string;
  system: string;
  sprintNumber?: number;
  points: number;
  forecastDays: number;
  status: 'IMMINENTE' | 'HOMOLOGACAO' | 'DEV' | 'APROVADO' | 'BILLING';
  statusLabel: string;
}

const DEFAULT_ACTIVE_IMPROVEMENTS: ActiveImprovement[] = [
  {
    id: 'imp-1',
    order: 'OS-15819',
    title: 'Recadastramento Biométrico e Validação Cadastral',
    system: 'CADSUF',
    points: 74.75,
    forecastDays: 4,
    status: 'IMMINENTE',
    statusLabel: 'Entrega Iminente',
  },
  {
    id: 'imp-2',
    order: 'OS-15930',
    title: 'Motor de Inteligência de Triagem e Auditoria RD',
    system: 'Sagat - Recepção',
    points: 148,
    forecastDays: 8,
    status: 'DEV',
    statusLabel: 'Em Desenvolvimento',
  },
  {
    id: 'imp-3',
    order: 'OS-15859',
    title: 'Módulo de Integração API com Portal da Receita',
    system: 'SIMNAC WEB',
    points: 36.45,
    forecastDays: 6,
    status: 'HOMOLOGACAO',
    statusLabel: 'Em Homologação',
  },
  {
    id: 'imp-4',
    order: 'OS-15860',
    title: 'Assinatura Digital e Notificações Push Mobile',
    system: 'SIMNAC APP',
    points: 75,
    forecastDays: 7,
    status: 'HOMOLOGACAO',
    statusLabel: 'Em Homologação',
  },
  {
    id: 'imp-5',
    order: 'OS-15697',
    title: 'Novo Fluxo de Despacho Aduaneiro e Cargas',
    system: 'Sagat - Recepção',
    points: 97,
    forecastDays: 3,
    status: 'IMMINENTE',
    statusLabel: 'Entrega Iminente',
  },
  {
    id: 'imp-6',
    order: 'OS-15793',
    title: 'Painel Gerencial de Análise de Risco de Importação',
    system: 'Sagat- Analise RD',
    points: 33.6,
    forecastDays: 12,
    status: 'DEV',
    statusLabel: 'Em Desenvolvimento',
  },
];

function getStatusChip(status: ActiveImprovement['status']) {
  switch (status) {
    case 'IMMINENTE':
    case 'APROVADO':
      return {
        label: 'Entrega Iminente',
        bg: '#dcfce7',
        color: '#15803d',
      };
    case 'HOMOLOGACAO':
      return {
        label: 'Em Homologação',
        bg: '#f3e8ff',
        color: '#7e22ce',
      };
    case 'BILLING':
      return {
        label: 'Aguardando faturamento',
        bg: '#fff7ed',
        color: '#c2410c',
      };
    case 'DEV':
    default:
      return {
        label: 'Em Desenvolvimento',
        bg: '#eff6ff',
        color: '#1d4ed8',
      };
  }
}

interface Props {
  sprints?: Sprint[];
  onSelectSprint?: (code: string) => void;
}

const VISIBLE_CARDS = 8;
const SLIDE_STEP = 4;

export function ExecutiveVisualPipeline({ sprints = [], onSelectSprint }: Props) {
  const [windowStart, setWindowStart] = useState(0);
  const activeSprints = sprints.filter(
    (s) => s.lane === 'development' || s.lane === 'homologation' || s.lane === 'approved' || s.lane === 'billing'
  );

  const improvements: ActiveImprovement[] = activeSprints.length
    ? activeSprints.map((s, idx) => ({
        id: s.code,
        order: s.serviceOrder || s.code,
        title: s.objective || `Sprint ${s.sprintNumber || idx + 1}`,
        system: sprintSystem(s),
        sprintNumber: s.sprintNumber || undefined,
        points: Number(s.detailedFunctionPoints || s.functionPoints || 40),
        forecastDays: (idx + 1) * 3,
        status:
          s.lane === 'billing'
            ? 'BILLING'
            : s.lane === 'approved'
              ? 'IMMINENTE'
              : s.lane === 'homologation'
                ? 'HOMOLOGACAO'
                : 'DEV',
        statusLabel:
          s.lane === 'billing'
            ? 'Aguardando faturamento'
            : s.lane === 'approved'
              ? 'Entrega Iminente'
              : s.lane === 'homologation'
                ? 'Em Homologação'
                : 'Em Desenvolvimento',
      }))
    : DEFAULT_ACTIVE_IMPROVEMENTS;

  const totalPoints = improvements.reduce((acc, item) => acc + item.points, 0);
  const maxWindowStart = Math.max(0, improvements.length - VISIBLE_CARDS);
  const visibleStart = Math.min(windowStart, maxWindowStart);
  const visibleImprovements = improvements.slice(visibleStart, visibleStart + VISIBLE_CARDS);
  const showingFrom = improvements.length ? visibleStart + 1 : 0;
  const showingTo = Math.min(visibleStart + VISIBLE_CARDS, improvements.length);

  return (
    <Paper
      elevation={0}
      sx={{
        p: 1.5,
        borderRadius: 2,
        border: '1px solid #e2e8f0',
        bgcolor: '#ffffff',
      }}
    >
      {/* Cabeçalho Compacto da Seção */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.2, flexWrap: 'wrap', gap: 1 }}>
        <Box>
          <Typography
            variant="caption"
            sx={{
              fontWeight: 700,
              color: 'text.secondary',
              textTransform: 'uppercase',
              letterSpacing: '0.4px',
              fontSize: '0.6875rem',
            }}
          >
            PIPELINE DINÂMICO DE PRODUÇÃO
          </Typography>
          <Typography variant="h3" sx={{ fontSize: '0.9375rem', fontWeight: 700, color: 'text.primary', mt: 0.1 }}>
            Melhorias e Demandas Ativas em Execução ({improvements.length} OSs em Andamento)
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Chip
            label={`${totalPoints.toFixed(1)} PF no Pipeline`}
            size="small"
            sx={{ bgcolor: '#eff6ff', color: '#1d4ed8', fontWeight: 700, fontSize: '0.6875rem', height: 22 }}
          />
          <Chip
            label="Software Factory a Todo Vapor"
            size="small"
            sx={{ bgcolor: '#dcfce7', color: '#15803d', fontWeight: 700, fontSize: '0.6875rem', height: 22 }}
          />
          {improvements.length > VISIBLE_CARDS && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.25, ml: 0.25 }}>
              <IconButton
                aria-label="Ver quatro cards anteriores"
                size="small"
                disabled={visibleStart === 0}
                onClick={() => setWindowStart((current) => Math.max(0, current - SLIDE_STEP))}
                sx={{ border: '1px solid #e2e8f0', borderRadius: 1, color: 'text.secondary' }}
              >
                <ChevronLeft size={15} />
              </IconButton>
              <Typography variant="caption" sx={{ minWidth: 54, textAlign: 'center', color: 'text.secondary', fontSize: '0.6875rem' }}>
                {showingFrom}–{showingTo} de {improvements.length}
              </Typography>
              <IconButton
                aria-label="Ver mais quatro cards"
                size="small"
                disabled={visibleStart === maxWindowStart}
                onClick={() => setWindowStart((current) => Math.min(maxWindowStart, current + SLIDE_STEP))}
                sx={{ border: '1px solid #e2e8f0', borderRadius: 1, color: 'text.secondary' }}
              >
                <ChevronRight size={15} />
              </IconButton>
            </Box>
          )}
        </Box>
      </Box>

      {/* Grid de Cards Compactos e de Alta Densidade */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', lg: 'repeat(4, 1fr)' },
          gap: 1,
        }}
      >
        {visibleImprovements.map((item) => {
          const sysColor = systemColor(item.system);
          const st = getStatusChip(item.status);

          return (
            <Paper
              key={item.id}
              elevation={0}
              onClick={() => onSelectSprint?.(item.id)}
              sx={{
                p: 1.2,
                borderRadius: 1.5,
                border: '1px solid #e2e8f0',
                bgcolor: '#ffffff',
                transition: 'all 0.15s ease',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                cursor: onSelectSprint ? 'pointer' : 'default',
                minHeight: 96,
                '&:hover': {
                  borderColor: '#cbd5e1',
                  transform: 'translateY(-1px)',
                  boxShadow: '0 2px 8px rgba(15, 23, 42, 0.04)',
                },
              }}
            >
              {/* Linha 1: Identificação (OS + Sistema + Pontos) */}
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.6 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.6, flexWrap: 'wrap', minWidth: 0 }}>
                  <Chip
                    label={item.order}
                    size="small"
                    sx={{
                      bgcolor: '#0f172a',
                      color: '#ffffff',
                      fontWeight: 700,
                      fontSize: '0.625rem',
                      height: 18,
                    }}
                  />
                  <Chip
                    label={item.system}
                    size="small"
                    sx={{
                      bgcolor: `${sysColor}15`,
                      color: sysColor,
                      fontWeight: 700,
                      fontSize: '0.625rem',
                      height: 18,
                      border: `1px solid ${sysColor}30`,
                    }}
                  />
                  {item.sprintNumber && (
                    <Chip
                      label={`Sprint ${item.sprintNumber}`}
                      size="small"
                      sx={{
                        bgcolor: '#f8fafc',
                        color: '#475569',
                        fontWeight: 600,
                        fontSize: '0.625rem',
                        height: 18,
                        border: '1px solid #e2e8f0',
                      }}
                    />
                  )}
                </Box>

                <Chip
                  label={`${item.points} PF`}
                  size="small"
                  sx={{
                    bgcolor: '#f1f5f9',
                    color: 'text.primary',
                    fontWeight: 700,
                    fontSize: '0.625rem',
                    height: 18,
                  }}
                />
              </Box>

              {/* Linha 2: Título da OS / Objetivo fixo em 1 linha com ellipsis e Tooltip */}
              <Tooltip title={item.title} arrow placement="top">
                <Typography
                  variant="body2"
                  sx={{
                    fontWeight: 600,
                    fontSize: '0.8125rem',
                    color: 'text.primary',
                    lineHeight: 1.3,
                    mb: 0.8,
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    display: 'block',
                  }}
                >
                  {item.title}
                </Typography>
              </Tooltip>

              {/* Linha 3: Telemetria (Dias restantes) + Estágio de Medição */}
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pt: 0.6, borderTop: '1px solid #f8fafc' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: 'text.secondary' }}>
                  <Clock size={11} />
                  <Typography variant="caption" sx={{ fontSize: '0.6875rem' }}>
                    {item.forecastDays} dias restantes
                  </Typography>
                </Box>

                <Chip
                  label={st.label}
                  size="small"
                  sx={{
                    bgcolor: st.bg,
                    color: st.color,
                    fontWeight: 700,
                    fontSize: '0.625rem',
                    height: 18,
                  }}
                />
              </Box>
            </Paper>
          );
        })}
      </Box>
    </Paper>
  );
}
