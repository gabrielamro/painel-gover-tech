import { useState, type ComponentType, type MouseEvent } from 'react';
import {
  BarChart3,
  Bell,
  BookOpenCheck,
  Building2,
  Database,
  LayoutDashboard,
  Menu as MenuIcon,
  PanelLeftClose,
  PanelLeftOpen,
  RefreshCw,
  UsersRound,
  LogOut,
  User,
  Settings,
  Calendar,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  Zap,
} from 'lucide-react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import {
  Box,
  Typography,
  IconButton,
  Tooltip,
  Avatar,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Breadcrumbs,
  Badge,
} from '@mui/material';
import { CommandPalette } from './CommandPalette';
import { useForecastMonth } from '../../features/forecast/ForecastMonthContext';
import { PainelGoverLogo } from '../brand/PainelGoverLogo';

type NavigationItem = {
  path: string;
  label: string;
  group: string;
  icon: ComponentType<{ size?: number; strokeWidth?: number }>;
};

const items: NavigationItem[] = [
  { path: '/factory', label: 'Desempenho da Fábrica', group: 'Visão', icon: Zap },
  { path: '/executive', label: 'Desempenho Executivo & Contratos', group: 'Visão', icon: TrendingUp },
  { path: '/dashboard', label: 'Dashboard Gover', group: 'Visão', icon: LayoutDashboard },
  { path: '/superintendencia', label: 'Superintendência', group: 'Visão', icon: Building2 },
  { path: '/kanban', label: 'Kanban de Sprints', group: 'Operação', icon: BookOpenCheck },
  { path: '/pf-forecast', label: 'Previsão de PF Mês', group: 'Análise', icon: BarChart3 },
  { path: '/cadastros', label: 'Cadastros e Equipe', group: 'Gestão', icon: Database },
  { path: '/leader', label: 'Acompanhamento dos Projetos', group: 'Gestão', icon: UsersRound },
  { path: '/updates', label: 'Nova Atualização', group: 'Operação', icon: RefreshCw },
  { path: '/design-system', label: 'Design System', group: 'Sistema', icon: MenuIcon },
];

