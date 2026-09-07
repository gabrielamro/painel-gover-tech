import { useMemo, useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  TextField,
  MenuItem,
  Chip,
  LinearProgress,
  IconButton,
  Tooltip,
  Tabs,
  Tab,
  TableContainer,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
} from '@mui/material';
import {
  Building2,
  AlertTriangle,
  Clock,
  Layers,
  Download,
  Users,
  Activity,
  Flame,
  UserCheck,
  Boxes,
  ChevronRight,
} from 'lucide-react';
import { useSprints } from '../../app/providers/SprintProvider';
import { sprintSystem, systemColor } from '../../domain/sprint/queries';
import { LeaderKpiCard } from './components/LeaderKpiCard';
import { LeaderProjectCard } from './components/LeaderProjectCard';

type LeaderViewTab = 'overview' | 'workload' | 'quality';

export function LeaderProjectsPage() {
  const { sprints } = useSprints();

  const [projectFilter, setProjectFilter] = useState('');
  const [managerFilter, setManagerFilter] = useState('');
  const [activeTab, setActiveTab] = useState<LeaderViewTab>('overview');

  const managers = useMemo(
    () =>
      [...new Set(sprints.map((sprint) => sprint.projectManager || sprint.manager).filter(Boolean) as string[])]
        .sort((a, b) => a.localeCompare(b, 'pt-BR')),
    [sprints]
  );

  const managerSprints = useMemo(
    () =>
      sprints.filter(
        (sprint) =>
          !managerFilter || (sprint.projectManager || sprint.manager) === managerFilter
      ),
    [managerFilter, sprints]
  );

  const projects = useMemo(
    () =>
      [...new Set(managerSprints.map(sprintSystem))].sort((a, b) =>
        a.localeCompare(b, 'pt-BR')
      ),
    [managerSprints]
  );

  const filteredSprints = useMemo(
    () =>
      managerSprints.filter(
        (sprint) => !projectFilter || sprintSystem(sprint) === projectFilter
      ),
    [managerSprints, projectFilter]
  );

  // Análise detalhada por Projeto/Sistema
  const rows = useMemo(() => {
    return projects
      .filter((name) => !projectFilter || name === projectFilter)
      .map((name) => {
        const items = filteredSprints.filter((sprint) => sprintSystem(sprint) === name);
        const open = items.filter((sprint) => sprint.lane !== 'completed');
        const developed = items.filter((sprint) => sprint.lane === 'completed');
        const blocked = items.filter((sprint) => (sprint.blocked || 0) > 0);
        const updates = items.map((sprint) => sprint.lastUpdated).filter(Boolean).sort();
        const latest = updates[updates.length - 1];
        const color = systemColor(name);

        const avgProgress =
          items.length > 0
            ? Math.round(items.reduce((acc, s) => acc + (s.progress || 0), 0) / items.length)
            : 0;

        // Horas
        const estimatedDevHours = items.reduce(
          (acc, s) =>
            acc + (s.taskItems || []).reduce((tAcc, t) => tAcc + (t.estimatedDevHours || 0), 0),
          0
        );
        const realizedDevHours = items.reduce(
          (acc, s) =>
            acc + (s.taskItems || []).reduce((tAcc, t) => tAcc + (t.realizedDevHours || 0), 0),
          0
        );
        const estimatedQaHours = items.reduce(
          (acc, s) =>
            acc + (s.taskItems || []).reduce((tAcc, t) => tAcc + (t.estimatedQaHours || 0), 0),
          0
        );
        const realizedQaHours = items.reduce(
          (acc, s) =>
            acc + (s.taskItems || []).reduce((tAcc, t) => tAcc + (t.realizedQaHours || 0), 0),
          0
        );

        const totalTasks = items.reduce((acc, s) => acc + (s.taskItems?.length || 0), 0);
        const completedTasks = items.reduce(
          (acc, s) =>
            acc + (s.taskItems || []).filter((t) => t.status === 'Concluída').length,
          0
        );
        const reworkTasks = items.reduce(
          (acc, s) =>
            acc + (s.taskItems || []).filter((t) => (t.reworkCount || 0) > 0).length,
          0
        );
        const reworkRate = totalTasks > 0 ? Math.round((reworkTasks / totalTasks) * 100) : 0;

        // Membros únicos alocados
        const assigneesMap = new Map<string, { name: string; role?: string; count: number }>();
        items.forEach((s) => {
          (s.taskItems || []).forEach((t) => {
            (t.assignees || []).forEach((a) => {
              const prev = assigneesMap.get(a.name) || { name: a.name, role: a.role, count: 0 };
              prev.count += 1;
              assigneesMap.set(a.name, prev);
            });
            if (t.owner && (!t.assignees || t.assignees.length === 0)) {
              const prev = assigneesMap.get(t.owner) || { name: t.owner, role: t.ownerRole, count: 0 };
              prev.count += 1;
              assigneesMap.set(t.owner, prev);
            }
          });
        });

        return {
          name,
          color,
          items,
          open,
          developed,
          blocked,
          latest,
          avgProgress,
          estimatedDevHours,
          realizedDevHours,
          estimatedQaHours,
          realizedQaHours,
          totalTasks,
          completedTasks,
          reworkTasks,
          reworkRate,
          assignees: Array.from(assigneesMap.values()),
        };
      });
  }, [filteredSprints, projects, projectFilter]);

  // Workload Consolidado por Membro da Equipe
  const teamWorkload = useMemo(() => {
    const map = new Map<
      string,
      {
        name: string;
        role?: string;
        systems: Set<string>;
        activeTasks: number;
        completedTasks: number;
        devHours: number;
        qaHours: number;
        reworkCount: number;
      }
    >();

    filteredSprints.forEach((s) => {
      const sys = sprintSystem(s);
      (s.taskItems || []).forEach((t) => {
        const members = t.assignees?.length
          ? t.assignees
          : t.owner
          ? [{ id: t.owner, name: t.owner, role: t.ownerRole }]
          : [];

        members.forEach((m) => {
          const curr = map.get(m.name) || {
            name: m.name,
            role: m.role || 'Membro',
            systems: new Set<string>(),
            activeTasks: 0,
            completedTasks: 0,
            devHours: 0,
            qaHours: 0,
            reworkCount: 0,
          };

          curr.systems.add(sys);
          if (t.status === 'Concluída') {
            curr.completedTasks += 1;
          } else {
            curr.activeTasks += 1;
          }

          curr.devHours += t.realizedDevHours || 0;
          curr.qaHours += t.realizedQaHours || 0;
          curr.reworkCount += t.reworkCount || 0;

          map.set(m.name, curr);
        });
      });
    });

    return Array.from(map.values()).sort((a, b) => b.activeTasks - a.activeTasks);
  }, [filteredSprints]);

  // KPIs Gerais
  const totalBlocked = rows.reduce((sum, row) => sum + row.blocked.length, 0);
  const totalOpen = rows.filter((row) => row.open.length > 0).length;
  const totalDev = rows.reduce((sum, row) => sum + row.realizedDevHours, 0);
  const totalQa = rows.reduce((sum, row) => sum + row.realizedQaHours, 0);
  const totalRework = rows.reduce((sum, row) => sum + row.reworkTasks, 0);
  const avgReworkRate =
    rows.length > 0
      ? Math.round(rows.reduce((acc, r) => acc + r.reworkRate, 0) / rows.length)
      : 0;
  const activeModuleKeys = new Set(
    filteredSprints
      .filter((sprint) => sprint.module?.trim())
      .map((sprint) => `${sprint.projectName || sprint.system || sprint.project}::${sprint.module}`)
  );
  const moduleProjectCount = new Set(
    filteredSprints
      .filter((sprint) => sprint.module?.trim())
      .map((sprint) => sprint.projectName || sprint.system || sprint.project)
  ).size;

  // Exportação de Relatório Executivo
  const handleExportReport = () => {
    const exportData = rows.map((r) => ({
      Sistema: r.name,
      SprintsTotal: r.items.length,
      SprintsAbertas: r.open.length,
      ProgressoMedio: `${r.avgProgress}%`,
      TarefasTotal: r.totalTasks,
      TarefasConcluidas: r.completedTasks,
      TaxaRetrabalho: `${r.reworkRate}%`,
      HorasDevRealizadas: r.realizedDevHours,
      HorasQaRealizadas: r.realizedQaHours,
      Impedimentos: r.blocked.length,
      Gerentes: [...new Set(r.items.map((s) => s.projectManager || s.manager).filter(Boolean))].join('; '),
      MembrosAlocados: r.assignees.map((a) => a.name).join('; '),
    }));

    const csvContent =
      'data:text/csv;charset=utf-8,\uFEFF' +
      [
        Object.keys(exportData[0] || {}).join(','),
        ...exportData.map((row) => Object.values(row).join(',')),
      ].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute(
      'download',
      `relatorio-lider-projetos-${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Box sx={{ p: { xs: 1.5, sm: 2, md: 2.5 }, background: 'var(--bg, #f7f9fc)', minHeight: 'calc(100vh - 70px)', display: 'flex', flexDirection: 'column', gap: 2 }}>
      {/* 1. KPIs preservados, com hierarquia compacta do Design System */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, minmax(0, 1fr))', md: 'repeat(3, minmax(0, 1fr))', lg: 'repeat(5, minmax(0, 1fr))' }, gap: 1.25 }}>
        <LeaderKpiCard
          icon={Building2}
          label="Projetos ativos"
          value={String(rows.length)}
          helper={`${totalOpen} em andamento`}
          tooltip="Quantidade de projetos monitorados no filtro atual"
        />
        <LeaderKpiCard
          icon={Boxes}
          label="Módulos ativos"
          value={String(activeModuleKeys.size)}
          helper={`${moduleProjectCount} projeto${moduleProjectCount === 1 ? '' : 's'}`}
          tooltip="Quantidade de módulos distintos vinculados às sprints no filtro atual"
          color="#0891b2"
          softColor="#ecfeff"
        />
        <LeaderKpiCard
          icon={Clock}
          label="Esforço total"
          value={`${totalDev + totalQa}h`}
          helper={`Dev ${totalDev}h · QA ${totalQa}h`}
          tooltip="Soma das horas apontadas em desenvolvimento e qualidade"
          color="#16a34a"
          softColor="#f0fdf4"
        />
        <LeaderKpiCard
          icon={Flame}
          label="Retrabalhos"
          value={String(totalRework)}
          helper={`${avgReworkRate}% das tasks`}
          tooltip="Tasks que retornaram para correção e taxa média de retrabalho"
          color="#d97706"
          softColor="#fffbeb"
        />
        <LeaderKpiCard
          icon={AlertTriangle}
          label="Impedimentos"
          value={String(totalBlocked)}
          helper={totalBlocked > 0 ? 'Bloqueios ativos' : 'Nenhum bloqueio ativo'}
          tooltip="Sprints com bloqueios ativos"
          color={totalBlocked > 0 ? '#dc2626' : '#64748b'}
          softColor={totalBlocked > 0 ? '#fef2f2' : '#f8fafc'}
        />
      </Box>

      {/* 2. Barra Unificada: Abas + Controles Operacionais */}
      <Paper
        elevation={0}
        sx={{
          p: '6px 14px',
          borderRadius: 2,
          border: '1px solid #e2e8f0',
          bgcolor: '#ffffff',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 1.5,
        }}
      >
        <Tabs
          value={activeTab}
          onChange={(_, val) => setActiveTab(val as LeaderViewTab)}
          aria-label="Abas de Acompanhamento"
          sx={{
            minHeight: 40,
            '& .MuiTabs-indicator': { height: 3, borderRadius: 1.5 },
          }}
        >
          <Tab
            label="Visão por Sistema"
            value="overview"
            icon={<Layers size={14} />}
            iconPosition="start"
            sx={{ textTransform: 'none', fontWeight: 600, minHeight: 40, py: 0.5, fontSize: '0.8125rem' }}
          />
          <Tab
            label={`Alocação da Equipe (${teamWorkload.length})`}
            value="workload"
            icon={<Users size={14} />}
            iconPosition="start"
            sx={{ textTransform: 'none', fontWeight: 600, minHeight: 40, py: 0.5, fontSize: '0.8125rem' }}
          />
          <Tab
            label="Qualidade & Retrabalho"
            value="quality"
            icon={<Activity size={14} />}
            iconPosition="start"
            sx={{ textTransform: 'none', fontWeight: 600, minHeight: 40, py: 0.5, fontSize: '0.8125rem' }}
          />
        </Tabs>

        {/* Filtros e Exportação Alinhados */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
          <TextField
            select
            size="small"
            label="Gerente"
            value={managerFilter}
            onChange={(event) => {
              setManagerFilter(event.target.value);
              setProjectFilter('');
            }}
            sx={{
              minWidth: 160,
              bgcolor: '#f8fafc',
              '& .MuiInputBase-root': { height: 34, fontSize: '0.75rem', borderRadius: 1.5 },
            }}
          >
            <MenuItem value="" sx={{ fontSize: '0.8125rem' }}>Gerentes</MenuItem>
            {managers.map((manager) => (
              <MenuItem key={manager} value={manager} sx={{ fontSize: '0.8125rem' }}>
                {manager}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            select
            size="small"
            label="Filtrar Projeto"
            value={projectFilter}
            onChange={(e) => setProjectFilter(e.target.value)}
            sx={{
              minWidth: 175,
              bgcolor: '#f8fafc',
              '& .MuiInputBase-root': { height: 34, fontSize: '0.75rem', borderRadius: 1.5 },
            }}
          >
            <MenuItem value="" sx={{ fontSize: '0.8125rem' }}>Projetos</MenuItem>
            {projects.map((name) => (
              <MenuItem key={name} value={name} sx={{ fontSize: '0.8125rem' }}>
                {name}
              </MenuItem>
            ))}
          </TextField>

          <Tooltip title="Exportar relatório em CSV" arrow>
            <IconButton
              size="small"
              aria-label="Exportar relatório em CSV"
              onClick={handleExportReport}
              sx={{
                width: 34,
                height: 34,
                bgcolor: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: 1.5,
                color: 'text.primary',
                '&:hover': { bgcolor: '#f8fafc', borderColor: '#cbd5e1' },
                '&:focus-visible': { boxShadow: '0 0 0 3px rgb(37 99 235 / 16%)' },
              }}
            >
              <Download size={15} aria-hidden="true" />
            </IconButton>
          </Tooltip>
        </Box>
      </Paper>

      {/* 3. Conteúdo Principal das Abas */}

      {/* TAB 1: Visão por Sistema */}
      {activeTab === 'overview' && (
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: 'minmax(0, 1fr)',
              md: 'repeat(2, minmax(0, 1fr))',
              lg: 'repeat(3, minmax(0, 1fr))',
            },
            gap: 1.25,
          }}
        >
          {rows.length > 0 ? (
            rows.map((row) => (
              <LeaderProjectCard
                key={row.name}
                project={{
                  name: row.name,
                  color: row.color,
                  sprintCount: row.items.length,
                  taskCount: row.totalTasks,
                  progress: row.avgProgress,
                  blockedCount: row.blocked.length,
                  reworkRate: row.reworkRate,
                  realizedDevHours: row.realizedDevHours,
                  estimatedDevHours: row.estimatedDevHours,
                  realizedQaHours: row.realizedQaHours,
                  estimatedQaHours: row.estimatedQaHours,
                  developedCount: row.developed.length,
                  openCount: row.open.length,
                  completedTasks: row.completedTasks,
                  assigneeNames: row.assignees.map((member) => member.name),
                  latest: row.latest,
                }}
              />
            ))
          ) : (
            <Paper
              elevation={0}
              sx={{ gridColumn: '1 / -1', p: 3, border: '1px solid', borderColor: 'divider', borderRadius: 1.25 }}
            >
              <Typography variant="body2" sx={{ color: 'text.secondary', textAlign: 'center' }}>
                Nenhum projeto encontrado para o filtro selecionado.
              </Typography>
            </Paper>
          )}
        </Box>
      )}

      {/* TAB 2: Alocação & Workload da Equipe (Tabela Compacta e Sem Poluição) */}
      {activeTab === 'workload' && (
        <TableContainer component={Paper} sx={{ borderRadius: 2, border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }} elevation={0}>
          <Table size="small">
            <TableHead sx={{ bgcolor: '#f8fafc' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 700, py: 1.2, fontSize: '0.75rem' }}>Profissional</TableCell>
                <TableCell sx={{ fontWeight: 700, py: 1.2, fontSize: '0.75rem' }}>Função</TableCell>
                <TableCell sx={{ fontWeight: 700, py: 1.2, fontSize: '0.75rem' }}>Sistemas Alocados</TableCell>
                <TableCell sx={{ fontWeight: 700, py: 1.2, fontSize: '0.75rem' }} align="center">Tasks Ativas</TableCell>
                <TableCell sx={{ fontWeight: 700, py: 1.2, fontSize: '0.75rem' }} align="center">Concluídas</TableCell>
                <TableCell sx={{ fontWeight: 700, py: 1.2, fontSize: '0.75rem' }} align="center">Horas Dev</TableCell>
                <TableCell sx={{ fontWeight: 700, py: 1.2, fontSize: '0.75rem' }} align="center">Horas QA</TableCell>
                <TableCell sx={{ fontWeight: 700, py: 1.2, fontSize: '0.75rem' }} align="center">Retrabalhos</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {teamWorkload.map((member) => (
                <TableRow key={member.name} hover>
                  <TableCell sx={{ py: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <UserCheck size={14} color="#2563eb" />
                      <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '0.8125rem' }}>
                        {member.name}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell sx={{ py: 1 }}>
                    <Chip
                      label={member.role}
                      size="small"
                      sx={{
                        bgcolor: member.role?.includes('QA') ? '#fdf2f8' : '#eff6ff',
                        color: member.role?.includes('QA') ? '#be185d' : '#1d4ed8',
                        fontWeight: 600,
                        fontSize: '0.625rem',
                        height: 20,
                      }}
                    />
                  </TableCell>
                  <TableCell sx={{ py: 1 }}>
                    <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                      {Array.from(member.systems).map((sys) => (
                        <Chip key={sys} label={sys} size="small" variant="outlined" sx={{ height: 18, fontSize: '0.625rem' }} />
                      ))}
                    </Box>
                  </TableCell>
                  <TableCell align="center" sx={{ py: 1 }}>
                    <Chip
                      label={member.activeTasks}
                      size="small"
                      color={member.activeTasks > 5 ? 'warning' : 'default'}
                      sx={{ fontWeight: 700, height: 20, fontSize: '0.6875rem' }}
                    />
                  </TableCell>
                  <TableCell align="center" sx={{ py: 1 }}>
                    <Typography variant="body2" sx={{ fontWeight: 600, color: 'success.main', fontSize: '0.8125rem' }}>
                      {member.completedTasks}
                    </Typography>
                  </TableCell>
                  <TableCell align="center" sx={{ py: 1 }}>
                    <Typography variant="body2" sx={{ fontWeight: 600, color: 'primary.main', fontSize: '0.8125rem' }}>
                      {member.devHours}h
                    </Typography>
                  </TableCell>
                  <TableCell align="center" sx={{ py: 1 }}>
                    <Typography variant="body2" sx={{ fontWeight: 600, color: 'secondary.main', fontSize: '0.8125rem' }}>
                      {member.qaHours}h
                    </Typography>
                  </TableCell>
                  <TableCell align="center" sx={{ py: 1 }}>
                    {member.reworkCount > 0 ? (
                      <Chip
                        label={`${member.reworkCount}x`}
                        size="small"
                        color="error"
                        sx={{ height: 18, fontSize: '0.625rem', fontWeight: 700 }}
                      />
                    ) : (
                      <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.75rem' }}>
                        0
                      </Typography>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* TAB 3: Qualidade & Retrabalho (Visão Estruturada de Riscos) */}
      {activeTab === 'quality' && (
        <TableContainer component={Paper} sx={{ borderRadius: 2, border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }} elevation={0}>
          <Table size="small">
            <TableHead sx={{ bgcolor: '#f8fafc' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 700, py: 1.2, fontSize: '0.75rem' }}>Sistema / Projeto</TableCell>
                <TableCell sx={{ fontWeight: 700, py: 1.2, fontSize: '0.75rem' }} align="center">Total de Tarefas</TableCell>
                <TableCell sx={{ fontWeight: 700, py: 1.2, fontSize: '0.75rem' }} align="center">Tarefas Reprovadas</TableCell>
                <TableCell sx={{ fontWeight: 700, py: 1.2, fontSize: '0.75rem' }} align="center">Taxa de Retrabalho (%)</TableCell>
                <TableCell sx={{ fontWeight: 700, py: 1.2, fontSize: '0.75rem' }} align="center">Classificação de Qualidade</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {rows
                .slice()
                .sort((a, b) => b.reworkRate - a.reworkRate)
                .map((row) => (
                  <TableRow key={row.name} hover>
                    <TableCell sx={{ py: 1 }}>
                      <Typography variant="body2" sx={{ fontWeight: 700, fontSize: '0.8125rem' }}>
                        {row.name}
                      </Typography>
                    </TableCell>
                    <TableCell align="center" sx={{ py: 1, fontSize: '0.8125rem' }}>{row.totalTasks}</TableCell>
                    <TableCell align="center" sx={{ py: 1 }}>
                      <Typography
                        variant="body2"
                        sx={{
                          fontWeight: 700,
                          fontSize: '0.8125rem',
                          color: row.reworkTasks > 0 ? 'error.main' : 'text.primary',
                        }}
                      >
                        {row.reworkTasks}
                      </Typography>
                    </TableCell>
                    <TableCell align="center" sx={{ py: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                        <Typography variant="body2" sx={{ fontWeight: 700, fontSize: '0.8125rem' }}>
                          {row.reworkRate}%
                        </Typography>
                        <LinearProgress
                          variant="determinate"
                          value={Math.min(100, row.reworkRate * 2.5)}
                          sx={{
                            width: 50,
                            height: 4,
                            borderRadius: 2,
                            bgcolor: '#f1f5f9',
                            '& .MuiLinearProgress-bar': {
                              bgcolor: row.reworkRate > 25 ? '#dc2626' : row.reworkRate > 15 ? '#d97706' : '#16a34a',
                            },
                          }}
                        />
                      </Box>
                    </TableCell>
                    <TableCell align="center" sx={{ py: 1 }}>
                      {row.reworkRate === 0 ? (
                        <Chip label="Excelente (Zero Erros)" color="success" size="small" sx={{ fontWeight: 700, height: 20, fontSize: '0.625rem' }} />
                      ) : row.reworkRate <= 20 ? (
                        <Chip label="Estável" color="primary" size="small" sx={{ fontWeight: 600, height: 20, fontSize: '0.625rem' }} />
                      ) : (
                        <Chip label="Atenção em QA" color="error" size="small" sx={{ fontWeight: 700, height: 20, fontSize: '0.625rem' }} />
                      )}
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

    </Box>
  );
}
