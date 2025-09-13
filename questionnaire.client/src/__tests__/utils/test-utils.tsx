import React, { type ReactElement } from 'react'
import { render, type RenderOptions } from '@testing-library/react'
import { ThemeProvider } from '@mui/material/styles'
import { BrowserRouter } from 'react-router-dom'
import { GoogleOAuthProvider } from '@react-oauth/google'
import { buildLegacyTheme } from '../../theme'

// Mock Google Client ID for testing
const MOCK_GOOGLE_CLIENT_ID = 'mock-google-client-id'

const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  const theme = buildLegacyTheme()
  
  return (
    <GoogleOAuthProvider clientId={MOCK_GOOGLE_CLIENT_ID}>
      <BrowserRouter>
        <ThemeProvider theme={theme}>
          {children}
        </ThemeProvider>
      </BrowserRouter>
    </GoogleOAuthProvider>
  )
}

const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => render(ui, { wrapper: AllTheProviders, ...options })

export * from '@testing-library/react'
export { customRender as render }