import { lazy, Suspense } from 'react';
import { HashRouter, Navigate, Route, Routes } from 'react-router-dom';
import { Box, Skeleton, Paper } from '@mui/material';
import { AppShell } from '../../components/layout/AppShell';

const DashboardPage = lazy(() =>
  import('../../features/dashboard/DashboardPage').then((m) => ({ default: m.DashboardPage }))
);
const PfForecastPage = lazy(() =>
  import('../../features/forecast/PfForecastPage').then((m) => ({ default: m.PfForecastPage }))
);
const RegistrationsPage = lazy(() =>
  import('../../features/registrations/RegistrationsPage').then((m) => ({ default: m.RegistrationsPage }))
);
const KanbanPage = lazy(() =>
  import('../../features/kanban/KanbanPage').then((m) => ({ default: m.KanbanPage }))
);
const DesignSystemPage = lazy(() =>
  import('../../features/design-system/DesignSystemPage').then((m) => ({ default: m.DesignSystemPage }))
);
const SuperintendencePage = lazy(() =>
  import('../../features/management/ManagementPage').then((m) => ({ default: m.ManagementPage }))
);
const UpdatePage = lazy(() =>
  import('../../features/updates/UpdatePage').then((m) => ({ default: m.UpdatePage }))
);
const LeaderProjectsPage = lazy(() =>
  import('../../features/leader/LeaderProjectsPage').then((m) => ({ default: m.LeaderProjectsPage }))
);
const ExecutivePerformancePage = lazy(() =>
  import('../../features/executive/ExecutivePerformancePage').then((m) => ({ default: m.ExecutivePerformancePage }))
);
const FactoryPerformancePage = lazy(() =>
  import('../../features/factory/FactoryPerformancePage').then((m) => ({ default: m.FactoryPerformancePage }))
);

const LoadingRoute = () => (
  <Box
    sx={{
      p: { xs: 2, sm: 3, md: 4 },
      display: 'flex',
      flexDirection: 'column',
      gap: 2.5,
      maxWidth: 1440,
      margin: '0 auto',
      width: '100%',
    }}
    aria-live="polite"
    aria-label="Carregando módulo..."
  >
    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <Box sx={{ width: '40%' }}>
        <Skeleton variant="text" width="30%" height={24} />
        <Skeleton variant="text" width="60%" height={36} />
      </Box>
      <Skeleton variant="rounded" width={140} height={38} sx={{ borderRadius: 2 }} />
    </Box>

    <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 2 }}>
      {[1, 2, 3, 4].map((i) => (
        <Paper
          key={i}
          elevation={0}
          sx={{ p: 2.5, borderRadius: 2.5, border: '1px solid #e2e8f0', bgcolor: '#ffffff' }}
        >
          <Skeleton variant="text" width="50%" height={18} />
          <Skeleton variant="text" width="70%" height={42} sx={{ my: 1 }} />
          <Skeleton variant="text" width="40%" height={16} />
        </Paper>
      ))}
    </Box>

    <Paper
      elevation={0}
      sx={{ p: 3, borderRadius: 3, border: '1px solid #e2e8f0', bgcolor: '#ffffff', minHeight: 320 }}
    >
      <Skeleton variant="text" width="25%" height={28} sx={{ mb: 2 }} />
      <Skeleton variant="rounded" height={220} sx={{ borderRadius: 2 }} />
    </Paper>
  </Box>
);

export function AppRouter() {
  return (
    <HashRouter>
      <Suspense fallback={<LoadingRoute />}>
        <Routes>
          <Route element={<AppShell />}>
            <Route index element={<Navigate to="/kanban" replace />} />
            <Route path="/kanban" element={<KanbanPage />} />
            <Route path="/factory" element={<FactoryPerformancePage />} />
            <Route path="/executive" element={<ExecutivePerformancePage />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/pf-forecast" element={<PfForecastPage />} />
            <Route path="/superintendencia" element={<SuperintendencePage />} />
            <Route path="/cadastros" element={<RegistrationsPage />} />
            <Route path="/leader" element={<LeaderProjectsPage />} />
            <Route path="/updates" element={<UpdatePage />} />
            <Route path="/design-system" element={<DesignSystemPage />} />
            <Route path="*" element={<Navigate to="/kanban" replace />} />
          </Route>
        </Routes>
      </Suspense>
    </HashRouter>
  );
}
