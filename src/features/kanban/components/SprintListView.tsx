import { useState, useEffect, useMemo, Fragment } from 'react';
import { Box, Paper, Snackbar, Alert } from '@mui/material';
import type { Sprint, SprintTask, TaskStatus } from '../../../domain/sprint/model';
import { LocalStorageRegistrationRepository } from '../../../repositories/local-storage/LocalStorageRegistrationRepository';
import type { TeamMember } from '../../../domain/registration/model';
import { SprintListHeader } from './SprintListHeader';
import { SprintListRow } from './SprintListRow';
import { SprintListExpandedRow } from './SprintListExpandedRow';
import { InlineTaskBoard } from './InlineTaskBoard';
import { TaskStatusModal } from '../../sprints/components/TaskStatusModal';
import { TaskDetailDrawer } from '../../sprints/components/TaskDetailDrawer';
import { TaskEditorModal } from '../../sprints/components/TaskEditorModal';

export interface SprintListViewProps {
  sprints: Sprint[];
  onOpenSprint: (sprint: Sprint) => void;
  onUpdateSprint: (code: string, changes: Partial<Sprint>) => void;
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
}

interface PendingMove {
  sprintCode: string;
  task: SprintTask;
  fromStatus: TaskStatus;
  toStatus: TaskStatus;
}

