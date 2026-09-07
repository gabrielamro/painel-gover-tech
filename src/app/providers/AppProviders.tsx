import type { ReactNode } from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { executiveTheme } from '../../theme/executiveTheme';
import { SprintProvider } from './SprintProvider';

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider theme={executiveTheme}>
      <SprintProvider>{children}</SprintProvider>
    </ThemeProvider>
  );
}
