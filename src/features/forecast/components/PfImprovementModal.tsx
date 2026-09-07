import { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Button,
  IconButton,
  Box,
  Typography,
} from '@mui/material';
import { X, Sparkles } from 'lucide-react';

export interface PfImprovement {
  id: string;
  title: string;
  description: string;
  system?: string;
  serviceOrder?: string;
  owner: string;
  priority: string;
  dueDate?: string;
  status: string;
  resolved: boolean;
  createdAt: string;
  resolvedAt?: string | null;
  resolvedBy?: string | null;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onAddImprovement: (improvement: PfImprovement) => void;
  systems: string[];
  serviceOrders: { code: string; os?: string; system?: string }[];
}

export function PfImprovementModal({
  isOpen,
  onClose,
  onAddImprovement,
  systems,
  serviceOrders,
}: Props) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [system, setSystem] = useState('');
  const [serviceOrder, setServiceOrder] = useState('');
  const [owner, setOwner] = useState('Camila Pereira');
  const [priority, setPriority] = useState('Média');
  const [dueDate, setDueDate] = useState('');

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;

    const newImprovement: PfImprovement = {
      id: `IMP-${Date.now()}`,
      title: title.trim(),
      description: description.trim(),
      system: system || undefined,
      serviceOrder: serviceOrder || undefined,
      owner: owner.trim() || 'Camila Pereira',
      priority,
      dueDate: dueDate || undefined,
      status: 'A analisar',
      resolved: false,
      createdAt: new Date().toISOString(),
    };

    onAddImprovement(newImprovement);
    onClose();
  }

  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
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
      <Box sx={{ position: 'relative', p: { xs: 2, sm: 3 } }}>
        <IconButton
          aria-label="Fechar modal"
          onClick={onClose}
          sx={{
            position: 'absolute',
            right: 14,
            top: 14,
            color: 'text.secondary',
          }}
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
          NOVO PONTO DE MELHORIA
        </Typography>

        <DialogTitle
          sx={{
            p: 0,
            mb: 2,
            fontFamily: '"Space Grotesk", sans-serif',
            fontSize: '1.25rem',
            fontWeight: 700,
            color: 'text.primary',
          }}
        >
          Adicionar ponto de melhoria
        </DialogTitle>

        <form onSubmit={handleSubmit}>
          <DialogContent sx={{ p: 0, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              label="Título"
              required
              fullWidth
              placeholder="O que precisa ser melhorado?"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              autoFocus
            />

            <TextField
              label="Descrição"
              fullWidth
              multiline
              rows={3}
              placeholder="Contexto, resultado esperado e observações"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />

            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
              <TextField
                select
                label="Projeto / Sistema"
                fullWidth
                value={system}
                onChange={(e) => setSystem(e.target.value)}
              >
                <MenuItem value="">Portfólio geral</MenuItem>
                {systems.map((sys) => (
                  <MenuItem key={sys} value={sys}>
                    {sys}
                  </MenuItem>
                ))}
              </TextField>

              <TextField
                select
                label="Ordem de Serviço (OS)"
                fullWidth
                value={serviceOrder}
                onChange={(e) => setServiceOrder(e.target.value)}
              >
                <MenuItem value="">Não vinculada</MenuItem>
                {serviceOrders.map((so) => (
                  <MenuItem key={so.code} value={so.os || so.code}>
                    {so.os || so.code} · {so.system}
                  </MenuItem>
                ))}
              </TextField>
            </Box>

            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', sm: '1.2fr 1fr 1fr' },
                gap: 2,
              }}
            >
              <TextField
                label="Responsável"
                required
                fullWidth
                value={owner}
                onChange={(e) => setOwner(e.target.value)}
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

              <TextField
                label="Prazo"
                type="date"
                fullWidth
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                slotProps={{ inputLabel: { shrink: true } }}
              />
            </Box>
          </DialogContent>

          <DialogActions sx={{ p: 0, mt: 3, gap: 1 }}>
            <Button variant="outlined" onClick={onClose}>
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="contained"
              startIcon={<Sparkles size={14} />}
            >
              Adicionar melhoria
            </Button>
          </DialogActions>
        </form>
      </Box>
    </Dialog>
  );
}
