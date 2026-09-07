import { useState, useEffect, useMemo, type ReactNode } from 'react';
import {
  Dialog,
  DialogContent,
  Tabs,
  Tab,
  Button,
  IconButton,
  TextField,
  MenuItem,
  Chip,
  Box,
  Typography,
  Switch,
  FormControlLabel,
  Paper,
  Tooltip,
} from '@mui/material';
import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  closestCorners,
  useDroppable,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from '@dnd-kit/core';
import {
  Plus,
  X,
  Clock,
  CheckCircle2,
} from 'lucide-react';
import type { AuditLog, Sprint, SprintTask, TaskStatus } from '../../../domain/sprint/model';
import { LANES } from '../../../domain/sprint/model';
import { sprintSystem } from '../../../domain/sprint/queries';
import { LocalStorageRegistrationRepository } from '../../../repositories/local-storage/LocalStorageRegistrationRepository';
import type { TeamMember } from '../../../domain/registration/model';
import { SprintIdentityHeader } from './SprintIdentityHeader';
import { SprintSummaryLiveEditor } from './SprintSummaryLiveEditor';
import { SprintGroupedFields } from './SprintGroupedFields';
import { TaskStatusModal } from './TaskStatusModal';
import { TaskDetailDrawer } from './TaskDetailDrawer';
import { TaskEditorModal } from './TaskEditorModal';
import { OFFICIAL_TASK_STATES, normalizeTaskStatus, TaskLane, TaskCard } from './tasks';

type TabType = 'summary' | 'tasks' | 'history' | 'featured';

interface Props {
  sprint: Sprint;
  initialTab?: TabType;
  onClose: () => void;
  onUpdate: (changes: Partial<Sprint>) => void;
  onCreateTask: (code: string, task: SprintTask) => void;
  onUpdateTask: (code: string, taskId: string, changes: Partial<SprintTask>) => void;
  onMoveTask: (
    code: string,
    taskId: string,
    status: TaskStatus,
    note?: string,
    hoursLogged?: number
  ) => void;
  onDeleteTask: (code: string, taskId: string) => void;
  auditLogs: AuditLog[];
}

const label = (value?: string | number) =>
  value === undefined || value === '' ? 'Não informado' : String(value);

const date = (value?: string) => {
  if (!value) return 'Não informado';
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime())
    ? 'Não informado'
    : new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short' }).format(parsed);
};

