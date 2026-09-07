export const chartTheme = {
  primary: '#2563eb',
  secondary: '#7c3aed',
  success: '#16a34a',
  warning: '#d97706',
  danger: '#dc2626',
  text: '#102a43',
  muted: '#64748b',
  grid: '#e2e8f0',
  surface: '#ffffff',
} as const;

export const chartAxisTick = {
  fill: chartTheme.muted,
  fontSize: 10,
  fontFamily: 'DM Sans, system-ui, sans-serif',
} as const;
