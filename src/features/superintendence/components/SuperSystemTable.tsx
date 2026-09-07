import { useState, useMemo, type CSSProperties } from 'react';
import {
  TableContainer,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TableSortLabel,
  Paper,
  Box,
  Typography,
  Chip,
  LinearProgress,
  Tooltip,
} from '@mui/material';
import { ChevronRight, AlertCircle } from 'lucide-react';
import type { Sprint } from '../../../domain/sprint/model';
import { LANES } from '../../../domain/sprint/model';

export interface SystemTableRow {
  system: string;
  color: string;
  totalSprints: number;
  featuredSprint: Sprint | null;
  progress: number;
  blockedCount: number;
  healthScore: number;
}

interface Props {
  rows: SystemTableRow[];
  onOpenSprint: (sprint: Sprint) => void;
}

type OrderBy = 'system' | 'progress' | 'blockedCount' | 'healthScore';
type Order = 'asc' | 'desc';

export function SuperSystemTable({ rows, onOpenSprint }: Props) {
  const [orderBy, setOrderBy] = useState<OrderBy>('progress');
  const [order, setOrder] = useState<Order>('desc');

  const handleRequestSort = (property: OrderBy) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const sortedRows = useMemo(() => {
    return [...rows].sort((a, b) => {
      let aVal = a[orderBy];
      let bVal = b[orderBy];

      if (typeof aVal === 'string') {
        return order === 'asc'
          ? (aVal as string).localeCompare(bVal as string, 'pt-BR')
          : (bVal as string).localeCompare(aVal as string, 'pt-BR');
      }

      return order === 'asc' ? (aVal as number) - (bVal as number) : (bVal as number) - (aVal as number);
    });
  }, [rows, orderBy, order]);

  return (
    <section className="super-panel super-panel--systems">
      <header className="super-panel__header">
        <div className="super-panel__title-group">
          <span className="super-panel__eyebrow">ACOMPANHAMENTO POR SISTEMA</span>
          <h2 className="super-panel__title">O que está em andamento</h2>
        </div>
        <span className="super-panel__count-badge">{rows.length} sistemas acompanhados</span>
      </header>

      <TableContainer
        component={Paper}
        elevation={0}
        sx={{
          border: '1px solid #e2e8f0',
          borderRadius: 2.5,
          overflow: 'hidden',
        }}
      >
        <Table aria-label="Acompanhamento consolidado por sistema">
          <TableHead sx={{ bgcolor: '#f8fafc' }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 700, fontSize: '0.6875rem', color: 'text.secondary', textTransform: 'uppercase', py: 1.5 }}>
                <TableSortLabel
                  active={orderBy === 'system'}
                  direction={orderBy === 'system' ? order : 'asc'}
                  onClick={() => handleRequestSort('system')}
                >
                  Sistema
                </TableSortLabel>
              </TableCell>

              <TableCell sx={{ fontWeight: 700, fontSize: '0.6875rem', color: 'text.secondary', textTransform: 'uppercase', py: 1.5, width: '35%' }}>
                Sprint em Destaque
              </TableCell>

              <TableCell sx={{ fontWeight: 700, fontSize: '0.6875rem', color: 'text.secondary', textTransform: 'uppercase', py: 1.5, width: '18%' }}>
                <TableSortLabel
                  active={orderBy === 'progress'}
                  direction={orderBy === 'progress' ? order : 'asc'}
                  onClick={() => handleRequestSort('progress')}
                >
                  Progresso Real
                </TableSortLabel>
              </TableCell>

              <TableCell align="center" sx={{ fontWeight: 700, fontSize: '0.6875rem', color: 'text.secondary', textTransform: 'uppercase', py: 1.5, width: '10%' }}>
                <TableSortLabel
                  active={orderBy === 'blockedCount'}
                  direction={orderBy === 'blockedCount' ? order : 'asc'}
                  onClick={() => handleRequestSort('blockedCount')}
                >
                  Bloqueios
                </TableSortLabel>
              </TableCell>

              <TableCell align="right" sx={{ fontWeight: 700, fontSize: '0.6875rem', color: 'text.secondary', textTransform: 'uppercase', py: 1.5, width: '14%' }}>
                <TableSortLabel
                  active={orderBy === 'healthScore'}
                  direction={orderBy === 'healthScore' ? order : 'asc'}
                  onClick={() => handleRequestSort('healthScore')}
                >
                  Saúde
                </TableSortLabel>
              </TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {sortedRows.length > 0 ? (
              sortedRows.map((row) => {
                const sprint = row.featuredSprint;
                const initials = row.system.slice(0, 2).toUpperCase();
                const laneLabel = sprint
                  ? LANES.find((l) => l.id === sprint.lane)?.label || sprint.lane
                  : '—';
                const healthTone =
                  row.healthScore >= 80
                    ? 'healthy'
                    : row.healthScore >= 60
                    ? 'warning'
                    : 'critical';
                const healthLabel =
                  row.healthScore >= 80 ? 'Saudável' : row.healthScore >= 60 ? 'Atenção' : 'Crítica';

                return (
                  <TableRow
                    key={row.system}
                    hover
                    onClick={() => sprint && onOpenSprint(sprint)}
                    sx={{
                      cursor: sprint ? 'pointer' : 'default',
                      transition: 'background-color 0.15s ease',
                      '&:last-child td, &:last-child th': { border: 0 },
                    }}
                  >
                    {/* 1. Sistema */}
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Box
                          sx={{
                            width: 32,
                            height: 32,
                            borderRadius: 1.5,
                            bgcolor: `${row.color}18`,
                            color: row.color,
                            fontFamily: '"Space Grotesk", sans-serif',
                            fontWeight: 700,
                            fontSize: '0.6875rem',
                            display: 'grid',
                            placeItems: 'center',
                            flexShrink: 0,
                          }}
                        >
                          {initials}
                        </Box>
                        <Box sx={{ minWidth: 0 }}>
                          <Typography
                            variant="body2"
                            sx={{ fontWeight: 700, color: 'text.primary', whiteSpace: 'nowrap' }}
                          >
                            {row.system}
                          </Typography>
                          <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                            {row.totalSprints} Sprint{row.totalSprints !== 1 ? 's' : ''}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>

                    {/* 2. Sprint em Destaque */}
                    <TableCell>
                      {sprint ? (
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                            <Typography
                              variant="body2"
                              sx={{ fontWeight: 700, color: 'primary.main', fontSize: '0.8125rem' }}
                            >
                              {sprint.serviceOrder || sprint.code}
                              {sprint.sprintNumber ? ` · Sprint ${sprint.sprintNumber}` : ''}
                            </Typography>
                            <Chip
                              label={laneLabel}
                              size="small"
                              sx={{ height: 20, fontSize: '0.625rem', bgcolor: '#f1f5f9', color: '#475569' }}
                            />
                          </Box>
                          <Typography
                            variant="caption"
                            sx={{
                              color: 'text.secondary',
                              display: '-webkit-box',
                              WebkitLineClamp: 1,
                              WebkitBoxOrient: 'vertical',
                              overflow: 'hidden',
                            }}
                            title={sprint.objective}
                          >
                            {sprint.objective}
                          </Typography>
                        </Box>
                      ) : (
                        <Typography variant="caption" sx={{ color: 'text.disabled' }}>
                          Nenhuma Sprint ativa
                        </Typography>
                      )}
                    </TableCell>

                    {/* 3. Progresso */}
                    <TableCell>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, minWidth: 100 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Typography
                            variant="caption"
                            sx={{ fontFamily: '"Space Grotesk", sans-serif', fontWeight: 700, color: 'text.primary' }}
                          >
                            {row.progress}%
                          </Typography>
                          {sprint && (
                            <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.625rem' }}>
                              {sprint.detailedFunctionPoints || sprint.functionPoints || 0} PF
                            </Typography>
                          )}
                        </Box>
                        <LinearProgress
                          variant="determinate"
                          value={row.progress}
                          sx={{
                            height: 6,
                            borderRadius: 3,
                            bgcolor: '#f1f5f9',
                            '& .MuiLinearProgress-bar': {
                              bgcolor: row.color,
                              borderRadius: 3,
                            },
                          }}
                        />
                      </Box>
                    </TableCell>

                    {/* 4. Bloqueios */}
                    <TableCell align="center">
                      {row.blockedCount > 0 ? (
                        <Tooltip title={`${row.blockedCount} task(s) com impedimento`} arrow>
                          <Chip
                            icon={<AlertCircle size={12} />}
                            label={row.blockedCount}
                            size="small"
                            color="error"
                            sx={{ fontWeight: 700, height: 22 }}
                          />
                        </Tooltip>
                      ) : (
                        <Typography variant="caption" sx={{ color: 'text.disabled', fontWeight: 600 }}>
                          0
                        </Typography>
                      )}
                    </TableCell>

                    {/* 5. Saúde */}
                    <TableCell align="right">
                      <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 1 }}>
                        <span
                          className={`super-health-pill ${healthTone}`}
                          title={`Índice de saúde: ${row.healthScore}/100`}
                        >
                          <span className="super-health-pill__dot" />
                          <strong>{row.healthScore}</strong>
                          <span className="super-health-pill__lbl">{healthLabel}</span>
                        </span>
                        <ChevronRight size={14} className="super-table__arrow" />
                      </Box>
                    </TableCell>
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell colSpan={5} align="center" sx={{ py: 4, color: 'text.secondary' }}>
                  Nenhum sistema corresponde aos filtros selecionados.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </section>
  );
}