export function AppShell() {
  const location = useLocation();
  const { currentMonth, setCurrentMonth } = useForecastMonth();
  const [collapsed, setCollapsed] = useState(false);
  const [userMenuAnchor, setUserMenuAnchor] = useState<null | HTMLElement>(null);

  const active = items.find((item) => item.path === location.pathname);
  const isDesignSystem = location.pathname === '/design-system';
  const isSuperintendence = location.pathname === '/superintendencia';
  const groups = [...new Set(items.map((item) => item.group))];

  const handleOpenUserMenu = (event: MouseEvent<HTMLElement>) => {
    setUserMenuAnchor(event.currentTarget);
  };

  const handleCloseUserMenu = () => {
    setUserMenuAnchor(null);
  };

  const shiftMonth = (delta: number) => {
    const [year, month] = currentMonth.split('-').map(Number);
    const date = new Date(year, month - 1 + delta, 1);
    setCurrentMonth(`${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`);
  };

  const monthLabel = new Intl.DateTimeFormat('pt-BR', { month: 'long', year: 'numeric' }).format(
    new Date(`${currentMonth}-01T00:00:00`)
  );

  return (
    <div
      className={`pp-shell ${collapsed ? 'pp-shell--collapsed' : ''} ${
        isSuperintendence ? 'pp-shell--no-sidebar' : ''
      }`}
    >
      {/* Sidebar */}
      {!isSuperintendence && (
        <aside className="pp-sidebar">
        <div className="pp-sidebar__brand">
          <PainelGoverLogo variant="dark" collapsed={collapsed} />
          <Tooltip title={collapsed ? 'Expandir menu lateral' : 'Recolher menu lateral'} arrow>
            <IconButton
              size="small"
              onClick={() => setCollapsed((curr) => !curr)}
              aria-label={collapsed ? 'Expandir menu lateral' : 'Recolher menu lateral'}
              sx={{ color: '#64748b', ml: collapsed ? 0 : 'auto' }}
            >
              {collapsed ? <PanelLeftOpen size={16} /> : <PanelLeftClose size={16} />}
            </IconButton>
          </Tooltip>
        </div>

        <nav className="pp-sidebar__nav" aria-label="Navegação principal">
          {groups.map((group) => (
            <section key={group} className="pp-nav-group">
              <h2>{group}</h2>
              {items
                .filter((item) => item.group === group)
                .map((item) => {
                  const Icon = item.icon;
                  return (
                    <NavLink
                      key={item.path}
                      to={item.path}
                      className={({ isActive }) =>
                        `pp-nav-link ${isActive ? 'pp-nav-link--active' : ''}`
                      }
                      title={collapsed ? item.label : undefined}
                    >
                      <Icon size={16} strokeWidth={1.9} />
                      <span>{item.label}</span>
                    </NavLink>
                  );
                })}
            </section>
          ))}
        </nav>

        {/* Profile Footer */}
        <Box
          sx={{
            p: '12px 14px',
            borderTop: '1px solid #e4e7ec',
            display: 'flex',
            alignItems: 'center',
            gap: 1.5,
            cursor: 'pointer',
            transition: 'background-color 0.15s',
            '&:hover': { bgcolor: '#f8fafc' },
          }}
          onClick={handleOpenUserMenu}
        >
          <Avatar
            sx={{
              width: 32,
              height: 32,
              bgcolor: 'primary.main',
              fontSize: '0.75rem',
              fontWeight: 700,
            }}
          >
            CP
          </Avatar>
          {!collapsed && (
            <Box sx={{ minWidth: 0, flex: 1 }}>
              <Typography
                variant="body2"
                sx={{
                  fontWeight: 700,
                  color: 'text.primary',
                  lineHeight: 1.2,
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                Camila Pereira
              </Typography>
              <Typography
                variant="caption"
                sx={{
                  color: 'text.secondary',
                  fontSize: '0.6875rem',
                  display: 'block',
                }}
              >
                Gerente de Portfólio
              </Typography>
            </Box>
          )}
        </Box>
      </aside>
      )}

      {/* Main Content Area */}
      <main className="pp-main">
        {!isDesignSystem && !isSuperintendence && (
          <header className="pp-topbar">
            {/* Breadcrumb / Context */}
            <Box sx={{ display: 'flex', flexDirection: 'column' }}>
              <Breadcrumbs
                aria-label="breadcrumb"
                sx={{
                  fontSize: '0.6875rem',
                  '& .MuiBreadcrumbs-separator': { mx: 0.5, color: '#94a3b8' },
                }}
              >
                <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                  Painel Gover
                </Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                  {active?.group || 'Visão'}
                </Typography>
              </Breadcrumbs>
              <Typography
                variant="h1"
                sx={{
                  fontSize: '1.125rem',
                  fontWeight: 700,
                  color: 'text.primary',
                  lineHeight: 1.2,
                }}
                aria-current="page"
              >
                {active?.label || 'Painel Gover'}
              </Typography>
            </Box>

            {/* Actions */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              {location.pathname === '/pf-forecast' && (
                <div className="pp-monthbar__control" role="group" aria-label="Controle de competência mensal">
                  <button type="button" onClick={() => shiftMonth(-1)} aria-label="Mês anterior" title="Mês anterior">
                    <ChevronLeft size={15} />
                  </button>
                  <span>
                    <Calendar size={13} />
                    {monthLabel.charAt(0).toUpperCase() + monthLabel.slice(1)}
                  </span>
                  <button type="button" onClick={() => shiftMonth(1)} aria-label="Próximo mês" title="Próximo mês">
                    <ChevronRight size={15} />
                  </button>
                </div>
              )}
              <CommandPalette />

              <Tooltip title="Notificações do Sistema" arrow>
                <IconButton size="small" aria-label="Notificações" sx={{ color: '#64748b' }}>
                  <Badge color="primary" variant="dot">
                    <Bell size={17} />
                  </Badge>
                </IconButton>
              </Tooltip>

              <Tooltip title="Menu do Usuário" arrow>
                <IconButton onClick={handleOpenUserMenu} size="small" sx={{ p: 0 }}>
                  <Avatar
                    sx={{
                      width: 32,
                      height: 32,
                      bgcolor: 'primary.main',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                    }}
                  >
                    CP
                  </Avatar>
                </IconButton>
              </Tooltip>
            </Box>
          </header>
        )}

        <Outlet />
      </main>

      {/* User Context Menu */}
      <Menu
        anchorEl={userMenuAnchor}
        open={Boolean(userMenuAnchor)}
        onClose={handleCloseUserMenu}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <Box sx={{ px: 2, py: 1 }}>
          <Typography variant="body2" sx={{ fontWeight: 700, color: 'text.primary' }}>
            Camila Pereira
          </Typography>
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
            camila.pereira@suframa.gov.br
          </Typography>
        </Box>
        <Divider sx={{ my: 0.5 }} />
        <MenuItem onClick={handleCloseUserMenu}>
          <ListItemIcon sx={{ minWidth: 28, color: 'text.secondary' }}>
            <User size={15} />
          </ListItemIcon>
          <ListItemText primary="Meu Perfil" />
        </MenuItem>
        <MenuItem onClick={handleCloseUserMenu}>
          <ListItemIcon sx={{ minWidth: 28, color: 'text.secondary' }}>
            <Settings size={15} />
          </ListItemIcon>
          <ListItemText primary="Preferências do Painel" />
        </MenuItem>
        <Divider sx={{ my: 0.5 }} />
        <MenuItem onClick={handleCloseUserMenu} sx={{ color: 'error.main' }}>
          <ListItemIcon sx={{ minWidth: 28, color: 'error.main' }}>
            <LogOut size={15} />
          </ListItemIcon>
          <ListItemText primary="Sair da Conta" />
        </MenuItem>
      </Menu>
    </div>
  );
}
