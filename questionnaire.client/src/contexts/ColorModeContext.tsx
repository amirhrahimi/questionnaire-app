import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { createTheme, responsiveFontSizes, ThemeProvider } from '@mui/material/styles';
import type { Theme } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';

export type UserColorMode = 'light' | 'dark' | 'system';
interface ColorModeContextValue {
  mode: UserColorMode;
  resolvedMode: 'light' | 'dark';
  setMode: (m: UserColorMode) => void;
  toggle: () => void; // convenience flips light<->dark (ignores system)
  theme: Theme;
}

const ColorModeContext = createContext<ColorModeContextValue | undefined>(undefined);
const STORAGE_KEY = 'color-mode';

function resolveSystem(): 'light' | 'dark' {
  return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
}

function buildTheme(mode: 'light' | 'dark'): Theme {
  // Align MUI palette backgrounds with CSS variable tokens in index.css
  const lightBg = '#ffffff';
  // Legacy dark root token uses #242424 so we align default background to that
  const darkBg = '#242424';
  let theme = createTheme({
    palette: {
      mode,
    //   primary: { main: '#2563eb' },
    //   secondary: { main: mode === 'light' ? '#15803d' : '#16a34a' },
    //   success: { main: mode === 'light' ? '#16a34a' : '#22c55e' },
    //   warning: { main: mode === 'light' ? '#d97706' : '#f59e0b' },
    //   error: { main: mode === 'light' ? '#b91c1c' : '#dc2626' },
      background: mode === 'light'
        ? { default: lightBg, paper: lightBg }
        : { default: darkBg, paper: '#1e1e1e' },
    },
    shape: { borderRadius: 8 },
    typography: {
      fontFamily: 'Roboto, Arial, sans-serif',
      h1: {
        fontSize: 'clamp(2.2rem, 5vw, 3.2rem)',
        lineHeight: 1.1,
        fontWeight: 600,
      },
      button: { textTransform: 'none' },
    },
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          body: {
            backgroundColor: 'var(--color-bg)',
            color: 'var(--color-fg)',
          },
          a: { color: 'var(--color-link)' },
        },
      },
      MuiButton: {
        styleOverrides: {
          root: {
            textTransform: 'none',
            minHeight: 40,
            borderRadius: 'var(--radius-md)',
            fontWeight: 500,
          },
        },
      },
      MuiIconButton: {
        styleOverrides: { root: { minWidth: 44, minHeight: 44 } },
      },
      MuiTableContainer: {
        styleOverrides: { root: { overflowX: 'auto', WebkitOverflowScrolling: 'touch' } },
      },
    },
  });

  theme = responsiveFontSizes(theme);
  return theme;
}

export function ColorModeProvider({ children }: { children: ReactNode }) {
  const [mode, setModeState] = useState<UserColorMode>(() => {
    const stored = typeof window !== 'undefined' ? (localStorage.getItem(STORAGE_KEY) as UserColorMode | null) : null;
    return stored || 'system';
  });
  const [systemMode, setSystemMode] = useState<'light' | 'dark'>(typeof window !== 'undefined' ? resolveSystem() : 'light');

  useEffect(() => {
    if (!('matchMedia' in window)) return;
    const mq = window.matchMedia('(prefers-color-scheme: light)');
    const listener = () => setSystemMode(resolveSystem());
    mq.addEventListener('change', listener);
    return () => mq.removeEventListener('change', listener);
  }, []);

  const setMode = useCallback((m: UserColorMode) => {
    setModeState(m);
    localStorage.setItem(STORAGE_KEY, m);
  }, []);

  const resolvedMode: 'light' | 'dark' = mode === 'system' ? systemMode : mode;
  const theme = useMemo(() => buildTheme(resolvedMode), [resolvedMode]);

  useEffect(() => {
    // Apply attribute + update CSS variable group selection
    document.documentElement.setAttribute('data-color-mode', resolvedMode);
  }, [resolvedMode]);

  const toggle = useCallback(() => {
    setMode(mode === 'light' ? 'dark' : 'light');
  }, [mode, setMode]);

  const value: ColorModeContextValue = { mode, resolvedMode, setMode, toggle, theme };
  return (
    <ColorModeContext.Provider value={value}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </ColorModeContext.Provider>
  );
}

export function useColorMode() {
  const ctx = useContext(ColorModeContext);
  if (!ctx) throw new Error('useColorMode must be used within ColorModeProvider');
  return ctx;
}
