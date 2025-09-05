import { Box } from '@mui/material';
import type { PropsWithChildren } from 'react';
import { Header } from './Header';
import { Footer } from './Footer';

export function Layout({ children }: PropsWithChildren) {
  return (
    <Box sx={{
      display: 'flex',
      flexDirection: 'column',
      minHeight: '100vh',
      width: '100%',
      overflow: 'hidden'
    }}>
      <Header />
      <Box sx={{
        flex: 1,
        width: '100%',
        overflow: 'auto',
        maxWidth: '100vw'
      }}>
        {children}
      </Box>
      <Footer />
    </Box>
  );
}
