import { useMemo, useState, type FormEvent } from 'react';
import {
  Box,
  Typography,
  Paper,
  TextField,
  MenuItem,
  Button,
  Snackbar,
  Alert,
  Slider,
} from '@mui/material';
import { Save, RefreshCw } from 'lucide-react';
import { useSprints } from '../../app/providers/SprintProvider';
import { LANES, type Lane } from '../../domain/sprint/model';
import { sprintSystem } from '../../domain/sprint/queries';

export function UpdatePage() {
  const { sprints, updateSprint } = useSprints();
  const [code, setCode] = useState(sprints[0]?.code || '');
  const selected = useMemo(() => sprints.find((item) => item.code === code), [sprints, code]);
  const [progress, setProgress] = useState(selected?.progress || 0);
  const [lane, setLane] = useState<Lane>(selected?.lane || 'planning');
  const [comment, setComment] = useState('');
  const [snackbarOpen, setSnackbarOpen] = useState(false);

  const choose = (value: string) => {
    const next = sprints.find((item) => item.code === value);
    setCode(value);
    setProgress(next?.progress || 0);
    setLane(next?.lane || 'planning');
  };

  const save = (event: FormEvent) => {
    event.preventDefault();
    if (!selected) return;
    updateSprint(selected.code, {
      progress: Math.max(0, Math.min(100, Number(progress) || 0)),
      lane,
      lastUpdated: new Date().toISOString(),
      updateComment: comment,
    });
    setComment('');
    setSnackbarOpen(true);
  };

  return (
    <Box sx={{ p: { xs: 2, sm: 3, md: 4 }, background: 'var(--bg, #f7f9fc)', minHeight: 'calc(100vh - 70px)' }}>
      <Paper sx={{ p: { xs: 2.5, sm: 3.5 }, maxWidth: 800, margin: '0 auto', borderRadius: 3, border: '1px solid #e2e8f0' }} elevation={0}>
        {selected ? (
          <form onSubmit={save}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
              {/* Seleção de Sprint */}
              <TextField
                select
                label="Selecione a Sprint / OS"
                fullWidth
                value={code}
                onChange={(e) => choose(e.target.value)}
              >
                {sprints.map((sprint) => (
                  <MenuItem key={sprint.code} value={sprint.code}>
                    {sprintSystem(sprint)} · Sprint {sprint.sprintNumber || '—'} · {sprint.serviceOrder || sprint.code} — {sprint.objective}
                  </MenuItem>
                ))}
              </TextField>

              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
                {/* Raia / Situação */}
                <TextField
                  select
                  label="Situação da Sprint"
                  fullWidth
                  value={lane}
                  onChange={(e) => setLane(e.target.value as Lane)}
                >
                  {LANES.map((item) => (
                    <MenuItem key={item.id} value={item.id}>
                      {item.label}
                    </MenuItem>
                  ))}
                </TextField>

                {/* Progresso Numérico */}
                <TextField
                  label="Progresso da Sprint (%)"
                  type="number"
                  fullWidth
                  value={progress}
                  onChange={(e) => setProgress(Math.max(0, Math.min(100, parseInt(e.target.value, 10) || 0)))}
                  slotProps={{ htmlInput: { min: 0, max: 100 } }}
                />
              </Box>

              {/* Slider de Progresso */}
              <Box sx={{ px: 1 }}>
                <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                  Ajuste Rápido de Progresso: {progress}%
                </Typography>
                <Slider
                  value={progress}
                  onChange={(_, val) => setProgress(val as number)}
                  min={0}
                  max={100}
                  valueLabelDisplay="auto"
                  sx={{ color: 'primary.main', mt: 1 }}
                />
              </Box>

              {/* Comentário da Atualização */}
              <TextField
                label="Comentário da Atualização"
                placeholder="Descreva o avanço técnico, impedimento identificado ou alinhamento com o cliente..."
                multiline
                rows={3}
                fullWidth
                value={comment}
                onChange={(e) => setComment(e.target.value)}
              />

              {/* Botão de Salvar */}
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1 }}>
                <Button
                  type="submit"
                  variant="contained"
                  size="large"
                  startIcon={<Save size={16} />}
                >
                  Salvar Atualização
                </Button>
              </Box>
            </Box>
          </form>
        ) : (
          <Typography variant="body2" sx={{ color: 'text.secondary', py: 4, textAlign: 'center' }}>
            Nenhuma Sprint disponível no momento para atualização.
          </Typography>
        )}
      </Paper>

      {/* Snackbar Feedback */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={4000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={() => setSnackbarOpen(false)} severity="success" sx={{ width: '100%' }}>
          Atualização da Sprint registrada com sucesso!
        </Alert>
      </Snackbar>
    </Box>
  );
}
