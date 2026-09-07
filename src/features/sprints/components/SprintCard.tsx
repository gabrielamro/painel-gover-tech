import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  Check,
  ClipboardList,
  Flag,
  MoreVertical,
  Pencil,
  Star,
  Tag,
  Timer,
  TriangleAlert,
} from 'lucide-react';
import { useState, type CSSProperties, type HTMLAttributes, type MouseEvent } from 'react';
import { Menu, MenuItem, Tooltip } from '@mui/material';
import type { Lane, Sprint } from '../../../domain/sprint/model';
import { LANES } from '../../../domain/sprint/model';
import { sprintSystem, systemColor } from '../../../domain/sprint/queries';
import { formatPF } from '../../../domain/billing/format';

interface SprintCardProps {
  sprint: Sprint;
  onOpen: (sprint: Sprint) => void;
  onEdit?: (sprint: Sprint) => void;
  onToggleFeatured?: (sprint: Sprint) => void;
  onMove?: (sprint: Sprint, lane: Lane) => void;
  dragProps?: HTMLAttributes<HTMLDivElement>;
}

const displayDate = (value?: string) => {
  if (!value) return 'Data não informada';
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime())
    ? 'Data não informada'
    : new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: '2-digit' }).format(parsed);
};

const priorityClass = (priority?: string) =>
  priority === 'Crítica'
    ? 'react-card-chip--critical'
    : priority === 'Alta'
    ? 'react-card-chip--high'
    : '';

