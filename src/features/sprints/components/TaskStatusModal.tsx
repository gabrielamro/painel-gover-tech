import { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  Typography,
  Chip,
  Alert,
  CircularProgress,
} from '@mui/material';
import { ArrowRight, AlertTriangle, CheckCircle, Clock } from 'lucide-react';
import type { SprintTask, TaskStatus } from '../../../domain/sprint/model';

interface Props {
  open: boolean;
  task: SprintTask;
  targetStatus: TaskStatus;
  onClose: () => void;
  onConfirm: (note?: string, hoursLogged?: number) => void;
  loading?: boolean;
  errorMessage?: string | null;
}

export function TaskStatusModal({
  open,
  task,
  targetStatus,
  onClose,
  onConfirm,
  loading = false,
  errorMessage = null,
}: Props) {
  const [note, setNote] = useState('');
  const [hours, setHours] = useState<string>('0');

  if (!open) return null;

  const fromStatus = task.status;
  const isMovingToTest = targetStatus === 'Em Teste';
  const isReproval = targetStatus === 'Em Correção';
  const isApproval = targetStatus === 'Concluída';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    if (isReproval && !note.trim()) {
      return; // Motivo é obrigatório para reprovação
    }
    const hoursNum = parseFloat(hours) || 0;
    onConfirm(note.trim() || undefined, hoursNum > 0 ? hoursNum : undefined);
  };

  return (
    <Dialog
      open={open}
      onClose={() => {
        if (!loading) onClose();
      }}
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
      <form onSubmit={handleSubmit}>
        <DialogTitle component="div" sx={{ pb: 1, pt: 3, px: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1, flexWrap: 'wrap' }}>
            <Chip label={fromStatus} size="small" sx={{ fontWeight: 600 }} />
            <ArrowRight size={14} color="#64748b" />
            <Chip
              label={targetStatus}
              size="small"
              color={
                isApproval
                  ? 'success'
                  : isReproval
                  ? 'warning'
                  : isMovingToTest
                  ? 'secondary'
                  : 'primary'
              }
              sx={{ fontWeight: 700 }}
            />
          </Box>
          <Typography
            variant="h3"
            sx={{
              fontFamily: '"Space Grotesk", sans-serif',
              fontWeight: 700,
              color: 'text.primary',
              fontSize: '1.25rem',
              m: 0,
            }}
          >
            Confirmar movimentação
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.75, fontWeight: 500 }}>
            Deseja mover a Task <strong>{task.title}</strong> de <strong>{fromStatus}</strong> para <strong>{targetStatus}</strong>?
          </Typography>
        </DialogTitle>

        <DialogContent sx={{ p: 3, pt: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
          {errorMessage && (
            <Alert severity="error">
              {errorMessage}
            </Alert>
          )}

          {isReproval && (
            <Alert severity="warning" icon={<AlertTriangle size={18} />}>
              Ao mover para <strong>Em Correção</strong>, a métrica de retrabalho desta tarefa será incrementada (
              <strong>{(task.reworkCount || 0) + 1}x Retrabalho</strong>).
            </Alert>
          )}

          {isApproval && (
            <Alert severity="success" icon={<CheckCircle size={18} />}>
              A tarefa será marcada como entregue e calculada no progresso geral da Sprint.
            </Alert>
          )}

          {/* Horas lançadas nesta etapa */}
          {(isMovingToTest || isApproval) && (
            <TextField
              label={isMovingToTest ? 'Horas gastas no Desenvolvimento (h)' : 'Horas gastas no Teste / QA (h)'}
              type="number"
              value={hours}
              disabled={loading}
              onChange={(e) => setHours(e.target.value)}
              fullWidth
              slotProps={{
                htmlInput: { min: 0, step: 0.5 },
                input: {
                  startAdornment: <Clock size={16} color="#64748b" style={{ marginRight: 8 }} />,
                },
              }}
              helperText={
                isMovingToTest
                  ? `Previsto: ${task.estimatedDevHours || 0}h · Já realizado: ${task.realizedDevHours || 0}h`
                  : `Previsto: ${task.estimatedQaHours || 0}h · Já realizado: ${task.realizedQaHours || 0}h`
              }
            />
          )}

          {/* Parecer / Nota / Motivo */}
          <TextField
            label={
              isReproval
                ? 'Motivo da Reprovação e Bugs Encontrados (Obrigatório)'
                : isMovingToTest
                ? 'Nota de Entrega do Dev (PR, branch, escopo testável)'
                : 'Parecer / Observações'
            }
            placeholder={
              isReproval
                ? 'Ex: O cálculo do desconto falha quando há mais de 3 itens no carrinho...'
                : isMovingToTest
                ? 'Ex: Branch feature/auth-jwt concluída, PR #142 aberto para validação...'
                : 'Ex: Todos os cenários de teste foram validados com sucesso...'
            }
            required={isReproval}
            multiline
            rows={3}
            fullWidth
            disabled={loading}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            autoFocus
          />
        </DialogContent>

        <DialogActions sx={{ p: 3, pt: 1, gap: 1 }}>
          <Button variant="outlined" onClick={onClose} disabled={loading}>
            Cancelar
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={loading}
            color={
              isApproval
                ? 'success'
                : isReproval
                ? 'warning'
                : isMovingToTest
                ? 'secondary'
                : 'primary'
            }
            startIcon={
              loading ? (
                <CircularProgress size={14} color="inherit" />
              ) : isApproval ? (
                <CheckCircle size={14} />
              ) : undefined
            }
          >
            Confirmar movimentação
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
