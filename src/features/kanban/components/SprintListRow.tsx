import { ChevronDown, ChevronUp } from 'lucide-react';
import { Button, Tooltip, IconButton, Chip } from '@mui/material';
import type { Sprint } from '../../../domain/sprint/model';
import { LANES } from '../../../domain/sprint/model';
import { sprintSystem, systemColor } from '../../../domain/sprint/queries';
import { formatPF } from '../../../domain/billing/format';

interface SprintListRowProps {
  sprint: Sprint;
  index: number;
  isExpanded: boolean;
  onToggleExpand: (code: string) => void;
  onOpenCard: (sprint: Sprint) => void;
}

const displayDate = (value?: string) => {
  if (!value) return '—';
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime())
    ? '—'
    : new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(parsed);
};

export function SprintListRow({
  sprint,
  index,
  isExpanded,
  onToggleExpand,
  onOpenCard,
}: SprintListRowProps) {
  const systemName = sprintSystem(sprint);
  const color = systemColor(systemName);
  const totalTasks = (sprint.taskItems || []).length || Number(sprint.tasks || 0);
  const blockedTasks = (sprint.taskItems || []).length
    ? (sprint.taskItems || []).filter((t) => t.isBlocked || t.status === 'Bloqueada').length
    : Number(sprint.blocked || 0);
  const progressPercent = Math.max(0, Math.min(100, Math.round(sprint.progress || 0)));
  const displayedPf = Number(sprint.detailedFunctionPoints || sprint.functionPoints || 0);
  const laneLabel = LANES.find((l) => l.id === sprint.lane)?.label || sprint.lane;
  const owner = sprint.po && !/^n[aã]o\b/i.test(sprint.po.trim()) ? sprint.po : 'Não informado';

  const panelId = `sprint-expanded-${sprint.code}`;

  return (
    <tr
      tabIndex={0}
      role="row"
      aria-expanded={isExpanded}
      aria-controls={panelId}
      onClick={() => onToggleExpand(sprint.code)}
      onKeyDown={(e) => {
        if (e.target === e.currentTarget && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault();
          onToggleExpand(sprint.code);
        }
      }}
      className={`sprint-list-row ${isExpanded ? 'sprint-list-row--expanded' : ''}`}
      style={{
        backgroundColor: isExpanded ? '#eff6ff' : undefined,
        cursor: 'pointer',
      }}
    >
      {/* 1. Número sequencial */}
      <td className="sprint-col-seq text-center text-slate-500 font-medium">
        {index + 1}
      </td>

      {/* 2. Sistema / Sprint */}
      <td className="sprint-col-system">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', alignItems: 'flex-start' }}>
          <span
            className="sprint-system-tag"
            style={{
              backgroundColor: `${color}15`,
              color,
              borderColor: `${color}40`,
              fontWeight: 700,
              fontSize: '0.6875rem',
              padding: '2px 8px',
              borderRadius: '999px',
              border: '1px solid',
              maxWidth: '100%',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {systemName}
          </span>
          <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>
            Sprint {sprint.sprintNumber || '—'}
          </span>
        </div>
      </td>

      {/* 3. OS */}
      <td className="sprint-col-os" style={{ fontFamily: 'monospace', fontSize: '0.75rem', color: '#334155' }}>
        {sprint.serviceOrder || sprint.code}
      </td>

      {/* 4. Objetivo */}
      <td className="sprint-col-objective">
        <Tooltip title={sprint.objective || ''} arrow placement="top">
          <div
            style={{
              fontSize: '0.8125rem',
              fontWeight: 600,
              color: '#0f172a',
              maxWidth: '280px',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {sprint.objective || 'Sem objetivo informado'}
          </div>
        </Tooltip>
      </td>

      {/* 5. PO */}
      <td className="sprint-col-po" style={{ fontSize: '0.75rem', color: '#475569' }}>
        <span title={owner}>{owner}</span>
      </td>

      {/* 6. Prazo */}
      <td className="sprint-col-deadline" style={{ fontSize: '0.75rem', color: '#64748b', whiteSpace: 'nowrap' }}>
        {displayDate(sprint.end)}
      </td>

      {/* 7. Progresso */}
      <td className="sprint-col-progress">
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <div
            style={{
              flex: 1,
              height: '6px',
              backgroundColor: '#e2e8f0',
              borderRadius: '3px',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                width: `${progressPercent}%`,
                height: '100%',
                backgroundColor: progressPercent === 100 ? '#16a34a' : '#2563eb',
                borderRadius: '3px',
              }}
            />
          </div>
          <span style={{ fontSize: '0.6875rem', fontWeight: 700, color: '#334155', minWidth: '32px' }}>
            {progressPercent}%
          </span>
        </div>
      </td>

      {/* 8. Tasks */}
      <td className="sprint-col-tasks text-center" style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#334155' }}>
        {totalTasks}
      </td>

      {/* 9. Bloqueios */}
      <td className="sprint-col-blocked text-center">
        {blockedTasks > 0 ? (
          <Chip
            label={blockedTasks}
            size="small"
            color="error"
            sx={{ height: 18, fontSize: '0.625rem', fontWeight: 700 }}
          />
        ) : (
          <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>0</span>
        )}
      </td>

      {/* 10. PF */}
      <td className="sprint-col-pf text-center" style={{ whiteSpace: 'nowrap' }}>
        <span
          style={{
            fontSize: '0.75rem',
            fontWeight: 700,
            color: '#6938ef',
            backgroundColor: '#f4f3ff',
            padding: '2px 6px',
            borderRadius: '4px',
          }}
        >
          {formatPF(displayedPf)} PF
        </span>
      </td>

      {/* 11. Situação */}
      <td className="sprint-col-lane">
        <span
          style={{
            fontSize: '0.6875rem',
            fontWeight: 600,
            color: '#334155',
            backgroundColor: '#f1f5f9',
            padding: '3px 8px',
            borderRadius: '999px',
            display: 'inline-block',
            whiteSpace: 'nowrap',
          }}
        >
          {laneLabel}
        </span>
      </td>

      {/* 12. Ações */}
      <td className="sprint-col-actions text-right" style={{ whiteSpace: 'nowrap' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
          <Button
            variant="outlined"
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              onOpenCard(sprint);
            }}
            sx={{
              height: 28,
              fontSize: '0.6875rem',
              fontWeight: 600,
              textTransform: 'none',
              px: 1.2,
              borderRadius: '6px',
              borderColor: '#cbd5e1',
              color: '#334155',
              '&:hover': {
                borderColor: '#94a3b8',
                backgroundColor: '#f8fafc',
              },
            }}
          >
            Abrir Card
          </Button>

          <IconButton
            size="small"
            aria-label={isExpanded ? 'Recolher tarefas da Sprint' : 'Expandir tarefas da Sprint'}
            onClick={(e) => {
              e.stopPropagation();
              onToggleExpand(sprint.code);
            }}
            sx={{
              p: 0.5,
              color: isExpanded ? '#2563eb' : '#64748b',
              transform: isExpanded ? 'rotate(0deg)' : 'rotate(0deg)',
              transition: 'transform 0.15s ease',
            }}
          >
            {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </IconButton>
        </div>
      </td>
    </tr>
  );
}
