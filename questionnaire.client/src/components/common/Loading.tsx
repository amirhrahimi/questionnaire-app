import { Box, CircularProgress, Typography, Fade, Stack } from '@mui/material';
import type { ReactNode } from 'react';

export interface LoadingProps {
  label?: string;
  inline?: boolean;
  size?: number;
  delayMs?: number; // simple mount delay to avoid flashes
  iconSlot?: ReactNode;
}

/**
 * Unified loading indicator.
 * - Respects theme spacing & colors
 * - Accessible (role + aria-live)
 */
export function Loading({ label = 'Loading…', inline = false, size = 32, delayMs = 120, iconSlot }: LoadingProps) {
  // Could add a mount delay hook if needed; lightweight now.
  return (
    <Fade in timeout={delayMs}>
      <Stack
        direction={inline ? 'row' : 'column'}
        spacing={1.5}
        alignItems="center"
        justifyContent="center"
        sx={{
          minHeight: inline ? 'unset' : '200px',
          textAlign: 'center',
          color: 'text.secondary',
          px: 2,
          py: inline ? 0 : 4,
        }}
        role="status"
        aria-live="polite"
      >
        <Box sx={{ position: 'relative', display: 'inline-flex' }}>
          {iconSlot ?? <CircularProgress size={size} thickness={4} />}
        </Box>
        <Typography variant="body2" sx={{ fontWeight: 500 }}>
          {label}
        </Typography>
      </Stack>
    </Fade>
  );
}

export default Loading;
