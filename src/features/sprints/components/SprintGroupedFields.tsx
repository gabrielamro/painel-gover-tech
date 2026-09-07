import { useEffect, useState, useMemo, useRef } from 'react';
import {
  Box,
  Typography,
  Paper,
  TextField,
  MenuItem,
  Chip,
  Tooltip,
  Autocomplete,
  InputAdornment,
  IconButton,
} from '@mui/material';
import {
  Calendar,
  Users,
  Receipt,
  Tag,
  Info,
  Lock,
} from 'lucide-react';
import type { Sprint } from '../../../domain/sprint/model';
import { LocalStorageRegistrationRepository } from '../../../repositories/local-storage/LocalStorageRegistrationRepository';
import type {
  ProductOwner,
  ProjectManager,
  CgticAnalyst,
  BusinessAnalyst,
  Label,
} from '../../../domain/registration/model';
import { SprintSummaryLiveEditor } from './SprintSummaryLiveEditor';

interface Props {
  sprint: Sprint;
  onUpdate: (changes: Partial<Sprint>) => void;
}

const DEFAULT_POS = ['Camila Pereira', 'Mariana Santos', 'Rodrigo Costa'];
const DEFAULT_MANAGERS = ['Mariana Santos', 'Carlos Eduardo', 'Juliana Ramos'];
const DEFAULT_CGTIC = ['Julio Maciel', 'Alexandre Silva', 'Patrícia Rocha'];
const DEFAULT_BUSINESS = ['Carla Dias', 'Fernando Gomes', 'Aline Vieira'];
const DEFAULT_LABELS = ['API', 'Frontend', 'Backend', 'Database', 'Segurança', 'Governança', 'Mobile'];

const MONTH_NAMES = [
  'Janeiro',
  'Fevereiro',
  'Março',
  'Abril',
  'Maio',
  'Junho',
  'Julho',
  'Agosto',
  'Setembro',
  'Outubro',
  'Novembro',
  'Dezembro',
];

function formatStoredDateForEditing(value?: string): string {
  if (!value || value === 'Não informado') return '';
  const isoMatch = value.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (isoMatch) return `${isoMatch[3]}/${isoMatch[2]}/${isoMatch[1]}`;
  return value;
}

function parseEditableDate(value: string): string | null {
  const trimmed = value.trim();
  if (!trimmed) return '';

  const isoMatch = trimmed.match(/^(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})$/);
  const localMatch = trimmed.match(/^(\d{1,2})[-/.](\d{1,2})[-/.](\d{4})$/);
  const parts = isoMatch
    ? { year: Number(isoMatch[1]), month: Number(isoMatch[2]), day: Number(isoMatch[3]) }
    : localMatch
      ? { year: Number(localMatch[3]), month: Number(localMatch[2]), day: Number(localMatch[1]) }
      : null;

  if (!parts) return null;
  const parsed = new Date(Date.UTC(parts.year, parts.month - 1, parts.day));
  if (
    parsed.getUTCFullYear() !== parts.year ||
    parsed.getUTCMonth() !== parts.month - 1 ||
    parsed.getUTCDate() !== parts.day
  ) return null;

  return `${String(parts.year).padStart(4, '0')}-${String(parts.month).padStart(2, '0')}-${String(parts.day).padStart(2, '0')}`;
}