export function SprintListView({
  sprints,
  onOpenSprint,
  onCreateTask,
  onUpdateTask,
  onMoveTask,
  onDeleteTask,
}: SprintListViewProps) {
  // Estado de expansão (Fase 3: somente uma sprint expandida por vez)
  const [expandedSprintCode, setExpandedSprintCode] = useState<string | null>(null);

  // Estado de movimentação pendente (Fase 7 e 8: confirmação obrigatória)
  const [pendingMove, setPendingMove] = useState<PendingMove | null>(null);
  const [moveLoading, setMoveLoading] = useState(false);
  const [moveError, setMoveError] = useState<string | null>(null);

  // Notificação de sucesso acessível
  const [successNotice, setSuccessNotice] = useState<string | null>(null);

  // Modais de Tasks
  const [editorOpen, setEditorOpen] = useState(false);
  const [editingContext, setEditingContext] = useState<{
    sprintCode: string;
    task: SprintTask | null;
  } | null>(null);

  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedTaskContext, setSelectedTaskContext] = useState<{
    sprintCode: string;
    taskId: string;
  } | null>(null);

  // Membros cadastrados para atribuição
  const teamMembers = useMemo<TeamMember[]>(() => {
    try {
      const repo = new LocalStorageRegistrationRepository();
      return repo.list<TeamMember>('teamMembers').filter((m) => m.active !== false);
    } catch {
      return [];
    }
  }, []);

  // Fase 13: Se a Sprint expandida deixar de existir no resultado filtrado, limpar expandedSprintCode
  useEffect(() => {
    if (expandedSprintCode && !sprints.some((s) => s.code === expandedSprintCode)) {
      setExpandedSprintCode(null);
    }
  }, [sprints, expandedSprintCode]);

  const handleToggleExpand = (code: string) => {
    setExpandedSprintCode((current) => (current === code ? null : code));
  };

  // Centralização de solicitação de movimentação (Fase 7)
  const requestTaskMove = ({
    sprintCode,
    taskId,
    fromStatus,
    toStatus,
  }: {
    sprintCode: string;
    taskId: string;
    fromStatus: TaskStatus;
    toStatus: TaskStatus;
  }) => {
    // Se origem e destino forem iguais: não abrir confirmação, não persistir
    if (fromStatus === toStatus) return;

    const sprint = sprints.find((s) => s.code === sprintCode);
    if (!sprint) return;

    const task = (sprint.taskItems || []).find((t) => t.id === taskId);
    if (!task) return;

    setMoveError(null);
    setPendingMove({
      sprintCode,
      task,
      fromStatus,
      toStatus,
    });
  };

  const handleConfirmMove = async (note?: string, hoursLogged?: number) => {
    if (!pendingMove || moveLoading) return;

    setMoveLoading(true);
    setMoveError(null);

    try {
      await onMoveTask(
        pendingMove.sprintCode,
        pendingMove.task.id,
        pendingMove.toStatus,
        note,
        hoursLogged
      );

      const targetStatus = pendingMove.toStatus;
      setSuccessNotice(`Task movimentada para ${targetStatus}.`);
      setPendingMove(null);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Falha ao movimentar a tarefa.';
      setMoveError(msg);
    } finally {
      setMoveLoading(false);
    }
  };

  const handleCancelMove = () => {
    setPendingMove(null);
    setMoveError(null);
    setMoveLoading(false);
  };

  // Handlers para criação e edição de Tasks
  const handleOpenNewTask = (sprintCode: string) => {
    setEditingContext({ sprintCode, task: null });
    setEditorOpen(true);
  };

  const handleOpenEditTask = (sprintCode: string, task: SprintTask) => {
    setEditingContext({ sprintCode, task });
    setEditorOpen(true);
  };

  const handleSaveTask = (payload: Partial<SprintTask>) => {
    if (!editingContext) return;
    const { sprintCode, task } = editingContext;

    if (task) {
      onUpdateTask(sprintCode, task.id, payload);
    } else {
      onCreateTask(sprintCode, {
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

    setEditorOpen(false);
    setEditingContext(null);
  };

  const handleOpenTaskDetail = (sprintCode: string, task: SprintTask) => {
    setSelectedTaskContext({ sprintCode, taskId: task.id });
    setDetailOpen(true);
  };

  const handleToggleChecklist = (taskId: string, itemId: string) => {
    if (!selectedTaskContext) return;
    const sprint = sprints.find((s) => s.code === selectedTaskContext.sprintCode);
    if (!sprint) return;

    const task = (sprint.taskItems || []).find((t) => t.id === taskId);
    if (!task) return;

    const updatedChecklist = (task.checklist || []).map((item) =>
      item.id === itemId ? { ...item, completed: !item.completed } : item
    );

    onUpdateTask(selectedTaskContext.sprintCode, taskId, { checklist: updatedChecklist });
  };

  const currentDetailTask = useMemo(() => {
    if (!selectedTaskContext) return null;
    const sprint = sprints.find((s) => s.code === selectedTaskContext.sprintCode);
    if (!sprint) return null;
    return (sprint.taskItems || []).find((t) => t.id === selectedTaskContext.taskId) || null;
  }, [selectedTaskContext, sprints]);

  const handleDeleteTaskAndClean = (sprintCode: string, taskId: string) => {
    onDeleteTask(sprintCode, taskId);
    if (selectedTaskContext?.taskId === taskId) {
      setDetailOpen(false);
      setSelectedTaskContext(null);
    }
  };

  return (
    <Box sx={{ width: '100%', p: { xs: 1.5, sm: 3 } }}>
      <Paper
        elevation={0}
        sx={{
          border: '1px solid #e4e7ec',
          borderRadius: '10px',
          overflow: 'hidden',
          backgroundColor: '#ffffff',
          boxShadow: '0 1px 3px rgba(16, 24, 40, 0.05)',
        }}
      >
        <div style={{ overflowX: 'auto', width: '100%' }}>
          <table className="sprint-list-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
            <SprintListHeader />
            <tbody>
              {sprints.map((sprint, index) => {
                const isExpanded = expandedSprintCode === sprint.code;
                return (
                  <Fragment key={sprint.code}>
                    <SprintListRow
                      sprint={sprint}
                      index={index}
                      isExpanded={isExpanded}
                      onToggleExpand={handleToggleExpand}
                      onOpenCard={onOpenSprint}
                    />

                    {isExpanded && (
                      <SprintListExpandedRow sprintCode={sprint.code}>
                        <InlineTaskBoard
                          sprint={sprint}
                          onCollapse={() => setExpandedSprintCode(null)}
                          onNewTask={() => handleOpenNewTask(sprint.code)}
                          onOpenTaskDetail={(t) => handleOpenTaskDetail(sprint.code, t)}
                          onEditTask={(t) => handleOpenEditTask(sprint.code, t)}
                          onDeleteTask={(taskId) => handleDeleteTaskAndClean(sprint.code, taskId)}
                          onRequestMove={requestTaskMove}
                        />
                      </SprintListExpandedRow>
                    )}
                  </Fragment>
                );
              })}

              {sprints.length === 0 && (
                <tr>
                  <td
                    colSpan={12}
                    style={{
                      textAlign: 'center',
                      padding: '48px 16px',
                      color: '#64748b',
                      fontSize: '0.875rem',
                    }}
                  >
                    Nenhuma Sprint encontrada com os filtros selecionados.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Paper>

      {/* Modal de Confirmação Obrigatória (Fase 8) */}
      {pendingMove && (
        <TaskStatusModal
          open
          task={pendingMove.task}
          targetStatus={pendingMove.toStatus}
          loading={moveLoading}
          errorMessage={moveError}
          onClose={handleCancelMove}
          onConfirm={handleConfirmMove}
        />
      )}

      {/* Editor Modal para Criar / Editar Task */}
      {editingContext && (
        <TaskEditorModal
          open={editorOpen}
          task={editingContext.task}
          teamMembers={teamMembers}
          onClose={() => {
            setEditorOpen(false);
            setEditingContext(null);
          }}
          onSave={handleSaveTask}
        />
      )}

      {/* Drawer de Detalhes da Task */}
      {selectedTaskContext && (
        <TaskDetailDrawer
          open={detailOpen}
          task={currentDetailTask}
          onClose={() => {
            setDetailOpen(false);
            setSelectedTaskContext(null);
          }}
          onEdit={(t) => {
            setDetailOpen(false);
            handleOpenEditTask(selectedTaskContext.sprintCode, t);
          }}
          onToggleChecklistItem={handleToggleChecklist}
        />
      )}

      {/* Notificação de Sucesso */}
      <Snackbar
        open={Boolean(successNotice)}
        autoHideDuration={4000}
        onClose={() => setSuccessNotice(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          severity="success"
          onClose={() => setSuccessNotice(null)}
          sx={{ width: '100%', fontWeight: 600, borderRadius: '8px' }}
        >
          {successNotice}
        </Alert>
      </Snackbar>
    </Box>
  );
}
