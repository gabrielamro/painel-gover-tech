import { Box, Typography, Chip, Paper } from '@mui/material';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import type { SprintTask, TaskStatus } from '../../../../domain/sprint/model';
import type { TaskLaneConfig } from './taskConstants';
import { SortableTaskCard } from './TaskCard';

export interface TaskLaneProps {
  lane: TaskLaneConfig;
  tasks: SprintTask[];
  onOpenDetail: (task: SprintTask) => void;
  onEdit: (task: SprintTask) => void;
  onDelete: (taskId: string) => void;
  onStatusChange: (task: SprintTask, nextStatus: TaskStatus) => void;
  disabled?: boolean;
}

export function TaskLane({
  lane,
  tasks,
  onOpenDetail,
  onEdit,
  onDelete,
  onStatusChange,
  disabled = false,
}: TaskLaneProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: `tasklane:${lane.id}`,
    disabled,
  });

  return (
    <Paper
      elevation={0}
      sx={{
        p: 1.5,
        borderRadius: '8px',
        background: lane.bgcolor,
        border: `1px solid ${lane.borderColor}`,
        display: 'flex',
        flexDirection: 'column',
        gap: 1,
        minHeight: 220,
        flex: 1,
        minWidth: 0,
      }}
      role="region"
      aria-label={`Raia ${lane.label}`}
    >
      {/* Cabeçalho da Raia */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottom: `1px solid ${lane.color}25`,
          pb: 1,
        }}
      >
        <Typography
          variant="caption"
          sx={{ fontWeight: 700, color: lane.color, fontSize: '0.75rem' }}
        >
          {lane.label}
        </Typography>
        <Chip
          label={tasks.length}
          size="small"
          sx={{
            height: 18,
            fontSize: '0.625rem',
            fontWeight: 700,
            bgcolor: `${lane.color}15`,
            color: lane.color,
          }}
        />
      </Box>

      {/* Área Droppable */}
      <Box
        ref={setNodeRef}
        sx={{
          display: 'flex',
          flexDirection: 'column',
          gap: 1,
          flex: 1,
          minHeight: 120,
          bgcolor: isOver ? 'rgba(37, 99, 235, 0.08)' : 'transparent',
          borderRadius: '6px',
          transition: 'background-color 0.15s ease',
        }}
      >
        <SortableContext
          items={tasks.map((t) => t.id)}
          strategy={verticalListSortingStrategy}
        >
          {tasks.map((task) => (
            <SortableTaskCard
              key={task.id}
              task={task}
              onOpenDetail={onOpenDetail}
              onEdit={onEdit}
              onDelete={onDelete}
              onStatusChange={onStatusChange}
              disabled={disabled}
            />
          ))}
        </SortableContext>

        {tasks.length === 0 && (
          <Box
            sx={{
              display: 'grid',
              placeItems: 'center',
              py: 3,
              color: 'text.secondary',
              fontSize: '0.6875rem',
              fontStyle: 'italic',
              textAlign: 'center',
            }}
          >
            Nenhuma Task nesta etapa
          </Box>
        )}
      </Box>
    </Paper>
  );
}
