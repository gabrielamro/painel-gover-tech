import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Chip,
  Paper,
  IconButton,
  Divider,
  Checkbox,
  LinearProgress,
} from '@mui/material';
import {
  X,
  Clock,
  Calendar,
  AlertTriangle,
  History,
  Pencil,
} from 'lucide-react';
import type { SprintTask } from '../../../domain/sprint/model';

interface Props {
  open: boolean;
  task: SprintTask | null;
  onClose: () => void;
  onEdit: (task: SprintTask) => void;
  onToggleChecklistItem: (taskId: string, itemId: string) => void;
}

export function TaskDetailDrawer({
  open,
  task,
  onClose,
  onEdit,
  onToggleChecklistItem,
}: Props) {
  if (!open || !task) return null;

  const totalEstimated = (task.estimatedDevHours || 0) + (task.estimatedQaHours || 0);
  const totalRealized = (task.realizedDevHours || 0) + (task.realizedQaHours || 0);
  const devProgress =
    task.estimatedDevHours && task.estimatedDevHours > 0
      ? Math.min(100, Math.round(((task.realizedDevHours || 0) / task.estimatedDevHours) * 100))
      : 0;
  const qaProgress =
    task.estimatedQaHours && task.estimatedQaHours > 0
      ? Math.min(100, Math.round(((task.realizedQaHours || 0) / task.estimatedQaHours) * 100))
      : 0;

  const completedChecklist = (task.checklist || []).filter((i) => i.completed).length;
  const totalChecklist = (task.checklist || []).length;

  const formatDate = (val?: string) => {
    if (!val) return 'Não informado';
    const parsed = new Date(val);
    return Number.isNaN(parsed.getTime())
      ? 'Não informado'
      : new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeStyle: 'short' }).format(parsed);
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
      <Box sx={{ p: { xs: 2.5, sm: 3.5 }, position: 'relative' }}>
        <IconButton
          aria-label="Fechar"
          onClick={onClose}
          sx={{ position: 'absolute', right: 14, top: 14, color: 'text.secondary' }}
        >
          <X size={18} />
        </IconButton>

        {/* Top Badges */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1, flexWrap: 'wrap' }}>
          <Chip
            label={task.status}
            color={
              task.status === 'Concluída'
                ? 'success'
                : task.status === 'Em Correção'
                ? 'warning'
                : task.status === 'Em Teste'
                ? 'secondary'
                : task.status === 'Em Desenvolvimento'
                ? 'primary'
                : 'default'
            }
            size="small"
            sx={{ fontWeight: 700 }}
          />

          {(task.reworkCount || 0) > 0 && (
            <Chip
              icon={<AlertTriangle size={12} />}
              label={`${task.reworkCount}x Retrabalho`}
              color="error"
              size="small"
              sx={{ fontWeight: 700 }}
            />
          )}

          {task.isBlocked && (
            <Chip
              label={`Bloqueada: ${task.blockerReason || 'Impedimento'}`}
              color="error"
              variant="outlined"
              size="small"
              sx={{ fontWeight: 700 }}
            />
          )}

          <Chip label={`${task.points || 0} Story Points`} size="small" variant="outlined" />
        </Box>

        {/* Task Title */}
        <DialogTitle sx={{ p: 0, mb: 1, fontFamily: '"Space Grotesk", sans-serif', fontWeight: 700 }}>
          {task.title}
        </DialogTitle>

        <DialogContent sx={{ p: 0, display: 'flex', flexDirection: 'column', gap: 2.5, mt: 2 }}>
          {/* Descrição */}
          {task.description && (
            <Paper sx={{ p: 2, borderRadius: 2, bgcolor: '#f8fafc', border: '1px solid #e2e8f0' }} elevation={0}>
              <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary', display: 'block', mb: 0.5 }}>
                DESCRIÇÃO DA TAREFA
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.primary', whiteSpace: 'pre-wrap' }}>
                {task.description}
              </Typography>
            </Paper>
          )}

          {/* Equipe Atribuída */}
          <Paper sx={{ p: 2, borderRadius: 2, border: '1px solid #e2e8f0' }} elevation={0}>
            <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary', display: 'block', mb: 1 }}>
              RESPONSÁVEIS ATRIBUÍDOS
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              {task.assignees?.length ? (
                task.assignees.map((member) => (
                  <Chip
                    key={member.id || member.name}
                    label={`${member.name} (${member.role || 'Membro'})`}
                    size="small"
                    sx={{
                      bgcolor: member.role?.includes('QA') ? '#fdf2f8' : '#eff6ff',
                      color: member.role?.includes('QA') ? '#be185d' : '#1d4ed8',
                      fontWeight: 600,
                    }}
                  />
                ))
              ) : task.owner ? (
                <Chip label={task.owner} size="small" />
              ) : (
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                  Nenhum membro atribuído
                </Typography>
              )}
            </Box>
          </Paper>

          {/* Horas & Esforço */}
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr 1fr' }, gap: 1.5 }}>
            <Paper sx={{ p: 2, borderRadius: 2, border: '1px solid #e2e8f0', bgcolor: '#f8fafc' }} elevation={0}>
              <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary', display: 'block' }}>
                DEV: REALIZADO / ESTIMADO
              </Typography>
              <Typography variant="h4" sx={{ my: 0.5, fontWeight: 700, color: 'primary.main' }}>
                {task.realizedDevHours || 0}h / {task.estimatedDevHours || 0}h
              </Typography>
              <LinearProgress variant="determinate" value={devProgress} sx={{ height: 6, borderRadius: 3 }} />
            </Paper>

            <Paper sx={{ p: 2, borderRadius: 2, border: '1px solid #e2e8f0', bgcolor: '#f8fafc' }} elevation={0}>
              <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary', display: 'block' }}>
                QA: REALIZADO / ESTIMADO
              </Typography>
              <Typography variant="h4" sx={{ my: 0.5, fontWeight: 700, color: 'secondary.main' }}>
                {task.realizedQaHours || 0}h / {task.estimatedQaHours || 0}h
              </Typography>
              <LinearProgress
                variant="determinate"
                value={qaProgress}
                color="secondary"
                sx={{ height: 6, borderRadius: 3 }}
              />
            </Paper>

            <Paper sx={{ p: 2, borderRadius: 2, border: '1px solid #e2e8f0', bgcolor: '#f8fafc' }} elevation={0}>
              <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary', display: 'block' }}>
                TOTAL DE HORAS GASTAS
              </Typography>
              <Typography variant="h4" sx={{ my: 0.5, fontWeight: 700, color: 'success.main' }}>
                {totalRealized}h / {totalEstimated}h
              </Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                Esforço total consolidado
              </Typography>
            </Paper>
          </Box>

          {/* Critérios de Aceite (Checklist) */}
          {totalChecklist > 0 && (
            <Paper sx={{ p: 2, borderRadius: 2, border: '1px solid #e2e8f0' }} elevation={0}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary' }}>
                  CRITÉRIOS DE ACEITE ({completedChecklist}/{totalChecklist})
                </Typography>
                <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.secondary' }}>
                  {Math.round((completedChecklist / totalChecklist) * 100)}% concluído
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                {(task.checklist || []).map((item) => (
                  <Box
                    key={item.id}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1,
                      p: 0.5,
                      borderRadius: 1,
                      cursor: 'pointer',
                      '&:hover': { bgcolor: '#f8fafc' },
                    }}
                    onClick={() => onToggleChecklistItem(task.id, item.id)}
                  >
                    <Checkbox size="small" checked={item.completed} sx={{ p: 0 }} />
                    <Typography
                      variant="body2"
                      sx={{
                        textDecoration: item.completed ? 'line-through' : 'none',
                        color: item.completed ? 'text.secondary' : 'text.primary',
                      }}
                    >
                      {item.text}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </Paper>
          )}

          {/* Feedbacks de Entrega & QA */}
          {(task.devFeedback || task.qaFeedback || task.rejectionReason) && (
            <Paper sx={{ p: 2, borderRadius: 2, border: '1px solid #e2e8f0' }} elevation={0}>
              <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary', display: 'block', mb: 1 }}>
                FEEDBACKS E PARECERES TÉCNICOS
              </Typography>

              {task.devFeedback && (
                <Box sx={{ mb: 1.5, p: 1.5, borderRadius: 1.5, bgcolor: '#eff6ff' }}>
                  <Typography variant="caption" sx={{ fontWeight: 700, color: 'primary.main', display: 'block' }}>
                    Nota de Entrega do Desenvolvedor:
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'text.primary', mt: 0.3 }}>
                    {task.devFeedback}
                  </Typography>
                </Box>
              )}

              {task.rejectionReason && (
                <Box sx={{ mb: 1.5, p: 1.5, borderRadius: 1.5, bgcolor: '#fffbeb' }}>
                  <Typography variant="caption" sx={{ fontWeight: 700, color: 'warning.dark', display: 'block' }}>
                    Motivo da Reprovação pelo QA:
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'text.primary', mt: 0.3 }}>
                    {task.rejectionReason}
                  </Typography>
                </Box>
              )}

              {task.qaFeedback && (
                <Box sx={{ p: 1.5, borderRadius: 1.5, bgcolor: '#f0fdf4' }}>
                  <Typography variant="caption" sx={{ fontWeight: 700, color: 'success.dark', display: 'block' }}>
                    Parecer Final do QA (Aceite):
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'text.primary', mt: 0.3 }}>
                    {task.qaFeedback}
                  </Typography>
                </Box>
              )}
            </Paper>
          )}

          {/* Linha do Tempo / Log de Auditoria da Task */}
          <Paper sx={{ p: 2, borderRadius: 2, border: '1px solid #e2e8f0' }} elevation={0}>
            <Typography
              variant="caption"
              sx={{ fontWeight: 700, color: 'text.secondary', display: 'flex', alignItems: 'center', gap: 0.5, mb: 1.5 }}
            >
              <History size={13} /> HISTÓRICO DE MOVIMENTAÇÕES & LOGS
            </Typography>

            {task.history?.length ? (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                {task.history.map((log) => (
                  <Box
                    key={log.id}
                    sx={{
                      p: 1.5,
                      borderRadius: 1.5,
                      bgcolor: '#f8fafc',
                      border: '1px solid #f1f5f9',
                    }}
                  >
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
                        <Chip
                          label={log.toStatus}
                          size="small"
                          sx={{ height: 18, fontSize: '0.625rem', fontWeight: 700 }}
                        />
                        {log.hoursLogged && (
                          <Chip
                            icon={<Clock size={10} />}
                            label={`+${log.hoursLogged}h`}
                            size="small"
                            color="primary"
                            variant="outlined"
                            sx={{ height: 18, fontSize: '0.625rem' }}
                          />
                        )}
                      </Box>
                      <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.6875rem' }}>
                        {formatDate(log.timestamp)}
                      </Typography>
                    </Box>
                    {log.note && (
                      <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5, fontSize: '0.75rem' }}>
                        &quot;{log.note}&quot; — <em>{log.user}</em>
                      </Typography>
                    )}
                  </Box>
                ))}
              </Box>
            ) : (
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                Criada em {formatDate(task.createdAt)}
              </Typography>
            )}
          </Paper>
        </DialogContent>

        <DialogActions sx={{ p: 0, mt: 3, gap: 1 }}>
          <Button
            variant="outlined"
            startIcon={<Pencil size={14} />}
            onClick={() => {
              onEdit(task);
              onClose();
            }}
          >
            Editar Tarefa
          </Button>
          <Button variant="contained" onClick={onClose}>
            Fechar
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
}
