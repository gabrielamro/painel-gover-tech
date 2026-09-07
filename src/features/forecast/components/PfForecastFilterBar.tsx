import { RotateCcw, Search, X } from 'lucide-react';
import {
  Paper,
  Box,
  TextField,
  MenuItem,
  Button,
  IconButton,
  InputAdornment,
} from '@mui/material';
import { LANES } from '../../../domain/sprint/model';

export interface PfFilterState {
  project: string;
  os: string;
  po: string;
  manager: string;
  lane: string;
  query: string;
}

interface Props {
  filters: PfFilterState;
  onFilterChange: <K extends keyof PfFilterState>(key: K, value: PfFilterState[K]) => void;
  onResetFilters: () => void;
  projects: string[];
  serviceOrders: string[];
  pos: string[];
  managers: string[];
}

export function PfForecastFilterBar({
  filters,
  onFilterChange,
  onResetFilters,
  projects,
  serviceOrders,
  pos,
  managers,
}: Props) {
  const hasActiveFilters =
    filters.project !== 'all' ||
    filters.os !== 'all' ||
    filters.po !== 'all' ||
    filters.manager !== 'all' ||
    filters.lane !== 'all' ||
    filters.query.trim() !== '';

  return (
    <Paper
      elevation={0}
      sx={{
        p: '10px 18px',
        border: '1px solid #e2e8f0',
        borderRadius: 3,
        background: '#ffffff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 1.5,
        flexWrap: 'wrap',
      }}
      aria-label="Filtros da previsão de PF"
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap', flex: 1 }}>
        {/* Search Query */}
        <TextField
          size="small"
          placeholder="Buscar por OS, sistema ou objetivo…"
          value={filters.query}
          onChange={(e) => onFilterChange('query', e.target.value)}
          sx={{ minWidth: 240, flex: { xs: '1 1 100%', md: '0 1 280px' } }}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <Search size={14} color="#94a3b8" />
                </InputAdornment>
              ),
              endAdornment: filters.query ? (
                <InputAdornment position="end">
                  <IconButton size="small" onClick={() => onFilterChange('query', '')}>
                    <X size={13} />
                  </IconButton>
                </InputAdornment>
              ) : null,
            },
          }}
        />

        {/* Project/System Select */}
        <TextField
          select
          size="small"
          value={filters.project}
          onChange={(e) => onFilterChange('project', e.target.value)}
          sx={{ minWidth: 150 }}
        >
          <MenuItem value="all">Todos os projetos</MenuItem>
          {projects.map((item) => (
            <MenuItem key={item} value={item}>
              {item}
            </MenuItem>
          ))}
        </TextField>

        {/* OS Select */}
        <TextField
          select
          size="small"
          value={filters.os}
          onChange={(e) => onFilterChange('os', e.target.value)}
          sx={{ minWidth: 130 }}
        >
          <MenuItem value="all">Todas as OSs</MenuItem>
          {serviceOrders.map((item) => (
            <MenuItem key={item} value={item}>
              {item}
            </MenuItem>
          ))}
        </TextField>

        {/* PO Select */}
        <TextField
          select
          size="small"
          value={filters.po}
          onChange={(e) => onFilterChange('po', e.target.value)}
          sx={{ minWidth: 140 }}
        >
          <MenuItem value="all">Todos os POs</MenuItem>
          {pos.map((item) => (
            <MenuItem key={item} value={item}>
              {item}
            </MenuItem>
          ))}
        </TextField>

        {/* Manager Select */}
        {managers.length > 0 && (
          <TextField
            select
            size="small"
            value={filters.manager}
            onChange={(e) => onFilterChange('manager', e.target.value)}
            sx={{ minWidth: 150 }}
          >
            <MenuItem value="all">Todos os gerentes</MenuItem>
            {managers.map((item) => (
              <MenuItem key={item} value={item}>
                {item}
              </MenuItem>
            ))}
          </TextField>
        )}

        {/* Lane Select */}
        <TextField
          select
          size="small"
          value={filters.lane}
          onChange={(e) => onFilterChange('lane', e.target.value)}
          sx={{ minWidth: 150 }}
        >
          <MenuItem value="all">Todas as situações</MenuItem>
          {LANES.map((item) => (
            <MenuItem key={item.id} value={item.id}>
              {item.label}
            </MenuItem>
          ))}
        </TextField>
      </Box>

      {/* Reset Action */}
      {hasActiveFilters && (
        <Button
          variant="text"
          color="inherit"
          size="small"
          startIcon={<RotateCcw size={13} />}
          onClick={onResetFilters}
          sx={{ fontWeight: 600, color: 'text.secondary' }}
        >
          Limpar filtros
        </Button>
      )}
    </Paper>
  );
}
