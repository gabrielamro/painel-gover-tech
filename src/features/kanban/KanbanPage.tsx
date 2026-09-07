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
import { SortableContext, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Filter, LayoutGrid, List, Plus, Search, X, RotateCcw } from 'lucide-react';
import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import {
  Dialog,
  DialogContent,
  IconButton,
  Box,
  TextField,
  MenuItem,
  Button,
  ToggleButtonGroup,
  ToggleButton,
  Badge,
  Paper,
  InputAdornment,
} from '@mui/material';
import './kanban-clean.css';
import { useSprints } from '../../app/providers/SprintProvider';
import { LANES, type Lane, type Sprint } from '../../domain/sprint/model';
import { filterSprints, sprintSystem } from '../../domain/sprint/queries';
import { SprintCard } from '../sprints/components/SprintCard';
import { SprintDetailsModal } from '../sprints/components/SprintDetailsModal';
import { NewSprintEditor } from '../sprints/components/SprintEditors';
import { SprintListView } from './components/SprintListView';

function LaneDrop({ lane, children }: { lane: Lane; children: ReactNode }) {
  const { setNodeRef } = useDroppable({ id: `lane:${lane}` });
  return (
    <div ref={setNodeRef} className="react-lane-cards">
      {children}
    </div>
  );
}

function SortableCard({
  sprint,
  ...props
}: {
  sprint: Sprint;
  onOpen: (item: Sprint) => void;
  onEdit: (item: Sprint) => void;
  onToggleFeatured: (item: Sprint) => void;
  onMove: (item: Sprint, lane: Lane) => void;
}) {
  const sortable = useSortable({ id: sprint.code });
  return (
    <div
      ref={sortable.setNodeRef}
      style={{
        transform: CSS.Transform.toString(sortable.transform),
        transition: sortable.transition,
      }}
      {...sortable.attributes}
    >
      <SprintCard sprint={sprint} {...props} dragProps={{ ...sortable.listeners }} />
    </div>
  );
}