export function SprintDetailsModal({
  sprint,
  initialTab = 'summary',
  onClose,
  onUpdate,
  onCreateTask,
  onUpdateTask,
  onMoveTask,
  onDeleteTask,
  auditLogs,
}: Props) {
  const [tab, setTab] = useState<TabType>(initialTab);
  const [note, setNote] = useState(sprint.featuredNote || '');

  // Modais de Tasks
  const [editorOpen, setEditorOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<SprintTask | null>(null);

  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<SprintTask | null>(null);

  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [transitionTask, setTransitionTask] = useState<{
    task: SprintTask;
    targetStatus: TaskStatus;
  } | null>(null);

  // DnD Active state
  const [activeDragTask, setActiveDragTask] = useState<SprintTask | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor)
  );

  // Carregar membros cadastrados
  const teamMembers = useMemo<TeamMember[]>(() => {
    try {
      const repo = new LocalStorageRegistrationRepository();
      return repo.list<TeamMember>('teamMembers').filter((m) => m.active !== false);
    } catch {
      return [];
    }
  }, []);

  useEffect(() => {
    setTab(initialTab);
    setNote(sprint.featuredNote || '');
  }, [initialTab, sprint.code, sprint.featuredNote]);

  const handleStatusChangeRequest = (task: SprintTask, nextStatus: TaskStatus) => {
    if (nextStatus === task.status) return;

    if (
      nextStatus === 'Em Teste' ||
      nextStatus === 'Em Correção' ||
      nextStatus === 'Concluída'
    ) {
      setTransitionTask({ task, targetStatus: nextStatus });
      setStatusModalOpen(true);
    } else {
      onMoveTask(sprint.code, task.id, nextStatus);
    }
  };

  const handleConfirmTransition = (feedbackNote?: string, hoursLogged?: number) => {
    if (!transitionTask) return;
    onMoveTask(
      sprint.code,
      transitionTask.task.id,
      transitionTask.targetStatus,
      feedbackNote,
      hoursLogged
    );
    setStatusModalOpen(false);
    setTransitionTask(null);
  };

  const handleTaskDragStart = ({ active }: DragStartEvent) => {
    const found = (sprint.taskItems || []).find((t) => t.id === active.id);
    setActiveDragTask(found || null);
  };

  const handleTaskDragEnd = ({ active, over }: DragEndEvent) => {
    setActiveDragTask(null);
    if (!over) return;

    const task = (sprint.taskItems || []).find((t) => t.id === active.id);
    if (!task) return;

    const overTarget = String(over.id);
    let targetLane: TaskStatus | undefined;

    if (overTarget.startsWith('tasklane:')) {
      targetLane = overTarget.slice(9) as TaskStatus;
    } else {
      const overTask = (sprint.taskItems || []).find((t) => t.id === overTarget);
      if (overTask) {
        targetLane =
          overTask.status === 'Em Andamento' ? 'Em Desenvolvimento' : overTask.status;
      }
    }

    if (targetLane && targetLane !== task.status) {
      handleStatusChangeRequest(task, targetLane);
    }
  };

  const handleSaveTask = (payload: Partial<SprintTask>) => {
    if (editingTask) {
      onUpdateTask(sprint.code, editingTask.id, payload);
    } else {
      onCreateTask(sprint.code, {
        id: `TASK-${Date.now()}`,
        title: payload.title!,
        description: payload.description,
        status: payload.status || 'A Fazer',
        points: payload.points || 0,
        priority: payload.priority,
        assignees: payload.assignees || [],
        owner: payload.owner,
        ownerId: payload.ownerId,
        ownerRole: payload.ownerRole,
        estimatedDevHours: payload.estimatedDevHours || 0,
        realizedDevHours: 0,
        estimatedQaHours: payload.estimatedQaHours || 0,
        realizedQaHours: 0,
        reworkCount: 0,
        checklist: payload.checklist || [],
        isBlocked: payload.isBlocked,
        blockerReason: payload.blockerReason,
        dueDate: payload.dueDate,
        history: [],
      });
    }
    setEditingTask(null);
  };

  const handleToggleChecklist = (taskId: string, itemId: string) => {
    const task = (sprint.taskItems || []).find((t) => t.id === taskId);
    if (!task) return;
    const updatedChecklist = (task.checklist || []).map((item) =>
      item.id === itemId ? { ...item, completed: !item.completed } : item
    );
    onUpdateTask(sprint.code, taskId, { checklist: updatedChecklist });
  };

  // Somatório de horas da sprint
  const totalDevHours = (sprint.taskItems || []).reduce(
    (acc, t) => acc + (t.realizedDevHours || 0),
    0
  );
  const totalQaHours = (sprint.taskItems || []).reduce(
    (acc, t) => acc + (t.realizedQaHours || 0),
    0
  );

  return (
    <Dialog
      open
      onClose={onClose}
      maxWidth={false}
      slotProps={{
        backdrop: {
          style: {
            backgroundColor: 'rgba(15, 23, 42, 0.45)',
            backdropFilter: 'blur(4px)',
          },
        },
        paper: {
          sx: {
            width: { xs: '95vw', sm: 960, md: 1040 },
            maxWidth: '95vw',
            height: { xs: '92vh', sm: 630, md: 620 },
            maxHeight: '92vh',
            borderRadius: 2,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            boxShadow: '0 20px 40px rgba(15, 23, 42, 0.2)',
          },
        },
      }}
    >
      <DialogContent
        sx={{
          p: { xs: 2, sm: 2.5 },
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          overflow: 'hidden',
        }}
      >
        <IconButton
          aria-label="Fechar"
          onClick={onClose}
          sx={{ position: 'absolute', right: 14, top: 14, color: 'text.secondary', zIndex: 10 }}
        >
          <X size={18} />
        </IconButton>

        {/* Cabeçalho Operacional em Linha Responsiva */}
        <Box sx={{ mb: 1.2, flexShrink: 0, pr: 4 }}>
          <SprintIdentityHeader sprint={sprint} onUpdate={onUpdate} />
        </Box>

        {/* Tabs de Navegação */}
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 1.2, flexShrink: 0 }}>
          <Tabs
            value={tab}
            onChange={(_, val) => setTab(val as TabType)}
            aria-label="Detalhes da Sprint"
            sx={{ minHeight: 36 }}
          >
            <Tab
              label="Resumo"
              value="summary"
              sx={{ textTransform: 'none', fontWeight: 600, fontSize: '0.8125rem', minHeight: 36, py: 0.5 }}
            />
            <Tab
              label={`Tasks (${sprint.taskItems?.length || 0})`}
              value="tasks"
              sx={{ textTransform: 'none', fontWeight: 600, fontSize: '0.8125rem', minHeight: 36, py: 0.5 }}
            />
            <Tab
              label="Histórico"
              value="history"
              sx={{ textTransform: 'none', fontWeight: 600, fontSize: '0.8125rem', minHeight: 36, py: 0.5 }}
            />
            <Tab
              label="Destaque"
              value="featured"
              sx={{ textTransform: 'none', fontWeight: 600, fontSize: '0.8125rem', minHeight: 36, py: 0.5 }}
            />
          </Tabs>
        </Box>

        {/* Scrollable Tab Body */}
        <Box
          sx={{
            flex: 1,
            minHeight: 0,
            overflowY: tab === 'summary' ? 'hidden' : 'auto',
            pr: tab === 'summary' ? 0 : 0.5,
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {/* Tab 1: Resumo Vivo & Informações Agrupadas (Ocupando todo o espaço disponível com harmonia) */}
          {tab === 'summary' && (
            <SprintGroupedFields sprint={sprint} onUpdate={onUpdate} />
          )}

            {/* Tab 2: Tasks (Fluxo de 5 Etapas com Drag and Drop) */}
            {tab === 'tasks' && (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {/* Header da Seção de Tasks */}
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: 1.5,
                    p: 1.5,
                    bgcolor: '#f8fafc',
                    borderRadius: 2,
                    border: '1px solid #e2e8f0',
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                      Clique no card para abrir os detalhes ou arraste para movimentar entre as raias.
                    </Typography>
                    <Chip
                      icon={<Clock size={12} />}
                      label={`Apontamento: ${totalDevHours}h Dev · ${totalQaHours}h QA`}
                      size="small"
                      color="primary"
                      variant="outlined"
                      sx={{ fontWeight: 600 }}
                    />
                  </Box>

                  <Button
                    variant="contained"
                    size="small"
                    startIcon={<Plus size={14} />}
                    onClick={() => {
                      setEditingTask(null);
                      setEditorOpen(true);
                    }}
                  >
                    Nova Task
                  </Button>
                </Box>

                {/* Sub-Kanban de 5 Raias com DndContext */}
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCorners}
                  onDragStart={handleTaskDragStart}
                  onDragEnd={handleTaskDragEnd}
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
                    }}
                  >
                    {OFFICIAL_TASK_STATES.map((stateObj) => {
                      const laneTasks = (sprint.taskItems || []).filter((t) => {
                        return normalizeTaskStatus(t.status) === stateObj.id;
                      });

                      return (
                        <TaskLane
                          key={stateObj.id}
                          lane={stateObj}
                          tasks={laneTasks}
                          onOpenDetail={(t) => {
                            setSelectedTask(t);
                            setDetailOpen(true);
                          }}
                          onEdit={(t) => {
                            setEditingTask(t);
                            setEditorOpen(true);
                          }}
                          onDelete={(taskId) => onDeleteTask(sprint.code, taskId)}
                          onStatusChange={handleStatusChangeRequest}
                        />
                      );
                    })}
                  </Box>

                  {/* Drag Overlay para o item em arraste */}
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
            )}

            {/* Tab 3: Histórico Geral da Sprint */}
            {tab === 'history' && (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                {auditLogs.length ? (
                  auditLogs.map((entry) => (
                    <Paper
                      key={entry.id}
                      sx={{ p: 2, borderRadius: 2, border: '1px solid #e2e8f0' }}
                      elevation={0}
                    >
                      <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.primary' }}>
                        {entry.message}
                      </Typography>
                      <Typography
                        variant="caption"
                        sx={{
                          color: 'text.secondary',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 0.5,
                          mt: 0.5,
                        }}
                      >
                        <Clock size={11} /> {entry.user} ·{' '}
                        {new Intl.DateTimeFormat('pt-BR', {
                          dateStyle: 'short',
                          timeStyle: 'short',
                        }).format(new Date(entry.createdAt))}
                      </Typography>
                    </Paper>
                  ))
                ) : (
                  <Typography
                    variant="body2"
                    sx={{ color: 'text.secondary', py: 3, textAlign: 'center' }}
                  >
                    Não há alterações registradas para esta Sprint.
                  </Typography>
                )}
              </Box>
            )}

            {/* Tab 4: Destaque */}
            {tab === 'featured' && (
              <Paper sx={{ p: 3, borderRadius: 2.5, border: '1px solid #e2e8f0' }} elevation={0}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={Boolean(sprint.isFeatured)}
                      onChange={(e) =>
                        onUpdate({
                          isFeatured: e.target.checked,
                          featuredNote: e.target.checked ? note : undefined,
                        })
                      }
                    />
                  }
                  label="Exibir no Dashboard Executivo e Painel de Destaques"
                />

                {sprint.isFeatured && (
                  <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 1 }}>
                    <TextField
                      label="Informação Executiva do Destaque"
                      multiline
                      rows={3}
                      fullWidth
                      value={note}
                      onChange={(e) => setNote(e.target.value.slice(0, 280))}
                      onBlur={() => onUpdate({ featuredNote: note })}
                      placeholder="Descreva o motivo do destaque ou desempenho após entrega..."
                      helperText={`${note.length}/280 caracteres`}
                    />
                  </Box>
                )}
              </Paper>
            )}
            </Box>

        {/* Footer Actions */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            mt: 1.5,
            pt: 1.5,
            borderTop: '1px solid #e2e8f0',
            flexShrink: 0,
          }}
        >
          <Typography
            variant="caption"
            sx={{
              color: 'text.secondary',
              display: 'flex',
              alignItems: 'center',
              gap: 0.6,
              fontSize: '0.75rem',
              fontWeight: 500,
            }}
          >
            <CheckCircle2 size={14} color="#16a34a" />
            Edição direta ativa · Todas as alterações são salvas automaticamente
          </Typography>
          <Button variant="contained" onClick={onClose} size="small">
            Fechar
          </Button>
        </Box>
      </DialogContent>

      {/* Modal de Transição Inteligente com Feedback / Horas */}
      {transitionTask && (
        <TaskStatusModal
          open={statusModalOpen}
          task={transitionTask.task}
          targetStatus={transitionTask.targetStatus}
          onClose={() => {
            setStatusModalOpen(false);
            setTransitionTask(null);
          }}
          onConfirm={handleConfirmTransition}
        />
      )}

      {/* Drawer de Detalhes da Task & Timeline Log */}
      <TaskDetailDrawer
        open={detailOpen}
        task={
          selectedTask
            ? (sprint.taskItems || []).find((t) => t.id === selectedTask.id) || selectedTask
            : null
        }
        onClose={() => {
          setDetailOpen(false);
          setSelectedTask(null);
        }}
        onEdit={(taskToEdit) => {
          setEditingTask(taskToEdit);
          setEditorOpen(true);
        }}
        onToggleChecklistItem={handleToggleChecklist}
      />

      {/* Modal de Criação / Edição de Task */}
      <TaskEditorModal
        open={editorOpen}
        task={editingTask}
        teamMembers={teamMembers}
        onClose={() => {
          setEditorOpen(false);
          setEditingTask(null);
        }}
        onSave={handleSaveTask}
      />
    </Dialog>
  );
}
