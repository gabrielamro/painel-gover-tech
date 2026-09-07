import { useState } from 'react';
import {
  Box,
  Typography,
  TextField,
  MenuItem,
  Button,
} from '@mui/material';
import { Sparkles, Save } from 'lucide-react';
import { LANES, type Lane, type Sprint } from '../../../domain/sprint/model';

const priorities = ['Baixa', 'Média', 'Alta', 'Crítica'];

export function NewSprintEditor({
  systems,
  onCancel,
  onSave,
}: {
  systems: string[];
  onCancel: () => void;
  onSave: (sprint: Sprint) => void;
}) {
  const [form, setForm] = useState({
    system: systems[0] || '',
    sprintNumber: '1',
    serviceOrder: '',
    objective: '',
    lane: 'planning' as Lane,
    functionPoints: '0',
    priorityLevel: 'Média',
  });

  const update = (key: string, value: string) =>
    setForm((current) => ({ ...current, [key]: value }));

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        onSave({
          code: `SPR-${Date.now()}`,
          project: `${form.system} - Sprint ${form.sprintNumber}`,
          system: form.system,
          sprintNumber: Number(form.sprintNumber),
          serviceOrder: form.serviceOrder,
          objective: form.objective,
          lane: form.lane,
          progress: 0,
          expectedProgress: 70,
          health: 90,
          functionPoints: Number(form.functionPoints || 0),
          detailedFunctionPoints: 0,
          priorityLevel: form.priorityLevel,
          tasks: 0,
          blocked: 0,
          impediments: 0,
          risks: 0,
          deliveries: 0,
          labels: [],
          taskItems: [],
        });
      }}
    >
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
        NOVA SPRINT
      </Typography>
      <Typography
        variant="h2"
        sx={{
          fontFamily: '"Space Grotesk", sans-serif',
          fontWeight: 700,
          mb: 2.5,
          color: 'text.primary',
        }}
      >
        Adicionar ao Kanban
      </Typography>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
          <TextField
            select
            label="Sistema"
            required
            fullWidth
            value={form.system}
            onChange={(e) => update('system', e.target.value)}
          >
            {systems.map((system) => (
              <MenuItem key={system} value={system}>
                {system}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            label="Número da Sprint"
            type="number"
            required
            fullWidth
            value={form.sprintNumber}
            onChange={(e) => update('sprintNumber', e.target.value)}
            slotProps={{ htmlInput: { min: 1 } }}
          />
        </Box>

        <TextField
          label="Número da OS"
          placeholder="#OS15000"
          required
          fullWidth
          value={form.serviceOrder}
          onChange={(e) => update('serviceOrder', e.target.value)}
        />

        <TextField
          label="Objetivo"
          placeholder="Resultado que esta Sprint deve entregar"
          required
          fullWidth
          multiline
          rows={2}
          value={form.objective}
          onChange={(e) => update('objective', e.target.value)}
        />

        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
          <TextField
            label="PF estimado"
            type="number"
            fullWidth
            value={form.functionPoints}
            onChange={(e) => update('functionPoints', e.target.value)}
            slotProps={{ htmlInput: { min: 0, step: 0.01 } }}
          />

          <TextField
            select
            label="Prioridade"
            fullWidth
            value={form.priorityLevel}
            onChange={(e) => update('priorityLevel', e.target.value)}
          >
            {priorities.map((item) => (
              <MenuItem key={item} value={item}>
                {item}
              </MenuItem>
            ))}
          </TextField>
        </Box>

        <TextField
          select
          label="Raia inicial"
          fullWidth
          value={form.lane}
          onChange={(e) => update('lane', e.target.value)}
        >
          {LANES.map((lane) => (
            <MenuItem key={lane.id} value={lane.id}>
              {lane.label}
            </MenuItem>
          ))}
        </TextField>

        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, mt: 2 }}>
          <Button variant="outlined" onClick={onCancel}>
            Cancelar
          </Button>
          <Button type="submit" variant="contained" startIcon={<Sparkles size={14} />}>
            Criar Sprint
          </Button>
        </Box>
      </Box>
    </form>
  );
}

