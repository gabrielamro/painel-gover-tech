import { useState, useEffect, useMemo, useRef } from 'react';
import {
  Dialog,
  DialogContent,
  TextField,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  Box,
  Chip,
  InputAdornment,
  Divider,
} from '@mui/material';
import {
  Search,
  LayoutDashboard,
  Building2,
  BookOpenCheck,
  BarChart3,
  Database,
  UsersRound,
  FileText,
  Command,
  ArrowRight,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useSprints } from '../../app/providers/SprintProvider';
import { sprintSystem } from '../../domain/sprint/queries';

const pages = [
  { label: 'Dashboard Gover', path: '/dashboard', icon: LayoutDashboard, group: 'Visão' },
  { label: 'Superintendência', path: '/superintendencia', icon: Building2, group: 'Visão' },
  { label: 'Kanban de Sprints', path: '/kanban', icon: BookOpenCheck, group: 'Operação' },
  { label: 'Previsão de PF Mês', path: '/pf-forecast', icon: BarChart3, group: 'Análise' },
  { label: 'Cadastros e Equipe', path: '/cadastros', icon: Database, group: 'Gestão' },
  { label: 'Acompanhamento dos Projetos', path: '/leader', icon: UsersRound, group: 'Gestão' },
];

export function CommandPalette() {
  const { sprints } = useSprints();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        setOpen((v) => !v);
      }
      if (event.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const normalized = query.trim().toLocaleLowerCase('pt-BR');

  const filteredPages = useMemo(() => {
    if (!normalized) return pages;
    return pages.filter(
      (p) =>
        p.label.toLocaleLowerCase('pt-BR').includes(normalized) ||
        p.group.toLocaleLowerCase('pt-BR').includes(normalized)
    );
  }, [normalized]);

  const matchedSprints = useMemo(() => {
    if (!normalized) return [];
    return sprints
      .filter((sprint) =>
        [
          sprintSystem(sprint),
          sprint.objective,
          sprint.serviceOrder,
          sprint.code,
          sprint.po,
          ...(sprint.taskItems || []).map((t) => t.title),
        ]
          .join(' ')
          .toLocaleLowerCase('pt-BR')
          .includes(normalized)
      )
      .slice(0, 5);
  }, [normalized, sprints]);

  const handleNavigate = (path: string) => {
    navigate(path);
    setOpen(false);
    setQuery('');
  };

  return (
    <>
      <button
        className="pp-command-trigger"
        onClick={() => setOpen(true)}
        aria-label="Abrir pesquisa rápida"
        type="button"
      >
        <Search size={15} />
        <span>Pesquisar…</span>
        <kbd>Ctrl K</kbd>
      </button>

      <Dialog
        open={open}
        onClose={() => setOpen(false)}
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
        <DialogContent sx={{ p: 2 }}>
          <TextField
            inputRef={inputRef}
            placeholder="Pesquisar Sprint, OS, Task, página ou responsável…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            fullWidth
            autoFocus
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <Search size={18} color="#2563eb" />
                  </InputAdornment>
                ),
              },
            }}
            sx={{
              mb: 1.5,
              '& .MuiOutlinedInput-root': {
                bgcolor: '#ffffff',
                fontSize: '0.9375rem',
              },
            }}
          />

          {/* Seção de Páginas */}
          {filteredPages.length > 0 && (
            <Box sx={{ mb: 1.5 }}>
              <Typography
                variant="caption"
                sx={{
                  fontWeight: 700,
                  color: 'text.secondary',
                  letterSpacing: '0.5px',
                  textTransform: 'uppercase',
                  px: 1,
                  display: 'block',
                  mb: 0.5,
                }}
              >
                Páginas do Sistema
              </Typography>
              <List disablePadding>
                {filteredPages.map((page) => {
                  const Icon = page.icon;
                  return (
                    <ListItemButton
                      key={page.path}
                      onClick={() => handleNavigate(page.path)}
                      sx={{
                        borderRadius: 1.5,
                        py: 0.8,
                        '&:hover': { bgcolor: '#eff6ff' },
                      }}
                    >
                      <ListItemIcon sx={{ minWidth: 32, color: 'primary.main' }}>
                        <Icon size={16} />
                      </ListItemIcon>
                      <ListItemText
                        primary={page.label}
                        slotProps={{ primary: { sx: { fontSize: '0.8125rem', fontWeight: 600 } } }}
                      />
                      <Chip label={page.group} size="small" sx={{ height: 18, fontSize: '0.625rem' }} />
                    </ListItemButton>
                  );
                })}
              </List>
            </Box>
          )}

          {/* Seção de Sprints Encontradas */}
          {normalized && (
            <Box sx={{ mb: 1 }}>
              <Divider sx={{ my: 1 }} />
              <Typography
                variant="caption"
                sx={{
                  fontWeight: 700,
                  color: 'text.secondary',
                  letterSpacing: '0.5px',
                  textTransform: 'uppercase',
                  px: 1,
                  display: 'block',
                  mb: 0.5,
                }}
              >
                Sprints & Ordens de Serviço
              </Typography>
              {matchedSprints.length > 0 ? (
                <List disablePadding>
                  {matchedSprints.map((sprint) => (
                    <ListItemButton
                      key={sprint.code}
                      onClick={() => handleNavigate('/kanban')}
                      sx={{
                        borderRadius: 1.5,
                        py: 0.8,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                        '&:hover': { bgcolor: '#eff6ff' },
                      }}
                    >
                      <ListItemIcon sx={{ minWidth: 30, color: 'text.secondary' }}>
                        <FileText size={16} />
                      </ListItemIcon>
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography
                          variant="body2"
                          sx={{ fontWeight: 700, color: 'text.primary', fontSize: '0.8125rem' }}
                        >
                          {sprintSystem(sprint)} · Sprint {sprint.sprintNumber || '—'}
                          <Typography
                            component="span"
                            variant="caption"
                            sx={{ ml: 1, color: 'text.secondary' }}
                          >
                            {sprint.serviceOrder || sprint.code}
                          </Typography>
                        </Typography>
                        <Typography
                          variant="caption"
                          sx={{
                            color: 'text.secondary',
                            display: '-webkit-box',
                            WebkitLineClamp: 1,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden',
                          }}
                        >
                          {sprint.objective}
                        </Typography>
                      </Box>
                      <ArrowRight size={14} color="#94a3b8" />
                    </ListItemButton>
                  ))}
                </List>
              ) : (
                <Typography variant="body2" sx={{ color: 'text.secondary', px: 1, py: 1 }}>
                  Nenhuma Sprint ou OS encontrada para &quot;{query}&quot;.
                </Typography>
              )}
            </Box>
          )}

          {/* Footer */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              pt: 1.5,
              mt: 1,
              borderTop: '1px solid #f1f5f9',
              color: 'text.secondary',
              fontSize: '0.6875rem',
            }}
          >
            <Command size={12} />
            <span>Use as setas para navegar, Enter para acessar, Esc para fechar</span>
          </Box>
        </DialogContent>
      </Dialog>
    </>
  );
}
