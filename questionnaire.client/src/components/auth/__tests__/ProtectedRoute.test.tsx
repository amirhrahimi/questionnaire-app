import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import ProtectedRoute from '../ProtectedRoute'
import { useAuth } from '../../../hooks/useAuth'

// Mock the useAuth hook
vi.mock('../../../hooks/useAuth', () => ({
  useAuth: vi.fn(),
}))

// Mock LoginPage component
vi.mock('../../LoginPage', () => ({
  default: () => <div data-testid="login-page">Login Page</div>
}))

describe('ProtectedRoute', () => {
  const TestComponent = () => <div data-testid="protected-content">Protected Content</div>

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Authentication and Authorization', () => {
    it('should render protected content when user is authenticated and admin', () => {
      vi.mocked(useAuth).mockReturnValue({
        isAuthenticated: true,
        isAdmin: true,
        user: null,
        token: null,
        login: vi.fn(),
        logout: vi.fn(),
      })

      render(
        <ProtectedRoute>
          <TestComponent />
        </ProtectedRoute>
      )

      expect(screen.getByTestId('protected-content')).toBeInTheDocument()
      expect(screen.queryByTestId('login-page')).not.toBeInTheDocument()
    })

    it('should render login page when user is not authenticated', () => {
      vi.mocked(useAuth).mockReturnValue({
        isAuthenticated: false,
        isAdmin: false,
        user: null,
        token: null,
        login: vi.fn(),
        logout: vi.fn(),
      })

      render(
        <ProtectedRoute>
          <TestComponent />
        </ProtectedRoute>
      )

      expect(screen.getByText('Admin Login')).toBeInTheDocument()
      expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument()
    })

    it('should render login page when user is authenticated but not admin', () => {
      vi.mocked(useAuth).mockReturnValue({
        isAuthenticated: true,
        isAdmin: false,
        user: null,
        token: null,
        login: vi.fn(),
        logout: vi.fn(),
      })

      render(
        <ProtectedRoute>
          <TestComponent />
        </ProtectedRoute>
      )

      expect(screen.getByText('Admin Login')).toBeInTheDocument()
      expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument()
    })

    it('should render login page when user is not authenticated and not admin', () => {
      vi.mocked(useAuth).mockReturnValue({
        isAuthenticated: false,
        isAdmin: false,
        user: null,
        token: null,
        login: vi.fn(),
        logout: vi.fn(),
      })

      render(
        <ProtectedRoute>
          <TestComponent />
        </ProtectedRoute>
      )

      expect(screen.getByText('Admin Login')).toBeInTheDocument()
      expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument()
    })
  })

  describe('Children Rendering', () => {
    it('should render multiple children when authorized', () => {
      vi.mocked(useAuth).mockReturnValue({
        isAuthenticated: true,
        isAdmin: true,
        user: null,
        token: null,
        login: vi.fn(),
        logout: vi.fn(),
      })

      render(
        <ProtectedRoute>
          <div data-testid="child-1">Child 1</div>
          <div data-testid="child-2">Child 2</div>
        </ProtectedRoute>
      )

      expect(screen.getByTestId('child-1')).toBeInTheDocument()
      expect(screen.getByTestId('child-2')).toBeInTheDocument()
    })

    it('should render complex children when authorized', () => {
      vi.mocked(useAuth).mockReturnValue({
        isAuthenticated: true,
        isAdmin: true,
        user: null,
        token: null,
        login: vi.fn(),
        logout: vi.fn(),
      })

      const ComplexChild = () => (
        <div>
          <h1>Complex Component</h1>
          <p>With nested elements</p>
        </div>
      )

      render(
        <ProtectedRoute>
          <ComplexChild />
        </ProtectedRoute>
      )

      expect(screen.getByText('Complex Component')).toBeInTheDocument()
      expect(screen.getByText('With nested elements')).toBeInTheDocument()
    })
  })
})