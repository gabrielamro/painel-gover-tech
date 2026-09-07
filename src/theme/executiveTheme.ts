import { createTheme } from '@mui/material/styles';

export const executiveTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#2563eb',
      light: '#eff6ff',
      dark: '#1d4ed8',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#7c3aed',
      light: '#faf5ff',
      dark: '#6d28d9',
      contrastText: '#ffffff',
    },
    success: {
      main: '#16a34a',
      light: '#f0fdf4',
      dark: '#15803d',
      contrastText: '#ffffff',
    },
    warning: {
      main: '#d97706',
      light: '#fffbeb',
      dark: '#b45309',
      contrastText: '#ffffff',
    },
    error: {
      main: '#dc2626',
      light: '#fef2f2',
      dark: '#b91c1c',
      contrastText: '#ffffff',
    },
    info: {
      main: '#0d9488',
      light: '#f0fdfa',
      dark: '#0f766e',
      contrastText: '#ffffff',
    },
    background: {
      default: '#f7f9fc',
      paper: '#ffffff',
    },
    text: {
      primary: '#102a43',
      secondary: '#64748b',
      disabled: '#94a3b8',
    },
    divider: '#e2e8f0',
  },
  typography: {
    fontFamily: '"DM Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    h1: {
      fontFamily: '"Space Grotesk", sans-serif',
      fontWeight: 700,
      fontSize: '1.75rem',
      color: '#102a43',
      letterSpacing: '-0.02em',
    },
    h2: {
      fontFamily: '"Space Grotesk", sans-serif',
      fontWeight: 700,
      fontSize: '1.35rem',
      color: '#102a43',
      letterSpacing: '-0.01em',
    },
    h3: {
      fontFamily: '"Space Grotesk", sans-serif',
      fontWeight: 700,
      fontSize: '1.15rem',
      color: '#102a43',
    },
    h4: {
      fontFamily: '"Space Grotesk", sans-serif',
      fontWeight: 700,
      fontSize: '1rem',
      color: '#102a43',
    },
    subtitle1: {
      fontSize: '0.875rem',
      fontWeight: 500,
      color: '#64748b',
    },
    subtitle2: {
      fontSize: '0.75rem',
      fontWeight: 600,
      color: '#64748b',
      textTransform: 'uppercase',
      letterSpacing: '0.5px',
    },
    body1: {
      fontSize: '0.875rem',
      color: '#1e293b',
    },
    body2: {
      fontSize: '0.75rem',
      color: '#64748b',
    },
    button: {
      fontFamily: '"DM Sans", sans-serif',
      fontWeight: 600,
      textTransform: 'none',
    },
  },
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiButton: {
      defaultProps: {
        disableElevation: true,
      },
      styleOverrides: {
        root: {
          borderRadius: 8,
          fontWeight: 600,
          textTransform: 'none',
          padding: '6px 16px',
          fontSize: '0.8125rem',
          transition: 'all 0.15s ease-in-out',
        },
        contained: {
          background: '#2563eb',
          color: '#ffffff',
          '&:hover': {
            background: '#1d4ed8',
          },
        },
        outlined: {
          borderColor: '#d9e3ec',
          color: '#334155',
          '&:hover': {
            borderColor: '#2563eb',
            backgroundColor: '#f8fbfe',
          },
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: 14,
          boxShadow: '0 20px 40px rgba(15, 39, 64, 0.16)',
          border: '1px solid #e2e8f0',
        },
      },
    },
    MuiMenu: {
      styleOverrides: {
        paper: {
          borderRadius: 10,
          boxShadow: '0 10px 25px rgba(15, 39, 64, 0.12)',
          border: '1px solid #e2e8f0',
          padding: '4px',
        },
      },
    },
    MuiMenuItem: {
      styleOverrides: {
        root: {
          fontSize: '0.8125rem',
          fontWeight: 500,
          borderRadius: 6,
          padding: '6px 10px',
          color: '#334155',
          '&:hover': {
            backgroundColor: '#f1f5f9',
            color: '#0f172a',
          },
          '&.Mui-selected': {
            backgroundColor: '#eff6ff',
            color: '#1d4ed8',
            fontWeight: 600,
            '&:hover': {
              backgroundColor: '#dbeafe',
            },
          },
        },
      },
    },
    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          backgroundColor: '#102a43',
          color: '#ffffff',
          fontSize: '0.75rem',
          fontWeight: 500,
          borderRadius: 6,
          padding: '5px 9px',
          boxShadow: '0 4px 12px rgba(15, 39, 64, 0.2)',
        },
        arrow: {
          color: '#102a43',
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 999,
          fontWeight: 600,
          fontSize: '0.6875rem',
          height: 24,
        },
      },
    },
    MuiTextField: {
      defaultProps: {
        size: 'small',
      },
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 8,
            backgroundColor: '#f8fafc',
            '& fieldset': {
              borderColor: '#e2e8f0',
            },
            '&:hover fieldset': {
              borderColor: '#cbd5e1',
            },
            '&.Mui-focused': {
              backgroundColor: '#ffffff',
              '& fieldset': {
                borderColor: '#2563eb',
                borderWidth: '1.5px',
              },
            },
          },
        },
      },
    },
    MuiSelect: {
      defaultProps: {
        size: 'small',
      },
      styleOverrides: {
        root: {
          borderRadius: 8,
          backgroundColor: '#f8fafc',
          '& .MuiOutlinedInput-notchedOutline': {
            borderColor: '#e2e8f0',
          },
          '&:hover .MuiOutlinedInput-notchedOutline': {
            borderColor: '#cbd5e1',
          },
          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
            borderColor: '#2563eb',
            borderWidth: '1.5px',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
        },
      },
    },
  },
});