export function SprintEditor({
  sprint,
  onCancel,
  onSave,
}: {
  sprint: Sprint;
  onCancel: () => void;
  onSave: (changes: Partial<Sprint>) => void;
}) {
  const [form, setForm] = useState({
    serviceOrder: sprint.serviceOrder || '',
    objective: sprint.objective,
    functionPoints: String(sprint.functionPoints || 0),
    detailedFunctionPoints: String(sprint.detailedFunctionPoints || 0),
    billingForecastMonth: sprint.billingForecastMonth || '',
    lane: sprint.lane,
    priorityLevel: sprint.priorityLevel || 'Média',
    po: sprint.po || '',
    projectManager: sprint.projectManager || sprint.manager || '',
    technicalLead: sprint.technicalLead || '',
    businessAnalyst: sprint.businessAnalyst || '',
  });

  const update = (key: string, value: string) =>
    setForm((current) => ({ ...current, [key]: value }));

  const canSetDetailedPf = form.lane === 'billing' || form.lane === 'completed';

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        onSave({
          serviceOrder: form.serviceOrder,
          objective: form.objective,
          functionPoints: Number(form.functionPoints || 0),
          detailedFunctionPoints: canSetDetailedPf
            ? Number(form.detailedFunctionPoints || 0)
            : sprint.detailedFunctionPoints || 0,
          billingForecastMonth: form.billingForecastMonth,
          lane: form.lane as Lane,
          priorityLevel: form.priorityLevel,
          po: form.po,
          projectManager: form.projectManager,
          manager: form.projectManager,
          technicalLead: form.technicalLead,
          businessAnalyst: form.businessAnalyst,
        });
      }}
    >
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
        EDITAR SPRINT
      </Typography>
      <Typography
        variant="h2"
        sx={{
          fontFamily: '"Space Grotesk", sans-serif',
          fontWeight: 700,
          mb: 2.5,
          color: 'text.primary',
        }}
      >
        {sprint.code} · {sprint.serviceOrder || 'Sem OS'}
      </Typography>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <TextField
          label="Número da OS"
          required
          fullWidth
          value={form.serviceOrder}
          onChange={(e) => update('serviceOrder', e.target.value)}
        />

        <TextField
          label="Objetivo"
          required
          fullWidth
          multiline
          rows={2}
          value={form.objective}
          onChange={(e) => update('objective', e.target.value)}
        />

        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
          <TextField
            label="PF estimado"
            type="number"
            fullWidth
            value={form.functionPoints}
            onChange={(e) => update('functionPoints', e.target.value)}
            slotProps={{ htmlInput: { min: 0, step: 0.01 } }}
          />

          <TextField
            label="PF detalhado"
            type="number"
            disabled={!canSetDetailedPf}
            helperText={
              canSetDetailedPf
                ? 'Disponível para faturamento.'
                : 'Disponível ao aguardar faturamento.'
            }
            fullWidth
            value={form.detailedFunctionPoints}
            onChange={(e) => update('detailedFunctionPoints', e.target.value)}
            slotProps={{ htmlInput: { min: 0, step: 0.01 } }}
          />
        </Box>

        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
          <TextField
            select
            label="Raia"
            fullWidth
            value={form.lane}
            onChange={(e) => update('lane', e.target.value)}
          >
            {LANES.map((lane) => (
              <MenuItem key={lane.id} value={lane.id}>
                {lane.label}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            select
            label="Prioridade"
            fullWidth
            value={form.priorityLevel}
            onChange={(e) => update('priorityLevel', e.target.value)}
          >
            {priorities.map((item) => (
              <MenuItem key={item} value={item}>
                {item}
              </MenuItem>
            ))}
          </TextField>
        </Box>

        <TextField
          label="Mês previsto para faturamento"
          type="month"
          fullWidth
          value={form.billingForecastMonth}
          onChange={(e) => update('billingForecastMonth', e.target.value)}
          slotProps={{ inputLabel: { shrink: true } }}
        />

        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
          <TextField
            label="Product Owner (PO)"
            fullWidth
            value={form.po}
            onChange={(e) => update('po', e.target.value)}
          />

          <TextField
            label="Gerente de Projetos"
            fullWidth
            value={form.projectManager}
            onChange={(e) => update('projectManager', e.target.value)}
          />
        </Box>

        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
          <TextField
            label="Analista CGTIC"
            fullWidth
            value={form.technicalLead}
            onChange={(e) => update('technicalLead', e.target.value)}
          />

          <TextField
            label="Analista de Negócio"
            fullWidth
            value={form.businessAnalyst}
            onChange={(e) => update('businessAnalyst', e.target.value)}
          />
        </Box>

        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, mt: 2 }}>
          <Button variant="outlined" onClick={onCancel}>
            Cancelar
          </Button>
          <Button type="submit" variant="contained" startIcon={<Save size={14} />}>
            Salvar alterações
          </Button>
        </Box>
      </Box>
    </form>
  );
}
