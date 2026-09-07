import { Box, LinearProgress, Paper, Tooltip, Typography } from '@mui/material';
import {
  Activity,
  AlertTriangle,
  Building2,
  CheckCircle2,
  ClipboardCheck,
  Clock3,
  Code2,
  Flame,
  Layers3,
  Users,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export interface LeaderProjectCardData {
  name: string;
  color: string;
  sprintCount: number;
  taskCount: number;
  progress: number;
  blockedCount: number;
  reworkRate: number;
  realizedDevHours: number;
  estimatedDevHours: number;
  realizedQaHours: number;
  estimatedQaHours: number;
  developedCount: number;
  openCount: number;
  completedTasks: number;
  assigneeNames: string[];
  latest?: string;
}

interface LeaderProjectCardProps {
  project: LeaderProjectCardData;
}

interface MetricProps {
  icon: LucideIcon;
  label: string;
  value: string;
  tooltip: string;
}

function ProjectMetric({ icon: Icon, label, value, tooltip }: MetricProps) {
  return (
    <Tooltip title={tooltip} arrow>
      <Box
        tabIndex={0}
        sx={{
          minWidth: 0,
          px: 1,
          py: 0.9,
          textAlign: 'center',
          outline: 'none',
          '& + &': { borderLeft: '1px solid', borderColor: 'divider' },
          '&:focus-visible': { bgcolor: 'primary.light' },
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 0.5, color: 'text.secondary' }}>
          <Icon size={13} strokeWidth={1.8} aria-hidden="true" />
          <Typography
            sx={{
              minWidth: 0,
              color: 'text.secondary',
              fontSize: '0.625rem',
              fontWeight: 600,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {label}
          </Typography>
        </Box>
        <Typography
          sx={{
            mt: 0.35,
            color: 'text.primary',
            fontSize: '0.75rem',
            fontWeight: 700,
            fontVariantNumeric: 'tabular-nums',
            whiteSpace: 'nowrap',
          }}
        >
          {value}
        </Typography>
      </Box>
    </Tooltip>
  );
}

function formatLatest(value?: string) {
  if (!value) return 'Sem data';
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return 'Sem data';
  return new Intl.DateTimeFormat('pt-BR').format(parsed);
}

export function LeaderProjectCard({ project }: LeaderProjectCardProps) {
  const assigneeTooltip = project.assigneeNames.length
    ? project.assigneeNames.join(', ')
    : 'Nenhum membro alocado';

  return (
    <Paper
      elevation={0}
      sx={{
        minWidth: 0,
        overflow: 'hidden',
        border: '1px solid',
        borderColor: 'divider',
        borderTop: `3px solid ${project.color}`,
        borderRadius: 1.25,
        bgcolor: 'background.paper',
      }}
    >
      <Box sx={{ px: 1.5, pt: 1.25, pb: 1 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.9, minWidth: 0 }}>
            <Box
              sx={{
                width: 30,
                height: 30,
                flexShrink: 0,
                display: 'grid',
                placeItems: 'center',
                borderRadius: 1,
                bgcolor: '#f8fafc',
                color: project.color,
              }}
            >
              <Building2 size={16} strokeWidth={1.8} aria-hidden="true" />
            </Box>
            <Tooltip title={project.name} arrow>
              <Typography
                variant="h3"
                sx={{
                  minWidth: 0,
                  m: 0,
                  color: 'text.primary',
                  fontSize: '0.875rem',
                  fontWeight: 700,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {project.name}
              </Typography>
            </Tooltip>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.55, flexShrink: 0 }}>
            <Typography sx={{ color: 'text.secondary', fontSize: '0.625rem', whiteSpace: 'nowrap' }}>
              {project.sprintCount} Sprint{project.sprintCount === 1 ? '' : 's'} · {project.taskCount} tasks
            </Typography>

            {project.reworkRate > 0 && (
              <Tooltip title={`${project.reworkRate}% de retrabalho`} arrow>
                <Box
                  tabIndex={0}
                  aria-label={`${project.reworkRate}% de retrabalho`}
                  sx={{ display: 'grid', placeItems: 'center', width: 28, height: 28, color: 'warning.main' }}
                >
                  <Flame size={15} aria-hidden="true" />
                </Box>
              </Tooltip>
            )}

            {project.blockedCount > 0 && (
              <Tooltip
                title={`${project.blockedCount} bloqueio${project.blockedCount === 1 ? '' : 's'} ativo${project.blockedCount === 1 ? '' : 's'}`}
                arrow
              >
                <Box
                  tabIndex={0}
                  role="status"
                  aria-label={`${project.blockedCount} bloqueio${project.blockedCount === 1 ? '' : 's'} ativo${project.blockedCount === 1 ? '' : 's'}`}
                  sx={{
                    position: 'relative',
                    display: 'grid',
                    placeItems: 'center',
                    width: 32,
                    height: 32,
                    borderRadius: 1,
                    bgcolor: 'error.light',
                    color: 'error.main',
                    outline: 'none',
                    '&:focus-visible': { boxShadow: '0 0 0 3px rgb(220 38 38 / 18%)' },
                  }}
                >
                  <AlertTriangle size={17} strokeWidth={2} aria-hidden="true" />
                  <Box
                    component="span"
                    sx={{
                      position: 'absolute',
                      top: -5,
                      right: -5,
                      minWidth: 16,
                      height: 16,
                      px: 0.35,
                      display: 'grid',
                      placeItems: 'center',
                      border: '2px solid #fff',
                      borderRadius: 99,
                      bgcolor: 'error.main',
                      color: '#fff',
                      fontSize: '0.5625rem',
                      fontWeight: 700,
                      lineHeight: 1,
                    }}
                  >
                    {project.blockedCount}
                  </Box>
                </Box>
              </Tooltip>
            )}
          </Box>
        </Box>

        <Box sx={{ mt: 1 }}>
          <Box sx={{ mb: 0.35, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography sx={{ color: 'text.secondary', fontSize: '0.6875rem', fontWeight: 600 }}>
              Progresso
            </Typography>
            <Typography sx={{ color: 'text.primary', fontSize: '0.75rem', fontWeight: 700, fontVariantNumeric: 'tabular-nums' }}>
              {project.progress}%
            </Typography>
          </Box>
          <LinearProgress
            variant="determinate"
            value={project.progress}
            aria-label={`Progresso médio ${project.progress}%`}
            sx={{
              height: 4,
              borderRadius: 99,
              bgcolor: '#eaecf0',
              '& .MuiLinearProgress-bar': { bgcolor: project.color, borderRadius: 99 },
            }}
          />
        </Box>
      </Box>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: 'repeat(2, minmax(0, 1fr))', sm: 'repeat(4, minmax(0, 1fr))' },
          borderTop: '1px solid',
          borderBottom: '1px solid',
          borderColor: 'divider',
          bgcolor: '#f8fafc',
          '& > :nth-of-type(3)': { borderLeft: { xs: 0, sm: '1px solid' }, borderColor: 'divider' },
          '& > :nth-of-type(n+3)': { borderTop: { xs: '1px solid', sm: 0 }, borderColor: 'divider' },
        }}
      >
        <ProjectMetric
          icon={Code2}
          label="Dev"
          value={`${project.realizedDevHours}h / ${project.estimatedDevHours}h`}
          tooltip="Horas de desenvolvimento realizadas / estimadas"
        />
        <ProjectMetric
          icon={ClipboardCheck}
          label="QA"
          value={`${project.realizedQaHours}h / ${project.estimatedQaHours}h`}
          tooltip="Horas de qualidade realizadas / estimadas"
        />
        <ProjectMetric
          icon={Layers3}
          label="Desenvolvidas"
          value={String(project.developedCount)}
          tooltip="Sprints desenvolvidas e faturadas"
        />
        <ProjectMetric
          icon={Activity}
          label="Em andamento"
          value={String(project.openCount)}
          tooltip="Sprints ainda em andamento"
        />
      </Box>

      <Box
        sx={{
          minHeight: 34,
          px: 1.5,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 1,
          color: 'text.secondary',
        }}
      >
        <Tooltip title="Tasks concluídas / total" arrow>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <CheckCircle2 size={13} color="#16a34a" aria-hidden="true" />
            <Typography sx={{ fontSize: '0.625rem', fontVariantNumeric: 'tabular-nums' }}>
              {project.completedTasks}/{project.taskCount} tasks
            </Typography>
          </Box>
        </Tooltip>

        <Tooltip title={assigneeTooltip} arrow>
          <Box tabIndex={0} sx={{ display: 'flex', alignItems: 'center', gap: 0.4, outline: 'none' }}>
            <Users size={13} aria-hidden="true" />
            <Typography sx={{ fontSize: '0.625rem', fontVariantNumeric: 'tabular-nums' }}>
              {project.assigneeNames.length}
            </Typography>
          </Box>
        </Tooltip>

        <Tooltip title="Última atualização" arrow>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Clock3 size={13} aria-hidden="true" />
            <Typography sx={{ fontSize: '0.625rem', fontVariantNumeric: 'tabular-nums' }}>
              {formatLatest(project.latest)}
            </Typography>
          </Box>
        </Tooltip>
      </Box>
    </Paper>
  );
}
