import { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Button,
  Box,
  Typography,
  Chip,
  IconButton,
  FormControlLabel,
  Switch,
  Autocomplete,
  Paper,
} from '@mui/material';
import { X, Plus, Trash2, Save, Sparkles, CheckSquare, Clock } from 'lucide-react';
import type {
  SprintTask,
  TaskAssignee,
  TaskChecklistItem,
  TaskStatus,
} from '../../../domain/sprint/model';
import type { TeamMember } from '../../../domain/registration/model';

interface Props {
  open: boolean;
  task: SprintTask | null;
  teamMembers: TeamMember[];
  onClose: () => void;
  onSave: (taskPayload: Partial<SprintTask>) => void;
}

export function TaskEditorModal({ open, task, teamMembers, onClose, onSave }: Props) {
  const [title, setTitle] = useState(task?.title || '');
  const [description, setDescription] = useState(task?.description || '');
  const [status, setStatus] = useState<TaskStatus>(task?.status || 'A Fazer');
  const [points, setPoints] = useState<number>(task?.points || 0);
  const [priority, setPriority] = useState<string>(task?.priority || 'Média');
  const [estimatedDevHours, setEstimatedDevHours] = useState<number>(task?.estimatedDevHours || 0);
  const [estimatedQaHours, setEstimatedQaHours] = useState<number>(task?.estimatedQaHours || 0);
  const [dueDate, setDueDate] = useState<string>(task?.dueDate || '');
  const [isBlocked, setIsBlocked] = useState<boolean>(Boolean(task?.isBlocked));
  const [blockerReason, setBlockerReason] = useState<string>(task?.blockerReason || '');

  // Multiple Assignees
  const [selectedAssignees, setSelectedAssignees] = useState<TaskAssignee[]>(() => {
    if (task?.assignees?.length) return task.assignees;
    if (task?.owner) {
      return [{ id: task.ownerId || task.owner, name: task.owner, role: task.ownerRole }];
    }
    return [];
  });

  // Checklist
  const [checklist, setChecklist] = useState<TaskChecklistItem[]>(task?.checklist || []);
  const [newChecklistText, setNewChecklistText] = useState('');

  if (!open) return null;

  const handleAddChecklistItem = () => {
    if (!newChecklistText.trim()) return;
    setChecklist((curr) => [
      ...curr,
      { id: `CHK-${Date.now()}`, text: newChecklistText.trim(), completed: false },
    ]);
    setNewChecklistText('');
  };

  const handleRemoveChecklistItem = (id: string) => {
    setChecklist((curr) => curr.filter((item) => item.id !== id));
  };

  const handleToggleAssignee = (member: TeamMember) => {
    const exists = selectedAssignees.some((a) => a.id === member.id || a.name === member.name);
    if (exists) {
      setSelectedAssignees((curr) => curr.filter((a) => a.id !== member.id && a.name !== member.name));
    } else {
      setSelectedAssignees((curr) => [
        ...curr,
        { id: member.id, name: member.name, role: member.role },
      ]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const payload: Partial<SprintTask> = {
      title: title.trim(),
      description: description.trim() || undefined,
      status,
      points: Number(points || 0),
      priority: priority as 'Baixa' | 'Média' | 'Alta' | 'Crítica',
      assignees: selectedAssignees,
      owner: selectedAssignees[0]?.name || undefined,
      ownerId: selectedAssignees[0]?.id || undefined,
      ownerRole: selectedAssignees[0]?.role || undefined,
      estimatedDevHours: Number(estimatedDevHours || 0),
      estimatedQaHours: Number(estimatedQaHours || 0),
      dueDate: dueDate || undefined,
      isBlocked,
      blockerReason: isBlocked ? blockerReason.trim() : undefined,
      checklist,
    };

    onSave(payload);
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
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
      <form onSubmit={handleSubmit}>
        <Box sx={{ p: { xs: 2.5, sm: 3.5 }, position: 'relative' }}>
          <IconButton
            aria-label="Fechar"
            onClick={onClose}
            sx={{ position: 'absolute', right: 14, top: 14, color: 'text.secondary' }}
          >
            <X size={18} />
          </IconButton>

          <Typography
            variant="caption"
            sx={{
              fontWeight: 700,
              color: 'text.secondary',
              letterSpacing: '0.5px',
              textTransform: 'uppercase',
              display: 'block',
              mb: 0.5,
            }}
          >
            {task ? 'EDITAR TAREFA' : 'NOVA TAREFA'}
          </Typography>

          <DialogTitle
            sx={{
              p: 0,
              mb: 1,
              fontFamily: '"Space Grotesk", sans-serif',
              fontSize: '1.35rem',
              fontWeight: 700,
              color: 'text.primary',
            }}
          >
            {task ? `Editar: ${task.title}` : 'Cadastrar Nova Tarefa na Sprint'}
          </DialogTitle>

          <DialogContent
            sx={{
              p: 0,
              pt: 1.5,
              display: 'flex',
              flexDirection: 'column',
              gap: 2.5,
              overflowY: 'auto',
              '& input::selection, & textarea::selection': {
                backgroundColor: '#2563eb',
                color: '#ffffff',
              },
            }}
          >
            {/* Título & Descrição */}
            <TextField
              label="Título da Tarefa"
              required
              fullWidth
              placeholder="Ex: Desenvolver endpoint de autenticação JWT / Validar fluxo de faturamento"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              autoFocus
            />

            <TextField
              label="Descrição Detalhada / Contexto Técnico"
              multiline
              rows={2}
              fullWidth
              placeholder="Detalhes sobre a implementação, regras de negócio ou referências..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />

            {/* Múltiplos Responsáveis (Devs & QAs) */}
            <Paper sx={{ p: 2, borderRadius: 2, border: '1px solid #e2e8f0' }} elevation={0}>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'text.primary', mb: 1 }}>
                Responsáveis Atribuídos (Devs / QAs)
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 1.5 }}>
                {teamMembers.map((member) => {
                  const isSelected = selectedAssignees.some(
                    (a) => a.id === member.id || a.name === member.name
                  );
                  const isQA = member.role?.includes('QA');

                  return (
                    <Chip
                      key={member.id}
                      label={`${member.name} (${member.role || 'Membro'})`}
                      onClick={() => handleToggleAssignee(member)}
                      variant={isSelected ? 'filled' : 'outlined'}
                      color={isSelected ? (isQA ? 'secondary' : 'primary') : 'default'}
                      size="small"
                      sx={{
                        cursor: 'pointer',
                        fontWeight: 600,
                      }}
                    />
                  );
                })}
              </Box>
              {selectedAssignees.length === 0 && (
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                  Clique nos membros acima para atribuí-los a esta tarefa.
                </Typography>
              )}
            </Paper>

            {/* Estimativa de Horas (Dev vs. QA) & Story Points */}
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr 1fr 1fr' },
                gap: 2,
              }}
            >
              <TextField
                label="Horas Estimadas (Dev)"
                type="number"
                fullWidth
                value={estimatedDevHours}
                onChange={(e) => setEstimatedDevHours(parseFloat(e.target.value) || 0)}
                slotProps={{
                  htmlInput: { min: 0, step: 0.5 },
                  input: {
                    startAdornment: (
                      <Clock size={15} color="#2563eb" style={{ marginRight: 6 }} />
                    ),
                  },
                }}
              />

              <TextField
                label="Horas Estimadas (QA)"
                type="number"
                fullWidth
                value={estimatedQaHours}
                onChange={(e) => setEstimatedQaHours(parseFloat(e.target.value) || 0)}
                slotProps={{
                  htmlInput: { min: 0, step: 0.5 },
                  input: {
                    startAdornment: (
                      <Clock size={15} color="#7c3aed" style={{ marginRight: 6 }} />
                    ),
                  },
                }}
              />

              <TextField
                label="Story Points"
                type="number"
                fullWidth
                value={points}
                onChange={(e) => setPoints(parseInt(e.target.value, 10) || 0)}
                slotProps={{ htmlInput: { min: 0 } }}
              />

              <TextField
                select
                label="Prioridade"
                fullWidth
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
              >
                <MenuItem value="Baixa">Baixa</MenuItem>
                <MenuItem value="Média">Média</MenuItem>
                <MenuItem value="Alta">Alta</MenuItem>
                <MenuItem value="Crítica">Crítica</MenuItem>
              </TextField>
            </Box>

            {/* Status & Prazo */}
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
              <TextField
                select
                label="Status da Tarefa"
                fullWidth
                value={status}
                onChange={(e) => setStatus(e.target.value as TaskStatus)}
              >
                <MenuItem value="A Fazer">A Fazer</MenuItem>
                <MenuItem value="Em Desenvolvimento">Em Desenvolvimento</MenuItem>
                <MenuItem value="Em Teste">Em Teste</MenuItem>
                <MenuItem value="Em Correção">Em Correção</MenuItem>
                <MenuItem value="Concluída">Concluída</MenuItem>
              </TextField>

              <TextField
                label="Prazo Previsto"
                type="date"
                fullWidth
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                slotProps={{ inputLabel: { shrink: true } }}
              />
            </Box>

            {/* Critérios de Aceite (Checklist) */}
            <Paper sx={{ p: 2, borderRadius: 2, border: '1px solid #e2e8f0' }} elevation={0}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                <CheckSquare size={16} color="#2563eb" />
                <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'text.primary' }}>
                  Critérios de Aceite (Definition of Done)
                </Typography>
              </Box>

              <Box sx={{ display: 'flex', gap: 1, mb: 1.5 }}>
                <TextField
                  size="small"
                  placeholder="Adicionar critério (ex: Testes unitários com 80% coverage)..."
                  fullWidth
                  value={newChecklistText}
                  onChange={(e) => setNewChecklistText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddChecklistItem();
                    }
                  }}
                />
                <Button
                  variant="outlined"
                  size="small"
                  onClick={handleAddChecklistItem}
                  startIcon={<Plus size={14} />}
                >
                  Adicionar
                </Button>
              </Box>

              {checklist.length > 0 ? (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                  {checklist.map((item) => (
                    <Box
                      key={item.id}
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        p: 0.8,
                        borderRadius: 1,
                        bgcolor: '#f8fafc',
                      }}
                    >
                      <Typography variant="body2" sx={{ color: 'text.primary' }}>
                        • {item.text}
                      </Typography>
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => handleRemoveChecklistItem(item.id)}
                      >
                        <Trash2 size={13} />
                      </IconButton>
                    </Box>
                  ))}
                </Box>
              ) : (
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                  Nenhum critério de aceite adicionado ainda.
                </Typography>
              )}
            </Paper>

            {/* Impedimento / Bloqueio */}
            <Paper sx={{ p: 2, borderRadius: 2, border: '1px solid #e2e8f0' }} elevation={0}>
              <FormControlLabel
                control={
                  <Switch
                    checked={isBlocked}
                    onChange={(e) => setIsBlocked(e.target.checked)}
                    color="error"
                  />
                }
                label="Marcar tarefa como Bloqueada (Impedimento)"
              />

              {isBlocked && (
                <TextField
                  label="Motivo do Impedimento"
                  placeholder="Ex: Aguardando liberação de credenciais pelo cliente..."
                  fullWidth
                  required={isBlocked}
                  value={blockerReason}
                  onChange={(e) => setBlockerReason(e.target.value)}
                  sx={{ mt: 1.5 }}
                />
              )}
            </Paper>
          </DialogContent>

          <DialogActions sx={{ p: 0, mt: 3, gap: 1 }}>
            <Button variant="outlined" onClick={onClose}>
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="contained"
              startIcon={task ? <Save size={14} /> : <Sparkles size={14} />}
            >
              {task ? 'Salvar Alterações' : 'Criar Tarefa'}
            </Button>
          </DialogActions>
        </Box>
      </form>
    </Dialog>
  );
}