export function SprintCard({
  sprint,
  onOpen,
  onEdit,
  onToggleFeatured,
  onMove,
  dragProps,
}: SprintCardProps) {
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
  const laneIndex = LANES.findIndex((lane) => lane.id === sprint.lane);
  const tasks = sprint.taskItems || [];
  const total = tasks.length || Number(sprint.tasks || 0);
  const completedTasks = (sprint as Sprint & { completedTasks?: number }).completedTasks;
  const completed = tasks.length
    ? tasks.filter((task) => task.status === 'Concluída').length
    : Number(completedTasks ?? Math.round((total * (sprint.progress || 0)) / 100));
  const blocked = tasks.length
    ? tasks.filter((task) => task.status === 'Bloqueada').length
    : Number(sprint.blocked || 0);
  const pending = Math.max(0, total - completed - blocked);
  const percent = Math.max(0, Math.min(100, Math.round(sprint.progress || 0)));
  const displayedPf = Number(sprint.detailedFunctionPoints || sprint.functionPoints || 0);
  const color = systemColor(sprintSystem(sprint));
  const owner =
    sprint.po && !/^n[aã]o\b/i.test(sprint.po.trim()) ? sprint.po : 'Não informado';
  const ownerInitials =
    owner === 'Não informado'
      ? 'NI'
      : owner
          .split(/\s+/)
          .slice(0, 2)
          .map((part) => part[0])
          .join('')
          .toUpperCase();

  const handleOpenMenu = (event: MouseEvent<HTMLElement>) => {
    event.stopPropagation();
    setMenuAnchor(event.currentTarget);
  };

  const handleCloseMenu = () => {
    setMenuAnchor(null);
  };

  const move = (lane: Lane) => {
    onMove?.(sprint, lane);
    handleCloseMenu();
  };

  return (
    <article
      {...dragProps}
      className={`react-sprint-card react-sprint-card--clean ${dragProps?.className || ''}`}
      tabIndex={0}
      role="group"
      aria-label={`${sprintSystem(sprint)}, Sprint ${sprint.sprintNumber || 'não informada'}`}
      onClick={() => onOpen(sprint)}
      onKeyDown={(event) => {
        if (event.key === 'Enter') {
          event.preventDefault();
          onOpen(sprint);
        }
        if (event.altKey && event.key === 'ArrowLeft' && laneIndex > 0) {
          event.preventDefault();
          move(LANES[laneIndex - 1].id);
        }
        if (event.altKey && event.key === 'ArrowRight' && laneIndex < LANES.length - 1) {
          event.preventDefault();
          move(LANES[laneIndex + 1].id);
        }
      }}
      style={
        {
          '--system-color': color,
          '--progress': `${percent * 3.6}deg`,
        } as CSSProperties
      }
    >
      <div className="react-card-band" />

      <div className="react-card-top">
        <div className="react-card-identity">
          <Tooltip title={`Sistema: ${sprintSystem(sprint)}`} arrow placement="top">
            <span className="react-system-pill">{sprintSystem(sprint)}</span>
          </Tooltip>
          <span className="react-sprint-meta">
            Sprint {sprint.sprintNumber || '—'} · OS {sprint.serviceOrder || sprint.code}
          </span>
        </div>

        <Tooltip title={`Progresso atual: ${percent}%`} arrow placement="top">
          <span className="react-progress-ring" aria-label={`Progresso ${percent}%`}>
            <b>{percent}%</b>
          </span>
        </Tooltip>

        <div className="react-card-menu">
          <button aria-label="Ações da Sprint" onClick={handleOpenMenu}>
            <MoreVertical size={15} />
          </button>

          <Menu
            anchorEl={menuAnchor}
            open={Boolean(menuAnchor)}
            onClose={handleCloseMenu}
            onClick={(e) => e.stopPropagation()}
            transformOrigin={{ horizontal: 'right', vertical: 'top' }}
            anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
          >
            <MenuItem
              onClick={() => {
                onOpen(sprint);
                handleCloseMenu();
              }}
            >
              <ClipboardList size={14} style={{ marginRight: 8, color: '#2563eb' }} />
              Abrir Tasks
            </MenuItem>
            <MenuItem
              onClick={() => {
                onEdit?.(sprint);
                handleCloseMenu();
              }}
            >
              <Pencil size={14} style={{ marginRight: 8, color: '#64748b' }} />
              Editar
            </MenuItem>
            <MenuItem
              onClick={() => {
                onToggleFeatured?.(sprint);
                handleCloseMenu();
              }}
            >
              <Star
                size={14}
                style={{
                  marginRight: 8,
                  color: sprint.isFeatured ? '#eab308' : '#64748b',
                }}
              />
              {sprint.isFeatured ? 'Remover destaque' : 'Destacar card'}
            </MenuItem>
            {laneIndex > 0 && (
              <MenuItem onClick={() => move(LANES[laneIndex - 1].id)}>
                <ArrowLeft size={14} style={{ marginRight: 8, color: '#64748b' }} />
                Mover para trás
              </MenuItem>
            )}
            {laneIndex < LANES.length - 1 && (
              <MenuItem onClick={() => move(LANES[laneIndex + 1].id)}>
                <ArrowRight size={14} style={{ marginRight: 8, color: '#64748b' }} />
                Mover para frente
              </MenuItem>
            )}
          </Menu>
        </div>
      </div>

      <Tooltip title={sprint.objective} arrow placement="top">
        <h3
          title={sprint.objective}
          style={{
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            margin: '8px 0 6px',
            minHeight: 'unset',
            display: 'block',
          }}
        >
          {sprint.objective}
        </h3>
      </Tooltip>

      <div className="react-card-stats">
        <span className="react-card-chip react-card-chip--success">
          <Check size={11} />
          {completed} concluídas
        </span>
        <span className="react-card-chip react-card-chip--pending">
          <Timer size={11} />
          {pending} pendentes
        </span>
        {blocked > 0 && (
          <span className="react-card-chip react-card-chip--critical">
            <TriangleAlert size={11} />
            {blocked} bloqueada{blocked > 1 ? 's' : ''}
          </span>
        )}
      </div>

      <div className="react-track" aria-label={`Progresso ${percent}%`}>
        <i style={{ width: `${percent}%` }} />
      </div>

      <div className="react-card-footer-clean">
        <div className="react-card-owner">
          <Tooltip title={`Product Owner: ${owner}`} arrow placement="top">
            <span className="react-card-avatar">{ownerInitials}</span>
          </Tooltip>
          <span title={owner}>{owner}</span>
        </div>
        <span className="react-card-date">
          <CalendarDays size={11} />
          {displayDate(sprint.end)}
        </span>
        <strong className="react-card-pf">{formatPF(displayedPf)} PF</strong>
        {sprint.priorityLevel && (
          <span className={`react-card-priority ${priorityClass(sprint.priorityLevel)}`}>
            <Flag size={10} />
            {sprint.priorityLevel}
          </span>
        )}
      </div>

      {!!sprint.labels?.length && (
        <div className="react-card-labels">
          {sprint.labels.map((label) => (
            <span key={label}>
              <Tag size={10} />
              {label}
            </span>
          ))}
        </div>
      )}
    </article>
  );
}