export function SprintGroupedFields({ sprint, onUpdate }: Props) {
  // Carregar responsáveis e etiquetas dos cadastros
  const { pos, managers, cgticAnalysts, businessAnalysts, availableLabels } = useMemo(() => {
    try {
      const repo = new LocalStorageRegistrationRepository();
      const loadedPos = repo.list<ProductOwner>('pos').map((p) => p.name).filter(Boolean);
      const loadedMgrs = repo.list<ProjectManager>('managers').map((m) => m.name).filter(Boolean);
      const loadedCgtic = repo.list<CgticAnalyst>('cgticAnalysts').map((c) => c.name).filter(Boolean);
      const loadedBiz = repo.list<BusinessAnalyst>('businessAnalysts').map((b) => b.name).filter(Boolean);
      const loadedLabels = repo.list<Label>('labels').map((l) => l.name).filter(Boolean);

      return {
        pos: loadedPos.length ? loadedPos : DEFAULT_POS,
        managers: loadedMgrs.length ? loadedMgrs : DEFAULT_MANAGERS,
        cgticAnalysts: loadedCgtic.length ? loadedCgtic : DEFAULT_CGTIC,
        businessAnalysts: loadedBiz.length ? loadedBiz : DEFAULT_BUSINESS,
        availableLabels: loadedLabels.length ? loadedLabels : DEFAULT_LABELS,
      };
    } catch {
      return {
        pos: DEFAULT_POS,
        managers: DEFAULT_MANAGERS,
        cgticAnalysts: DEFAULT_CGTIC,
        businessAnalysts: DEFAULT_BUSINESS,
        availableLabels: DEFAULT_LABELS,
      };
    }
  }, []);

  const [startDate, setStartDate] = useState(formatStoredDateForEditing(sprint.start));
  const [endDate, setEndDate] = useState(formatStoredDateForEditing(sprint.end));
  const [startDateError, setStartDateError] = useState(false);
  const [endDateError, setEndDateError] = useState(false);
  const [forecastMonth, setForecastMonth] = useState(sprint.billingForecastMonth || '');
  const [estimatedPf, setEstimatedPf] = useState(String(sprint.functionPoints || '0'));
  const [detailedPf, setDetailedPf] = useState(String(sprint.detailedFunctionPoints || '0'));

  const hiddenStartRef = useRef<HTMLInputElement>(null);
  const hiddenEndRef = useRef<HTMLInputElement>(null);

  const openStartDatePicker = () => {
    if (hiddenStartRef.current) {
      if (typeof hiddenStartRef.current.showPicker === 'function') {
        hiddenStartRef.current.showPicker();
      } else {
        hiddenStartRef.current.focus();
      }
    }
  };

  const openEndDatePicker = () => {
    if (hiddenEndRef.current) {
      if (typeof hiddenEndRef.current.showPicker === 'function') {
        hiddenEndRef.current.showPicker();
      } else {
        hiddenEndRef.current.focus();
      }
    }
  };

  useEffect(() => {
    setStartDate(formatStoredDateForEditing(sprint.start));
    setEndDate(formatStoredDateForEditing(sprint.end));
    setStartDateError(false);
    setEndDateError(false);
    setForecastMonth(sprint.billingForecastMonth || '');
  }, [sprint.code, sprint.start, sprint.end, sprint.billingForecastMonth]);

  const forecastYear = Number(forecastMonth.slice(0, 4)) || new Date().getFullYear();
  const forecastOptions = MONTH_NAMES.map((label, index) => ({
    value: `${forecastYear}-${String(index + 1).padStart(2, '0')}`,
    label: `${label} de ${forecastYear}`,
  }));

  const commitDate = (
    value: string,
    field: 'start' | 'end',
    setError: (hasError: boolean) => void,
    setValue: (nextValue: string) => void
  ) => {
    const parsed = parseEditableDate(value);
    if (parsed === null) {
      setError(true);
      return;
    }
    setError(false);
    setValue(formatStoredDateForEditing(parsed));
    if (parsed !== (sprint[field] || '')) onUpdate({ [field]: parsed });
  };

  // Regra de Faturamento: PF Detalhado bloqueado fora de raias autorizadas
  const isDetailedPfAllowed =
    sprint.lane === 'billing' ||
    sprint.lane === 'approved' ||
    sprint.lane === 'completed';

  const formatAuditDate = (d?: string) => {
    if (!d) return 'Não registrado';
    const parsed = new Date(d);
    if (Number.isNaN(parsed.getTime())) return d;
    return new Intl.DateTimeFormat('pt-BR', {
      dateStyle: 'short',
      timeStyle: 'short',
    }).format(parsed);
  };

  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: { xs: '1fr', md: '0.95fr 1.05fr' },
        gap: 1.8,
        height: '100%',
        flex: 1,
        alignItems: 'stretch',
      }}
    >
      {/* COLUNA ESQUERDA: Resumo Vivo + Etiquetas + Auditoria */}
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          gap: 1.5,
          height: '100%',
          justifyContent: 'space-between',
        }}
      >
        {/* 1. Resumo Vivo da OS (Expande para preencher o topo) */}
        <SprintSummaryLiveEditor sprint={sprint} onUpdate={onUpdate} />

        {/* 2. Seletor de Etiquetas */}
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
          }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography
              variant="caption"
              sx={{
                fontWeight: 700,
                color: 'text.secondary',
                display: 'flex',
                alignItems: 'center',
                gap: 0.6,
                letterSpacing: '0.4px',
                fontSize: '0.6875rem',
              }}
            >
              <Tag size={13} /> ETIQUETAS DO PROJETO & TAGS
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.625rem' }}>
              Selecione as classificações da OS
            </Typography>
          </Box>

          <Autocomplete
            multiple
            size="small"
            options={availableLabels}
            value={sprint.labels || []}
            onChange={(_, newValue: string[]) => {
              onUpdate({ labels: newValue });
            }}
            renderInput={(params) => (
              <TextField
                {...params}
                placeholder={!sprint.labels?.length ? 'Selecione as etiquetas...' : ''}
                sx={{
                  '& .MuiInputBase-root': {
                    minHeight: 38,
                    fontSize: '0.8125rem',
                    p: '4px 8px',
                  },
                }}
              />
            )}
          />
        </Paper>

        {/* 3. Rodapé Discreto de Auditoria */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            px: 0.5,
            py: 0.2,
            color: 'text.secondary',
          }}
        >
          <Typography variant="caption" sx={{ fontSize: '0.6875rem', display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Info size={12} />
            Entrada na raia atual: <strong>{formatAuditDate(sprint.enteredLaneAt)}</strong>
          </Typography>

          <Typography variant="caption" sx={{ fontSize: '0.6875rem' }}>
            Última atualização: <strong>{formatAuditDate(sprint.lastUpdated)}</strong>
          </Typography>
        </Box>
      </Box>

      {/* COLUNA DIREITA: Planejamento/Faturamento + Responsáveis */}
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          gap: 1.5,
          height: '100%',
          justifyContent: 'space-between',
        }}
      >
        {/* GRUPO 1: CRONOGRAMA, PLANEJAMENTO & FATURAMENTO */}
        <Paper
          elevation={0}
          sx={{
            p: 2,
            borderRadius: 1.5,
            border: '1px solid #e2e8f0',
            bgcolor: '#ffffff',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            gap: 1.5,
            flex: 1,
          }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography
              variant="caption"
              sx={{
                fontWeight: 700,
                color: 'primary.main',
                display: 'flex',
                alignItems: 'center',
                gap: 0.6,
                letterSpacing: '0.4px',
                fontSize: '0.6875rem',
              }}
            >
              <Calendar size={13} /> CRONOGRAMA & PLANEJAMENTO
            </Typography>

            <Typography
              variant="caption"
              sx={{
                fontWeight: 700,
                color: '#15803d',
                display: 'flex',
                alignItems: 'center',
                gap: 0.6,
                letterSpacing: '0.4px',
                fontSize: '0.6875rem',
              }}
            >
              <Receipt size={13} /> FATURAMENTO & PONTO DE FUNÇÃO
            </Typography>
          </Box>

          {/* Linha 1: Datas de Ciclo & Previsão */}
          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 1.2 }}>
            <Box sx={{ position: 'relative' }}>
              <TextField
                size="small"
                label="Data de Início"
                type="text"
                value={startDate}
                onChange={(e) => {
                  setStartDate(e.target.value);
                  if (startDateError) setStartDateError(false);
                }}
                onBlur={() => commitDate(startDate, 'start', setStartDateError, setStartDate)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') e.currentTarget.blur();
                }}
                placeholder="dd/mm/aaaa"
                error={startDateError}
                helperText={startDateError ? 'Informe uma data válida' : undefined}
                slotProps={{
                  inputLabel: { shrink: true, sx: { fontSize: '0.75rem', fontWeight: 600 } },
                  htmlInput: { inputMode: 'numeric' },
                  input: {
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          size="small"
                          onClick={openStartDatePicker}
                          edge="end"
                          sx={{ p: 0.4, color: '#64748B' }}
                          title="Selecionar no calendário"
                          aria-label="Abrir calendário"
                        >
                          <Calendar size={15} />
                        </IconButton>
                      </InputAdornment>
                    ),
                  },
                }}
                sx={{ width: '100%', '& .MuiInputBase-root': { height: 38, fontSize: '0.8125rem' } }}
              />
              <input
                ref={hiddenStartRef}
                type="date"
                tabIndex={-1}
                value={parseEditableDate(startDate) || ''}
                style={{
                  position: 'absolute',
                  opacity: 0,
                  pointerEvents: 'none',
                  width: 0,
                  height: 0,
                  bottom: 0,
                  right: 0,
                }}
                onChange={(e) => {
                  if (!e.target.value) return;
                  const [y, m, d] = e.target.value.split('-');
                  const formatted = `${d}/${m}/${y}`;
                  setStartDate(formatted);
                  commitDate(formatted, 'start', setStartDateError, setStartDate);
                }}
              />
            </Box>

            <Box sx={{ position: 'relative' }}>
              <TextField
                size="small"
                label="Data de Fim"
                type="text"
                value={endDate}
                onChange={(e) => {
                  setEndDate(e.target.value);
                  if (endDateError) setEndDateError(false);
                }}
                onBlur={() => commitDate(endDate, 'end', setEndDateError, setEndDate)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') e.currentTarget.blur();
                }}
                placeholder="dd/mm/aaaa"
                error={endDateError}
                helperText={endDateError ? 'Informe uma data válida' : undefined}
                slotProps={{
                  inputLabel: { shrink: true, sx: { fontSize: '0.75rem', fontWeight: 600 } },
                  htmlInput: { inputMode: 'numeric' },
                  input: {
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          size="small"
                          onClick={openEndDatePicker}
                          edge="end"
                          sx={{ p: 0.4, color: '#64748B' }}
                          title="Selecionar no calendário"
                          aria-label="Abrir calendário"
                        >
                          <Calendar size={15} />
                        </IconButton>
                      </InputAdornment>
                    ),
                  },
                }}
                sx={{ width: '100%', '& .MuiInputBase-root': { height: 38, fontSize: '0.8125rem' } }}
              />
              <input
                ref={hiddenEndRef}
                type="date"
                tabIndex={-1}
                value={parseEditableDate(endDate) || ''}
                style={{
                  position: 'absolute',
                  opacity: 0,
                  pointerEvents: 'none',
                  width: 0,
                  height: 0,
                  bottom: 0,
                  right: 0,
                }}
                onChange={(e) => {
                  if (!e.target.value) return;
                  const [y, m, d] = e.target.value.split('-');
                  const formatted = `${d}/${m}/${y}`;
                  setEndDate(formatted);
                  commitDate(formatted, 'end', setEndDateError, setEndDate);
                }}
              />
            </Box>

            <TextField
              select
              size="small"
              label="Previsão Faturamento"
              value={forecastMonth}
              onChange={(e) => {
                setForecastMonth(e.target.value);
                onUpdate({ billingForecastMonth: e.target.value });
              }}
              slotProps={{ inputLabel: { shrink: true, sx: { fontSize: '0.75rem', fontWeight: 600 } } }}
              sx={{ '& .MuiInputBase-root': { height: 38, fontSize: '0.8125rem' } }}
            >
              <MenuItem value="" sx={{ fontSize: '0.8125rem' }}>Não informado</MenuItem>
              {forecastOptions.map((option) => (
                <MenuItem key={option.value} value={option.value} sx={{ fontSize: '0.8125rem' }}>
                  {option.label}
                </MenuItem>
              ))}
            </TextField>
          </Box>

          {/* Linha 2: PF Estimado, PF Detalhado e Estado de Medição */}
          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr 1fr', gap: 1.2, alignItems: 'center' }}>
            <TextField
              size="small"
              label="PF Estimado"
              type="number"
              value={estimatedPf}
              onChange={(e) => setEstimatedPf(e.target.value)}
              onBlur={() => {
                const val = parseFloat(estimatedPf);
                if (!Number.isNaN(val) && val !== sprint.functionPoints) {
                  onUpdate({ functionPoints: val });
                }
              }}
              slotProps={{ inputLabel: { shrink: true, sx: { fontSize: '0.75rem', fontWeight: 600 } } }}
              sx={{ '& .MuiInputBase-root': { height: 38, fontSize: '0.8125rem', fontWeight: 700 } }}
            />

            <Tooltip
              title={
                !isDetailedPfAllowed
                  ? 'O PF detalhado é desbloqueado nas raias de Homologação, Aprovação ou Faturamento'
                  : 'PF Detalhado para faturamento'
              }
              arrow
            >
              <TextField
                size="small"
                label={isDetailedPfAllowed ? 'PF Detalhado (Liberado)' : 'PF Detalhado (Bloqueado)'}
                type="number"
                disabled={!isDetailedPfAllowed}
                value={detailedPf}
                onChange={(e) => setDetailedPf(e.target.value)}
                onBlur={() => {
                  const val = parseFloat(detailedPf);
                  if (!Number.isNaN(val) && val !== sprint.detailedFunctionPoints) {
                    onUpdate({ detailedFunctionPoints: val });
                  }
                }}
                slotProps={{
                  inputLabel: { shrink: true, sx: { fontSize: '0.75rem', fontWeight: 600 } },
                  input: {
                    startAdornment: !isDetailedPfAllowed ? (
                      <Lock size={12} style={{ marginRight: 6, color: '#94a3b8' }} />
                    ) : undefined,
                  },
                }}
                sx={{
                  '& .MuiInputBase-root': {
                    height: 38,
                    fontSize: '0.8125rem',
                    fontWeight: 700,
                    bgcolor: !isDetailedPfAllowed ? '#f8fafc' : '#ffffff',
                  },
                }}
              />
            </Tooltip>

            {/* Fase de Medição */}
            <Box
              sx={{
                height: 38,
                px: 1.2,
                borderRadius: 1,
                bgcolor: isDetailedPfAllowed ? '#dcfce7' : '#f1f5f9',
                border: `1px solid ${isDetailedPfAllowed ? '#bbf7d0' : '#e2e8f0'}`,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.secondary', fontSize: '0.6875rem' }}>
                Fase:
              </Typography>
              <Chip
                label={
                  sprint.lane === 'completed'
                    ? 'Faturado'
                    : sprint.lane === 'billing'
                    ? 'Pronto'
                    : 'Em Prod.'
                }
                size="small"
                sx={{
                  height: 22,
                  fontSize: '0.6875rem',
                  fontWeight: 700,
                  bgcolor: isDetailedPfAllowed ? '#16a34a' : '#64748b',
                  color: '#ffffff',
                }}
              />
            </Box>
          </Box>
        </Paper>

        {/* GRUPO 2: EXECUÇÃO & RESPONSÁVEIS */}
        <Paper
          elevation={0}
          sx={{
            p: 2,
            borderRadius: 1.5,
            border: '1px solid #e2e8f0',
            bgcolor: '#ffffff',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            gap: 1.5,
            flex: 1,
          }}
        >
          <Typography
            variant="caption"
            sx={{
              fontWeight: 700,
              color: '#7c3aed',
              display: 'flex',
              alignItems: 'center',
              gap: 0.6,
              letterSpacing: '0.4px',
              fontSize: '0.6875rem',
            }}
          >
            <Users size={13} /> RESPONSÁVEIS & PAPÉIS
          </Typography>

          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.2 }}>
            <TextField
              select
              size="small"
              label="Product Owner (PO)"
              value={sprint.po || ''}
              onChange={(e) => onUpdate({ po: e.target.value })}
              slotProps={{ inputLabel: { shrink: true, sx: { fontSize: '0.75rem', fontWeight: 600 } } }}
              sx={{ '& .MuiInputBase-root': { height: 38, fontSize: '0.8125rem' } }}
            >
              <MenuItem value="" sx={{ fontSize: '0.8125rem', py: 0.8 }}>Não informado</MenuItem>
              {pos.map((p) => (
                <MenuItem key={p} value={p} sx={{ fontSize: '0.8125rem', py: 0.8 }}>
                  {p}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              select
              size="small"
              label="Gerente de Projeto"
              value={sprint.projectManager || sprint.manager || ''}
              onChange={(e) => onUpdate({ projectManager: e.target.value, manager: e.target.value })}
              slotProps={{ inputLabel: { shrink: true, sx: { fontSize: '0.75rem', fontWeight: 600 } } }}
              sx={{ '& .MuiInputBase-root': { height: 38, fontSize: '0.8125rem' } }}
            >
              <MenuItem value="" sx={{ fontSize: '0.8125rem', py: 0.8 }}>Não informado</MenuItem>
              {managers.map((m) => (
                <MenuItem key={m} value={m} sx={{ fontSize: '0.8125rem', py: 0.8 }}>
                  {m}
                </MenuItem>
              ))}
            </TextField>
          </Box>

          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.2 }}>
            <TextField
              select
              size="small"
              label="Analista CGTIC"
              value={sprint.technicalLead || ''}
              onChange={(e) => onUpdate({ technicalLead: e.target.value })}
              slotProps={{ inputLabel: { shrink: true, sx: { fontSize: '0.75rem', fontWeight: 600 } } }}
              sx={{ '& .MuiInputBase-root': { height: 38, fontSize: '0.8125rem' } }}
            >
              <MenuItem value="" sx={{ fontSize: '0.8125rem', py: 0.8 }}>Não informado</MenuItem>
              {cgticAnalysts.map((c) => (
                <MenuItem key={c} value={c} sx={{ fontSize: '0.8125rem', py: 0.8 }}>
                  {c}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              select
              size="small"
              label="Analista de Negócio"
              value={sprint.businessAnalyst || ''}
              onChange={(e) => onUpdate({ businessAnalyst: e.target.value })}
              slotProps={{ inputLabel: { shrink: true, sx: { fontSize: '0.75rem', fontWeight: 600 } } }}
              sx={{ '& .MuiInputBase-root': { height: 38, fontSize: '0.8125rem' } }}
            >
              <MenuItem value="" sx={{ fontSize: '0.8125rem', py: 0.8 }}>Não informado</MenuItem>
              {businessAnalysts.map((b) => (
                <MenuItem key={b} value={b} sx={{ fontSize: '0.8125rem', py: 0.8 }}>
                  {b}
                </MenuItem>
              ))}
            </TextField>
          </Box>
        </Paper>
      </Box>
    </Box>
  );
}
