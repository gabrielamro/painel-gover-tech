import { AppErrorBoundary } from './errors/AppErrorBoundary';
import { AppProviders } from './providers/AppProviders';
import { AppRouter } from './router/AppRouter';
import { ForecastMonthProvider } from '../features/forecast/ForecastMonthContext';
import '../styles.css';
import '../additional.css';
import '../foundation.css';
import '../design-system/tokens.css';
import '../design-system/components.css';
import '../components/layout/app-shell.css';
export function App() {
  return (
    <AppErrorBoundary>
      <AppProviders>
        <ForecastMonthProvider>
          <AppRouter />
        </ForecastMonthProvider>
      </AppProviders>
    </AppErrorBoundary>
  );
}
