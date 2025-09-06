// Deprecated static theme file retained for backward compatibility.
// Prefer using ColorModeProvider (buildTheme in ColorModeContext) going forward.
import { createTheme, responsiveFontSizes } from '@mui/material/styles';

export function buildLegacyTheme() {
  const theme = createTheme({
    palette: {
      mode: 'dark',
      primary: { main: '#2563eb' },
      secondary: { main: '#16a34a' },
      success: { main: '#22c55e' },
      warning: { main: '#f59e0b' },
      error: { main: '#dc2626' },
    },
    shape: { borderRadius: 8 },
    typography: {
      fontFamily: 'Roboto, Arial, sans-serif',
      h1: {
        fontSize: 'clamp(2.2rem, 5vw, 3.2rem)',
        lineHeight: 1.1,
        fontWeight: 600,
      },
    },
  });
  return responsiveFontSizes(theme);
}

export default buildLegacyTheme();