export function KanbanPage() {
  const {
    sprints,
    createSprint,
    updateSprint,
    moveSprint,
    reorderSprint,
    createTask,
    updateTask,
    moveTask,
    deleteTask,
    auditLogs,
  } = useSprints();

  const [selected, setSelected] = useState<{
    code: string;
    tab?: 'summary' | 'tasks' | 'history' | 'featured';
  } | null>(null);
  const [creating, setCreating] = useState(false);
  const [query, setQuery] = useState('');
  const [projectFilter, setProjectFilter] = useState('');
  const [laneFilter, setLaneFilter] = useState<'' | Lane>('');
  const [poFilter, setPoFilter] = useState('');
  const [managerFilter, setManagerFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [labelFilter, setLabelFilter] = useState('');
  const [showMore, setShowMore] = useState(false);
  const [view, setView] = useState<'kanban' | 'lista'>('kanban');
  const [active, setActive] = useState<Sprint | null>(null);
  const boardRef = useRef<HTMLDivElement>(null);
  const horizontalScrollRef = useRef<HTMLDivElement>(null);
  const [boardScrollSize, setBoardScrollSize] = useState({ content: 0, viewport: 0 });

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 7 } }),
    useSensor(KeyboardSensor)
  );

  const projects = useMemo(
    () => [...new Set(sprints.map(sprintSystem))].sort((a, b) => a.localeCompare(b, 'pt-BR')),
    [sprints]
  );

  const values = (items: Array<string | undefined>) =>
    [...new Set(items.filter(Boolean) as string[])].sort((a, b) => a.localeCompare(b, 'pt-BR'));

  const activeSecondaryFilterCount = [
    poFilter,
    priorityFilter,
    labelFilter,
    laneFilter,
  ].filter(Boolean).length;

  const filtered = useMemo(
    () =>
      filterSprints(sprints, {
        query,
        project: projectFilter || undefined,
        lane: laneFilter || undefined,
      }).filter(
        (sprint) =>
          (!poFilter || sprint.po === poFilter) &&
          (!managerFilter ||
            (sprint.projectManager || sprint.manager) === managerFilter) &&
          (!priorityFilter || sprint.priorityLevel === priorityFilter) &&
          (!labelFilter || sprint.labels?.includes(labelFilter))
      ),
    [
      sprints,
      query,
      projectFilter,
      laneFilter,
      poFilter,
      managerFilter,
      priorityFilter,
      labelFilter,
    ]
  );

  const current = selected ? sprints.find((sprint) => sprint.code === selected.code) || null : null;
  const byLane = (lane: Lane) =>
    filtered
      .filter((sprint) => sprint.lane === lane)
      .sort((left, right) => (left.position ?? 0) - (right.position ?? 0));

  const openTasks = (sprint: Sprint) => setSelected({ code: sprint.code, tab: 'tasks' });
  const edit = (sprint: Sprint) => setSelected({ code: sprint.code, tab: 'summary' });
  const move = (sprint: Sprint, lane: Lane) => moveSprint(sprint.code, lane);

  const handleDragEnd = ({ active: dragActive, over }: DragEndEvent) => {
    setActive(null);
    if (!over) return;
    const item = sprints.find((sprint) => sprint.code === dragActive.id);
    if (!item) return;
    const target = String(over.id);
    const overSprint = sprints.find((sprint) => sprint.code === target);
    const targetLane = target.startsWith('lane:')
      ? (target.slice(5) as Lane)
      : overSprint?.lane;
    if (!targetLane) return;
    if (item.lane !== targetLane) moveSprint(item.code, targetLane);
    reorderSprint(item.code, overSprint?.code, targetLane);
  };

  const handleResetFilters = () => {
    setQuery('');
    setProjectFilter('');
    setLaneFilter('');
    setPoFilter('');
    setManagerFilter('');
    setPriorityFilter('');
    setLabelFilter('');
  };

  useEffect(() => {
    if (view !== 'kanban') return undefined;
    const board = boardRef.current;
    if (!board) return undefined;

    const syncSize = () => {
      setBoardScrollSize({ content: board.scrollWidth, viewport: board.clientWidth });
      if (horizontalScrollRef.current) horizontalScrollRef.current.scrollLeft = board.scrollLeft;
    };

    const syncFromBoard = () => {
      if (horizontalScrollRef.current) horizontalScrollRef.current.scrollLeft = board.scrollLeft;
    };

    const observer = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(syncSize) : null;
    observer?.observe(board);
    window.addEventListener('resize', syncSize);
    board.addEventListener('scroll', syncFromBoard, { passive: true });
    syncSize();

    return () => {
      observer?.disconnect();
      window.removeEventListener('resize', syncSize);
      board.removeEventListener('scroll', syncFromBoard);
    };
  }, [view, filtered.length]);

  const handleFixedScrollbarScroll = () => {
    const board = boardRef.current;
    const scrollbar = horizontalScrollRef.current;
    if (board && scrollbar) board.scrollLeft = scrollbar.scrollLeft;
  };

  return (
    <>
      {/* Modernized MUI Controls Toolbar */}
      <Paper
        elevation={0}
        sx={{
          p: '10px 24px',
          borderBottom: '1px solid #e4e7ec',
          background: '#ffffff',
          display: 'flex',
          alignItems: 'center',
          gap: 1.5,
          flexWrap: 'wrap',
        }}
      >
        <TextField
          size="small"
          placeholder="Buscar sistema, Sprint ou objetivo"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          sx={{ minWidth: 260, flex: { xs: '1 1 100%', md: '0 1 340px' } }}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <Search size={15} color="#94a3b8" />
                </InputAdornment>
              ),
              endAdornment: query ? (
                <InputAdornment position="end">
                  <IconButton size="small" onClick={() => setQuery('')}>
                    <X size={13} />
                  </IconButton>
                </InputAdornment>
              ) : null,
            },
          }}
        />

        <TextField
          select
          size="small"
          value={projectFilter}
          onChange={(e) => setProjectFilter(e.target.value)}
          sx={{ minWidth: 160 }}
        >
          <MenuItem value="">Todos os Projetos</MenuItem>
          {projects.map((project) => (
            <MenuItem key={project} value={project}>
              {project}
            </MenuItem>
          ))}
        </TextField>

        <TextField
          select
          size="small"
          value={managerFilter}
          onChange={(e) => setManagerFilter(e.target.value)}
          sx={{ minWidth: 160 }}
        >
          <MenuItem value="">Todos os Gerentes</MenuItem>
          {values(sprints.map((s) => s.projectManager || s.manager)).map((item) => (
            <MenuItem key={item} value={item}>
              {item}
            </MenuItem>
          ))}
        </TextField>

        <Badge badgeContent={activeSecondaryFilterCount} color="primary">
          <Button
            variant={showMore || activeSecondaryFilterCount > 0 ? 'contained' : 'outlined'}
            color={showMore || activeSecondaryFilterCount > 0 ? 'primary' : 'inherit'}
            size="small"
            startIcon={<Filter size={14} />}
            onClick={() => setShowMore((v) => !v)}
            sx={{ height: 38 }}
          >
            Filtros
          </Button>
        </Badge>

        <Box sx={{ flex: 1 }} />

        {/* Grupo de Ações: Seleção de Visualização + Botão Nova */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, ml: { xs: 0, md: 'auto' }, flexShrink: 0 }}>
          <ToggleButtonGroup
            value={view}
            exclusive
            size="small"
            onChange={(_, nextView) => nextView && setView(nextView)}
            sx={{ height: 36, bgcolor: '#ffffff' }}
          >
            <ToggleButton value="kanban" sx={{ px: 1.5, gap: 0.5, fontWeight: 600 }}>
              <LayoutGrid size={13} />
              Kanban
            </ToggleButton>
            <ToggleButton value="lista" sx={{ px: 1.5, gap: 0.5, fontWeight: 600 }}>
              <List size={13} />
              Lista
            </ToggleButton>
          </ToggleButtonGroup>

          <Button
            variant="contained"
            size="small"
            startIcon={<Plus size={15} />}
            onClick={() => setCreating(true)}
            sx={{ height: 36, px: 2, fontWeight: 700, borderRadius: 1.5 }}
          >
            Nova
          </Button>
        </Box>
      </Paper>

      {/* Expanded Filter Panel */}
      {showMore && (
        <Paper
          elevation={0}
          sx={{
            p: '10px 24px',
            background: '#f8fafc',
            borderBottom: '1px solid #e4e7ec',
            display: 'flex',
            alignItems: 'center',
            gap: 1.5,
            flexWrap: 'wrap',
          }}
        >
          <TextField
            select
            size="small"
            label="Product Owner"
            value={poFilter}
            onChange={(e) => setPoFilter(e.target.value)}
            sx={{ minWidth: 160 }}
          >
            <MenuItem value="">Todos os POs</MenuItem>
            {values(sprints.map((s) => s.po)).map((item) => (
              <MenuItem key={item} value={item}>
                {item}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            select
            size="small"
            label="Prioridade"
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            sx={{ minWidth: 140 }}
          >
            <MenuItem value="">Todas as Prioridades</MenuItem>
            {values(sprints.map((s) => s.priorityLevel)).map((item) => (
              <MenuItem key={item} value={item}>
                {item}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            select
            size="small"
            label="Etiqueta"
            value={labelFilter}
            onChange={(e) => setLabelFilter(e.target.value)}
            sx={{ minWidth: 140 }}
          >
            <MenuItem value="">Todas as Etiquetas</MenuItem>
            {values(sprints.flatMap((s) => s.labels || [])).map((item) => (
              <MenuItem key={item} value={item}>
                {item}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            select
            size="small"
            label="Situação"
            value={laneFilter}
            onChange={(e) => setLaneFilter(e.target.value as '' | Lane)}
            sx={{ minWidth: 160 }}
          >
            <MenuItem value="">Todas as Situações</MenuItem>
            {LANES.map((lane) => (
              <MenuItem key={lane.id} value={lane.id}>
                {lane.label}
              </MenuItem>
            ))}
          </TextField>

          {activeSecondaryFilterCount > 0 && (
            <Button
              variant="text"
              color="inherit"
              size="small"
              startIcon={<RotateCcw size={13} />}
              onClick={handleResetFilters}
            >
              Limpar filtros
            </Button>
          )}
        </Paper>
      )}

      {/* Main Board */}
      {view === 'kanban' ? (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={({ active: dragActive }: DragStartEvent) =>
            setActive(sprints.find((sprint) => sprint.code === dragActive.id) || null)
          }
          onDragEnd={handleDragEnd}
          onDragCancel={() => setActive(null)}
        >
          <div ref={boardRef} className="react-board react-board--clean">
            {LANES.map((lane) => {
              const laneSprints = byLane(lane.id);
              return (
                <section className="react-lane react-lane--clean" key={lane.id}>
                  <header>
                    <div>
                      <span className="react-lane-dot" />
                      <b>{lane.label}</b>
                    </div>
                    <span>{laneSprints.length}</span>
                  </header>
                  <LaneDrop lane={lane.id}>
                    <SortableContext
                      items={laneSprints.map((sprint) => sprint.code)}
                      strategy={verticalListSortingStrategy}
                    >
                      {laneSprints.map((sprint) => (
                        <SortableCard
                          key={sprint.code}
                          sprint={sprint}
                          onOpen={openTasks}
                          onEdit={edit}
                          onToggleFeatured={(item) =>
                            updateSprint(item.code, {
                              isFeatured: !item.isFeatured,
                            })
                          }
                          onMove={move}
                        />
                      ))}
                    </SortableContext>
                    {!laneSprints.length && (
                      <small className="react-lane-empty">
                        Nenhuma Sprint nesta situação
                      </small>
                    )}
                  </LaneDrop>
                </section>
              );
            })}
          </div>

          <div className="react-board-help">
            Enter abre as Tasks · Alt + ←/→ move a Sprint entre raias
          </div>

          {boardScrollSize.content > boardScrollSize.viewport && (
            <div
              ref={horizontalScrollRef}
              className="react-board-scrollbar"
              onScroll={handleFixedScrollbarScroll}
              role="region"
              aria-label="Rolagem horizontal das raias"
            >
              <div style={{ width: boardScrollSize.content, height: 1 }} />
            </div>
          )}

          <DragOverlay>
            {active ? <SprintCard sprint={active} onOpen={() => undefined} /> : null}
          </DragOverlay>
        </DndContext>
      ) : (
        <SprintListView
          sprints={filtered}
          onOpenSprint={(sprint) => setSelected({ code: sprint.code, tab: 'summary' })}
          onUpdateSprint={updateSprint}
          onCreateTask={createTask}
          onUpdateTask={updateTask}
          onMoveTask={moveTask}
          onDeleteTask={deleteTask}
        />
      )}

      {/* Creation Modal with MUI Dialog */}
      <Dialog
        open={creating}
        onClose={() => setCreating(false)}
        maxWidth="sm"
        fullWidth
        slotProps={{
          backdrop: {
            style: {
              backgroundColor: 'rgba(15, 23, 42, 0.45)',
              backdropFilter: 'blur(4px)',
            },
          },
        }}
      >
        <DialogContent sx={{ p: { xs: 2.5, sm: 3.5 }, position: 'relative' }}>
          <IconButton
            aria-label="Fechar"
            onClick={() => setCreating(false)}
            sx={{
              position: 'absolute',
              right: 14,
              top: 14,
              color: 'text.secondary',
            }}
          >
            <X size={18} />
          </IconButton>

          <NewSprintEditor
            systems={projects}
            onCancel={() => setCreating(false)}
            onSave={(sprint) => {
              createSprint(sprint);
              setCreating(false);
            }}
          />
        </DialogContent>
      </Dialog>

      {/* Details Modal */}
      {current && (
        <SprintDetailsModal
          sprint={current}
          initialTab={selected?.tab}
          onClose={() => setSelected(null)}
          onUpdate={(changes) => updateSprint(current.code, changes)}
          onCreateTask={createTask}
          onUpdateTask={updateTask}
          onMoveTask={moveTask}
          onDeleteTask={deleteTask}
          auditLogs={auditLogs(current.code)}
        />
      )}
    </>
  );
}
