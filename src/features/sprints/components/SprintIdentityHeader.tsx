import { useState, useEffect, useMemo } from 'react';
import {
  Box,
  TextField,
  MenuItem,
  Chip,
  Tooltip,
} from '@mui/material';
import type { Sprint, Lane } from '../../../domain/sprint/model';
import { LANES } from '../../../domain/sprint/model';
import { sprintSystem, systemColor } from '../../../domain/sprint/queries';
import { LocalStorageRegistrationRepository } from '../../../repositories/local-storage/LocalStorageRegistrationRepository';
import type { Project, ProjectModule } from '../../../domain/registration/model';

const PRIORITIES = ['Baixa', 'Média', 'Alta', 'Crítica'];

const DEFAULT_PROJECT_NAMES = [
  'SCIEX Importação',
  'SCIEX Exportação',
  'CADSUF',
  'SIMNAC WEB',
  'SIMNAC APP',
  'Sagat - Recepção',
  'Sagat- Analise RD',
  'SAC',
];

interface ProjectOption {
  label: string;
  system: string;
  module?: string;
  key: string;
}

interface Props {
  sprint: Sprint;
  onUpdate: (changes: Partial<Sprint>) => void;
}

function normalizeProjectPart(value?: string): string {
  return (value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9]+/g, ' ')
    .trim()
    .toLocaleLowerCase('pt-BR');
}

function optionMatchesSprint(option: ProjectOption, sprint: Sprint, displaySystem: string): boolean {
  const optionProject = normalizeProjectPart(option.system);
  const optionModule = normalizeProjectPart(option.module);
  const sprintProject = normalizeProjectPart(sprint.projectName);
  const sprintModule = normalizeProjectPart(sprint.module);
  const candidates = [sprint.projectName, sprint.system, displaySystem, sprint.project]
    .map(normalizeProjectPart)
    .filter(Boolean);

  if (option.module) {
    if (sprintProject && sprintModule) {
      return optionProject === sprintProject && optionModule === sprintModule;
    }
    return candidates.some((candidate) => candidate.includes(optionProject) && candidate.includes(optionModule));
  }

  if (sprintModule) return false;
  return candidates.some((candidate) => candidate === optionProject);
}

