import { Box } from '@mui/material';
import type { PropsWithChildren } from 'react';
import { Header } from './Header';
import { Footer } from './Footer';

export function Layout({ children }: PropsWithChildren) {
  return (
    <>
      <Header />
      <Box sx={{
        paddingTop: { xs: '44px', sm: '56px' }, // Match the header height exactly
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        width: '100%'
      }}>
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
    </>
  );
}
