import { useState } from 'react';
import {
  Box,
  Typography,
  Chip,
  Button,
  Paper,
} from '@mui/material';
import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  closestCorners,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from '@dnd-kit/core';
import { Plus, ChevronUp } from 'lucide-react';
import type { Sprint, SprintTask, TaskStatus } from '../../../domain/sprint/model';
import { sprintSystem } from '../../../domain/sprint/queries';
import {
  OFFICIAL_TASK_STATES,
  normalizeTaskStatus,
  TaskLane,
  TaskCard,
} from '../../sprints/components/tasks';

export interface InlineTaskBoardProps {
  sprint: Sprint;
  onCollapse: () => void;
  onNewTask: () => void;
  onOpenTaskDetail: (task: SprintTask) => void;
  onEditTask: (task: SprintTask) => void;
  onDeleteTask: (taskId: string) => void;
  onRequestMove: (params: {
    sprintCode: string;
    taskId: string;
    fromStatus: TaskStatus;
    toStatus: TaskStatus;
  }) => void;
  disabled?: boolean;
}

export function InlineTaskBoard({
  sprint,
  onCollapse,
  onNewTask,
  onOpenTaskDetail,
  onEditTask,
  onDeleteTask,
  onRequestMove,
  disabled = false,
}: InlineTaskBoardProps) {
  const [activeDragTask, setActiveDragTask] = useState<SprintTask | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor)
  );

  const systemName = sprintSystem(sprint);
  const osNumber = sprint.serviceOrder || sprint.code;
  const sprintLabel = sprint.sprintNumber ? `Sprint ${sprint.sprintNumber}` : sprint.code;
  const taskItems = sprint.taskItems || [];
  const totalTasks = taskItems.length;

  const handleDragStart = ({ active }: DragStartEvent) => {
    if (disabled) return;
    const found = taskItems.find((t) => t.id === active.id);
    setActiveDragTask(found || null);
  };

  const handleDragEnd = ({ active, over }: DragEndEvent) => {
    setActiveDragTask(null);
    if (!over || disabled) return;

    const task = taskItems.find((t) => t.id === active.id);
    if (!task) return;

    const overTarget = String(over.id);
    let targetStatus: TaskStatus | undefined;

    if (overTarget.startsWith('tasklane:')) {
      targetStatus = overTarget.slice(9) as TaskStatus;
    } else {
      const overTask = taskItems.find((t) => t.id === overTarget);
      if (overTask) {
        targetStatus = normalizeTaskStatus(overTask.status);
      }
    }

    if (!targetStatus) return;

    const fromStatus = normalizeTaskStatus(task.status);
    targetStatus = normalizeTaskStatus(targetStatus);

    onRequestMove({
      sprintCode: sprint.code,
      taskId: task.id,
      fromStatus,
      toStatus: targetStatus,
    });
  };

  const handleQuickStatusChange = (task: SprintTask, nextStatus: TaskStatus) => {
    const fromStatus = normalizeTaskStatus(task.status);
    const toStatus = normalizeTaskStatus(nextStatus);

    onRequestMove({
      sprintCode: sprint.code,
      taskId: task.id,
      fromStatus,
      toStatus,
    });
  };

  return (
    <Box
      sx={{
        p: { xs: 1.5, sm: 2 },
        display: 'flex',
        flexDirection: 'column',
        gap: 1.5,
        backgroundColor: '#f8fafc',
        borderRadius: '8px',
        border: '1px solid #e2e8f0',
      }}
    >
      {/* Cabeçalho do Kanban Inline (Fase 5) */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 1.5,
          p: 1.5,
          backgroundColor: '#ffffff',
          borderRadius: '8px',
          border: '1px solid #e2e8f0',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
          <Typography
            variant="h3"
            sx={{
              fontFamily: '"Space Grotesk", sans-serif',
              fontWeight: 700,
              fontSize: '0.9375rem',
              color: 'text.primary',
              m: 0,
            }}
          >
            Tasks da {sprintLabel}
          </Typography>

          <Chip
            label={`Sistema: ${systemName}`}
            size="small"
            sx={{
              height: 22,
              fontSize: '0.6875rem',
              fontWeight: 600,
              backgroundColor: '#f1f5f9',
              color: '#334155',
            }}
          />

          <Chip
            label={`OS: ${osNumber}`}
            size="small"
            sx={{
              height: 22,
              fontSize: '0.6875rem',
              fontFamily: 'monospace',
              fontWeight: 600,
              backgroundColor: '#f1f5f9',
              color: '#334155',
            }}
          />

          <Typography
            variant="caption"
            sx={{ color: 'text.secondary', fontWeight: 600, fontSize: '0.75rem' }}
          >
            · {totalTasks} task{totalTasks === 1 ? '' : 's'}
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Button
            variant="contained"
            size="small"
            startIcon={<Plus size={14} />}
            onClick={onNewTask}
            disabled={disabled}
            sx={{
              height: 30,
              fontSize: '0.75rem',
              fontWeight: 700,
              textTransform: 'none',
              borderRadius: '6px',
            }}
          >
            Nova Task
          </Button>

          <Button
            variant="text"
            size="small"
            startIcon={<ChevronUp size={14} />}
            onClick={onCollapse}
            sx={{
              height: 30,
              fontSize: '0.75rem',
              fontWeight: 600,
              textTransform: 'none',
              color: 'text.secondary',
              '&:hover': {
                backgroundColor: '#f1f5f9',
                color: 'text.primary',
              },
            }}
          >
            Recolher
          </Button>
        </Box>
      </Box>

      {/* 5 Raias Oficiais de Tasks (Fase 6 & 7) */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDragCancel={() => setActiveDragTask(null)}
      >
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: '1fr',
              sm: 'repeat(2, 1fr)',
              md: 'repeat(5, 1fr)',
            },
            gap: 1.5,
            overflowX: 'auto',
            pb: 0.5,
          }}
        >
          {OFFICIAL_TASK_STATES.map((laneConfig) => {
            const laneTasks = taskItems.filter(
              (t) => normalizeTaskStatus(t.status) === laneConfig.id
            );

            return (
              <TaskLane
                key={laneConfig.id}
                lane={laneConfig}
                tasks={laneTasks}
                onOpenDetail={onOpenTaskDetail}
                onEdit={onEditTask}
                onDelete={onDeleteTask}
                onStatusChange={handleQuickStatusChange}
                disabled={disabled}
              />
            );
          })}
        </Box>

        <DragOverlay>
          {activeDragTask ? (
            <TaskCard
              task={activeDragTask}
              onOpenDetail={() => undefined}
              onEdit={() => undefined}
              onDelete={() => undefined}
              onStatusChange={() => undefined}
            />
          ) : null}
        </DragOverlay>
      </DndContext>
    </Box>
  );
}