export function SprintIdentityHeader({ sprint, onUpdate }: Props) {
  const [title, setTitle] = useState(sprint.objective || '');
  const [sprintNum, setSprintNum] = useState(String(sprint.sprintNumber || '1'));

  useEffect(() => {
    setTitle(sprint.objective || '');
  }, [sprint.objective]);

  useEffect(() => {
    setSprintNum(String(sprint.sprintNumber || '1'));
  }, [sprint.sprintNumber]);

  const { projectOptions } = useMemo<{ projectOptions: ProjectOption[] }>(() => {
    try {
      const repo = new LocalStorageRegistrationRepository();
      const loadedProjects = repo.list<Project>('projects');
      const loadedModules = repo.list<ProjectModule>('modules');

      if (loadedProjects.length > 0) {
        const options: ProjectOption[] = [];
        loadedProjects.forEach((p) => {
          options.push({ label: p.name, system: p.name, key: `p-${p.id}` });
          const pModules = loadedModules.filter((m) => m.projectId === p.id);
          pModules.forEach((m) => {
            options.push({
              label: `${p.name} → ${m.name}`,
              system: p.name,
              module: m.name,
              key: `m-${m.id}`,
            });
          });
        });
        return { projectOptions: options };
      }
    } catch {
      // fallback
    }

    return {
      projectOptions: DEFAULT_PROJECT_NAMES.map((name) => ({
        label: name,
        system: name,
        module: undefined,
        key: name,
      })),
    };
  }, []);

  const currentSystem = sprintSystem(sprint);
  const color = systemColor(currentSystem);

  const handleTitleBlur = () => {
    if (title.trim() && title !== sprint.objective) {
      onUpdate({ objective: title.trim() });
    } else if (!title.trim()) {
      setTitle(sprint.objective || '');
    }
  };

  const handleSprintNumBlur = () => {
    const parsed = parseInt(sprintNum.replace(/\D/g, ''), 10);
    if (!Number.isNaN(parsed) && parsed > 0 && parsed !== sprint.sprintNumber) {
      onUpdate({ sprintNumber: parsed });
    } else {
      setSprintNum(String(sprint.sprintNumber || '1'));
    }
  };

  const handleProjectSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = projectOptions.find((opt) => opt.key === e.target.value);
    if (selected) {
      onUpdate({
        system: selected.system,
        project: selected.label,
        module: selected.module,
      });
    }
  };

  const currentKey =
    projectOptions.find((option) => optionMatchesSprint(option, sprint, currentSystem))?.key || '';

  return (
    <Box
      sx={{
        p: '10px 14px',
        bgcolor: '#f8fafc',
        borderRadius: 1.5,
        border: '1px solid #e2e8f0',
        display: 'flex',
        flexDirection: 'column',
        gap: 1,
      }}
    >
      {/* Linha 1: 5 Campos alinhados com espaçamento equilibrado */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr',
            sm: '1.2fr 2fr 85px 165px 120px',
          },
          gap: 1.2,
          alignItems: 'center',
        }}
      >
        {/* Projeto / Módulo */}
        <TextField
          select
          size="small"
          label="Projeto / Módulo"
          value={currentKey}
          onChange={handleProjectSelect}
          fullWidth
          slotProps={{ inputLabel: { shrink: true, sx: { fontSize: '0.75rem', fontWeight: 600 } } }}
          sx={{
            '& .MuiInputBase-root': {
              height: 36,
              fontSize: '0.8125rem',
              fontWeight: 600,
              bgcolor: '#ffffff',
            },
          }}
        >
          {!currentKey && (
            <MenuItem value="" disabled sx={{ fontSize: '0.8125rem', py: 0.8 }}>
              Selecione o projeto
            </MenuItem>
          )}
          {projectOptions.map((opt) => (
            <MenuItem key={opt.key} value={opt.key} sx={{ fontSize: '0.8125rem', py: 0.8 }}>
              {opt.label}
            </MenuItem>
          ))}
        </TextField>

        {/* Título da OS */}
        <Tooltip title="Título da OS (Pressione Enter ou clique fora para salvar)" arrow>
          <TextField
            size="small"
            label="Título da OS / Demanda"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onBlur={handleTitleBlur}
            onKeyDown={(e) => {
              if (e.key === 'Enter') e.currentTarget.blur();
            }}
            fullWidth
            slotProps={{ inputLabel: { shrink: true, sx: { fontSize: '0.75rem', fontWeight: 600 } } }}
            sx={{
              '& .MuiInputBase-root': {
                height: 36,
                fontSize: '0.875rem',
                fontWeight: 700,
                color: 'text.primary',
                bgcolor: '#ffffff',
              },
            }}
          />
        </Tooltip>

        {/* Sprint Nº */}
        <TextField
          size="small"
          label="Sprint Nº"
          type="text"
          value={sprintNum}
          onChange={(e) => setSprintNum(e.target.value.replace(/\D/g, ''))}
          onBlur={handleSprintNumBlur}
          onKeyDown={(e) => {
            if (e.key === 'Enter') e.currentTarget.blur();
          }}
          fullWidth
          slotProps={{ inputLabel: { shrink: true, sx: { fontSize: '0.75rem', fontWeight: 600 } } }}
          sx={{
            '& .MuiInputBase-root': {
              height: 36,
              fontSize: '0.875rem',
              fontWeight: 700,
              bgcolor: '#ffffff',
              textAlign: 'center',
            },
          }}
        />

        {/* Situação da Sprint */}
        <TextField
          select
          size="small"
          label="Situação da Sprint"
          value={sprint.lane}
          onChange={(e) => onUpdate({ lane: e.target.value as Lane })}
          fullWidth
          slotProps={{ inputLabel: { shrink: true, sx: { fontSize: '0.75rem', fontWeight: 600 } } }}
          sx={{
            '& .MuiInputBase-root': {
              height: 36,
              fontSize: '0.8125rem',
              fontWeight: 600,
              bgcolor: '#ffffff',
            },
          }}
        >
          {LANES.map((lane) => (
            <MenuItem key={lane.id} value={lane.id} sx={{ fontSize: '0.8125rem', py: 0.8 }}>
              {lane.label}
            </MenuItem>
          ))}
        </TextField>

        {/* Prioridade */}
        <TextField
          select
          size="small"
          label="Prioridade"
          value={sprint.priorityLevel || 'Média'}
          onChange={(e) => onUpdate({ priorityLevel: e.target.value })}
          fullWidth
          slotProps={{ inputLabel: { shrink: true, sx: { fontSize: '0.75rem', fontWeight: 600 } } }}
          sx={{
            '& .MuiInputBase-root': {
              height: 36,
              fontSize: '0.8125rem',
              fontWeight: 600,
              bgcolor: '#ffffff',
            },
          }}
        >
          {PRIORITIES.map((p) => (
            <MenuItem key={p} value={p} sx={{ fontSize: '0.8125rem', py: 0.8 }}>
              {p}
            </MenuItem>
          ))}
        </TextField>
      </Box>

      {/* Linha 2: Tags visuais discretas */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
        <Chip
          label={sprint.serviceOrder || sprint.code}
          size="small"
          sx={{
            bgcolor: '#0f172a',
            color: '#ffffff',
            fontWeight: 700,
            fontSize: '0.6875rem',
            height: 20,
          }}
        />
        <Chip
          label={currentSystem}
          size="small"
          sx={{
            bgcolor: `${color}15`,
            color,
            fontWeight: 700,
            fontSize: '0.6875rem',
            height: 20,
            border: `1px solid ${color}30`,
          }}
        />
        {sprint.module && (
          <Chip
            label={`Módulo: ${sprint.module}`}
            size="small"
            sx={{
              bgcolor: '#ffffff',
              color: '#475569',
              fontWeight: 600,
              fontSize: '0.6875rem',
              height: 20,
              border: '1px solid #e2e8f0',
            }}
          />
        )}
      </Box>
    </Box>
  );
}
