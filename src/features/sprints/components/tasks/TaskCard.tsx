import {
  Box,
  Typography,
  Chip,
  Paper,
  Tooltip,
  IconButton,
  TextField,
  MenuItem,
} from '@mui/material';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  AlertTriangle,
  User,
  Clock,
  CheckSquare,
  Eye,
  Pencil,
  Trash2,
  GripVertical,
} from 'lucide-react';
import type { SprintTask, TaskStatus } from '../../../../domain/sprint/model';
import { OFFICIAL_TASK_STATES, normalizeTaskStatus } from './taskConstants';

export interface TaskCardProps {
  task: SprintTask;
  onOpenDetail: (task: SprintTask) => void;
  onEdit: (task: SprintTask) => void;
  onDelete: (taskId: string) => void;
  onStatusChange: (task: SprintTask, nextStatus: TaskStatus) => void;
  disabled?: boolean;
}

export function TaskCard({
  task,
  onOpenDetail,
  onEdit,
  onDelete,
  onStatusChange,
  disabled = false,
}: TaskCardProps) {
  const assignees = task.assignees?.length
    ? task.assignees
    : task.owner
    ? [{ id: task.ownerId || task.owner, name: task.owner, role: task.ownerRole }]
    : [];

  const checklistCount = (task.checklist || []).length;
  const checklistDone = (task.checklist || []).filter((c) => c.completed).length;
  const currentStatus = normalizeTaskStatus(task.status);

  return (
    <Paper
      elevation={0}
      onClick={() => onOpenDetail(task)}
      sx={{
        p: 1.5,
        borderRadius: '8px',
        border: task.isBlocked ? '1.5px solid #dc2626' : '1px solid #e2e8f0',
        background: '#ffffff',
        display: 'flex',
        flexDirection: 'column',
        gap: 1,
        cursor: 'pointer',
        transition: 'all 0.15s ease',
        opacity: disabled ? 0.6 : 1,
        pointerEvents: disabled ? 'none' : 'auto',
        '&:hover': {
          boxShadow: '0 2px 8px rgba(15, 39, 64, 0.08)',
          borderColor: '#2563eb',
        },
      }}
      role="article"
      aria-label={`Tarefa: ${task.title}`}
    >
      {/* Título & Drag Handle */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 1 }}>
        <Typography
          variant="body2"
          sx={{
            fontWeight: 700,
            color: 'text.primary',
            fontSize: '0.8125rem',
            lineHeight: 1.3,
          }}
        >
          {task.title}
        </Typography>
        <GripVertical size={14} color="#94a3b8" style={{ cursor: 'grab', flexShrink: 0 }} />
      </Box>

      {/* Badges de Alerta (Retrabalho / Bloqueio) */}
      {((task.reworkCount || 0) > 0 || task.isBlocked) && (
        <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
          {(task.reworkCount || 0) > 0 && (
            <Chip
              icon={<AlertTriangle size={10} />}
              label={`${task.reworkCount}x Retrabalho`}
              size="small"
              color="error"
              sx={{ height: 18, fontSize: '0.5625rem', fontWeight: 700 }}
            />
          )}
          {task.isBlocked && (
            <Chip
              label="Bloqueada"
              size="small"
              color="error"
              variant="outlined"
              sx={{ height: 18, fontSize: '0.5625rem', fontWeight: 700 }}
            />
          )}
        </Box>
      )}

      {/* Responsáveis (Múltiplos) */}
      <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
        {assignees.length ? (
          assignees.map((mem) => {
            const isQA = mem.role?.includes('QA');
            return (
              <Chip
                key={mem.id || mem.name}
                label={mem.name}
                size="small"
                sx={{
                  height: 18,
                  fontSize: '0.625rem',
                  bgcolor: isQA ? '#fdf2f8' : '#eff6ff',
                  color: isQA ? '#be185d' : '#1d4ed8',
                  fontWeight: 600,
                }}
              />
            );
          })
        ) : (
          <Typography
            variant="caption"
            sx={{ color: 'text.secondary', fontSize: '0.6875rem', display: 'inline-flex', alignItems: 'center', gap: 0.4 }}
          >
            <User size={10} /> Não atribuído
          </Typography>
        )}
      </Box>

      {/* Indicador de Horas & Checklist */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          pt: 0.5,
          borderTop: '1px dashed #f1f5f9',
        }}
      >
        <Typography
          variant="caption"
          sx={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 0.4,
            color: 'text.secondary',
            fontSize: '0.6875rem',
          }}
        >
          <Clock size={11} />
          {task.realizedDevHours || 0}h dev · {task.realizedQaHours || 0}h qa
        </Typography>

        {checklistCount > 0 && (
          <Typography
            variant="caption"
            sx={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 0.3,
              color: 'text.secondary',
              fontSize: '0.625rem',
              fontWeight: 600,
            }}
          >
            <CheckSquare size={10} />
            {checklistDone}/{checklistCount}
          </Typography>
        )}
      </Box>

      {/* Seletor de Movimentação Rápida */}
      <TextField
        select
        size="small"
        value={currentStatus}
        onClick={(e) => e.stopPropagation()}
        onChange={(e) => onStatusChange(task, e.target.value as TaskStatus)}
        sx={{ mt: 0.5 }}
        slotProps={{
          select: {
            sx: { fontSize: '0.75rem', py: 0.25 },
            inputProps: { 'aria-label': 'Situação da tarefa' },
          },
        }}
      >
        {OFFICIAL_TASK_STATES.map((st) => (
          <MenuItem key={st.id} value={st.id} sx={{ fontSize: '0.75rem' }}>
            {st.label}
          </MenuItem>
        ))}
      </TextField>

      {/* Ações do Card */}
      <Box
        sx={{ display: 'flex', justifyContent: 'flex-end', gap: 0.5 }}
        onClick={(e) => e.stopPropagation()}
      >
        <Tooltip title="Ver detalhes & histórico" arrow>
          <IconButton
            size="small"
            aria-label="Ver detalhes"
            onClick={(e) => {
              e.stopPropagation();
              onOpenDetail(task);
            }}
          >
            <Eye size={12} />
          </IconButton>
        </Tooltip>
        <Tooltip title="Editar" arrow>
          <IconButton
            size="small"
            aria-label="Editar"
            onClick={(e) => {
              e.stopPropagation();
              onEdit(task);
            }}
          >
            <Pencil size={12} />
          </IconButton>
        </Tooltip>
        <Tooltip title="Excluir" arrow>
          <IconButton
            size="small"
            color="error"
            aria-label="Excluir"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(task.id);
            }}
          >
            <Trash2 size={12} />
          </IconButton>
        </Tooltip>
      </Box>
    </Paper>
  );
}

// Sortable wrapper for DnD
export function SortableTaskCard(props: TaskCardProps) {
  const { task } = props;
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: task.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.35 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <TaskCard {...props} />
    </div>
  );
}
