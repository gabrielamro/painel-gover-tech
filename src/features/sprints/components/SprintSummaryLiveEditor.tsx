import { useState, useEffect, useRef } from 'react';
import { Box, Typography, Paper, TextField, Chip } from '@mui/material';
import { Check, Clock, AlertCircle } from 'lucide-react';
import type { Sprint } from '../../../domain/sprint/model';

interface Props {
  sprint: Sprint;
  onUpdate: (changes: Partial<Sprint>) => void;
}

export function SprintSummaryLiveEditor({ sprint, onUpdate }: Props) {
  const [value, setValue] = useState(sprint.objective || '');
  const [status, setStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setValue(sprint.objective || '');
  }, [sprint.objective]);

  const handleSave = () => {
    const trimmed = value.trim();
    if (trimmed && trimmed !== sprint.objective) {
      setStatus('saving');
      try {
        onUpdate({ objective: trimmed });
        setStatus('saved');
        if (timerRef.current) clearTimeout(timerRef.current);
        timerRef.current = setTimeout(() => {
          setStatus('idle');
        }, 2500);
      } catch {
        setStatus('error');
      }
    } else if (!trimmed) {
      setValue(sprint.objective || '');
      setStatus('idle');
    } else {
      setStatus('idle');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      handleSave();
    } else if (e.key === 'Escape') {
      setValue(sprint.objective || '');
      setStatus('idle');
    }
  };

  const hasPendingChanges = value !== (sprint.objective || '');

  return (
    <Paper
      elevation={0}
      sx={{
        p: 1.8,
        borderRadius: 1.5,
        border: '1px solid #e2e8f0',
        bgcolor: '#ffffff',
        display: 'flex',
        flexDirection: 'column',
        gap: 1,
        flex: 1,
      }}
    >
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography
          variant="caption"
          sx={{
            fontWeight: 700,
            color: 'text.secondary',
            textTransform: 'uppercase',
            letterSpacing: '0.4px',
            fontSize: '0.6875rem',
          }}
        >
          RESUMO DA OS / ESCOPO OPERACIONAL
        </Typography>

        {/* Status de Salvamento */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
          {status === 'saving' && (
            <Chip
              icon={<Clock size={11} />}
              label="Salvando..."
              size="small"
              sx={{ height: 20, fontSize: '0.6875rem', bgcolor: '#eff6ff', color: '#1d4ed8' }}
            />
          )}
          {status === 'saved' && (
            <Chip
              icon={<Check size={11} />}
              label="Salvo ✓"
              size="small"
              sx={{ height: 20, fontSize: '0.6875rem', bgcolor: '#dcfce7', color: '#15803d', fontWeight: 700 }}
            />
          )}
          {status === 'error' && (
            <Chip
              icon={<AlertCircle size={11} />}
              label="Erro ao salvar"
              size="small"
              sx={{ height: 20, fontSize: '0.6875rem', bgcolor: '#fee2e2', color: '#b91c1c' }}
            />
          )}
          {hasPendingChanges && status === 'idle' && (
            <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.625rem' }}>
              Ctrl+Enter salva · Esc cancela
            </Typography>
          )}
        </Box>
      </Box>

      {/* Textarea que preenche o espaço vertical com elegância */}
      <TextField
        multiline
        minRows={4}
        maxRows={6}
        fullWidth
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onBlur={handleSave}
        onKeyDown={handleKeyDown}
        placeholder="Descreva o objetivo, impacto e detalhes principais da entrega..."
        sx={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          '& .MuiInputBase-root': {
            fontSize: '0.8125rem',
            lineHeight: 1.45,
            p: '10px 14px',
            color: 'text.primary',
            bgcolor: '#f8fafc',
            borderRadius: 1.2,
            flex: 1,
            alignItems: 'flex-start',
          },
          '& .MuiOutlinedInput-notchedOutline': {
            borderColor: hasPendingChanges ? '#3b82f6' : '#e2e8f0',
          },
        }}
      />
    </Paper>
  );
}
